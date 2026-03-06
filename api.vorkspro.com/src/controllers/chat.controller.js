import ChatConversation from "../models/chatConversation.model.js";
import ChatMessage from "../models/chatMessage.model.js";
import User from "../models/user.model.js";
import { client as redis } from "../app.js";

// Helper: get tenant / org id from request (generic for SaaS / PaaS)
const getOrganizationId = (req) => {
  // In a multi-tenant setup this can come from req.user.orgId, a header, or subdomain.
  // For now we keep it optional so the chat module is generic.
  return req.user?.organizationId || null;
};

export const listConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orgId = getOrganizationId(req);

    const query = {
      participants: userId,
    };
    if (orgId) query.organizationId = orgId;

    const conversations = await ChatConversation.find(query)
      .sort({ updatedAt: -1 })
      .populate("participants", "firstName lastName email")
      .lean();

    res.json(conversations);
  } catch (err) {
    next(err);
  }
};

export const searchUsersForChat = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user._id;

    const filter = {
      _id: { $ne: userId },
      isActive: true,
    };

    if (q) {
      filter.$or = [
        { firstName: { $regex: q, $options: "i" } },
        { lastName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("firstName lastName email")
      .limit(20)
      .lean();

    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getOrCreateDirectConversation = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { targetUserId } = req.body;
    const orgId = getOrganizationId(req);

    if (!targetUserId) {
      return res.status(400).json({ message: "targetUserId is required" });
    }

    const participantIds = [userId, targetUserId];

    const baseQuery = {
      type: "direct",
      participants: { $all: participantIds, $size: 2 },
    };
    if (orgId) baseQuery.organizationId = orgId;

    let conversation = await ChatConversation.findOne(baseQuery);

    if (!conversation) {
      conversation = await ChatConversation.create({
        type: "direct",
        participants: participantIds,
        organizationId: orgId,
      });
    }

    const populated = await ChatConversation.findById(conversation._id)
      .populate("participants", "firstName lastName email")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

export const listMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
    const cursor = req.query.before; // ISO date string for pagination

    const query = { conversation: conversationId };
    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("sender", "firstName lastName email")
      .lean();

    res.json(messages.reverse());
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { body } = req.body;
    const userId = req.user._id;

    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Message body is required" });
    }

    const conversation = await ChatConversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.some((id) => String(id) === String(userId))) {
      return res.status(403).json({ message: "Not part of this conversation" });
    }

    const msg = await ChatMessage.create({
      conversation: conversationId,
      sender: userId,
      body: body.trim(),
    });

    // Update conversation summary
    conversation.lastMessageAt = new Date();
    conversation.lastMessagePreview = body.slice(0, 120);
    await conversation.save();

    // Emit Socket.IO event to conversation participants (for ticks and live updates)
    const io = req.app.locals.io;
    if (io) {
      const populatedMsg = await ChatMessage.findById(msg._id)
        .populate("sender", "firstName lastName email")
        .lean();

      io.to(`conversation_${conversationId}`).emit("chat:message", populatedMsg);
    }

    res.status(201).json(msg);
  } catch (err) {
    next(err);
  }
};

export const markConversationRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conv = await ChatConversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conv.participants.some((id) => String(id) === String(userId))) {
      return res.status(403).json({ message: "Not part of this conversation" });
    }

    await ChatMessage.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId },
        sender: { $ne: userId },
      },
      { $addToSet: { readBy: userId } }
    );

    const io = req.app.locals.io;
    if (io) {
      io.to(`conversation_${conversationId}`).emit("chat:read", {
        conversationId,
        userId,
      });
    }

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


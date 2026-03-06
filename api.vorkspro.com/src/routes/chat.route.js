import { Router } from "express";
import {
  listConversations,
  searchUsersForChat,
  getOrCreateDirectConversation,
  listMessages,
  sendMessage,
  markConversationRead,
} from "../controllers/chat.controller.js";

const router = Router();

// List current user's conversations
router.get("/conversations", listConversations);

// Search users in the organization to start a conversation
router.get("/users", searchUsersForChat);

// Create (or fetch) a direct 1:1 conversation
router.post("/conversations", getOrCreateDirectConversation);

// Messages in a conversation
router.get("/conversations/:conversationId/messages", listMessages);
router.post("/conversations/:conversationId/messages", sendMessage);

// Mark messages as read in a conversation
router.post("/conversations/:conversationId/read", markConversationRead);

export default router;


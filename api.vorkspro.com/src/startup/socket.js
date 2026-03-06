import http from "http";
import { Server as SocketIO } from "socket.io";
import logger from "../services/logger.js";

// In-memory presence map: userId -> number of active sockets
// For multi-instance deployments this can be moved to Redis.
const onlineUsers = new Map();

const markOnline = (io, userId) => {
  const count = onlineUsers.get(userId) || 0;
  onlineUsers.set(userId, count + 1);
  if (count === 0) {
    io.emit("presence:update", { userId, online: true });
  }
};

const markOffline = (io, userId) => {
  const count = onlineUsers.get(userId) || 0;
  if (count <= 1) {
    onlineUsers.delete(userId);
    io.emit("presence:update", { userId, online: false });
  } else {
    onlineUsers.set(userId, count - 1);
  }
};

const initializeSocket = (app) => {
  const server = http.createServer(app);
  const io = new SocketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.set("socketio", io);
  app.locals.io = io;

  logger.banner("Socket.IO initialized");

  io.on("connection", (socket) => {
    logger.info("Client connected", "Socket", { socketId: socket.id });
    socket.emit("server_welcome", "Yo from server 👋");

    let currentUserId = null;

    // Legacy join event – identify the user and join their personal room
    socket.on("join", (userId) => {
      if (userId) {
        currentUserId = String(userId);
        socket.join(`user_${currentUserId}`);
        markOnline(io, currentUserId);
        logger.debug("User joined room", "Socket", { userId: currentUserId, room: `user_${currentUserId}` });
      }
    });

    // Chat-specific: join a conversation room so messages can be broadcast
    socket.on("chat:joinConversation", (conversationId) => {
      if (!conversationId) return;
      socket.join(`conversation_${conversationId}`);
      logger.debug("Joined conversation room", "Socket", {
        socketId: socket.id,
        conversationId,
      });
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected", "Socket", { socketId: socket.id });
      if (currentUserId) {
        markOffline(io, currentUserId);
      }
    });
  });

  io.on("error", (err) => logger.error("Socket.IO error", "Socket", err));

  return { server, io };
};

export default initializeSocket;

import http from "http";
import { Server as SocketIO } from "socket.io";
import logger from "../services/logger.js";

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

    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        logger.debug("User joined room", "Socket", { userId, room: `user_${userId}` });
      }
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected", "Socket", { socketId: socket.id });
    });
  });

  io.on("error", (err) => logger.error("Socket.IO error", "Socket", err));

  return { server, io };
};

export default initializeSocket;

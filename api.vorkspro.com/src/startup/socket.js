import http from "http";
import { Server as SocketIO } from "socket.io";

const initializeSocket = (app) => {
  const server = http.createServer(app);
  const io = new SocketIO(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Attach socket instance to app for global access
  app.set("socketio", io);
  app.locals.io = io;

  console.log("════════════════════════════════════════════════════════════");
  console.log("Socket.IO initialized");

  io.on("connection", (socket) => {
    console.log(`✅ Socket connected: ${socket.id}`);
    socket.emit("server_welcome", "Yo from server 👋");

    // Join user-specific room
    socket.on("join", (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room user_${userId}`);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });


  io.on("error", (err) => console.error("Socket.IO error:", err));

  return { server, io };
};

export default initializeSocket;

import { app } from "../app.js"; // Import app to access Socket.IO instance

const clients = new Map(); // Track client subscriptions (optional, if needed)

export async function sendNotification(notificationType, message, data = {}) {
    const io = app.locals.io; // Access Socket.IO instance from app.locals

    if (!io) {
        console.warn("[sendNotification] ❌ Socket.IO not initialized, skipping notification");
        return;
    }

    const payload = {
        type: notificationType,
        message,
        data,
    };

    if (data.userId) {
        const room = `user_${data.userId}`;
        io.to(room).emit("receive_notification", payload);

        console.log(`[sendNotification] ✅ Notification sent to room: ${room}`);
        console.log(`[sendNotification] 📦 Payload:`, payload);
    } else {
        io.emit("receive_notification", payload);

        console.log(`[sendNotification] 📢 Broadcast notification to all users`);
        console.log(`[sendNotification] 📦 Payload:`, payload);
    }
}

export { clients };

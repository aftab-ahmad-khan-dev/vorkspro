import { Driver, Notification, Vendor } from "../startup/models.js";

/** @deprecated Notifications now use Nodemailer; kept for API compatibility. */
export const createOneSignalNotification = async () => {
    // No-op: push notifications removed in favor of email (Nodemailer)
};

export const createNotification = async (req, data) => {
    try {
        const io = req.app.locals.io;
        if (!io) {
            console.error("Socket.IO instance not found");
            // still record the notification(s) so nothing is lost
        }

        const {
            recipientType = "user",
            recipientId,
            recipientIds = [],
            ...rest
        } = data;

        let targets = [];
        if (recipientType === "all") {
            targets = ["all"];
        } else if (Array.isArray(recipientIds) && recipientIds.length) {
            targets = recipientIds.map(String);
        } else if (recipientId) {
            targets = [String(recipientId)];
        } else {
            throw new Error("No recipient specified");
        }

        const docsToInsert = targets.map(uid => ({
            ...rest,
            recipientType,
            recipientId: uid
        }));

        const notifications = await Notification.insertMany(docsToInsert);

        if (io) {
            io.to(targets).emit("newNotification", {
                notificationIds: notifications.map(n => n._id),
                type: rest.type,
                message: rest.message,
                recipientType,
                recipientIds: targets,
                isRead: false,
                createdAt: notifications[0].createdAt
            });

            console.log(`Notification emitted to rooms [${targets.join(", ")}]`);
        }

        return notifications; // ← array of created docs
    } catch (err) {
        console.error("Error creating notification:", err.message);
        throw err;
    }
};


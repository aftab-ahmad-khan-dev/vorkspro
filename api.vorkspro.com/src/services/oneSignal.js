import OneSignal from "onesignal-node";
import moment from "moment";
const oneSignalClient = new OneSignal.Client(
    process.env.ONESIGNAL_APP_ID,
    process.env.ONESIGNAL_API_KEY,
);

/**
 * Send notifications to user
 * @param {string} type - Notification type ('multiple' or 'all')
 * @param {string[]} userIds - Array of user IDs (for 'multiple' type)
 * @param {string} userType - Type of user ('user' or 'provider')
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} [dateTime] - Optional scheduled date/time for notification
 * @param {object} [data] - Additional data to include in notification
 */
async function sendNotificationsToOneSignalUser(
    type,
    userIds,
    title,
    message,
    dateTime,
    data
) {
    try {

        console.log(process.env.ONESIGNAL_APP_ID, " : process.env.ONESIGNAL_APP_ID");
        console.log(process.env.ONESIGNAL_API_KEY, " : process.env.ONESIGNAL_API_KEY");


        const dateNow = dateTime
            ? moment.utc(dateTime).format("YYYY-MM-DD HH:mm:ss")
            : moment.utc().format("YYYY-MM-DD HH:mm:ss");
        let notification = {
            contents: { en: message ?? "connect notification." },
            headings: { en: title ?? "connect" },
            data,
            small_icon: "connect_small_icon",
            large_icon: "connect_large_icon",
            android_accent_color: "4a148c",
            send_after: dateNow,
            priority: 10,
            // android_channel_id: "684d1f91-b2e1-4c60-b84f-90ca5b2fc0a2", // Urgent Channel ID
        };

        let oneSignalResponses = [];

        if (type === "multiple") {
            const promises = userIds.map(async (userId) => {
                notification.filters = [
                    { field: "tag", key: "userId", relation: "=", value: userId },
                ];
                const response = await oneSignalClient.createNotification(notification);
                return response.body;
            });
            oneSignalResponses = await Promise.all(promises);
        } else if (type === "all") {
            notification.included_segments = ["All"];
            const response = await oneSignalClient.createNotification(notification);
            oneSignalResponses.push(response.body);
        }
    } catch (e) {
        if (e instanceof OneSignal.HTTPError) {
            console.error(`OneSignal HTTP Error: ${e.statusCode}`, e.body);
        } else {
            console.error("Error sending notification:", e);
        }
    }
}

export {
    sendNotificationsToOneSignalUser,
};

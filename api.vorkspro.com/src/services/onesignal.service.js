import * as OneSignal from 'onesignal-node';
import moment from 'moment';
import { User } from '../startup/models.js';

const appId = process.env.ONESIGNAL_APP_ID;
const apiKey = process.env.ONESIGNAL_API_KEY;


const oneSignalClient = new OneSignal.Client(appId, apiKey);

/**
 * Send notifications via OneSignal
 * @param {Object} options
 * @param {'multiple'|'all'} options.type       - "multiple" or "all"
 * @param {Array<string>} [options.userIds]     - User IDs (for type === 'multiple')
 * @param {string} [options.userType]           - (Optional) userType tag
 * @param {string} options.title                - Notification title
 * @param {string} options.message              - Notification message
 * @param {Date|string} [options.dateTime]      - UTC time to send notification
 * @param {Object} [options.data]               - Extra payload data
 * @returns {Promise<Array<Object>>}            - Array of OneSignal responses
 */
export async function sendNotificationsToOneSignalUser({
    type,
    userIds = [],
    userType = '',
    title = '',
    message = '',
    dateTime = '',
    data = {},
}) {
    console.log("App ID :", appId, "API KEY : ", apiKey)
    console.log('🔔 [OneSignal] sendNotificationsToOneSignalUser called with:');
    console.log({
        type,
        userIds,
        userType,
        title,
        message,
        dateTime,
        data,
    });

    if (type !== 'multiple' && type !== 'all') {
        console.error(`❌ Invalid type "${type}". Must be "multiple" or "all".`);
        return [];
    }

    const dateNow = dateTime
        ? moment.utc(dateTime).format('YYYY-MM-DD HH:mm:ss')
        : moment.utc().format('YYYY-MM-DD HH:mm:ss');

    const baseNotification = {
        app_id: appId,
        contents: { en: message || 'Pro-Trade notification.' },
        headings: { en: title || 'Pro-Trade' },
        data,
        small_icon: 'Protrade_small_icon',
        large_icon: 'Protrade_large_icon',
        android_accent_color: '4a148c',
        send_after: dateNow,
    };

    let oneSignalResponses = [];

    if (type === 'multiple') {
        if (!Array.isArray(userIds) || userIds.length === 0) {
            console.warn('⚠️ No userIds provided for "multiple" type. Skipping send.');
            return [];
        }

        console.log(`📤 Sending notifications to ${userIds.length} user(s)...`);

        const promises = userIds.map(async (userId) => {
            const filters = [
                { field: 'tag', key: 'userId', relation: '=', value: userId },
                ...(userType ? [{ field: 'tag', key: 'type', relation: '=', value: userType }] : []),
            ];

            const userNotification = {
                ...baseNotification,
                filters,
            };

            console.log(`➡️ Sending to userId: ${userId} | Filters:`, filters);

            try {
                const response = await oneSignalClient.createNotification(userNotification);
                console.log(`✅ Sent to userId: ${userId}`);
                return response.body;
            } catch (err) {
                console.error(`❌ Failed to send to userId: ${userId}`, err);
                return { error: err.message, userId };
            }
        });

        oneSignalResponses = await Promise.all(promises);
    } else {
        console.log('📢 Sending notification to all users (included_segments: All)');

        const allNotification = {
            ...baseNotification,
            included_segments: ['All'],
        };

        try {
            const response = await oneSignalClient.createNotification(allNotification);
            console.log('✅ Notification sent to all users.');
            oneSignalResponses.push(response.body);
        } catch (err) {
            console.error('❌ Failed to send to all users', err);
            oneSignalResponses.push({ error: err.message });
        }
    }

    console.log('📦 OneSignal Responses:', oneSignalResponses);
    return oneSignalResponses;
}

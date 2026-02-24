import cron from "node-cron";
import axios from "axios";
import { Todo } from "../startup/models.js";
import { User } from "../startup/models.js";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("start cron job", now.toISOString());

    const allTodos = await Todo.find({}).populate("userId");
    console.log(`Total todos in DB: ${allTodos.length}`);

    const eligibleTodos = await Todo.find({
      dueDate: { $lte: now },
      isNotified: false
    }).populate("userId");
    console.log(`Todos with dueDate <= now and not notified: ${eligibleTodos.length}`);

    const todos = await Todo.find({
      isRemainderSet: true,
      dueDate: { $lte: now },
      isNotified: false
    }).populate("userId");

    console.log(`Found ${todos.length} todos to notify (testing without isRemainderSet)`);

    for (const todo of todos) {
      const playerId = todo.userId?.oneSignalPlayerId;
      console.log(`Processing todo: ${todo.title}, playerId: ${playerId}`);

      if (!playerId) {
        console.log(`No playerId for user: ${todo.userId?._id}`);
        continue;
      }

      try {
        const response = await axios.post(
          "https://onesignal.com/api/v1/notifications",
          {
            app_id: process.env.ONESIGNAL_APP_ID,
            include_player_ids: [playerId],
            headings: { en: "Todo Reminder ⏰" },
            contents: {
              en:
                `Title: ${todo.title}\n` +
                `Description: ${todo.description || ""}\n` +
                `Tags: ${todo.tags?.join(", ") || ""}`
            },
          },
          {
            headers: {
              Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log(`Notification sent successfully:`, response.data);

        if (response.data.errors?.invalid_player_ids?.length > 0) {
          console.log(`Invalid player ID detected: ${playerId}. User needs to refresh browser.`);
          continue;
        }

        todo.isNotified = true;
        await todo.save();
        console.log(`Todo marked as notified: ${todo.title}`);

      } catch (notificationError) {
        console.error(`Failed to send notification for todo ${todo.title}:`, notificationError.response?.data || notificationError.message);
      }
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});

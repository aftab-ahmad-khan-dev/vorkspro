import cron from "node-cron";
import { Todo } from "../startup/models.js";
import { transporter } from "../services/email.service.js";
import { sendNotification } from "../services/notify.service.js";

const isSmtpConfigured = () =>
  !!(process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD && process.env.FROM_EMAIL);

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    console.log("start cron job", now.toISOString());

    const todos = await Todo.find({
      isRemainderSet: true,
      dueDate: { $lte: now },
      isNotified: false
    }).populate("userId");

    console.log(`Found ${todos.length} todos to notify`);

    const useEmail = isSmtpConfigured();

    for (const todo of todos) {
      let notified = false;
      const userId = todo.userId?._id?.toString?.() || todo.userId?.toString?.();

      if (useEmail && todo.userId?.email) {
        try {
          const html = `
            <h2>Todo Reminder ⏰</h2>
            <p><strong>Title:</strong> ${todo.title}</p>
            <p><strong>Description:</strong> ${todo.description || "-"}</p>
            <p><strong>Tags:</strong> ${(todo.tags && todo.tags.length) ? todo.tags.join(", ") : "-"}</p>
          `;
          await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: todo.userId.email,
            subject: "Todo Reminder ⏰ – " + todo.title,
            html,
          });
          console.log(`Reminder email sent for todo: ${todo.title}`);
          notified = true;
        } catch (err) {
          console.warn(`Email failed for todo ${todo.title}:`, err.message);
        }
      }

      if (!notified && userId) {
        const body = `${todo.title}${todo.description ? " – " + todo.description.slice(0, 80) : ""}`;
        await sendNotification("todo-reminder", body, {
          userId,
          title: "Todo Reminder ⏰",
          tag: `todo-${todo._id}`,
          url: "/app/my-todo-list",
          todoId: todo._id?.toString?.(),
        });
        notified = true;
      }

      if (notified || (!useEmail && !userId)) {
        todo.isNotified = true;
        await todo.save();
      }
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});

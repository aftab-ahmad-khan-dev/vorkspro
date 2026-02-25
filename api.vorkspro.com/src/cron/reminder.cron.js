import cron from "node-cron";
import { Todo } from "../startup/models.js";
import { transporter } from "../services/email.service.js";

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

    for (const todo of todos) {
      const userEmail = todo.userId?.email;
      console.log(`Processing todo: ${todo.title}, userEmail: ${userEmail}`);

      if (!userEmail) {
        console.log(`No email for user: ${todo.userId?._id}`);
        continue;
      }

      try {
        const html = `
          <h2>Todo Reminder ⏰</h2>
          <p><strong>Title:</strong> ${todo.title}</p>
          <p><strong>Description:</strong> ${todo.description || "-"}</p>
          <p><strong>Tags:</strong> ${(todo.tags && todo.tags.length) ? todo.tags.join(", ") : "-"}</p>
        `;

        await transporter.sendMail({
          from: process.env.FROM_EMAIL,
          to: userEmail,
          subject: "Todo Reminder ⏰ – " + todo.title,
          html,
        });

        console.log(`Reminder email sent for todo: ${todo.title}`);
        todo.isNotified = true;
        await todo.save();
      } catch (err) {
        console.error(`Failed to send reminder email for todo ${todo.title}:`, err.message);
      }
    }
  } catch (error) {
    console.error("Cron job error:", error);
  }
});

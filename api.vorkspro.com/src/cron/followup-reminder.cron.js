import cron from "node-cron";
import { Followup } from "../startup/models.js";
import { sendNotification } from "../services/notify.service.js";

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();

    const followups = await Followup.find({
      type: "schedule-followup",
      isReminderSet: true,
      $or: [
        { remindAtUtc: { $lte: now }, reminderNotifiedAt: null },
        { remindAtUtc: null, date: { $lte: now }, reminderNotifiedAt: null },
      ],
    })
      .populate({ path: "client", select: "name" })
      .populate({ path: "assignTo", select: "firstName lastName user" });

    for (const f of followups) {
      const remindAt = f.remindAtUtc || f.date;
      if (new Date(remindAt).getTime() > now.getTime()) continue;

      const userId = (f.assignTo?.user && typeof f.assignTo.user === "object")
        ? f.assignTo.user._id
        : f.assignTo?.user;
      if (!userId) {
        f.reminderNotifiedAt = new Date();
        await f.save();
        continue;
      }

      const clientName = f.client?.name || "Client";
      const topic = f.topic || "Follow-up";
      let timeStr = "";
      if (f.time) {
        const [h, m] = f.time.split(":").map(Number);
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = h % 12 || 12;
        timeStr = ` at ${hour12}:${String(m || 0).padStart(2, "0")} ${ampm}`;
      }
      const body = `${topic} • ${clientName}${timeStr}${f.notes ? ` — ${f.notes}` : ""}`;

      await sendNotification("followup-reminder", body, {
        userId,
        title: "Follow-up Reminder",
        tag: `followup-${f._id}`,
        url: "/app/follow-up-hub",
        followupId: f._id.toString(),
        topic,
        client: clientName,
      });

      f.reminderNotifiedAt = new Date();
      await f.save();
    }
  } catch (err) {
    console.error("[followup-reminder] Cron error:", err);
  }
});

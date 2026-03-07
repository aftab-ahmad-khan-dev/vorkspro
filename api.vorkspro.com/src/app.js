import express from "express";
import cors from "cors";
import compression from "compression";
import routes from "./startup/routes.js";
import { apiKeyMiddleware } from "./middlewares/apiKey.middleware.js";
import { tokenChecker } from "./middlewares/token.middleware.js";
import { platformMiddleware } from "./middlewares/platform.middleware.js";
import { client } from "./database/redis.js";
// Skip cron in serverless (Vercel) — it only runs in long-lived processes
if (!process.env.VERCEL) {
  import("./cron/reminder.cron.js");
  import("./cron/followup-reminder.cron.js");
}

export { client };

const app = express();

app.use(compression());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.static("public"));
app.use(platformMiddleware); // web | mobile | desktop (X-Client-Platform)
app.use(apiKeyMiddleware);   // when API_KEY is set, require X-API-Key on /api requests (production)
app.use(tokenChecker);
(async () => {})();

//? routes
routes(app);

// routes declaration

export { app };

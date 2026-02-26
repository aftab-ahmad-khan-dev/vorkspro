import express from "express";
import cors from "cors";
import compression from "compression";
import routes from "./startup/routes.js";
import { tokenChecker } from "./middlewares/token.middleware.js";
import logger from "./services/logger.js";
// Skip cron in serverless (Vercel) — it only runs in long-lived processes
if (!process.env.VERCEL) import("./cron/reminder.cron.js");
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const noOpRedis = {
  get: async () => null,
  set: async () => {},
  del: async () => {},
};

let client = noOpRedis;

(async () => {
  try {
    const redisClient = createClient({
      url: redisUrl,
      socket: { connectTimeout: 3000 },
    });
    await Promise.race([
      redisClient.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis connect timeout")), 3000)),
    ]);
    client = redisClient;
    logger.banner("Redis connected");
  } catch (err) {
    logger.banner("Redis not available — running without cache");
    console.warn(`  → ${err.message}`);
  }
})();

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
app.use(tokenChecker);
(async () => {})();

//? routes
routes(app);

// routes declaration

export { app };

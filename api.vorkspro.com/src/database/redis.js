/**
 * Shared Redis client for cache and auth. Import here to avoid circular deps (e.g. token middleware).
 */
import { createClient } from "redis";
import logger from "../services/logger.js";

const redisUrl =
  process.env.REDIS_URL ||
  "redis-11312.c263.us-east-1-2.ec2.cloud.redislabs.com:11312";

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
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis connect timeout")), 3000)
      ),
    ]);
    client = redisClient;
    logger.banner("Redis connected");
  } catch (err) {
    logger.banner("Redis not available — running without cache");
    console.warn(`  → ${err.message}`);
  }
})();

export { client };

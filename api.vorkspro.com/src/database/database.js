import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { DB_NAME, TEST_DB_NAME, DEV_DB_NAME } from "../constants.js";
import logger from "../services/logger.js";

// Load .env from project root (works in local and Vercel when present)
try {
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
} catch (_) {}

function buildDbUri(dbName) {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (uri.includes("?")) {
    return uri.replace("?", `/${dbName}?`);
  }
  return `${uri.replace(/\/$/, "")}/${dbName}`;
}

const initializeDatabase = async () => {
  if (mongoose.connection.readyState === 1) return;

  try {
    // Vercel sets VERCEL=1; default MODE to production when on Vercel
    const mode = process.env.MODE || (process.env.VERCEL ? "production" : null);
    const dbName =
      mode === "development"
        ? DEV_DB_NAME
        : mode === "test"
          ? TEST_DB_NAME
          : mode === "production"
            ? DB_NAME
            : null;
    if (!dbName) {
      throw new Error("Set MODE (development | test | production). On Vercel it defaults to production.");
    }

    const DB_PATH = buildDbUri(dbName);
    if (!DB_PATH) {
      throw new Error("MONGODB_URI missing in .env");
    }

    logger.banner(`Connecting to MongoDB… (${dbName})`);
    await mongoose.connect(DB_PATH, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    const conn = mongoose.connection;
    logger.banner(`MongoDB connected — DB: ${conn.name || dbName}`);
  } catch (error) {
    logger.error("MongoDB connection failed", "DB", error.message);
    throw error;
  }
};

export default initializeDatabase;

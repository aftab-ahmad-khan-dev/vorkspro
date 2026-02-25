import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME, TEST_DB_NAME, DEV_DB_NAME } from "../constants.js";

dotenv.config({ path: "./.env" });

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
    const dbName =
      process.env.MODE == "development"
        ? DEV_DB_NAME
        : process.env.MODE == "test"
          ? TEST_DB_NAME
          : process.env.MODE == "production"
            ? DB_NAME
            : null;
    if (!dbName) {
      throw new Error("Set MODE in .env (development | test | production)");
    }

    const DB_PATH = buildDbUri(dbName);
    if (!DB_PATH) {
      throw new Error("MONGODB_URI missing in .env");
    }

    console.log("MongoDB connecting…", dbName);
    await mongoose.connect(DB_PATH, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });

    const conn = mongoose.connection;
    console.log(
      `MongoDB connected — DB: ${conn.name || dbName}`
    );
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default initializeDatabase;

import dotenv from "dotenv";
import mongoose from "mongoose";
import { DB_NAME, TEST_DB_NAME, DEV_DB_NAME } from "../constants.js";

// dotenv.config({ path: './.env' });   //? Live DB
dotenv.config({ path: "./.env.dev" }); //? Test DB

const initializeDatabase = async () => {
  try {
    console.log('DB Name', process.env.MODE)
    const DB_PATH =
      process.env.MODE == "development"
        ? `${process.env.MONGODB_URI}/${DEV_DB_NAME}`
        : process.env.MODE == "test"
          ? `${process.env.MONGODB_URI}/${TEST_DB_NAME}`
          : process.env.MODE == "production"
          ? `${process.env.MONGODB_URI}/${DB_NAME}` : null;
    console.log("DB_PATH: ", DB_PATH);
    const connectionInstance = await mongoose.connect(`${DB_PATH}`);
    console.log(
      `════════════════════════════════════════════════════════════ \nMongoDB connected...!! \nDB HOST: ${connectionInstance.connection.host}\nDB Name: ${connectionInstance.connection.name}\n════════════════════════════════════════════════════════════`
    );
  } catch (error) {
    console.log("MongoDB connection failed: ", error);
    process.exit(1);
  }
};

export default initializeDatabase;

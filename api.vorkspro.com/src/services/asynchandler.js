import mongoose from "mongoose";
import { generateErrorApiResponse } from "./utilities.service.js";

/**
 * Universal async handler with detailed Mongo/Mongoose error handling
 */
const asyncHandler = (fn) => async (req, res, next) => {
    try {
        return await fn(req, res, next);
    } catch (error) {
        console.error("❌ Error caught by asyncHandler:", error);

        let message = "An unexpected error occurred.";
        let statusCode = 500;

        // ==========================
        // 🔹 Mongo Duplicate Key Error
        // ==========================
        if (error?.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0];
            const value = error.keyValue?.[field];
            message = `A record with ${field} "${value}" already exists. Please use a different ${field}.`;
            statusCode = 409;
        }

        // ==========================
        // 🔹 Mongoose Validation Error
        // ==========================
        else if (error instanceof mongoose.Error.ValidationError) {
            const messages = Object.values(error.errors).map((err) => err.message);
            message = messages.join(", ");
            statusCode = 400;
        }

        // ==========================
        // 🔹 Cast Error (Invalid ObjectId)
        // ==========================
        else if (error instanceof mongoose.Error.CastError) {
            message = `Invalid ${error.path}: "${error.value}".`;
            statusCode = 400;
        }

        // ==========================
        // 🔹 Document Not Found (custom case)
        // ==========================
        else if (error.name === "DocumentNotFoundError") {
            message = "The requested record was not found.";
            statusCode = 404;
        }

        // ==========================
        // 🔹 StrictMode / Overwrite / Version Error
        // ==========================
        else if (
            error.name === "StrictModeError" ||
            error.name === "VersionError" ||
            error.name === "OverwriteModelError"
        ) {
            message = "A database consistency error occurred.";
            statusCode = 409;
        }

        // ==========================
        // 🔹 Mongo Network / Connection Errors
        // ==========================
        else if (error.name === "MongoNetworkError" || error.name === "MongooseServerSelectionError") {
            message = "Unable to connect to the database. Please try again later.";
            statusCode = 503;
        }

        // ==========================
        // 🔹 Timeout / Server Errors
        // ==========================
        else if (error.name === "MongoTimeoutError") {
            message = "Database request timed out. Please try again.";
            statusCode = 504;
        }

        // ==========================
        // 🔹 Any other Mongoose error types
        // ==========================
        else if (error instanceof mongoose.Error) {
            message = error.message || "A database error occurred.";
            statusCode = 500;
        }

        // ==========================
        // 🔹 General (non-Mongo) Errors
        // ==========================
        else if (error.message) {
            message = error.message;
        }

        // ==========================
        // 🔹 Send unified formatted response
        // ==========================
        return generateErrorApiResponse(res, {
            statusCode,
            message,
            error: process.env.NODE_ENV === "development" ? error : undefined,
        });
    }
};

export { asyncHandler };

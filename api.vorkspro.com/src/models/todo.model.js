import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const TodoSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User?.model || "User",
        required: true,
        index: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    isCompleted: { type: Boolean, default: false },
    // startDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    // dueTime: { type: String },
    isTimeSet: { type: Boolean, default: false },
    priority: {
        type: String,
        enum: ["low", "medium", "high"],
        default: "medium",
    },
    category: { type: String, enum: ["work", "personal", "meeting", "admin"] },
    tags: [{ type: String }],
    isNotified: { type: Boolean, default: false },
    isRemainderSet: { type: Boolean},
    isImportant: { type: Boolean, default: false },
}, { timestamps: true });

export const Todo = mongoose.model(ModelNames.Todo.model, TodoSchema);
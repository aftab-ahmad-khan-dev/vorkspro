import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const BugTypeSchema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        colorCode: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

BugTypeSchema.statics.getActiveBugTypes = function () {
    return this.find({ isActive: true });
};

export default mongoose.model(ModelNames.BugType.model, BugTypeSchema);

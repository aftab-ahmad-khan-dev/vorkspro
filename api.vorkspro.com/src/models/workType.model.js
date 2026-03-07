import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const WorkTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WorkTypeSchema.index({ isActive: 1 });
WorkTypeSchema.index({ name: 1 }, { unique: true });

export const WorkType = mongoose.model(ModelNames.WorkType.model, WorkTypeSchema);

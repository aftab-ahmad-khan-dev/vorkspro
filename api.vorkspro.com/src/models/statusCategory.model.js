import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const StatusCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subStatuses: [{ type: String, trim: true }],
    entityTypes: [{ type: String, enum: ["task", "milestone", "blockage"] }],
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StatusCategorySchema.index({ isActive: 1, sortOrder: 1 });

export const StatusCategory = mongoose.model(
  ModelNames.StatusCategory.model,
  StatusCategorySchema
);

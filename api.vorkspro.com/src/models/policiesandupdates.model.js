import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

export const PolicySchema = new Schema(
  {
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['hr policy', 'security', 'company rules', 'benefit'],
      default: 'hr policy',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    content: { type: String },
  },
  { timestamps: true } 
);

export const PolicyAndUpdates = mongoose.model(ModelNames.PolicyAndUpdates.model, PolicySchema);
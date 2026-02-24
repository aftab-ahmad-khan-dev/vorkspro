import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

export const DocumentSchema = new Schema(
  {
    documentName: { type: String, required: true },
    documentType: {
      type: String,
      enum: ['contract', 'proposal', 'policy document', 'report', 'other'],
      default: 'other',
    },
    fileUrl: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true } 
);

export const DocumentManager = mongoose.model(ModelNames.DocumentManager.model, DocumentSchema);
import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const IndustrySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    sector: { type: String }, // Optional broader category (e.g., "Technology", "Manufacturing")
    colorCode: { type: String }, // For dashboard color tags or chips
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

IndustrySchema.statics.getActiveDocuments = function () {
  return this.find({ isActive: true });
};

export default mongoose.model(ModelNames.Industry.model, IndustrySchema);

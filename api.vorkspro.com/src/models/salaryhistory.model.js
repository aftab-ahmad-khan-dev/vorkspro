import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const SalaryHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.User.model,
    },
    date: { type: Date },
    previousSalary: { type: Number },
    newSalary: { type: Number },
    incrementPercentage: { type: Number },
    reason: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model(
  ModelNames.SalaryHistory.model,
  SalaryHistorySchema
);

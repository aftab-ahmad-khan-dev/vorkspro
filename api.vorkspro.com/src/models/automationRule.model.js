import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const AutomationRuleSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    workType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.WorkType.model,
    },
    entityType: {
      type: String,
      enum: ["task", "blockage", "milestone"],
      required: true,
    },
    triggerStatus: {
      type: String,
      required: true,
      trim: true,
    },
    notifyAssignee: { type: Boolean, default: true },
    additionalNotify: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelNames.Employee.model,
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AutomationRuleSchema.index({ entityType: 1, triggerStatus: 1 });
AutomationRuleSchema.index({ workType: 1 });
AutomationRuleSchema.index({ isActive: 1 });

export const AutomationRule = mongoose.model(
  ModelNames.AutomationRule.model,
  AutomationRuleSchema
);

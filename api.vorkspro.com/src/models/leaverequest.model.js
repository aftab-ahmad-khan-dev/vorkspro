import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.Employee.model,
    },
    leaveType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.LeaveType.model,
    },
    days: {
      type: Number,
      default: 0,
    },
    holidayDate: { type: Date },
    holiday: { type: String },
    type: {
      type: String,
      enum: ["public-holiday", "company-holiday", "observance"],
    },
    startDate: { type: Date },
    endDate: { type: Date },
    reason: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "holidays", "events"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const LeaveRequest = mongoose.model(
  ModelNames.LeaveRequest.model,
  leaveRequestSchema
);

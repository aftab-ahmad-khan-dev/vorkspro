import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const LeaveTypeSchema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        daysAllowed: { type: Number },
        colorCode: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

LeaveTypeSchema.statics.getActiveLeaveTypes = function () {
    return this.find({ isActive: true });
};

export default mongoose.model(ModelNames.LeaveType.model, LeaveTypeSchema);

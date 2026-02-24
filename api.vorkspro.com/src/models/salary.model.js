import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const SalarySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.User.model,
        },
        salaryPaid: { type: Number },
        bonuses: { type: Number, default: 0 },
        overtime: { type: Number, default: 0 },
        deductions: { type: Number, default: 0 },
        totalSalary: { type: Number },
        date: { type: Date },
        notes: { type: String },
        paymentStatus: { type: String, enum: ["unpaid","paid"], default: "unpaid" },
    },
    { timestamps: true }
);

export default mongoose.model(ModelNames.Salary.model, SalarySchema);

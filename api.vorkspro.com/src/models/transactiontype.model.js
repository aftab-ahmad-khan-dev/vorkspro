import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const TransactionTypeSchema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        type: { type: String, enum: ["income", "expense"] },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

TransactionTypeSchema.statics.getActiveIncomeTypes = function () {
    return this.find({ isActive: true, type: 'income' });
};

TransactionTypeSchema.statics.getActiveExpenseTypes = function () {
    return this.find({ isActive: true, type: 'expense' });
};

export default mongoose.model(ModelNames.TransactionType.model, TransactionTypeSchema);

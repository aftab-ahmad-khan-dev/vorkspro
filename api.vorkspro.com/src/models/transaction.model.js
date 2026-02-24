import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const TransactionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["credit", "debit"],
        },
        description: { type: String },
        amount: { type: Number },
        date: { type: Date, default: Date.now },
        paymentMethod: { type: String, enum: ['cash', 'check', 'bank transfer', 'credit card'] },
        invoiceId: { type: String },
        notes: { type: String },
        transactionType: {
            type: String,
            enum: ['expense', 'income']
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.TransactionType.model,
        },
    },
    { timestamps: true }
);

export default mongoose.model(ModelNames.Transaction.model, TransactionSchema);

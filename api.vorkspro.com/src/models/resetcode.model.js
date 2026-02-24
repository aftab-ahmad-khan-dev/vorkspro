import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const ResetCodeSchema = new mongoose.Schema({
    code: { type: String },
    email: { type: String },
    phone: { type: String },
    expireAt: {
        type: Date,
    },
}, { timestamps: true });

ResetCodeSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model(ModelNames.ResetCode.model, ResetCodeSchema);
// models/AppConfig.js
import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const appConfigSchema = new mongoose.Schema(
    {
        usdToPkrRate: {
            type: Number,
            required: true,
        },
        lastUpdated: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export const Config = mongoose.model(ModelNames.Config.model, appConfigSchema);

import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const BlockageSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String
        },
        impact: {
            type: String
        },
        notes: {
            type: String
        },

        project: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Project.model,
            required: true
        },

        milestone: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Milestone.model
        },

        type: {
            type: String,
            enum: [
                "internal",
                "external/thirdparty",
                "technical issue",
                "clientside"
            ],
            required: true
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium"
        },

        status: {
            type: String,
            enum: ["in-progress", "resolved", "closed"],
            default: "in-progress"
        },

        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Employee.model
        },

        blockedBy: {
            type: String
        },
        resolvedDate: {
            type: Date
        }

    },
    {
        timestamps: true
    }
);

export const Blockage = mongoose.model(
    ModelNames.Blockage.model,
    BlockageSchema
);

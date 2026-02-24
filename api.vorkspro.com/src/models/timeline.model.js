import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const TimelineSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Project.model,
        },
        key: {
            type: String,
            enum: [
                'Project add',
                'Project updated',
                'Project deleted',
                'Project status changed',
                'Milestone Added',
                "Task Added",
                "Milestone status changed",
                "Milestone index changed",
                "Task status changed",
                "Task updated",
                "Milestone updated",
                "Milestone deleted",
                "Blockage Add",
                "Blockage Update",
                "Blockage Resolved",
                "Credential Add",
                "Credential Update",
                "Credential Delete",
                "Team Add",
                "Document Add",
            ],
        },
        value: {
            type: String,
        },
        date: { type: Date },
        time: { type: String },
        // note: { type: String },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.User.model,
        },
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Employee.model,
        },
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
        },
    },
    { timestamps: true }
);

export const Timeline = mongoose.model(ModelNames.Timeline.model, TimelineSchema);
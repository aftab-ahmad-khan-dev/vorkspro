import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const EmployeeSchema = new mongoose.Schema({
    client: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Client.model,
    },
    communicationType: {
        type: String,
        enum: ['phone-call', 'email', 'video-meeting', 'whatsapp', 'in-person'],
        default: 'phone-call'
    },
    topic: {
        type: String,
    },
    status: {
        type: String,
        enum: ['due-today', 'upcoming', 'over-due', 'completed'],
        default: 'upcoming'
    },
    assignTo: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.Employee.model
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    date: {
        type: Date,
        default: Date.now
    },
    time: {
        type: String,
    },
    outcome: {
        type: String,
        enum: ['positive', 'negative', 'neutral', 'followup-required'],
        default: 'positive'
    },
    notes: {
        type: String
    },
    isReminderSet: {
        type: Boolean,
        default: false
    },
    type: {
        type: String,
        enum: ['schedule-followup', 'communication-history', 'my-followup'],
    }
}, { timestamps: true })

export const Followup = mongoose.model(ModelNames.Followup.model, EmployeeSchema);
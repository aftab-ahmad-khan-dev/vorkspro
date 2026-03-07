import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const TaskSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Project.model,
        },
        milestone: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Milestone.model
        },
        title: { type: String, },
        description: { type: String },
        assignedTo: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.User.model
        }],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.User.model
        },
        startDate: { type: Date },
        dueDate: { type: Date },
        completedDate: { type: Date },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        status: {
            type: String,
            enum: [
                'to do', 'in progress', 'in review', 'completed', 'on hold', 'cancelled',
                'not started', 'waiting for client', 'working', 'testing',
                'delivered', 'deployed', 'client requirement',
                'need to start', 'need design', 'need deployment'
            ],
            default: 'to do'
        },
        estimatedHours: { type: Number },
        loggedHours: { type: Number, default: 0 },
        attachments: [{
            name: { type: String },
            url: { type: String }
        }],
        comments: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.User.model },
            message: { type: String },
            createdAt: { type: Date, default: Date.now }
        }],
        tags: [{ type: String }],
        workType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.WorkType.model,
        },
        // dependencies: [{
        //     type: mongoose.Schema.Types.ObjectId,
        //     ref: ModelNames.Task.model
        // }],
    },
    { timestamps: true }
);

export default mongoose.model(ModelNames.Task.model, TaskSchema);

import mongoose from 'mongoose'

import { ModelNames } from '../constants.js'

// comment model schema
const CommentSchema = new mongoose.Schema({
    comment: { type: String },
    commentBy: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.Employee.model },
}, { timestamps: true })

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.Department.model },
    subDepartment: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.SubDepartment.model },
    priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    isPinned: { type: Boolean, default: false },
    sendNotifications: { type: Boolean, default: false },
    markAsRead: {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Employee.model,
        },
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.User.model },
    comments: [CommentSchema],
}, { timestamps: true })

export default mongoose.model(ModelNames.Announcement.model, AnnouncementSchema)
import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const knowledgeSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
    },
    departments: [{
        type: Schema.Types.ObjectId,
        ref: ModelNames.Department.model
    }],
    fileUrl: {
        type: String,
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: ModelNames.DocumentType.model
    },
    author: {
        type: String
    },
    version: {
        type: Number,
        default: 1
    },
    tags: [
        { type: String }
    ]
}, { timestamps: true });

export const Knowledge = mongoose.model(ModelNames.Knowledge.model, knowledgeSchema);
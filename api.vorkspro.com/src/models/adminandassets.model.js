import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const AdminAndAssetsSchema = new mongoose.Schema(
    {
        assetName: {
            type: String
        },
        assetType: {
            type: String,
            enum: ['mobile devices', 'software license', 'hardware', 'accessory']
        },
        serialNumber: {
            type: String
        },
        status: {
            type: String,
            enum: ['available', 'active', 'assigned', 'unassigned'],
            default: 'available'
        },
        value: {
            type: Number
        },
        purchaseDate: {
            type: Date
        },
        warrantyUntil: {
            type: Date
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Employee.model
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: ModelNames.Department.model
        },
        notes: {
            type: String
        },
        // documents: [
        //     {
        //         documentName: {
        //             type: String
        //         },
        //         documentType: {
        //             type: String,
        //             enum: ['contract', 'proposal', 'policy document', 'report', 'other']
        //         },
        //         fileUrl: {
        //             type: String
        //         },
        //         description: {
        //             type: String
        //         }
        //     }
        // ],
        // policies: [
        //     {
        //         title: {
        //             type: String
        //         },
        //         category: {
        //             type: String,
        //             enum: ['hr policy', 'security', 'company rules', 'benefit']
        //         },
        //         priority: {
        //             type: String,
        //             enum: ['high', 'medium', 'low']
        //         },
        //         content: {
        //             type: String
        //         },
        //     }
        // ]
    },
    { timestamps: true }
)

export const AdminAndAssets = mongoose.model(ModelNames.AdminAndAssets.model, AdminAndAssetsSchema);
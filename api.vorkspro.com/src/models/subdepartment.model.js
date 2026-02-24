import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const SubDepartmentSchema = new mongoose.Schema(
    {
        name: { type: String },
        description: { type: String },
        employees: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.User.model,
        }],
        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: ModelNames.Department.model,
        },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model(ModelNames.SubDepartment.model, SubDepartmentSchema);

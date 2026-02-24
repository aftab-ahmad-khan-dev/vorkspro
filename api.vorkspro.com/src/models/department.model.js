import mongoose from "mongoose";
import { ModelNames } from "../constants.js";

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String },
    description: { type: String },
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelNames.User.model,
      },
    ],
    subDepartments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelNames.SubDepartment.model,
      },
    ],
    head: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.User.model,
    },
    isActive: { type: Boolean, default: true },
    colorCode: { type: String },
  },
  { timestamps: true }
);

DepartmentSchema.statics.getActiveDepartments = function () {
  return this.find({ isActive: true });
};

export default mongoose.model(ModelNames.Department.model, DepartmentSchema);

import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";
import { Employee } from "../startup/models.js";

const AchievementSchema = new Schema(
  {
    employee: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Employee.model,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true, // Example: "Employee of the Month"
    },
    description: {
      type: String,
      trim: true, // Optional details
    },
    category: {
      type: String,
      enum: [
        "performance",
        "innovation",
        "quality",
        "attendance",
        "leadership",
        "custom",
      ],
      default: "custom",
    },
    awardedDate: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      enum: ["Monthly", "Quarterly", "Annual", "Custom"],
      default: "Custom",
    },
    issuedBy: {
      type: String, // Optional - manager/admin name who awarded
    },
    badgeColor: {
      type: String, // For UI representation (optional)
      default: "#FFD700", // gold
    },
  },
  { timestamps: true }
);

AchievementSchema.pre("save", async function (next) {
  if (this.isNew && this.employee) {
    const findEmployee = await Employee.findById(this.employee);
    if (!findEmployee) {
      return next(new Error("Employee not found"));
    }
    findEmployee.achievements.push(this._id);
    await findEmployee.save();
  }
  next();
});

export default mongoose.model(ModelNames.Achievement.model, AchievementSchema);

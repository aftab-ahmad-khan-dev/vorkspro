import mongoose from "mongoose";
import { ModelNames } from "../constants.js";
import { Client, Project } from "../startup/models.js";

const MilestoneSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.Project.model,
    },
    name: { type: String },
    description: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed", "delayed"],
      default: "not started",
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelNames.Task.model,
      },
    ],
    // dependencies: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: ModelNames.Milestone.model,
    //   },
    // ],
    budget: { type: Number },
    cost: { type: Number },
    notes: { type: String },
    sortIndex: { type: Number, default: 0 }
  },
  { timestamps: true }
);

MilestoneSchema.post("save", async function (doc) {
  try {
    if (!doc.project) return;

    // 1️⃣ Get all milestones for this project
    const milestones = await doc.constructor.find({ project: doc.project });
    const totalBudget = milestones.reduce((sum, m) => sum + (m.cost || 0), 0);

    // 2️⃣ Update project budget
    const project = await Project.findByIdAndUpdate(
      doc.project,
      { $set: { cost: totalBudget } },
      { new: true }
    ).populate("client");

    // 3️⃣ Update client revenue (sum of all budgets of this client's projects)
    if (project?.client) {
      const clientId = project.client._id;

      const totalRevenue = await Project.aggregate([
        { $match: { client: clientId } },
        { $group: { _id: "$client", total: { $sum: "$cost" } } },
      ]);

      const revenue = totalRevenue.length ? totalRevenue[0].total : 0;

      await Client.findByIdAndUpdate(clientId, { $set: { revenue } });
    }
  } catch (error) {
    console.error("Error updating cost and revenue:", error);
  }
});
MilestoneSchema.pre("save", async function (next) {
  try {
    // Run only when creating a new milestone
    if (!this.isNew) return next();
    if (!this.project) return next();

    // Find last milestone of this project with highest sortIndex
    const lastMilestone = await this.constructor
      .findOne({ project: this.project })
      .sort({ sortIndex: -1 })
      .select("sortIndex")
      .lean();

    this.sortIndex = lastMilestone?.sortIndex
      ? lastMilestone.sortIndex + 1
      : 1;

    next();
  } catch (error) {
    next(error);
  }
});
export default mongoose.model(ModelNames.Milestone.model, MilestoneSchema);

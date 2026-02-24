import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";
import { Client, Milestone } from "../startup/models.js";

const ProjectSchema = new Schema(
  {
    name: { type: String, trim: true, unique: true, required: true },
    description: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    status: {
      type: String,
      enum: ["not started", "in progress", "completed", "on hold", "cancelled"],
      default: "not started",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    credentials: [
      {
        name: { type: String },
        environment: { type: String },
        keyType: { type: String },
        description: { type: String },
        keyValue: { type: String },
        tags: [{ type: String }],
      },
    ],
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Employee.model,
    },
    teamMembers: [
      { type: Schema.Types.ObjectId, ref: ModelNames.Employee.model },
    ],
    budget: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    client: { type: Schema.Types.ObjectId, ref: ModelNames.Client.model },
    tasks: [{ type: Schema.Types.ObjectId, ref: ModelNames.Task.model }],
    milestones: [
      { type: Schema.Types.ObjectId, ref: ModelNames.Milestone.model },
    ],
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],
    blockages: [
      { type: Schema.Types.ObjectId, ref: ModelNames.Blockage.model },
    ],
    tags: [{ type: String }],
    progress: { type: Number, default: 0 }, // percentage 0–100
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/**
 * ────────────────────────────────────────────────
 * Helper: Recalculate client revenue
 * ────────────────────────────────────────────────
 */
async function updateClientRevenue(clientId) {
  if (!clientId) return;

  const [result] = await mongoose
    .model(ModelNames.Project.model)
    .aggregate([
      { $match: { client: clientId } },
      { $group: { _id: "$client", total: { $sum: "$cost" } } },
    ]);

  const revenue = result?.total || 0;
  await Client.findByIdAndUpdate(clientId, { $set: { revenue } });
}

/**
 * ────────────────────────────────────────────────
 * Helper: Recalculate project progress
 * ────────────────────────────────────────────────
 */
async function updateProjectProgress(projectId) {
  const milestones = await Milestone.find({ project: projectId });
  if (!milestones.length) return;

  const completed = milestones.filter((m) => m.status === "completed").length;
  const progress = (completed / milestones.length) * 100;

  await mongoose
    .model(ModelNames.Project.model)
    .findByIdAndUpdate(projectId, { progress });
}

/**
 * ────────────────────────────────────────────────
 * Post Save Hook
 * - Recalculate progress and client revenue
 * ────────────────────────────────────────────────
 */
// ProjectSchema.post("save", async function (doc, next) {
//   try {
//     if (doc?._id) await updateProjectProgress(doc._id);
//     if (doc?.client) await updateClientRevenue(doc.client);
//     next();
//   } catch (error) {
//     console.error("Error after save:", error);
//     next(error);
//   }
// });

/**
 * ────────────────────────────────────────────────
 * Post Update Hook
 * - Recalculate client revenue when updated
 * ────────────────────────────────────────────────
 */
ProjectSchema.post("findOneAndUpdate", async function (doc, next) {
  try {
    if (!doc) return next();
    if (doc.client) await updateClientRevenue(doc.client);

    // If client changed, update the old client as well
    const oldDoc = await this.model.findOne(this.getQuery()).lean();
    if (oldDoc?.client && oldDoc.client.toString() !== doc.client.toString()) {
      await updateClientRevenue(oldDoc.client);
    }

    next();
  } catch (error) {
    console.error("Error after update:", error);
    next(error);
  }
});

/**
 * ────────────────────────────────────────────────
 * Post Delete Hook
 * - Recalculate client revenue when deleted
 * ────────────────────────────────────────────────
 */
ProjectSchema.post("findOneAndDelete", async function (doc, next) {
  try {
    if (doc?.client) await updateClientRevenue(doc.client);
    next();
  } catch (error) {
    console.error("Error after delete:", error);
    next(error);
  }
});

export default mongoose.model(ModelNames.Project.model, ProjectSchema);

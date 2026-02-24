import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const ClientSchema = new Schema(
  {
    // Basic Info
    name: { type: String, unique: true }, // Full name or company name
    type: { type: String, enum: ["individual", "company"], default: "company" },
    industry: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.Industry.model,
    },
    companySize: {
      type: String,
      enum: ["0", "1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"],
    },

    website: { type: String },
    description: { type: String },

    contactName: { type: String },
    email: { type: String },
    phone: { type: String },

    // Address / Location
    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },

    // Projects linked with this client
    projects: [{ type: Schema.Types.ObjectId, ref: ModelNames.Project.model }],

    // Files or documents related to client
    documents: [
      {
        name: { type: String },
        url: { type: String },
      },
    ],

    // Additional info
    tags: [{ type: String }],
    notes: { type: String },
    status: {
      type: String,
      enum: ["lead", "active", "paused", "inactive"],
      default: "active",
    },

    revenue: { type: Number, default: 0 }, // total revenue from all projects
  },
  { timestamps: true }
);

export default mongoose.model(ModelNames.Client.model, ClientSchema);

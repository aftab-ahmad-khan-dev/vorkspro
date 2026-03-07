import mongoose from "mongoose";

/**
 * Registration draft (registry DB). Saves onboarding form so user can resume. Deleted after org is created.
 */
const RegistrationDraftSchema = new mongoose.Schema(
  {
    orgName: { type: String, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    adminEmail: { type: String, trim: true, lowercase: true },
    adminPassword: { type: String },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    planId: { type: String, trim: true },
    completedAt: { type: Date },
    // Company info (shown in Settings > Company Info after signup)
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
  },
  { timestamps: true }
);

RegistrationDraftSchema.index({ adminEmail: 1 }, { sparse: true });

export default RegistrationDraftSchema;

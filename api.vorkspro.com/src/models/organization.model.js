import mongoose from "mongoose";

/**
 * Organization (registry only). Each org has its own MongoDB database (dbName).
 * Used with registry connection only — not in startup/models.js.
 */
const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    dbName: { type: String, required: true, unique: true, trim: true },
    adminEmail: { type: String, required: true, trim: true, lowercase: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    // Company info (Settings > Company Info)
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
  },
  { timestamps: true }
);

OrganizationSchema.index({ slug: 1 });
OrganizationSchema.index({ dbName: 1 });

export const OrganizationSchemaExport = OrganizationSchema;
export default OrganizationSchema;

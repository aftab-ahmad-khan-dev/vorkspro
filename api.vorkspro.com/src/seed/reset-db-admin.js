/**
 * Drop the entire database and create only one admin user.
 * Email: admin@VorksPro.com
 * Password: password (hashed with bcrypt via User model pre-save)
 *
 * Run: node -r dotenv/config src/seed/reset-db-admin.js
 * Or:  npm run reset:db
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { DEV_DB_NAME, DB_NAME } from "../constants.js";
import Role from "../models/role.model.js";
import User from "../models/user.model.js";
import Employee from "../models/employee.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const ADMIN_EMAIL = "admin@vorkspro.com";
const ADMIN_PASSWORD = "password";

function buildDbUri(dbName) {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (uri.includes("?")) return uri.replace("?", `/${dbName}?`);
  return `${uri.replace(/\/$/, "")}/${dbName}`;
}

async function resetDbAndSeedAdmin() {
  try {
    const dbName = process.env.MODE === "production" ? DB_NAME : DEV_DB_NAME;
    const dbPath = buildDbUri(dbName);
    if (!dbPath) {
      console.error("❌ MONGODB_URI or MODE missing. Set .env (MODE, MONGODB_URI).");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(dbPath, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log("✅ MongoDB connected\n");

    console.log("🗑️  Dropping database...");
    await mongoose.connection.dropDatabase();
    console.log("✅ Database dropped\n");

    // Create Admin role from roles.json (full-access Admin)
    const rolesPath = path.join(__dirname, "exports", "roles.json");
    const rolesJson = await fs.readFile(rolesPath, "utf-8");
    const roles = JSON.parse(rolesJson);
    const adminRoleDoc = roles.find((r) => r.name === "Admin");
    if (!adminRoleDoc) {
      throw new Error("Admin role not found in roles.json");
    }
    const adminRole = await Role.create(adminRoleDoc);
    console.log("✅ Admin role created\n");

    // Create admin user (password will be hashed by User model pre-save)
    const adminUser = await User.create({
      firstName: "Super",
      lastName: "Admin",
      username: ADMIN_EMAIL.split("@")[0],
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isSuperAdmin: true,
      isActive: true,
      role: adminRole._id,
    });
    console.log("✅ Admin user created:", ADMIN_EMAIL, "(password is bcrypt-hashed)\n");

    // Minimal Employee profile so app (e.g. Profile page) doesn't break
    await Employee.create({
      user: adminUser._id,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      email: adminUser.email,
      phone: adminUser.phone || "",
      companyEmail: adminUser.email,
      status: "active",
      jobTitle: "Super Admin",
      employmentType: "full time",
      workLocation: "hybrid",
      isDeleted: false,
    });
    console.log("✅ Employee profile created for admin\n");

    console.log("🎉 Done. Login with:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

resetDbAndSeedAdmin();

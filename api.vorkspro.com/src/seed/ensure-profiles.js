/**
 * Ensures every User has an Employee profile (fixes Profile page not loading).
 * Run: node -r dotenv/config src/seed/ensure-profiles.js
 * Or: npm run seed:profiles (add script to package.json)
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { DEV_DB_NAME, DB_NAME } from "../constants.js";
import { User, Employee, Role } from "../startup/models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(path.dirname(__dirname), ".env") });

async function ensureEmployeeProfiles() {
  const usersWithoutEmployee = await User.aggregate([
    { $lookup: { from: "employees", localField: "_id", foreignField: "user", as: "emp" } },
    { $match: { "emp.0": { $exists: false } } },
    { $project: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1, isSuperAdmin: 1, role: 1 } },
  ]);

  if (usersWithoutEmployee.length === 0) {
    console.log("✓ All Users already have Employee profiles.");
    return;
  }

  const roles = await Role.find({}).lean();
  const roleMap = new Map(roles.map((r) => [r._id.toString(), r.name]));

  for (const u of usersWithoutEmployee) {
    const roleName = roleMap.get(u.role?.toString()) || "Employee";
    const jobTitle = u.isSuperAdmin ? "Super Admin" : roleName;
    await Employee.create({
      user: u._id,
      firstName: u.firstName || "User",
      lastName: u.lastName || "",
      email: u.email || "",
      phone: u.phone || "",
      companyEmail: u.email || "",
      status: "active",
      jobTitle,
      employmentType: "full time",
      workLocation: "hybrid",
      isDeleted: false,
    });
    console.log(`✓ Created Employee profile: ${u.email} (${jobTitle})`);
  }
  console.log(`\nDone. Created ${usersWithoutEmployee.length} Employee profile(s).`);
}

async function run() {
  try {
    const dbName = process.env.MODE === "production" ? DB_NAME : DEV_DB_NAME;
    const uri = process.env.MONGODB_URI?.trim();
    if (!uri) {
      console.error("❌ MONGODB_URI not set in .env");
      process.exit(1);
    }
    const dbPath = uri.includes("?") ? uri.replace("?", `/${dbName}?`) : `${uri.replace(/\/$/, "")}/${dbName}`;

    await mongoose.connect(dbPath, { serverSelectionTimeoutMS: 10000 });
    console.log("Connected to MongoDB\n");

    await ensureEmployeeProfiles();
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

run();

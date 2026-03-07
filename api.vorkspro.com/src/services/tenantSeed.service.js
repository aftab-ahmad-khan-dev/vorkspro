import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Seeds a tenant DB connection with Admin role + one admin user + Employee profile.
 * @param {mongoose.Connection} conn - Tenant connection (from getTenantConnection(dbName))
 * @param {{ email: string, password: string, firstName: string, lastName: string }} admin
 */
export async function seedTenantDb(conn, admin) {
  const Role = conn.model("Role");
  const User = conn.model("User");
  const Employee = conn.model("Employee");

  const rolesPath = path.join(__dirname, "../seed/exports/roles.json");
  const rolesJson = await fs.readFile(rolesPath, "utf-8");
  const rolesFromFile = JSON.parse(rolesJson);
  if (!rolesFromFile.length) throw new Error("No roles in roles.json");

  // Seed all template roles (Admin, HR Manager, Finance Officer, Project Manager, Employee) so they appear in Create Employee dropdown; admin can still add custom roles later
  const createdRoles = await Role.insertMany(rolesFromFile);
  const adminRole = createdRoles.find((r) => r.name === "Admin");
  if (!adminRole) throw new Error("Admin role not found in roles.json");
  const adminUser = await User.create({
    firstName: admin.firstName || "Admin",
    lastName: admin.lastName || "User",
    username: admin.email.split("@")[0],
    email: admin.email,
    password: admin.password,
    isSuperAdmin: true,
    isActive: true,
    role: adminRole._id,
  });
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
  return { adminRole, adminUser };
}

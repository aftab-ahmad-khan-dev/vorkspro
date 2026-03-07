// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import { BugType, Department, DocumentType, Industry, LeaveType, Role, SubDepartment, TransactionType, User } from "../startup/models.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const MODELS = [
//     // { name: "Bug Types", model: BugType, file: "bugTypes.json" },
//     // { name: "Departments", model: Department, file: "departments.json" },
//     // { name: "Document Types", model: DocumentType, file: "documentTypes.json" },
//     // { name: "Industries", model: Industry, file: "industries.json" },
//     // { name: "Leave Types", model: LeaveType, file: "leaveTypes.json" },
//     { name: "Roles", model: Role, file: "roles.json" },
//     // { name: "Sub Departments", model: SubDepartment, file: "subDepartments.json" },
//     // { name: "Transaction Types", model: TransactionType, file: "transactionTypes.json" },
// ];

// const seedData = async () => {
//     try {
//         // Connect once — not multiple times
//         // await mongoose.connect(process.env.MONGODB_URI);
//         // console.log("✅ MongoDB Connected\n");

//         for (const { name, model, file } of MODELS) {
//             const filePath = path.join(__dirname, "exports", file);

//             if (!fs.existsSync(filePath)) {
//                 console.warn(`⚠️  Skipping ${name} — file not found: ${file}`);
//                 continue;
//             }

//             const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

//             if (!Array.isArray(data) || !data.length) {
//                 console.warn(`⚠️  Skipping ${name} — no valid data`);
//                 continue;
//             }

//             await model.deleteMany({});
//             console.log(`🧹 Cleared existing ${name}`);

//             await model.insertMany(data);
//             console.log(`🌱 Seeded ${name} (${data.length} records)\n`);
//         }

//         console.log("✅ All seeding completed successfully");
//     } catch (err) {
//         console.error("❌ Error during seeding:", err);
//     } finally {
//         await mongoose.connection.close();
//         console.log("🔒 MongoDB connection closed");
//     }
// };

// seedData();


// // (async () => {
// //     try {

// //         const email = process.env.ADMIN_EMAIL || "";
// //         const password = process.env.ADMIN_PASSWORD || "";
// //         if (email === "") return;
// //         if (password === "") return;

// //         const existingAdmin = await User.findOne({ email: email });

// //         if (!existingAdmin) {
// //             await User.create({
// //                 name: "Super Admin",
// //                 email: email,
// //                 password: password,
// //                 isSuperAdmin: true,
// //                 isActive: true,
// //             });
// //             console.log("✅ Default Super Admin created!");
// //         } else {
// //             console.log("⚙️ Admin already exists. Skipping creation.");
// //         }

// //         process.exit(0);
// //     } catch (err) {
// //         console.error("❌ Seeder failed:", err);
// //         process.exit(1);
// //     }
// // })();




import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import { DEV_DB_NAME, DB_NAME } from "../constants.js";
import {
  BugType,
  Department,
  DocumentType,
  Industry,
  LeaveType,
  Role,
  SubDepartment,
  TransactionType,
  User,
  Employee
} from "../startup/models.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(path.dirname(__dirname), ".env") });

const SEED_SEQUENCE = [
  { name: "Departments", model: Department, file: "departments.json" },
  { name: "Sub Departments", model: SubDepartment, file: "subDepartments.json" },
  { name: "Leave Types", model: LeaveType, file: "leaveTypes.json" },
  { name: "Roles", model: Role, file: "roles.json" },
  { name: "Bug Types", model: BugType, file: "bugTypes.json" },
  { name: "Document Types", model: DocumentType, file: "documentTypes.json" },
  { name: "Industries", model: Industry, file: "industries.json" },
  { name: "Transaction Types", model: TransactionType, file: "transactionTypes.json" },
  { name: "Employees & Users", model: Employee, file: "employees.json" }
];

async function seedCollection({ name, model, file }) {
  const filePath = path.join(__dirname, "exports", file);

  if (!await fs.access(filePath).then(() => true).catch(() => false)) {
    console.warn(`⚠️ File not found, skipping: ${file}`);
    return;
  }

  let data = JSON.parse(await fs.readFile(filePath, "utf-8"));

  if (!Array.isArray(data) || data.length === 0) {
    console.warn(`⚠️ No valid data in ${file}, skipping ${name}`);
    return;
  }

  console.log(`🌱 Processing ${name} (${data.length} items)...`);

  // Protected collections — do NOT delete them every time (prevents broken references)
  const protectedCollections = ["Roles", "Departments", "Sub Departments", "Leave Types"];

  if (!protectedCollections.includes(name)) {
    console.log(`🧹 Clearing existing ${name}...`);
    await model.deleteMany({});
  } else {
    console.log(`🔒 Protected collection: Skipping delete for ${name}`);
  }

  if (name === "Roles") {
    // Upsert Roles by unique name (safe & stable IDs)
    for (const role of data) {
      await model.findOneAndUpdate(
        { name: role.name },
        role,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`Roles upserted (${data.length})`);
  } else if (name === "Departments") {
    // Simple bulk insert (or change to upsert later if needed)
    await model.insertMany(data, { ordered: false });
  } else if (name === "Sub Departments") {
    await seedSubDepartments(data);
  } else if (name === "Employees & Users") {
    await seedEmployeesAndUsers(data);
  } else {
    // Default for other collections
    await model.insertMany(data, { ordered: false });
  }

  console.log(`✅ ${name} processed successfully\n`);
}

async function seedSubDepartments(subDeptData) {
  const departments = await Department.find({}).lean();
  const deptMap = new Map(departments.map(d => [d.name.trim().toLowerCase(), d._id]));

  let success = 0;
  for (const sdInput of subDeptData) {
    const deptName = sdInput.departmentName?.trim().toLowerCase();
    if (!deptName || !deptMap.has(deptName)) {
      console.warn(`⚠️ Department "${sdInput.departmentName}" not found for sub "${sdInput.name}"`);
      continue;
    }

    const sdDoc = { ...sdInput };
    delete sdDoc.departmentName;
    sdDoc.department = deptMap.get(deptName);

    const created = await SubDepartment.create(sdDoc);

    await Department.findByIdAndUpdate(deptMap.get(deptName), {
      $addToSet: { subDepartments: created._id }
    });

    console.log(`→ SubDept connected: ${sdInput.name} → ${sdInput.departmentName}`);
    success++;
  }
  console.log(`SubDepartments: ${success}/${subDeptData.length} connected`);
}

async function seedEmployeesAndUsers(empData) {
  console.log("🔗 Seeding Employees + Users with full connections...");

  const roles = await Role.find({}).lean();
  const departments = await Department.find({}).lean();
  const subDepartments = await SubDepartment.find({}).lean();

  const roleMap = new Map(roles.map(r => [r.name.trim().toLowerCase(), r._id]));
  const deptMap = new Map(departments.map(d => [d.name.trim().toLowerCase(), d._id]));
  const subDeptMap = new Map(subDepartments.map(sd => [sd.name.trim().toLowerCase(), sd._id]));

  const jobToRoleMap = {
    "senior mern stack developer": "Developer",
    "mern stack developer": "Developer",
    "devops engineer": "Developer",
    "flutter developer": "Developer",
    "qa engineer": "QA", // Add this role in roles.json if missing
    "hr manager": "HR Manager",
    "default": "Employee"
  };

  const DEFAULT_PASSWORD = process.env.SEED_USER_PASSWORD || "12345678";
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let success = 0;

  for (const input of empData) {
    try {
      // ── Create/Update User ───────────────────────────────────────
      const userData = {
        firstName: input.firstName,
        lastName: input.lastName,
        username: input.username,
        email: input.email,
        phone: input.phone,
        // Use a single strong default password for all seeded users (hashed)
        password: hashedPassword,
        isActive: true,
        isSuperAdmin: input.jobTitle?.toLowerCase().includes("admin") || false
      };

      const jobKey = input.jobTitle?.trim().toLowerCase() || "";
      const roleName = jobToRoleMap[jobKey] || jobToRoleMap["default"];
      userData.role = roleMap.get(roleName.toLowerCase());

      const user = await User.findOneAndUpdate(
        { email: userData.email },
        userData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // ── Prepare Employee with real IDs ────────────────────────────
      const employeeDoc = {
        ...input,
        user: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      };

      const deptName = employeeDoc.departmentName?.trim().toLowerCase();
      const subName = employeeDoc.subDepartmentName?.trim().toLowerCase();

      delete employeeDoc.departmentName;
      delete employeeDoc.subDepartmentName;

      if (deptName && deptMap.has(deptName)) {
        employeeDoc.department = deptMap.get(deptName);
      }

      if (subName && subDeptMap.has(subName)) {
        employeeDoc.subDepartment = subDeptMap.get(subName);
      }

      // ── Create/Update Employee ───────────────────────────────────
      const emp = await Employee.findOneAndUpdate(
        { email: employeeDoc.email },
        employeeDoc,
        { upsert: true, new: true }
      );

      // ── Connect back to Department & SubDepartment ───────────────
      if (emp.user && emp.department) {
        await Department.findByIdAndUpdate(emp.department, {
          $addToSet: { employees: emp.user }
        });
      }

      if (emp.user && emp.subDepartment) {
        await SubDepartment.findByIdAndUpdate(emp.subDepartment, {
          $addToSet: { employees: emp.user }
        });
      }

      success++;
      console.log(`✓ Connected: ${emp.firstName} ${emp.lastName}`);

    } catch (err) {
      console.error(`✗ Failed: ${input.firstName} ${input.lastName} →`, err.message);
    }
  }

  console.log(`\nTotal employees processed: ${success}/${empData.length}`);
}

async function ensureEmployeeProfiles() {
  console.log("\n📋 Ensuring Employee profiles for all Users...");
  const usersWithoutEmployee = await User.aggregate([
    { $lookup: { from: "employees", localField: "_id", foreignField: "user", as: "emp" } },
    { $match: { "emp.0": { $exists: false }, isActive: true } },
    { $project: { _id: 1, firstName: 1, lastName: 1, email: 1, phone: 1, isSuperAdmin: 1, role: 1 } },
  ]);
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
    console.log(`   ✓ Created Employee profile: ${u.email} (${jobTitle})`);
  }
  if (usersWithoutEmployee.length === 0) {
    console.log("   ✓ All Users already have Employee profiles");
  }
}

function buildDbUri(dbName) {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  if (uri.includes("?")) return uri.replace("?", `/${dbName}?`);
  return `${uri.replace(/\/$/, "")}/${dbName}`;
}

async function seedData() {
  try {
    const dbName = process.env.MODE === "production" ? DB_NAME : DEV_DB_NAME;
    const dbPath = buildDbUri(dbName);
    if (!dbPath) {
      console.error("❌ MONGODB_URI or MODE missing. Set .env (MODE, MONGODB_URI).");
      process.exit(1);
    }
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(dbPath, { serverSelectionTimeoutMS: 30000, connectTimeoutMS: 30000 });
    console.log("✅ MongoDB connected\n");
    console.log("🚀 Starting full data seeding...\n");

    for (const item of SEED_SEQUENCE) {
      await seedCollection(item);
    }

    // Super Admin (from env)
    const adminEmail = process.env.ADMIN_EMAIL || "admin@vorkspro.com";
    const defaultPassword = process.env.ADMIN_PASSWORD || "12345678";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const adminRole = await Role.findOne({ name: "Admin" });
      if (adminRole) {
        await User.create({
          firstName: "Super",
          lastName: "Admin",
          username: adminEmail.split("@")[0],
          email: adminEmail,
          password: defaultPassword,
          isSuperAdmin: true,
          isActive: true,
          role: adminRole._id,
        });
        console.log("👑 Super Admin created successfully!");
      } else {
        console.warn("⚠️ Admin role not found — skipping Super Admin");
      }
    } else {
      console.log("👑 Super Admin already exists — skipping");
    }

    // One user per role (for testing/demo)
    const roleUserSeeds = [
      { roleName: "Admin", email: "admin@vorkspro.com", firstName: "Super", lastName: "Admin", isSuperAdmin: true },
      { roleName: "HR Manager", email: "hr@vorkspro.com", firstName: "HR", lastName: "Manager", isSuperAdmin: false },
      { roleName: "Finance Officer", email: "finance@vorkspro.com", firstName: "Finance", lastName: "Officer", isSuperAdmin: false },
      { roleName: "Project Manager", email: "pm@vorkspro.com", firstName: "Project", lastName: "Manager", isSuperAdmin: false },
      { roleName: "Employee", email: "employee@vorkspro.com", firstName: "Demo", lastName: "Employee", isSuperAdmin: false },
    ];

    for (const seed of roleUserSeeds) {
      const existing = await User.findOne({ email: seed.email });
      if (existing) {
        console.log(`👤 User ${seed.email} already exists — skipping`);
        continue;
      }
      const role = await Role.findOne({ name: seed.roleName });
      if (!role) {
        console.warn(`⚠️ Role "${seed.roleName}" not found — skipping user ${seed.email}`);
        continue;
      }
      await User.create({
        firstName: seed.firstName,
        lastName: seed.lastName,
        username: seed.email.split("@")[0],
        email: seed.email,
        password: defaultPassword,
        isSuperAdmin: seed.isSuperAdmin ?? false,
        isActive: true,
        role: role._id,
      });
      console.log(`👤 Created user for role "${seed.roleName}": ${seed.email}`);
    }

    // Ensure all Users have Employee profiles (fixes Profile page not loading)
    await ensureEmployeeProfiles();

    console.log("\n🎉 All seeding completed successfully!");
  } catch (err) {
    console.error("❌ Critical seeding error:", err.message);
    console.error(err.stack);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

// Run the seeder
seedData();
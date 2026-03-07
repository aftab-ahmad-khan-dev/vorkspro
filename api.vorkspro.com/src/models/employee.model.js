import mongoose from "mongoose";
import { ModelNames } from "../constants.js";
import { SalaryHistory } from "../startup/models.js";

const EmployeeSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String },
    phone: { type: String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: ModelNames.User.model },
    status: {
      type: String,
      enum: ["pending", "active", "resigned", "terminated", "deleted"],
      default: "pending",
    },

    companyEmail: { type: String },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    maritalStatus: {
      type: String,
      enum: ["single", "married", "divorced", "widowed", "other"],
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    languageSpoken: [{ type: String }],
    location: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    emergencyContact: {
      name: { type: String },
      relationship: { type: String },
      email: { type: String },
      phone: { type: String },
    },

    // Employment Detail
    employeeId: { type: String },
    joinDate: { type: Date },
    leaveDate: { type: Date },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.Department.model,
    },
    subDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.SubDepartment.model,
    },
    jobTitle: { type: String },
    employmentType: {
      type: String,
      enum: ["full time", "part time", "contract", "intern"],
    },
    workLocation: { type: String, enum: ["onsite", "remote", "hybrid"] },
    reportingManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.User.model,
    },
    probationPeriodInMonths: { type: Number },
    noticePeriod: { type: Number },

    // Salary & Compensations
    baseSalary: { type: Number },
    lastSalaryIncrementDate: { type: Date },
    lastSalary: { type: Number },

    allowances: [
      {
        name: { type: String },
        amount: { type: Number },
      },
    ],
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      branchName: { type: String },
      accountHolderName: { type: String },
    },

    // Leave Allocation
    leaveAllocation: [
      {
        leaveType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: ModelNames.LeaveType.model,
        },
        totalDays: { type: Number },
        utilizedDays: { type: Number, default: 0 },
        remainingDays: { type: Number, default: 0 },
      },
    ],

    // Education & Skills
    education: {
      highestEducation: {
        type: String,
        enum: [
          "High School",
          "Intermediate",
          "Diploma",
          "Graduation",
          "Bachelor",
          "Masters",
          "PhD",
        ],
      },
      fieldOfStudy: { type: String },
      university: { type: String },
      highestEducationYear: { type: Number },
      experience: { type: Number },
      relevantExperience: { type: Number },
      skills: [{ type: String }],
      certifications: [{ type: String }],
      linkedinUrl: { type: String },
      githubUrl: { type: String },
      portfolioUrl: { type: String },
      resumeUrl: { type: String },
    },

    // uniform & Equipment
    uniform: {
      shirtSize: { type: String },
      pantSize: { type: String },
      shoeSize: { type: String },
    },

    // documents
    documents: [
      {
        name: { type: String, enum: ["resume", "idProof"] },
        url: { type: String },
      },
    ],

    // additional info
    hobbies: [{ type: String }],
    notes: { type: String },
    isDeleted: { type: Boolean, default: false },
    profilePicture: { type: String },

    achievements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: ModelNames.Achievement.model,
      },
    ],
  },
  { timestamps: true }
);

EmployeeSchema.index({ user: 1 });
EmployeeSchema.index({ department: 1, isDeleted: 1 });
EmployeeSchema.index({ status: 1, isDeleted: 1 });

// ✅ Automatically create a SalaryHistory entry when a new Employee is added
// EmployeeSchema.pre("save", async function (next) {
//   try {
//     // Only create if new document
//     if (this.isNew && this.baseSalary) {
//       await SalaryHistory.create({
//         userId: this.user,
//         date: this.joinDate || new Date(),
//         previousSalary: 0,
//         newSalary: this.baseSalary,
//         incrementPercentage: 0,
//         reason: "Initial salary at hiring",
//       });
//     }
//     next();
//   } catch (error) {
//     console.error("Error creating salary history:", error);
//     next(error);
//   }
// });

export default mongoose.model(ModelNames.Employee.model, EmployeeSchema);

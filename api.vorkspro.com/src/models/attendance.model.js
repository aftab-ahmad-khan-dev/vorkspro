import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";
import { Employee } from "../startup/models.js";

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ModelNames.Employee.model,
    },
    date: { type: Date },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: {
      type: String,
      enum: ["present", "absent", "on-leave", "late-arrival", "over-time"],
    },
    reason: { type: String },
    leaveType: { type: Schema.Types.ObjectId, ref: ModelNames.LeaveType.model },
    notes: { type: String },
  },
  { timestamps: true }
);

// 🔁 When a new attendance record is saved:
// AttendanceSchema.post("save", async function (doc, next) {
//     try {
//         if (doc.status === "On Leave" && doc.leaveType) {
//             // Find the employee related to this attendance
//             const employee = await Employee.findOne({ user: doc.user });
//             if (employee) {
//                 // Ensure `leaveSummary` or similar field exists
//                 if (!employee.leaveSummary) {
//                     employee.leaveSummary = {};
//                 }

//                 const leaveTypeId = doc.leaveType.toString();
//                 const usedLeaves = employee.leaveSummary[leaveTypeId]?.used || 0;

//                 // Increment the used leave count
//                 employee.leaveSummary[leaveTypeId] = {
//                     used: usedLeaves + 1,
//                     lastUpdated: new Date(),
//                 };

//                 await employee.save();
//             }
//         }

//         next();
//     } catch (err) {
//         console.error("Error updating employee leave info:", err);
//         next(err);
//     }
// });

export default mongoose.model(ModelNames.Attendance.model, AttendanceSchema);

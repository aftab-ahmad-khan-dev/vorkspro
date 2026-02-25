import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Employee, SalaryHistory, User } from "../startup/models.js";

export const salaryHistoryController = {
  updateEmployeeSalary: asyncHandler(async (req, res) => {
    const { employeeId, date, newSalary, reason, note } = req.body;

    // ✅ Step 1: Basic field validation
    if (!employeeId || !date || !newSalary) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Employee ID, salary date, and new salary are required."
      );
    }

    // ✅ Step 2: Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found."
      );
    }

    const userId = employee.user;

    // ✅ Step 3: Check for existing salary record for the same date
    const sameDateRecord = await SalaryHistory.findOne({
      userId,
      date: new Date(date),
    });
    if (sameDateRecord) {
      return generateApiResponse(
        res,
        StatusCodes.CONFLICT,
        false,
        `A salary record already exists for this date (${date}).`
      );
    }

    // ✅ Step 4: Get latest salary record (for increment comparison)
    const latestSalaryRecord = await SalaryHistory.findOne({ userId })
      .sort({ date: -1 })
      .lean();

    const previousSalary =
      latestSalaryRecord?.newSalary ?? employee.lastSalary ?? 0;

    // ✅ Step 5: Validate salary change
    if (Number(previousSalary) === Number(newSalary)) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "New salary must be different from the previous salary."
      );
    }

    // ✅ Step 6: Ensure new salary date is not older than last increment date
    if (
      employee.lastSalaryIncrementDate &&
      new Date(date) <= new Date(employee.lastSalaryIncrementDate)
    ) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        `The salary update date must be later than the last increment date (${employee.lastSalaryIncrementDate.toDateString()}).`
      );
    }

    // ✅ Step 7: Calculate increment percentage
    const incrementPercentage =
      previousSalary > 0
        ? ((newSalary - previousSalary) / previousSalary) * 100
        : 0;

    // ✅ Step 8: Create salary history record
    const salaryHistory = await SalaryHistory.create({
      userId,
      date: new Date(date),
      previousSalary,
      newSalary,
      incrementPercentage: Number(incrementPercentage.toFixed(2)),
      reason: reason || "Salary update",
      note,
    });

    // ✅ Step 9: Update employee record
    employee.lastSalary = newSalary;
    employee.lastSalaryIncrementDate = new Date(date);
    await employee.save();

    // ✅ Step 10: Final response
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Salary updated successfully.",
      { salaryHistory }
    );
  }),

  getRecentSalaryHistory: asyncHandler(async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const records = await SalaryHistory.find({})
      .sort({ date: -1 })
      .limit(limit)
      .populate("userId", "name email")
      .lean();

    const withEmployee = await Promise.all(
      records.map(async (r) => {
        const userId = r.userId?._id ?? r.userId;
        if (!userId) {
          return { ...r, employeeName: "—", departmentName: null };
        }
        const emp = await Employee.findOne({ user: userId })
          .select("firstName lastName department")
          .populate("department", "name")
          .lean();
        const employeeName =
          emp ? `${(emp.firstName || "").trim()} ${(emp.lastName || "").trim()}`.trim() || r.userId?.name : r.userId?.name || "—";
        return {
          ...r,
          employeeName: employeeName || "—",
          departmentName: emp?.department?.name ?? null,
        };
      })
    );

    return generateApiResponse(res, StatusCodes.OK, true, "Recent salary history fetched.", {
      salaryHistory: withEmployee,
    });
  }),
};

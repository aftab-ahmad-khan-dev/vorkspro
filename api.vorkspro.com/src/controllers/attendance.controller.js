import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Attendance, BugType, Employee, LeaveType } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";

export const attendanceController = {
  markAttendance: asyncHandler(async (req, res) => {
    const {
      leaveType,
      employee,
      status,
      checkInTime,
      checkOutTime,
      notes,
      date,
    } = req.body;

    // 1: Find Employee
    const emp = await Employee.findById(employee);
    if (!emp) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    // 2: Find leave in leaveAllocation
    const leaveEntry = emp.leaveAllocation.find(
      (l) => l.leaveType.toString() === leaveType
    );
    if (!leaveEntry && leaveType) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Leave type not allocated to this employee"
      );
    }

    // 3: Check remaining days
    if (leaveEntry?.remainingDays <= 0) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "No remaining leave days"
      );
    }

    // 4: Deduct leave
    if (leaveType) {
      leaveEntry.utilizedDays += 1;
      leaveEntry.remainingDays -= 1;
    }
    await emp.save();

    // 5: Calculate worked hours
    let workStatus = status;
    if (checkInTime && checkOutTime) {
      let checkIn = new Date(checkInTime);
      let checkOut = new Date(checkOutTime);

      // If checkOut is earlier than checkIn, assume it's the next day
      if (checkOut <= checkIn) {
        checkOut.setDate(checkOut.getDate() + 1);
      }

      const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60); // ms → hours

      if (hoursWorked > 9) {
        workStatus = "over-time";
      } else if (checkIn.getHours() >= 10 && hoursWorked < 9) {
        workStatus = "late-arrival";
      }
    }

    // 6: Check if attendance already exists
    const foundAttendance = await Attendance.findOne({ employee, date });
    if (foundAttendance) {
      const updatedAttendance = await Attendance.findByIdAndUpdate(
        foundAttendance._id,
        {
          date,
          status: workStatus,
          checkInTime,
          checkOutTime,
          leaveType,
          notes,
        },
        { new: true }
      );

      return generateApiResponse(
        res,
        StatusCodes.OK,
        true,
        "Attendance updated successfully",
        { attendance: updatedAttendance }
      );
    }

    // 7: Create new attendance
    const attendance = await Attendance.create({
      employee,
      status: workStatus,
      checkInTime,
      checkOutTime,
      leaveType,
      notes,
      date,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Attendance marked successfully",
      { attendance }
    );
  }),

  updateAttendance: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { checkInTime, checkOutTime } = req.body;

    const attendance = await Attendance.findByIdAndUpdate(
      id,
      { checkInTime, checkOutTime },
      { new: true }
    );

    // 5: Calculate worked hours
    if (checkInTime && checkOutTime) {
      let checkIn = new Date(checkInTime);
      let checkOut = new Date(checkOutTime);

      // If checkOut is earlier than checkIn, assume it's the next day
      if (checkOut <= checkIn) {
        checkOut.setDate(checkOut.getDate() + 1);
      }

      const hoursWorked = (checkOut - checkIn) / (1000 * 60 * 60); // ms → hours

      console.log(hoursWorked)

      if (hoursWorked == 9) {
        attendance.status = "present";
        attendance.save()
      }
      if (hoursWorked > 9) {
        attendance.status = "over-time";
        attendance.save()
      } else if (checkIn.getHours() >= 10 && hoursWorked < 9) {
        attendance.status = "late-arrival";
        attendance.save()
      }
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Attendance updated successfully",
      { attendance }
    );
  }),

  getByFilter: asyncHandler(async (req, res) => {
    let whereStatement = {};
    const { date, status } = req.query;

    // -----------------------------
    // 📌 DATE FILTER (FIXED)
    // -----------------------------
    let filterDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(
      filterDate.getFullYear(),
      filterDate.getMonth(),
      filterDate.getDate(),
      0, 0, 0, 0
    );

    const endOfDay = new Date(
      filterDate.getFullYear(),
      filterDate.getMonth(),
      filterDate.getDate(),
      23, 59, 59, 999
    );

    whereStatement.date = {
      $gte: startOfDay,
      $lte: endOfDay,
    };

    if (status && status !== "all") {
      whereStatement.status = status;
    }

    // -----------------------------
    // 📌 POPULATE
    // -----------------------------
    const populate = [
      {
        path: "employee",
        select: "firstName lastName department",
        populate: {
          path: "department",
          select: "name",
        },
      },
    ];

    const filteredData = await paginationFiltrationData(
      Attendance,
      req.query,
      "attendances",
      [],
      whereStatement,
      populate
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Attendances fetched successfully",
      { filteredData }
    );
  }),

  getStats: asyncHandler(async (req, res) => {
    const { date } = req.params; // get date from params, e.g., "2025-11-18"

    if (!date) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Date parameter is required"
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const totalEmployees = await Employee.countDocuments({
      isDeleted: false,
      status: "active",
    });

    const presentAttendance = await Attendance.countDocuments({
      status: "present",
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const absentAttendance = await Attendance.countDocuments({
      status: "absent",
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const onLeave = await Attendance.countDocuments({
      status: "on-leave",
      date: { $gte: startOfDay, $lte: endOfDay },
    });
    const lateArrival = await Attendance.countDocuments({
      status: "late-arrival",
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const stats = {
      totalEmployees,
      presentAttendance,
      absentAttendance,
      lateArrival,
      onLeave,
    };

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      `Attendances stats fetched successfully for ${date}`,
      { stats }
    );
  }),

  deleteAttendance: asyncHandler(async (req, res) => {
    const { id } = req.params;

    // 1: Find the attendance record
    const attendance = await Attendance.findById(id);
    if (!attendance) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Attendance not found"
      );
    }

    const { employee: employeeId, leaveType } = attendance;

    // 2: Find the employee
    const emp = await Employee.findById(employeeId);
    if (!emp) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    // 3: Update leave allocation if the attendance had a leave type
    if (leaveType) {
      const leaveEntry = emp.leaveAllocation.find(
        (l) => l.leaveType.toString() === leaveType.toString()
      );

      if (leaveEntry) {
        leaveEntry.utilizedDays = Math.max(leaveEntry.utilizedDays - 1, 0);
        leaveEntry.remainingDays = leaveEntry.remainingDays + 1;
        await emp.save();
      }
    }

    // 4: Delete the attendance record
    const deletedAttendance = await Attendance.findByIdAndDelete(id);

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Attendance deleted successfully",
      { attendance: deletedAttendance }
    );
  }),

  weeklyAttendanceStatic: asyncHandler(async (req, res) => {
    // Get all employees
    const employees = await Employee.find({
      isDeleted: false,
      status: { $in: ["active", "pending"] },
    }).select("firstName lastName");

    // Calculate start and end dates
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6); // last 7 days including today

    // Fetch attendances within the week
    const attendances = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("employee", "firstName lastName");

    // Prepare daily statistics
    const dailyStatistics = [];
    const totalEmployees = employees.length;

    for (let i = 0; i < 7; i++) {
      // use a clone of startDate to avoid mutation issues
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      const dayString = day.toISOString().split("T")[0];
      const dayName = day.toLocaleDateString("en-US", { weekday: "long" });

      // Filter attendances for this day
      const dayAttendances = attendances.filter(
        (att) => att.date.toISOString().split("T")[0] === dayString
      );

      // Count categories (keep late separate but include it in present-rate)
      const presentOnlyCount = dayAttendances.filter(
        (att) => att.status === "present" || att.status === "over-time"
      ).length;

      const lateCount = dayAttendances.filter(
        (att) => att.status === "late-arrival"
      ).length;

      const leaveCount = dayAttendances.filter(
        (att) => att.status === "on-leave"
      ).length;

      // total present for attendance rate includes present + late (as before)
      const totalPresentForRate = presentOnlyCount + lateCount;

      // Absent should count everyone not present/late/on-leave.
      // This accounts for employees who simply have no attendance record that day.
      let absentCount = totalEmployees - (totalPresentForRate + leaveCount);

      // Defensive: ensure not negative
      if (absentCount < 0) absentCount = 0;

      const attendanceRate =
        totalEmployees > 0
          ? ((totalPresentForRate / totalEmployees) * 100).toFixed(0)
          : "0";

      dailyStatistics.push({
        day: dayName,
        present: presentOnlyCount,
        absent: absentCount,
        leave: leaveCount,
        late: lateCount,
        rate: `${attendanceRate}%`,
      });
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Weekly attendance statistics fetched successfully",
      { statistics: dailyStatistics }
    );
  }),

  importAttendance: asyncHandler(async (req, res) => {
    const { attendanceData } = req.body;

    attendanceData.forEach(element => {
      
    });

    const employees = await Employee.find({
      
    })
    const importedAttendances = await Attendance.insertMany(attendanceData);
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Attendance imported successfully",
      { attendances: importedAttendances }
    );
  })
};

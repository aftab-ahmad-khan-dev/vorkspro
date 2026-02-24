import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import {
  generateApiResponse,
  generateUsername,
} from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { Employee, LeaveRequest } from "../startup/models.js";

export const leaveRequestController = {
  createRequest: asyncHandler(async (req, res) => {
    const { employee, leaveType, startDate, endDate, reason } = req.body;

    if (!employee || !leaveType || !startDate || !endDate) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "All fields are required"
      );
    }

    // 1️⃣ Find employee with leave allocation
    const emp = await Employee.findById(employee);

    if (!emp) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    // 2️⃣ Find leaveType inside employee.leaveAllocation
    const leaveAlloc = emp.leaveAllocation.find(
      (lv) => lv.leaveType.toString() === leaveType
    );

    if (!leaveAlloc) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "This leave type is not allocated to the employee"
      );
    }

    // 3️⃣ Calculate applied leave days
    const sd = new Date(startDate);
    const ed = new Date(endDate);

    const appliedDays = Math.floor((ed - sd) / (1000 * 60 * 60 * 24)) + 1; // inclusive days

    console.log(appliedDays);

    // 4️⃣ Check if employee has enough remaining days
    if (leaveAlloc.remainingDays < appliedDays) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Not enough leave balance"
      );
    }

    // 5️⃣ Update utilized + remaining days
    // leaveAlloc.utilizedDays += appliedDays;
    // leaveAlloc.remainingDays -= appliedDays;

    await emp.save();

    // 6️⃣ Create the leave request
    const request = await LeaveRequest.create({
      employee,
      leaveType,
      startDate,
      endDate,
      reason,
      appliedDays,
    });

    request.days = appliedDays;
    request.save();

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Request created successfully",
      { request }
    );
  }),

  changeApprovalRequest: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const request = await LeaveRequest.findById(id);

    if (!request) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Request id is missing or invalid"
      );
    }

    const emp = await Employee.findById(request.employee);

    const reqLeaveType = request.leaveType.toString();
    const appliedDays = Number(request.days) || 0;

    emp.leaveAllocation.forEach((lv, index) => {
      if (lv.leaveType.toString() === reqLeaveType) {
        const beforeUtilized = lv.utilizedDays;
        const beforeRemaining = lv.remainingDays;

        // ensure numbers
        lv.utilizedDays = Number(lv.utilizedDays) || 0;
        lv.remainingDays = Number(lv.remainingDays) || 0;

        if (status === "approved") {
          lv.utilizedDays += appliedDays;
          lv.remainingDays -= appliedDays;
        }

        if (status === "rejected") {
          lv.utilizedDays -= appliedDays;
          lv.remainingDays += appliedDays;
        }
      }
    });

    // ⚠ IMPORTANT for saving nested arrays
    emp.markModified("leaveAllocation");

    // SAVE EMPLOYEE
    await emp.save();

    // UPDATE LEAVE REQUEST STATUS
    const beforeStatus = request.status;
    request.status = status;
    await request.save();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Status changed successfully"
    );
  }),

  deleteRequest: asyncHandler(async (req, res) => {
    const { id } = req.params;

    await LeaveRequest.findByIdAndDelete(id);

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Request deleted successfully"
    );
  }),

  getByFilter: asyncHandler(async (req, res) => {
    let whereStatement = {};
    const {
      search,
      page = 1,
      size = 10,
      sort = "createdAt",
      order = "desc",
      status,
    } = req.query;

    if (status === "leaveRequest") {
      whereStatement.status = { $in: ["pending", "approved", "rejected"] };
    } else if (status === "holidaysRequest") {
      whereStatement.status = { $in: ["holidays", "events"] };
    } else {
      whereStatement.status = status;
    }

    if (!search) {
      const filteredData = await paginationFiltrationData(
        LeaveRequest,
        req.query,
        "requests",
        ["status", "reason", "holiday", "type"],
        whereStatement,
        [
          { path: "employee", select: "firstName lastName" },
          { path: "leaveType", select: "name" },
        ]
      );

      return generateApiResponse(
        res,
        StatusCodes.OK,
        true,
        "Requests fetched",
        { filteredData }
      );
    }

    const searchRegex = { $regex: search.trim(), $options: "i" };
    const lowerSearch = search.toString().trim().toLowerCase();
    const isStatus = [
      "pending",
      "approved",
      "rejected",
      "holidays",
      "events",
      "leave",
      "leaves",
    ].includes(lowerSearch);

    const matchStage = isStatus
      ? { status: lowerSearch }
      : {
        $or: [
          { "employee.firstName": searchRegex },
          { "employee.lastName": searchRegex },
          { employeeFullName: searchRegex },
          { "leaveType.name": searchRegex },
          { holiday: searchRegex },
          { reason: searchRegex },
        ].filter(Boolean),
      };

    const pipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "leavetypes",
          localField: "leaveType",
          foreignField: "_id",
          as: "leaveType",
        },
      },
      { $unwind: { path: "$leaveType", preserveNullAndEmptyArrays: true } },

      {
        $addFields: {
          employeeFullName: {
            $trim: {
              input: {
                $concat: ["$employee.firstName", " ", "$employee.lastName"],
              },
            },
          },
        },
      },

      { $match: matchStage },

      // PRIORITY: pending first, then approved, then rejected, holidays last
      {
        $addFields: {
          statusOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", "pending"] }, then: 0 },
                { case: { $eq: ["$status", "approved"] }, then: 1 },
                { case: { $eq: ["$status", "rejected"] }, then: 2 },
                { case: { $in: ["$status", ["holidays", "events"]] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { statusOrder: 1, [sort]: order === "asc" ? 1 : -1 } },

      {
        $facet: {
          requests: [
            { $skip: (parseInt(page) - 1) * parseInt(size) },
            { $limit: parseInt(size) },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

    const [result] = await LeaveRequest.aggregate(pipeline);

    const requests = result.requests || [];
    const total = result.totalCount[0]?.total || 0;

    const filteredData = {
      requests,
      pagination: {
        page: parseInt(page),
        size: parseInt(size),
        totalItems: total,
        totalPages: Math.ceil(total / parseInt(size)),
        sort,
        order,
        search: search || "",
      },
    };

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Requests fetched successfully",
      { filteredData }
    );
  }),

  getStats: asyncHandler(async (req, res) => {
    const totalRequests = await LeaveRequest.find({}).countDocuments();
    const approvedRequests = await LeaveRequest.find({
      status: "approved",
    }).countDocuments();
    const pendingRequests = await LeaveRequest.find({
      status: "pending",
    }).countDocuments();

    const today = new Date();
    const next15Days = new Date();
    next15Days.setDate(next15Days.getDate() + 15);

    const holidaysRequests = await LeaveRequest.find({
      status: "holidays",
      holidayDate: { $gte: today, $lte: next15Days },
    }).countDocuments();

    const eventsRequests = await LeaveRequest.find({
      status: "events",
      holidayDate: { $gte: today, $lte: next15Days },
    }).countDocuments();
    const onLeaveRequests = await LeaveRequest.find({
      status: "approved",
      $or: [
        { startDate: { $lt: new Date() } },
        { endDate: { $gt: new Date() } },
      ],
    }).countDocuments();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Stats fetched successfully!",
      {
        stats: {
          totalRequests,
          approvedRequests,
          onLeaveRequests,
          pendingRequests,
          holidaysRequests,
          eventsRequests,
        },
      }
    );
  }),

  createHoliday: asyncHandler(async (req, res) => {
    const { holiday, holidayDate, type, status } = req.body;

    if (!holiday || !holidayDate || !type) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Missing required fields"
      );
    }

    const holidayRequest = await LeaveRequest.create({
      type: type,
      holiday,
      holidayDate,
      status,
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Request created successfully",
      { request: holidayRequest }
    );
  }),

  bulkDelete: asyncHandler(async (req, res) => {
    const { ids } = req.body;

    await LeaveRequest.deleteMany({ _id: { $in: ids } });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Requests deleted successfully"
    );
  }),

  getUpComingCelebrations: asyncHandler(async (req, res) => {

    // ✅ Normalize date to LOCAL start of day
    const normalizeLocalDate = (date) => {
      return new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
    };

    // ✅ Format date as YYYY-MM-DD (LOCAL)
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      return `${y}-${m}-${d}`;
    };

    const today = normalizeLocalDate(new Date());
    const currentYear = today.getFullYear();

    const next30Days = new Date(today);
    next30Days.setDate(today.getDate() + 30);

    const employees = await Employee.find({
      status: "active",
      $or: [
        { dateOfBirth: { $exists: true } },
        { joinDate: { $exists: true } },
      ],
    }).select("firstName lastName dateOfBirth joinDate");

    const celebrations = [];

    employees.forEach((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.trim();

      // ================= 🎂 Birthday =================
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);

        let nextBirthday = normalizeLocalDate(
          new Date(currentYear, dob.getMonth(), dob.getDate())
        );

        if (nextBirthday < today) {
          nextBirthday = normalizeLocalDate(
            new Date(currentYear + 1, dob.getMonth(), dob.getDate())
          );
        }

        if (nextBirthday >= today && nextBirthday <= next30Days) {
          celebrations.push({
            type: "birthday",
            title: `${fullName}'s Birthday`,
            employeeName: fullName,
            date: formatDate(nextBirthday),
            dateObj: nextBirthday,
            daysAway: Math.ceil(
              (nextBirthday - today) / (1000 * 60 * 60 * 24)
            ),
          });
        }
      }

      // ================= 🎉 Anniversary =================
      if (emp.joinDate) {
        const join = new Date(emp.joinDate);

        let nextAnniversary = normalizeLocalDate(
          new Date(currentYear, join.getMonth(), join.getDate())
        );

        if (nextAnniversary < today) {
          nextAnniversary = normalizeLocalDate(
            new Date(currentYear + 1, join.getMonth(), join.getDate())
          );
        }

        if (nextAnniversary >= today && nextAnniversary <= next30Days) {
          const yearsCompleted =
            nextAnniversary.getFullYear() - join.getFullYear();

          celebrations.push({
            type: "anniversary",
            title: `${fullName}'s Work Anniversary`,
            subtitle:
              yearsCompleted > 0
                ? `${yearsCompleted} year${yearsCompleted > 1 ? "s" : ""} at company`
                : "1st day milestone",
            employeeName: fullName,
            date: formatDate(nextAnniversary),
            dateObj: nextAnniversary,
            daysAway: Math.ceil(
              (nextAnniversary - today) / (1000 * 60 * 60 * 24)
            ),
            yearsCompleted,
          });
        }
      }
    });

    celebrations.sort((a, b) => a.dateObj - b.dateObj);

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Upcoming celebrations fetched successfully",
      {
        celebrations,
        count: celebrations.length,
        period: "Next 30 days",
      }
    );
  }),

};

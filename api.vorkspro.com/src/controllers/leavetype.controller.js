import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import {
  Department,
  Employee,
  LeaveType,
  ResetCode,
  User,
} from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { client } from "../app.js";

export const leaveTypeController = {
  getByFilter: asyncHandler(async (req, res) => {
    const { isActive } = req.query;
    let whereStatement = {};
    let searchAttributes = ["name", "description"];

    if (isActive) {
      whereStatement.isActive = isActive;
    }

    const filteredData = await paginationFiltrationData(
      LeaveType,
      req.query,
      "leaveTypes",
      searchAttributes,
      whereStatement
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Sub Departments fetched successfully",
      { filteredData }
    );
  }),

  getAll: asyncHandler(async (req, res) => {
    const leaveType = await LeaveType.find();
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Leave types fetched successfully",
      { filteredData: { leaveType } }
    );
  }),

  createLeaveType: asyncHandler(async (req, res) => {
    const { name, description, daysAllowed, colorCode } = req.body;

    const leaveType = await LeaveType.create({
      name,
      description,
      daysAllowed,
      colorCode,
    });

    if (!leaveType) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Failed to create leave type"
      );
    }
    await client.del("leaveTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Leave type created successfully",
      { leaveType }
    );
  }),

  updateLeaveType: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, daysAllowed, isActive } = req.body;

    const updatedData = {
      name,
      description,
      daysAllowed,
      isActive,
    };

    const leaveType = await LeaveType.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!leaveType) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Leave type not found"
      );
    }
    await client.del("leaveTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Leave type updated successfully",
      { leaveType }
    );
  }),

  deleteLeaveType: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const leaveType = await LeaveType.findByIdAndDelete(id);

    if (!leaveType) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Leave type not found"
      );
    }
    await client.del("leaveTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Leave type deleted successfully"
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const leaveType = await LeaveType.findById(id);

    if (!leaveType) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Leave type id is missing or invalid"
      );
    }

    leaveType.isActive = isActive;
    leaveType.save();
    await client.del("leaveTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Status changes successfully"
    );
  }),

  getActiveList: asyncHandler(async (req, res) => {
    const cacheKey = "leaveTypes:active"; // Redis key

    // 1️⃣ Check if cached data exists
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log("Leave types served from Redis cache");

      return generateApiResponse(
        res,
        StatusCodes.OK,
        true,
        "Active leave types fetched successfully (cache)",
        { filteredData: { leaveType: JSON.parse(cachedData) } }
      );
    }

    // 2️⃣ Fetch from database if not in Redis
    console.log("Leave types served from database");
    const leaveType = await LeaveType.getActiveLeaveTypes().select("name daysAllowed");

    // 3️⃣ Store in Redis (set TTL of 10 minutes)
    await client.set(
      cacheKey,
      JSON.stringify(leaveType),
      { EX: 600 } // 600 seconds = 10 minutes
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Active leave types fetched successfully",
      { filteredData: { leaveType } }
    );
  }),


  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate(
      "leaveAllocation.leaveType"
    );
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Leave type fetched successfully",
      { leaves: employee.leaveAllocation }
    );
  }),
};

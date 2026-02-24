import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Department, ResetCode, User } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { client } from "../app.js";

export const departmentController = {
  createDepartment: asyncHandler(async (req, res) => {
    const { name, description, colorCode } = req.body;

    const department = await Department.create({
      name,
      description,
      colorCode,
    });

    if (!department) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Failed to create department"
      );
    }
    await client.del("departments:active");

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Department created successfully",
      { department }
    );
  }),

  updateDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, colorCode } = req.body;

    const updatedData = {
      name,
      description,
      colorCode,
    };

    const department = await Department.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    if (!department) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Department not found"
      );
    }
await client.del("departments:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Department updated successfully",
      department
    );
  }),

  getByFilterDepartment: asyncHandler(async (req, res) => {
    let whereStatement = {};
    let searchAttributes = ["name", "description"];

    const filteredData = await paginationFiltrationData(
      Department,
      req.query,
      "departments",
      searchAttributes,
      whereStatement
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Departments fetched successfully",
      { filteredData }
    );
  }),

  deleteDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Department not found"
      );
    }
await client.del("departments:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Department deleted successfully"
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const department = await Department.findById(id);

    if (!department) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Department id is missing or invalid"
      );
    }

    department.isActive = isActive;
    department.save();
await client.del("departments:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Status changes successfully",
      { department }
    );
  }),

  getAll: asyncHandler(async (req, res) => {
    const departments = await Department.find().populate({
      path: "subDepartments",
      select: "name",
    });
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Departments fetched successfully",
      { filteredData: { departments } }
    );
  }),

  getActiveDepartments: asyncHandler(async (req, res) => {
    const departments = await Department.getActiveDepartments();
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Departments fetched successfully",
      { filteredData: { departments } }
    );
  }),

  getActiveList: asyncHandler(async (req, res) => {
    const cacheKey = "departments:active";

    // 1️⃣ Check Redis first
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log("Serving from Redis Cache");
      return generateApiResponse(
        res,
        StatusCodes.OK,
        true,
        "Departments fetched successfully (cache)",
        { filteredData: { departments: JSON.parse(cachedData) } }
      );
    }

    // 2️⃣ Fetch from DB if not in Redis
    console.log("Serving from Database");
    const departments = await Department.getActiveDepartments()
      .populate({
        path: "subDepartments",
        select: "name"
      })
      .select("name subDepartments");

    // 3️⃣ Store in Redis
    await client.set(
      cacheKey,
      JSON.stringify(departments),
      {
        EX: 600 // 10 minutes
      }
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Departments fetched successfully",
      { filteredData: { departments } }
    );
  }),

};

import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import {
  Department,
  ResetCode,
  SubDepartment,
  User,
} from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";

export const subDepartmentsController = {
  createSubDepartment: asyncHandler(async (req, res) => {
    const { name, description, employee, department, isActive } = req.body;

    const subDepartment = await SubDepartment.create({
      name,
      description,
      employee,
      department,
      isActive,
    });

    if (!subDepartment) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Failed to create sub department"
      );
    }

    const findDepartment = await Department.findById({ _id: department });
    findDepartment.subDepartments.push(subDepartment?._id);
    findDepartment.save();

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Sub department created successfully",
      { subDepartment }
    );
  }),

  updateSubDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, employee, department, isActive } = req.body;

    const updatedData = {
      name,
      description,
      employee,
      department,
      isActive,
    };

    const subDepartment = await SubDepartment.findByIdAndUpdate(
      id,
      updatedData,
      { new: true }
    );

    if (!subDepartment) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Sub department not found"
      );
    }

    const findDepartment = await Department.findById(department);
    findDepartment.subDepartments.push(subDepartment?._id);
    findDepartment.save();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Sub department updated successfully",
      { subDepartment }
    );
  }),

  deleteSubDepartment: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const subDepartment = await SubDepartment.findByIdAndDelete(id);

    if (!subDepartment) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Sub department not found"
      );
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Sub department deleted successfully"
    );
  }),

  getByFilter: asyncHandler(async (req, res) => {
    const { departmentId } = req.query;

    let whereStatement = {};

    if (departmentId) {
      whereStatement.department = departmentId;
    }

    let searchAttributes = ["name", "description"];
    let populate = [{ path: "department" }];

    const filteredData = await paginationFiltrationData(
      SubDepartment,
      req.query,
      "subDepartments",
      searchAttributes,
      whereStatement,
      populate
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
    const subDepartments = await SubDepartment.find();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Sub Departments fetched successfully",
      { filteredData: { subDepartments } }
    );
  }),
};

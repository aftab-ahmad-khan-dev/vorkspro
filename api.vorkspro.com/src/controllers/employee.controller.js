// src/controllers/employeeController.js
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import {
  generateApiResponse,
  generateUsername,
} from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import {
  Attendance,
  Department,
  Employee,
  Salary,
  SalaryHistory,
  SubDepartment,
  User,
} from "../startup/models.js";

/** Protected super admin — never delete or deactivate. */
const SUPER_ADMIN_EMAIL = "admin@vorkspro.com";
import { tokenCreator } from "../services/token.service.js";
import { uploadASingleFile } from "../services/file.service2.js";

export const employeeController = {
  /* -------------------------------------------------------------
       CREATE EMPLOYEE
       ------------------------------------------------------------- */

  createEmployee: asyncHandler(async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,

      companyEmail,
      dateOfBirth,
      gender,
      maritalStatus,
      location,
      emergencyContact,
      employeeId,
      joinDate,
      department,
      subDepartment,
      jobTitle,
      employmentType,
      workLocation,
      reportingManager,
      probationPeriodInMonths,
      noticePeriod,
      baseSalary,
      allowances,
      leaveAllocation: leaveAllocationList,
      notes,
    } = req.body;

    const requiredFields = {
      email,
      joinDate,
      department,
      subDepartment,
      jobTitle,
      employmentType,
      workLocation,
      probationPeriodInMonths,
      noticePeriod,
      baseSalary,
    };

    if (!requiredFields) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Required fields are missing"
      );
    }

    const findUser = await User.findOne({
      email: email,
    });

    if (findUser) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "User already exists with this email"
      );
    }

    const username = generateUsername(firstName + lastName);

    const leaveAllocation = leaveAllocationList.map((leave) => {
      return {
        ...leave,
        remainingDays: leave?.totalDays,
      };
    });


    const employee = await Employee.create({
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phone: phone,
      companyEmail,
      dateOfBirth,
      gender,
      maritalStatus,
      location,
      emergencyContact,
      employeeId,
      joinDate,
      department,
      subDepartment,
      jobTitle,
      employmentType,
      workLocation,
      reportingManager: reportingManager ? reportingManager : null,
      probationPeriodInMonths,
      noticePeriod,
      baseSalary,
      allowances,
      leaveAllocation,
      notes,
    });

    const findDepartment = await Department.findById(department);
    findDepartment?.employees.push(employee?._id);
    await findDepartment?.save();

    const findSubDepartment = await SubDepartment.findById(subDepartment);
    findSubDepartment?.employees.push(employee?._id);
    await findSubDepartment?.save();

    const createdUser = await User.create({
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      phone: phone,
      password: password,
      role: role,
    });

    employee.user = createdUser._id;
    employee.save();

    await SalaryHistory.create({
      userId: createdUser?._id,
      date: joinDate || new Date(),
      newSalary: baseSalary,
      reason: "Initial salary at hiring",
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Employee created successfully",
      { employee }
    );
  }),

  /* -------------------------------------------------------------
       UPDATE EMPLOYEE
       ------------------------------------------------------------- */

  updateEmployee: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;
    const updatedData = req.body;

    const findEmployee = await Employee.findById(id);
    if (!findEmployee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    if (updatedData?.role && findEmployee.user) {
      await User.findByIdAndUpdate(
        findEmployee.user,
        { role: updatedData.role },
        { new: true }
      );
    }


    if (updatedData.leaveAllocation) {
      const findEmployee = await Employee.findById(id);
      if (!findEmployee) {
        return generateApiResponse(
          res,
          StatusCodes.NOT_FOUND,
          false,
          "Employee not found"
        );
      }


      if (!updatedData.reportingManager) {
        updatedData.reportingManager = null;
      }

      updatedData.leaveAllocation = updatedData.leaveAllocation.map((leave) => {
        let found = false;
        let updatedObject = {
          ...leave,
          remainingDays: leave.totalDays,
          utilizedDays: 0,
        };

        findEmployee.leaveAllocation.forEach((empLeave) => {
          if (
            leave.leaveType?._id?.toString() == empLeave.leaveType?.toString()
          ) {
            found = true;
            if (found) {
              updatedObject = {
                ...leave,
                remainingDays: leave.totalDays - empLeave.utilizedDays,
              };
            }
          }
        });

        return updatedObject;
      });
    }

    const employee = await Employee.findByIdAndUpdate(id, updatedData, {
      new: true,
    });


    const findDepartment = await Department.findById(updatedData?.department);
    findDepartment?.employees.push(employee?._id);
    await findDepartment?.save();

    const findSubDepartment = await SubDepartment.findById(updatedData?.subDepartment);
    findSubDepartment?.employees.push(employee?._id);
    await findSubDepartment?.save();

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee updated successfully",
      { employee }
    );
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const updatedData = req.body;

    const findEmployee = await Employee.findOne({user: userId});
    if (!findEmployee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    const employee = await Employee.findByIdAndUpdate(findEmployee._id, updatedData, {
      new: true,
    });
    if (updatedData.profilePicture !== undefined) {
      await User.findByIdAndUpdate(userId, { profilePicture: updatedData.profilePicture });
    }
    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    // create a token 
    const token = tokenCreator({ _id: userId, role: employee.role, employee: employee });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Profile updated successfully",
      { employee, token }
    )
  }),

  uploadProfilePhoto: asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const file = req.file;
    if (!file || !file.mimetype?.startsWith("image/")) {
      return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Valid image file required", null);
    }

    const findEmployee = await Employee.findOne({ user: userId });
    if (!findEmployee) {
      return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Employee not found", null);
    }

    const fileName = await uploadASingleFile(file, true, 200);
    if (!fileName) {
      return generateApiResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, false, "Upload failed", null);
    }

    const baseUrl = process.env.API_BASE_URL || `${req.protocol}://${req.get("host")}`;
    const profilePicture = `${baseUrl}/${fileName}`;

    await Employee.findByIdAndUpdate(findEmployee._id, { profilePicture });
    await User.findByIdAndUpdate(userId, { profilePicture });

    const employee = await Employee.findById(findEmployee._id).lean();
    const token = tokenCreator({ _id: userId, role: employee.role, employee });

    return generateApiResponse(res, StatusCodes.OK, true, "Profile photo updated", {
      profilePicture,
      employee,
      token,
    });
  }),

  /* -------------------------------------------------------------
       GET EMPLOYEE BY ID (with population)
       ------------------------------------------------------------- */
  getEmployeeById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id)
      .populate("user", "name email phone role")
      .populate("department", "name")
      .populate("subDepartment", "name")
      .populate("reportingManager", "name email")
      .populate("achievements", "-__v -createdAt -updatedAt -employee")
      .populate("leaveAllocation.leaveType", "name");

    const salaryHistory = await SalaryHistory.find({
      userId: employee?.user?._id,
    }).sort({ date: -1 });

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    const employeeTotalAttendance = await Attendance.find({ employee: id });
    const employeePresentAttendance = await Attendance.find({ employee: id, status: { $in: ["present", "late-arrival", "over-time"] } });
    const employeeAbsentAttendance = await Attendance.find({ employee: id, status: { $in: ["absent", "on-leave"] } });
    const attendanceRate = employeeTotalAttendance.length > 0 ? (employeePresentAttendance.length / employeeTotalAttendance.length) * 100 : 0;

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee fetched successfully",
      {
        employee, salaryHistory, attendanceStats: {
          totalDays: employeeTotalAttendance.length,
          presentDays: employeePresentAttendance.length,
          absentDays: employeeAbsentAttendance.length,
          attendanceRate: attendanceRate.toFixed(2) + '%'
        }
      }
    );
  }),

  getProfile: asyncHandler(async (req, res) => {
    const user = req.user?._id;
    const employeeDoc = await Employee.findOne({ user })
      .select("_id")
      .lean();
    if (!employeeDoc) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee information not found in session"
      );
    }
    const employeeId = employeeDoc._id;

    const employee = await Employee.findById(employeeId)
      .populate("user", "name email phone role")
      .populate("department", "name")
      .populate("subDepartment", "name")
      .populate("reportingManager", "name email")
      .populate("achievements", "-__v -createdAt -updatedAt -employee")
      .populate("leaveAllocation.leaveType", "name");

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee information not found in session"
      );
    }

    const salaryHistory = await SalaryHistory.find({
      userId: employee.user._id,
    }).sort({ date: -1 });

    const employeeTotalAttendance = await Attendance.find({ employee: employeeId });
    const employeePresentAttendance = await Attendance.find({ employee: employeeId, status: { $in: ["present", "late-arrival", "over-time"] } });
    const employeeAbsentAttendance = await Attendance.find({ employee: employeeId, status: { $in: ["absent", "on-leave"] } });
    const attendanceRate = employeeTotalAttendance.length > 0 ? (employeePresentAttendance.length / employeeTotalAttendance.length) * 100 : 0;

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee fetched successfully",
      {
        employee, salaryHistory, attendanceStats: {
          totalDays: employeeTotalAttendance.length,
          presentDays: employeePresentAttendance.length,
          absentDays: employeeAbsentAttendance.length,
          attendanceRate: attendanceRate.toFixed(2) + '%'
        }
      }
    );
  }),

  /* -------------------------------------------------------------
       LIST + FILTER + SEARCH + PAGINATION
       ------------------------------------------------------------- */
  getByFilterEmployee: asyncHandler(async (req, res) => {
    const { status, isActive, department } = req.query;

    let whereStatement = {};

    if (status) {
      if (status == "active") {
        Object.assign(whereStatement, {
          status: { $in: ["pending", "active"] },
          isDeleted: false,
        });
      } else if (status == "left") {
        Object.assign(whereStatement, {
          status: { $in: ["resigned", "terminated"] },
        });
      } else if (status == "delete") {
        whereStatement.isDeleted = true;
      }
    }
    let populate = [
      {
        path: "department",
        select: "name",
      },
      {
        path: "subDepartment",
        select: "name",
      },
      {
        path: "user",
      },
      {
        path: "leaveAllocation.leaveType",
      },
    ];
    const searchAttributes = ["employeeId", "jobTitle", "companyEmail"];

    if (isActive !== undefined) whereStatement.isActive = isActive === "true";
    if (department) whereStatement.department = department;

    const filteredData = await paginationFiltrationData(
      Employee,
      req.query,
      "employees",
      searchAttributes,
      whereStatement,
      populate
    );

    if (!filteredData) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employees not found"
      );
    }
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employees fetched successfully",
      filteredData,
      ["department", "subDepartment"]
    );
  }),

  /* -------------------------------------------------------------
       DELETE EMPLOYEE (hard delete – change to soft-delete if needed)
       ------------------------------------------------------------- */
  deleteEmployee: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id).populate("user", "email isSuperAdmin");

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee not found"
      );
    }

    const user = employee.user;
    if (user && (user.email === SUPER_ADMIN_EMAIL || user.isSuperAdmin === true)) {
      return generateApiResponse(
        res,
        StatusCodes.FORBIDDEN,
        false,
        "Cannot delete the super admin user"
      );
    }

    employee.isDeleted = true;
    employee.status = "deleted";
    await employee.save();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee deleted successfully"
    );
  }),

  /* -------------------------------------------------------------
       CHANGE EMPLOYEE STATUS
       ------------------------------------------------------------- */
  terminateEmployee: asyncHandler(async (req, res) => {
    const { id, date, status } = req.query;

    const employee = await Employee.findById(id).populate("user", "email isSuperAdmin");

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.CONFLICT,
        false,
        "Employee not found"
      );
    }

    const user = employee.user;
    if (user && (user.email === SUPER_ADMIN_EMAIL || user.isSuperAdmin === true)) {
      return generateApiResponse(
        res,
        StatusCodes.FORBIDDEN,
        false,
        "Cannot deactivate the super admin user"
      );
    }

    employee.status = status;
    employee.leaveDate = date;
    await employee.save();

    await User.findByIdAndUpdate(employee.user, { isActive: false });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee status updated successfully"
    );
  }),

  getEmployeeStats: asyncHandler(async (req, res) => {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({
      status: { $in: ["pending", "active"] },
    });
    const inactiveEmployees = await Employee.countDocuments({
      status: { $in: ["resigned", "terminated"] },
    });
    const archivedEmployees = await Employee.countDocuments({
      isDeleted: true,
    });
    const thisMonthJoined = await Employee.countDocuments({
      joinDate: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      },
      status: { $in: ["pending", "active"] },
    });

    const stats = {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      thisMonthJoined,
      archivedEmployees,
    };
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee stats fetched successfully",
      { stats }
    );
  }),

  getAllEmployees: asyncHandler(async (req, res) => {
    const employees = await Employee.find();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "All employees fetched successfully",
      { filteredData: { employees } }
    );
  }),

  restoreArchived: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const employee = await Employee.findById(id);

    employee.isDeleted = false;
    employee.status = "active";
    await employee.save();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee restored successfully"
    );
  }),

  getActiveEmployees: asyncHandler(async (req, res) => {
    const employees = await Employee.find({
      status: "active",
    })
      .select("_id firstName lastName")
      .lean();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Active employees fetched successfully",
      { filteredData: { employees } }
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, date } = req.body;

    const employee = await Employee.findById(id);

    if (!employee) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Employee id is missing or invalid"
      );
    }

    employee.status = status;
    employee.leaveDate = date;
    employee.save();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Employee status updated successfully",
      { employee }
    );
  }),

  getAttendanceEmployees: asyncHandler(async (req, res) => {
    const { date } = req.params;

    const attendance = await Attendance.find({
      date: {
        $gte: new Date(date),
        $lte: new Date(date),
      },
    });

    const attendedEmployees = attendance.map((a) => a.employee);

    const employees = await Employee.find({
      _id: { $nin: attendedEmployees },
      status: "active",
    }).select('firstName lastName email');

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Active employees fetched successfully",
      { employees }
    );
  }),
};

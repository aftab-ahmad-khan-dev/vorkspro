import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Client, Employee, Milestone, Project, Timeline, User } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { uploadMultipleFiles } from "../services/file.service2.js";
import { Blockage } from "../models/blockage.model.js";
import { Config } from "../models/config.model.js";

export const projectController = {
  createProject: asyncHandler(async (req, res) => {
    let {
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
      projectManager,
      teamMembers,
      project,
      tasks,
      milestones,
      documents,
      tags,
      budget,
      progress,
      client,
    } = req.body;

    // 🔥 Fix: convert empty string to null
    if (projectManager === "") projectManager = null;
    if (client === "") client = null;

    // 🔥 If teamMembers is array of strings, filter empty values
    if (Array.isArray(teamMembers)) {
      teamMembers = teamMembers.filter((id) => id !== "");
    }

    const newProject = new Project({
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
      projectManager,
      teamMembers,
      project,
      tasks,
      milestones,
      documents,
      tags,
      budget,
      progress,
      client,
    });

    const findClient = await Client.findById(client);
    if (findClient?.status === "lead") {
      findClient.status = "active";
      await findClient.save();
    }

    const savedProject = await newProject.save();

    const clientProject = await Client.findById(savedProject.client);

    clientProject.projects.push(savedProject._id);
    await clientProject.save();

    await Timeline.create({
      project: savedProject._id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Project add",
      value: `New project "${savedProject.name}" created with status: ${savedProject.status}`,
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Project created successfully",
      { project: savedProject }
    );
  }),

  getProjectsByFilter: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("role");
    if (!user) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "User not found"
      );
    }

    const { status, client, teamMembers, projectManager } = req.query;
    let whereStatement = { isDeleted: false };

    // -----------------------------
    // 🔐 ROLE BASED PROJECT FILTER
    // -----------------------------
    if (user.role?.name !== "Admin") {
      // find employee linked with current user
      const employee = await Employee.findOne({ user: userId }).select("_id");

      if (!employee) {
        return generateApiResponse(
          res,
          StatusCodes.OK,
          true,
          "No projects found",
          { filteredData: [] }
        );
      }

      whereStatement.$or = [
        { projectManager: employee._id },
        { teamMembers: employee._id },
      ];
    }

    // -----------------------------
    // 📌 NORMAL FILTERS
    // -----------------------------
    if (status && status !== "all") {
      whereStatement.status = status;
    }

    if (client && client !== "all") {
      whereStatement.client = client;
    }

    if (teamMembers && teamMembers !== "all") {
      whereStatement.teamMembers = teamMembers;
    }

    if (projectManager && projectManager !== "all") {
      whereStatement.projectManager = projectManager;
    }

    // -----------------------------
    // 📦 POPULATE CONFIG
    // -----------------------------
    const populate = [
      {
        path: "teamMembers",
        select: "firstName lastName email",
        populate: {
          path: "user",
          select: "firstName lastName email",
          populate: {
            path: "role",
            select: "name",
          },
        },
      },
      {
        path: "projectManager",
        select: "firstName lastName email",
      },
      {
        path: "client",
        select: "name email",
      },
    ];

    const searchAttributes = [
      "name",
      "description",
      "tags",
      "contactName",
      "email",
      "phone",
    ];

    const filteredData = await paginationFiltrationData(
      Project,
      req.query,
      "projects",
      searchAttributes,
      whereStatement,
      populate
    );

    // -----------------------------
    // 🔐 BUDGET/COST PERMISSION CHECK
    // -----------------------------
    const hasBudgetAccess = user.role?.cost === true;

    if (!hasBudgetAccess && filteredData.projects) {
      filteredData.projects = filteredData.projects.map(project => {
        const projectObj = project.toObject ? project.toObject() : project;
        delete projectObj.budget;
        delete projectObj.cost;
        return projectObj;
      });
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Projects fetched successfully",
      { filteredData }
    );
  }),


  getAssignedProjects: asyncHandler(async (req, res) => {
    const userId = req.params?.id;
    const currentUserId = req.user._id;

    const user = await User.findById(currentUserId).populate("role");
    const projects = await Project.find({
      teamMembers: userId,
    });

    // -----------------------------
    // 🔐 BUDGET/COST PERMISSION CHECK
    // -----------------------------
    const hasBudgetAccess = user?.role?.cost === true;

    let filteredProjects = projects;
    if (!hasBudgetAccess) {
      filteredProjects = projects.map(project => {
        const projectObj = project.toObject();
        delete projectObj.budget;
        delete projectObj.cost;
        return projectObj;
      });
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Projects fetched successfully",
      { filteredData: { projects: filteredProjects } }
    );
  }),

  getAllProjects: asyncHandler(async (req, res) => {
    const projects = await Project.find().select("name");

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Projects fetched successfully",
      { filteredData: { projects } }
    );
  }),

  updateProject: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      status,
      priority,
      projectManager,
      teamMembers,
      project,
      tasks,
      budget,
      milestones,
      documents,
      tags,
      progress,
      client,
    } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      {
        name,
        description,
        startDate,
        endDate,
        status,
        priority,
        projectManager,
        teamMembers,
        project,
        tasks,
        milestones,
        budget,
        documents,
        tags,
        progress,
        client,
      },
      { new: true }
    );

    const findClient = await Client.findById(client);
    if (findClient?.status === "lead") {
      findClient.status = "active";
      await findClient.save();
    }

    await Timeline.create({
      project: updatedProject._id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Project updated",
      value: `Project "${updatedProject.name}" details updated`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Project updated successfully",
      { project: updatedProject }
    );
  }),

  deleteProject: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Project id is required"
      );
    }

    await Timeline.create({
      project: id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Project deleted",
      value: "Project permanently deleted from system",
    });

    await Project.findByIdAndDelete(id);
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Project deleted successfully"
    );
  }),
  getProjectStats: asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).populate("role");
    if (!user) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "User not found"
      );
    }

    let matchStage = { isDeleted: false };

    // -----------------------------
    // 🔐 ROLE BASED FILTER
    // -----------------------------
    if (user.role?.name !== "Admin") {
      const employee = await Employee.findOne({ user: userId }).select("_id");

      if (!employee) {
        return generateApiResponse(
          res,
          StatusCodes.OK,
          true,
          "Stats fetched successfully",
          {
            stats: {
              totalProjects: 0,
              notstartedProjects: 0,
              inProgressProjects: 0,
              completedProjects: 0,
              onHoldProjects: 0,
              cancelledProjects: 0,
            },
          }
        );
      }

      matchStage.$or = [
        { projectManager: employee._id },
        { teamMembers: employee._id },
      ];
    }

    // -----------------------------
    // 📊 AGGREGATION
    // -----------------------------
    const result = await Project.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // -----------------------------
    // 🧮 FORMAT RESPONSE
    // -----------------------------
    const stats = {
      totalProjects: 0,
      notstartedProjects: 0,
      inProgressProjects: 0,
      completedProjects: 0,
      onHoldProjects: 0,
      cancelledProjects: 0,
    };

    result.forEach((item) => {
      stats.totalProjects += item.count;

      switch (item._id) {
        case "not started":
          stats.notstartedProjects = item.count;
          break;
        case "in progress":
          stats.inProgressProjects = item.count;
          break;
        case "completed":
          stats.completedProjects = item.count;
          break;
        case "on hold":
          stats.onHoldProjects = item.count;
          break;
        case "cancelled":
          stats.cancelledProjects = item.count;
          break;
      }
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Stats fetched successfully",
      { stats }
    );
  }),
  // getProjectStats: asyncHandler(async (req, res) => {
  //   const totalProjects = await Project.countDocuments();
  //   const plannedProjects = await Project.countDocuments({
  //     status: "planned",
  //   });
  //   const inProgressProjects = await Project.countDocuments({
  //     status: "in progress",
  //   });
  //   const completedProjects = await Project.countDocuments({
  //     status: "completed",
  //   });
  //   const onHoldProjects = await Project.countDocuments({
  //     status: "on hold",
  //   });
  //   const cancelledProjects = await Project.countDocuments({
  //     status: "cancelled",
  //   });

  //   const stats = {
  //     totalProjects,
  //     plannedProjects,
  //     inProgressProjects,
  //     completedProjects,
  //     onHoldProjects,
  //     cancelledProjects,
  //   };

  //   return generateApiResponse(
  //     res,
  //     StatusCodes.OK,
  //     true,
  //     "Stats fetched successfully",
  //     { stats }
  //   );
  // }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const project = await Project.findById(id).populate([
      { path: 'client' },
      { path: 'projectManager' },
      { path: 'milestones' },
      { path: 'blockages' },
      {
        path: 'teamMembers',
        select: 'firstName lastName email',
        populate: {
          path: 'subDepartment',
          select: 'name',
        },
      },
    ]);

    const timeLines = await Timeline.find({ project: id }).populate([
      { path: "user", select: "firstName lastName email" },
      { path: "employee", select: "firstName lastName" },
    ]);

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Project fetched successfully",
      { project, timeLines }
    );
  }),

  getInprogressProjects: asyncHandler(async (req, res) => {
    const projects = await Project.find({
      status: "in progress",
    }).select("name");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Projects fetched successfully",
      { filteredData: { projects } }
    );
  }),

  getInprogressandOnHoldProjects: asyncHandler(async (req, res) => {
    const projects = await Project.find({
      status: { $in: ["in progress", "on hold"] },
      isDeleted: false,
    })
      .populate({
        path: "milestones",
        select: "name",
      }).select("name");

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Projects fetched successfully",
      { filteredData: { projects } }
    );
  }),


  uploadDocuments: asyncHandler(async (req, res) => {
    const { id } = req.params;

    let { documents } = req.body;
    const files = req.files || [];

    if (!files.length) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "No files uploaded"
      );
    }

    // Parse safely (handles form-data JSON strings)
    const safeParse = (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return val;
        }
      }
      return val;
    };

    // Convert documents to array
    const docList = Array.isArray(documents)
      ? documents
      : safeParse(documents) || [];

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    // Upload files to your storage
    const uploadedUrls = await uploadMultipleFiles(files);

    // Map names → matching file index
    const finalDocs = docList.map((doc, i) => ({
      name: doc.name || files[i]?.originalname || `Document ${i + 1}`,
      url: uploadedUrls[i] || "",
    }));

    // Push documents inside project
    project.documents.push(...finalDocs);
    await project.save();

    await Timeline.create({
      project: id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Document Add",
      value: `${finalDocs.length} document(s) uploaded: ${finalDocs.map(doc => doc.name).join(', ')}`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Documents uploaded successfully",
      { project }
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project id is missing or invalid"
      );
    }

    project.status = status;;
    await project.save();

    await Timeline.create({
      project: id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Project status changed",
      value: `Project status updated to: ${status}`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Project status updated successfully",
      { project }
    );
  }),
  createBlockage: asyncHandler(async (req, res) => {
    let {
      title,
      description,
      project,
      milestone,
      type,
      severity,
      status,
      assignedTo,
      blockedBy,
      impact,
      notes,
      createdBy
    } = req.body;

    // 🔥 Fix: convert empty strings to null
    if (milestone === "") milestone = null;
    if (assignedTo === "") assignedTo = null;
    if (createdBy === "") createdBy = null;

    const newBlockage = new Blockage({
      title,
      description,
      impact,
      notes,
      project,
      milestone,
      type,
      severity,
      status,
      assignedTo,
      blockedBy,
      createdBy
    });

    const savedBlockage = await newBlockage.save();

    // 🔥 OPTIONAL: project ke andar blockage push karna
    const findProject = await Project.findById(project);
    if (findProject) {
      findProject.blockages.push(savedBlockage._id);
      await findProject.save();
    }

    await Timeline.create({
      project: savedBlockage.project,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Blockage Add",
      value: `New blockage "${savedBlockage.title}" created with severity: ${savedBlockage.severity}`,
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Blockage created successfully",
      { blockage: savedBlockage }
    );
  }),
  getBlockagesByProject: asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const queryProjectId = req.query.projectId;

    const finalProjectId = projectId || queryProjectId;

    if (!finalProjectId) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Project ID is required"
      );
    }

    const blockages = await Blockage.find({ project: finalProjectId })
      .populate([
        { path: "milestone", select: "name" },
        { path: "assignedTo", select: "firstName lastName email" },
      ])
      .sort({ createdAt: -1 });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      `${blockages.length} blockage(s) fetched successfully`,
      { blockages }
    );
  }),
  updateBlockage: asyncHandler(async (req, res) => {
    const { _id, status } = req.body;

    if (!_id) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Blockage ID (_id) is required"
      );
    }

    const blockage = await Blockage.findById(_id);

    if (!blockage) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Blockage not found"
      );
    }

    console.log(blockage.status)
    let oldStatus = blockage.status

    if (status) {
      blockage.status = status;
    }
    if (status === "resolved") {
      blockage.resolvedDate = new Date();
    }

    const updatedBlockage = await blockage.save();

    await updatedBlockage.populate([
      { path: "milestone", select: "name" },
      { path: "assignedTo", select: "firstName lastName email" },
    ]);

    await Timeline.create({
      project: updatedBlockage?.project,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Blockage Update",
      value: `Blockage status changed from ${oldStatus} to ${updatedBlockage.status}`
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Blockage updated successfully",
      { blockage: updatedBlockage }
    );
  }),
  getAllBlockages: asyncHandler(async (req, res) => {
    const blockages = await Blockage.find()
      .populate([
        { path: "project", select: "name code status" },
        { path: "milestone", select: "name" },
        { path: "assignedTo", select: "firstName lastName email" },
      ])
      .sort({ createdAt: -1 });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      `${blockages.length} blockage(s) fetched successfully`,
      { blockages }
    );
  }),

  addTeamMembers: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { teamMembers } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    project.teamMembers.push(...teamMembers);
    await project.save();

    await Timeline.create({
      project: id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Team Add",
      value: `${teamMembers.length} team member(s) added to project`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Team members added successfully",
      { project }
    );
  }),
  getBudgetBreakdown: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const [project, config] = await Promise.all([
      Project.findById(id).populate({
        path: 'teamMembers',
        populate: {
          path: 'department',
          select: 'name'
        },
        select: 'lastSalary department'
      }),
      Config.findOne().sort({ createdAt: -1 })
    ]);

    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    // ---- Duration ----
    const startDate = new Date(project.startDate);
    const endDate = new Date(project.endDate);
    const durationInDays = Math.ceil(
      (endDate - startDate) / (1000 * 60 * 60 * 24)
    );
    const durationInMonths = durationInDays / 30;

    // ---- Currency Rate ----
    const USD_RATE = config?.usdToPkrRate || 280; // PKR → USD

    const departmentExpenses = {};
    let totalExpensesUSD = 0;

    project.teamMembers.forEach(employee => {
      const departmentName = employee.department?.name || "Other";

      const monthlySalaryPKR = employee.lastSalary || 0;

      // ✅ Convert PKR → USD
      const monthlySalaryUSD = monthlySalaryPKR / USD_RATE;

      const employeeCostUSD = Math.round(
        monthlySalaryUSD * durationInMonths
      );

      if (!departmentExpenses[departmentName]) {
        departmentExpenses[departmentName] = {
          amount: 0,
          employeeCount: 0
        };
      }

      departmentExpenses[departmentName].amount += employeeCostUSD;
      departmentExpenses[departmentName].employeeCount += 1;

      totalExpensesUSD += employeeCostUSD;
    });

    // ---- Budget already in USD ----
    const totalBudgetUSD = project.budget || 0;
    const profitUSD = Math.round(totalBudgetUSD - totalExpensesUSD);

    const budgetData = {
      totalBudget: Math.round(totalBudgetUSD),
      totalExpenses: Math.round(totalExpensesUSD),
      profit: profitUSD,
      departments: Object.keys(departmentExpenses),
      departmentExpenses,
      projectDuration: durationInDays,
      teamMembersCount: project.teamMembers.length
    };

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Budget breakdown fetched successfully",
      budgetData
    );
  }),
  changeIndex: asyncHandler(async (req, res) => {
    const { id } = req.params; // milestone ID
    const { projectId } = req.query; // project ID from query
    const { fromIndex, toIndex } = req.body;

    // Get all milestones for this project
    const milestones = await Milestone.find({ project: projectId });

    if (!milestones.length) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "No milestones found for this project"
      );
    }

    // Find the milestone being moved
    const draggedMilestone = milestones.find(m => m._id.toString() === id);

    if (!draggedMilestone) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Milestone not found"
      );
    }

    // Find the milestone at the target position
    const targetMilestone = milestones.find(m => m.sortIndex === toIndex);

    if (targetMilestone) {
      // Swap sortIndex values
      const tempIndex = draggedMilestone.sortIndex;
      draggedMilestone.sortIndex = targetMilestone.sortIndex;
      targetMilestone.sortIndex = tempIndex;

      // Save both milestones
      await draggedMilestone.save();
      await targetMilestone.save();
    } else {
      // If no milestone at target position, just update the dragged milestone
      draggedMilestone.sortIndex = toIndex;
      await draggedMilestone.save();
    }

    await Timeline.create({
      project: projectId,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Milestone index changed",
      value: `Milestone "${draggedMilestone.name}" moved from position ${fromIndex} to ${toIndex}`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      `Milestone moved from position ${fromIndex} to ${toIndex}`,
      { milestone: draggedMilestone }
    );
  }),
};

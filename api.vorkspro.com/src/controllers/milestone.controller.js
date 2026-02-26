import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { Employee, Milestone, Project, Timeline, User } from "../startup/models.js";

export const milestoneController = {
  create: asyncHandler(async (req, res) => {
    const {
      name,
      description,
      startDate,
      endDate,
      task,
      // dependencies,
      notes,
      cost,
      project,
    } = req.body;

    if (!name || !startDate || !endDate || !project) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Missing required fields"
      );
    }

    const milestone = await Milestone.create({
      name,
      description,
      startDate,
      endDate,
      task,
      // dependencies,
      notes,
      cost,
      project,
    });

    const projectMilestone = await Project.findById(project);
    projectMilestone.milestones.push(milestone._id);
    await projectMilestone.save();

    await Timeline.create({
      project: milestone.project,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Milestone Added",
      value: milestone.name,
      milestone: milestone._id,
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Milestone created successfully",
      { milestone }
    );
  }),

  getByFilter: asyncHandler(async (req, res) => {
    const { status, project, projectId, page = 1, size = 12, search } = req.query;
    const userId = req.user._id;

    const user = await User.findById(userId).populate("role");

    let whereStatement = {};
    if (status) whereStatement.status = status;
    if (project) whereStatement.project = project;
    if (projectId) whereStatement.project = projectId;

    let searchAttributes = ["name", "description"];
    let populate = [{ path: "project", select: "name" }];

    let filteredData = await paginationFiltrationData(
      Milestone,
      { ...req.query, page, size, search },
      "milestones",
      searchAttributes,
      whereStatement,
      populate
    );

    // Sort milestones by priority (overdue first, then by status)
    if (filteredData.milestones) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filteredData.milestones.sort((a, b) => {
        const aIsOverdue = a.status !== "completed" && a.endDate && new Date(a.endDate) < today;
        const bIsOverdue = b.status !== "completed" && b.endDate && new Date(b.endDate) < today;

        const getOrder = (m, isOverdue) => {
          if (isOverdue) return 1;
          if (m.status === "in progress") return 2;
          if (m.status === "not started") return 3;
          if (m.status === "completed") return 4;
          return 5;
        };

        return getOrder(a, aIsOverdue) - getOrder(b, bIsOverdue);
      });
    }

    // -----------------------------
    // 🔐 COST PERMISSION CHECK
    // -----------------------------
    const hasCostAccess = user?.role?.cost === true;

    if (!hasCostAccess && filteredData.milestones) {
      filteredData.milestones = filteredData.milestones.map(milestone => {
        const milestoneObj = milestone.toObject ? milestone.toObject() : milestone;
        delete milestoneObj.cost;
        return milestoneObj;
      });
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone fetched successfully",
      {
        filteredData: {
          milestones: filteredData.milestones,
          totalCount: filteredData.pagination.totalItems,
          totalPages: filteredData.pagination.totalPages,
          currentPage: filteredData.pagination.page,
          pageSize: filteredData.pagination.size
        }
      }
    );
  }),

  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const milestone = await Milestone.findById({ _id: id }).populate({
      path: "project",
      select: "name description status priority projectManager teamMembers cost client milestone",
      populate: [
        { path: "projectManager", select: "firstName lastName email" },
        { path: "teamMembers", select: "firstName lastName email" },
        { path: "client", select: "name type companySize website email phone address status " },
      ],
    });

    if (!milestone) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Milestone not found"
      );
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone fetched successfully",
      { milestone }
    );
  }),

  getAll: asyncHandler(async (req, res) => {
    const milestones = await Milestone.find().populate({
      path: "project",
      select: "name",
    });

    if (!milestones) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Milestones not found"
      );
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone fetched successfully",
      { milestones }
    );
  }),

  // getStats: asyncHandler(async (req, res) => {
  //   const totalMilestones = await Milestone.countDocuments();
  //   const onTrackMilestones = await Milestone.countDocuments({
  //     status: "on track",
  //   });
  //   const completedMilestones = await Milestone.countDocuments({
  //     status: "completed",
  //   });
  //   const atRiskMilestones = await Milestone.countDocuments({
  //     status: "at risk",
  //   });

  //   const stats = {
  //     totalMilestones,
  //     onTrackMilestones,
  //     completedMilestones,
  //     atRiskMilestones,
  //   };
  //   return generateApiResponse(
  //     res,
  //     StatusCodes.OK,
  //     true,
  //     "Employee stats fetched successfully",
  //     { stats }
  //   );
  // }),
  getStats: asyncHandler(async (req, res) => {
    const [
      totalMilestones,
      notStarted,
      inProgress,
      completed,
      delayed,
    ] = await Promise.all([
      Milestone.countDocuments(),
      Milestone.countDocuments({ status: "not started" }),
      Milestone.countDocuments({ status: "in progress" }),
      Milestone.countDocuments({ status: "completed" }),
      Milestone.countDocuments({ status: "delayed" }),
    ]);

    const stats = {
      totalMilestones,
      notStarted,
      inProgress,
      completed,
      delayed,
    };

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone stats fetched successfully",
      { stats }
    );
  }),

  update: asyncHandler(async (req, res) => {
    const milestoneId = req.params.id;

    const {
      name,
      status,
      description,
      startDate,
      endDate,
      task,
      // dependencies,
      notes,
      cost,
      project,
    } = req.body;

    const milestone = await Milestone.findByIdAndUpdate(
      milestoneId,
      {
        status,
        name,
        description,
        startDate,
        endDate,
        task,
        // dependencies,
        notes,
        cost,
        project,
      },
      { new: true }
    );

    await Timeline.create({
      project: milestone.project,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Milestone updated",
      value: milestone.name,
      milestone: milestone._id,
    })

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone updated successfully",
      { milestone }
    );
  }),

  delete: asyncHandler(async (req, res) => {
    const id = req.params.id;

    const milestone = await Milestone.findByIdAndDelete({ _id: id });

    await Timeline.create({
      project: milestone.project,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Milestone deleted",
      value: milestone.name,
      milestone: milestone._id,
    })

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone deleted successfully",
      { milestone }
    );
  }),

  getMilestoneByProject: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const milestones = await Milestone.find({ project: id }).select("name description startDate endDate cost");

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone fetched successfully",
      { milestones }
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const milestone = await Milestone.findById(id);

    if (!milestone) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Milestone id is missing or invalid"
      );
    }

    milestone.status = status;
    milestone.save();

    const totalMilestones = await Milestone.countDocuments({
      project: milestone.project,
    });

    const completedMilestones = await Milestone.countDocuments({
      project: milestone.project,
      status: "completed",
    });

    const progress =
      totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;

    await Project.findByIdAndUpdate(milestone.project, {
      progress,
    });
    const employee = await Employee.findOne({ user: req.user._id });

    await Timeline.create({
      project: milestone.project,
      employee: employee?._id,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Milestone status changed",
      value: milestone.status,
      milestone: milestone._id,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Status changes successfully",
      { status: milestone.status }
    );
  }),

  getMilestoneByDate: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const milestones = await Milestone.find({
      endDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate({ path: "project", select: "name" }).select("name project startDate endDate status");

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Milestone fetched successfully",
      { milestones }
    );
  }),
};

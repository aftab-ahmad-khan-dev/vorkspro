import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { WorkType } from "../models/workType.model.js";
import { AutomationRule } from "../models/automationRule.model.js";
import { StatusCategory } from "../models/statusCategory.model.js";
import { Project } from "../startup/models.js";

export const automationController = {
  getWorkTypes: asyncHandler(async (_req, res) => {
    const workTypes = await WorkType.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    return generateApiResponse(res, StatusCodes.OK, true, "Work types fetched", {
      workTypes,
    });
  }),

  getAllWorkTypes: asyncHandler(async (_req, res) => {
    const workTypes = await WorkType.find().sort({ sortOrder: 1, name: 1 }).lean();
    return generateApiResponse(res, StatusCodes.OK, true, "Work types fetched", {
      workTypes,
    });
  }),

  createWorkType: asyncHandler(async (req, res) => {
    const { name, description, sortOrder } = req.body;
    const existing = await WorkType.findOne({ name: name?.trim() });
    if (existing) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Work type with this name already exists",
        null
      );
    }
    const workType = await WorkType.create({
      name: name?.trim(),
      description,
      sortOrder: sortOrder ?? 0,
    });
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Work type created",
      { workType }
    );
  }),

  updateWorkType: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, isActive, sortOrder } = req.body;
    const workType = await WorkType.findByIdAndUpdate(
      id,
      { name: name?.trim(), description, isActive, sortOrder },
      { new: true }
    );
    if (!workType) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Work type not found",
        null
      );
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Work type updated", {
      workType,
    });
  }),

  deleteWorkType: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const workType = await WorkType.findByIdAndDelete(id);
    if (!workType) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Work type not found",
        null
      );
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Work type deleted");
  }),

  getRules: asyncHandler(async (_req, res) => {
    const rules = await AutomationRule.find()
      .populate("workType", "name")
      .populate("additionalNotify", "firstName lastName email")
      .sort({ entityType: 1, triggerStatus: 1 })
      .lean();
    return generateApiResponse(res, StatusCodes.OK, true, "Rules fetched", {
      rules,
    });
  }),

  createRule: asyncHandler(async (req, res) => {
    const { workType, entityType, triggerStatus, notifyAssignee, additionalNotify, name } =
      req.body;
    if (!entityType || !triggerStatus) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "entityType and triggerStatus are required",
        null
      );
    }
    const rule = await AutomationRule.create({
      workType: workType || null,
      entityType,
      triggerStatus: triggerStatus.trim(),
      notifyAssignee: notifyAssignee !== false,
      additionalNotify: Array.isArray(additionalNotify) ? additionalNotify : [],
      name: name?.trim(),
    });
    const populated = await AutomationRule.findById(rule._id)
      .populate("workType", "name")
      .populate("additionalNotify", "firstName lastName email")
      .lean();
    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Rule created",
      { rule: populated }
    );
  }),

  updateRule: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { workType, entityType, triggerStatus, notifyAssignee, additionalNotify, isActive, name } =
      req.body;
    const updateData = {};
    if (workType !== undefined) updateData.workType = workType || null;
    if (entityType !== undefined) updateData.entityType = entityType;
    if (triggerStatus !== undefined) updateData.triggerStatus = triggerStatus.trim();
    if (notifyAssignee !== undefined) updateData.notifyAssignee = notifyAssignee;
    if (additionalNotify !== undefined)
      updateData.additionalNotify = Array.isArray(additionalNotify) ? additionalNotify : [];
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name?.trim();

    const rule = await AutomationRule.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate("workType", "name")
      .populate("additionalNotify", "firstName lastName email")
      .lean();

    if (!rule) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Rule not found",
        null
      );
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Rule updated", {
      rule,
    });
  }),

  deleteRule: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const rule = await AutomationRule.findByIdAndDelete(id);
    if (!rule) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Rule not found",
        null
      );
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Rule deleted");
  }),

  getEntityStatuses: asyncHandler(async (_req, res) => {
    const categories = await StatusCategory.find({ isActive: true })
      .sort({ sortOrder: 1 })
      .lean();
    const flat = { task: [], blockage: [], milestone: [] };
    if (categories.length) {
      categories.forEach((c) => {
        const entities = c.entityTypes?.length ? c.entityTypes : ["task", "milestone", "blockage"];
        entities.forEach((e) => {
          (c.subStatuses || []).forEach((s) => {
            if (!flat[e].includes(s)) flat[e].push(s);
          });
        });
      });
    }
    const defaultFlat = {
      task: ["to do", "in progress", "in review", "completed", "on hold", "cancelled", "not started", "waiting for client", "working", "testing", "delivered", "deployed", "client requirement", "need to start", "need design", "need deployment"],
      blockage: ["in-progress", "resolved", "closed", "not started", "waiting for client", "working", "testing", "delivered", "deployed", "completed", "client requirement", "need to start", "need design", "need deployment"],
      milestone: ["not started", "in progress", "completed", "delayed", "waiting for client", "working", "testing", "delivered", "deployed", "client requirement", "need to start", "need design", "need deployment"],
    };
    const statuses = Object.keys(defaultFlat).reduce((acc, k) => {
      acc[k] = [...new Set([...(flat[k] || []), ...defaultFlat[k]])];
      return acc;
    }, {});
    return generateApiResponse(res, StatusCodes.OK, true, "Statuses fetched", {
      statuses,
      categories: categories.length ? categories : [
        { name: "Pending", subStatuses: ["not started", "waiting for client", "need to start", "need design"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 1 },
        { name: "In Progress", subStatuses: ["in progress", "working", "testing", "in-progress", "need deployment"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 2 },
        { name: "Done", subStatuses: ["completed", "delivered", "deployed", "resolved", "closed"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 3 },
        { name: "Blockage", subStatuses: ["client requirement"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 4 },
      ],
    });
  }),

  getProjectsWithActions: asyncHandler(async (req, res) => {
    const { User, Employee } = await import("../startup/models.js");
    const userId = req.user._id;
    const user = await User.findById(userId).populate("role").lean();
    let whereStatement = { isDeleted: false };
    if (user?.role?.name !== "Admin") {
      const employee = await Employee.findOne({ user: userId }).select("_id").lean();
      if (!employee) {
        return generateApiResponse(res, StatusCodes.OK, true, "Projects fetched", {
          projects: [],
          rules: [],
        });
      }
      whereStatement.$or = [
        { projectManager: employee._id },
        { teamMembers: employee._id },
      ];
    }
    const projects = await Project.find(whereStatement)
      .select("name status milestones blockages _id")
      .populate("blockages", "title status assignedTo")
      .populate("milestones", "name status")
      .lean();
    const rules = await AutomationRule.find({ isActive: true })
      .populate("workType", "name")
      .lean();
    return generateApiResponse(res, StatusCodes.OK, true, "Projects with actions fetched", {
      projects,
      rules,
    });
  }),

  getStatusCategories: asyncHandler(async (_req, res) => {
    let categories = await StatusCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    if (!categories.length) {
      const defaults = [
        { name: "Pending", subStatuses: ["not started", "waiting for client", "need to start", "need design"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 1 },
        { name: "In Progress", subStatuses: ["in progress", "working", "testing", "in-progress", "need deployment"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 2 },
        { name: "Done", subStatuses: ["completed", "delivered", "deployed", "resolved", "closed"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 3 },
        { name: "Blockage", subStatuses: ["client requirement"], entityTypes: ["task", "milestone", "blockage"], sortOrder: 4 },
      ];
      await StatusCategory.insertMany(defaults);
      categories = await StatusCategory.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Status categories fetched", { categories });
  }),

  createStatusCategory: asyncHandler(async (req, res) => {
    const { name, subStatuses, entityTypes, sortOrder } = req.body;
    const category = await StatusCategory.create({
      name: name?.trim(),
      subStatuses: Array.isArray(subStatuses) ? subStatuses : [],
      entityTypes: Array.isArray(entityTypes) ? entityTypes : ["task", "milestone", "blockage"],
      sortOrder: sortOrder ?? 0,
    });
    return generateApiResponse(res, StatusCodes.CREATED, true, "Status category created", { category });
  }),

  updateStatusCategory: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, subStatuses, entityTypes, sortOrder, isActive } = req.body;
    const category = await StatusCategory.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name: name?.trim() }),
        ...(subStatuses !== undefined && { subStatuses: Array.isArray(subStatuses) ? subStatuses : [] }),
        ...(entityTypes !== undefined && { entityTypes: Array.isArray(entityTypes) ? entityTypes : [] }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );
    if (!category) {
      return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Status category not found", null);
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Status category updated", { category });
  }),

  deleteStatusCategory: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const category = await StatusCategory.findByIdAndDelete(id);
    if (!category) {
      return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Status category not found", null);
    }
    return generateApiResponse(res, StatusCodes.OK, true, "Status category deleted");
  }),
};

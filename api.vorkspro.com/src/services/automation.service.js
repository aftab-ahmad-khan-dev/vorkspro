/**
 * Sends Socket.IO notifications when work status changes, based on AutomationRule config.
 */
import { AutomationRule } from "../models/automationRule.model.js";
import Employee from "../models/employee.model.js";
import { sendNotification } from "./notify.service.js";

/**
 * Get user IDs to notify for a given entity (task/blockage/milestone).
 * @param {Object} entity - The entity (blockage, task, milestone)
 * @param {string} entityType - "task" | "blockage" | "milestone"
 * @param {string} newStatus - The status that triggered the rule
 * @param {Object} rule - AutomationRule document
 * @returns {string[]} - Array of User IDs to notify
 */
async function getNotifyUserIds(entity, entityType, rule) {
  const userIds = new Set();

  if (rule.notifyAssignee) {
    if (entityType === "blockage" && entity.assignedTo) {
      const emp = await Employee.findById(entity.assignedTo).select("user").lean();
      if (emp?.user) userIds.add(emp.user.toString());
    }
    if (entityType === "task" && entity.assignedTo?.length) {
      entity.assignedTo.forEach((uid) => userIds.add(uid.toString()));
    }
    if (entityType === "milestone" && entity.project) {
      const Project = (await import("../startup/models.js")).Project;
      const project = await Project.findById(entity.project)
        .populate("projectManager", "user")
        .populate("teamMembers", "user")
        .lean();
      if (project?.projectManager?.user) userIds.add(project.projectManager.user.toString());
      (project?.teamMembers || []).forEach((m) => {
        if (m?.user) userIds.add(m.user.toString());
      });
    }
  }

  if (rule.additionalNotify?.length) {
    for (const empId of rule.additionalNotify) {
      const emp = await Employee.findById(empId).select("user").lean();
      if (emp?.user) userIds.add(emp.user.toString());
    }
  }

  return [...userIds];
}

/**
 * Match entity workType with rule workType. If rule has no workType, it applies to all.
 */
function matchesWorkType(entityWorkTypeId, ruleWorkTypeId) {
  if (!ruleWorkTypeId) return true;
  if (!entityWorkTypeId) return false;
  return entityWorkTypeId.toString() === ruleWorkTypeId.toString();
}

/**
 * Send status-change notifications based on automation rules.
 * @param {Object} opts
 * @param {string} opts.entityType - "task" | "blockage" | "milestone"
 * @param {Object} opts.entity - The entity doc (with assignee, workType, etc.)
 * @param {string} opts.oldStatus
 * @param {string} opts.newStatus
 * @param {string} opts.title - Entity title for notification
 */
export async function sendAutomationNotifications({
  entityType,
  entity,
  oldStatus,
  newStatus,
  title = "Work update",
}) {
  if (oldStatus === newStatus) return;

  const rules = await AutomationRule.find({
    isActive: true,
    entityType,
    triggerStatus: newStatus,
  })
    .populate("workType", "name")
    .lean();

  if (!rules.length) return;

  const entityWorkTypeId = entity.workType?._id || entity.workType;

  for (const rule of rules) {
    if (!matchesWorkType(entityWorkTypeId, rule.workType?._id || rule.workType)) continue;

    const userIds = await getNotifyUserIds(entity, entityType, rule);
    if (!userIds.length) continue;

    const workTypeName = rule.workType?.name || "";
    const body = workTypeName
      ? `${title} (${workTypeName}) changed to "${newStatus}".`
      : `${title} changed to "${newStatus}".`;

    const url = entityType === "blockage" ? "/app/blockages" : entityType === "milestone" ? "/app/milestones" : "/app/projects";
    for (const userId of userIds) {
      await sendNotification("automation-status", body, {
        userId,
        title: "Work Status Update",
        tag: `automation-${entityType}-${entity._id}`,
        url,
        entityType,
        entityId: entity._id?.toString(),
        newStatus,
      });
    }
  }
}

/**
 * Notify assignee when work is assigned to them.
 */
export async function sendAssignmentNotification(entityType, entity, title) {
  let userId = null;
  if (entityType === "blockage" && entity.assignedTo) {
    if (typeof entity.assignedTo === "object" && entity.assignedTo.user) {
      userId = entity.assignedTo.user.toString?.() || entity.assignedTo.user;
    } else {
      const emp = await Employee.findById(entity.assignedTo).select("user").lean();
      userId = emp?.user?.toString?.();
    }
  }
  if (!userId) return;

  const body = `You have been assigned: ${title}`;
  const url = entityType === "blockage" ? "/app/blockages" : "/app/projects";
  await sendNotification("assignment", body, {
    userId,
    title: "Work Assigned",
    tag: `assignment-${entityType}-${entity._id}`,
    url,
    entityType,
    entityId: entity._id?.toString(),
  });
}

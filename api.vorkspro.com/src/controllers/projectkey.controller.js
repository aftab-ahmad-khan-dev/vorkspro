// controllers/projectkey.controller.js
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Project, Timeline } from "../startup/models.js";

const projectKeyController = {
  createProjectKey: asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;
    const {
      name,
      environment,
      keyType,
      keyValue,
      description = "",
      tags = [],
    } = req.body;

    if (!name || !environment || !keyType) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Name, environment, keyType and keyValue are required"
      );
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    const newKey = {
      name,
      environment,
      keyType,
      keyValue: keyValue.trim(),
      description,
      tags,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    project.credentials.push(newKey);
    await project.save();

    await Timeline.create({
      project: projectId,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Credential Add",
      value: `New ${keyType} credential "${name}" added for ${environment} environment`,
    });

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Credential added successfully",
      { newKey }
    );
  }),

  getProjectKeys: asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;

    const project = await Project.findById(projectId).select("credentials");
    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Credentials fetched successfully",
      { credentials: project.projectKeys }
    );
  }),

  updateProjectKey: asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;
    const {
      _id: keyId,
      name,
      environment,
      keyType,
      keyValue,
      description = "",
      tags = [],
    } = req.body;

    // -------------------------------
    // 1. Validate project
    // -------------------------------
    const project = await Project.findById(projectId);
    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    // -------------------------------
    // 2. Find credential by keyId
    // -------------------------------
    const keyIndex = project.credentials.findIndex(
      (k) => k._id.toString() === keyId
    );

    if (keyIndex === -1) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Credential not found"
      );
    }

    // -------------------------------
    // 3. Update fields safely
    // -------------------------------
    const allowedFields = {
      name,
      environment,
      keyType,
      keyValue,
      description,
      tags,
    };

    for (const field in allowedFields) {
      if (allowedFields[field] !== undefined) {
        project.credentials[keyIndex][field] = allowedFields[field];
      }
    }

    project.credentials[keyIndex].updatedAt = new Date();

    await project.save();

    await Timeline.create({
      project: projectId,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Credential Update",
      value: `Credential "${project.credentials[keyIndex].name}" updated for ${project.credentials[keyIndex].environment} environment`,
    });

    // -------------------------------
    // 4. Return updated credential
    // -------------------------------
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Credential updated successfully",
      { credential: project.credentials[keyIndex] }
    );
  }),

  deleteProjectKey: asyncHandler(async (req, res) => {
    const { id: projectId } = req.params;
    const { credentialId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Project not found"
      );
    }

    const keyIndex = project.credentials.findIndex(
      (k) => k._id.toString() === credentialId._id
    );
    if (keyIndex === -1) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Credential not found"
      );
    }

    const deletedCredential = project.credentials[keyIndex];
    project.credentials.splice(keyIndex, 1);
    await project.save();

    await Timeline.create({
      project: projectId,
      user: req.user._id,
      date: new Date(),
      time: new Date().toLocaleTimeString(),
      key: "Credential Delete",
      value: `Credential "${deletedCredential.name}" deleted from ${deletedCredential.environment} environment`,
    });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Credential deleted successfully"
    );
  }),
};

export default projectKeyController;

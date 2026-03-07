import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Client, Followup, Project } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { uploadMultipleFiles } from "../services/file.service2.js";

export const clientController = {
  createClient: asyncHandler(async (req, res) => {
    const {
      name,
      type,
      industry,
      companySize,
      website,
      description,
      contactName,
      email,
      phone,
      address,
      // projects,
      tags,
      notes,
      status,
      // FIX: Use newDocuments (same as update)
      newDocuments,
    } = req.body;

    const files = req.files || [];

    // ── Safe parse ─────────────────────────────────────
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

    // FIX: Read from newDocuments
    const docList = Array.isArray(newDocuments)
      ? newDocuments
      : safeParse(newDocuments) || [];

    // ── Upload files ───────────────────────────────────
    const uploadedUrls =
      files.length > 0 ? await uploadMultipleFiles(files) : [];

    // ── Map uploaded files to documents ───────────────
    const finalDocuments = docList.map((doc, i) => {
      const uploadedUrl = uploadedUrls[i];
      return {
        name: doc.name || `Document ${i + 1}`,
        url: uploadedUrl || "",
      };
    });

    // ── Parse address ──────────────────────────────────
    const parsedAddress =
      typeof address === "string" ? safeParse(address) : address || {};

    // ── Build client data ──────────────────────────────
    const clientData = {
      name: name || "",
      type: type || "company",
      industry: industry || null,
      companySize: companySize || "",
      website: website || "",
      description: description || "",
      contactName: contactName || "",
      email: email || "",
      phone: phone || "",
      address: parsedAddress,
      // projects: Array.isArray(projects)
      //   ? projects.filter(Boolean)
      //   : projects
      //   ? [projects]
      //   : [],
      documents: finalDocuments,
      tags: tags
        ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : [],
      notes: notes || "",
      status: status || "lead",
    };

    // ── Save ───────────────────────────────────────────
    const newClient = new Client(clientData);
    const savedClient = await newClient.save();

    return generateApiResponse(
      res,
      StatusCodes.CREATED,
      true,
      "Client created successfully",
      { client: savedClient }
    );
  }),

  updateClient: asyncHandler(async (req, res) => {
    const clientId = req.params.id;
    const files = req.files;

    const {
      name,
      type,
      industry,
      companySize,
      website,
      description,
      contactName,
      email,
      phone,
      address,
      // projects,
      tags,
      notes,
      status,
      newDocuments,
      existingDocuments,
      deletedDocumentIds,
    } = req.body;

    // ── Safe JSON parse ─────────────────────────────────────
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

    const newDocs = Array.isArray(newDocuments)
      ? newDocuments
      : safeParse(newDocuments) || [];
    const existingDocs = Array.isArray(existingDocuments)
      ? existingDocuments
      : safeParse(existingDocuments) || [];
    const deletedIds = Array.isArray(deletedDocumentIds)
      ? deletedDocumentIds
      : safeParse(deletedDocumentIds) || [];

    const parsedAddress =
      typeof address === "string" ? safeParse(address) : address;

    // ── Upload new files ────────────────────────────────────
    const uploadedFiles = files ? await uploadMultipleFiles(files) : [];

    // ── Build final documents array (kept + new) ─────────────
    const finalDocuments = [];

    // 1. Kept existing docs
    existingDocs.forEach((doc) => {
      if (doc.id || doc._id) {
        finalDocuments.push({
          _id: doc.id || doc._id,
          name: doc.name || "",
          url: doc.url || "",
        });
      }
    });

    // 2. New uploaded docs
    newDocs.forEach((doc, i) => {
      const url = uploadedFiles[i];
      if (url && doc.name) {
        finalDocuments.push({ name: doc.name, url });
      }
    });

    // ── Update data (without documents yet) ─────────────────
    const updateData = {
      name: name || "",
      type: type || "individual",
      industry: industry || null,
      companySize: companySize || "",
      website: website || "",
      description: description || "",
      contactName: contactName || "",
      email: email || "",
      phone: phone || "",
      address: parsedAddress || {},
      // projects: Array.isArray(projects)
      //   ? projects.filter(Boolean)
      //   : projects
      //   ? [projects]
      //   : [],
      tags: tags
        ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
        : [],
      notes: notes || "",
      status: status || "lead",
    };

    // ── 1. Pull deleted docs (if any) ───────────────────────
    if (deletedIds.length > 0) {
      await Client.updateOne(
        { _id: clientId },
        { $pull: { documents: { _id: { $in: deletedIds } } } }
      );
    }

    // ── 2. Set full data including final documents ──────────
    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { $set: { ...updateData, documents: finalDocuments } },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedClient) {
      return res.status(StatusCodes.NOT_FOUND).json({
        isSuccess: false,
        message: "Client not found",
      });
    }

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Client updated successfully",
      { client: updatedClient }
    );
  }),

  updateClientStatus: asyncHandler(async (req, res) => {
    const clientId = req.params.id;
    const { status } = req.body;

    const updatedClient = await Client.findByIdAndUpdate(
      clientId,
      { status },
      { new: true }
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Client status updated successfully",
      { client: updatedClient }
    );
  }),

  getClientById: asyncHandler(async (req, res) => {
    const clientId = req.params.id;

    const client = await Client.findById(clientId)
      .populate("industry", "name sector description colorCode")
      .populate({
        path: "projects",
        populate: [
          {
            path: "projectManager",
            select: "firstName lastName email"
          },
          {
            path: "teamMembers",
            select: "firstName lastName email"
          }
        ]
      });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Client fetched successfully",
      { client }
    );
  }),

  getClientsByFilter: asyncHandler(async (req, res) => {
    const { status } = req.query;
    let whereStatement = {};

    if (status) {
      whereStatement.status = status;
    }
    let searchAttributes = [
      "name",
      "description",
      "tags",
      "contactName",
      "email",
      "phone",
    ];
    let populate = [
      { path: "industry", select: "name sector description colorCode" },
    ];

    const filteredData = await paginationFiltrationData(
      Client,
      req.query,
      "clients",
      searchAttributes,
      whereStatement,
      populate
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Clients fetched successfully",
      { filteredData }
    );
  }),

  getStats: asyncHandler(async (req, res) => {
    // const stats = await Client.aggregate([
    //   {
    //     $group: {
    //       _id: "$status",
    //       count: { $sum: 1 },
    //     },
    //   },
    // ]);

    const [totalClients, activeClients, inactiveClients, pausedClients, leadClients, revenueResult, activeProjects, followUpsDue] = await Promise.all([
      Client.countDocuments(),
      Client.countDocuments({ status: "active" }),
      Client.countDocuments({ status: "inactive" }),
      Client.countDocuments({ status: "paused" }),
      Client.countDocuments({ status: "lead" }),
      Client.aggregate([{ $group: { _id: null, total: { $sum: "$revenue" } } }]),
      Project.countDocuments({ isDeleted: false, client: { $exists: true, $ne: null } }),
      Followup.countDocuments({ status: { $in: ["due-today", "over-due"] } }),
    ]);

    const totalRevenue = revenueResult[0]?.total ?? 0;

    const stats = {
      totalClients,
      activeClients,
      inactiveClients,
      pausedClients,
      leadClients,
      totalRevenue,
      activeProjects,
      followUpsDue,
    };

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Stats fetched successfully",
      { stats }
    );
  }),

  getActiveClient: asyncHandler(async (req, res) => {
    const clients = await Client.find({ status: {$in: ["active", "lead"] } }).select("name type");

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Active client fetched successfully",
      { filteredData: { clients } }
    );
  }),

  getCommunicationHistory: asyncHandler(async (req, res) => {
    const clientId = req.params.id;

    const communications = await Followup.find({
      client: clientId,
      type: "communication-history"
    })
      .populate("assignTo", "firstName lastName email")
      .sort({ date: -1 });

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Communication history fetched successfully",
      { communications }
    );
  }),
};

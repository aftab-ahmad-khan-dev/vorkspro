import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { AdminAndAssets, PolicyAndUpdates } from "../startup/models.js";
import { uploadMultipleFiles } from "../services/file.service2.js";

export const adminAndAssetsController = {


    // admin adn assets

    createAdminAndAssets: asyncHandler(async (req, res) => {
        const {
            assetName,
            assetType,
            serialNumber,
            value,
            purchaseDate,
            warrantyUntil,
            assignedTo,
            department,
            // status,
            notes
        } = req.body;

        const adminAndAssets = await AdminAndAssets.create({
            assetName,
            assetType,
            serialNumber,
            value,
            purchaseDate,
            warrantyUntil,
            assignedTo,
            department,
            // status,
            notes
        });

        return generateApiResponse(res, StatusCodes.CREATED, true, "Admin and assets created successfully", { adminAndAssets });
    }),

    updateAdminAndAssets: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const {
            assetName,
            assetType,
            serialNumber,
            value,
            purchaseDate,
            warrantyUntil,
            assignedTo,
            department,
            // status,
            notes
        } = req.body;

        const updatedData = {
            assetName,
            assetType,
            serialNumber,
            value,
            purchaseDate,
            warrantyUntil,
            assignedTo,
            department,
            // status,
            notes
        };

        const adminAndAssets = await AdminAndAssets.findByIdAndUpdate(id, updatedData, { new: true });

        if (!adminAndAssets) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Admin and assets not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Admin and assets updated successfully", { adminAndAssets });
    }),

    deleteAdminAndAssets: asyncHandler(async (req, res) => {
        const { id } = req.params;

        await AdminAndAssets.findByIdAndDelete(id);

        return generateApiResponse(res, StatusCodes.OK, true, "Admin and assets deleted successfully");
    }),

    getAdminAndAssetsByFilter: asyncHandler(async (req, res) => {
        let whereStatement = {};
        let searchAttributes = ["assetName", "assetType", "serialNumber", "value", "purchaseDate", "warrantyUntil", "assignedTo", "department", "notes"];
        let populate = [
            {
                path: 'assignedTo',
                select: 'firstName lastName email'
            }
        ]

        const filteredData = await paginationFiltrationData(AdminAndAssets, req.query, "adminAndAssets", searchAttributes, whereStatement, populate);

        return generateApiResponse(res, StatusCodes.OK, true, "Admin and assets fetched successfully", { filteredData });
    }),

    getStats: asyncHandler(async (req, res) => {
        const totalAdminAndAssets = await AdminAndAssets.countDocuments();
        const activeAdminAndAssets = await AdminAndAssets.countDocuments({
            status: "active",
        });
        const assignedAdminAndAssets = await AdminAndAssets.countDocuments({
            status: "assigned",
        });
        const unassignedAdminAndAssets = await AdminAndAssets.countDocuments({
            status: "unassigned",
        });

        const stats = {
            totalAdminAndAssets,
            activeAdminAndAssets,
            assignedAdminAndAssets,
            unassignedAdminAndAssets,
        };
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Admin and assets stats fetched successfully",
            { stats }
        );
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const adminAndAssets = await AdminAndAssets.find({assignedTo: id});
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Admin and assets fetched successfully",
            { adminAndAssets }
        );
    })

    // document manager
    // uploadDocument: asyncHandler(async (req, res) => {
    //     const { documentName, documentType, description } = req.body;
    //     const file = req.file;

    //     if (!documentName) {
    //         return generateApiResponse(
    //             res,
    //             StatusCodes.BAD_REQUEST,
    //             false,
    //             "Document name is required"
    //         );
    //     }

    //     // Upload file if provided
    //     let uploadedUrl = "";
    //     if (file) {
    //         const uploaded = await uploadMultipleFiles([file]);
    //         uploadedUrl = uploaded[0] || "";
    //     }

    //     // Build document object
    //     const newDoc = {
    //         documentName,
    //         documentType: documentType || "other",
    //         description: description || "",
    //         fileUrl: uploadedUrl,
    //     };

    //     // Save in DB
    //     const createdDoc = await DocumentManager.create(newDoc);

    //     return generateApiResponse(
    //         res,
    //         StatusCodes.CREATED,
    //         true,
    //         "Document uploaded successfully",
    //         { document: createdDoc }
    //     );
    // }),

    // updateDocument: asyncHandler(async (req, res) => {
    //     const { id } = req.params;
    //     const { documentName, documentType, description } = req.body;
    //     const file = req.file;

    //     if (!documentName) {
    //         return generateApiResponse(
    //             res,
    //             StatusCodes.BAD_REQUEST,
    //             false,
    //             "Document name is required"
    //         );
    //     }

    //     // Upload file if provided
    //     let uploadedUrl = "";
    //     if (file) {
    //         const uploaded = await uploadMultipleFiles([file]);
    //         uploadedUrl = uploaded[0] || "";
    //     }

    //     // Build document object
    //     const updatedDoc = {
    //         documentName,
    //         documentType: documentType || "other",
    //         description: description || "",
    //         fileUrl: uploadedUrl,
    //     };

    //     // Update in DB
    //     const updated = await DocumentManager.findByIdAndUpdate(id, updatedDoc, {
    //         new: true,
    //     });

    //     return generateApiResponse(
    //         res,
    //         StatusCodes.OK,
    //         true,
    //         "Document updated successfully",
    //         { document: updated }
    //     );
    // }),

    // deleteDocument: asyncHandler(async (req, res) => {
    //     const { id } = req.params;

    //     await DocumentManager.findByIdAndDelete(id);

    //     return generateApiResponse(res, StatusCodes.OK, true, "Document deleted successfully");
    // }),

    // getDocumentsByFilter: asyncHandler(async (req, res) => {
    //     let whereStatement = {};
    //     let searchAttributes = ["documentName", "documentType", "description"];

    //     const filteredData = await paginationFiltrationData(DocumentManager, req.query, "documents", searchAttributes, whereStatement);

    //     return generateApiResponse(res, StatusCodes.OK, true, "Documents fetched successfully", { filteredData });
    // }),

    // policies and updates

    // createPoliciesAndUpdates: asyncHandler(async (req, res) => {
    //     const { title, category, priority, content } = req.body;

    //     const policiesAndUpdates = await PolicyAndUpdates.create({
    //         title, category, priority, content
    //     });

    //     return generateApiResponse(res, StatusCodes.CREATED, true, "Policies and updates created successfully", { policiesAndUpdates });
    // }),

    // updatePoliciesAndUpdates: asyncHandler(async (req, res) => {
    //     const { id } = req.params;
    //     const { title, category, priority, content } = req.body;

    //     const updatedData = {
    //         title, category, priority, content
    //     }

    //     const policiesAndUpdates = await PolicyAndUpdates.findByIdAndUpdate(id, updatedData, { new: true });

    //     return generateApiResponse(res, StatusCodes.OK, true, "Policies and updates updated successfully", { policiesAndUpdates });
    // }),

    // deletePoliciesAndUpdates: asyncHandler(async (req, res) => {
    //     const { id } = req.params;

    //     await PolicyAndUpdates.findByIdAndDelete(id);

    //     return generateApiResponse(res, StatusCodes.OK, true, "Policies and updates deleted successfully");
    // }),

    // getPoliciesAndUpdatesByFilter: asyncHandler(async (req, res) => {
    //     let whereStatement = {};
    //     let searchAttributes = ["title", "category", "priority", "content"];

    //     const filteredData = await paginationFiltrationData(PolicyAndUpdates, req.query, "policiesAndUpdates", searchAttributes, whereStatement);

    //     return generateApiResponse(res, StatusCodes.OK, true, "Policies and updates fetched successfully", { filteredData });
    // }),
};
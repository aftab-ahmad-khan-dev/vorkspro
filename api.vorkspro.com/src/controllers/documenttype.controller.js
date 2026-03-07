import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { BugType, DocumentType } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { client } from "../app.js";
import { CACHE_KEYS, invalidateCache } from "../services/cache.service.js";

export const documentTypeController = {
    create: asyncHandler(async (req, res) => {
        const { name, description, colorCode } = req.body

        const document = await DocumentType.create({ name, description, colorCode });

        if (!document) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Something went wrong')
        }
        await invalidateCache(CACHE_KEYS.DOCUMENT_TYPES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, 'Document created successfully', { document })
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params
        const { name, description, colorCode } = req.body

        if (!id) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Document id is required")
        }

        const document = await DocumentType.findByIdAndUpdate(id, { name, description, colorCode }, { new: true });

        if (!document) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Something went wrong')
        }
        await invalidateCache(CACHE_KEYS.DOCUMENT_TYPES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, 'Document updated successfully', { document })
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params

        const document = await DocumentType.findByIdAndDelete(id);

        if (!document) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, 'Something went wrong')
        }
        await invalidateCache(CACHE_KEYS.DOCUMENT_TYPES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, 'Document deleted successfully', { document })
    }),

    getByFilter: asyncHandler(async (req, res) => {

        let whereStatement = {}
        let searchAttributes = ['name', 'description']

        let filteredData = await paginationFiltrationData(DocumentType, req.query, 'documents', searchAttributes, whereStatement)

        return generateApiResponse(res, StatusCodes.OK, true, 'Documents fetched successfully', { filteredData })

    }),

    getAll: asyncHandler(async (req, res) => {

        const documentTypes = await DocumentType.find();

        return generateApiResponse(res, StatusCodes.OK, true, 'Documents fetched successfully', { filteredData: { documentTypes } })

    }),

    changeStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isActive } = req.body;

        const document = await DocumentType.findById(id);

        if (!document) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Document type id is missing or invalid");
        }

        document.isActive = isActive;
        document.save();
        await invalidateCache(CACHE_KEYS.DOCUMENT_TYPES_ACTIVE);
        return generateApiResponse(res, StatusCodes.OK, true, "Status changes successfully")
    }),

    getActiveList: asyncHandler(async (req, res) => {
        const cacheKey = CACHE_KEYS.DOCUMENT_TYPES_ACTIVE;

        // 1️⃣ Check Redis cache first
        const cachedData = await client.get(cacheKey);

        if (cachedData) {
            console.log("Document types served from Redis cache");

            return generateApiResponse(
                res,
                StatusCodes.OK,
                true,
                "Active document types fetched successfully (cache)",
                { documentTypes: JSON.parse(cachedData) }
            );
        }

        // 2️⃣ Fetch from database if not in Redis
        console.log("Document types served from database");
        const documentTypes = await DocumentType.getActiveDocuments();

        // 3️⃣ Store result in Redis with TTL of 10 minutes
        await client.set(
            cacheKey,
            JSON.stringify(documentTypes),
            { EX: 600 } // 600 seconds = 10 minutes
        );

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Active document types fetched successfully",
            { documentTypes }
        );
    }),

}
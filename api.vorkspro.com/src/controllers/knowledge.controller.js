import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Knowledge } from "../startup/models.js";
import { uploadMultipleFiles } from "../services/file.service2.js";

export const knowledgeController = {
    createKnowledge: asyncHandler(async (req, res) => {
        const {
            title,
            description,
            category,
            tags,
            author,
            version,
            fileUrl,
            departments
        } = req.body;

        const files = req.files || [];

        // ── Safe JSON parse helper ─────────────────────────────
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

        // ── Upload files (single or multiple) ───────────────────
        const uploadedUrls =
            files.length > 0 ? await uploadMultipleFiles(files) : [];

        // Use uploaded file if exists, otherwise fallback to body fileUrl
        const finalFileUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : fileUrl || "";

        // ── Parse tags (comma-separated or array) ───────────────
        const parsedTags = Array.isArray(tags)
            ? tags
            : typeof tags === "string"
                ? tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];

        // ── Build knowledge data object ─────────────────────────
        const knowledgeData = {
            title: title || "",
            description: description || "",
            category: category || "",
            author: author || "",
            version: version || "",
            tags: parsedTags,
            departments: departments || null,
            fileUrl: finalFileUrl,
        };

        // ── Save to DB ──────────────────────────────────────────
        const knowledge = await Knowledge.create(knowledgeData);

        return generateApiResponse(
            res,
            StatusCodes.CREATED,
            true,
            "Knowledge created successfully",
            { knowledge }
        );
    }),

    getKnowledge: asyncHandler(async (req, res) => { 
        const knowledgeId = req.params.id;
        const knowledge = await Knowledge.find({}).populate("category");
        return generateApiResponse(res, StatusCodes.OK, true, "Knowledge fetched successfully", { knowledge });
    }),

    updateKnowledge: asyncHandler(async (req, res) => {
        const knowledgeId = req.params.id;

        const {
            title,
            description,
            category,
            tags,
            author,
            version,
            fileUrl,
            departments
        } = req.body;

        const files = req.files || [];

        // ── Safe JSON parse ───────────────────────────────
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

        // ── Upload new file if provided ────────────────────
        const uploadedUrls =
            files.length > 0 ? await uploadMultipleFiles(files) : [];

        // ── If uploaded new file use it, else fallback to existing body fileUrl ──
        const finalFileUrl = uploadedUrls.length > 0 ? uploadedUrls[0] : fileUrl || "";

        // ── Parse tags (string or array) ───────────────────
        const parsedTags = Array.isArray(tags)
            ? tags
            : typeof tags === "string"
                ? tags.split(",").map((t) => t.trim()).filter(Boolean)
                : [];

        // ── Build update object ────────────────────────────
        const knowledgeData = {
            title: title || "",
            description: description || "",
            category: category || "",
            author: author || "",
            version: version || "",
            tags: parsedTags,
            fileUrl: finalFileUrl,
            departments: departments || null
        };

        // ── Update DB ───────────────────────────────────────
        const updatedKnowledge = await Knowledge.findByIdAndUpdate(
            knowledgeId,
            knowledgeData,
            { new: true }
        );

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Knowledge updated successfully",
            { knowledge: updatedKnowledge }
        );
    }),

    deleteKnowledge: asyncHandler(async (req, res) => { 
        const knowledgeId = req.params.id;
        await Knowledge.findByIdAndDelete(knowledgeId);
        return generateApiResponse(res, StatusCodes.OK, true, "Knowledge deleted successfully");
    }),

    getStats: asyncHandler(async (req, res) => {
        const totalKnowledge = await Knowledge.countDocuments();
        const stats = {
            totalKnowledge,
        };
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Knowledge stats fetched successfully",
            { stats }
        );
    }),
};
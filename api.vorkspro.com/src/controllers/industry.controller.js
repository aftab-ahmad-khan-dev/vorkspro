import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { IndustryType } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { client } from "../app.js";

export const industryTypeController = {
  create: asyncHandler(async (req, res) => {
    const { name, description, colorCode } = req.body;

    const document = await IndustryType.create({
      name,
      description,
      colorCode,
    });

    if (!document) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Something went wrong"
      );
    }
    await client.del("industryTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Document created successfully",
      { document }
    );
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, description, colorCode } = req.body;

    if (!id) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Document id is required"
      );
    }

    const document = await IndustryType.findByIdAndUpdate(
      id,
      { name, description, colorCode },
      { new: true }
    );

    if (!document) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Something went wrong"
      );
    }
    await client.del("industryTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Document updated successfully",
      { document }
    );
  }),

  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const document = await IndustryType.findByIdAndDelete(id);

    if (!document) {
      return generateApiResponse(
        res,
        StatusCodes.BAD_REQUEST,
        false,
        "Something went wrong"
      );
    }
    await client.del("industryTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Document deleted successfully",
      { document }
    );
  }),

  getByFilter: asyncHandler(async (req, res) => {
    let whereStatement = {};
    let searchAttributes = ["name", "description"];

    let filteredData = await paginationFiltrationData(
      IndustryType,
      req.query,
      "documents",
      searchAttributes,
      whereStatement
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Documents fetched successfully",
      { filteredData }
    );
  }),

  getAll: asyncHandler(async (req, res) => {
    const industryType = await IndustryType.find();

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Industry Types fetched successfully",
      { filteredData: { industryType } }
    );
  }),

  changeStatus: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    const document = await IndustryType.findById(id);

    if (!document) {
      return generateApiResponse(
        res,
        StatusCodes.NOT_FOUND,
        false,
        "Document type id is missing or invalid"
      );
    }

    document.isActive = isActive;
    document.save();
    await client.del("industryTypes:active");
    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Status changes successfully"
    );
  }),

  getActiveList: asyncHandler(async (req, res) => {
    const cacheKey = "industryTypes:active"; // Redis key

    // 1️⃣ Check Redis cache first
    const cachedData = await client.get(cacheKey);

    if (cachedData) {
      console.log("Industry types served from Redis cache");

      return generateApiResponse(
        res,
        StatusCodes.OK,
        true,
        "Active industry types fetched successfully (cache)",
        { filteredData: { industryTypes: JSON.parse(cachedData) } }
      );
    }

    // 2️⃣ Fetch from database if not cached
    console.log("Industry types served from database");
    const industryTypes = await IndustryType.getActiveDocuments().select("name");

    // 3️⃣ Store result in Redis with TTL of 10 minutes
    await client.set(
      cacheKey,
      JSON.stringify(industryTypes),
      { EX: 600 } // 600 seconds = 10 minutes
    );

    return generateApiResponse(
      res,
      StatusCodes.OK,
      true,
      "Active industry types fetched successfully",
      { filteredData: { industryTypes } }
    );
  }),

};

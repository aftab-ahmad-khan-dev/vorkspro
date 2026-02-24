import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { BugType } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";

export const bugTypeController = {
    create: asyncHandler(async (req, res) => {
        const { name, description, colorCode } = req.body;

        const bugType = await BugType.create({ name, description, colorCode });

        if (!bugType) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Failed to create bug type")
        }

        return generateApiResponse(res, StatusCodes.CREATED, true, "Bug type created successfully", { bugType })
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, colorCode } = req.body;

        const updatedData = {
            name, description, colorCode
        }

        const bugType = await BugType.findByIdAndUpdate(id, updatedData, { new: true });

        if (!bugType) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Bug type not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Bug type updated successfully", { bugType })
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const bugType = await BugType.findByIdAndDelete(id);

        if (!bugType) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Bug type not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Bug type deleted successfully");
    }),

    getByFilter: asyncHandler(async (req, res) => {

        let whereStatement = {};
        let searchAttributes = ['name', 'description'];


        const filteredData = await paginationFiltrationData(BugType, req.query, 'bugTypes', searchAttributes, whereStatement);

        return generateApiResponse(res, StatusCodes.OK, true, "Bug Types fetched successfully", { filteredData })
    }),

    getAll: asyncHandler(async (req, res) => {

        const bugTypes = await BugType.find();

        return generateApiResponse(res, StatusCodes.OK, true, "Bug Types fetched successfully", { filteredData: { bugTypes } })
    }),

    changeStatus: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { isActive } = req.body;

        const bugType = await BugType.findById(id);

        if (!bugType) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Bug type id is missing or invalid");
        }

        bugType.isActive = isActive;
        bugType.save();

        return generateApiResponse(res, StatusCodes.OK, true, "Status changes successfully")
    }),

    getActiveList: asyncHandler(async (req, res) => {
        const bugTypes = await BugType.getActiveBugTypes();
        return generateApiResponse(res, StatusCodes.OK, true, "Active Bug Types fetched successfully", { bugTypes })
    }),
}
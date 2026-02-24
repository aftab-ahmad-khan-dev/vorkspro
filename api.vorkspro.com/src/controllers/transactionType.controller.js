import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { TransactionType } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";

export const transactionTypeController = {
    create: asyncHandler(async (req, res) => {
        const { name, description, type } = req.body;

        const transactionType = await TransactionType.create({ name, description, type });

        if (!transactionType) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Failed to create transaction type")
        }

        return generateApiResponse(res, StatusCodes.CREATED, true, "Transaction type created successfully", transactionType)
    }),

    update: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { name, description, type } = req.body;

        const updatedData = {
            name, description, type
        }

        const transactionType = await TransactionType.findByIdAndUpdate(id, updatedData, { new: true });

        if (!transactionType) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Transaction type not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Transaction type updated successfully", transactionType)
    }),

    delete: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const transactionType = await TransactionType.findByIdAndDelete(id);

        if (!transactionType) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Transaction type not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Transaction type deleted successfully");
    }),

    getByFilter: asyncHandler(async (req, res) => {

        const { type } = req.query;

        let whereStatement = {};
        let searchAttributes = ['name', 'description'];

        if (type) {
            whereStatement.type = type
        }

        const filteredData = await paginationFiltrationData(TransactionType, req.query, 'transactionTypes', searchAttributes, whereStatement);

        return generateApiResponse(res, StatusCodes.OK, true, "Transaction Types fetched successfully", { filteredData })
    }),

    getActiveList: asyncHandler(async (req, res) => {
        const { type } = req.query;

        if (type === 'income') {
            const incomeTypes = await TransactionType.getActiveIncomeTypes();
            return generateApiResponse(res, StatusCodes.OK, true, "Active Income Transaction Types fetched successfully", { transactionTypes: incomeTypes })
        } else {
            const expenseTypes = await TransactionType.getActiveExpenseTypes();
            return generateApiResponse(res, StatusCodes.OK, true, "Active Expense Transaction Types fetched successfully", { transactionTypes: expenseTypes })
        }
    }),

    getAll: asyncHandler(async (req, res) => {
            const incomeTypes = await TransactionType.find();
            return generateApiResponse(res, StatusCodes.OK, true, "Active Income Transaction Types fetched successfully", { transactionTypes: incomeTypes })
    }),
}
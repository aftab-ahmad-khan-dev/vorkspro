import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { Transaction } from "../startup/models.js";

export const transactionController = {
    createTransaction: asyncHandler(async (req, res) => {
        const {
            amount,
            transactionType,
            description,
            date,
            paymentMethod,
            invoiceId,
            notes
        } = req.body;

        const transaction = await Transaction.create({
            amount,
            transactionType,
            description,
            date,
            paymentMethod,
            invoiceId,
            notes
        });

        return generateApiResponse(res, StatusCodes.CREATED, true, "Transaction created successfully", {transaction})
    }),

    getTransactions: asyncHandler(async (req, res) => {
        const transactions = await Transaction.find().populate('transactionType');
        return generateApiResponse(res, StatusCodes.OK, true, "Transactions fetched successfully", { transactions })
    }),

    updateTransaction: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const {
            amount,
            transactionType,
            description,
            date,
            paymentMethod,
            invoiceId,
            notes
        } = req.body;

        const updatedData = {
            amount,
            transactionType,
            description,
            date,
            paymentMethod,
            invoiceId,
            notes
        }

        const transaction = await Transaction.findByIdAndUpdate(id, updatedData, { new: true });

        return generateApiResponse(res, StatusCodes.OK, true, "Transaction updated successfully", { transaction })
    }),

    deleteTransaction: asyncHandler(async (req, res) => {
        const { id } = req.params;

        await Transaction.findByIdAndDelete(id);

        return generateApiResponse(res, StatusCodes.OK, true, "Transaction deleted successfully");
    }),
}
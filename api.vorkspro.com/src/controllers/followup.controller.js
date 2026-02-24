import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import {
    generateApiResponse,
} from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { Followup } from "../models/followup.model.js";
import employeeModel from "../models/employee.model.js";


export const followupController = {
    logCommunity: asyncHandler(async (req, res) => {
        const { client, assignTo, topic, date, time, outcome, notes, } = req.body;

        const followup = await Followup.create({ client, assignTo, topic, date, time, outcome, notes, type: "communication-history" });
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Followup logged successfully",
            { followup }
        );
    }),

    createSchedule: asyncHandler(async (req, res) => {
        const { client, assignTo, topic, date, time, priority, notes, isReminderSet } = req.body;

        const selectedDate = new Date(date);
        const [hours, minutes] = time.split(':');
        selectedDate.setHours(Number(hours), Number(minutes), 0, 0);

        const followup = await Followup.create({
            client,
            assignTo,
            topic,
            date: selectedDate,
            time,
            priority,
            notes,
            isReminderSet,
            type: "schedule-followup"
        });
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Followup logged successfully",
            { followup }
        );
    }),

    // getByFilter: asyncHandler(async (req, res) => {

    //     let status = req.query.status
    //     let type = req.query.type
    //     console.log(type)
    //     console.log(status)
    //     let whereStatement = {};
    //     let searchAttributes = ["topic"];
    //     let populate = [
    //         { path: "client", select: "name" },
    //         { path: "assignTo", select: "firstName lastName email" },
    //     ]

    //     if (status) {
    //         whereStatement.status = status;
    //     }

    //     if (type) {
    //         whereStatement.type = type;
    //         if (type === "my-followup") {
    //             const employee = await employeeModel.findOne({
    //                 user: req.user._id,
    //                 isDeleted: false
    //             }).select("_id");
    //             if (!employee) {
    //                 return res.status(404).json({
    //                     message: "Employee not found for this user"
    //                 });
    //             }
    //             console.log("matched employee id:", employee._id);
    //         }
    //     }


    //     const filteredData = await paginationFiltrationData(
    //         Followup,
    //         req.query,
    //         "followups",
    //         searchAttributes,
    //         whereStatement,
    //         populate
    //     );

    //     filteredData.followups.forEach((followup) => {
    //         if (new Date(followup.date).getTime() < Date.now()) {
    //             followup.type = "communication-history";
    //             console.log(followup)
    //             followup.save();
    //         }
    //         else if (
    //             followup.assignTo &&
    //             followup.assignTo._id.toString() === req.user._id.toString()
    //         ) {
    //             followup.type = "my-followup";
    //         }
    //     });


    //     return generateApiResponse(
    //         res,
    //         StatusCodes.OK,
    //         true,
    //         "Followups fetched successfully",
    //         { filteredData }
    //     )
    // }),

    // getByFilter: asyncHandler(async (req, res) => {

    //     const { status, type } = req.query;
    //     console.log("🚀 ~ type:", type)
    //     console.log("🚀 ~ status:", status)

    //     let whereStatement = {};
    //     let searchAttributes = ["topic"];
    //     let populate = [
    //         { path: "client", select: "name" },
    //         { path: "assignTo", select: "firstName lastName email user" },
    //     ];

    //     let employeeId = null;

    //     // Status filter
    //     if (status) {
    //         whereStatement.status = status;
    //     }

    //     // My Follow-up (employee based)
    //     if (type === "my-followup") {
    //         const employee = await employeeModel.findOne({
    //             user: req.user._id,
    //             isDeleted: false
    //         }).select("_id");

    //         if (!employee) {
    //             return generateApiResponse(
    //                 res,
    //                 StatusCodes.OK,
    //                 true,
    //                 "No followups for this user",
    //                 {
    //                     filteredData: {
    //                         followups: [],
    //                         total: 0,
    //                         page: Number(req.query.page || 1),
    //                         limit: Number(req.query.limit || 10)
    //                     }
    //                 }
    //             );
    //         }

    //         employeeId = employee._id;
    //         whereStatement.assignTo = employeeId;
    //     }

    //     const filteredData = await paginationFiltrationData(
    //         Followup,
    //         req.query,
    //         "followups",
    //         searchAttributes,
    //         whereStatement,
    //         populate
    //     );

    //     /* ---------------- COMPUTE TYPE ---------------- */
    //     let computedFollowups = filteredData.followups.map((followup) => {
    //         let computedType = "schedule-followup";

    //         if (new Date(followup.date).getTime() < Date.now()) {
    //             computedType = "communication-history";
    //         }

    //         if (
    //             employeeId &&
    //             followup.assignTo &&
    //             followup.assignTo._id.toString() === employeeId.toString()
    //         ) {
    //             computedType = "my-followup";
    //         }

    //         return {
    //             ...followup.toObject(),
    //             type: computedType
    //         };
    //     });

    //     /* ---------------- FILTER BY TYPE (IMPORTANT) ---------------- */
    //     if (type === "communication-history") {
    //         computedFollowups = computedFollowups.filter(
    //             (f) => f.type === "communication-history"
    //         );
    //     }

    //     if (type === "schedule-followup") {
    //         computedFollowups = computedFollowups.filter(
    //             (f) => f.type === "schedule-followup"
    //         );
    //     }

    //     if (type === "my-followup") {
    //         computedFollowups = computedFollowups.filter(
    //             (f) => f.type === "my-followup"
    //         );
    //     }

    //     filteredData.followups = computedFollowups;

    //     return generateApiResponse(
    //         res,
    //         StatusCodes.OK,
    //         true,
    //         "Followups fetched successfully",
    //         { filteredData }
    //     );
    // }),

    getByFilter: asyncHandler(async (req, res) => {
        const { status, type, assignedTo } = req.query;

        let whereStatement = {};
        let populate = [
            { path: "client", select: "name" },
            { path: "assignTo", select: "firstName lastName email user" },
        ];

        /* ---------- STATUS FILTER ---------- */
        if (status) {
            whereStatement.status = status;
        }

        /* ---------- TYPE LOGIC ---------- */
        if (type) {
            whereStatement.type = type;
        }

        /* ---------- ASSIGNED TO FILTER (Mine) ---------- */
        if (assignedTo === "mine" && type === "schedule-followup") {
            const employee = await employeeModel.findOne({
                user: req.user._id,
                isDeleted: false
            }).select("_id");
            
            if (employee) {
                whereStatement.assignTo = employee._id;
            } else {
                // If no employee found, return empty result
                return generateApiResponse(
                    res,
                    StatusCodes.OK,
                    true,
                    "No followups found for this user",
                    { filteredData: { followups: [], pagination: { page: 1, size: 10, totalItems: 0, totalPages: 0 } } }
                );
            }
        }

        /* 🔥 AUTO STATUS UPDATE (ONLY schedule-followup) */
        if (type === "schedule-followup") {
            await Followup.updateMany(
                {
                    type: "schedule-followup",
                    status: "upcoming",
                    date: { $lt: new Date() }, // date + time passed
                },
                {
                    $set: { status: "due-today" },
                }
            );
        }

        /* ---------- FETCH DATA ---------- */
        const filteredData = await paginationFiltrationData(
            Followup,
            req.query,
            "followups",
            ["topic"],
            whereStatement,
            populate
        );

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Followups fetched successfully",
            { filteredData }
        );
    }),
    markComplete: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const followup = await Followup.findByIdAndUpdate(id, { status: "completed" }, { new: true });
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Followup marked as completed",
            { followup }
        );
    }),

    getById: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const followup = await Followup.findById(id);
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Followup fetched successfully",
            { followup }
        );
    }),

    getStats: asyncHandler(async (req, res) => {
        const overDueFollowups = await Followup.countDocuments({ status: "over-due" });
        const dueTodayFollowups = await Followup.countDocuments({ status: "due-today" });
        const upcomingFollowups = await Followup.countDocuments({ status: "upcoming" });
        const totalFollowups = await Followup.countDocuments();
        const stats = {
            overDueFollowups,
            dueTodayFollowups,
            upcomingFollowups,
            totalFollowups,
        };
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Employee stats fetched successfully",
            { stats }
        );
    }),
}
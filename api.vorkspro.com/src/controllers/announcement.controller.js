import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Announcement, Employee, User } from "../startup/models.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import mongoose from "mongoose";

export const announcementController = {
    createAnnouncement: asyncHandler(async (req, res) => {
        const user = req.user._id;
        const { title, content, department, subDepartment, priority, isPinned, sendNotifications } = req.body;

        if (!title || !content || !department) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Title, content and department are required");
        }

        const announcement = await Announcement.create({
            title,
            content,
            department,
            priority,
            isPinned,
            sendNotifications,
            createdBy: user,
            subDepartment
        });

        return generateApiResponse(res, StatusCodes.CREATED, true, "Announcement created successfully", {
            announcement
        })

    }),

    updateAnnouncement: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { title, content, department, priority, isPinned, sendNotifications, subDepartment } = req.body;
        const user = req.user._id;


        if (!title || !content || !department) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Title, content and department are required");
        }

        const updatedData = {
            title,
            content,
            department,
            priority,
            isPinned,
            sendNotifications,
            createdBy: user,
            subDepartment: subDepartment && subDepartment !== "" ? subDepartment : null
        }

        const announcement = await Announcement.findByIdAndUpdate(id, updatedData, { new: true });

        return generateApiResponse(res, StatusCodes.OK, true, "Announcement updated successfully", {
            announcement
        })
    }),

    deleteAnnouncement: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const announcement = await Announcement.findByIdAndDelete(id);

        return generateApiResponse(res, StatusCodes.OK, true, "Announcement deleted successfully", {
            announcement
        })
    }),

    markAsRead: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const userId = req.user._id;

        const employee = await Employee.findOne({ user: userId });
        if (!employee) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Employee not found");
        }

        const announcement = await Announcement.findById(id);
        if (!announcement) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Announcement not found");
        }

        // 🔒 Prevent duplicate read entries
        const alreadyRead = announcement.markAsRead.employee == employee._id;

        if (!alreadyRead) {
            announcement.markAsRead.employee = employee._id;
            announcement.markAsRead.isRead = true;
            await announcement.save();
        }

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Announcement marked as read successfully",
            { announcement }
        );
    }),

    getAllAnnouncements: asyncHandler(async (req, res) => {
        const userId = req.user?._id;
        const findUser = await User.findById(userId);
        const findEmployee = await Employee.findOne({ user: findUser?._id }).populate('department subDepartment');

        const { search, department, subDepartment } = req.query;

        // Base match conditions
        let matchCondition = {};

        if (!findUser?.isSuperAdmin) {
            matchCondition.department = findEmployee?.department?._id;
        } else {
            if (department) matchCondition.department = new mongoose.Types.ObjectId(department);
            if (subDepartment) matchCondition.subDepartment = new mongoose.Types.ObjectId(subDepartment);
        }


        // Searchable fields
        const searchFields = ["title", "content"];

        // Aggregation pipeline
        const pipeline = [
            { $match: matchCondition },
        ];

        // Search filter
        if (search && search.trim() !== "") {
            const searchRegex = new RegExp(search.trim(), "i");
            pipeline.push({
                $match: {
                    $or: searchFields.map(field => ({ [field]: { $regex: searchRegex } })),
                },
            });
        }

        // Populate fields
        const populate = [
            {
                path: "createdBy",
                select: "name email",
            },
            {
                path: "department",
                select: "name",
            },
            {
                path: "subDepartment",
                select: "name",
            },
            {
                path: "markAsRead.employee",
                select: "user",
            },
        ];

        const paginatedData = await paginationFiltrationData(
            Announcement,
            req.query,
            "announcements",
            searchFields,
            matchCondition,
            populate
        );

        if (!paginatedData) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Announcements not found");
        }

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Announcements fetched successfully",
            paginatedData,
            ["department", "subDepartment"]
        );
    }),

    getStats: asyncHandler(async (req, res) => {
        const user = req.user._id;
        const findUser = await User.findById(user);
        const findEmployee = await Employee.findOne({ user: findUser?._id }).populate('department');
        if (findUser?.isSuperAdmin == true) {
            const totalAnnouncement = await Announcement.countDocuments();
            const pinnedAnnouncement = await Announcement.countDocuments({ isPinned: true });
            const high = await Announcement.countDocuments({ priority: 'high' });
            return generateApiResponse(res, StatusCodes.OK, true, "Announcement fetched successfully", {
                stats: {
                    totalAnnouncement,
                    pinnedAnnouncement,
                    high
                }
            })
        } else {
            const totalAnnouncement = await Announcement.countDocuments({ department: findEmployee?.department?._id });
            const pinnedAnnouncement = await Announcement.countDocuments({ isPinned: true, department: findEmployee?.department?._id });
            const unRead = await Announcement.countDocuments({ department: findEmployee?.department?._id, "markAsRead.isRead": false });
            const high = await Announcement.countDocuments({ priority: 'high', department: findEmployee?.department?._id });
            return generateApiResponse(res, StatusCodes.OK, true, "Announcement fetched successfully", {
                stats: {
                    totalAnnouncement,
                    pinnedAnnouncement,
                    unRead,
                    high
                }
            })
        }
    }),

    getComments: asyncHandler(async (req, res) => {
        const announcementId = req.params.id;

        const announcement = await Announcement.findById(announcementId).populate({
            path: 'comments.commentBy',
            select: 'firstName email avatar'
        });
        ;

        return generateApiResponse(res, StatusCodes.OK, true, "Comments fetched successfully", {
            comments: announcement?.comments
        })
    }),

    postComments: asyncHandler(async (req, res) => {
        const announcementId = req.params.id;
        const { comment } = req.body;
        const user = req.user._id;
        const findUser = await User.findById(user);
        const employee = await Employee.findOne({ user: findUser?._id });

        console.log(employee)

        if (!comment) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Comment is required");
        }

        const announcement = await Announcement.findById(announcementId).populate('comments.commentBy');

        if (!announcement) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Announcement not found");
        }

        const commentData = {
            comment,
            commentBy: employee?._id
        }

        announcement.comments.push(commentData);
        await announcement.save();

        return generateApiResponse(res, StatusCodes.OK, true, "Comment posted successfully", {
            announcement
        })
    })
}
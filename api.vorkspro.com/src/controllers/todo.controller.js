import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { paginationFiltrationData } from "../services/pagination.service.js";
import { Todo } from "../startup/models.js";

function applyTodoSorting(query) {
    return [
        // Match from the base query
        { $match: query },

        // 1) Create numeric priority rank
        {
            $addFields: {
                priorityOrder: {
                    $switch: {
                        branches: [
                            { case: { $eq: ["$priority", "high"] }, then: 1 },
                            { case: { $eq: ["$priority", "medium"] }, then: 2 },
                            { case: { $eq: ["$priority", "low"] }, then: 3 },
                        ],
                        default: 4
                    }
                }
            }
        },

        // 2) Sort by dueDate then priorityOrder
        {
            $sort: {
                dueDate: 1,
                priorityOrder: 1
            }
        }
    ];
}

function buildDueDateTime(dueDate, dueTime) {
    // Default time (12-hour format)
    const defaultTime = "11:59 AM";

    // Use provided time OR default time
    const timeToUse = dueTime || defaultTime;

    // Convert 12-hour format ("02:30 PM") to "14:30"
    const [time, modifier] = timeToUse.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
        hours = String(Number(hours) + 12);
    }
    if (modifier === "AM" && hours === "12") {
        hours = "00";
    }

    const finalTime = `${hours}:${minutes}`;

    // Merge date + time
    const dateObj = new Date(dueDate);
    dateObj.setHours(Number(hours), Number(minutes), 0, 0);

    return dateObj;
}

function applyDefaultTime(dueDate, isTimeSet) {
    const date = new Date(dueDate);
    if (isNaN(date)) return null;

    // If time is NOT set → force 11:59 AM
    if (!isTimeSet) {
        date.setHours(23, 59, 0, 0); // 11:59 AM
    }

    return date;
}



export const todoController = {
    // In your controller

    createTodos: asyncHandler(async (req, res) => {
        const userId = req.user._id;
        const {
            title,
            description,
            dueDate,
            isTimeSet = false,
            priority = "medium",
            category,
            tags = [],
            isRemainderSet,
            isImportant = false,
        } = req.body;
        
        if (!title?.trim()) {
            return res.status(400).json({ isSuccess: false, message: "Title is required" });
        }

        let finalDueDate = null;

        if (dueDate) {
            finalDueDate = applyDefaultTime(dueDate, isTimeSet);

            if (!finalDueDate) {
                return res.status(400).json({ isSuccess: false, message: "Invalid dueDate" });
            }
        }

        const todo = await Todo.create({
            title: title.trim(),
            description,
            dueDate: finalDueDate,
            isTimeSet,
            priority,
            category: category || undefined,
            tags,
            isRemainderSet,
            isImportant,
            userId
        });

        return generateApiResponse(res, 201, true, "Todo created", { todo });
    }),

    updateTodos: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { dueDate, isTimeSet = false, ...rest } = req.body;
        const userId = req.user._id;

        const updateData = { ...rest, userId };

        if (dueDate !== undefined) {
            if (dueDate === null) {
                updateData.dueDate = null;
                updateData.isTimeSet = false;
            } else {
                const finalDate = applyDefaultTime(dueDate, isTimeSet);

                if (!finalDate) {
                    return res.status(400).json({ isSuccess: false, message: "Invalid dueDate" });
                }

                updateData.dueDate = finalDate;
                updateData.isTimeSet = isTimeSet;
            }
        }

        const todo = await Todo.findByIdAndUpdate(id, updateData, { new: true });

        if (!todo) {
            return res.status(404).json({ isSuccess: false, message: "Todo not found" });
        }

        return generateApiResponse(res, 200, true, "Todo updated", { todo });
    }),


    deleteTodos: asyncHandler(async (req, res) => {
        const { id } = req.params;

        const todo = await Todo.findByIdAndDelete(id);

        if (!todo) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "Todo not found");
        }

        return generateApiResponse(res, StatusCodes.OK, true, "Todo deleted successfully", { todo });
    }),

    getAllTodos: asyncHandler(async (req, res) => {
        const userId = req.user._id;
        let whereStatement = {};
        let searchAttributes = ['title', 'description', 'category', 'priority', 'tags'];

        whereStatement.userId = userId;

        const { status } = req.query;

        if (status == 'all') {
            whereStatement.status = '';
        } else if (status == 'completed') {
            whereStatement.isCompleted = true;
        } else if (status == 'starred') {
            whereStatement.isImportant = true;
        } else if (status == 'today') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            whereStatement.startDate = { $gte: startOfDay, $lte: endOfDay };
        } else if (status == 'upcoming') {
            const now = new Date();
            whereStatement.dueDate = { $gt: now };
        }

        // 🔥 Apply sorting here
        const sortedPipeline = applyTodoSorting(whereStatement);

        const filteredData = await Todo.aggregate(sortedPipeline);

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Todos fetched successfully",
            { filteredData: { todos: filteredData } }
        );
    }),

    getStats: asyncHandler(async (req, res) => {
        const upcomingTodos = await Todo.countDocuments({ dueDate: { $gt: new Date() }, isCompleted: false });
        const dueTodayTodos = await Todo.countDocuments({
            dueDate: {
                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                $lte: new Date(new Date().setHours(23, 59, 59, 999)),
            },
        });
        const completedTodos = await Todo.countDocuments({ isCompleted: true });
        const importantTodos = await Todo.countDocuments({ isImportant: true });

        const stats = {
            upcomingTodos,
            completedTodos,
            dueTodayTodos,
            importantTodos,
        };
        return generateApiResponse(res, StatusCodes.OK, true, "Stats fetched successfully", { stats });
    }),

    getPreviousTodos: asyncHandler(async (req, res) => {
        const now = new Date();

        // Fetch all todos
        const todos = await Todo.find({ isCompleted: false }).sort({ dueDate: -1, createdAt: -1 });

        // Filter todos whose dueDate (string) is in the past
        const previousTodos = todos.filter(todo => {
            const todoDate = new Date(todo.dueDate); // convert string to Date
            return todoDate < now;
        });

        return generateApiResponse(res, 200, true, "Previous tasks fetched", {
            filteredData: { todos: previousTodos }
        });
    }),


}
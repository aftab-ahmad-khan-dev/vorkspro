import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Config, Employee, ResetCode, User } from "../startup/models.js";
import { tokenCreator } from "../services/token.service.js";
import { jwtDecode } from "jwt-decode";
import { client } from "../app.js";
import { fetchUsdToPkrRate } from "../services/exchangeRate.service.js";

export const userController = {
    registerUser: asyncHandler(async (req, res) => {
        // Registration logic here
        res.status(201).json({ message: "User registered successfully" });
    }),

    loginUser: asyncHandler(async (req, res) => {
        const { identifier, password } = req.body;

        // Try finding by username or email
        let user = await User.findOne({ username: identifier }).populate('role');

        console.log("username user:", user)

        if (!user) {
            user = await User.findOne({ email: identifier }).populate('role');
        }

        console.log("email user:", user)
        // If still not found
        if (!user) {
            return generateApiResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                false,
                "Invalid username or email"
            );
        }

        // Validate password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return generateApiResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                false,
                "Invalid username or password"
            );
        }

        const employee = await Employee.findOne({ user: user._id });

        // Generate token
        const token = tokenCreator({
            _id: user._id, role: {
                _id: user.role._id,
                name: user.role.name,
                description: user.role.description,
                isActive: user.role.isActive,
                createdAt: user.role.createdAt,
                updatedAt: user.role.updatedAt
            },
            isSuperAdmin: user.isSuperAdmin, employee: employee
        }, '7d'); // 30 minutes
        const refreshToken = tokenCreator({ _id: user._id }, '7d');

        // Respond
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Login successful",
            { token, refreshToken }
        );
    }),

    forgotPassword: asyncHandler(async (req, res) => {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return generateApiResponse(
                res,
                StatusCodes.NOT_FOUND,
                false,
                "User not found"
            );
        }

        await ResetCode.deleteMany({ email });
        const resetCode = await ResetCode.create({
            email,
            code: Math.floor(100000 + Math.random() * 900000).toString(),
            expireAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
        });

        // TODO : Send email
        // 

        // send email logic would go here
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Password reset code sent to email",
        );
    }),

    verifyResetCode: asyncHandler(async (req, res) => {
        const { email, code } = req.body;
        const resetCodeEntry = await ResetCode.findOne({
            email,
            code,
            expireAt: { $gt: new Date() },
        });

        if (!resetCodeEntry) {
            return generateApiResponse(
                res,
                StatusCodes.BAD_REQUEST,
                false,
                "Invalid or expired reset code"
            );
        }

        const findUser = await User.findOne({ email });
        if (!findUser) {
            return generateApiResponse(
                res,
                StatusCodes.NOT_FOUND,
                false,
                "User not found"
            );
        }

        const token = tokenCreator({ _id: findUser?._id }, '10m'); // Token valid for 15 minutes

        await ResetCode.deleteMany({ email });

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Reset code verified successfully",
            { token }
        );
    }),

    resetPassword: asyncHandler(async (req, res) => {
        const { password } = req.body;
        const { _id } = req.user;

        if (!password) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Password is required");
        }

        const user = await User.findById(_id);
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found");
        }

        user.password = password;
        await user.save();

        return generateApiResponse(res, StatusCodes.OK, true, "Password reset successfully");
    }),

    refreshToken: asyncHandler(async (req, res) => {
        const userToken = req.body;
        let decodedToken = jwtDecode(userToken?.token)
        const user = await User.findById(decodedToken?._id).populate('role');
        const employee = await Employee.findOne({ user: user?._id });
        // return
        const token = tokenCreator({
            _id: user._id, role: {
                _id: user.role._id,
                name: user.role.name,
                description: user.role.description,
                isActive: user.role.isActive,
                createdAt: user.role.createdAt,
                updatedAt: user.role.updatedAt
            },
            isSuperAdmin: user.isSuperAdmin, employee: employee
        });
        return generateApiResponse(res, StatusCodes.OK, true, "Token refreshed successfully", { token });
    }),

    getRoles: asyncHandler(async (req, res) => {
        const { _id } = req.user; // user ID
        const cacheKey = `user:${_id}:role`; // unique Redis key per user

        // 1️⃣ Check Redis first
        const cached = await client.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            return generateApiResponse(
                res,
                StatusCodes.OK,
                true,
                "Roles fetched successfully (cache)",
                { role: parsed.role, themePreference: parsed.themePreference || "neon-purple" }
            );
        }

        // 2️⃣ Fetch from DB if not in cache
        const user = await User.findById(_id).populate('role');
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found", null);
        }

        // Build role payload: role doc + isSuperAdmin so frontend can show correct sidebar per user
        const rolePayload = user.role
            ? { ...user.role.toObject(), isSuperAdmin: !!user.isSuperAdmin }
            : { isSuperAdmin: !!user.isSuperAdmin, modulePermissions: [] };
        const themePreference = user.themePreference || "neon-purple";

        // 3️⃣ Store in Redis (TTL 10 minutes)
        await client.set(cacheKey, JSON.stringify({ role: rolePayload, themePreference }), { EX: 600 });

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Roles fetched successfully",
            { role: rolePayload, themePreference }
        );
    }),

    /** Update current user profile (e.g. theme preference). Body: { themePreference } */
    updateProfile: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { themePreference } = req.body;
        if (themePreference && !["light", "dark", "neon-purple"].includes(themePreference)) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Invalid theme preference");
        }
        const user = await User.findById(_id);
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found");
        }
        if (themePreference) {
            user.themePreference = themePreference;
            await user.save();
            const cacheKey = `user:${_id}:role`;
            await client.del(cacheKey).catch(() => {});
        }
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Profile updated successfully",
            { themePreference: user.themePreference || "neon-purple" }
        );
    }),

    updateExchangeRate: asyncHandler(async (req, res) => {
        try {
            const rate = await fetchUsdToPkrRate();
            
            let config = await Config.findOne({});
            
            if (!config) {
                config = new Config({ usdToPkrRate: rate, lastUpdated: new Date() });
            } else {
                config.usdToPkrRate = rate;
                config.lastUpdated = new Date();
            }
            
            await config.save();

            return generateApiResponse(
                res,
                StatusCodes.OK,
                true,
                "Exchange rate updated successfully",
                { rate, lastUpdated: config.lastUpdated }
            );
        } catch (error) {
            console.error('Error in updateExchangeRate:', error);
            return generateApiResponse(
                res,
                StatusCodes.INTERNAL_SERVER_ERROR,
                false,
                "Failed to update exchange rate: " + error.message
            );
        }
    }),

    getExchangeRate: asyncHandler(async (req, res) => {
        const config = await Config.findOne({});
        
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Exchange rate fetched successfully",
            { 
                rate: config?.usdToPkrRate || 0,
                lastUpdated: config?.lastUpdated 
            }
        );
    }),

    /** List all users with role populated — for Settings / Role assignment (Access Settings only) */
    listUsers: asyncHandler(async (req, res) => {
        const users = await User.find()
            .populate("role", "name description isActive")
            .select("firstName lastName email username role isActive")
            .lean();
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Users fetched successfully",
            { users }
        );
    }),

    /** Assign role to user — body: { role: roleId } or { role: null } to unassign (Access Settings only) */
    updateUserRole: asyncHandler(async (req, res) => {
        const { id } = req.params;
        const { role: roleId } = req.body;
        const user = await User.findByIdAndUpdate(
            id,
            { role: roleId ?? null },
            { new: true }
        ).populate("role", "name description isActive");
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found");
        }
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "User role updated successfully",
            { user }
        );
    }),

}
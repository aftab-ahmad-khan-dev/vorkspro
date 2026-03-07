import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Config, Employee, ResetCode, Role, User } from "../startup/models.js";
import { tokenCreator } from "../services/token.service.js";
import { jwtDecode } from "jwt-decode";
import { client } from "../app.js";
import { fetchUsdToPkrRate } from "../services/exchangeRate.service.js";

/** Allowed theme values: mode (light/dark) or 10 accent keys. */
const ALLOWED_THEME_PREFERENCES = [
    "light", "dark", "neon-purple",
    "vorkspro", "neonCyan", "neonGreen", "neonPink", "neonPurple",
    "electricBlue", "amber", "coral", "teal", "violet"
];

export const userController = {
    registerUser: asyncHandler(async (req, res) => {
        // Registration logic here
        res.status(201).json({ message: "User registered successfully" });
    }),

    loginUser: asyncHandler(async (req, res) => {
        const { identifier, password } = req.body;

        // First: try to find by username OR email on User
        let user = await User.findOne({
            $or: [{ username: identifier }, { email: identifier }],
        }).populate("role");

        // Fallback for employees: allow login by companyEmail or employeeId
        if (!user) {
            const employee = await Employee.findOne({
                $or: [{ companyEmail: identifier }, { employeeId: identifier }],
            }).lean();

            if (employee?.user) {
                // Load full User document (with comparePassword method) and populate role
                user = await User.findById(employee.user).populate("role");
            }
        }

        if (!user) {
            return generateApiResponse(
                res,
                StatusCodes.UNAUTHORIZED,
                false,
                "Invalid username or password"
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

        const employee = await Employee.findOne({ user: user._id }).lean();

        // Build a safe role payload (handles users without an assigned role)
        let rolePayload;
        if (user.role) {
            const r = user.role;
            rolePayload = {
                _id: r._id,
                name: r.name,
                description: r.description,
                isActive: r.isActive,
                createdAt: r.createdAt,
                updatedAt: r.updatedAt,
                modulePermissions: r.modulePermissions,
            };
        } else {
            rolePayload = {
                isSuperAdmin: !!user.isSuperAdmin,
                modulePermissions: [],
            };
        }

        // Generate token
        const token = tokenCreator(
            {
                _id: user._id,
                role: rolePayload,
                isSuperAdmin: user.isSuperAdmin,
                employee: employee,
            },
            "7d"
        ); // 7 days
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
                {
                    role: parsed.role,
                    noRole: !!parsed.noRole,
                    themePreference: parsed.themePreference || "neonPurple",
                    themeMode: parsed.themeMode,
                    lightColor: parsed.lightColor,
                    darkColor: parsed.darkColor,
                }
            );
        }

        // 2️⃣ Fetch from DB if not in cache (select only needed fields, lean for speed)
        const user = await User.findById(_id)
            .select('role themePreference themeMode lightColor darkColor isSuperAdmin')
            .populate('role')
            .lean();
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found", null);
        }

        const noRole = !user.role;
        const rolePayload = user.role
            ? { ...user.role, isSuperAdmin: !!user.isSuperAdmin }
            : { isSuperAdmin: !!user.isSuperAdmin, modulePermissions: [] };
        const themePreference = user.themePreference || "neonPurple";
        const themeMode = user.themeMode;
        const lightColor = user.lightColor;
        const darkColor = user.darkColor;

        // 3️⃣ Store in Redis (TTL 10 minutes)
        await client.set(cacheKey, JSON.stringify({
            role: rolePayload,
            noRole,
            themePreference,
            themeMode,
            lightColor,
            darkColor,
        }), { EX: 600 });

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Roles fetched successfully",
            { role: rolePayload, noRole, themePreference, themeMode, lightColor, darkColor }
        );
    }),

    /** Get current user's employee + basic user info (for Profile when token has no employee). Any authenticated user. */
    getMe: asyncHandler(async (req, res) => {
        const [employee, user] = await Promise.all([
            Employee.findOne({ user: req.user._id })
                .populate("department", "name")
                .populate("subDepartment", "name")
                .lean(),
            User.findById(req.user._id)
                .select("firstName lastName email phone isSuperAdmin role profilePicture")
                .populate("role", "name")
                .lean(),
        ]);

        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Current user profile",
            {
                employee: employee || null,
                user: user || null,
            }
        );
    }),

    /** Update current user profile (e.g. theme preference). Body: { themePreference, themeMode?, lightColor?, darkColor?, profilePicture? } */
    updateProfile: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const { themePreference, themeMode, lightColor, darkColor, profilePicture } = req.body;
        if (themePreference && !ALLOWED_THEME_PREFERENCES.includes(themePreference)) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Invalid theme preference");
        }
        const user = await User.findById(_id);
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found");
        }
        if (themePreference) user.themePreference = themePreference;
        if (themeMode) user.themeMode = themeMode;
        if (lightColor) user.lightColor = lightColor;
        if (darkColor) user.darkColor = darkColor;
        if (profilePicture !== undefined) user.profilePicture = profilePicture;
        await user.save();
        const cacheKey = `user:${_id}:role`;
        await client.del(cacheKey).catch(() => {});
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Profile updated successfully",
            {
                themePreference: user.themePreference || "neonPurple",
                themeMode: user.themeMode,
                lightColor: user.lightColor,
                darkColor: user.darkColor,
            }
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

    /** Self-service: assign the first available active role to the current user when they have no role (so they can access the app). */
    assignDefaultRole: asyncHandler(async (req, res) => {
        const _id = req.user._id;
        const user = await User.findById(_id).select("role").lean();
        if (!user) {
            return generateApiResponse(res, StatusCodes.NOT_FOUND, false, "User not found");
        }
        if (user.role) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "You already have a role assigned.");
        }
        // Prefer Admin role (has full permissions) so user can access all modules; otherwise first active role
        const defaultRole = await Role.findOne({ name: "Admin", isActive: true }).lean()
            || await Role.findOne({ isActive: true }).sort({ createdAt: 1 }).lean();
        if (!defaultRole) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "No active role exists. Create a role in Settings first (requires an admin).");
        }
        await User.findByIdAndUpdate(_id, { role: defaultRole._id });
        const cacheKey = `user:${_id}:role`;
        await client.del(cacheKey).catch(() => {});
        const rolePayload = { ...defaultRole, isSuperAdmin: false };
        return generateApiResponse(
            res,
            StatusCodes.OK,
            true,
            "Default role assigned. Reload the app.",
            { role: rolePayload, noRole: false }
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
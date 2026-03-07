import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../services/asynchandler.js";
import { generateApiResponse } from "../services/utilities.service.js";
import { Config, Employee, ResetCode, Role, User } from "../startup/models.js";
import { tokenCreator } from "../services/token.service.js";
import { jwtDecode } from "jwt-decode";
import { client } from "../app.js";
import { fetchUsdToPkrRate } from "../services/exchangeRate.service.js";
import { ensureRegistry, getOrganizationModel, getRegistrationDraftModel } from "../database/registry.js";

/** Protected super admin — never remove, deactivate, or change role. */
const SUPER_ADMIN_EMAIL = "admin@vorkspro.com";
import { getTenantConnection } from "../database/tenant.js";
import { seedTenantDb } from "../services/tenantSeed.service.js";

/** Allowed theme values: mode (light/dark) or 10 accent keys. */
const ALLOWED_THEME_PREFERENCES = [
    "light", "dark", "neon-purple",
    "vorkspro", "neonCyan", "neonGreen", "neonPink", "neonPurple",
    "electricBlue", "amber", "coral", "teal", "violet"
];

/** Sanitize org slug to a valid MongoDB database name (lowercase, alphanumeric + underscore). */
function slugToDbName(slug) {
    return "vorkspro_" + String(slug).trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "vorkspro_org";
}

export const userController = {
    registerUser: asyncHandler(async (req, res) => {
        const { orgName, slug, adminEmail, adminPassword, firstName, lastName, phone, address, website, industry } = req.body;
        if (!orgName || !slug || !adminEmail || !adminPassword) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "orgName, slug, adminEmail, and adminPassword are required.");
        }
        const dbName = slugToDbName(slug);
        await ensureRegistry();
        const Organization = getOrganizationModel();
        const existing = await Organization.findOne({ $or: [{ slug: slug.trim().toLowerCase() }, { dbName }] });
        if (existing) {
            return generateApiResponse(res, StatusCodes.CONFLICT, false, "Organization with this slug or name already exists.");
        }
        await Organization.create({
            name: orgName.trim(),
            slug: slug.trim().toLowerCase(),
            dbName,
            adminEmail: adminEmail.trim().toLowerCase(),
            email: (adminEmail && String(adminEmail).trim().toLowerCase()) || undefined,
            status: "active",
            phone: phone != null && String(phone).trim() ? String(phone).trim() : undefined,
            address: address != null && String(address).trim() ? String(address).trim() : undefined,
            website: website != null && String(website).trim() ? String(website).trim() : undefined,
            industry: industry != null && String(industry).trim() ? String(industry).trim() : undefined,
        });
        const tenantConn = getTenantConnection(dbName);
        await seedTenantDb(tenantConn, {
            email: adminEmail.trim().toLowerCase(),
            password: adminPassword,
            firstName: (firstName || "Admin").trim(),
            lastName: (lastName || "User").trim(),
        });
        return generateApiResponse(res, StatusCodes.CREATED, true, "Organization registered successfully. You can now log in with your org slug and admin email.", {
            orgSlug: slug.trim().toLowerCase(),
            dbName,
        });
    }),

    saveRegistrationDraft: asyncHandler(async (req, res) => {
        const { orgName, slug, adminEmail, adminPassword, firstName, lastName, planId, phone, address, website, industry } = req.body;
        if (!adminEmail?.trim()) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "adminEmail is required.");
        }
        await ensureRegistry();
        const Draft = getRegistrationDraftModel();
        const draft = await Draft.findOneAndUpdate(
            { adminEmail: adminEmail.trim().toLowerCase() },
            {
                orgName: orgName?.trim(),
                slug: slug?.trim()?.toLowerCase(),
                adminEmail: adminEmail.trim().toLowerCase(),
                adminPassword: adminPassword || undefined,
                firstName: firstName?.trim(),
                lastName: lastName?.trim(),
                planId: planId?.trim(),
                phone: phone != null ? String(phone).trim() : undefined,
                address: address != null ? String(address).trim() : undefined,
                website: website != null ? String(website).trim() : undefined,
                industry: industry != null ? String(industry).trim() : undefined,
            },
            { new: true, upsert: true }
        );
        return generateApiResponse(res, StatusCodes.OK, true, "Draft saved. You can resume later.", {
            draftId: draft._id,
            adminEmail: draft.adminEmail,
        });
    }),

    getRegistrationDraft: asyncHandler(async (req, res) => {
        const { email } = req.query;
        if (!email?.trim()) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "email query is required.");
        }
        await ensureRegistry();
        const Draft = getRegistrationDraftModel();
        const draft = await Draft.findOne({ adminEmail: email.trim().toLowerCase() }).lean();
        if (!draft) {
            return generateApiResponse(res, StatusCodes.OK, true, "No draft found.", { draft: null });
        }
        const { adminPassword, ...rest } = draft;
        return generateApiResponse(res, StatusCodes.OK, true, "Draft found.", { draft: rest });
    }),

    loginUser: asyncHandler(async (req, res) => {
        const { orgSlug, identifier, password } = req.body;
        const id = (identifier || "").trim();
        const idRegex = new RegExp(`^${id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

        let user;
        let tenantDbName = null;
        let tenantOrgSlug = null;

        await ensureRegistry();
        const Organization = getOrganizationModel();

        if (orgSlug && String(orgSlug).trim()) {
            const org = await Organization.findOne({ slug: String(orgSlug).trim().toLowerCase(), status: "active" });
            if (!org) {
                return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid organization or credentials.");
            }
            tenantDbName = org.dbName;
            tenantOrgSlug = org.slug;
            const tenantConn = getTenantConnection(tenantDbName);
            const UserTenant = tenantConn.model("User");
            const EmployeeTenant = tenantConn.model("Employee");
            user = await UserTenant.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }).populate("role");
            if (!user) {
                const employee = await EmployeeTenant.findOne({ $or: [{ companyEmail: idRegex }, { employeeId: id }] }).lean();
                if (employee?.user) user = await UserTenant.findById(employee.user).populate("role");
            }
        } else {
            // No slug: resolve user's workspace by email. Try org admin first, then search all tenant DBs.
            const emailLower = id.toLowerCase();
            let org = await Organization.findOne({ adminEmail: emailLower, status: "active" }).lean();
            if (org) {
                tenantDbName = org.dbName;
                tenantOrgSlug = org.slug;
                const tenantConn = getTenantConnection(org.dbName);
                const UserTenant = tenantConn.model("User");
                const EmployeeTenant = tenantConn.model("Employee");
                user = await UserTenant.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }).populate("role");
                if (!user) {
                    const employee = await EmployeeTenant.findOne({ $or: [{ companyEmail: idRegex }, { employeeId: id }] }).lean();
                    if (employee?.user) user = await UserTenant.findById(employee.user).populate("role");
                }
            }
            if (!user) {
                const orgs = await Organization.find({ status: "active" }).lean();
                for (const o of orgs) {
                    const conn = getTenantConnection(o.dbName);
                    const UserTenant = conn.model("User");
                    const EmployeeTenant = conn.model("Employee");
                    const u = await UserTenant.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }).populate("role");
                    if (u) {
                        user = u;
                        tenantDbName = o.dbName;
                        tenantOrgSlug = o.slug;
                        break;
                    }
                    const emp = await EmployeeTenant.findOne({ $or: [{ companyEmail: idRegex }, { employeeId: id }] }).lean();
                    if (emp?.user) {
                        user = await UserTenant.findById(emp.user).populate("role");
                        if (user) {
                            tenantDbName = o.dbName;
                            tenantOrgSlug = o.slug;
                            break;
                        }
                    }
                }
            }
            // Fallback: check main/default DB for super admin (e.g. admin@vorkspro.com)
            if (!user) {
                user = await User.findOne({ $or: [{ username: idRegex }, { email: idRegex }] }).populate("role");
                // tenantDbName stays null → main DB (no tenant)
            }
        }

        if (!user) {
            return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid username or password");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid username or password");
        }

        const employee = tenantDbName
            ? await getTenantConnection(tenantDbName).model("Employee").findOne({ user: user._id }).lean()
            : await Employee.findOne({ user: user._id }).lean();

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
            rolePayload = { isSuperAdmin: !!user.isSuperAdmin, modulePermissions: [] };
        }

        const tokenPayload = {
            _id: user._id,
            role: rolePayload,
            isSuperAdmin: user.isSuperAdmin,
            employee,
        };
        if (tenantDbName) {
            tokenPayload.dbName = tenantDbName;
            tokenPayload.orgSlug = tenantOrgSlug;
        }
        const token = tokenCreator(tokenPayload, "7d");
        const refreshToken = tokenCreator(tenantDbName ? { _id: user._id, dbName: tenantDbName, orgSlug: tenantOrgSlug } : { _id: user._id }, "7d");

        return generateApiResponse(res, StatusCodes.OK, true, "Login successful", { token, refreshToken });
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
        const refreshTokenRaw = req.body?.refreshToken || req.body?.token;
        if (!refreshTokenRaw) {
            return generateApiResponse(res, StatusCodes.BAD_REQUEST, false, "Refresh token required.");
        }
        const decoded = jwtDecode(refreshTokenRaw);
        const userId = decoded?._id;
        if (!userId) {
            return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid refresh token.");
        }

        let user;
        let employee;
        let tenantDbName = null;
        let tenantOrgSlug = null;
        if (decoded.dbName) {
            const tenantConn = getTenantConnection(decoded.dbName);
            if (!tenantConn) {
                return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid refresh token.");
            }
            const UserTenant = tenantConn.model("User");
            const EmployeeTenant = tenantConn.model("Employee");
            user = await UserTenant.findById(userId).populate("role");
            if (user) {
                employee = await EmployeeTenant.findOne({ user: user._id }).lean();
                tenantDbName = decoded.dbName;
                tenantOrgSlug = decoded.orgSlug || null;
            }
        } else {
            user = await User.findById(userId).populate("role");
            if (user) employee = await Employee.findOne({ user: user._id }).lean();
        }

        if (!user) {
            return generateApiResponse(res, StatusCodes.UNAUTHORIZED, false, "Invalid refresh token.");
        }
        if (!user.isActive) {
            return generateApiResponse(res, StatusCodes.FORBIDDEN, false, "Account deactivated.");
        }

        const tokenPayload = {
            _id: user._id,
            role: user.role ? {
                _id: user.role._id,
                name: user.role.name,
                description: user.role.description,
                isActive: user.role.isActive,
                createdAt: user.role.createdAt,
                updatedAt: user.role.updatedAt,
                modulePermissions: user.role.modulePermissions,
            } : { isSuperAdmin: !!user.isSuperAdmin, modulePermissions: [] },
            isSuperAdmin: user.isSuperAdmin,
            employee: employee || null,
        };
        if (tenantDbName) {
            tokenPayload.dbName = tenantDbName;
            tokenPayload.orgSlug = tenantOrgSlug;
        }
        const token = tokenCreator(tokenPayload, "7d");
        const newRefreshToken = tokenCreator(
            tenantDbName ? { _id: user._id, dbName: tenantDbName, orgSlug: tenantOrgSlug } : { _id: user._id },
            "7d"
        );
        return generateApiResponse(res, StatusCodes.OK, true, "Token refreshed successfully", { token, refreshToken: newRefreshToken });
    }),

    getRoles: asyncHandler(async (req, res) => {
        const { _id } = req.user;
        const tenantDbName = req.tenantDbName || "default";
        const cacheKey = `user:${tenantDbName}:${_id}:role`;

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

        // 2️⃣ Use tenant User when request is for a tenant user
        const UserModel = req.tenantConn ? req.tenantConn.model("User") : User;
        const user = await UserModel.findById(_id)
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
        const UserModel = req.tenantConn ? req.tenantConn.model("User") : User;
        const user = await UserModel.findById(_id);
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
        const existingUser = await User.findById(id).select("email isSuperAdmin").lean();
        if (existingUser && (existingUser.email === SUPER_ADMIN_EMAIL || existingUser.isSuperAdmin === true)) {
            return generateApiResponse(res, StatusCodes.FORBIDDEN, false, "Cannot change the super admin user's role.");
        }
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
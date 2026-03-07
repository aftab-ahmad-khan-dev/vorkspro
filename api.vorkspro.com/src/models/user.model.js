import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
    {
        firstName: { type: String },
        lastName: { type: String },
        username: { type: String },
        email: { type: String, },
        phone: { type: String, },
        password: { type: String, },
        role: { type: Schema.Types.ObjectId, ref: ModelNames.Role.model },
        isSuperAdmin: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        oneSignalPlayerId: { type: String },
        themePreference: {
            type: String,
            enum: [
                "light", "dark", "neon-purple",
                "vorkspro", "neonCyan", "neonGreen", "neonPink", "neonPurple",
                "electricBlue", "amber", "coral", "teal", "violet"
            ],
            default: "neonPurple"
        },
        themeMode: { type: String, enum: ["light", "dark"] },
        lightColor: { type: String },
        darkColor: { type: String },
        profilePicture: { type: String }

    },
    { timestamps: true }
);

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });

/**
 * Pre-save middleware
 * - Hash password if modified
 * - Normalize phone number
 */
UserSchema.pre("save", async function (next) {
    try {
        // Normalize phone number
        if (this.phone) {
            this.phone = this.phone.startsWith("+") ? this.phone : `+${this.phone}`;
        }

        // Hash password if modified or new
        if (this.isModified("password")) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model(ModelNames.User.model, UserSchema);

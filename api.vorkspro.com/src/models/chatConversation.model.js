import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const ChatConversationSchema = new Schema(
  {
    // For SaaS / multi-tenant deployments, this can store the org / tenant id.
    organizationId: { type: String, index: true },

    // Direct (1:1) or group conversations
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    // Participants in this conversation
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User.model,
        required: true,
      },
    ],

    // Optional friendly name / metadata for group chats
    title: { type: String },
    avatarColor: { type: String },

    // Fast lookup of last activity
    lastMessageAt: { type: Date },
    lastMessagePreview: { type: String },
  },
  {
    timestamps: true,
  }
);

ChatConversationSchema.index({ participants: 1 });

export default mongoose.model("ChatConversation", ChatConversationSchema);


import mongoose, { Schema } from "mongoose";
import { ModelNames } from "../constants.js";

const ChatMessageSchema = new Schema(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "ChatConversation",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: ModelNames.User.model,
      required: true,
      index: true,
    },
    body: {
      type: String,
      trim: true,
      required: true,
    },
    // Optional generic payload for future features (attachments, system messages, etc.)
    metadata: {
      type: Schema.Types.Mixed,
    },

    // WhatsApp-style delivery / read tracking
    deliveredTo: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User.model,
      },
    ],
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: ModelNames.User.model,
      },
    ],
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model("ChatMessage", ChatMessageSchema);


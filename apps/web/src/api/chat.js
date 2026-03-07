import { request } from "@/api/index.js";

export const fetchConversations = () => request.get("chat/conversations");

export const searchChatUsers = (q) =>
  request.getWithParams("chat/users", q ? { q } : {});

export const getOrCreateDirectConversation = (targetUserId) =>
  request.post("chat/conversations", { targetUserId });

export const fetchMessages = (conversationId, params = {}) =>
  request.getWithParams(`chat/conversations/${conversationId}/messages`, params);

export const sendMessage = (conversationId, body) =>
  request.post(`chat/conversations/${conversationId}/messages`, { body });

export const markConversationRead = (conversationId) =>
  request.post(`chat/conversations/${conversationId}/read`);


import { apiGet, apiGetByFilter, apiPost } from "@/interceptor/interceptor";

export const fetchConversations = () => apiGet("chat/conversations");

export const searchChatUsers = (q) =>
  apiGetByFilter("chat/users", q ? { q } : {});

export const getOrCreateDirectConversation = (targetUserId) =>
  apiPost("chat/conversations", { targetUserId });

export const fetchMessages = (conversationId, params = {}) =>
  apiGetByFilter(`chat/conversations/${conversationId}/messages`, params);

export const sendMessage = (conversationId, body) =>
  apiPost(`chat/conversations/${conversationId}/messages`, { body });

export const markConversationRead = (conversationId) =>
  apiPost(`chat/conversations/${conversationId}/read`);


/**
 * Shared Socket.IO client for the app.
 * Used for notifications (Layout) and chat (Chat page).
 */
import io from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_APP_BASE_URL?.replace(/\/api\/?$/, "") || window.location.origin;

let socket = null;

export function getAppSocket(token) {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: token ? { token } : undefined,
    });
  }
  return socket;
}

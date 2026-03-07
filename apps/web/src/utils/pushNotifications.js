/**
 * Socket.IO + Service Worker notifications (no 3rd-party push).
 * - Registers service worker
 * - Listens for receive_notification via socket
 * - Shows browser notifications via SW registration
 */
const SW_PATH = "/sw.js";

export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return null;
  try {
    const reg = await navigator.serviceWorker.register(SW_PATH, { scope: "/" });
    return reg;
  } catch (e) {
    console.warn("[notifications] Service worker registration failed:", e.message);
    return null;
  }
}

/**
 * Initialize Socket.IO-based notifications.
 * Call when user is logged in. Socket must be connected; user room is joined here.
 */
export function initSocketNotifications(socket, userId) {
  if (!socket || !userId || !("Notification" in window)) return;

  let perm = Notification.permission;
  if (perm === "default") {
    Notification.requestPermission().then((p) => {
      if (p === "granted") setupListener(socket, userId);
    });
    return;
  }
  if (perm !== "granted") return;

  setupListener(socket, userId);
}

function setupListener(socket, userId) {
  socket.emit("join", userId);

  const handler = (payload) => {
    const { type, message, data = {} } = payload;
    const title = data.title || type || "Notification";
    const body = message || "";
    const tag = data.tag || `notif-${Date.now()}`;
    const url = data.url || "/app/dashboard";

    if (!navigator.serviceWorker?.ready) return;
    navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, {
        body,
        tag,
        data: { ...data, url },
        icon: "/favicon.svg",
        badge: "/favicon.svg",
      });
    });
  };

  socket.on("receive_notification", handler);

  // Cleanup would need to be called on logout – socket stays connected for chat
  // We don't remove the listener to avoid missing notifications when switching pages
}

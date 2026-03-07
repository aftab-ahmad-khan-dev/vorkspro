/**
 * VorksPro Load Balancer — Round-robin reverse proxy, platform-aware (no paid packages).
 * Routes /api/web, /api/mobile, /api/desktop to separate backend pools for better load distribution.
 *
 * Env (optional per-platform; fallback to single pool):
 *   BACKEND_WEB_PORTS=4000,4001    (for /api and /api/web)
 *   BACKEND_MOBILE_PORTS=4002,4003 (for /api/mobile)
 *   BACKEND_DESKTOP_PORTS=4004     (for /api/desktop)
 * Or single pool: BACKEND_PORTS=4000,4001 or BACKEND_HOSTS=...
 *
 * Listens on LB_PORT (default 3000).
 */

const http = require("http");
const url = require("url");

const LB_PORT = parseInt(process.env.LB_PORT || "3000", 10);
const host = process.env.BACKEND_HOST || "localhost";

function parseBackends(portsEnv, hostsEnv) {
  if (hostsEnv) return hostsEnv.split(",").map((h) => h.trim()).filter(Boolean);
  if (portsEnv) return portsEnv.split(",").map((p) => `http://${host}:${p.trim()}`).filter(Boolean);
  return [];
}

// Per-platform backends (for better load balancer: scale each platform separately)
const webBackends = parseBackends(process.env.BACKEND_WEB_PORTS, process.env.BACKEND_WEB_HOSTS);
const mobileBackends = parseBackends(process.env.BACKEND_MOBILE_PORTS, process.env.BACKEND_MOBILE_HOSTS);
const desktopBackends = parseBackends(process.env.BACKEND_DESKTOP_PORTS, process.env.BACKEND_DESKTOP_HOSTS);

// Single pool fallback
const defaultBackends = parseBackends(process.env.BACKEND_PORTS, process.env.BACKEND_HOSTS);
const singlePool = defaultBackends.length > 0 ? defaultBackends : ["http://localhost:4000"];

const roundRobin = (list) => {
  let i = 0;
  return () => {
    if (!list.length) return null;
    const t = list[i % list.length];
    i += 1;
    return t;
  };
};

const getWebBackend = roundRobin(webBackends.length ? webBackends : singlePool);
const getMobileBackend = roundRobin(mobileBackends.length ? mobileBackends : singlePool);
const getDesktopBackend = roundRobin(desktopBackends.length ? desktopBackends : singlePool);
const getDefaultBackend = roundRobin(singlePool);

function pickBackend(path) {
  if (path.startsWith("/api/mobile")) return getMobileBackend();
  if (path.startsWith("/api/desktop")) return getDesktopBackend();
  if (path.startsWith("/api/web") || path.startsWith("/api/")) return getWebBackend();
  return getDefaultBackend();
}

function forward(req, res, targetOrigin) {
  const parsed = url.parse(req.url);
  const opts = {
    hostname: url.parse(targetOrigin).hostname,
    port: url.parse(targetOrigin).port || 80,
    path: (parsed.path || "/") + (parsed.search || ""),
    method: req.method,
    headers: { ...req.headers, host: url.parse(targetOrigin).host },
  };

  const proxyReq = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on("error", (err) => {
    console.error("[LB] Backend error:", targetOrigin, err.message);
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad Gateway", message: "Backend unavailable" }));
  });

  req.pipe(proxyReq);
}

const server = http.createServer((req, res) => {
  const path = url.parse(req.url).pathname || "";
  const target = pickBackend(path);
  if (!target) {
    res.writeHead(503, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "Service Unavailable", message: "No backends configured" }));
  }
  forward(req, res, target);
});

server.listen(LB_PORT, () => {
  console.log(`[VorksPro LB] Listening on port ${LB_PORT}`);
  if (webBackends.length || mobileBackends.length || desktopBackends.length) {
    console.log("[VorksPro LB] Platform backends: web=", webBackends.length || singlePool.length, "mobile=", mobileBackends.length || singlePool.length, "desktop=", desktopBackends.length || singlePool.length);
  } else {
    console.log("[VorksPro LB] Backends (single pool):", singlePool.join(", "));
  }
});

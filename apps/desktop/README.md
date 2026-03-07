# VorksPro Desktop App

Placeholder for the **desktop** client (e.g. Electron). The API serves all platforms; use **`/api/desktop`** or **`/api`** so the load balancer can route desktop traffic to its own backend pool (see `api.vorkspro.com/load-balancer` and `api.vorkspro.com/nginx/`).

## Setup (when implementing)

1. Create Electron app (e.g. with `electron-vite` or `create-electron-vite`) or Tauri.
2. Set API base URL to your backend (e.g. `https://api.vorkspro.com/api` or via load balancer).
3. Send platform header on every request:
   - `X-Client-Platform: desktop`
   - Or `X-App-Source: desktop`
4. Reuse the same auth (JWT access + refresh) and permission model as the web app. You can embed the web app in a WebView or build a native UI that calls the same API.

## API

Same endpoints as web; see `api.vorkspro.com` and repo README.

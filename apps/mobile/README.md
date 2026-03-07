# VorksPro Mobile App

Placeholder for the **mobile** client (React Native / Expo or Flutter). The API serves all platforms; use **`/api/mobile`** or **`/api`** so the load balancer can route mobile traffic to its own backend pool (see `api.vorkspro.com/load-balancer` and `api.vorkspro.com/nginx/`).

## Setup (when implementing)

1. Create app with Expo: `npx create-expo-app .` or Flutter: `flutter create .`
2. Set API base URL to your backend (e.g. `https://api.vorkspro.com/api` or via load balancer).
3. Send platform header on every request so the backend can track/adapt:
   - `X-Client-Platform: mobile`
   - Or `X-App-Source: mobile`
4. Reuse the same auth (JWT access + refresh) and permission model as the web app.

## API

Same endpoints as web; see `api.vorkspro.com` and repo README. Use the same login, refresh-token, and role-based access.

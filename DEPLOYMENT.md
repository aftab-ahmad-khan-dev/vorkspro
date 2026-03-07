# Vercel Deployment Guide

This repo is a **monorepo** with multiple deployable apps. Deploy each app as a **separate Vercel project**.

---

## Project Structure (for Vercel)

| Path | Purpose | Root Directory |
|------|---------|----------------|
| **`apps/web`** | React (Vite) web app — landing, dashboard, all UI | `apps/web` |
| **`api.vorkspro.com`** | Node.js Express API — backend for web, mobile, desktop | `api.vorkspro.com` |

---

## 1. Deploy Web App

1. **Create new Vercel project** → Import your repo
2. **Root Directory**: `apps/web`
3. **Framework Preset**: Vite (auto-detected)
4. **Build Command**: `npm run build` (default)
5. **Output Directory**: `dist` (default)
6. **Environment Variables**: add `VITE_APP_BASE_URL` (your API URL, e.g. `https://api.vorkspro.com/api`)

Vercel will use `apps/web/vercel.json` for rewrites (SPA routing).

---

## 2. Deploy API

1. **Create another Vercel project** → Import the same repo
2. **Root Directory**: `api.vorkspro.com`
3. **Framework Preset**: Other (Node.js)
4. **Build Command**: (leave empty or `npm install`)
5. **Environment Variables**: copy from `api.vorkspro.com/.env` (e.g. `MONGO_URI`, `TOKEN_SECRET`, `CORS_ORIGIN`, etc.)

Vercel will use `api.vorkspro.com/vercel.json` — the API entry is `api/index.js` (Serverless Function).

---

## 3. CORS & Domain Setup

- Set **API domain** (e.g. `api.vorkspro.com`) in Vercel → API project → Domains
- Set **Web domain** (e.g. `vorkspro.com` or `www.vorkspro.com`) in Vercel → Web project → Domains
- Ensure `CORS_ORIGIN` in the API includes your web domain, e.g. `https://vorkspro.com`

---

## Summary

| App | Root Dir | Key env var |
|-----|----------|-------------|
| Web | `apps/web` | `VITE_APP_BASE_URL` → API URL |
| API | `api.vorkspro.com` | `MONGO_URI`, `TOKEN_SECRET`, `CORS_ORIGIN` |

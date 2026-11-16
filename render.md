# SkyStream Flight Booking System — Render Production Deployment Guide 🚀

This document details the production deployment of the **SkyStream Flight Booking System** to **Render** using Docker, GitHub, and MongoDB Atlas.

---

## 1. Production Architecture Overview

The system runs as two independent, containerized services on Render connected over secure HTTPS/WSS:

```text
[ Browser Client ]
       |
       |  HTTPS: https://skystream-frontend.onrender.com
       v
+-------------------------------------------------------------+
| skystream-frontend (Render Docker Web Service)              |
| - Base: nginx:alpine                                        |
| - Serves React 19 + Vite compiled SPA bundle                |
| - Handles client-side SPA routing                           |
| - Reverse proxies /api/* & /socket.io/* to backend          |
+-------------------------------------------------------------+
       |
       |  HTTPS / WSS: https://skystream-backend.onrender.com
       v
+-------------------------------------------------------------+
| skystream-backend (Render Docker Web Service)               |
| - Base: node:22-alpine under dumb-init                      |
| - Runs as non-root user: skystream                          |
| - Dynamic PORT binding on 0.0.0.0                           |
| - REST API & Socket.IO real-time notification engine        |
| - Strict CORS and JWT verification (no hardcoded secrets)   |
+-------------------------------------------------------------+
       |
       |  TLS Encrypted SRV: cluster0.iembpmz.mongodb.net
       v
+-------------------------------------------------------------+
| MongoDB Atlas (Cloud Database - Cluster0)                   |
| - Database: skystream                                       |
| - Pre-seeded with 60 commercial flights & 3600 seats        |
| - ACID Multi-Document Transactions                          |
+-------------------------------------------------------------+
```

---

## 2. Prerequisites & MongoDB Atlas Configuration

### Step A: Verify MongoDB Atlas Network Access
Because Render uses dynamic IP addresses for its free and standard web services, ensure MongoDB Atlas permits inbound traffic:
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Select **Cluster0** ➔ Go to **Security** ➔ **Network Access**.
3. Verify that an entry exists for `0.0.0.0/0` (**Allow Access from Anywhere**).
4. If not present, click **Add IP Address** ➔ Select **Allow Access From Anywhere** (`0.0.0.0/0`) ➔ Click **Confirm**.

### Step B: Database Connection String
Your production connection string format:
```text
mongodb+srv://skystream_admin:<password>@cluster0.iembpmz.mongodb.net/skystream?retryWrites=true&w=majority
```
*(Enter your real database password directly into Render's Environment settings; never commit it to GitHub).*

---

## 3. Deployment Method 1: Render Blueprint (Recommended, 1-Click)

The repository includes a root `render.yaml` specification that automates provisioning both services with linked networking and generated secrets.

1. Navigate to the [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** at the top right ➔ Select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/tishaha09/skystream-flight-booking`.
4. Render will read `render.yaml` and display the blueprint plan:
   - **`skystream-backend`** (Docker Web Service)
   - **`skystream-frontend`** (Docker Web Service)
5. Under `skystream-backend`, Render will prompt you for the uncommitted secret:
   - **`MONGODB_URI`**: Paste your full Atlas connection string:
     `mongodb+srv://skystream_admin:<password>@cluster0.iembpmz.mongodb.net/skystream?retryWrites=true&w=majority`
6. Click **Apply**.
7. Render will automatically:
   - Provision both Docker containers.
   - Generate a strong 256-bit `JWT_SECRET`.
   - Link `CLIENT_ORIGIN` to the frontend URL.
   - Link `BACKEND_URL` to the backend URL.

---

## 4. Deployment Method 2: Manual Service Creation

If you prefer to configure each service manually in Render:

### Service 1: Backend (`skystream-backend`)
1. Click **New +** ➔ **Web Service**.
2. Connect `https://github.com/tishaha09/skystream-flight-booking`.
3. Fill in the service details:
   - **Name:** `skystream-backend`
   - **Region:** `Oregon (US West)` (or closest to your users)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./server/Dockerfile`
   - **Docker Build Context:** `./server`
   - **Instance Type:** `Free`
4. Expand **Advanced** ➔ Set **Health Check Path** to `/api/health`.
5. Add the following **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `MONGODB_URI` | `mongodb+srv://skystream_admin:<password>@cluster0.iembpmz.mongodb.net/skystream?retryWrites=true&w=majority` | Your Atlas connection string |
| `JWT_SECRET` | *(Generate a 32+ char random string)* | E.g. generate via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_EXPIRES_IN` | `7d` | Token validity |
| `CLIENT_ORIGIN` | `https://skystream-frontend.onrender.com` | Update once frontend URL is created |

6. Click **Create Web Service**. Note the assigned backend URL (e.g. `https://skystream-backend.onrender.com`).

---

### Service 2: Frontend (`skystream-frontend`)
1. Click **New +** ➔ **Web Service**.
2. Connect `https://github.com/tishaha09/skystream-flight-booking`.
3. Fill in the service details:
   - **Name:** `skystream-frontend`
   - **Region:** Same as backend (e.g. `Oregon`)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank)*
   - **Runtime:** `Docker`
   - **Dockerfile Path:** `./client/Dockerfile`
   - **Docker Build Context:** `./client`
   - **Instance Type:** `Free`
4. Expand **Advanced** ➔ Set **Health Check Path** to `/`.
5. Add the following **Environment Variables**:

| Variable | Value | Notes |
|---|---|---|
| `BACKEND_URL` | `https://skystream-backend.onrender.com` | Nginx reverse-proxies `/api/` & `/socket.io/` |
| `VITE_API_URL` | `https://skystream-backend.onrender.com` | Direct browser API fallback |
| `VITE_SOCKET_URL` | `https://skystream-backend.onrender.com` | Socket.IO server destination |

6. Click **Create Web Service**.

---

## 5. Post-Deployment Verification Checklist

Once both services report **"Deploy live"**:

- [ ] **Backend Health Check:** Open `https://<backend-url>/api/health` ➔ Returns `{ "status": "ok", "message": "SkyStream API is healthy" }`.
- [ ] **MongoDB Connection:** Check backend deployment logs ➔ Shows `[Database] MongoDB Connected: cluster0.iembpmz.mongodb.net/skystream`.
- [ ] **Flight Search:** Open `https://<frontend-url>/` ➔ Verifies daylight hero banner, live routes, and recent booking cards.
- [ ] **Flight Details & Seat Map:** Click on any scheduled flight ➔ Aircraft fuselage seat map displays live seats (Green = Available, Grey = Occupied).
- [ ] **User Authentication:** 
  - Test login with examiner demo credentials:
    - Admin: `admin@skystream.test` / `Admin@123`
    - User: `user@skystream.test` / `User@123`
- [ ] **Booking Flow:** Select seat(s) ➔ Complete passenger details ➔ Confirm booking ➔ Generates digital boarding pass with PDF/Print export.
- [ ] **Real-Time Push Alerts:** Notification bell icon receives WebSocket updates when new bookings are created.

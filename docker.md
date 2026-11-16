# SkyStream Flight Booking System — Docker & Containerization Guide 🐳

This guide provides end-to-end instructions for running the **SkyStream Flight Booking System** using Docker and Docker Compose, connecting containerized frontend and backend services to your local Windows-hosted MongoDB database without requiring MongoDB Atlas or extra database containers.

---

## 1. Docker Prerequisites

Before getting started, verify that your development environment meets the following requirements:

- **Operating System:** Windows 10/11 64-bit with WSL2 (Windows Subsystem for Linux 2) enabled.
- **Docker Desktop:** Version 4.x or higher with the Docker Compose v2/v5 plugin.
- **Node.js (for local host maintenance, optional):** Node.js v18+ or v22+.
- **Local MongoDB Instance:** MongoDB Community Server (v6.x or v7.x) installed and running locally on Windows on port `27017` (as standalone or single-node replica set `rs0`).

---

## 2. Docker Desktop Setup

1. **Verify WSL2 Integration:**
   - Open **Docker Desktop Settings** ➔ **General** ➔ Ensure **"Use the WSL 2 based engine"** is checked.
   - Go to **Resources** ➔ **WSL Integration** ➔ Enable integration with your default WSL distro (e.g. `Ubuntu`).

2. **Verify Docker Daemon Status:**
   Open a Windows PowerShell terminal or VS Code terminal:
   ```powershell
   docker --version
   docker compose version
   docker info
   ```
   Ensure the output confirms the server is running without errors.

3. **Verify Host Gateway Resolution (`host.docker.internal`):**
   Docker Desktop automatically routes `host.docker.internal` to the host Windows machine (`192.168.65.254`). You can test network reachability from a container:
   ```powershell
   docker run --rm alpine nc -zv host.docker.internal 27017
   ```
   You should see `host.docker.internal (192.168.65.254:27017) open`.

---

## 3. Project Docker Architecture

SkyStream utilizes a production-oriented, two-service microservice layout connected via a custom bridge network (`skystream-network`):

```text
       +-------------------------------------------------------------------+
       |                       Host Machine (Windows)                      |
       |                                                                   |
       |  Browser Client           Local MongoDB Service                   |
       |  http://localhost:5173    mongodb://localhost:27017               |
       +-------|-----------------------------------|-----------------------+
               |                                   |
         Port 5173:80                       host.docker.internal:27017
               |                                   |
+--------------v-----------------------------------|-------------------------------+
| Docker Bridge Network (skystream-network)        |                               |
|                                                  |                               |
|  +------------------------------+                |                               |
|  | frontend (skystream-frontend)|                |                               |
|  | - React 19 + Vite (built)    |                |                               |
|  | - Nginx Web Server (Alpine)  |                |                               |
|  | - Client SPA Router          |                |                               |
|  | - /api/ Reverse Proxy        |                |                               |
|  | - /socket.io/ WebSocket      |                |                               |
|  +--------------|---------------+                |                               |
|                 |                                |                               |
|          http://backend:5000                     |                               |
|                 |                                |                               |
|  +--------------v---------------+                |                               |
|  | backend (skystream-backend)  |                |                               |
|  | - Node.js 22 (Alpine)        |                |                               |
|  | - Express REST API           |                |                               |
|  | - Socket.IO WebSocket Server |----------------+                               |
|  | - Non-root user: skystream   |                                                |
|  | - dumb-init process manager  |                                                |
|  +------------------------------+                                                |
+----------------------------------------------------------------------------------+
```

### Key Architectural Strengths:
1. **Multi-Stage Builds:**
   - **Frontend:** Builds React with Node 22, then discards node_modules and serves static assets using an ultra-light Nginx Alpine container.
   - **Backend:** Compiles dependencies with native C++ tools in Stage 1, then creates a slim runner container executing as a non-root `skystream` user under `dumb-init`.
2. **Same-Origin API Routing:** Nginx proxies `/api/*` and `/socket.io/*` directly to `http://backend:5000` internally. This completely eliminates CORS issues and hostname mismatches.
3. **Local MongoDB Direct Connectivity:** Uses `host.docker.internal:27017` with automatic `directConnection=true` handling so Windows replica set members (`rs0`) never fail with container-local loopback redirection errors.

---

## 4. Environment Variable Configuration

Create a `.env` file at the root of the project (or copy `.env.example`):

```bash
cp .env.example .env
```

### Environment Variables Matrix:

| Variable | Default Value | Description |
|---|---|---|
| `CLIENT_PORT` | `5173` | Host port mapped to the frontend container |
| `SERVER_PORT` | `5000` | Host port mapped to the backend container |
| `NODE_ENV` | `production` | Node execution environment |
| `MONGODB_URI` | `mongodb://host.docker.internal:27017/skystream` | MongoDB connection string pointing to Windows host |
| `JWT_SECRET` | *(Random secret string)* | HMAC-SHA256 signature key for JWT auth tokens |
| `JWT_EXPIRES_IN` | `7d` | Token expiration period |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Permitted CORS origin for browser requests |

> [!NOTE]
> Never commit `.env` containing sensitive credentials to Git. Root `.env`, `client/.env`, and `server/.env` are ignored by `.gitignore` and `.dockerignore`.

---

## 5. How to Build the Containers

To build both the frontend and backend Docker images:

```bash
# Build both images without cache
docker compose build

# Or build images in parallel
docker compose build --parallel
```

To build a specific service:
```bash
docker compose build backend
docker compose build frontend
```

---

## 6. How to Start the Application

Ensure your Windows MongoDB service is running, then execute:

```bash
# Start all containers in the background (detached mode)
docker compose up -d
```

### Verify Container Health & Status:
```bash
docker compose ps
```

You should see both containers marked as `healthy`:
```text
NAME                 SERVICE    STATUS                    PORTS
skystream-backend    backend    Up (healthy)              0.0.0.0:5000->5000/tcp
skystream-frontend   frontend   Up (healthy)              0.0.0.0:5173->80/tcp
```

### Access Points in Your Browser:
- **Frontend SPA Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Direct:** [http://localhost:5000/api/flights](http://localhost:5000/api/flights)
- **Backend Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Proxied Health Check:** [http://localhost:5173/api/health](http://localhost:5173/api/health)

---

## 7. How to Stop the Application

To stop and remove containers and networks gracefully:

```bash
# Stop containers while preserving networks
docker compose stop

# Stop and remove containers and internal network
docker compose down

# Stop, remove containers, and remove image layers
docker compose down --rmi local
```

---

## 8. How to View Container Logs

View consolidated real-time logs across all services:
```bash
# Follow logs for all services
docker compose logs -f

# Follow backend logs only
docker compose logs -f backend

# Follow frontend logs only
docker compose logs -f frontend

# View last 100 log lines
docker compose logs --tail=100
```

---

## 9. How to Rebuild After Code Changes

When source code changes are made in `client/` or `server/`:

```bash
# Rebuild and restart both services with zero downtime
docker compose up -d --build

# Rebuild only the frontend after UI changes
docker compose up -d --build frontend

# Rebuild only the backend after API changes
docker compose up -d --build backend
```

---

## 10. Common Errors & Troubleshooting

### Issue 1: `ECONNREFUSED 127.0.0.1:27017` or `::1:27017`
* **Cause:** The backend container used `localhost` or MongoDB replica set returned `localhost:27017` as the member host.
* **Fix:** The backend Mongoose connection manager in `server/config/db.js` automatically detects `host.docker.internal` and applies `directConnection=true`. Ensure `MONGODB_URI` uses `mongodb://host.docker.internal:27017/skystream`.

### Issue 2: `host.docker.internal:27017` connection timeout
* **Cause:** Windows Defender Firewall is blocking inbound connections from the WSL2 / Docker virtual network adapter, or MongoDB is bound only to `127.0.0.1`.
* **Fix:**
  1. In `C:\Program Files\MongoDB\Server\<version>\bin\mongod.cfg`, ensure `net.bindIp` is set to `127.0.0.1,host.docker.internal` or `0.0.0.0`.
  2. Restart MongoDB service in Windows Services (`services.msc`).

### Issue 3: Port `5000` or `5173` already in use
* **Cause:** A local instance of Node or Vite is already running on the Windows host.
* **Fix:** Find and terminate the process using PowerShell:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
  ```
  Alternatively, customize ports in `.env` (e.g. `CLIENT_PORT=5174`, `SERVER_PORT=5001`).

### Issue 4: Docker Desktop is not running
* **Symptom:** `error during connect: This error may indicate that the docker daemon is not running.`
* **Fix:** Launch **Docker Desktop** from the Windows Start menu and wait until the whale icon in the notification tray shows "Engine running".

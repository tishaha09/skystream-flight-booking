# ====================================================================
# SkyStream Flight Booking System - Backend Dockerfile
# Multi-stage production build for Node.js + Express
# ====================================================================

# Stage 1: Install production dependencies
FROM node:22-alpine AS dependencies

WORKDIR /app

# Install native compilation toolchain (required for bcrypt native builds on alpine)
RUN apk add --no-cache python3 make g++

# Copy package manifests
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Stage 2: Minimal runtime image
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dumb-init for proper signal handling (SIGTERM, SIGINT)
RUN apk add --no-cache dumb-init

# Create dedicated non-root application user for container security
RUN addgroup -S skystream && adduser -S skystream -G skystream

# Copy installed production node_modules from dependencies stage
COPY --from=dependencies --chown=skystream:skystream /app/node_modules ./node_modules
COPY --chown=skystream:skystream package*.json ./

# Copy server application source code
COPY --chown=skystream:skystream . .

# Switch to non-privileged user
USER skystream

# Expose backend REST & WebSocket port (5000 default, 10000 for Render)
EXPOSE 5000 10000

# Container healthcheck querying the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 5000) + '/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Use dumb-init to run the server entry point as PID 1
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "server.js"]

# ====================================================================
# SkyStream Flight Booking System - Frontend Dockerfile
# Multi-stage production build using Node.js & Nginx
# ====================================================================

# Stage 1: Build React + Vite SPA
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies using package-lock for reproducible builds
COPY package*.json ./
RUN npm ci

# Copy application source
COPY . .

# Build the production bundle into dist/
RUN npm run build

# Stage 2: Serve production assets via Nginx
FROM nginx:alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy custom Nginx configuration with reverse proxy and SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose standard HTTP port
EXPOSE 80

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

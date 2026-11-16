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

# Optional build arguments for baking backend URLs at build time
ARG VITE_API_URL=""
ARG VITE_SOCKET_URL=""
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_SOCKET_URL=${VITE_SOCKET_URL}

# Build the production bundle into dist/
RUN npm run build

# Stage 2: Serve production assets via Nginx
FROM nginx:alpine AS runner

# Remove default nginx configurations
RUN rm -rf /etc/nginx/conf.d/default.conf

# Default environment variables for template substitution
ENV PORT=80
ENV BACKEND_URL=http://backend:5000

# Copy custom Nginx template with reverse proxy and dynamic port/backend substitution
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port (80 for local/standard, 10000 for Render)
EXPOSE 80 10000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1:${PORT:-80}/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

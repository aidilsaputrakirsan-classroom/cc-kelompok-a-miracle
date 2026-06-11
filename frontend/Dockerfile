# ============================================================
# Stage 1: Build — Install deps & build React app
# ============================================================
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Set API URL untuk production build
# Jika VITE_API_URL tidak di-pass sebagai build arg, Vite membaca dari .env.production
# Jangan set ENV secara default — Vite 6 memprioritaskan OS env var di atas .env.production
ARG VITE_API_URL
RUN if [ -n "$VITE_API_URL" ]; then export VITE_API_URL; fi && npm run build

# ============================================================
# Stage 2: Production — Serve dengan Nginx
# ============================================================
FROM nginx:alpine

# Install curl untuk healthcheck
RUN apk add --no-cache curl

# Copy build output dari stage 1
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
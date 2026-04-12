# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Set API URL untuk production build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL

# Build React app
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy build output dari stage 1
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Nginx default port
EXPOSE 80

# Jalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
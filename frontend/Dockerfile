# ============================================================
# Stage 1: Build React
# ============================================================
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm rebuild  

RUN npm install

COPY . .

ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ============================================================
# Stage 2: Nginx
# ============================================================
FROM nginx:alpine

# Copy hasil build dari lokal
COPY dist/ /usr/share/nginx/html/

# Config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
#!/bin/bash

ACTION=${1:-start}

case $ACTION in
  start)
    echo "🚀 Starting all containers..."

    # Network (samain sama punyamu)
    docker network create cc-kelompok-a-miracle_default 2>/dev/null || true

    # Database
    echo "📦 Starting database..."
    docker run -d \
      --name tracelt-db \
      --network cc-kelompok-a-miracle_default \
      -e POSTGRES_USER=postgres \
      -e POSTGRES_PASSWORD=postgres \
      -e POSTGRES_DB=tracelt \
      -p 5432:5432 \
      -v pgdata:/var/lib/postgresql/data \
      postgres:15

    echo "⏳ Waiting for database..."
    sleep 5

    # Backend
    echo "🐍 Starting backend..."
    docker run -d \
      --name tracelt-backend \
      --network cc-kelompok-a-miracle_default \
      --env-file backend/.env.docker \
      -p 8000:8000 \
      tracelt-backend:v1

    # Frontend
    echo "⚛️ Starting frontend..."
    docker run -d \
      --name tracelt-frontend \
      --network cc-kelompok-a-miracle_default \
      -p 3000:80 \
      tracelt-frontend:v1-fe

    echo ""
    echo "✅ All containers started!"
    echo "Frontend: http://localhost:3000"
    echo "Backend : http://localhost:8000"
    echo "Database: localhost:5432"
    ;;

  stop)
    echo "🛑 Stopping all containers..."
    docker stop tracelt-frontend tracelt-backend tracelt-db 2>/dev/null
    docker rm tracelt-frontend tracelt-backend tracelt-db 2>/dev/null
    echo "✅ All containers stopped and removed."
    ;;

  status)
    echo "📊 Container Status:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
    ;;

  logs)
    CONTAINER=${2:-tracelt-backend}
    echo "📋 Logs for $CONTAINER:"
    docker logs -f $CONTAINER
    ;;

  *)
    echo "Usage: ./scripts/docker-run.sh [start|stop|status|logs [container]]"
    ;;
esac
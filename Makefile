# ==============================================
# Makefile — Tracelt Microservices
# ==============================================

.PHONY: dev prod up down build logs ps status clean restart health help

# ==================== DEVELOPMENT ====================
dev:
	docker compose up --build -d

# ==================== PRODUCTION ====================
prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# ==================== BASIC COMMANDS ====================
up:
	docker compose up -d

up-fast:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build --no-cache

rebuild:
	docker compose up --build -d

restart:
	docker compose restart

# ==================== LOGS & STATUS ====================
logs:
	docker compose logs -f

logs-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

ps:
	docker compose ps

ps-prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml ps

status:
	docker compose ps

# ==================== CLEAN ====================
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

# ==================== HELPER ====================
health:
	@echo "=== Health Check All Services ==="
	curl -s http://localhost/health | jq || echo "Gateway: Failed"
	curl -s http://localhost/auth/health | jq || echo "Auth Service: Failed"

# ==================== HELP ====================
help:
	@echo "=== Tracelt Makefile Commands ==="
	@echo "make dev          : Development mode"
	@echo "make prod         : Production mode (with prod overrides)"
	@echo "make up           : Start services"
	@echo "make down         : Stop services"
	@echo "make ps           : Show container status"
	@echo "make logs         : Show live logs"
	@echo "make build        : Rebuild images"
	@echo "make clean        : Clean everything"
	@echo "make health       : Manual health check"
	@echo "make help         : Show this help"
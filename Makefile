# ==============================================
# Makefile — Tracelt Microservices
# ==============================================

.PHONY: up down build logs ps restart clean help

# Default
up:
	docker compose up --build -d

# Start tanpa build (lebih cepat)
up-fast:
	docker compose up -d

# Stop semua container
down:
	docker compose down

# Stop + hapus volume (hati-hati, data hilang!)
clean:
	docker compose down -v --rmi local

# Build ulang semua image
build:
	docker compose build --no-cache

# Lihat status semua container
ps:
	docker compose ps

# Lihat logs semua service
logs:
	docker compose logs -f

# Logs per service
auth-logs:
	docker compose logs -f auth-service

item-logs:
	docker compose logs -f item-service

frontend-logs:
	docker compose logs -f frontend

gateway-logs:
	docker compose logs -f gateway

# Restart semua service
restart:
	docker compose restart

# Restart satu service
restart-auth:
	docker compose restart auth-service

restart-item:
	docker compose restart item-service

# Health check manual
health:
	@echo "=== Health Check All Services ==="
	curl -s http://localhost/health | jq || echo "Gateway: Failed"
	curl -s http://localhost/auth/health | jq || echo "Auth Service: Failed"

# Help
help:
	@echo "=== Tracelt Microservices Commands ==="
	@echo "make up           : Start all services with build"
	@echo "make up-fast      : Start without rebuild"
	@echo "make down         : Stop services"
	@echo "make ps           : Show container status"
	@echo "make logs         : Show all logs"
	@echo "make build        : Rebuild all images"
	@echo "make clean        : Clean everything (careful!)"
	@echo "make health       : Manual health check"
	@echo "make help         : Show this help"
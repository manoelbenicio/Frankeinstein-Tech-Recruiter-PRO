SHELL := /bin/bash
.PHONY: dev dev-prod stop test lint build uat

dev:
	docker compose -f docker-compose.yml -f docker-compose.override.yml up --build backend frontend_dev

dev-prod:
	docker compose up --build

stop:
	docker compose down

test:
	cd backend && poetry install --no-interaction --no-ansi || true
	cd backend && poetry run pytest -q || true

lint:
	cd frontend && yarn install --silent || true
	cd frontend && yarn lint || true
	cd backend && poetry run flake8 || true

build:
	docker compose build

uat:
	@echo "Roteiro de UAT será definido em docs/10-uat-checklist.md"

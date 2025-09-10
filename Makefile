SHELL := /bin/bash

.PHONY: bootstrap up down dev lint typecheck test build migrate seed evals

bootstrap:
	pnpm install

up:
	docker compose up -d

down:
	docker compose down

dev:
	pnpm -r --parallel run dev

lint:
	pnpm -r run lint

typecheck:
	pnpm -r run typecheck

test:
	pnpm -r run test

build:
	pnpm -r run build

migrate:
	pnpm -r run migrate

seed:
	pnpm -r run seed

evals:
	pnpm -r run evals


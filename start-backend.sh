#!/bin/bash
# Starts the Spring Boot backend using credentials from .env, so the
# rdelivery_app DB password never has to be typed on the command line.
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Error: .env not found. Copy .env.example to .env and set DB_PASSWORD first." >&2
  exit 1
fi

set -a
source .env
set +a

if [ -z "${DB_PASSWORD:-}" ] || [ "$DB_PASSWORD" = "CHANGE_ME" ]; then
  echo "Error: DB_PASSWORD is not set in .env." >&2
  exit 1
fi

if ! systemctl is-active --quiet mysql; then
  echo "MySQL is not running. Starting it..." >&2
  sudo systemctl start mysql
fi

SPRING_DATASOURCE_USERNAME=rdelivery_app SPRING_DATASOURCE_PASSWORD="$DB_PASSWORD" ./mvnw spring-boot:run

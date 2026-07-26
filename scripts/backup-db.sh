#!/bin/bash
# Orbit Database Backup Script (Single-VM Host Cron Task)
set -e

CONTAINER_NAME="${POSTGRES_CONTAINER_NAME:-orbit-postgres}"
DB_USER="${POSTGRES_USER:-orbit}"
DB_NAME="${POSTGRES_DB:-orbit}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/orbit_db_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[Backup] Starting PostgreSQL database backup for '${DB_NAME}' from container '${CONTAINER_NAME}'..."

if command -v docker >/dev/null 2>&1; then
  docker exec "${CONTAINER_NAME}" pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"
else
  echo "[Backup Error] Docker CLI not found on host PATH. Using pg_dump directly..."
  pg_dump -U "${DB_USER}" -d "${DB_NAME}" --clean --if-exists | gzip > "${BACKUP_FILE}"
fi

echo "[Backup] Backup created successfully: ${BACKUP_FILE}"
echo "[Backup] Retention policy: Pruning backup archives older than 7 days..."
find "${BACKUP_DIR}" -name "orbit_db_*.sql.gz" -mtime +7 -delete || true
echo "[Backup] Completed."

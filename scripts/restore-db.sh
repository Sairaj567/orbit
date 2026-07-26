#!/bin/bash
# Orbit Database Restore Script
set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <path-to-backup-file.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="${POSTGRES_CONTAINER_NAME:-orbit-postgres}"
DB_USER="${POSTGRES_USER:-orbit}"
DB_NAME="${POSTGRES_DB:-orbit}"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "[Restore Error] Backup archive file '${BACKUP_FILE}' does not exist."
  exit 1
fi

echo "[Restore] WARNING: Restoring will overwrite existing data in '${DB_NAME}'."
echo "[Restore] Restoring from file: ${BACKUP_FILE}"

if command -v docker >/dev/null 2>&1; then
  gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"
else
  echo "[Restore] Docker CLI not found. Restoring directly via psql..."
  gunzip -c "${BACKUP_FILE}" | psql -U "${DB_USER}" -d "${DB_NAME}"
fi

echo "[Restore] Database restore completed successfully."

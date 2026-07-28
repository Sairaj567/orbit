#!/bin/bash
set -e

# Usage:
#   ./scripts/db_backup_restore.sh backup <backup_file.sql>
#   ./scripts/db_backup_restore.sh restore <backup_file.sql>

ACTION=$1
FILE=$2

if [ -z "$ACTION" ] || [ -z "$FILE" ]; then
  echo "Usage: $0 <backup|restore> <file>"
  exit 1
fi

CONTAINER_NAME="orbit-postgres"
DB_USER=$(cat ./docker/secrets/db_user.txt 2>/dev/null || echo "orbit")
DB_NAME=$(cat ./docker/secrets/db_name.txt 2>/dev/null || echo "orbit")

if [ "$ACTION" = "backup" ]; then
  echo "Starting backup of $DB_NAME to $FILE..."
  docker exec -t $CONTAINER_NAME pg_dump -U $DB_USER -d $DB_NAME -F c > "$FILE"
  echo "Backup completed successfully."
elif [ "$ACTION" = "restore" ]; then
  echo "Starting restore from $FILE to $DB_NAME..."
  # Terminate existing connections and drop/recreate DB for a clean restore
  docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres -c "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();"
  docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
  docker exec -i $CONTAINER_NAME psql -U $DB_USER -d postgres -c "CREATE DATABASE $DB_NAME;"
  
  cat "$FILE" | docker exec -i $CONTAINER_NAME pg_restore -U $DB_USER -d $DB_NAME -1
  echo "Restore completed successfully."
else
  echo "Invalid action: $ACTION"
  exit 1
fi

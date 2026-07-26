#!/bin/sh
set -e

echo "==> Running Prisma database migrations (prisma migrate deploy)..."
./apps/api/node_modules/.bin/prisma migrate deploy --schema=apps/api/prisma/schema.prisma

echo "==> Migration check completed. Starting Orbit API..."
exec "$@"

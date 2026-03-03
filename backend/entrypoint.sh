#!/bin/sh
set -e

echo ">>> Running database migrations..."
node node_modules/typeorm/cli.js migration:run -d dist/data-source.js

echo ">>> Seeding database (best-effort)..."
node dist/seeds/seed.js || echo "[WARN] Seeding failed or data already exists — continuing."

echo ">>> Starting application..."
exec node dist/main

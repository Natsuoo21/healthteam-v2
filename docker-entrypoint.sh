#!/bin/sh
set -e

echo "[healthteam] Syncing database schema..."
npx prisma db push --skip-generate 2>&1 || echo "[healthteam] WARN: prisma db push failed — DB may need manual setup"

echo "[healthteam] Starting server..."
exec node server.js

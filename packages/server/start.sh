#!/bin/sh
set -e

echo "Syncing database schema..."
npx prisma db push

echo "Starting API server..."
exec node dist/index.js

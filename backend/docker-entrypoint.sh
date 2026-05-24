#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Ensuring default administrator exists..."
node prisma/seed.js

echo "Starting API server..."
exec node src/index.js

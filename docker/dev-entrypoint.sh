#!/bin/sh
set -eu

if [ ! -x node_modules/.bin/next ]; then
  echo "Instalando dependencias..."
  npm ci
fi

npx prisma generate
npx prisma migrate deploy
npm run db:seed

exec npm run dev -- --hostname 0.0.0.0 --port 3000

#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: falta DATABASE_URL en el entorno de Render."
  echo "1) Dashboard → New → PostgreSQL (misma region que el web)."
  echo "2) En la DB, copia Internal Database URL."
  echo "3) Web service → Environment → Add DATABASE_URL (pega esa URL)."
  echo "   Si usas External URL, agrega al final: ?sslmode=require"
  echo "4) Save y Manual Deploy. Las keys de Stripe no sustituyen esto."
  exit 1
fi

if [ -x ./node_modules/.bin/prisma ]; then
  ./node_modules/.bin/prisma migrate deploy
else
  node ./node_modules/prisma/build/index.js migrate deploy
fi

if [ -f ./prisma/seed.cjs ]; then
  node ./prisma/seed.cjs
fi

exec node server.js

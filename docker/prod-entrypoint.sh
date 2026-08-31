#!/bin/sh
set -eu

if [ -x ./node_modules/.bin/prisma ]; then
  ./node_modules/.bin/prisma migrate deploy
else
  node ./node_modules/prisma/build/index.js migrate deploy
fi

exec node server.js

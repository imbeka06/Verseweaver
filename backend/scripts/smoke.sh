#!/bin/bash
# Backend smoke test — boots the server without a DB and verifies the routes are
# wired (each should return 500 with no DB, NOT 404) and /health responds.
#
# NOTE (Windows/MSYS): the server can take ~10s to become reachable after the
# "running" log (Windows socket-readiness delay), so poll up to 20s.
cd /d/verseweaver/backend

PORT=4020
HOST="http://localhost:${PORT}"

PORT="${PORT}" DATABASE_URL="postgresql://u:p@localhost:5432/x" STRICT_AUTH=false node src/server.js > /tmp/vw-boot.log 2>&1 &
PID=$!

up=0
for i in $(seq 1 20); do
  sleep 1
  if curl -s -o /dev/null "${HOST}/api/health"; then
    up=1
    break
  fi
done

if [ "$up" -ne 1 ]; then
  echo "SERVER DID NOT COME UP"
  cat /tmp/vw-boot.log
  kill $PID 2>/dev/null
  exit 1
fi

echo "=== boot log ==="
cat /tmp/vw-boot.log

echo "=== route wiring (expect 500 with no DB, NOT 404) ==="
for ep in /api/auth/me /api/workspace /api/manuscript /api/characters /api/roadmap /api/socials/overview; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-vw-role: owner" -H "x-vw-user-id: u1" "${HOST}${ep}")
  printf "%-24s -> %s\n" "$ep" "$code"
done

echo "=== health ==="
curl -s "${HOST}/api/health"
echo

kill $PID 2>/dev/null
sleep 1
# Reap any orphaned node child so it releases the Prisma query-engine DLL.
powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { \$_.Modules | Where-Object { \$_.ModuleName -like '*query_engine*' } } | Stop-Process -Force" 2>/dev/null
echo "=== done ==="

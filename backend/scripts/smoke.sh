#!/bin/bash
cd /d/verseweaver/backend
PORT=4015 DATABASE_URL="postgresql://u:p@localhost:5432/x" STRICT_AUTH=false node src/server.js > /tmp/vw-boot.log 2>&1 &
PID=$!
sleep 6

echo "=== boot log ==="
cat /tmp/vw-boot.log

echo "=== route wiring (expect 500 with no DB, NOT 404) ==="
for ep in /api/auth/me /api/workspace /api/manuscript /api/characters /api/roadmap /api/socials/overview; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "x-vw-role: owner" -H "x-vw-user-id: u1" "http://localhost:4015$ep")
  printf "%-24s -> %s\n" "$ep" "$code"
done

echo "=== health ==="
curl -s http://localhost:4015/api/health
echo

kill $PID 2>/dev/null
sleep 1
# Ensure the node child is reaped on Windows/MSYS
powershell -NoProfile -Command "Get-Process node -ErrorAction SilentlyContinue | Where-Object { \$_.Modules | Where-Object { \$_.ModuleName -like '*query_engine*' } } | Stop-Process -Force" 2>/dev/null
echo "=== done ==="

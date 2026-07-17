#!/bin/bash
# Reports the status of everything the app depends on: MySQL, the Spring Boot
# backend, and the ngrok tunnel (including whether it can actually reach the
# backend, not just whether the process is running).
set -uo pipefail
cd "$(dirname "$0")"

echo "=== MySQL ==="
if systemctl is-active --quiet mysql; then
  echo "✓ running"
else
  echo "✗ not running (start with: sudo systemctl start mysql)"
fi

echo ""
echo "=== Backend (port 8080) ==="
CODE=$(curl -s -m 3 -o /dev/null -w "%{http_code}" http://localhost:8080/api/restaurants 2>/dev/null)
if [ "$CODE" = "403" ] || [ "$CODE" = "200" ]; then
  echo "✓ running (HTTP $CODE — 403 is expected without a token)"
else
  echo "✗ not reachable (start with: ./start-backend.sh)"
fi

echo ""
echo "=== ngrok tunnel ==="
TUNNEL_JSON=$(curl -s -m 3 http://localhost:4040/api/tunnels 2>/dev/null)
if [ -n "$TUNNEL_JSON" ]; then
  URL=$(echo "$TUNNEL_JSON" | grep -oP '"public_url":"\K[^"]+' | head -1)
  echo "✓ running — $URL"

  ENV_URL=$(grep "^EXPO_PUBLIC_URL=" .env 2>/dev/null | cut -d= -f2)
  if [ "$URL" != "$ENV_URL" ]; then
    echo "  ⚠ .env has a different URL ($ENV_URL) — update EXPO_PUBLIC_URL and restart Metro"
  fi

  TUNNEL_CODE=$(curl -s -m 5 -o /dev/null -w "%{http_code}" "$URL/api/restaurants" 2>/dev/null)
  if [ "$TUNNEL_CODE" = "403" ] || [ "$TUNNEL_CODE" = "200" ]; then
    echo "  ✓ reaches the backend (HTTP $TUNNEL_CODE)"
  else
    echo "  ✗ cannot reach the backend through the tunnel (HTTP $TUNNEL_CODE) — is the backend running?"
  fi
else
  echo "✗ not running (start with: ~/.local/bin/ngrok http 8080, or the pinned --domain command in README)"
fi

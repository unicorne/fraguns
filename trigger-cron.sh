#!/bin/bash
# Triggers the FragUns cron job - run with: ./trigger-cron.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.local"

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: $ENV_FILE not found" >&2
  exit 1
fi

# Load CRON_SECRET from .env.local without exporting everything
CRON_SECRET="$(grep -E '^CRON_SECRET=' "$ENV_FILE" | head -n1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"

if [ -z "${CRON_SECRET:-}" ]; then
  echo "Error: CRON_SECRET not set in $ENV_FILE" >&2
  exit 1
fi

curl -s "https://fraguns.vercel.app/api/cron/daily" \
  -H "Authorization: Bearer $CRON_SECRET"
echo ""
echo "Done at $(date)"

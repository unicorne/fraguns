#!/bin/bash
# Triggers the FragUns cron job - run with: ./trigger-cron.sh
curl -s "https://fraguns.vercel.app/api/cron/daily" \
  -H "Authorization: Bearer 18085d270a6bb6e30520b590809f4f0135edb158114b4cd72280603730059912"
echo ""
echo "Done at $(date)"

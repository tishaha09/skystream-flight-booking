#!/bin/sh
# Ensures BACKEND_URL has a valid protocol prefix (http:// or https://)
if [ -n "$BACKEND_URL" ]; then
  case "$BACKEND_URL" in
    http://*|https://*) ;;
    *) export BACKEND_URL="https://$BACKEND_URL" ;;
  esac
fi

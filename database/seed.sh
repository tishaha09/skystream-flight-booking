#!/usr/bin/env bash

# ====================================================================
# SkyStream Flight Booking System - Database Seeding Script (Bash)
# ====================================================================

set -e

# Change directory to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

echo "========================================================"
echo "          SKYSTREAM DATABASE SEED SCRIPT               "
echo "========================================================"

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "[Error] Node.js is not found in PATH."
    echo "Please install Node.js (v18+) before running this seed script."
    exit 1
fi

# Check if server/node_modules exists
if [ ! -d "server/node_modules" ]; then
    echo "[Info] Server node_modules not detected. Installing dependencies..."
    cd server
    npm install
    cd ..
fi

echo "[Info] Executing database/seed.js using Node.js..."
node "$SCRIPT_DIR/seed.js" "$@"

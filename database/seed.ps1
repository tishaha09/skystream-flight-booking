# ====================================================================
# SkyStream Flight Booking System - Database Seeding Script (PowerShell)
# ====================================================================

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
Set-Location $projectRoot

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          SKYSTREAM DATABASE SEED SCRIPT (PowerShell)  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Check if node is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[Error] Node.js is not found in PATH." -ForegroundColor Red
    Write-Host "Please install Node.js (v18+) before running this seed script."
    exit 1
}

# Check if server/node_modules exists
if (-not (Test-Path "server\node_modules")) {
    Write-Host "[Info] Server node_modules not detected. Installing dependencies..." -ForegroundColor Yellow
    Set-Location "server"
    npm.cmd install
    Set-Location $projectRoot
}

Write-Host "[Info] Executing database/seed.js using Node.js..." -ForegroundColor Green
node "$scriptDir\seed.js" @args

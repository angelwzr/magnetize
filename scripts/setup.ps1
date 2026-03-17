# Magnetize Local Setup Script
Write-Host "🧲 Initializing Magnetize Development Environment..." -ForegroundColor Cyan

# 1. Install Dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Gray
npm install

# 2. Setup Environment Variables
if (-not (Test-Path .env)) {
    Write-Host "`n📄 Creating .env from .env.example..." -ForegroundColor Gray
    Copy-Item .env.example .env
    Write-Host "✅ .env created. Please update it with your API_KEY." -ForegroundColor Yellow
} else {
    Write-Host "`nℹ️ .env already exists, skipping copy." -ForegroundColor Gray
}

# 3. Run Initial Tests
Write-Host "`n🧪 Running initial test suite..." -ForegroundColor Gray
npm test

Write-Host "`n🚀 Setup complete! Run 'npm run dev' to start the server." -ForegroundColor Green

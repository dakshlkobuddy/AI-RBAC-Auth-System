# Email CRM System - Startup Script
# Run this to start the entire system

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          EMAIL CRM SYSTEM - STARTUP SCRIPT            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Kill existing processes
Write-Host "Stopping any existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Clear any old jobs
Remove-Job -Name server -Force -ErrorAction SilentlyContinue

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Yellow
cd "c:\Users\daksh\Desktop\ai rbac system\backend"
Start-Job -ScriptBlock { 
    Set-Location "c:\Users\daksh\Desktop\ai rbac system\backend"
    node simple-server.js 
} -Name server | Out-Null

Start-Sleep -Seconds 3

Write-Host "`n✓ Backend Server Started!" -ForegroundColor Green
Write-Host "  URL: http://localhost:5000" -ForegroundColor Green
Write-Host "  API: POST http://localhost:5000/api/emails/receive" -ForegroundColor Green

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               SYSTEM IS READY TO USE                   ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Login as marketing@company.com (marketing123)" -ForegroundColor White
Write-Host "3. Send test emails using PowerShell commands (see below)" -ForegroundColor White
Write-Host "`nTest Enquiry Email:" -ForegroundColor Yellow
Write-Host '$body = @{fromEmail = "alice@company.com"; fromName = "Alice"; subject = "Pricing"; message = "What is your pricing?"} | ConvertTo-Json; (Invoke-WebRequest -Uri http://localhost:5000/api/emails/receive -Method POST -Headers @{"Content-Type"="application/json"} -Body $body).Content' -ForegroundColor Gray
Write-Host "`nTest Support Email:" -ForegroundColor Yellow
Write-Host '$body = @{fromEmail = "bob@company.com"; fromName = "Bob"; subject = "Error"; message = "I have an access denied error"} | ConvertTo-Json; (Invoke-WebRequest -Uri http://localhost:5000/api/emails/receive -Method POST -Headers @{"Content-Type"="application/json"} -Body $body).Content' -ForegroundColor Gray
Write-Host ""

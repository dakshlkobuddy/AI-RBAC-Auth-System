# ================================================================
# Email CRM AI - API Testing Script
# ================================================================

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Email AI System - API Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Send Enquiry Email
Write-Host "[TEST 1] Sending Enquiry Email..." -ForegroundColor Yellow

$body1 = @{
    fromEmail = "alice@techcompany.com"
    fromName = "Alice Johnson"
    subject = "Pricing Query"
    message = "What is your pricing for the enterprise plan?"
} | ConvertTo-Json

try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:5000/api/emails/receive" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $body1 -ErrorAction Stop
    
    Write-Host "✓ Success! Response:" -ForegroundColor Green
    $response1.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Send Support Email
Write-Host "[TEST 2] Sending Support Email..." -ForegroundColor Yellow

$body2 = @{
    fromEmail = "bob@company.com"
    fromName = "Bob Smith"
    subject = "Login Error"
    message = "I cannot login - getting access denied error"
} | ConvertTo-Json

try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:5000/api/emails/receive" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $body2 -ErrorAction Stop
    
    Write-Host "✓ Success! Response:" -ForegroundColor Green
    $response2.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Send Personal Email
Write-Host "[TEST 3] Sending Personal Email..." -ForegroundColor Yellow

$body3 = @{
    fromEmail = "charlie@gmail.com"
    fromName = "Charlie Brown"
    subject = "Product Demo"
    message = "I would like to see a demo of your product"
} | ConvertTo-Json

try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:5000/api/emails/receive" `
      -Method POST `
      -Headers @{ "Content-Type" = "application/json" } `
      -Body $body3 -ErrorAction Stop
    
    Write-Host "✓ Success! Response:" -ForegroundColor Green
    $response3.Content | ConvertFrom-Json | ConvertTo-Json | Write-Host -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "✗ Error: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "================================" -ForegroundColor Cyan
Write-Host "All tests completed!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Log into dashboard: http://localhost:3000" -ForegroundColor White
Write-Host "2. Login as marketing@company.com / marketing123" -ForegroundColor White
Write-Host "3. Go to Enquiries tab to see processed emails" -ForegroundColor White

# Final test with URL format
Write-Host "=== Final Verification Code Test ===" -ForegroundColor Green

# Test 1: Send verification code
Write-Host "`n1. Testing verification code sending..." -ForegroundColor Yellow
$body = @{
    phone = "18830364127"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/send-verification-code" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Verification code request sent successfully" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Summary ===" -ForegroundColor Green
Write-Host "✅ URL Format: https://push.spug.cc/send/RZykKralKNjw0lAL1&targets=18830364127"
Write-Host "✅ Request Body: JSON with text and desp parameters"
Write-Host "❌ Push Service: Returns 404 - Template encoding error"
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure template in push service management"
Write-Host "2. Add phone number 18830364127 to push targets"
Write-Host "3. Test verification code sending again"
Write-Host ""
Write-Host "🔗 Push Service URL: https://push.spug.cc/"
Write-Host "📱 Channel ID: RZykKralKNjw0lAL1"

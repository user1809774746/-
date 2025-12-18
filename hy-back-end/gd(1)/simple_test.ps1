# Simple verification test
$baseUrl = "http://localhost:8081/api/auth"
$testPhone = "18830364127"

Write-Host "Testing verification code sending..."

# Test 1: Send verification code
$body = @{
    phone = $testPhone
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/send-verification-code" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Verification code request sent successfully"
    Write-Host "Response code: $($response.code)"
    
    # Get verification code from test API
    Start-Sleep -Seconds 2
    $codeResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/test/get-sent-code/$testPhone" -Method GET
    if ($codeResponse.code -eq 200) {
        $verificationCode = $codeResponse.verificationCode
        Write-Host "Verification code: $verificationCode"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "Test completed"

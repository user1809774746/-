# Test alternative format
$baseUrl = "https://push.spug.cc/send/E3w5LmlZzZrxYea4"
$phone = "18830364127"
$code = (100000 + (Get-Random -Maximum 900000)).ToString()

Write-Host "Testing alternative format"
Write-Host "Channel: E3w5LmlZzZrxYea4"
Write-Host "Phone: $phone"
Write-Host "Code: $code"

$url = "$baseUrl" + "&targets=" + $phone
Write-Host "URL: $url"

# Try different parameter names
$body1 = @{
    title = "Verification Code"
    content = "Your code is: $code"
} | ConvertTo-Json

Write-Host "Trying title/content format..."
try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body1 -ContentType "application/json"
    Write-Host "Response: $($response | ConvertTo-Json)"
    
    if ($response.code -eq 200) {
        Write-Host "SUCCESS with title/content!"
        exit 0
    } else {
        Write-Host "Failed: $($response.code) - $($response.msg)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

# Try message format
$body2 = @{
    message = "Your verification code is: $code"
} | ConvertTo-Json

Write-Host "Trying message format..."
try {
    $response = Invoke-RestMethod -Uri $url -Method POST -Body $body2 -ContentType "application/json"
    Write-Host "Response: $($response | ConvertTo-Json)"
    
    if ($response.code -eq 200) {
        Write-Host "SUCCESS with message!"
        exit 0
    } else {
        Write-Host "Failed: $($response.code) - $($response.msg)"
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "All formats failed"

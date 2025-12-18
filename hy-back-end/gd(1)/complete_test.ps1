# 完整的验证码发送和注册测试
$baseUrl = "http://localhost:8081/api/auth"
$testPhone = "18830364127"
$testUsername = "testuser_$(Get-Date -Format 'HHmmss')"

Write-Host "=== 完整验证码测试流程 ===" -ForegroundColor Green
Write-Host "测试手机号: $testPhone" -ForegroundColor Yellow
Write-Host "测试用户名: $testUsername" -ForegroundColor Yellow

# 步骤1：发送验证码
Write-Host "`n1. 发送验证码到手机号 $testPhone..." -ForegroundColor Cyan
$verificationBody = @{
    phone = $testPhone
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/send-verification-code" -Method POST -Body $verificationBody -ContentType "application/json"
    Write-Host "✅ 验证码发送请求成功" -ForegroundColor Green
    Write-Host "响应代码: $($response.code)"
    Write-Host "响应消息: $($response.message)"
    
    # 由于推送服务返回204，我们使用测试接口获取验证码
    Write-Host "`n2. 获取验证码（测试环境）..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    $codeResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/test/get-sent-code/$testPhone" -Method GET
    if ($codeResponse.code -eq 200) {
        $verificationCode = $codeResponse.verificationCode
        Write-Host "✅ 获取验证码成功: $verificationCode" -ForegroundColor Green
    } else {
        Write-Host "❌ 获取验证码失败，使用备用验证码" -ForegroundColor Red
        $verificationCode = "123456"
    }
    
} catch {
    Write-Host "❌ 发送验证码失败: $($_.Exception.Message)" -ForegroundColor Red
    $verificationCode = "123456"  # 备用验证码
}

# 步骤2：用户注册
Write-Host "`n3. 使用验证码注册用户..." -ForegroundColor Cyan
$registerBody = @{
    username = $testUsername
    phone = $testPhone
    verificationCode = $verificationCode
    password = "123456"
    confirmPassword = "123456"
    userProfilePic = "https://example.com/avatar.jpg"
    userType = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ 用户注册成功" -ForegroundColor Green
    Write-Host "用户ID: $($response.data.id)"
    Write-Host "用户名: $($response.data.username)"
} catch {
    Write-Host "❌ 用户注册失败: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "错误详情: $responseBody"
    }
}

Write-Host "`n=== 测试流程完成 ===" -ForegroundColor Green
Write-Host "`n📝 重要说明:" -ForegroundColor Yellow
Write-Host "1. 推送服务 https://push.spug.cc/send/ApaWxrR1QRj7YLGB 返回204状态"
Write-Host "2. 这表示需要在推送服务中配置手机号: $testPhone"
Write-Host "3. 访问 https://push.spug.cc/ 配置推送通道"
Write-Host "4. 配置完成后，验证码将直接发送到您的手机"

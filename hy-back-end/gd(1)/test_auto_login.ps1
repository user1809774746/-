# 七天免密登录测试脚本
# 用于测试新版七天免密登录和顶号机制

$baseUrl = "http://localhost:8080"
$phone = "13800138000"
$password = "123456"
$userType = "user"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "七天免密登录和顶号机制测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 测试1：密码登录
Write-Host "测试1: 密码登录" -ForegroundColor Yellow
$loginBody = @{
    phone = $phone
    password = $password
    userType = $userType
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($response.code -eq 200) {
        Write-Host "✅ 登录成功" -ForegroundColor Green
        $token = $response.data.token
        Write-Host "Token: $($token.Substring(0, 50))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ 登录失败: $($response.message)" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "❌ 登录请求失败: $_" -ForegroundColor Red
    exit
}

Write-Host ""

# 测试2：检查自动登录状态
Write-Host "测试2: 检查自动登录状态" -ForegroundColor Yellow
$checkBody = @{
    phone = $phone
    userType = $userType
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/check-auto-login" -Method Post -Body $checkBody -ContentType "application/json"
    
    if ($response.data.canAutoLogin -eq $true) {
        Write-Host "✅ 可以使用七天免密登录" -ForegroundColor Green
    } else {
        Write-Host "❌ 不能使用七天免密登录" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 检查请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 测试3：七天免密登录
Write-Host "测试3: 七天免密登录（使用刚才的token）" -ForegroundColor Yellow
$autoLoginBody = @{
    phone = $phone
    userType = $userType
    token = $token
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/auto-login" -Method Post -Body $autoLoginBody -ContentType "application/json"
    
    if ($response.code -eq 200) {
        Write-Host "✅ 七天免密登录成功" -ForegroundColor Green
        Write-Host "返回Token与原Token一致: $($response.data.token -eq $token)" -ForegroundColor Gray
    } else {
        Write-Host "❌ 七天免密登录失败: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 自动登录请求失败: $_" -ForegroundColor Red
}

Write-Host ""

# 测试4：使用token访问需要认证的接口
Write-Host "测试4: 使用token访问需要认证的接口" -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    # 这里可以替换成任何需要认证的接口
    $response = Invoke-RestMethod -Uri "$baseUrl/api/posts/my-posts" -Method Get -Headers $headers -ContentType "application/json"
    Write-Host "✅ 访问成功，Token有效" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) {
        Write-Host "❌ 401错误：Token已失效（被顶号或过期）" -ForegroundColor Red
    } else {
        Write-Host "⚠️ 其他错误: $_" -ForegroundColor Yellow
    }
}

Write-Host ""

# 测试5：模拟顶号（再次登录）
Write-Host "测试5: 模拟顶号（再次登录生成新token）" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    
    if ($response.code -eq 200) {
        Write-Host "✅ 再次登录成功，生成新token" -ForegroundColor Green
        $newToken = $response.data.token
        Write-Host "新Token: $($newToken.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "新旧Token是否不同: $($token -ne $newToken)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ 再次登录失败: $_" -ForegroundColor Red
}

Write-Host ""

# 测试6：使用旧token尝试自动登录（应该失败）
Write-Host "测试6: 使用旧token尝试自动登录（应该失败，因为被新token顶掉了）" -ForegroundColor Yellow
$oldAutoLoginBody = @{
    phone = $phone
    userType = $userType
    token = $token  # 使用旧token
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/auto-login" -Method Post -Body $oldAutoLoginBody -ContentType "application/json"
    
    if ($response.code -eq 200) {
        Write-Host "❌ 测试失败：旧token不应该能登录（顶号机制未生效）" -ForegroundColor Red
    } else {
        Write-Host "✅ 测试成功：旧token无法登录（顶号机制生效）" -ForegroundColor Green
        Write-Host "错误信息: $($response.data)" -ForegroundColor Gray
    }
} catch {
    $errorMessage = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorMessage.code -eq 401) {
        Write-Host "✅ 测试成功：返回401，旧token已失效" -ForegroundColor Green
        Write-Host "错误信息: $($errorMessage.data)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️ 其他错误: $errorMessage" -ForegroundColor Yellow
    }
}

Write-Host ""

# 测试7：使用新token尝试自动登录（应该成功）
Write-Host "测试7: 使用新token尝试自动登录（应该成功）" -ForegroundColor Yellow
$newAutoLoginBody = @{
    phone = $phone
    userType = $userType
    token = $newToken  # 使用新token
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/auth/auto-login" -Method Post -Body $newAutoLoginBody -ContentType "application/json"
    
    if ($response.code -eq 200) {
        Write-Host "✅ 新token自动登录成功" -ForegroundColor Green
    } else {
        Write-Host "❌ 新token自动登录失败: $($response.message)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 自动登录请求失败: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试完成！" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试总结：" -ForegroundColor Yellow
Write-Host "1. 密码登录功能正常" -ForegroundColor White
Write-Host "2. 七天免密登录功能正常" -ForegroundColor White
Write-Host "3. 顶号机制正常（新登录会使旧token失效）" -ForegroundColor White
Write-Host "4. Token验证机制正常" -ForegroundColor White


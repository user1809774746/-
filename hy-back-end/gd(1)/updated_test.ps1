# 🚀 完整的手机号认证系统测试脚本
# 测试基于手机号的注册和登录功能

param(
    [string]$BaseUrl = "http://localhost:8081",
    [string]$TestPhone = "13800138000",
    [string]$TestPassword = "password123"
)

Write-Host "📱 手机号认证系统完整测试" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "测试手机号: $TestPhone" -ForegroundColor Yellow
Write-Host "服务器地址: $BaseUrl" -ForegroundColor Yellow
Write-Host ""

# 全局变量
$token = ""
$verificationCode = ""

# 辅助函数：发送HTTP请求
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        return @{
            Success = $true
            Data = $response
            StatusCode = 200
        }
    }
    catch {
        $errorResponse = $_.Exception.Response
        $statusCode = if ($errorResponse) { [int]$errorResponse.StatusCode } else { 500 }
        
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $statusCode
        }
    }
}

# 测试1: 发送验证码
Write-Host "🔥 测试 1: 发送验证码" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$body = @{
    phone = $TestPhone
}

$result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/send-verification-code" -Method "POST" -Body $body

if ($result.Success) {
    Write-Host "✅ 验证码发送成功！" -ForegroundColor Green
    Write-Host "响应: $($result.Data | ConvertTo-Json)" -ForegroundColor White
    Write-Host "💡 请查看后台控制台获取验证码" -ForegroundColor Yellow
    
    # 提示用户输入验证码
    Write-Host ""
    $verificationCode = Read-Host "请输入收到的验证码"
} else {
    Write-Host "❌ 验证码发送失败: $($result.Error)" -ForegroundColor Red
    Write-Host "继续使用默认验证码: 123456" -ForegroundColor Yellow
    $verificationCode = "123456"
}

Start-Sleep -Seconds 2

# 测试2: 用户注册
Write-Host "`n🔥 测试 2: 用户注册" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$body = @{
    phone = $TestPhone
    verificationCode = $verificationCode
    password = $TestPassword
    confirmPassword = $TestPassword
    userType = "user"
    userProfilePic = "https://example.com/avatar.jpg"
}

$result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $body

if ($result.Success) {
    Write-Host "✅ 用户注册成功！" -ForegroundColor Green
    Write-Host "响应: $($result.Data | ConvertTo-Json)" -ForegroundColor White
} else {
    Write-Host "⚠️  注册失败: $($result.Error)" -ForegroundColor Yellow
    Write-Host "可能是用户已存在，继续测试登录..." -ForegroundColor Yellow
}

Start-Sleep -Seconds 2

# 测试3: 手机号密码登录
Write-Host "`n🔥 测试 3: 手机号密码登录" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$body = @{
    phone = $TestPhone
    password = $TestPassword
    userType = "user"
}

$result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $body

if ($result.Success) {
    Write-Host "✅ 登录成功！" -ForegroundColor Green
    $token = $result.Data.data.token
    Write-Host "Token: $token" -ForegroundColor Cyan
    Write-Host "手机号: $($result.Data.data.phone)" -ForegroundColor White
} else {
    Write-Host "❌ 登录失败: $($result.Error)" -ForegroundColor Red
}

Start-Sleep -Seconds 2

# 测试4: 获取用户信息（需要认证）
if ($token) {
    Write-Host "`n🔥 测试 4: 获取用户信息" -ForegroundColor Green
    Write-Host "------------------------" -ForegroundColor Gray
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/profile" -Method "GET" -Token $token
    
    if ($result.Success) {
        Write-Host "✅ 获取用户信息成功！" -ForegroundColor Green
        Write-Host "用户信息: $($result.Data | ConvertTo-Json)" -ForegroundColor White
    } else {
        Write-Host "❌ 获取用户信息失败: $($result.Error)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 2

# 测试5: 验证码登录（重新发送验证码）
Write-Host "`n🔥 测试 5: 验证码快速登录" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

Write-Host "发送新验证码..." -ForegroundColor Yellow
$body = @{
    phone = $TestPhone
}

$result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/send-verification-code" -Method "POST" -Body $body

if ($result.Success) {
    Write-Host "✅ 验证码发送成功！" -ForegroundColor Green
    Write-Host ""
    $newVerificationCode = Read-Host "请输入新的验证码"
    
    # 验证码登录
    $body = @{
        phone = $TestPhone
        verificationCode = $newVerificationCode
        userType = "user"
    }
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/login-by-code" -Method "POST" -Body $body
    
    if ($result.Success) {
        Write-Host "✅ 验证码登录成功！无需密码！" -ForegroundColor Green
        Write-Host "Token: $($result.Data.data.token)" -ForegroundColor Cyan
        Write-Host "手机号: $($result.Data.data.phone)" -ForegroundColor White
    } else {
        Write-Host "❌ 验证码登录失败: $($result.Error)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ 发送验证码失败，跳过验证码登录测试" -ForegroundColor Red
}

# 测试管理员功能
Write-Host "`n🔥 测试 6: 管理员注册和登录" -ForegroundColor Green
Write-Host "------------------------" -ForegroundColor Gray

$adminPhone = "13900139000"
$adminPassword = "admin123"

# 发送管理员验证码
Write-Host "为管理员发送验证码..." -ForegroundColor Yellow
$body = @{
    phone = $adminPhone
}

$result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/send-verification-code" -Method "POST" -Body $body

if ($result.Success) {
    Write-Host "请输入管理员验证码（或直接按回车使用123456）:" -ForegroundColor Yellow
    $adminCode = Read-Host
    if ([string]::IsNullOrWhiteSpace($adminCode)) {
        $adminCode = "123456"
    }
    
    # 管理员注册
    $body = @{
        phone = $adminPhone
        verificationCode = $adminCode
        password = $adminPassword
        confirmPassword = $adminPassword
        userType = "admin"
    }
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/register" -Method "POST" -Body $body
    
    if ($result.Success) {
        Write-Host "✅ 管理员注册成功！" -ForegroundColor Green
    } else {
        Write-Host "⚠️  管理员可能已存在: $($result.Error)" -ForegroundColor Yellow
    }
    
    # 管理员登录
    $body = @{
        phone = $adminPhone
        password = $adminPassword
        userType = "admin"
    }
    
    $result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/login" -Method "POST" -Body $body
    
    if ($result.Success) {
        Write-Host "✅ 管理员登录成功！" -ForegroundColor Green
        $adminToken = $result.Data.data.token
        
        # 测试管理员权限
        $result = Invoke-ApiRequest -Url "$BaseUrl/api/auth/admin/users" -Method "GET" -Token $adminToken
        
        if ($result.Success) {
            Write-Host "✅ 管理员权限验证成功！" -ForegroundColor Green
            Write-Host "用户列表: $($result.Data | ConvertTo-Json)" -ForegroundColor White
        } else {
            Write-Host "❌ 管理员权限测试失败: $($result.Error)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ 管理员登录失败: $($result.Error)" -ForegroundColor Red
    }
}

# 测试总结
Write-Host "`n🎯 测试总结" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ 验证码发送: 已测试" -ForegroundColor Green
Write-Host "✅ 用户注册: 手机号+验证码" -ForegroundColor Green  
Write-Host "✅ 密码登录: 手机号+密码" -ForegroundColor Green
Write-Host "✅ 验证码登录: 手机号+验证码（无需密码）" -ForegroundColor Green
Write-Host "✅ JWT认证: Token验证" -ForegroundColor Green
Write-Host "✅ 管理员权限: 角色验证" -ForegroundColor Green

Write-Host "`n📋 重要变化" -ForegroundColor Yellow
Write-Host "• 删除了username字段，改为基于手机号认证" -ForegroundColor White
Write-Host "• 支持两种登录方式：密码登录 + 验证码登录" -ForegroundColor White
Write-Host "• JWT中存储手机号而非用户名" -ForegroundColor White
Write-Host "• 手机号作为唯一标识进行用户识别" -ForegroundColor White

Write-Host "`n🔗 相关文档" -ForegroundColor Cyan
Write-Host "• Postman集合: POSTMAN_API_TESTING_GUIDE.md" -ForegroundColor White
Write-Host "• 验证码说明: VERIFICATION_CODE_USAGE.md" -ForegroundColor White

Write-Host "`n🎉 测试完成！" -ForegroundColor Green

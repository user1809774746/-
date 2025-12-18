# 🛠️ HTTP 403 错误和CORS跨域问题解决指南

## 🚨 问题现象

访问前端应用时出现 **HTTP 403 错误**，通常表现为：
- 浏览器控制台显示网络错误
- API请求被阻止
- 提示跨域(CORS)权限问题

## 🔍 问题诊断

### 1️⃣ 使用API测试工具

我已经为您创建了 `test-api-connection.html` 测试工具：

```bash
# 在浏览器中打开
open test-api-connection.html
```

**测试步骤：**
1. 点击"测试基础连接" - 检查后端服务是否运行
2. 点击"测试CORS策略" - 检查跨域配置
3. 点击"测试发送验证码" - 验证具体API接口
4. 查看"解决方案"部分获取针对性建议

### 2️⃣ 检查后端服务状态

**确认后端服务运行：**
```bash
# 检查端口是否开放
telnet 192.168.1.131 8081

# 或使用curl测试
curl http://192.168.1.131:8081
```

**预期结果：**
- 端口连通：说明服务正常运行
- 返回Spring Boot页面或API文档：服务配置正确

## 🔧 解决方案

### 方案一：前端代理（已配置，推荐）

我已经更新了 `vite.config.js`，添加了代理配置：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.1.131:8081',
      changeOrigin: true,
      secure: false
    }
  }
}
```

**使用方法：**
```bash
# 重新启动开发服务器使代理生效
npm run dev
```

**工作原理：**
- 前端请求 `/api/xxx` → Vite代理转发到后端
- 避免了浏览器的跨域限制
- 对前端代码透明，无需修改

### 方案二：后端CORS配置

如果您可以修改后端代码，推荐添加CORS配置：

#### Java Spring Boot配置：

**方法1：注解配置（简单）**
```java
@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS})
public class AuthController {
    // 您的controller代码
}
```

**方法2：全局配置（推荐）**
```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**方法3：过滤器配置（完整）**
```java
@Component
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        
        httpResponse.setHeader("Access-Control-Allow-Origin", "*");
        httpResponse.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        httpResponse.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        httpResponse.setHeader("Access-Control-Max-Age", "3600");
        
        if ("OPTIONS".equalsIgnoreCase(httpRequest.getMethod())) {
            httpResponse.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        
        chain.doFilter(request, response);
    }
}
```

### 方案三：浏览器设置（临时测试）

**Chrome浏览器：**
```bash
# Windows
chrome.exe --user-data-dir=/tmp/chrome --disable-web-security

# Mac
open -n -a /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --args --user-data-dir="/tmp/chrome_dev_session" --disable-web-security

# Linux  
google-chrome --user-data-dir="/tmp/chrome_dev_session" --disable-web-security
```

⚠️ **注意：** 此方法仅用于开发测试，不建议日常使用

### 方案四：网络检查

#### 检查服务器连接：
```bash
# 测试网络连通性
ping 192.168.1.131

# 检查端口开放
nmap -p 8081 192.168.1.131

# 测试HTTP连接
curl -v http://192.168.1.131:8081
```

#### 检查防火墙设置：

**Windows：**
```cmd
# 检查防火墙状态
netsh advfirewall show allprofiles

# 允许端口通过防火墙
netsh advfirewall firewall add rule name="Java 8081" dir=in action=allow protocol=TCP localport=8081
```

**Linux：**
```bash
# UFW防火墙
sudo ufw allow 8081

# iptables防火墙
sudo iptables -A INPUT -p tcp --dport 8081 -j ACCEPT
```

## 📋 故障排除清单

### ✅ 检查项目

- [ ] **后端服务运行** - 确认Spring Boot在8081端口运行
- [ ] **网络连通性** - ping和telnet测试通过
- [ ] **防火墙设置** - 允许8081端口通信
- [ ] **CORS配置** - 后端支持跨域请求
- [ ] **代理配置** - 前端Vite代理正确配置
- [ ] **API路径** - 请求路径正确（/api/xxx）

### 🔍 诊断步骤

1. **使用测试工具** - 运行 `test-api-connection.html`
2. **检查浏览器控制台** - 查看具体错误信息
3. **检查网络标签** - 观察请求和响应详情
4. **测试后端接口** - 使用Postman或curl直接测试
5. **查看后端日志** - 确认请求是否到达后端

### 📊 常见错误码

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| **403** | 跨域权限被拒绝 | 配置CORS或使用代理 |
| **404** | 接口路径不存在 | 检查API路径和后端路由 |
| **500** | 服务器内部错误 | 查看后端日志，检查业务逻辑 |
| **ERR_NETWORK** | 网络连接失败 | 检查服务器状态和防火墙 |
| **ERR_CONNECTION_REFUSED** | 连接被拒绝 | 确认后端服务运行在正确端口 |

## 🎯 推荐解决流程

### 第一步：重启服务器
```bash
# 重新启动前端开发服务器（使用新的代理配置）
npm run dev
```

### 第二步：测试连接
1. 打开 `test-api-connection.html`
2. 执行所有测试项目
3. 根据测试结果选择解决方案

### 第三步：验证修复
1. 访问前端应用：`http://192.168.1.131:3001`
2. 尝试注册/登录功能
3. 检查浏览器控制台是否还有错误

## 💡 最佳实践

### 开发环境
- ✅ 使用Vite代理（已配置）
- ✅ 保持前后端服务分离
- ✅ 通过相对路径调用API

### 生产环境
- 🔧 配置Nginx反向代理
- 🔧 或者配置后端CORS策略  
- 🔧 使用HTTPS协议

### 测试环境
- 🧪 使用API测试工具验证
- 🧪 定期检查网络连通性
- 🧪 监控服务器状态

## 📞 需要帮助？

如果按照以上步骤仍然无法解决问题，请提供以下信息：

1. **测试工具结果** - `test-api-connection.html` 的完整输出
2. **浏览器控制台** - 网络标签中的具体错误
3. **后端日志** - Spring Boot应用的启动和错误日志
4. **网络环境** - 前后端是否在同一网络，防火墙设置等

---

**现在请重新启动开发服务器，然后测试应用功能！** 🚀

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
npm run dev
```

# Spring Boot 用户认证系统

这是一个基于 Spring Boot 的用户和管理员认证系统，提供注册、登录功能，并集成了 JWT 令牌验证和登录通知推送。

## 功能特性

- 用户和管理员注册/登录
- JWT 令牌认证
- 登录成功后向指定 URL 发送通知
- 密码加密存储
- RESTful API 设计

## 技术栈

- Spring Boot 2.7.15
- Spring Security
- Spring Data JPA
- MySQL
- JWT

## 数据库配置

1. 创建数据库 `authdb`
2. 修改 `application.properties` 中的数据库配置：
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/authdb?useSSL=false&serverTimezone=UTC&characterEncoding=utf-8
   spring.datasource.username=root
   spring.datasource.password=123456
   ```

## API 接口

### 注册接口

- URL: `/api/auth/register`
- 方法: `POST`
- 请求体:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "number": "手机号",
    "userProfilePic": "头像URL",
    "userType": "user/admin"
  }
  ```

### 登录接口

- URL: `/api/auth/login`
- 方法: `POST`
- 请求体:
  ```json
  {
    "username": "用户名",
    "password": "密码",
    "userType": "user/admin"
  }
  ```
- 响应:
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {
      "token": "JWT令牌",
      "userType": "user/admin",
      "username": "用户名"
    }
  }
  ```

## 认证流程

1. 用户登录成功后，系统生成 JWT 令牌并返回
2. 后续请求需要在 `Authorization` 头部携带令牌：
   ```
   Authorization: Bearer {token}
   ```
3. JWT 过滤器验证令牌有效性，有效则授权访问

## 登录通知

登录成功后，系统会向配置的 URL 发送通知，通知内容包含用户名、用户类型和用户ID。

## 运行项目

```bash
mvn spring-boot:run
```

## 注意事项

1. 请确保 MySQL 数据库已启动
2. 生产环境中请修改 JWT 密钥 (`jwt.secret`) 为安全的随机字符串
3. 生产环境中建议配置 HTTPS 以保护数据传输安全
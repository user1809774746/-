package com.example.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String phone;           // 手机号
    private String username;        // 用户名
    private String verificationCode; // 验证码
    private String password;
    private String confirmPassword; // 确认密码
    private byte[] userProfilePic;
    private String userType; // "user" 或 "admin"
}
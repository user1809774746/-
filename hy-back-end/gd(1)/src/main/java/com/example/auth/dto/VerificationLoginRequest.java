package com.example.auth.dto;

import lombok.Data;

@Data
public class VerificationLoginRequest {
    private String phone;            // 手机号
    private String verificationCode; // 验证码
    private String userType;         // "user" 或 "admin"
}


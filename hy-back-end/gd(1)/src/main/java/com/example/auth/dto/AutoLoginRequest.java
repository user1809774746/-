package com.example.auth.dto;

import lombok.Data;

@Data
public class AutoLoginRequest {
    private String phone;        // 手机号
    private String userType;     // 用户类型 "user" 或 "admin"
    private String token;        // 用户的token（用于七天免密登录验证）
}

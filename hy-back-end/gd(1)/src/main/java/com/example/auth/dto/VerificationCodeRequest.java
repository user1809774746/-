package com.example.auth.dto;

import lombok.Data;

@Data
public class VerificationCodeRequest {
    private String phone; // 手机号
}

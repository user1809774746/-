package com.example.auth.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String phone;
    private String password;
    private String userType; // "user" 或 "admin"
}
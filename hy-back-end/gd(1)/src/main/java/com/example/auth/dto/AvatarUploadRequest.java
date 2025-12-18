package com.example.auth.dto;

import lombok.Data;

@Data
public class AvatarUploadRequest {
    private String imageBase64;  // Base64编码的图片数据
    private String imageFormat;  // 图片格式，如 "jpg", "png", "jpeg"
}

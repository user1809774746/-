package com.example.auth.dto;

import lombok.Data;

@Data
public class BackgroundImageUploadRequest {
    private String imageBase64;  // Base64编码的图片数据
    private String imageFormat;  // 图片格式：jpg, jpeg, png, gif

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }

    public String getImageFormat() {
        return imageFormat;
    }

    public void setImageFormat(String imageFormat) {
        this.imageFormat = imageFormat;
    }
}

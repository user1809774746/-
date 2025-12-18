package com.example.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 文件上传响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadDTO {
    
    private Long imageId;              // 图片ID
    private String imageUrl;           // 图片访问URL
    private String originalFilename;   // 原始文件名
    private Long fileSize;             // 文件大小（字节）
    private String fileExtension;      // 文件扩展名
    private String mimeType;           // MIME类型
    private Integer imageWidth;        // 图片宽度
    private Integer imageHeight;       // 图片高度
    private String imageType;          // 图片类型
    private LocalDateTime uploadTime;  // 上传时间
}

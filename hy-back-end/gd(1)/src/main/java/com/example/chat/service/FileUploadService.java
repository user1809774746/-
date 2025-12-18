package com.example.chat.service;

import com.example.common.result.Result;
import com.example.chat.dto.FileUploadDTO;
import org.springframework.web.multipart.MultipartFile;

/**
 * 文件上传服务接口
 */
public interface FileUploadService {
    
    /**
     * 上传聊天背景图片
     * @param file 图片文件
     * @param uploaderId 上传者ID
     * @return 上传结果（包含图片URL）
     */
    Result<FileUploadDTO> uploadChatBackground(MultipartFile file, Long uploaderId);
    
    /**
     * 上传群头像
     * @param file 图片文件
     * @param uploaderId 上传者ID
     * @return 上传结果（包含图片URL）
     */
    Result<FileUploadDTO> uploadGroupAvatar(MultipartFile file, Long uploaderId);
    
    /**
     * 上传用户头像
     * @param file 图片文件
     * @param uploaderId 上传者ID
     * @return 上传结果（包含图片URL）
     */
    Result<FileUploadDTO> uploadUserAvatar(MultipartFile file, Long uploaderId);
    
    /**
     * 上传聊天消息图片
     * @param file 图片文件
     * @param uploaderId 上传者ID
     * @return 上传结果（包含图片URL）
     */
    Result<FileUploadDTO> uploadChatMessage(MultipartFile file, Long uploaderId);
    
    /**
     * 删除图片
     * @param imageId 图片ID
     * @param userId 用户ID（只能删除自己上传的图片）
     * @return 删除结果
     */
    Result<String> deleteImage(Long imageId, Long userId);
}

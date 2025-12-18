package com.example.chat.service.impl;

import com.example.common.result.Result;
import com.example.chat.dto.FileUploadDTO;
import com.example.chat.entity.ChatImage;
import com.example.chat.repository.ChatImageRepository;
import com.example.chat.service.FileUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * 文件上传服务实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadServiceImpl implements FileUploadService {
    
    private final ChatImageRepository chatImageRepository;
    
    @Value("${file.upload.chat-background-path}")
    private String chatBackgroundPath;
    
    @Value("${file.upload.group-avatar-path}")
    private String groupAvatarPath;
    
    @Value("${file.upload.user-avatar-path}")
    private String userAvatarPath;
    
    @Value("${file.upload.chat-message-path}")
    private String chatMessagePath;
    
    @Value("${file.upload.allowed-extensions}")
    private String allowedExtensions;
    
    @Value("${file.upload.max-size}")
    private Long maxSize;
    
    @Value("${server.port}")
    private String serverPort;
    
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/bmp", "image/webp"
    );
    
    @Override
    @Transactional
    public Result<FileUploadDTO> uploadChatBackground(MultipartFile file, Long uploaderId) {
        return uploadImage(file, uploaderId, "chat_background", chatBackgroundPath);
    }
    
    @Override
    @Transactional
    public Result<FileUploadDTO> uploadGroupAvatar(MultipartFile file, Long uploaderId) {
        return uploadImage(file, uploaderId, "group_avatar", groupAvatarPath);
    }
    
    @Override
    @Transactional
    public Result<FileUploadDTO> uploadUserAvatar(MultipartFile file, Long uploaderId) {
        return uploadImage(file, uploaderId, "user_avatar", userAvatarPath);
    }
    
    @Override
    @Transactional
    public Result<FileUploadDTO> uploadChatMessage(MultipartFile file, Long uploaderId) {
        return uploadImage(file, uploaderId, "chat_message", chatMessagePath);
    }
    
    /**
     * 通用图片上传方法
     */
    private Result<FileUploadDTO> uploadImage(MultipartFile file, Long uploaderId, String imageType, String uploadPath) {
        try {
            // 1. 验证文件
            Result<String> validation = validateFile(file);
            if (validation.getCode() != 200) {
                return Result.error(validation.getMessage());
            }
            
            // 2. 获取文件信息
            String originalFilename = file.getOriginalFilename();
            String fileExtension = getFileExtension(originalFilename);
            String mimeType = file.getContentType();
            
            // 3. 生成唯一文件名
            String storedFilename = UUID.randomUUID().toString() + "." + fileExtension;
            
            // 4. 创建目录
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            // 5. 保存文件
            String filePath = uploadPath + File.separator + storedFilename;
            File destFile = new File(filePath);
            file.transferTo(destFile);
            
            // 6. 获取图片尺寸
            Integer width = null;
            Integer height = null;
            try {
                BufferedImage bufferedImage = ImageIO.read(destFile);
                if (bufferedImage != null) {
                    width = bufferedImage.getWidth();
                    height = bufferedImage.getHeight();
                }
            } catch (Exception e) {
                log.warn("获取图片尺寸失败: {}", e.getMessage());
            }
            
            // 7. 生成访问URL（只使用相对路径部分）
            // 从完整路径中提取 uploads/ 之后的部分
            String relativePath = filePath.substring(filePath.indexOf("uploads"));
            String fileUrl = String.format("http://localhost:%s/%s", serverPort, relativePath.replace("\\", "/"));
            
            // 8. 保存到数据库
            ChatImage chatImage = ChatImage.builder()
                    .uploaderId(uploaderId)
                    .imageType(imageType)
                    .originalFilename(originalFilename)
                    .storedFilename(storedFilename)
                    .filePath(filePath)
                    .fileUrl(fileUrl)
                    .fileSize(file.getSize())
                    .fileExtension(fileExtension)
                    .mimeType(mimeType)
                    .imageWidth(width)
                    .imageHeight(height)
                    .isDeleted(false)
                    .build();
            
            chatImage = chatImageRepository.save(chatImage);
            
            // 9. 构建响应DTO
            FileUploadDTO dto = FileUploadDTO.builder()
                    .imageId(chatImage.getId())
                    .imageUrl(fileUrl)
                    .originalFilename(originalFilename)
                    .fileSize(file.getSize())
                    .fileExtension(fileExtension)
                    .mimeType(mimeType)
                    .imageWidth(width)
                    .imageHeight(height)
                    .imageType(imageType)
                    .uploadTime(chatImage.getCreatedTime())
                    .build();
            
            log.info("图片上传成功: userId={}, imageType={}, filename={}", uploaderId, imageType, storedFilename);
            return Result.success("图片上传成功", dto);
            
        } catch (IOException e) {
            log.error("图片上传失败: userId={}, imageType={}", uploaderId, imageType, e);
            return Result.error("图片上传失败: " + e.getMessage());
        } catch (Exception e) {
            log.error("图片上传异常: userId={}, imageType={}", uploaderId, imageType, e);
            return Result.error("图片上传异常: " + e.getMessage());
        }
    }
    
    /**
     * 验证文件
     */
    private Result<String> validateFile(MultipartFile file) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            return Result.error("文件不能为空");
        }
        
        // 检查文件大小
        if (file.getSize() > maxSize) {
            return Result.error("文件大小不能超过 " + (maxSize / 1024 / 1024) + "MB");
        }
        
        // 检查文件类型
        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase())) {
            return Result.error("不支持的文件类型，仅支持图片格式（jpg、png、gif、bmp、webp）");
        }
        
        // 检查文件扩展名
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return Result.error("文件名格式不正确");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        List<String> allowedExtList = Arrays.asList(allowedExtensions.split(","));
        if (!allowedExtList.contains(extension)) {
            return Result.error("不支持的文件扩展名，仅支持: " + allowedExtensions);
        }
        
        return Result.success("验证通过");
    }
    
    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }
    
    @Override
    @Transactional
    public Result<String> deleteImage(Long imageId, Long userId) {
        try {
            ChatImage chatImage = chatImageRepository.findById(imageId)
                    .orElseThrow(() -> new RuntimeException("图片不存在"));
            
            // 检查权限：只能删除自己上传的图片
            if (!chatImage.getUploaderId().equals(userId)) {
                return Result.error("无权删除该图片");
            }
            
            // 软删除
            chatImage.setIsDeleted(true);
            chatImageRepository.save(chatImage);
            
            // 可选：删除物理文件
            try {
                File file = new File(chatImage.getFilePath());
                if (file.exists()) {
                    file.delete();
                }
            } catch (Exception e) {
                log.warn("删除物理文件失败: {}", e.getMessage());
            }
            
            log.info("图片删除成功: imageId={}, userId={}", imageId, userId);
            return Result.success("图片删除成功");
            
        } catch (Exception e) {
            log.error("图片删除失败: imageId={}, userId={}", imageId, userId, e);
            return Result.error("图片删除失败: " + e.getMessage());
        }
    }
}

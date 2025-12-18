package com.example.auth.controller;

import com.example.auth.dto.BackgroundImageUploadRequest;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.service.UserBackgroundImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserBackgroundImageController {

    @Autowired
    private UserBackgroundImageService backgroundImageService;

    /**
     * 上传/更新用户背景图片
     * POST /api/user/background-image
     * 
     * 请求体示例：
     * {
     *   "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
     *   "imageFormat": "jpeg"
     * }
     */
    @PostMapping("/background-image")
    public ResponseDTO uploadBackgroundImage(@RequestBody BackgroundImageUploadRequest request, 
                                             Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 验证请求数据
            if (request.getImageBase64() == null || request.getImageBase64().trim().isEmpty()) {
                return ResponseDTO.error(400, "图片数据不能为空");
            }

            if (request.getImageFormat() == null || request.getImageFormat().trim().isEmpty()) {
                return ResponseDTO.error(400, "图片格式不能为空");
            }

            // 获取当前登录用户的手机号
            String phone = authentication.getName();

            // 上传背景图片
            backgroundImageService.uploadBackgroundImage(phone, request.getImageBase64(), request.getImageFormat());

            return ResponseDTO.success("背景图片上传成功");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "背景图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前用户背景图片（二进制格式）
     * GET /api/user/background-image
     * 
     * 返回图片的二进制数据，Content-Type为image/jpeg
     */
    @GetMapping("/background-image")
    public ResponseEntity<?> getBackgroundImage(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(ResponseDTO.error(401, "用户未登录"));
            }

            // 获取当前登录用户的手机号
            String phone = authentication.getName();

            // 获取背景图片数据
            byte[] imageData = backgroundImageService.getBackgroundImage(phone);

            // 返回图片数据
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // 默认为JPEG，实际应根据存储的格式确定
            headers.setContentLength(imageData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(imageData);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ResponseDTO.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDTO.error(500, "获取背景图片失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户背景图片（Base64格式）
     * GET /api/user/background-image-base64
     * 
     * 返回JSON格式：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "backgroundImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
     *     "phone": "13800138000"
     *   }
     * }
     */
    @GetMapping("/background-image-base64")
    public ResponseDTO getBackgroundImageBase64(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 获取当前登录用户的手机号
            String phone = authentication.getName();

            // 获取背景图片数据
            byte[] imageData = backgroundImageService.getBackgroundImage(phone);

            // 转换为Base64
            String base64Image = Base64.getEncoder().encodeToString(imageData);

            Map<String, String> result = new HashMap<>();
            result.put("backgroundImage", "data:image/jpeg;base64," + base64Image);
            result.put("phone", phone);

            return ResponseDTO.success(result);

        } catch (RuntimeException e) {
            return ResponseDTO.error(404, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取背景图片失败: " + e.getMessage());
        }
    }

    /**
     * 根据用户ID获取背景图片（Base64格式）- 供其他用户查看
     * GET /api/user/{userId}/background-image-base64
     * 
     * 返回JSON格式：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "backgroundImage": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...",
     *     "userId": 123
     *   }
     * }
     */
    @GetMapping("/{userId}/background-image-base64")
    public ResponseDTO getBackgroundImageByUserIdBase64(@PathVariable Long userId) {
        try {
            // 获取背景图片数据
            byte[] imageData = backgroundImageService.getBackgroundImageByUserId(userId);

            // 转换为Base64
            String base64Image = Base64.getEncoder().encodeToString(imageData);

            Map<String, Object> result = new HashMap<>();
            result.put("backgroundImage", "data:image/jpeg;base64," + base64Image);
            result.put("userId", userId);

            return ResponseDTO.success(result);

        } catch (RuntimeException e) {
            return ResponseDTO.error(404, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取背景图片失败: " + e.getMessage());
        }
    }

    /**
     * 根据用户ID获取背景图片（二进制格式）- 供其他用户查看
     * GET /api/user/{userId}/background-image
     */
    @GetMapping("/{userId}/background-image")
    public ResponseEntity<?> getBackgroundImageByUserId(@PathVariable Long userId) {
        try {
            // 获取背景图片数据
            byte[] imageData = backgroundImageService.getBackgroundImageByUserId(userId);

            // 返回图片数据
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(imageData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(imageData);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ResponseDTO.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDTO.error(500, "获取背景图片失败: " + e.getMessage()));
        }
    }

    /**
     * 删除当前用户背景图片
     * DELETE /api/user/background-image
     */
    @DeleteMapping("/background-image")
    public ResponseDTO deleteBackgroundImage(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 获取当前登录用户的手机号
            String phone = authentication.getName();

            // 删除背景图片
            backgroundImageService.deleteBackgroundImage(phone);

            return ResponseDTO.success("背景图片删除成功");

        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "删除背景图片失败: " + e.getMessage());
        }
    }

    /**
     * 检查当前用户是否已设置背景图片
     * GET /api/user/background-image/exists
     * 
     * 返回JSON格式：
     * {
     *   "code": 200,
     *   "message": "success",
     *   "data": {
     *     "exists": true
     *   }
     * }
     */
    @GetMapping("/background-image/exists")
    public ResponseDTO checkBackgroundImageExists(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 获取当前登录用户的手机号
            String phone = authentication.getName();

            // 检查是否已设置背景图片
            boolean exists = backgroundImageService.hasBackgroundImage(phone);

            Map<String, Boolean> result = new HashMap<>();
            result.put("exists", exists);

            return ResponseDTO.success(result);

        } catch (Exception e) {
            return ResponseDTO.error(500, "检查背景图片失败: " + e.getMessage());
        }
    }
}

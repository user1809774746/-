package com.example.auth.controller;

import com.example.auth.dto.NotificationResponse;
import com.example.auth.dto.NotificationStatsResponse;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.service.NotificationService;
import com.example.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 通知控制器
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserService userService;

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("未授权访问");
        }
        String phone = authentication.getName();
        Long userId = userService.getUserIdByPhone(phone);
        if (userId == null) {
            throw new RuntimeException("用户不存在");
        }
        return userId;
    }

    /**
     * 获取用户的所有通知
     * GET /api/notifications/list
     */
    @GetMapping("/list")
    public ResponseEntity<ResponseDTO> getUserNotifications(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<NotificationResponse> notifications = notificationService.getUserNotifications(userId);
            return ResponseEntity.ok(ResponseDTO.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "获取通知列表失败: " + e.getMessage()));
        }
    }

    /**
     * 获取用户的未读通知
     * GET /api/notifications/unread
     */
    @GetMapping("/unread")
    public ResponseEntity<ResponseDTO> getUnreadNotifications(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            List<NotificationResponse> notifications = notificationService.getUnreadNotifications(userId);
            return ResponseEntity.ok(ResponseDTO.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "获取未读通知失败: " + e.getMessage()));
        }
    }

    /**
     * 获取指定类型的通知
     * GET /api/notifications/type/{type}
     * type: COMMENT/FAVORITE/VIEW
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ResponseDTO> getNotificationsByType(
            @PathVariable String type,
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);

            // 验证通知类型
            if (!type.matches("COMMENT|FAVORITE|VIEW|ACTIVITY_SIGNUP")) {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "无效的通知类型"));
            }

            List<NotificationResponse> notifications = notificationService.getNotificationsByType(userId, type);
            return ResponseEntity.ok(ResponseDTO.success(notifications));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "获取通知失败: " + e.getMessage()));
        }
    }

    /**
     * 获取通知统计信息
     * GET /api/notifications/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ResponseDTO> getNotificationStats(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            NotificationStatsResponse stats = notificationService.getNotificationStats(userId);
            return ResponseEntity.ok(ResponseDTO.success(stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "获取通知统计失败: " + e.getMessage()));
        }
    }

    /**
     * 标记单个通知为已读
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ResponseDTO> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            boolean success = notificationService.markAsRead(id, userId);
            
            if (success) {
                return ResponseEntity.ok(ResponseDTO.success("标记成功"));
            } else {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "标记失败，通知不存在或无权限"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "标记通知失败: " + e.getMessage()));
        }
    }

    /**
     * 标记所有通知为已读
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<ResponseDTO> markAllAsRead(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            int count = notificationService.markAllAsRead(userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            result.put("message", "已标记 " + count + " 条通知为已读");
            
            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "标记所有通知失败: " + e.getMessage()));
        }
    }

    /**
     * 删除单个通知
     * DELETE /api/notifications/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            boolean success = notificationService.deleteNotification(id, userId);
            
            if (success) {
                return ResponseEntity.ok(ResponseDTO.success("删除成功"));
            } else {
                return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "删除失败，通知不存在或无权限"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "删除通知失败: " + e.getMessage()));
        }
    }

    /**
     * 删除所有已读通知
     * DELETE /api/notifications/read-all
     */
    @DeleteMapping("/read-all")
    public ResponseEntity<ResponseDTO> deleteAllReadNotifications(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            int count = notificationService.deleteAllReadNotifications(userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("count", count);
            result.put("message", "已删除 " + count + " 条已读通知");
            
            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "删除所有已读通知失败: " + e.getMessage()));
        }
    }

    /**
     * 获取未读通知数量（轻量级接口，用于角标显示）
     * GET /api/notifications/unread-count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ResponseDTO> getUnreadCount(Authentication authentication) {
        try {
            Long userId = getCurrentUserId(authentication);
            NotificationStatsResponse stats = notificationService.getNotificationStats(userId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("unreadCount", stats.getUnreadCount());
            
            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDTO.error(400, "获取未读数量失败: " + e.getMessage()));
        }
    }
}


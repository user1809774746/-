package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.service.AdminPostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 管理员帖子审核控制器
 */
@RestController
@RequestMapping("/api/admin/posts")
public class AdminPostController {

    @Autowired
    private AdminPostService adminPostService;

    /**
     * 获取待审核帖子列表
     */
    @GetMapping("/pending")
    public ResponseDTO getPendingPosts(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> result = adminPostService.getPendingPosts(page, pageSize);
            return ResponseDTO.success(result);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取待审核帖子失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有帖子列表（含审核状态筛选）
     */
    @GetMapping("/list")
    public ResponseDTO getAllPosts(
            @RequestParam(required = false) String auditStatus,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> result = adminPostService.getAllPosts(auditStatus, status, page, pageSize);
            return ResponseDTO.success(result);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取帖子列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取帖子详情
     */
    @GetMapping("/{postId}")
    public ResponseDTO getPostDetail(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> result = adminPostService.getPostDetail(postId);
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(404, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取帖子详情失败: " + e.getMessage());
        }
    }

    /**
     * 审核通过帖子
     */
    @PostMapping("/{postId}/approve")
    public ResponseDTO approvePost(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String adminPhone = authentication.getName();
            Map<String, Object> result = adminPostService.approvePost(postId, adminPhone);
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "审核通过失败: " + e.getMessage());
        }
    }

    /**
     * 审核拒绝帖子
     */
    @PostMapping("/{postId}/reject")
    public ResponseDTO rejectPost(
            @PathVariable Long postId,
            @RequestBody Map<String, String> requestBody,
            Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String reason = requestBody.get("reason");
            if (reason == null || reason.trim().isEmpty()) {
                return ResponseDTO.error(400, "拒绝原因不能为空");
            }

            String adminPhone = authentication.getName();
            Map<String, Object> result = adminPostService.rejectPost(postId, adminPhone, reason);
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "审核拒绝失败: " + e.getMessage());
        }
    }

    /**
     * 删除帖子（管理员权限）
     */
    @DeleteMapping("/{postId}")
    public ResponseDTO deletePost(
            @PathVariable Long postId,
            @RequestBody(required = false) Map<String, String> requestBody,
            Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String reason = requestBody != null ? requestBody.get("reason") : "违规内容";
            String adminPhone = authentication.getName();
            
            adminPostService.deletePost(postId, adminPhone, reason);
            
            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("message", "帖子已删除");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "删除帖子失败: " + e.getMessage());
        }
    }

    /**
     * 设置帖子为精选
     */
    @PostMapping("/{postId}/feature")
    public ResponseDTO setFeatured(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String adminPhone = authentication.getName();
            adminPostService.setFeatured(postId, true, adminPhone);
            
            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("isFeatured", true);
            result.put("message", "已设置为精选帖子");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "设置精选失败: " + e.getMessage());
        }
    }

    /**
     * 取消精选
     */
    @DeleteMapping("/{postId}/feature")
    public ResponseDTO removeFeatured(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String adminPhone = authentication.getName();
            adminPostService.setFeatured(postId, false, adminPhone);
            
            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("isFeatured", false);
            result.put("message", "已取消精选");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "取消精选失败: " + e.getMessage());
        }
    }

    /**
     * 设置帖子置顶
     */
    @PostMapping("/{postId}/top")
    public ResponseDTO setTop(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String adminPhone = authentication.getName();
            adminPostService.setTop(postId, true, adminPhone);
            
            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("isTop", true);
            result.put("message", "已设置为置顶帖子");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "设置置顶失败: " + e.getMessage());
        }
    }

    /**
     * 取消置顶
     */
    @DeleteMapping("/{postId}/top")
    public ResponseDTO removeTop(@PathVariable Long postId, Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String adminPhone = authentication.getName();
            adminPostService.setTop(postId, false, adminPhone);
            
            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("isTop", false);
            result.put("message", "已取消置顶");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "取消置顶失败: " + e.getMessage());
        }
    }

    /**
     * 获取审核统计信息
     */
    @GetMapping("/statistics")
    public ResponseDTO getStatistics(Authentication authentication) {
        try {
            // 验证管理员身份
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> statistics = adminPostService.getStatistics();
            return ResponseDTO.success(statistics);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取评论举报列表
     */
    @GetMapping("/comment-reports")
    public ResponseDTO getCommentReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> result = adminPostService.getCommentReports(status, page, pageSize);
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取评论举报列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取帖子举报列表
     */
    @GetMapping("/post-reports")
    public ResponseDTO getPostReports(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer pageSize,
            Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            Map<String, Object> result = adminPostService.getPostReports(status, page, pageSize);
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取帖子举报列表失败: " + e.getMessage());
        }
    }

    /**
     * 处理评论举报
     */
    @PostMapping("/comment-reports/{reportId}/handle")
    public ResponseDTO handleCommentReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String action = body != null ? body.get("action") : null;
            String handleResult = body != null ? body.get("handleResult") : null;

            if (action == null || action.trim().isEmpty()) {
                return ResponseDTO.error(400, "处理动作不能为空");
            }

            String adminPhone = authentication.getName();
            Map<String, Object> result = adminPostService.handleCommentReport(reportId, action, handleResult, adminPhone);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "处理评论举报失败: " + e.getMessage());
        }
    }

    /**
     * 处理帖子举报
     */
    @PostMapping("/post-reports/{reportId}/handle")
    public ResponseDTO handlePostReport(
            @PathVariable Long reportId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                return ResponseDTO.error(403, "需要管理员权限");
            }

            String action = body != null ? body.get("action") : null;
            String handleResult = body != null ? body.get("handleResult") : null;

            if (action == null || action.trim().isEmpty()) {
                return ResponseDTO.error(400, "处理动作不能为空");
            }

            String adminPhone = authentication.getName();
            Map<String, Object> result = adminPostService.handlePostReport(reportId, action, handleResult, adminPhone);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "处理帖子举报失败: " + e.getMessage());
        }
    }

    /**
     * 验证是否为管理员
     */
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        
        String userType = authentication.getAuthorities().iterator().next().getAuthority();
        userType = userType.replace("ROLE_", "").toLowerCase();
        
        return "admin".equals(userType);
    }
}


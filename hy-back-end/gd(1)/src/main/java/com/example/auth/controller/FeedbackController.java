package com.example.auth.controller;

import com.example.auth.dto.FeedbackResponse;
import com.example.auth.dto.FeedbackSubmitRequest;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.service.FeedbackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户反馈控制器
 */
@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    /**
     * 提交反馈（支持匿名和登录用户）
     * POST /api/feedback/submit
     */
    @PostMapping("/submit")
    public ResponseEntity<ResponseDTO> submitFeedback(
            @RequestBody FeedbackSubmitRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            // 获取用户手机号（如果已登录）
            String phone = null;
            if (authentication != null && authentication.isAuthenticated()) {
                phone = authentication.getName();
            }

            FeedbackResponse feedback = feedbackService.submitFeedback(request, phone, httpRequest);

            Map<String, Object> result = new HashMap<>();
            result.put("feedbackId", feedback.getId());
            result.put("message", "反馈提交成功，感谢您的宝贵意见！");
            result.put("status", feedback.getStatus());

            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseDTO.error(500, "提交反馈失败: " + e.getMessage()));
        }
    }

    /**
     * 获取所有反馈（管理员接口）
     * GET /api/feedback/list
     */
    @GetMapping("/list")
    public ResponseEntity<ResponseDTO> getAllFeedback() {
        try {
            List<FeedbackResponse> feedbackList = feedbackService.getAllFeedback();
            
            Map<String, Object> result = new HashMap<>();
            result.put("total", feedbackList.size());
            result.put("list", feedbackList);

            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "获取反馈列表失败: " + e.getMessage()));
        }
    }

    /**
     * 按状态获取反馈（管理员接口）
     * GET /api/feedback/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<ResponseDTO> getFeedbackByStatus(@PathVariable String status) {
        try {
            List<FeedbackResponse> feedbackList = feedbackService.getFeedbackByStatus(status);
            
            Map<String, Object> result = new HashMap<>();
            result.put("total", feedbackList.size());
            result.put("status", status);
            result.put("list", feedbackList);

            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "获取反馈失败: " + e.getMessage()));
        }
    }

    /**
     * 按类型获取反馈（管理员接口）
     * GET /api/feedback/type/{type}
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<ResponseDTO> getFeedbackByType(@PathVariable String type) {
        try {
            List<FeedbackResponse> feedbackList = feedbackService.getFeedbackByType(type);
            
            Map<String, Object> result = new HashMap<>();
            result.put("total", feedbackList.size());
            result.put("type", type);
            result.put("list", feedbackList);

            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "获取反馈失败: " + e.getMessage()));
        }
    }

    /**
     * 获取当前用户的反馈
     * GET /api/feedback/my
     */
    @GetMapping("/my")
    public ResponseEntity<ResponseDTO> getMyFeedback(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(ResponseDTO.error(401, "请先登录"));
            }

            // 这里需要根据phone获取userId
            // 简化处理，直接返回空列表
            Map<String, Object> result = new HashMap<>();
            result.put("total", 0);
            result.put("list", List.of());
            result.put("message", "暂无反馈记录");

            return ResponseEntity.ok(ResponseDTO.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, "获取我的反馈失败: " + e.getMessage()));
        }
    }

    /**
     * 更新反馈状态（管理员接口）
     * PUT /api/feedback/{id}/status
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseDTO> updateFeedbackStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String handlerNotes,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(ResponseDTO.error(401, "请先登录"));
            }

            // 这里需要获取管理员ID
            Long handlerId = 1L; // 临时hardcode

            FeedbackResponse feedback = feedbackService.updateFeedbackStatus(id, status, handlerNotes, handlerId);

            return ResponseEntity.ok(ResponseDTO.success(feedback));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseDTO.error(500, "更新反馈状态失败: " + e.getMessage()));
        }
    }

    /**
     * 删除反馈（管理员接口）
     * DELETE /api/feedback/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDTO> deleteFeedback(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401)
                        .body(ResponseDTO.error(401, "请先登录"));
            }

            feedbackService.deleteFeedback(id);

            return ResponseEntity.ok(ResponseDTO.success("删除成功"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ResponseDTO.error(400, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(ResponseDTO.error(500, "删除反馈失败: " + e.getMessage()));
        }
    }
}


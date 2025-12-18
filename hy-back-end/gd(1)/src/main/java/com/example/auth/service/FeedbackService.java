package com.example.auth.service;

import com.example.auth.dto.FeedbackResponse;
import com.example.auth.dto.FeedbackSubmitRequest;
import com.example.auth.entity.User;
import com.example.auth.entity.UserFeedback;
import com.example.auth.repository.UserFeedbackRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 反馈服务类
 */
@Service
public class FeedbackService {

    @Autowired
    private UserFeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 提交反馈
     */
    @Transactional
    public FeedbackResponse submitFeedback(FeedbackSubmitRequest request, String phone, HttpServletRequest httpRequest) {
        // 验证必填字段
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("标题不能为空");
        }
        if (request.getDetail() == null || request.getDetail().trim().isEmpty()) {
            throw new RuntimeException("详细描述不能为空");
        }

        // 验证长度
        if (request.getTitle().length() > 100) {
            throw new RuntimeException("标题不能超过100个字符");
        }
        if (request.getDetail().length() > 1000) {
            throw new RuntimeException("详细描述不能超过1000个字符");
        }

        // 验证评分范围
        if (request.getScore() != null && (request.getScore() < 1 || request.getScore() > 5)) {
            throw new RuntimeException("评分必须在1-5之间");
        }

        // 创建反馈实体
        UserFeedback feedback = new UserFeedback();
        feedback.setFeedbackType(request.getType() != null ? request.getType() : "建议");
        feedback.setTitle(request.getTitle().trim());
        feedback.setDetail(request.getDetail().trim());
        feedback.setScore(request.getScore());
        feedback.setEmail(request.getEmail() != null ? request.getEmail().trim() : null);
        feedback.setModule(request.getModule());

        // 如果用户已登录，记录用户ID
        if (phone != null && !phone.isEmpty()) {
            try {
                User user = userRepository.findByNumber(phone).orElse(null);
                if (user != null) {
                    feedback.setUserId(user.getUserId());
                }
            } catch (Exception e) {
                // 忽略错误，允许匿名反馈
            }
        }

        // 获取用户IP
        String userIp = getClientIp(httpRequest);
        feedback.setUserIp(userIp);

        // 设置初始状态
        feedback.setStatus("pending");
        feedback.setPriority(determinePriority(request));
        feedback.setIsDeleted(false);

        // 保存反馈
        UserFeedback savedFeedback = feedbackRepository.save(feedback);

        return convertToResponse(savedFeedback);
    }

    /**
     * 获取所有反馈
     */
    public List<FeedbackResponse> getAllFeedback() {
        List<UserFeedback> feedbackList = feedbackRepository.findByIsDeletedOrderByCreatedTimeDesc(false);
        return feedbackList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 按状态获取反馈
     */
    public List<FeedbackResponse> getFeedbackByStatus(String status) {
        List<UserFeedback> feedbackList = feedbackRepository
                .findByStatusAndIsDeletedOrderByCreatedTimeDesc(status, false);
        return feedbackList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 按类型获取反馈
     */
    public List<FeedbackResponse> getFeedbackByType(String type) {
        List<UserFeedback> feedbackList = feedbackRepository
                .findByFeedbackTypeAndIsDeletedOrderByCreatedTimeDesc(type, false);
        return feedbackList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户的反馈
     */
    public List<FeedbackResponse> getUserFeedback(Long userId) {
        List<UserFeedback> feedbackList = feedbackRepository
                .findByUserIdAndIsDeletedOrderByCreatedTimeDesc(userId, false);
        return feedbackList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 更新反馈状态
     */
    @Transactional
    public FeedbackResponse updateFeedbackStatus(Long feedbackId, String status, String handlerNotes, Long handlerId) {
        UserFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("反馈不存在"));

        feedback.setStatus(status);
        feedback.setHandlerNotes(handlerNotes);
        feedback.setHandlerId(handlerId);

        if ("resolved".equals(status)) {
            feedback.setResolvedTime(new java.util.Date());
        }

        UserFeedback updated = feedbackRepository.save(feedback);
        return convertToResponse(updated);
    }

    /**
     * 删除反馈（软删除）
     */
    @Transactional
    public void deleteFeedback(Long feedbackId) {
        UserFeedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("反馈不存在"));
        feedback.setIsDeleted(true);
        feedbackRepository.save(feedback);
    }

    /**
     * 确定优先级
     */
    private String determinePriority(FeedbackSubmitRequest request) {
        // 根据反馈类型和评分确定优先级
        if ("问题".equals(request.getType())) {
            if (request.getScore() != null && request.getScore() <= 2) {
                return "high"; // 问题且评分低，高优先级
            }
            return "normal";
        } else if ("建议".equals(request.getType())) {
            return "normal";
        }
        return "normal";
    }

    /**
     * 获取客户端IP
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    /**
     * 转换为响应DTO
     */
    private FeedbackResponse convertToResponse(UserFeedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setFeedbackType(feedback.getFeedbackType());
        response.setTitle(feedback.getTitle());
        response.setDetail(feedback.getDetail());
        response.setScore(feedback.getScore());
        response.setEmail(feedback.getEmail());
        response.setModule(feedback.getModule());
        response.setUserId(feedback.getUserId());
        response.setUserIp(feedback.getUserIp());
        response.setStatus(feedback.getStatus());
        response.setStatusDesc(getStatusDesc(feedback.getStatus()));
        response.setPriority(feedback.getPriority());
        response.setPriorityDesc(getPriorityDesc(feedback.getPriority()));
        response.setHandlerId(feedback.getHandlerId());
        response.setHandlerNotes(feedback.getHandlerNotes());
        response.setResolvedTime(feedback.getResolvedTime());
        response.setCreatedTime(feedback.getCreatedTime());
        response.setUpdatedTime(feedback.getUpdatedTime());
        return response;
    }

    /**
     * 获取状态描述
     */
    private String getStatusDesc(String status) {
        switch (status) {
            case "pending":
                return "待处理";
            case "processing":
                return "处理中";
            case "resolved":
                return "已解决";
            case "closed":
                return "已关闭";
            default:
                return status;
        }
    }

    /**
     * 获取优先级描述
     */
    private String getPriorityDesc(String priority) {
        switch (priority) {
            case "low":
                return "低";
            case "normal":
                return "普通";
            case "high":
                return "高";
            case "urgent":
                return "紧急";
            default:
                return priority;
        }
    }
}


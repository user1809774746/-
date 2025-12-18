package com.example.auth.dto;

import lombok.Data;

/**
 * 反馈提交请求DTO
 */
@Data
public class FeedbackSubmitRequest {
    
    private String type;        // 反馈类型：建议/问题/体验/其他
    private Integer score;      // 评分：1-5（可选）
    private String title;       // 标题（必填）
    private String detail;      // 详细描述（必填）
    private String email;       // 联系邮箱（可选）
    private String module;      // 所属模块（可选）
}


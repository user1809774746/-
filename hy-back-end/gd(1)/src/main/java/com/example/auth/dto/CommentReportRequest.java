package com.example.auth.dto;

import lombok.Data;

import java.util.List;

/**
 * 评论举报请求 DTO
 */
@Data
public class CommentReportRequest {
    private Long commentId;                // 被举报的评论ID
    private String reportType;             // 举报类型
    private String reportReason;           // 举报理由
    private List<String> reportEvidence;   // 举报证据（截图、链接等）
}

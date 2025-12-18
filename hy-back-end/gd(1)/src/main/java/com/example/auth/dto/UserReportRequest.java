package com.example.auth.dto;

import lombok.Data;

import java.util.List;

/**
 * 举报用户请求 DTO
 */
@Data
public class UserReportRequest {
    private String reportType;      // 举报类型
    private String reportReason;    // 举报理由
    private List<String> reportEvidence; // 举报证据（截图、链接等）
}

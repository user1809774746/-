package com.example.auth.dto;

import lombok.Data;

import java.util.List;

@Data
public class PostReportRequest {
    private String reportType;
    private String reportReason;
    private List<String> reportEvidence;
}

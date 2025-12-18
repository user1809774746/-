package com.example.auth.dto;

import lombok.Data;

/**
 * 草稿保存请求 DTO
 */
@Data
public class DraftSaveRequest {
    private Long draftId; // 如果是更新草稿，传入草稿ID
    private String draftTitle;
    private String draftContent;
    private PostCreateRequest draftData; // 完整的帖子数据
    private Boolean isAutoSave = false; // 是否为自动保存
}

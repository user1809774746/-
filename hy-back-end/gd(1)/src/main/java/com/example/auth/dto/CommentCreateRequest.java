package com.example.auth.dto;

import lombok.Data;
import java.util.List;

/**
 * 评论创建请求 DTO
 */
@Data
public class CommentCreateRequest {
    private Long postId;
    private Long parentCommentId; // 如果是回复评论，传入父评论ID
    private String commentContent;
    private List<String> commentImages; // 评论图片URL列表
}

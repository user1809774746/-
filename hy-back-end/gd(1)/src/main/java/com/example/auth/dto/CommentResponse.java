package com.example.auth.dto;

import lombok.Data;
import java.util.Date;
import java.util.List;

/**
 * 评论响应 DTO
 */
@Data
public class CommentResponse {
    private Long id;
    private Long postId;
    private Long userId;
    private String userNickname;
    private String userAvatarUrl;
    private Long parentCommentId;
    private String commentContent;
    private List<String> commentImages;
    private Integer likeCount;
    private Integer replyCount;
    private String status;
    private Boolean isAuthorReply;
    private Date createdTime;
    private Date updatedTime;
    
    // 用户相关（当前登录用户对此评论的操作状态）
    private Boolean isLiked;
    
    // 回复列表（如果是父评论）
    private List<CommentResponse> replies;
}

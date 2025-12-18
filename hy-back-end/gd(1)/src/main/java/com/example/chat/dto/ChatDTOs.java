package com.example.chat.dto;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;

import javax.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 聊天系统相关DTO类集合
 */
public class ChatDTOs {

    // =====================================================
    // 好友管理相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddFriendRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "好友ID不能为空")
        private Long friendId;
        
        @Size(max = 200, message = "申请消息不能超过200字符")
        private String message;
        
        private String source; // 添加来源：search/qr_code/phone等
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HandleFriendRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "好友ID不能为空")
        private Long friendId;
        
        @NotBlank(message = "处理动作不能为空")
        @Pattern(regexp = "accept|reject", message = "处理动作只能是accept或reject")
        private String action;
        
        @Size(max = 200, message = "拒绝原因不能超过200字符")
        private String rejectReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendDTO {
        private Long userId;
        private String username;
        private String nickname;
        private String avatar;
        private String phone;
        private String status; // online/offline/busy
        private String friendStatus; // pending/accepted/blocked
        private String remark; // 备注名
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastOnlineTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime friendTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendRequestDTO {
        private Long requestId;
        private Long fromUserId;
        private String fromUsername;
        private String fromNickname;
        private String fromAvatar;
        private String fromPhone;
        private String requestMessage;
        private String source;
        private String status; // pending, accepted, rejected
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime requestTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSearchDTO {
        private Long userId;
        private String username;
        private String nickname;
        private String avatar;
        private String phone;
        private Boolean isFriend;
        private String friendStatus;
    }

    // =====================================================
    // 消息相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendMessageRequest {
        @NotNull(message = "发送者ID不能为空")
        private Long senderId;
        
        private Long receiverId; // 私聊时必填
        private Long groupId; // 群聊时必填
        
        @NotBlank(message = "消息类型不能为空")
        @Pattern(regexp = "text|image|voice|video|file|location|emoji", message = "不支持的消息类型")
        private String messageType;
        
        @NotBlank(message = "消息内容不能为空")
        @Size(max = 5000, message = "消息内容不能超过5000字符")
        private String content;
        
        private String mediaUrl; // 媒体文件URL
        private Integer duration; // 语音/视频时长(秒)
        private String fileName; // 文件名
        private Long fileSize; // 文件大小
        private String thumbnail; // 缩略图URL
        
        private Long replyToMessageId; // 回复的消息ID
        private String extra; // 扩展字段(JSON格式)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShareTravelPlanRequest {
        @NotNull(message = "发送者ID不能为空")
        private Long senderId;

        @NotNull(message = "接收者ID不能为空")
        private Long receiverId;

        @NotNull(message = "旅行计划ID不能为空")
        private Long travelPlanId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageDTO {
        private Long messageId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private Long receiverId;
        private Long groupId;
        private Long travelPlanId;
        private String messageType;
        private String content;
        private String mediaUrl;
        private Integer duration;
        private String fileName;
        private Long fileSize;
        private String thumbnail;
        private Boolean isRecalled;
        private Long replyToMessageId;
        private MessageDTO replyToMessage;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime sentTime;
        private Long timestamp; // 时间戳（毫秒），便于前端使用
        private Boolean isRead;
        private Integer readCount; // 群消息已读人数
        private String extra;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationDTO {
        private Long conversationId;
        private String chatType; // user/group
        private Long targetId;
        private String targetName;
        private String targetAvatar;
        private MessageDTO lastMessage;
        private Integer unreadCount;
        private Boolean isPinned;
        private Boolean isMuted;
        private String chatBackground;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastMessageTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastReadTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkReadRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        private Long conversationId;
        private Long messageId; // 标记到指定消息为止
        private List<Long> messageIds; // 批量标记消息
    }

    // =====================================================
    // 聊天设置相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PinConversationRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "目标ID不能为空")
        private Long targetId;
        
        @NotBlank(message = "目标类型不能为空")
        @Pattern(regexp = "user|group", message = "目标类型只能是user或group")
        private String targetType;
        
        @NotNull(message = "置顶状态不能为空")
        private Boolean isPinned;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MuteConversationRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "目标ID不能为空")
        private Long targetId;
        
        @NotBlank(message = "目标类型不能为空")
        @Pattern(regexp = "user|group", message = "目标类型只能是user或group")
        private String targetType;
        
        @NotNull(message = "免打扰状态不能为空")
        private Boolean isMuted;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetBackgroundRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "目标ID不能为空")
        private Long targetId;
        
        @NotBlank(message = "目标类型不能为空")
        @Pattern(regexp = "user|group", message = "目标类型只能是user或group")
        private String targetType;
        
        private String backgroundImage; // 背景图片URL，为空表示使用默认背景
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClearChatRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        private Long friendId; // 私聊时填写
        private Long groupId; // 群聊时填写
        
        @NotNull(message = "清空类型不能为空")
        @Pattern(regexp = "all|before_time", message = "清空类型只能是all或before_time")
        private String clearType;
        
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime beforeTime; // clearType为before_time时必填
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatSettingsDTO {
        private Long userId;
        private Long targetId;
        private String targetType;
        private Boolean isPinned;
        private Boolean isMuted;
        private String backgroundImage;
        private Integer fontSize;
        private Boolean showOnlineStatus;
        private Boolean autoDownloadMedia;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedTime;
    }

    // =====================================================
    // 权限管理相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetPermissionsRequest {
        @NotNull(message = "权限拥有者ID不能为空")
        private Long ownerId;
        
        @NotNull(message = "目标用户ID不能为空")
        private Long targetUserId;
        
        @NotBlank(message = "权限级别不能为空")
        @Pattern(regexp = "chat_only|full_access", message = "权限级别只能是chat_only或full_access")
        private String permissionLevel;
        
        // 详细权限设置（可选，如果不设置则根据permissionLevel自动设置）
        private Boolean canViewProfile;
        private Boolean canViewMoments;
        private Boolean canViewStatus;
        private Boolean canSendFiles;
        private Boolean canVoiceCall;
        private Boolean canVideoCall;
        private Boolean autoAcceptFiles;
        private Boolean messageVerification;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatPermissionsDTO {
        private Long ownerId;
        private Long targetUserId;
        private String permissionLevel;
        private Boolean canViewProfile;
        private Boolean canViewMoments;
        private Boolean canViewStatus;
        private Boolean canSendFiles;
        private Boolean canVoiceCall;
        private Boolean canVideoCall;
        private Boolean autoAcceptFiles;
        private Boolean messageVerification;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedTime;
    }

    // =====================================================
    // 举报相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportUserRequest {
        @NotNull(message = "举报人ID不能为空")
        private Long reporterId;
        
        @NotNull(message = "被举报用户ID不能为空")
        private Long reportedUserId;
        
        @NotBlank(message = "举报类型不能为空")
        @Pattern(regexp = "spam|harassment|inappropriate|fraud|other", message = "不支持的举报类型")
        private String reportType;
        
        @NotBlank(message = "举报原因不能为空")
        @Size(max = 1000, message = "举报原因不能超过1000字符")
        private String reportReason;
        
        private List<String> evidenceImages; // 举报证据图片URL列表
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportMessageRequest {
        @NotNull(message = "举报人ID不能为空")
        private Long reporterId;
        
        @NotNull(message = "被举报消息ID不能为空")
        private Long messageId;
        
        @NotBlank(message = "举报类型不能为空")
        @Pattern(regexp = "spam|harassment|inappropriate|fraud|other", message = "不支持的举报类型")
        private String reportType;
        
        @NotBlank(message = "举报原因不能为空")
        @Size(max = 1000, message = "举报原因不能超过1000字符")
        private String reportReason;
        
        private List<String> evidenceImages;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportGroupRequest {
        @NotNull(message = "举报人ID不能为空")
        private Long reporterId;
        
        @NotNull(message = "被举报群ID不能为空")
        private Long groupId;
        
        @NotBlank(message = "举报类型不能为空")
        @Pattern(regexp = "spam|harassment|inappropriate|fraud|other", message = "不支持的举报类型")
        private String reportType;
        
        @NotBlank(message = "举报原因不能为空")
        @Size(max = 1000, message = "举报原因不能超过1000字符")
        private String reportReason;
        
        private List<String> evidenceImages;
    }

    // =====================================================
    // 统计相关DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnreadCountDTO {
        private Long userId;
        private Integer totalUnreadCount; // 总未读消息数
        private Integer friendUnreadCount; // 好友消息未读数
        private Integer groupUnreadCount; // 群消息未读数
        private List<ConversationUnreadDTO> conversationUnreads; // 各会话未读详情
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConversationUnreadDTO {
        private Long conversationId;
        private String chatType;
        private Long targetId;
        private String targetName;
        private Integer unreadCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatStatisticsDTO {
        private Long userId;
        private Integer totalFriends; // 好友总数
        private Integer totalGroups; // 群聊总数
        private Integer todayMessageCount; // 今日发送消息数
        private Integer totalMessageCount; // 总发送消息数
        private Integer activeConversations; // 活跃会话数
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastActiveTime; // 最后活跃时间
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendOnlineStatusDTO {
        private Long userId;
        private String username;
        private String nickname;
        private String avatar;
        private Boolean isOnline;
        private String status; // online/offline/busy/away
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastOnlineTime;
    }
}

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
 * 群聊系统相关DTO类集合
 */
public class GroupChatDTOs {

    // =====================================================
    // 群聊基础管理DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateGroupRequest {
        @NotNull(message = "创建者ID不能为空")
        private Long creatorId;
        
        @NotBlank(message = "群名称不能为空")
        @Size(min = 1, max = 100, message = "群名称长度必须在1-100字符之间")
        private String groupName;
        
        @Size(max = 500, message = "群描述不能超过500字符")
        private String groupDescription;
        
        private String groupAvatar; // 群头像URL
        
        @Min(value = 3, message = "群最大成员数不能少于3人")
        @Max(value = 500, message = "群最大成员数不能超过500人")
        private Integer maxMembers = 200;
        
        @Pattern(regexp = "normal|announcement|private", message = "群类型只能是normal、announcement或private")
        private String groupType = "normal";
        
        private Boolean joinApproval = true; // 是否需要加群审批
        private Boolean allowInvite = true; // 是否允许普通成员邀请
        
        private List<Long> initialMembers; // 初始成员ID列表
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateGroupWithFriendsRequest {
        @NotNull(message = "创建者ID不能为空")
        private Long creatorId;
        
        @NotBlank(message = "群名称不能为空")
        @Size(min = 1, max = 100, message = "群名称长度必须在1-100字符之间")
        private String groupName;
        
        @Size(max = 500, message = "群描述不能超过500字符")
        private String groupDescription;
        
        @NotEmpty(message = "邀请的好友列表不能为空")
        @Size(min = 1, max = 50, message = "一次最多邀请50个好友")
        private List<Long> friendIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateGroupInfoRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @Size(min = 1, max = 100, message = "群名称长度必须在1-100字符之间")
        private String groupName;
        
        @Size(max = 500, message = "群描述不能超过500字符")
        private String groupDescription;
        
        @Min(value = 3, message = "群最大成员数不能少于3人")
        @Max(value = 500, message = "群最大成员数不能超过500人")
        private Integer maxMembers;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupChatDTO {
        private Long groupId;
        private String groupName;
        private String groupAvatar;
        private String groupDescription;
        private Long creatorId;
        private String creatorName;
        private Integer maxMembers;
        private Integer currentMembers;
        private String groupType; // normal/announcement/private
        private Boolean joinApproval;
        private Boolean allowInvite;
        private Boolean muteAll;
        private String status; // active/disbanded/frozen
        private String myRole; // owner/admin/member
        private String myNickname; // 我在群内的昵称
        private Boolean isMuted; // 我是否被禁言
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime muteUntil; // 禁言到期时间
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime joinTime; // 我的加群时间
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedTime;
    }

    // =====================================================
    // 群成员管理DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InviteToGroupRequest {
        @NotNull(message = "邀请者ID不能为空")
        private Long inviterId;
        
        @NotEmpty(message = "被邀请用户列表不能为空")
        @Size(max = 20, message = "一次最多邀请20个用户")
        private List<Long> userIds;
        
        @Size(max = 200, message = "邀请消息不能超过200字符")
        private String inviteMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinGroupRequest {
        @NotNull(message = "申请者ID不能为空")
        private Long userId;
        
        @Size(max = 200, message = "申请消息不能超过200字符")
        private String joinMessage;
        
        private String source; // 加群来源：search/invite/qr_code等
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HandleJoinRequest {
        @NotNull(message = "处理者ID不能为空")
        private Long handlerId;
        
        @NotNull(message = "申请者ID不能为空")
        private Long applicantId;
        
        @NotBlank(message = "处理动作不能为空")
        @Pattern(regexp = "approve|reject", message = "处理动作只能是approve或reject")
        private String action;
        
        @Size(max = 200, message = "拒绝原因不能超过200字符")
        private String rejectReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMemberDTO {
        private Long userId;
        private String username;
        private String nickname;
        private String avatar;
        private String role; // owner/admin/member
        private String groupNickname; // 群内昵称
        private Boolean isMuted; // 是否被禁言
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime muteUntil; // 禁言到期时间
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime joinTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastReadTime;
        private String status; // active/left/kicked
        private Boolean isOnline; // 是否在线
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastOnlineTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KickMemberRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "被踢用户ID不能为空")
        private Long userId;
        
        @Size(max = 200, message = "踢出原因不能超过200字符")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetAdminRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "目标用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "是否设为管理员不能为空")
        private Boolean isAdmin; // true-设为管理员，false-取消管理员
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransferOwnershipRequest {
        @NotNull(message = "当前群主ID不能为空")
        private Long currentOwnerId;
        
        @NotNull(message = "新群主ID不能为空")
        private Long newOwnerId;
        
        @Size(max = 200, message = "转让原因不能超过200字符")
        private String reason;
    }

    // =====================================================
    // 群设置管理DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetGroupNicknameRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @Size(max = 50, message = "群昵称不能超过50字符")
        private String nickname;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MuteMemberRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "被禁言用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "是否禁言不能为空")
        private Boolean isMuted;
        
        private Integer muteDurationMinutes; // 禁言时长(分钟)，0表示永久禁言
        
        @Size(max = 200, message = "禁言原因不能超过200字符")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MuteAllRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "是否全员禁言不能为空")
        private Boolean muteAll;
        
        @Size(max = 200, message = "操作原因不能超过200字符")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetJoinApprovalRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "是否需要审批不能为空")
        private Boolean joinApproval;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetInvitePermissionRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotNull(message = "是否允许邀请不能为空")
        private Boolean allowInvite;
    }

    // =====================================================
    // 群消息管理DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SendGroupMessageRequest {
        @NotNull(message = "发送者ID不能为空")
        private Long senderId;
        
        @NotBlank(message = "消息类型不能为空")
        @Pattern(regexp = "text|image|voice|video|file|location|emoji|system", message = "不支持的消息类型")
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
        private List<Long> atUserIds; // @的用户ID列表
        private String extra; // 扩展字段(JSON格式)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MarkGroupReadRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        private Long messageId; // 标记到指定消息为止
        private List<Long> messageIds; // 批量标记消息
    }

    // =====================================================
    // 群聊高级功能DTO
    // =====================================================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetGroupTypeRequest {
        @NotNull(message = "操作者ID不能为空")
        private Long operatorId;
        
        @NotBlank(message = "群类型不能为空")
        @Pattern(regexp = "normal|announcement|private", message = "群类型只能是normal、announcement或private")
        private String groupType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchInviteRequest {
        @NotNull(message = "邀请者ID不能为空")
        private Long inviterId;
        
        @NotEmpty(message = "邀请用户列表不能为空")
        @Size(max = 50, message = "一次最多邀请50个用户")
        private List<Long> userIds;
        
        @Size(max = 200, message = "邀请消息不能超过200字符")
        private String inviteMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchInviteResultDTO {
        private Integer totalCount; // 总邀请数
        private Integer successCount; // 成功邀请数
        private Integer failCount; // 失败邀请数
        private List<InviteResultItem> results; // 详细结果
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InviteResultItem {
        private Long userId;
        private String username;
        private Boolean success;
        private String failReason; // 失败原因
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JoinRequestDTO {
        private Long requestId;
        private Long userId;
        private String username;
        private String nickname;
        private String avatar;
        private String joinMessage;
        private String source;
        private String status; // pending/approved/rejected
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime requestTime;
        private Long handlerId;
        private String handlerName;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime handleTime;
        private String rejectReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupStatisticsDTO {
        private Long groupId;
        private String groupName;
        private Integer totalMembers; // 总成员数
        private Integer activeMembers; // 活跃成员数(7天内发言)
        private Integer adminCount; // 管理员数量
        private Integer todayMessageCount; // 今日消息数
        private Integer totalMessageCount; // 总消息数
        private Integer mutedMemberCount; // 被禁言成员数
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime lastActiveTime; // 最后活跃时间
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdTime;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupAnnouncementDTO {
        private Long announcementId;
        private Long groupId;
        private String title;
        private String content;
        private Long publisherId;
        private String publisherName;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime publishTime;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime updatedTime;
        private Boolean isPinned; // 是否置顶
        private Integer readCount; // 已读人数
        private Boolean isRead; // 当前用户是否已读
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetAnnouncementRequest {
        @NotNull(message = "发布者ID不能为空")
        private Long publisherId;
        
        @NotBlank(message = "公告内容不能为空")
        private String content;
        
        private String title; // 公告标题（可选）
        private Boolean isPinned = false; // 是否置顶
    }

    // =====================================================
    // 群聊邀请通知DTO
    // =====================================================

    /**
     * 群聊邀请通知DTO
     * 用于 WebSocket 推送给被邀请的用户
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupInvitationNotificationDTO {
        private Long groupId;                    // 群ID
        private String groupName;                // 群名称
        private String groupAvatar;              // 群头像
        private String groupDescription;         // 群描述
        private Integer currentMembers;          // 当前成员数
        private Integer maxMembers;              // 最大成员数
        
        private Long inviterId;                  // 邀请人ID
        private String inviterName;              // 邀请人名称
        private String inviterAvatar;            // 邀请人头像
        
        private LocalDateTime invitationTime;    // 邀请时间
        private String notificationType;         // 通知类型：group_invitation
        private String invitationMessage;        // 邀请消息
    }
    
    /**
     * 获取群聊邀请通知列表的响应DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupInvitationDTO {
        private Long notificationId;             // 通知ID（使用群成员ID）
        private Long groupId;                    // 群ID
        private String groupName;                // 群名称
        private String groupAvatar;              // 群头像
        private Integer memberCount;             // 成员数
        
        private Long inviterId;                  // 邀请人ID
        private String inviterName;              // 邀请人名称
        
        private LocalDateTime joinTime;          // 加入时间
        private Boolean hasRead;                 // 是否已读
        private String status;                   // 状态：pending(待处理)/accepted(已接受)
    }
    
    /**
     * 群成员头像信息DTO
     * 用于获取群成员头像列表
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMemberAvatarDTO {
        private Long userId;                     // 用户ID
        private String username;                 // 用户名
        private String nickname;                 // 用户昵称
        private String avatar;                   // 用户头像URL
        private String groupNickname;            // 群内昵称
        private String memberRole;               // 成员角色：owner/admin/member
    }
    
    // =====================================================
    // 群聊设置相关DTO
    // =====================================================
    
    /**
     * 置顶群聊请求DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PinGroupRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "置顶状态不能为空")
        private Boolean isPinned;
    }
    
    /**
     * 消息免打扰请求DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisturbFreeRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        @NotNull(message = "免打扰状态不能为空")
        private Boolean isDisturbFree;
    }
    
    /**
     * 设置群聊背景请求DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SetChatBackgroundRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
        
        private String backgroundUrl; // 背景图片URL，为null表示清除背景
    }
    
    /**
     * 清空聊天记录请求DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClearChatHistoryRequest {
        @NotNull(message = "用户ID不能为空")
        private Long userId;
    }
    
    /**
     * 举报群聊请求DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportGroupRequest {
        @NotNull(message = "举报人ID不能为空")
        private Long reporterId;
        
        @NotBlank(message = "举报类型不能为空")
        @Pattern(regexp = "spam|fraud|pornography|violence|politics|harassment|other", 
                message = "举报类型必须是：spam(垃圾广告)、fraud(欺诈)、pornography(色情)、violence(暴力)、politics(政治敏感)、harassment(骚扰)、other(其他)")
        private String reportType;
        
        @NotBlank(message = "举报原因不能为空")
        @Size(min = 10, max = 500, message = "举报原因长度必须在10-500字符之间")
        private String reportReason;
        
        private List<String> evidenceUrls; // 证据截图URL列表
    }
    
    /**
     * 群聊设置信息DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupSettingsDTO {
        private Long groupId;
        private Long userId;
        private Boolean isPinned;              // 是否置顶
        private Boolean isDisturbFree;         // 是否免打扰
        private String chatBackground;         // 聊天背景URL
        private LocalDateTime clearHistoryTime; // 清空历史记录时间
        private Integer unreadCount;           // 未读消息数
    }
    
    /**
     * 聊天背景响应DTO
     * 用于返回用户在特定群聊下的背景图片URL
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatBackgroundDTO {
        private Long groupId;                  // 群聊ID
        private Long userId;                   // 用户ID
        private String chatBackground;         // 聊天背景URL（如果为null表示使用默认背景）
    }
    
    /**
     * 举报记录DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupReportDTO {
        private Long id;
        private Long groupId;
        private String groupName;
        private Long reporterId;
        private String reporterName;
        private String reportType;
        private String reportReason;
        private List<String> evidenceUrls;
        private String reportStatus;
        private Long handlerId;
        private String handlerName;
        private String handleResult;
        private LocalDateTime handledTime;
        private LocalDateTime createdTime;
    }
}

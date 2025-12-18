package com.example.chat.websocket;

import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

/**
 * WebSocket相关数据模型
 */
public class WebSocketModels {

    /**
     * WebSocket消息包装器
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class WebSocketMessageWrapper {
        private String type; // 消息类型
        private Map<String, Object> data; // 消息数据
        private Long timestamp; // 时间戳
        private String requestId; // 请求ID（用于响应匹配）
    }

    /**
     * WebSocket响应
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class WebSocketResponse {
        private String type; // 响应类型
        private Object data; // 响应数据
        private Boolean success; // 是否成功
        private String message; // 消息内容
        private String error; // 错误信息
        private Long timestamp; // 时间戳
        private String requestId; // 对应的请求ID
    }

    /**
     * 在线状态消息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OnlineStatusMessage {
        private Long userId;
        private Boolean isOnline;
        private String status; // online/offline/busy/away
        private Long timestamp;
    }

    /**
     * 正在输入消息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypingMessage {
        private Long userId;
        private String username;
        private Long targetId; // 目标用户ID或群ID
        private String targetType; // user/group
        private Boolean isTyping;
        private Long timestamp;
    }

    /**
     * 新消息通知
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NewMessageNotification {
        private Long messageId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private Long receiverId;
        private Long groupId;
        private String groupName;
        private String messageType;
        private String content;
        private String mediaUrl;
        private Long timestamp;
        private Boolean isGroupMessage;
    }

    /**
     * 消息已读回执
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MessageReadReceipt {
        private Long messageId;
        private Long readerId;
        private String readerName;
        private Long readTime;
        private Boolean isGroupMessage;
        private Integer totalReadCount; // 群消息总已读数
    }

    /**
     * 好友申请通知
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FriendRequestNotification {
        private Long requestId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private String message;
        private String action; // new_request/accepted/rejected
        private Long timestamp;
    }

    /**
     * 群组通知
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupNotification {
        private Long groupId;
        private String groupName;
        private String notificationType; // invited/joined/left/kicked/role_changed/info_updated
        private Long operatorId;
        private String operatorName;
        private Long targetUserId;
        private String targetUserName;
        private String message;
        private Long timestamp;
    }

    /**
     * 系统通知
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemNotification {
        private String notificationType; // maintenance/announcement/warning
        private String title;
        private String content;
        private String level; // info/warning/error
        private Boolean requireConfirm;
        private Long timestamp;
    }

    /**
     * 心跳消息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HeartbeatMessage {
        private Long userId;
        private Long timestamp;
        private String clientInfo; // 客户端信息
    }

    /**
     * 连接统计信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConnectionStats {
        private Integer totalConnections; // 总连接数
        private Integer onlineUsers; // 在线用户数
        private Integer activeConversations; // 活跃会话数
        private Long timestamp;
    }
}

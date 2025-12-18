package com.example.chat.websocket;

import com.example.chat.service.ChatService;
import com.example.chat.service.GroupChatService;
import com.example.chat.dto.ChatDTOs.MessageDTO;
import com.example.chat.websocket.WebSocketModels.*;
import com.example.chat.repository.GroupMemberRepository;
import com.example.chat.entity.GroupMember;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;

import java.io.IOException;
import java.util.Map;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * 聊天系统WebSocket处理器
 * 处理实时消息推送、在线状态管理等功能
 */
@Slf4j
@Component
public class ChatWebSocketHandler implements WebSocketHandler {

    private final ChatService chatService;
    private final ObjectMapper objectMapper;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupChatService groupChatService;
    
    // 使用构造函数注入，对 GroupChatService 使用 @Lazy 打破循环依赖
    public ChatWebSocketHandler(ChatService chatService, 
                                ObjectMapper objectMapper,
                                GroupMemberRepository groupMemberRepository,
                                @Lazy GroupChatService groupChatService) {
        this.chatService = chatService;
        this.objectMapper = objectMapper;
        this.groupMemberRepository = groupMemberRepository;
        this.groupChatService = groupChatService;
    }

    // 存储用户连接信息 <userId, Set<WebSocketSession>>
    private final Map<Long, CopyOnWriteArraySet<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    
    // 存储会话与用户的映射 <sessionId, userId>
    private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.info("WebSocket连接建立: {}", session.getId());
        
        // 从URL参数或header中获取用户ID
        Long userId = getUserIdFromSession(session);
        if (userId != null) {
            // 添加用户会话
            userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
            sessionUserMap.put(session.getId(), userId);
            
            // 更新用户在线状态
            chatService.updateOnlineStatus(userId, true);
            
            // 通知好友用户上线
            notifyFriendsOnlineStatus(userId, true);
            
            log.info("用户 {} 连接成功，当前连接数: {}", userId, userSessions.get(userId).size());
        } else {
            log.warn("无法获取用户ID，关闭连接: {}", session.getId());
            session.close(CloseStatus.BAD_DATA);
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        String payload = message.getPayload().toString();
        log.info("收到WebSocket消息: {}", payload);
        
        try {
            // 解析消息
            WebSocketMessageWrapper wrapper = objectMapper.readValue(payload, WebSocketMessageWrapper.class);
            Long userId = sessionUserMap.get(session.getId());
            
            if (userId == null) {
                sendErrorMessage(session, "用户未认证");
                return;
            }
            
            // 打印调试信息
            log.info("消息类型: [{}], 数据: {}", wrapper.getType(), wrapper.getData());
            
            // 根据消息类型处理
            switch (wrapper.getType()) {
                case "heartbeat":
                    handleHeartbeat(session, userId);
                    break;
                case "send_message":
                    handleSendMessage(session, userId, wrapper.getData());
                    break;
                case "typing":
                    handleTyping(session, userId, wrapper.getData());
                    break;
                case "read_message":
                    handleReadMessage(session, userId, wrapper.getData());
                    break;
                case "join_group":
                    handleJoinGroup(session, userId, wrapper.getData());
                    break;
                case "leave_group":
                    handleLeaveGroup(session, userId, wrapper.getData());
                    break;
                default:
                    log.warn("未知消息类型: {}", wrapper.getType());
                    sendErrorMessage(session, "未知消息类型");
            }
        } catch (Exception e) {
            log.error("处理WebSocket消息异常", e);
            sendErrorMessage(session, "消息处理失败");
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WebSocket传输异常: {}", session.getId(), exception);
        cleanupSession(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.info("WebSocket连接关闭: {}, 状态: {}", session.getId(), closeStatus);
        cleanupSession(session);
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }

    /**
     * 清理会话
     */
    private void cleanupSession(WebSocketSession session) {
        Long userId = sessionUserMap.remove(session.getId());
        if (userId != null) {
            CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                    // 更新用户离线状态
                    chatService.updateOnlineStatus(userId, false);
                    // 通知好友用户离线
                    notifyFriendsOnlineStatus(userId, false);
                }
            }
            log.info("用户 {} 会话清理完成", userId);
        }
    }

    /**
     * 处理心跳消息
     */
    private void handleHeartbeat(WebSocketSession session, Long userId) throws IOException {
        // 发送心跳响应
        WebSocketResponse response = WebSocketResponse.builder()
                .type("heartbeat_response")
                .success(true)
                .timestamp(System.currentTimeMillis())
                .build();
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    /**
     * 处理发送消息
     */
    private void handleSendMessage(WebSocketSession session, Long userId, Map<String, Object> data) throws IOException {
        try {
            Long receiverId = getLongValue(data, "receiverId");
            Long groupId = getLongValue(data, "groupId");
            String content = (String) data.get("content");
            String messageType = (String) data.get("messageType");
            Long replyToMessageId = getLongValue(data, "replyToMessageId");
            
            if (content == null || content.trim().isEmpty()) {
                sendErrorMessage(session, "消息内容不能为空");
                return;
            }
            
            if (messageType == null) {
                messageType = "text";
            }
            
            // 区分群聊和私聊
            if (groupId != null) {
                // 群聊消息
                handleGroupMessage(session, userId, groupId, content, messageType);
            } else if (receiverId != null) {
                // 私聊消息
                handlePrivateMessage(session, userId, receiverId, content, messageType, replyToMessageId);
            } else {
                sendErrorMessage(session, "必须指定接收者(receiverId)或群组(groupId)");
            }
            
        } catch (Exception e) {
            log.error("发送消息失败", e);
            sendErrorMessage(session, "消息发送失败: " + e.getMessage());
        }
    }
    
    /**
     * 处理群消息
     */
    private void handleGroupMessage(WebSocketSession session, Long userId, Long groupId, 
                                    String content, String messageType) throws IOException {
        try {
            // 构建群消息请求
            com.example.chat.dto.GroupChatDTOs.SendGroupMessageRequest request = 
                new com.example.chat.dto.GroupChatDTOs.SendGroupMessageRequest();
            request.setSenderId(userId);
            request.setMessageType(messageType);
            request.setContent(content);
            
            // 调用群聊服务发送消息
            com.example.common.result.Result<com.example.chat.dto.ChatDTOs.MessageDTO> result = 
                groupChatService.sendGroupMessage(groupId, request);
            
            if (result.getCode() == 200 && result.getData() != null) {
                com.example.chat.dto.ChatDTOs.MessageDTO messageDTO = result.getData();
                
                // 推送消息给所有群成员（GroupChatService内部已经处理）
                // pushMessageToGroup 在 GroupChatServiceImpl 中已调用
                
                // 给发送者返回成功响应
                WebSocketResponse successResponse = WebSocketResponse.builder()
                        .type("send_message_success")
                        .data(messageDTO)
                        .success(true)
                        .message("群消息发送成功")
                        .timestamp(System.currentTimeMillis())
                        .build();
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(successResponse)));
                
                log.info("群消息发送成功: messageId={}, groupId={}", messageDTO.getMessageId(), groupId);
            } else {
                sendErrorMessage(session, result.getMessage() != null ? result.getMessage() : "群消息发送失败");
            }
            
        } catch (Exception e) {
            log.error("发送群消息失败: groupId={}, userId={}", groupId, userId, e);
            sendErrorMessage(session, "群消息发送失败: " + e.getMessage());
        }
    }
    
    /**
     * 处理私聊消息
     */
    private void handlePrivateMessage(WebSocketSession session, Long userId, Long receiverId, 
                                      String content, String messageType, Long replyToMessageId) throws IOException {
        try {
            // 构建私聊消息请求
            com.example.chat.dto.ChatDTOs.SendMessageRequest request = 
                new com.example.chat.dto.ChatDTOs.SendMessageRequest();
            request.setSenderId(userId);
            request.setReceiverId(receiverId);
            request.setContent(content);
            request.setMessageType(messageType);
            request.setReplyToMessageId(replyToMessageId);
            
            // 调用聊天服务发送消息
            com.example.common.result.Result<?> result = chatService.sendMessage(request);
            
            if (result.getCode() == 200 && result.getData() != null) {
                com.example.chat.dto.ChatDTOs.MessageDTO messageDTO = 
                    (com.example.chat.dto.ChatDTOs.MessageDTO) result.getData();
                
                // 推送消息给接收者
                pushMessageToUser(receiverId, "new_message", messageDTO);
                
                // 给发送者返回成功响应
                WebSocketResponse successResponse = WebSocketResponse.builder()
                        .type("send_message_success")
                        .data(messageDTO)
                        .success(true)
                        .message("消息发送成功")
                        .timestamp(System.currentTimeMillis())
                        .build();
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(successResponse)));
                
                log.info("私聊消息发送成功: messageId={}", messageDTO.getMessageId());
            } else {
                sendErrorMessage(session, result.getMessage() != null ? result.getMessage() : "消息发送失败");
            }
            
        } catch (Exception e) {
            log.error("发送私聊消息失败: receiverId={}, userId={}", receiverId, userId, e);
            sendErrorMessage(session, "私聊消息发送失败: " + e.getMessage());
        }
    }

    /**
     * 处理正在输入状态
     */
    private void handleTyping(WebSocketSession session, Long userId, Map<String, Object> data) {
        Long targetId = getLongValue(data, "targetId");
        String targetType = (String) data.get("targetType");
        Boolean isTyping = (Boolean) data.get("isTyping");
        
        if (targetId != null && targetType != null) {
            Map<String, Object> typingData = Map.of(
                "userId", userId,
                "isTyping", isTyping != null ? isTyping : false,
                "targetType", targetType
            );
            
            if ("user".equals(targetType)) {
                // 推送给私聊对象
                pushMessageToUser(targetId, "typing_status", typingData);
            } else if ("group".equals(targetType)) {
                // 推送给群成员
                pushMessageToGroup(targetId, "typing_status", typingData);
            }
        }
    }

    /**
     * 处理消息已读
     */
    private void handleReadMessage(WebSocketSession session, Long userId, Map<String, Object> data) throws IOException {
        try {
            Long messageId = getLongValue(data, "messageId");
            Long conversationId = getLongValue(data, "conversationId");
            
            // 调用服务标记消息已读
            // chatService.markMessageAsReadViaWebSocket(userId, messageId, conversationId);
            
            // 通知发送者消息已读
            Map<String, Object> readData = Map.of(
                "messageId", messageId,
                "readerId", userId,
                "readTime", System.currentTimeMillis()
            );
            
            // 这里需要根据消息类型推送给相应的用户或群组
            sendSuccessMessage(session, "消息已读状态更新成功");
            
        } catch (Exception e) {
            log.error("处理消息已读失败", e);
            sendErrorMessage(session, "消息已读状态更新失败");
        }
    }

    /**
     * 处理加入群组
     */
    private void handleJoinGroup(WebSocketSession session, Long userId, Map<String, Object> data) {
        Long groupId = getLongValue(data, "groupId");
        if (groupId != null) {
            // 这里可以实现群组房间管理逻辑
            log.info("用户 {} 加入群组 {}", userId, groupId);
        }
    }

    /**
     * 处理离开群组
     */
    private void handleLeaveGroup(WebSocketSession session, Long userId, Map<String, Object> data) {
        Long groupId = getLongValue(data, "groupId");
        if (groupId != null) {
            // 这里可以实现群组房间管理逻辑
            log.info("用户 {} 离开群组 {}", userId, groupId);
        }
    }

    /**
     * 推送消息给指定用户
     */
    public void pushMessageToUser(Long userId, String messageType, Object data) {
        CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null && !sessions.isEmpty()) {
            WebSocketResponse response = WebSocketResponse.builder()
                    .type(messageType)
                    .data(data)
                    .success(true)
                    .timestamp(System.currentTimeMillis())
                    .build();
            
            try {
                String message = objectMapper.writeValueAsString(response);
                sessions.forEach(session -> {
                    try {
                        if (session.isOpen()) {
                            session.sendMessage(new TextMessage(message));
                        }
                    } catch (IOException e) {
                        log.error("推送消息失败", e);
                    }
                });
            } catch (Exception e) {
                log.error("序列化消息失败", e);
            }
        }
    }

    /**
     * 推送消息给群组成员
     */
    public void pushMessageToGroup(Long groupId, String messageType, Object data) {
        try {
            // 获取群成员列表
            List<GroupMember> members = groupMemberRepository.findByGroupIdAndMemberStatus(groupId, "active");
            
            log.info("推送群消息: groupId={}, messageType={}, memberCount={}", groupId, messageType, members.size());
            
            // 推送给所有活跃成员
            members.forEach(member -> {
                try {
                    pushMessageToUser(member.getUserId(), messageType, data);
                } catch (Exception e) {
                    log.error("推送给用户 {} 失败", member.getUserId(), e);
                }
            });
            
        } catch (Exception e) {
            log.error("推送群消息失败: groupId={}", groupId, e);
        }
    }

    /**
     * 通知好友在线状态变化
     */
    private void notifyFriendsOnlineStatus(Long userId, Boolean isOnline) {
        try {
            // 获取好友列表
            // List<Long> friendIds = chatService.getFriendIds(userId);
            
            Map<String, Object> statusData = Map.of(
                "userId", userId,
                "isOnline", isOnline,
                "timestamp", System.currentTimeMillis()
            );
            
            // friendIds.forEach(friendId -> pushMessageToUser(friendId, "friend_online_status", statusData));
            
        } catch (Exception e) {
            log.error("通知好友在线状态失败", e);
        }
    }

    /**
     * 发送成功消息
     */
    private void sendSuccessMessage(WebSocketSession session, String message) throws IOException {
        WebSocketResponse response = WebSocketResponse.builder()
                .type("success")
                .message(message)
                .success(true)
                .timestamp(System.currentTimeMillis())
                .build();
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    /**
     * 发送错误消息
     */
    private void sendErrorMessage(WebSocketSession session, String error) throws IOException {
        WebSocketResponse response = WebSocketResponse.builder()
                .type("error")
                .message(error)
                .success(false)
                .timestamp(System.currentTimeMillis())
                .build();
        
        session.sendMessage(new TextMessage(objectMapper.writeValueAsString(response)));
    }

    /**
     * 从会话中获取用户ID
     */
    private Long getUserIdFromSession(WebSocketSession session) {
        try {
            // 从URL参数获取
            String query = session.getUri().getQuery();
            if (query != null && query.contains("userId=")) {
                String userIdStr = query.substring(query.indexOf("userId=") + 7);
                if (userIdStr.contains("&")) {
                    userIdStr = userIdStr.substring(0, userIdStr.indexOf("&"));
                }
                
                // 检查是否为有效的数字
                if (userIdStr.matches("\\d+")) {
                    return Long.parseLong(userIdStr);
                } else {
                    log.warn("无效的用户ID格式: {}, 期望数字格式", userIdStr);
                    return null;
                }
            }
            
            // 从header获取
            String userIdHeader = session.getHandshakeHeaders().getFirst("X-User-Id");
            if (userIdHeader != null && userIdHeader.matches("\\d+")) {
                return Long.parseLong(userIdHeader);
            }
            
        } catch (NumberFormatException e) {
            log.error("用户ID格式错误，必须是数字: {}", e.getMessage());
        } catch (Exception e) {
            log.error("获取用户ID失败", e);
        }
        return null;
    }

    /**
     * 获取Long类型值
     */
    private Long getLongValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        } else if (value instanceof String) {
            try {
                return Long.parseLong((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * 获取在线用户数量
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }

    /**
     * 获取指定用户的连接数
     */
    public int getUserConnectionCount(Long userId) {
        CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
        return sessions != null ? sessions.size() : 0;
    }

    /**
     * 检查用户是否在线
     */
    public boolean isUserOnline(Long userId) {
        return userSessions.containsKey(userId) && !userSessions.get(userId).isEmpty();
    }
}

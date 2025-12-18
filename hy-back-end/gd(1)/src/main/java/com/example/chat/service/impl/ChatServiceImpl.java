package com.example.chat.service.impl;

import com.example.chat.service.ChatService;
import com.example.chat.dto.ChatDTOs.*;
import com.example.chat.entity.*;
import com.example.chat.repository.*;
import com.example.auth.entity.User;
import com.example.auth.entity.TravelPlan;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.TravelPlanRepository;
import com.example.common.result.Result;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Map;
import java.util.Base64;
import java.util.stream.Collectors;

/**
 * 聊天服务实现类
 */
@Slf4j
@Service
@Transactional
public class ChatServiceImpl implements ChatService {
    
    private final UserFriendshipRepository friendshipRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ChatSettingsRepository chatSettingsRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final TravelPlanRepository travelPlanRepository;
    private final com.example.chat.websocket.ChatWebSocketHandler webSocketHandler;
    private final ObjectMapper objectMapper;
    
  	// 手动构造函数，使用@Lazy解决循环依赖
	    public ChatServiceImpl(
	            UserFriendshipRepository friendshipRepository,
	            ConversationRepository conversationRepository,
	            MessageRepository messageRepository,
	            UserRepository userRepository,
	            ChatSettingsRepository chatSettingsRepository,
	            UserPermissionRepository userPermissionRepository,
	            TravelPlanRepository travelPlanRepository,
	            @Lazy com.example.chat.websocket.ChatWebSocketHandler webSocketHandler,
	            ObjectMapper objectMapper) {
	        this.friendshipRepository = friendshipRepository;
	        this.conversationRepository = conversationRepository;
	        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.chatSettingsRepository = chatSettingsRepository;
        this.userPermissionRepository = userPermissionRepository;
        this.travelPlanRepository = travelPlanRepository;
        this.webSocketHandler = webSocketHandler;
        this.objectMapper = objectMapper;
    }

    @Override
    public Result<String> addFriend(AddFriendRequest request) {
        try {
            log.info("添加好友请求: userId={}, friendId={}", request.getUserId(), request.getFriendId());
            
            // 检查是否尝试添加自己为好友
            if (request.getUserId().equals(request.getFriendId())) {
                return Result.error("不能添加自己为好友");
            }
            
            // 检查目标用户是否存在
            // TODO: 临时注释掉，调试用
            // if (!userRepository.existsById(request.getFriendId())) {
            //     return Result.error("目标用户不存在");
            // }
            
            // 检查是否已经是好友或已有申请
            List<UserFriendship> existingFriendships = friendshipRepository
                .findFriendshipsBetweenUsers(request.getUserId(), request.getFriendId());
            
            if (!existingFriendships.isEmpty()) {
                // 取最新的记录（按创建时间倒序）
                UserFriendship friendship = existingFriendships.get(0);
                if (friendship.getStatus() == UserFriendship.FriendshipStatus.accepted) {
                    return Result.error("你们已经是好友了");
                } else if (friendship.getStatus() == UserFriendship.FriendshipStatus.pending) {
                    return Result.error("好友申请已发送，请等待对方处理");
                } else if (friendship.getStatus() == UserFriendship.FriendshipStatus.rejected) {
                    // 如果之前被拒绝，允许重新申请，更新现有记录
                    friendship.setUserId(request.getUserId());
                    friendship.setFriendId(request.getFriendId());
                    friendship.setStatus(UserFriendship.FriendshipStatus.pending);
                    friendship.setRequestMessage(request.getMessage());
                    friendship.setRequestSource(request.getSource());
                    friendship.setAcceptedAt(null);
                    friendship.setRejectReason(null);
                    
                    friendshipRepository.save(friendship);
                    return Result.success("好友申请已重新发送");
                }
            }
            
            // 创建好友申请
            UserFriendship friendship = new UserFriendship();
            friendship.setUserId(request.getUserId());
            friendship.setFriendId(request.getFriendId());
            friendship.setStatus(UserFriendship.FriendshipStatus.pending);
            friendship.setRequestMessage(request.getMessage());
            friendship.setRequestSource(request.getSource());
            
            friendshipRepository.save(friendship);
            
            return Result.success("好友申请已发送");
        } catch (Exception e) {
            log.error("添加好友失败", e);
            return Result.error("添加好友失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> handleFriendRequest(HandleFriendRequest request) {
        try {
            log.info("处理好友申请: userId={}, friendId={}, action={}", 
                request.getUserId(), request.getFriendId(), request.getAction());
            
            List<UserFriendship> friendships = friendshipRepository
                .findFriendshipsBetweenUsers(request.getUserId(), request.getFriendId());
            
            if (friendships.isEmpty()) {
                return Result.error("未找到好友申请");
            }
            
            // 取最新的记录（按创建时间倒序）
            UserFriendship friendship = friendships.get(0);
            
            if ("accept".equals(request.getAction())) {
                friendship.setStatus(UserFriendship.FriendshipStatus.accepted);
                friendship.setAcceptedAt(LocalDateTime.now());
                friendshipRepository.save(friendship);
                return Result.success("已接受好友申请");
            } else if ("reject".equals(request.getAction())) {
                friendship.setStatus(UserFriendship.FriendshipStatus.rejected);
                friendship.setRejectReason(request.getRejectReason());
                friendshipRepository.save(friendship);
                return Result.success("已拒绝好友申请");
            }
            
            return Result.error("无效的操作");
        } catch (Exception e) {
            log.error("处理好友申请失败", e);
            return Result.error("处理好友申请失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<FriendDTO>> getFriendsList(Long userId) {
        try {
            log.info("获取好友列表: userId={}", userId);
            
            List<UserFriendship> friendships = friendshipRepository.findAcceptedFriendsByUserId(userId);
            
            List<FriendDTO> friends = friendships.stream().map(friendship -> {
                Long friendId = friendship.getUserId().equals(userId) ? 
                    friendship.getFriendId() : friendship.getUserId();
                
                User friendUser = userRepository.findById(friendId).orElse(null);

                FriendDTO dto = new FriendDTO();
                dto.setUserId(friendId);
                if (friendUser != null) {
                    dto.setUsername(friendUser.getUsername());
                    String nickname = friendUser.getUsername();
                    dto.setNickname(nickname); // 这里应该从用户表获取真实昵称
                    dto.setPhone(friendUser.getNumber());

                    if (friendUser.getUserProfilePic() != null && friendUser.getUserProfilePic().length > 0) {
                        String base64 = Base64.getEncoder().encodeToString(friendUser.getUserProfilePic());
                        String dataUrl = "data:image/jpeg;base64," + base64;
                        dto.setAvatar(dataUrl); // 从 user_info 中获取头像
                    }
                } else {
                    dto.setNickname("用户" + friendId); // 这里应该从用户表获取真实昵称
                }
                dto.setStatus("offline"); // 这里应该从在线状态服务获取
                dto.setLastOnlineTime(LocalDateTime.now());
                dto.setFriendTime(friendship.getAcceptedAt());
                
                return dto;
            }).collect(Collectors.toList());
            
            return Result.success(friends);
        } catch (Exception e) {
            log.error("获取好友列表失败", e);
            return Result.error("获取好友列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> deleteFriend(Long userId, Long friendId) {
        // TODO: 实现删除好友逻辑
        return Result.success("好友已删除");
    }

    @Override
    public Result<List<FriendRequestDTO>> getFriendRequests(Long userId) {
        try {
            log.info("获取好友申请列表: userId={}", userId);
            
            // 获取用户收到的好友申请（status = pending）
            List<UserFriendship> friendRequests = friendshipRepository
                .findByFriendIdAndStatus(userId, UserFriendship.FriendshipStatus.pending);
            
            List<FriendRequestDTO> requestDTOs = friendRequests.stream().map(request -> {
                // 获取申请发送者的信息
                User fromUser = userRepository.findById(request.getUserId()).orElse(null);
                
                FriendRequestDTO dto = new FriendRequestDTO();
                dto.setRequestId(request.getId());
                dto.setFromUserId(request.getUserId());
                dto.setRequestMessage(request.getRequestMessage());
                dto.setSource(request.getRequestSource());
                dto.setStatus(request.getStatus().name());
                dto.setRequestTime(request.getCreatedAt());
                
                if (fromUser != null) {
                    dto.setFromUsername(fromUser.getUsername());
                    dto.setFromNickname(fromUser.getUsername()); // 暂时用username作为nickname
                    dto.setFromPhone(fromUser.getNumber());

                    if (fromUser.getUserProfilePic() != null && fromUser.getUserProfilePic().length > 0) {
                        String base64 = Base64.getEncoder().encodeToString(fromUser.getUserProfilePic());
                        String dataUrl = "data:image/jpeg;base64," + base64;
                        dto.setFromAvatar(dataUrl);
                    } else {
                        dto.setFromAvatar(null);
                    }
                }
                
                return dto;
            }).collect(Collectors.toList());
            
            log.info("找到 {} 个好友申请", requestDTOs.size());
            return Result.success(requestDTOs);
        } catch (Exception e) {
            log.error("获取好友申请列表失败", e);
            return Result.error("获取好友申请列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<UserSearchDTO>> searchUsers(String keyword, Long userId) {
        try {
            log.info("搜索用户: keyword={}, userId={}", keyword, userId);
            
            if (keyword == null || keyword.trim().isEmpty()) {
                return Result.error("搜索关键词不能为空");
            }
            
            // 搜索用户
            List<User> users = userRepository.searchByKeyword(keyword.trim());
            
            // 转换为DTO并过滤掉自己（如果提供了userId）
            List<UserSearchDTO> userSearchDTOs = users.stream()
                .filter(user -> userId == null || !user.getUserId().equals(userId)) // 如果userId为null则不过滤
                .map(user -> {
                    String avatarDataUrl = null;
                    if (user.getUserProfilePic() != null && user.getUserProfilePic().length > 0) {
                        String base64 = Base64.getEncoder().encodeToString(user.getUserProfilePic());
                        avatarDataUrl = "data:image/jpeg;base64," + base64;
                    }

                    return UserSearchDTO.builder()
                        .userId(user.getUserId())
                        .username(user.getUsername())
                        .nickname(user.getUsername()) // 暂时用username作为nickname
                        .avatar(avatarDataUrl)
                        .phone(user.getNumber())
                        .build();
                })
                .collect(Collectors.toList());
            
            log.info("搜索到 {} 个用户", userSearchDTOs.size());
            return Result.success(userSearchDTOs);
            
        } catch (Exception e) {
            log.error("搜索用户失败", e);
            return Result.error("搜索用户失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<ConversationDTO>> getConversationsList(Long userId) {
        try {
            log.info("获取会话列表: userId={}", userId);

            // 查询与用户相关的消息，按时间倒序，便于提取每个会话的最后一条消息
            List<Message> userMessages = messageRepository.findUserMessagesOrderByCreatedAtDesc(userId);
            if (userMessages.isEmpty()) {
                return Result.success(new ArrayList<>());
            }

            // 预加载当前用户的聊天设置（私聊）
            List<ChatSettings> settingsList = chatSettingsRepository.findByUserIdAndTargetType(userId, "user");
            Map<Long, ChatSettings> settingsMap = settingsList.stream()
                    .collect(Collectors.toMap(ChatSettings::getTargetId, s -> s, (a, b) -> a));

            Map<Long, ConversationDTO> conversationMap = new java.util.LinkedHashMap<>();

            for (Message message : userMessages) {
                Long conversationId = message.getConversationId();
                if (conversationMap.containsKey(conversationId)) {
                    continue;
                }

                Long targetId = message.getSenderId().equals(userId) ?
                        message.getReceiverId() : message.getSenderId();

                User targetUser = userRepository.findById(targetId).orElse(null);
                User sender = userRepository.findById(message.getSenderId()).orElse(null);

                ChatSettings settings = settingsMap.get(targetId);

                MessageDTO lastMessageDTO = MessageDTO.builder()
                        .messageId(message.getId())
                        .senderId(message.getSenderId())
                        .receiverId(message.getReceiverId())
                        .content(message.getContent())
                        .messageType(message.getMessageType())
                        .sentTime(message.getCreatedAt())
                        .replyToMessageId(message.getReplyToMessageId())
                        .senderName(sender != null ? sender.getUsername() : "未知用户")
                        .isRead("read".equalsIgnoreCase(message.getStatus()))
                        .isRecalled(message.getRecalledAt() != null)
                        .build();

                int unreadCount = (int) messageRepository
                        .countUnreadByConversationIdAndUserId(conversationId, userId);

                String targetName = targetUser != null ? targetUser.getUsername() : "用户" + targetId;
                String targetAvatar = null;
                if (targetUser != null && targetUser.getUserProfilePic() != null && targetUser.getUserProfilePic().length > 0) {
                    String base64 = Base64.getEncoder().encodeToString(targetUser.getUserProfilePic());
                    targetAvatar = "data:image/jpeg;base64," + base64;
                }

                ConversationDTO dto = ConversationDTO.builder()
                        .conversationId(conversationId)
                        .chatType("user")
                        .targetId(targetId)
                        .targetName(targetName)
                        .targetAvatar(targetAvatar)
                        .lastMessage(lastMessageDTO)
                        .unreadCount(unreadCount)
                        .isPinned(settings != null && Boolean.TRUE.equals(settings.getIsPinned()))
                        .isMuted(settings != null && Boolean.TRUE.equals(settings.getIsMuted()))
                        .chatBackground(settings != null ? settings.getBackgroundImage() : null)
                        .lastMessageTime(message.getCreatedAt())
                        .lastReadTime(settings != null ? settings.getLastReadTime() : null)
                        .build();

                conversationMap.put(conversationId, dto);
            }

            List<ConversationDTO> conversations = new ArrayList<>(conversationMap.values());

            // 置顶会话排在前面，其余按最后消息时间倒序
            conversations.sort((a, b) -> {
                boolean aPinned = Boolean.TRUE.equals(a.getIsPinned());
                boolean bPinned = Boolean.TRUE.equals(b.getIsPinned());
                if (aPinned != bPinned) {
                    return aPinned ? -1 : 1;
                }
                LocalDateTime t1 = a.getLastMessageTime();
                LocalDateTime t2 = b.getLastMessageTime();
                if (t1 == null && t2 == null) {
                    return 0;
                }
                if (t1 == null) {
                    return 1;
                }
                if (t2 == null) {
                    return -1;
                }
                return t2.compareTo(t1);
            });

            return Result.success(conversations);
        } catch (Exception e) {
            log.error("获取会话列表失败", e);
            return Result.error("获取会话列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<MessageDTO> sendMessage(SendMessageRequest request) {
        try {
            log.info("发送消息: senderId={}, receiverId={}, content={}", 
                request.getSenderId(), request.getReceiverId(), request.getContent());
            
            // 验证发送者和接收者是否存在
            User sender = userRepository.findById(request.getSenderId())
                .orElseThrow(() -> new RuntimeException("发送者不存在"));
            User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("接收者不存在"));
            
            // 暂时移除外键约束的依赖，直接使用生成的conversationId
            // TODO: 后续需要实现conversations表的管理
            // 生成会话ID（简单实现：较小的用户ID在前）
            Long conversationId = Math.min(request.getSenderId(), request.getReceiverId()) * 1000000L + 
                                Math.max(request.getSenderId(), request.getReceiverId());
            
            log.info("生成会话ID: {}", conversationId);
            
            // 创建消息实体
            Message message = new Message();
            message.setConversationId(conversationId);
            message.setSenderId(request.getSenderId());
            message.setReceiverId(request.getReceiverId()); // 添加receiverId字段
            message.setContent(request.getContent());
            // 数据库的message_type是小写enum，直接使用小写值
            message.setMessageType(request.getMessageType().toLowerCase());
            message.setReplyToMessageId(request.getReplyToMessageId());
            // 数据库status是varchar，设置字符串值
            message.setStatus("sent");
            
            // 保存消息到数据库
            Message savedMessage = messageRepository.save(message);
            
            // 转换为DTO
            MessageDTO messageDTO = MessageDTO.builder()
                .messageId(savedMessage.getId())
                .senderId(savedMessage.getSenderId())
                .receiverId(savedMessage.getReceiverId())
                .content(savedMessage.getContent())
                .messageType(savedMessage.getMessageType())
                .sentTime(savedMessage.getCreatedAt())
                .timestamp(System.currentTimeMillis()) // 添加时间戳
                .replyToMessageId(savedMessage.getReplyToMessageId())
                .senderName(sender.getUsername())
                .isRead(false)
                .isRecalled(false)
                .build();
            
            log.info("消息发送成功: messageId={}", savedMessage.getId());
            
            // 通过WebSocket推送消息给接收者
            try {
                webSocketHandler.pushMessageToUser(request.getReceiverId(), "new_message", messageDTO);
                log.info("已推送消息给用户: receiverId={}", request.getReceiverId());
            } catch (Exception e) {
                log.warn("WebSocket推送失败，但消息已保存: {}", e.getMessage());
                // 推送失败不影响消息发送成功的结果
            }
            
            return Result.success("消息发送成功", messageDTO);
            
        } catch (Exception e) {
            log.error("发送消息失败", e);
            return Result.error("发送消息失败: " + e.getMessage());
        }
    }

    @Override
    public Result<MessageDTO> shareTravelPlan(ShareTravelPlanRequest request) {
        try {
            log.info("分享旅行计划: senderId={}, receiverId={}, travelPlanId={}",
                    request.getSenderId(), request.getReceiverId(), request.getTravelPlanId());

            if (request == null
                    || request.getSenderId() == null
                    || request.getReceiverId() == null
                    || request.getTravelPlanId() == null) {
                return Result.error("参数不能为空");
            }

            Long senderId = request.getSenderId();
            Long receiverId = request.getReceiverId();
            Long travelPlanId = request.getTravelPlanId();

            // 校验用户和旅行计划是否存在
            User sender = userRepository.findById(senderId)
                    .orElseThrow(() -> new RuntimeException("发送者不存在"));
            userRepository.findById(receiverId)
                    .orElseThrow(() -> new RuntimeException("接收者不存在"));

            TravelPlan travelPlan = travelPlanRepository.findById(travelPlanId)
                    .orElseThrow(() -> new RuntimeException("旅行计划不存在"));

            // 生成会话ID（与sendMessage保持一致：较小的用户ID在前）
            Long conversationId = Math.min(senderId, receiverId) * 1000000L +
                    Math.max(senderId, receiverId);

            // 构造卡片extra数据
            java.util.Map<String, Object> card = new java.util.HashMap<>();
            card.put("cardType", "travel_plan");
            card.put("title", travelPlan.getTitle());
            card.put("destination", travelPlan.getDestination());
            card.put("travelDays", travelPlan.getTravelDays());
            if (travelPlan.getStartDate() != null) {
                card.put("startDate", travelPlan.getStartDate().toString());
            }
            if (travelPlan.getEndDate() != null) {
                card.put("endDate", travelPlan.getEndDate().toString());
            }
            card.put("createdBy", sender.getUsername());

            String extraJson = null;
            try {
                extraJson = objectMapper.writeValueAsString(card);
            } catch (Exception e) {
                log.warn("序列化旅行计划卡片数据失败: {}", e.getMessage());
            }

            // 创建消息实体
            Message message = new Message();
            message.setConversationId(conversationId);
            message.setSenderId(senderId);
            message.setReceiverId(receiverId);
            message.setMessageType("travel_plan");
            message.setContent(null);
            message.setReplyToMessageId(null);
            message.setStatus("sent");
            message.setTravelPlanId(travelPlanId);
            message.setExtra(extraJson);

            Message savedMessage = messageRepository.save(message);

            // 转换为DTO
            MessageDTO dto = MessageDTO.builder()
                    .messageId(savedMessage.getId())
                    .senderId(savedMessage.getSenderId())
                    .receiverId(savedMessage.getReceiverId())
                    .messageType(savedMessage.getMessageType())
                    .content(savedMessage.getContent())
                    .travelPlanId(savedMessage.getTravelPlanId())
                    .extra(savedMessage.getExtra())
                    .sentTime(savedMessage.getCreatedAt())
                    .timestamp(System.currentTimeMillis())
                    .senderName(sender.getUsername())
                    .isRead(false)
                    .isRecalled(false)
                    .build();

            // 通过WebSocket推送给接收者
            try {
                webSocketHandler.pushMessageToUser(receiverId, "new_message", dto);
            } catch (Exception e) {
                log.warn("WebSocket推送旅行计划消息失败，但消息已保存: {}", e.getMessage());
            }

            return Result.success("旅行计划分享成功", dto);
        } catch (Exception e) {
            log.error("分享旅行计划失败", e);
            return Result.error("分享旅行计划失败: " + e.getMessage());
        }
    }

    @Override
    public Result<MessageDTO> sendFileMessage(Long senderId, Long receiverId, Long groupId, String messageType, MultipartFile file) {
        // TODO: 实现发送文件消息逻辑
        return Result.success("文件消息发送成功", null);
    }

    @Override
    public Result<List<MessageDTO>> getChatHistory(Long userId, Long friendId, Long groupId, Integer page, Integer size) {
        try {
            log.info("获取聊天记录: userId={}, friendId={}, page={}, size={}", userId, friendId, page, size);
            
            // 如果是私聊（friendId不为空）
            if (friendId != null) {
                // 生成会话ID
                Long conversationId = Math.min(userId, friendId) * 1000000L + 
                                    Math.max(userId, friendId);
                
                // 查询该会话的所有消息，按时间倒序（最新的在前）
                List<Message> messages = messageRepository
                    .findByConversationIdOrderByCreatedAtDesc(conversationId);
                
                // 转换为DTO
                List<MessageDTO> messageDTOs = new ArrayList<>();
                for (Message message : messages) {
                    // 获取发送者信息
                    User sender = userRepository.findById(message.getSenderId()).orElse(null);
                    
                    MessageDTO dto = MessageDTO.builder()
                        .messageId(message.getId())
                        .senderId(message.getSenderId())
                        .receiverId(message.getReceiverId())
                        .content(message.getContent())
                        .messageType(message.getMessageType())
                        .sentTime(message.getCreatedAt())
                        .replyToMessageId(message.getReplyToMessageId())
                        .senderName(sender != null ? sender.getUsername() : "未知用户")
                        .isRead("read".equalsIgnoreCase(message.getStatus())) // TODO: 实现已读状态
                        .isRecalled(message.getRecalledAt() != null) // TODO: 从数据库读取撤回状态
                        .build();
                    
                    messageDTOs.add(dto);
                }
                
                log.info("获取到聊天记录: {} 条", messageDTOs.size());
                return Result.success("获取聊天记录成功", messageDTOs);
            }
            
            // TODO: 实现群聊历史记录
            return Result.success("获取聊天记录成功", new ArrayList<>());
            
        } catch (Exception e) {
            log.error("获取聊天记录失败", e);
            return Result.error("获取聊天记录失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<MessageDTO>> searchChatHistory(Long userId, String keyword, Long friendId, Long groupId, Integer page, Integer size) {
        // TODO: 实现搜索聊天记录逻辑
        return Result.success(new ArrayList<>());
    }

    @Override
    public Result<String> recallMessage(Long messageId, Long userId) {
        // TODO: 实现撤回消息逻辑
        return Result.success("消息已撤回");
    }

    @Override
    public Result<String> markMessagesAsRead(MarkReadRequest request) {
        try {
            log.info("标记消息已读: userId={}, conversationId={}, messageId={}, messageIds={}",
                    request.getUserId(), request.getConversationId(),
                    request.getMessageId(), request.getMessageIds());

            if (request.getUserId() == null) {
                return Result.error("用户ID不能为空");
            }

            Long userId = request.getUserId();

            if (request.getConversationId() != null) {
                Long conversationId = request.getConversationId();
                List<Message> messages = messageRepository
                        .findByConversationIdAndReceiverId(conversationId, userId);
                for (Message message : messages) {
                    if (!"read".equalsIgnoreCase(message.getStatus())) {
                        message.setStatus("read");
                    }
                }
                messageRepository.saveAll(messages);
            } else if (request.getMessageIds() != null && !request.getMessageIds().isEmpty()) {
                List<Message> messages = messageRepository
                        .findByIdInAndReceiverId(request.getMessageIds(), userId);
                for (Message message : messages) {
                    if (!"read".equalsIgnoreCase(message.getStatus())) {
                        message.setStatus("read");
                    }
                }
                messageRepository.saveAll(messages);
            } else if (request.getMessageId() != null) {
                Optional<Message> optional = messageRepository.findById(request.getMessageId());
                if (optional.isPresent()) {
                    Message message = optional.get();
                    if (userId.equals(message.getReceiverId())
                            && !"read".equalsIgnoreCase(message.getStatus())) {
                        message.setStatus("read");
                        messageRepository.save(message);
                    }
                }
            } else {
                return Result.error("缺少会话ID或消息ID参数");
            }

            return Result.success("消息已标记为已读");
        } catch (Exception e) {
            log.error("标记消息已读失败", e);
            return Result.error("标记消息已读失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> pinConversation(PinConversationRequest request) {
        try {
            log.info("更新会话置顶状态: userId={}, targetId={}, targetType={}, isPinned={}",
                    request.getUserId(), request.getTargetId(),
                    request.getTargetType(), request.getIsPinned());

            ChatSettings settings = getOrCreateChatSettings(
                    request.getUserId(),
                    request.getTargetId(),
                    request.getTargetType()
            );
            settings.setIsPinned(request.getIsPinned());
            chatSettingsRepository.save(settings);

            return Result.success("会话置顶状态已更新");
        } catch (Exception e) {
            log.error("更新会话置顶状态失败", e);
            return Result.error("更新会话置顶状态失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> muteConversation(MuteConversationRequest request) {
        try {
            log.info("更新会话免打扰状态: userId={}, targetId={}, targetType={}, isMuted={}",
                    request.getUserId(), request.getTargetId(),
                    request.getTargetType(), request.getIsMuted());

            ChatSettings settings = getOrCreateChatSettings(
                    request.getUserId(),
                    request.getTargetId(),
                    request.getTargetType()
            );
            settings.setIsMuted(request.getIsMuted());
            chatSettingsRepository.save(settings);

            return Result.success("免打扰设置已更新");
        } catch (Exception e) {
            log.error("更新免打扰设置失败", e);
            return Result.error("更新免打扰设置失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> setChatBackground(SetBackgroundRequest request) {
        try {
            log.info("设置聊天背景: userId={}, targetId={}, targetType={}",
                    request.getUserId(), request.getTargetId(), request.getTargetType());

            ChatSettings settings = getOrCreateChatSettings(
                    request.getUserId(),
                    request.getTargetId(),
                    request.getTargetType()
            );
            settings.setBackgroundImage(request.getBackgroundImage());
            chatSettingsRepository.save(settings);

            return Result.success("聊天背景已设置");
        } catch (Exception e) {
            log.error("设置聊天背景失败", e);
            return Result.error("设置聊天背景失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> uploadChatBackground(Long userId, Long targetId, String targetType, MultipartFile backgroundImage) {
        try {
            log.info("上传聊天背景: userId={}, targetId={}, targetType={}, fileName={}",
                    userId, targetId, targetType,
                    backgroundImage != null ? backgroundImage.getOriginalFilename() : null);

            if (userId == null || targetId == null || targetType == null) {
                return Result.error("用户ID、目标ID和目标类型不能为空");
            }

            if (backgroundImage == null || backgroundImage.isEmpty()) {
                return Result.error("上传的背景图片不能为空");
            }

            String contentType = backgroundImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return Result.error("仅支持上传图片类型文件");
            }

            long maxSize = 5L * 1024 * 1024; // 5MB
            if (backgroundImage.getSize() > maxSize) {
                return Result.error("图片大小不能超过5MB");
            }

            byte[] bytes = backgroundImage.getBytes();
            String base64 = Base64.getEncoder().encodeToString(bytes);
            String dataUrl = "data:" + contentType + ";base64," + base64;

            ChatSettings settings = getOrCreateChatSettings(userId, targetId, targetType);
            settings.setBackgroundImage(dataUrl);
            chatSettingsRepository.save(settings);

            return Result.success("聊天背景已上传");
        } catch (Exception e) {
            log.error("上传聊天背景失败", e);
            return Result.error("上传聊天背景失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> clearChatHistory(ClearChatRequest request) {
        // TODO: 实现清空聊天记录逻辑
        return Result.success("聊天记录已清空");
    }

    @Override
    public Result<ChatSettingsDTO> getChatSettings(Long userId, Long targetId, String targetType) {
        try {
            log.info("获取聊天设置: userId={}, targetId={}, targetType={}",
                    userId, targetId, targetType);

            Optional<ChatSettings> optional = chatSettingsRepository
                    .findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);

            ChatSettings settings = optional.orElseGet(() -> {
                ChatSettings s = new ChatSettings();
                s.setUserId(userId);
                s.setTargetId(targetId);
                s.setTargetType(targetType);
                s.setIsPinned(false);
                s.setIsMuted(false);
                return s;
            });

            ChatSettingsDTO dto = ChatSettingsDTO.builder()
                    .userId(settings.getUserId())
                    .targetId(settings.getTargetId())
                    .targetType(settings.getTargetType())
                    .isPinned(Boolean.TRUE.equals(settings.getIsPinned()))
                    .isMuted(Boolean.TRUE.equals(settings.getIsMuted()))
                    .backgroundImage(settings.getBackgroundImage())
                    .fontSize(settings.getFontSize())
                    .showOnlineStatus(settings.getShowOnlineStatus())
                    .autoDownloadMedia(settings.getAutoDownloadMedia())
                    .createdTime(settings.getCreatedAt())
                    .updatedTime(settings.getUpdatedAt())
                    .build();

            return Result.success(dto);
        } catch (Exception e) {
            log.error("获取聊天设置失败", e);
            return Result.error("获取聊天设置失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> setChatPermissions(SetPermissionsRequest request) {
        try {
            log.info("设置聊天权限: ownerId={}, targetUserId={}, level={}",
                    request.getOwnerId(), request.getTargetUserId(), request.getPermissionLevel());

            if (request.getOwnerId() == null || request.getTargetUserId() == null) {
                return Result.error("权限拥有者ID和目标用户ID不能为空");
            }
            if (request.getOwnerId().equals(request.getTargetUserId())) {
                return Result.error("不能给自己设置权限");
            }

            String levelStr = request.getPermissionLevel();
            if (levelStr == null || levelStr.trim().isEmpty()) {
                return Result.error("权限级别不能为空");
            }
            // 支持前端使用 view_dynamics 作为别名
            if ("view_dynamics".equalsIgnoreCase(levelStr)) {
                levelStr = "full_access";
            }

            UserPermission.PermissionLevel level;
            try {
                level = UserPermission.PermissionLevel.valueOf(levelStr);
            } catch (IllegalArgumentException e) {
                return Result.error("不支持的权限级别: " + request.getPermissionLevel());
            }

            UserPermission permission = userPermissionRepository
                    .findByPermissionOwnerAndTargetUser(request.getOwnerId(), request.getTargetUserId())
                    .orElseGet(() -> {
                        UserPermission p = new UserPermission();
                        p.setPermissionOwner(request.getOwnerId());
                        p.setTargetUser(request.getTargetUserId());
                        return p;
                    });

            permission.setPermissionLevel(level);

            // 按权限级别设置默认值
            if (level == UserPermission.PermissionLevel.chat_only) {
                permission.setCanViewProfile(false);
                permission.setCanViewMoments(false);
                permission.setCanVoiceCall(false);
                permission.setCanVideoCall(false);
                permission.setAutoAcceptFiles(false);
            } else if (level == UserPermission.PermissionLevel.full_access) {
                permission.setCanViewProfile(true);
                permission.setCanViewMoments(true);
                permission.setCanVoiceCall(true);
                permission.setCanVideoCall(true);
                permission.setAutoAcceptFiles(true);
            }

            // 按请求覆盖更细粒度设置
            if (request.getCanViewProfile() != null) {
                permission.setCanViewProfile(request.getCanViewProfile());
            }
            if (request.getCanViewMoments() != null) {
                permission.setCanViewMoments(request.getCanViewMoments());
            }
            if (request.getCanViewStatus() != null) {
                permission.setCanViewStatus(request.getCanViewStatus());
            }
            if (request.getCanSendFiles() != null) {
                permission.setCanSendFiles(request.getCanSendFiles());
            }
            if (request.getCanVoiceCall() != null) {
                permission.setCanVoiceCall(request.getCanVoiceCall());
            }
            if (request.getCanVideoCall() != null) {
                permission.setCanVideoCall(request.getCanVideoCall());
            }
            if (request.getAutoAcceptFiles() != null) {
                permission.setAutoAcceptFiles(request.getAutoAcceptFiles());
            }
            if (request.getMessageVerification() != null) {
                permission.setMessageVerification(request.getMessageVerification());
            }

            userPermissionRepository.save(permission);
            return Result.success("聊天权限已设置");
        } catch (Exception e) {
            log.error("设置聊天权限失败", e);
            return Result.error("设置聊天权限失败: " + e.getMessage());
        }
    }

    @Override
    public Result<ChatPermissionsDTO> getChatPermissions(Long ownerId, Long targetUserId) {
        try {
            log.info("获取聊天权限: ownerId={}, targetUserId={}", ownerId, targetUserId);

            if (ownerId == null || targetUserId == null) {
                return Result.error("权限拥有者ID和目标用户ID不能为空");
            }

            Optional<UserPermission> optional = userPermissionRepository
                    .findByPermissionOwnerAndTargetUser(ownerId, targetUserId);

            ChatPermissionsDTO dto;
            if (optional.isEmpty()) {
                // 默认 chat_only，不可查看动态
                dto = ChatPermissionsDTO.builder()
                        .ownerId(ownerId)
                        .targetUserId(targetUserId)
                        .permissionLevel("chat_only")
                        .canViewProfile(false)
                        .canViewMoments(false)
                        .canViewStatus(true)
                        .canSendFiles(true)
                        .canVoiceCall(false)
                        .canVideoCall(false)
                        .autoAcceptFiles(false)
                        .messageVerification(false)
                        .build();
            } else {
                UserPermission permission = optional.get();
                dto = ChatPermissionsDTO.builder()
                        .ownerId(permission.getPermissionOwner())
                        .targetUserId(permission.getTargetUser())
                        .permissionLevel(permission.getPermissionLevel().name())
                        .canViewProfile(permission.getCanViewProfile())
                        .canViewMoments(permission.getCanViewMoments())
                        .canViewStatus(permission.getCanViewStatus())
                        .canSendFiles(permission.getCanSendFiles())
                        .canVoiceCall(permission.getCanVoiceCall())
                        .canVideoCall(permission.getCanVideoCall())
                        .autoAcceptFiles(permission.getAutoAcceptFiles())
                        .messageVerification(permission.getMessageVerification())
                        .createdTime(permission.getCreatedAt())
                        .updatedTime(permission.getUpdatedAt())
                        .build();
            }

            return Result.success(dto);
        } catch (Exception e) {
            log.error("获取聊天权限失败", e);
            return Result.error("获取聊天权限失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> reportUser(ReportUserRequest request) {
        // TODO: 实现举报用户逻辑
        return Result.success("举报已提交");
    }

    @Override
    public Result<String> reportMessage(ReportMessageRequest request) {
        // TODO: 实现举报消息逻辑
        return Result.success("举报已提交");
    }

    @Override
    public Result<String> reportGroup(ReportGroupRequest request) {
        // TODO: 实现举报群聊逻辑
        return Result.success("举报已提交");
    }

    @Override
    public Result<String> updateOnlineStatus(Long userId, Boolean isOnline) {
        // TODO: 实现更新在线状态逻辑
        return Result.success("在线状态已更新");
    }

    @Override
    public Result<List<FriendOnlineStatusDTO>> getFriendsOnlineStatus(Long userId) {
        // TODO: 实现获取好友在线状态逻辑
        return Result.success(new ArrayList<>());
    }

    @Override
    public Result<UnreadCountDTO> getUnreadCount(Long userId) {
        try {
            UnreadCountDTO dto = buildUnreadCount(userId);
            return Result.success(dto);
        } catch (Exception e) {
            log.error("获取未读消息数失败", e);
            return Result.error("获取未读消息数失败: " + e.getMessage());
        }
    }

    @Override
    public Result<ChatStatisticsDTO> getChatStatistics(Long userId) {
        // TODO: 实现获取聊天统计逻辑
        return Result.success(null);
    }

    private ChatSettings getOrCreateChatSettings(Long userId, Long targetId, String targetType) {
        if (userId == null || targetId == null || targetType == null) {
            throw new IllegalArgumentException("用户ID、目标ID和目标类型不能为空");
        }
        Optional<ChatSettings> optional = chatSettingsRepository
                .findByUserIdAndTargetIdAndTargetType(userId, targetId, targetType);
        if (optional.isPresent()) {
            return optional.get();
        }
        ChatSettings settings = new ChatSettings();
        settings.setUserId(userId);
        settings.setTargetId(targetId);
        settings.setTargetType(targetType);
        settings.setIsPinned(false);
        settings.setIsMuted(false);
        return settings;
    }

    private UnreadCountDTO buildUnreadCount(Long userId) {
        long totalUnread = messageRepository.countUnreadByUserId(userId);
        List<Object[]> unreadByConversation = messageRepository.countUnreadGroupByConversation(userId);

        List<ConversationUnreadDTO> conversationUnreads = new ArrayList<>();
        int friendUnread = 0;
        int groupUnread = 0;

        for (Object[] row : unreadByConversation) {
            Long conversationId = (Long) row[0];
            Long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
            int unreadCount = (int) count.longValue();

            Message latest = messageRepository.findFirstByConversationIdOrderByCreatedAtDesc(conversationId);
            if (latest == null) {
                continue;
            }

            Long targetId = latest.getSenderId().equals(userId) ?
                    latest.getReceiverId() : latest.getSenderId();
            User targetUser = userRepository.findById(targetId).orElse(null);

            ConversationUnreadDTO dto = ConversationUnreadDTO.builder()
                    .conversationId(conversationId)
                    .chatType("user")
                    .targetId(targetId)
                    .targetName(targetUser != null ? targetUser.getUsername() : "用户" + targetId)
                    .unreadCount(unreadCount)
                    .build();

            conversationUnreads.add(dto);
            friendUnread += unreadCount;
        }

        return UnreadCountDTO.builder()
                .userId(userId)
                .totalUnreadCount((int) totalUnread)
                .friendUnreadCount(friendUnread)
                .groupUnreadCount(groupUnread)
                .conversationUnreads(conversationUnreads)
                .build();
    }
}

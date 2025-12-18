package com.example.chat.service;

import com.example.chat.dto.ChatDTOs.*;
import com.example.common.result.Result;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 聊天服务接口
 */
public interface ChatService {

    // 好友管理
    Result<String> addFriend(AddFriendRequest request);
    Result<String> handleFriendRequest(HandleFriendRequest request);
    Result<List<FriendDTO>> getFriendsList(Long userId);
    Result<List<FriendRequestDTO>> getFriendRequests(Long userId);
    Result<String> deleteFriend(Long userId, Long friendId);
    Result<List<UserSearchDTO>> searchUsers(String keyword, Long userId);

    // 消息管理
    Result<List<ConversationDTO>> getConversationsList(Long userId);
    Result<MessageDTO> sendMessage(SendMessageRequest request);
    Result<MessageDTO> shareTravelPlan(ShareTravelPlanRequest request);
    Result<MessageDTO> sendFileMessage(Long senderId, Long receiverId, Long groupId, String messageType, MultipartFile file);
    Result<List<MessageDTO>> getChatHistory(Long userId, Long friendId, Long groupId, Integer page, Integer size);
    Result<List<MessageDTO>> searchChatHistory(Long userId, String keyword, Long friendId, Long groupId, Integer page, Integer size);
    Result<String> recallMessage(Long messageId, Long userId);
    Result<String> markMessagesAsRead(MarkReadRequest request);

    // 聊天设置
    Result<String> pinConversation(PinConversationRequest request);
    Result<String> muteConversation(MuteConversationRequest request);
    Result<String> setChatBackground(SetBackgroundRequest request);
    Result<String> uploadChatBackground(Long userId, Long targetId, String targetType, MultipartFile backgroundImage);
    Result<String> clearChatHistory(ClearChatRequest request);
    Result<ChatSettingsDTO> getChatSettings(Long userId, Long targetId, String targetType);

    // 权限管理
    Result<String> setChatPermissions(SetPermissionsRequest request);
    Result<ChatPermissionsDTO> getChatPermissions(Long ownerId, Long targetUserId);

    // 举报功能
    Result<String> reportUser(ReportUserRequest request);
    Result<String> reportMessage(ReportMessageRequest request);
    Result<String> reportGroup(ReportGroupRequest request);

    // 在线状态
    Result<String> updateOnlineStatus(Long userId, Boolean isOnline);
    Result<List<FriendOnlineStatusDTO>> getFriendsOnlineStatus(Long userId);

    // 统计信息
    Result<UnreadCountDTO> getUnreadCount(Long userId);
    Result<ChatStatisticsDTO> getChatStatistics(Long userId);
}

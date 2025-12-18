package com.example.chat.controller;

import com.example.chat.service.ChatService;
import com.example.chat.dto.ChatDTOs.*;
import com.example.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;

/**
 * 聊天系统核心接口
 * 包含私聊、群聊、消息管理等功能
 */
@Tag(name = "用户聊天系统", description = "用户间聊天系统相关接口")
@RestController
@RequestMapping("/api/user-chat")
@RequiredArgsConstructor
public class UserChatController {

    private final ChatService chatService;

    // =====================================================
    // 好友管理相关接口
    // =====================================================

    @Operation(summary = "添加好友", description = "发送好友申请")
    @PostMapping("/friends/add")
    public Result<String> addFriend(@Valid @RequestBody AddFriendRequest request) {
        return chatService.addFriend(request);
    }

    @Operation(summary = "处理好友申请", description = "同意或拒绝好友申请")
    @PostMapping("/friends/handle")
    public Result<String> handleFriendRequest(@Valid @RequestBody HandleFriendRequest request) {
        return chatService.handleFriendRequest(request);
    }

    @Operation(summary = "获取好友列表", description = "获取用户的好友列表")
    @GetMapping("/friends/list")
    public Result<List<FriendDTO>> getFriendsList(@RequestParam Long userId) {
        return chatService.getFriendsList(userId);
    }

    @Operation(summary = "获取好友申请列表", description = "获取用户收到的好友申请")
    @GetMapping("/friends/requests")
    public Result<List<FriendRequestDTO>> getFriendRequests(@RequestParam Long userId) {
        return chatService.getFriendRequests(userId);
    }

    @Operation(summary = "删除好友", description = "删除好友关系")
    @DeleteMapping("/friends/{friendId}")
    public Result<String> deleteFriend(@PathVariable Long friendId, @RequestParam Long userId) {
        return chatService.deleteFriend(userId, friendId);
    }

    @Operation(summary = "搜索用户", description = "根据用户名或手机号搜索用户")
    @GetMapping("/users/search")
    public Result<List<UserSearchDTO>> searchUsers(
            @RequestParam String keyword, 
            @RequestParam(required = false) Long userId) {
        return chatService.searchUsers(keyword, userId);
    }

    // =====================================================
    // 对话管理相关接口
    // =====================================================

    @Operation(summary = "获取聊天列表", description = "获取用户的所有聊天会话")
    @GetMapping("/conversations/list")
    public Result<List<ConversationDTO>> getConversationsList(@RequestParam Long userId) {
        return chatService.getConversationsList(userId);
    }

    @Operation(summary = "发送消息", description = "发送文本、图片、语音等消息")
    @PostMapping("/messages/send")
    public Result<MessageDTO> sendMessage(@Valid @RequestBody SendMessageRequest request) {
        return chatService.sendMessage(request);
    }

    @Operation(summary = "分享旅行计划小卡片", description = "将生成的旅行计划分享给好友，生成旅行计划小卡片消息")
    @PostMapping("/messages/share-travel-plan")
    public Result<MessageDTO> shareTravelPlan(@Valid @RequestBody ShareTravelPlanRequest request) {
        return chatService.shareTravelPlan(request);
    }

    @Operation(summary = "发送文件消息", description = "发送文件、图片、语音等媒体消息")
    @PostMapping("/messages/send-file")
    public Result<MessageDTO> sendFileMessage(
            @RequestParam Long senderId,
            @RequestParam Long receiverId,
            @RequestParam(required = false) Long groupId,
            @RequestParam String messageType,
            @RequestParam MultipartFile file) {
        return chatService.sendFileMessage(senderId, receiverId, groupId, messageType, file);
    }

    @Operation(summary = "获取聊天记录", description = "获取指定会话的聊天记录")
    @GetMapping("/messages/history")
    public Result<List<MessageDTO>> getChatHistory(
            @RequestParam Long userId,
            @RequestParam(required = false) Long friendId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return chatService.getChatHistory(userId, friendId, groupId, page, size);
    }

    @Operation(summary = "搜索聊天记录", description = "在聊天记录中搜索关键词")
    @GetMapping("/messages/search")
    public Result<List<MessageDTO>> searchChatHistory(
            @RequestParam Long userId,
            @RequestParam String keyword,
            @RequestParam(required = false) Long friendId,
            @RequestParam(required = false) Long groupId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return chatService.searchChatHistory(userId, keyword, friendId, groupId, page, size);
    }

    @Operation(summary = "撤回消息", description = "撤回已发送的消息")
    @PostMapping("/messages/{messageId}/recall")
    public Result<String> recallMessage(@PathVariable Long messageId, @RequestParam Long userId) {
        return chatService.recallMessage(messageId, userId);
    }

    @Operation(summary = "标记消息已读", description = "标记指定消息为已读状态")
    @PostMapping("/messages/mark-read")
    public Result<String> markMessagesAsRead(@Valid @RequestBody MarkReadRequest request) {
        return chatService.markMessagesAsRead(request);
    }

    // =====================================================
    // 聊天设置相关接口
    // =====================================================

    @Operation(summary = "置顶聊天", description = "置顶或取消置顶聊天会话")
    @PostMapping("/settings/pin")
    public Result<String> pinConversation(@Valid @RequestBody PinConversationRequest request) {
        return chatService.pinConversation(request);
    }

    @Operation(summary = "消息免打扰", description = "设置或取消消息免打扰")
    @PostMapping("/settings/mute")
    public Result<String> muteConversation(@Valid @RequestBody MuteConversationRequest request) {
        return chatService.muteConversation(request);
    }

    @Operation(summary = "设置聊天背景", description = "设置聊天会话的背景图片")
    @PostMapping("/settings/background")
    public Result<String> setChatBackground(@Valid @RequestBody SetBackgroundRequest request) {
        return chatService.setChatBackground(request);
    }

    @Operation(summary = "上传聊天背景", description = "上传聊天背景图片")
    @PostMapping("/settings/background/upload")
    public Result<String> uploadChatBackground(
            @RequestParam Long userId,
            @RequestParam Long targetId,
            @RequestParam String targetType,
            @RequestParam MultipartFile backgroundImage) {
        return chatService.uploadChatBackground(userId, targetId, targetType, backgroundImage);
    }

    @Operation(summary = "清空聊天记录", description = "清空指定会话的聊天记录")
    @DeleteMapping("/messages/clear")
    public Result<String> clearChatHistory(@Valid @RequestBody ClearChatRequest request) {
        return chatService.clearChatHistory(request);
    }

    @Operation(summary = "获取聊天设置", description = "获取用户的聊天设置")
    @GetMapping("/settings")
    public Result<ChatSettingsDTO> getChatSettings(
            @RequestParam Long userId,
            @RequestParam Long targetId,
            @RequestParam String targetType) {
        return chatService.getChatSettings(userId, targetId, targetType);
    }

    // =====================================================
    // 权限管理相关接口
    // =====================================================

    @Operation(summary = "设置聊天权限", description = "设置对好友的聊天权限")
    @PostMapping("/permissions/set")
    public Result<String> setChatPermissions(@Valid @RequestBody SetPermissionsRequest request) {
        return chatService.setChatPermissions(request);
    }

    @Operation(summary = "获取聊天权限", description = "获取对指定用户的聊天权限")
    @GetMapping("/permissions")
    public Result<ChatPermissionsDTO> getChatPermissions(
            @RequestParam Long ownerId,
            @RequestParam Long targetUserId) {
        return chatService.getChatPermissions(ownerId, targetUserId);
    }

    // =====================================================
    // 举报相关接口
    // =====================================================

    @Operation(summary = "举报用户", description = "举报用户不当行为")
    @PostMapping("/reports/user")
    public Result<String> reportUser(@Valid @RequestBody ReportUserRequest request) {
        return chatService.reportUser(request);
    }

    @Operation(summary = "举报消息", description = "举报不当消息内容")
    @PostMapping("/reports/message")
    public Result<String> reportMessage(@Valid @RequestBody ReportMessageRequest request) {
        return chatService.reportMessage(request);
    }

    @Operation(summary = "举报群聊", description = "举报群聊不当行为")
    @PostMapping("/reports/group")
    public Result<String> reportGroup(@Valid @RequestBody ReportGroupRequest request) {
        return chatService.reportGroup(request);
    }

    // =====================================================
    // 在线状态相关接口
    // =====================================================

    @Operation(summary = "更新在线状态", description = "更新用户在线状态")
    @PostMapping("/status/online")
    public Result<String> updateOnlineStatus(@RequestParam Long userId, @RequestParam Boolean isOnline) {
        return chatService.updateOnlineStatus(userId, isOnline);
    }

    @Operation(summary = "获取好友在线状态", description = "获取好友的在线状态")
    @GetMapping("/status/friends")
    public Result<List<FriendOnlineStatusDTO>> getFriendsOnlineStatus(@RequestParam Long userId) {
        return chatService.getFriendsOnlineStatus(userId);
    }

    // =====================================================
    // 消息统计相关接口
    // =====================================================

    @Operation(summary = "获取未读消息数", description = "获取用户的未读消息统计")
    @GetMapping("/messages/unread-count")
    public Result<UnreadCountDTO> getUnreadCount(@RequestParam Long userId) {
        return chatService.getUnreadCount(userId);
    }

    @Operation(summary = "获取聊天统计", description = "获取聊天相关统计信息")
    @GetMapping("/statistics")
    public Result<ChatStatisticsDTO> getChatStatistics(@RequestParam Long userId) {
        return chatService.getChatStatistics(userId);
    }
}

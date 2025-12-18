package com.example.chat.service;

import com.example.chat.dto.GroupChatDTOs.*;
import com.example.chat.dto.ChatDTOs.MessageDTO;
import com.example.common.result.Result;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 群聊服务接口
 */
public interface GroupChatService {

    // 群聊基础管理
    Result<GroupChatDTO> createGroup(CreateGroupRequest request);
    Result<GroupChatDTO> createGroupWithFriends(CreateGroupWithFriendsRequest request);
    Result<GroupChatDTO> getGroupInfo(Long groupId, Long userId);
    Result<String> updateGroupInfo(Long groupId, UpdateGroupInfoRequest request);
    Result<String> uploadGroupAvatar(Long groupId, Long userId, MultipartFile avatar);
    Result<String> disbandGroup(Long groupId, Long userId);
    Result<String> leaveGroup(Long groupId, Long userId);

    // 群成员管理
    Result<String> inviteToGroup(Long groupId, InviteToGroupRequest request);
    Result<String> joinGroup(Long groupId, JoinGroupRequest request);
    Result<String> handleJoinRequest(Long groupId, HandleJoinRequest request);
    Result<List<GroupMemberDTO>> getGroupMembers(Long groupId, Long userId);
    Result<List<GroupMemberAvatarDTO>> getGroupMemberAvatars(Long groupId, Long userId);
    Result<String> kickMember(Long groupId, KickMemberRequest request);
    Result<String> setGroupAdmin(Long groupId, SetAdminRequest request);
    Result<String> transferOwnership(Long groupId, TransferOwnershipRequest request);

    // 群设置管理
    Result<String> setGroupNickname(Long groupId, SetGroupNicknameRequest request);
    Result<String> muteMember(Long groupId, MuteMemberRequest request);
    Result<String> muteAllMembers(Long groupId, MuteAllRequest request);
    Result<String> setJoinApproval(Long groupId, SetJoinApprovalRequest request);
    Result<String> setInvitePermission(Long groupId, SetInvitePermissionRequest request);

    // 群消息管理
    Result<MessageDTO> sendGroupMessage(Long groupId, SendGroupMessageRequest request);
    Result<MessageDTO> sendGroupFile(Long groupId, Long senderId, String messageType, MultipartFile file);
    Result<List<MessageDTO>> getGroupMessages(Long groupId, Long userId, Integer page, Integer size);
    Result<List<MessageDTO>> searchGroupMessages(Long groupId, Long userId, String keyword, Integer page, Integer size);

    // 群聊查询功能
    Result<List<GroupChatDTO>> getMyGroups(Long userId);
    Result<List<GroupChatDTO>> searchGroups(String keyword, Long userId);
    Result<GroupStatisticsDTO> getGroupStatistics(Long groupId, Long userId);
    Result<GroupAnnouncementDTO> getGroupAnnouncement(Long groupId, Long userId);
    
    // 群聊邀请通知
    Result<List<GroupInvitationDTO>> getMyInvitations(Long userId);
    Result<String> markInvitationAsRead(Long userId, Long groupId);
    Result<String> setGroupAnnouncement(Long groupId, SetAnnouncementRequest request);

    // 群聊高级功能
    Result<String> setGroupType(Long groupId, SetGroupTypeRequest request);
    Result<BatchInviteResultDTO> batchInviteFriends(Long groupId, BatchInviteRequest request);
    Result<List<JoinRequestDTO>> getJoinRequests(Long groupId, Long userId);
    Result<String> markGroupMessagesAsRead(Long groupId, MarkGroupReadRequest request);
    
    // 群聊设置功能
    Result<String> pinGroup(Long groupId, PinGroupRequest request);
    Result<String> setDisturbFree(Long groupId, DisturbFreeRequest request);
    Result<String> setChatBackground(Long groupId, SetChatBackgroundRequest request);
    Result<String> uploadChatBackground(Long groupId, Long userId, MultipartFile backgroundImage);
    Result<String> clearChatHistory(Long groupId, ClearChatHistoryRequest request);
    Result<String> reportGroup(Long groupId, ReportGroupRequest request);
    Result<GroupSettingsDTO> getGroupSettings(Long groupId, Long userId);
    Result<ChatBackgroundDTO> getChatBackground(Long groupId, Long userId);
}

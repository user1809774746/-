package com.example.chat.controller;

import com.example.chat.service.GroupChatService;
import com.example.chat.dto.GroupChatDTOs.*;
import com.example.chat.dto.ChatDTOs.MessageDTO;
import com.example.common.result.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;

/**
 * 群聊管理接口
 * 包含群聊创建、成员管理、群设置等功能
 */
@Tag(name = "群聊管理", description = "群聊相关接口")
@RestController
@RequestMapping("/api/group")
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupChatService groupChatService;

    // =====================================================
    // 群聊基础管理
    // =====================================================

    @Operation(summary = "创建群聊", description = "创建新的群聊")
    @PostMapping("/create")
    public Result<GroupChatDTO> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        return groupChatService.createGroup(request);
    }

    @Operation(summary = "拉好友建群", description = "邀请多个好友创建群聊")
    @PostMapping("/create-with-friends")
    public Result<GroupChatDTO> createGroupWithFriends(@Valid @RequestBody CreateGroupWithFriendsRequest request) {
        return groupChatService.createGroupWithFriends(request);
    }

    @Operation(summary = "获取群聊信息", description = "获取群聊详细信息")
    @GetMapping("/{groupId}/info")
    public Result<GroupChatDTO> getGroupInfo(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getGroupInfo(groupId, userId);
    }

    @Operation(summary = "更新群聊信息", description = "更新群名称、描述等信息")
    @PutMapping("/{groupId}/info")
    public Result<String> updateGroupInfo(@PathVariable Long groupId, @Valid @RequestBody UpdateGroupInfoRequest request) {
        return groupChatService.updateGroupInfo(groupId, request);
    }

    @Operation(summary = "上传群头像", description = "上传群聊头像")
    @PostMapping("/{groupId}/avatar")
    public Result<String> uploadGroupAvatar(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            @RequestParam MultipartFile avatar) {
        return groupChatService.uploadGroupAvatar(groupId, userId, avatar);
    }

    @Operation(summary = "解散群聊", description = "解散群聊（仅群主可操作）")
    @DeleteMapping("/{groupId}/disband")
    public Result<String> disbandGroup(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.disbandGroup(groupId, userId);
    }

    @Operation(summary = "退出群聊", description = "用户主动退出群聊")
    @PostMapping("/{groupId}/leave")
    public Result<String> leaveGroup(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.leaveGroup(groupId, userId);
    }

    // =====================================================
    // 群成员管理
    // =====================================================

    @Operation(summary = "邀请用户入群", description = "邀请用户加入群聊")
    @PostMapping("/{groupId}/invite")
    public Result<String> inviteToGroup(@PathVariable Long groupId, @Valid @RequestBody InviteToGroupRequest request) {
        return groupChatService.inviteToGroup(groupId, request);
    }

    @Operation(summary = "申请加入群聊", description = "用户申请加入群聊")
    @PostMapping("/{groupId}/join")
    public Result<String> joinGroup(@PathVariable Long groupId, @Valid @RequestBody JoinGroupRequest request) {
        return groupChatService.joinGroup(groupId, request);
    }

    @Operation(summary = "处理入群申请", description = "同意或拒绝入群申请")
    @PostMapping("/{groupId}/handle-join")
    public Result<String> handleJoinRequest(@PathVariable Long groupId, @Valid @RequestBody HandleJoinRequest request) {
        return groupChatService.handleJoinRequest(groupId, request);
    }

    @Operation(summary = "获取群成员列表", description = "获取群聊的所有成员")
    @GetMapping("/{groupId}/members")
    public Result<List<GroupMemberDTO>> getGroupMembers(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getGroupMembers(groupId, userId);
    }

    @Operation(summary = "获取群成员头像", description = "获取群聊所有成员的头像信息")
    @GetMapping("/{groupId}/member-avatars")
    public Result<List<GroupMemberAvatarDTO>> getGroupMemberAvatars(
            @PathVariable Long groupId,
            @RequestParam Long userId) {
        return groupChatService.getGroupMemberAvatars(groupId, userId);
    }

    @Operation(summary = "踢出群成员", description = "将成员踢出群聊")
    @PostMapping("/{groupId}/kick")
    public Result<String> kickMember(@PathVariable Long groupId, @Valid @RequestBody KickMemberRequest request) {
        return groupChatService.kickMember(groupId, request);
    }

    @Operation(summary = "设置群管理员", description = "设置或取消群管理员")
    @PostMapping("/{groupId}/set-admin")
    public Result<String> setGroupAdmin(@PathVariable Long groupId, @Valid @RequestBody SetAdminRequest request) {
        return groupChatService.setGroupAdmin(groupId, request);
    }

    @Operation(summary = "转让群主", description = "将群主身份转让给其他成员")
    @PostMapping("/{groupId}/transfer-owner")
    public Result<String> transferOwnership(@PathVariable Long groupId, @Valid @RequestBody TransferOwnershipRequest request) {
        return groupChatService.transferOwnership(groupId, request);
    }

    // =====================================================
    // 群设置管理
    // =====================================================

    @Operation(summary = "设置群昵称", description = "设置用户在群内的昵称")
    @PostMapping("/{groupId}/nickname")
    public Result<String> setGroupNickname(@PathVariable Long groupId, @Valid @RequestBody SetGroupNicknameRequest request) {
        return groupChatService.setGroupNickname(groupId, request);
    }

    @Operation(summary = "禁言群成员", description = "禁言或解除禁言群成员")
    @PostMapping("/{groupId}/mute-member")
    public Result<String> muteMember(@PathVariable Long groupId, @Valid @RequestBody MuteMemberRequest request) {
        return groupChatService.muteMember(groupId, request);
    }

    @Operation(summary = "全员禁言", description = "开启或关闭全员禁言")
    @PostMapping("/{groupId}/mute-all")
    public Result<String> muteAllMembers(@PathVariable Long groupId, @Valid @RequestBody MuteAllRequest request) {
        return groupChatService.muteAllMembers(groupId, request);
    }

    @Operation(summary = "设置入群审批", description = "设置是否需要管理员审批入群")
    @PostMapping("/{groupId}/join-approval")
    public Result<String> setJoinApproval(@PathVariable Long groupId, @Valid @RequestBody SetJoinApprovalRequest request) {
        return groupChatService.setJoinApproval(groupId, request);
    }

    @Operation(summary = "设置邀请权限", description = "设置普通成员是否可以邀请他人入群")
    @PostMapping("/{groupId}/invite-permission")
    public Result<String> setInvitePermission(@PathVariable Long groupId, @Valid @RequestBody SetInvitePermissionRequest request) {
        return groupChatService.setInvitePermission(groupId, request);
    }

    // =====================================================
    // 群聊消息管理
    // =====================================================

    @Operation(summary = "发送群消息", description = "在群聊中发送消息")
    @PostMapping("/{groupId}/send-message")
    public Result<MessageDTO> sendGroupMessage(@PathVariable Long groupId, @Valid @RequestBody SendGroupMessageRequest request) {
        return groupChatService.sendGroupMessage(groupId, request);
    }

    @Operation(summary = "发送群文件", description = "在群聊中发送文件")
    @PostMapping("/{groupId}/send-file")
    public Result<MessageDTO> sendGroupFile(
            @PathVariable Long groupId,
            @RequestParam Long senderId,
            @RequestParam String messageType,
            @RequestParam MultipartFile file) {
        return groupChatService.sendGroupFile(groupId, senderId, messageType, file);
    }

    @Operation(summary = "获取群聊记录", description = "获取群聊的聊天记录")
    @GetMapping("/{groupId}/messages")
    public Result<List<MessageDTO>> getGroupMessages(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return groupChatService.getGroupMessages(groupId, userId, page, size);
    }

    @Operation(summary = "搜索群聊记录", description = "在群聊记录中搜索关键词")
    @GetMapping("/{groupId}/messages/search")
    public Result<List<MessageDTO>> searchGroupMessages(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            @RequestParam String keyword,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        return groupChatService.searchGroupMessages(groupId, userId, keyword, page, size);
    }

    // =====================================================
    // 群聊查询功能
    // =====================================================

    @Operation(summary = "获取用户群聊列表", description = "获取用户加入的所有群聊")
    @GetMapping("/my-groups")
    public Result<List<GroupChatDTO>> getMyGroups(@RequestParam Long userId) {
        return groupChatService.getMyGroups(userId);
    }
    
    @Operation(summary = "获取群聊邀请通知", description = "获取用户最近收到的群聊邀请通知")
    @GetMapping("/my-invitations")
    public Result<List<GroupInvitationDTO>> getMyInvitations(@RequestParam Long userId) {
        return groupChatService.getMyInvitations(userId);
    }
    
    @Operation(summary = "标记邀请通知已读", description = "将某个群聊的邀请通知标记为已读")
    @PostMapping("/invitations/{groupId}/read")
    public Result<String> markInvitationAsRead(
            @PathVariable Long groupId,
            @RequestParam Long userId) {
        return groupChatService.markInvitationAsRead(userId, groupId);
    }

    @Operation(summary = "搜索群聊", description = "根据群名称搜索群聊")
    @GetMapping("/search")
    public Result<List<GroupChatDTO>> searchGroups(@RequestParam String keyword, @RequestParam Long userId) {
        return groupChatService.searchGroups(keyword, userId);
    }

    @Operation(summary = "获取群聊统计", description = "获取群聊的统计信息")
    @GetMapping("/{groupId}/statistics")
    public Result<GroupStatisticsDTO> getGroupStatistics(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getGroupStatistics(groupId, userId);
    }

    @Operation(summary = "获取群公告", description = "获取群聊公告信息")
    @GetMapping("/{groupId}/announcement")
    public Result<GroupAnnouncementDTO> getGroupAnnouncement(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getGroupAnnouncement(groupId, userId);
    }

    @Operation(summary = "发布群公告", description = "发布或更新群公告")
    @PostMapping("/{groupId}/announcement")
    public Result<String> setGroupAnnouncement(@PathVariable Long groupId, @Valid @RequestBody SetAnnouncementRequest request) {
        return groupChatService.setGroupAnnouncement(groupId, request);
    }

    // =====================================================
    // 群聊高级功能
    // =====================================================

    @Operation(summary = "设置群聊类型", description = "设置群聊类型（普通群/公告群/私密群）")
    @PostMapping("/{groupId}/type")
    public Result<String> setGroupType(@PathVariable Long groupId, @Valid @RequestBody SetGroupTypeRequest request) {
        return groupChatService.setGroupType(groupId, request);
    }

    @Operation(summary = "批量邀请好友", description = "批量邀请多个好友加入群聊")
    @PostMapping("/{groupId}/batch-invite")
    public Result<BatchInviteResultDTO> batchInviteFriends(@PathVariable Long groupId, @Valid @RequestBody BatchInviteRequest request) {
        return groupChatService.batchInviteFriends(groupId, request);
    }

    @Operation(summary = "获取入群申请列表", description = "获取待处理的入群申请")
    @GetMapping("/{groupId}/join-requests")
    public Result<List<JoinRequestDTO>> getJoinRequests(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getJoinRequests(groupId, userId);
    }

    @Operation(summary = "群聊已读回执", description = "标记群消息为已读")
    @PostMapping("/{groupId}/mark-read")
    public Result<String> markGroupMessagesAsRead(@PathVariable Long groupId, @Valid @RequestBody MarkGroupReadRequest request) {
        return groupChatService.markGroupMessagesAsRead(groupId, request);
    }
    
    // =====================================================
    // 群聊设置功能
    // =====================================================
    
    @Operation(summary = "置顶群聊", description = "置顶或取消置顶群聊")
    @PostMapping("/{groupId}/settings/pin")
    public Result<String> pinGroup(@PathVariable Long groupId, @Valid @RequestBody PinGroupRequest request) {
        return groupChatService.pinGroup(groupId, request);
    }
    
    @Operation(summary = "消息免打扰", description = "设置或取消消息免打扰")
    @PostMapping("/{groupId}/settings/disturb-free")
    public Result<String> setDisturbFree(@PathVariable Long groupId, @Valid @RequestBody DisturbFreeRequest request) {
        return groupChatService.setDisturbFree(groupId, request);
    }
    
    @Operation(summary = "设置群聊背景", description = "直接使用图片URL设置群聊背景（支持任意图床、CDN等外部图片URL），传null可清除背景")
    @PostMapping("/{groupId}/settings/background")
    public Result<String> setChatBackground(@PathVariable Long groupId, @Valid @RequestBody SetChatBackgroundRequest request) {
        return groupChatService.setChatBackground(groupId, request);
    }
    
    @Operation(summary = "上传群聊背景图片", description = "用户可以直接上传图片文件作为群聊背景，系统会自动保存并返回图片URL")
    @PostMapping("/{groupId}/settings/background/upload")
    public Result<String> uploadChatBackground(
            @PathVariable Long groupId,
            @RequestParam Long userId,
            @RequestParam MultipartFile backgroundImage) {
        return groupChatService.uploadChatBackground(groupId, userId, backgroundImage);
    }
    
    @Operation(summary = "清空聊天记录", description = "清空群聊的聊天记录（仅对当前用户有效）")
    @PostMapping("/{groupId}/settings/clear-history")
    public Result<String> clearChatHistory(@PathVariable Long groupId, @Valid @RequestBody ClearChatHistoryRequest request) {
        return groupChatService.clearChatHistory(groupId, request);
    }
    
    @Operation(summary = "举报群聊", description = "举报违规群聊")
    @PostMapping("/{groupId}/report")
    public Result<String> reportGroup(@PathVariable Long groupId, @Valid @RequestBody ReportGroupRequest request) {
        return groupChatService.reportGroup(groupId, request);
    }
    
    @Operation(summary = "获取群聊设置", description = "获取用户在该群聊的所有设置信息")
    @GetMapping("/{groupId}/settings")
    public Result<GroupSettingsDTO> getGroupSettings(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getGroupSettings(groupId, userId);
    }
    
    @Operation(summary = "获取群聊背景", description = "根据用户ID和群聊ID获取该用户在该群聊下的聊天背景")
    @GetMapping("/{groupId}/settings/background")
    public Result<ChatBackgroundDTO> getChatBackground(@PathVariable Long groupId, @RequestParam Long userId) {
        return groupChatService.getChatBackground(groupId, userId);
    }
}

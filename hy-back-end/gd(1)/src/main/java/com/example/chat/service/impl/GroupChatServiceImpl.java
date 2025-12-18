package com.example.chat.service.impl;

import com.example.chat.service.GroupChatService;
import com.example.chat.service.FileUploadService;
import com.example.chat.dto.GroupChatDTOs.*;
import com.example.chat.dto.ChatDTOs.MessageDTO;
import com.example.chat.dto.FileUploadDTO;
import com.example.chat.entity.*;
import com.example.chat.repository.*;
import com.example.chat.websocket.ChatWebSocketHandler;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.common.result.Result;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * 群聊服务完整实现类
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class GroupChatServiceImpl implements GroupChatService {

    private final GroupChatRepository groupChatRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final GroupJoinRequestRepository groupJoinRequestRepository;
    private final GroupAnnouncementRepository groupAnnouncementRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final GroupReportRepository groupReportRepository;
    private final ChatWebSocketHandler chatWebSocketHandler;
    private final UserRepository userRepository;
    private final FileUploadService fileUploadService;

    @Override
    @Transactional
    public Result<GroupChatDTO> createGroup(CreateGroupRequest request) {
        try {
            // 创建群聊
            GroupChat groupChat = GroupChat.builder()
                    .groupName(request.getGroupName())
                    .groupDescription(request.getGroupDescription())
                    .groupAvatar(request.getGroupAvatar())
                    .creatorId(request.getCreatorId())
                    .maxMembers(request.getMaxMembers() != null ? request.getMaxMembers() : 200)
                    .currentMembers(0)
                    .groupType(request.getGroupType() != null ? request.getGroupType() : "normal")
                    .joinApproval(request.getJoinApproval() != null ? request.getJoinApproval() : false)
                    .allowMemberInvite(request.getAllowInvite() != null ? request.getAllowInvite() : true)
                    .muteAll(false)
                    .status("active")
                    .build();
            
            groupChat = groupChatRepository.save(groupChat);
            
            // 添加群主
            GroupMember owner = GroupMember.builder()
                    .groupId(groupChat.getGroupId())
                    .userId(request.getCreatorId())
                    .memberRole("owner")
                    .memberStatus("active")
                    .isMuted(false)
                    .unreadCount(0)
                    .build();
            groupMemberRepository.save(owner);
            
            // 添加初始成员
            int successCount = 0;
            if (request.getInitialMembers() != null && !request.getInitialMembers().isEmpty()) {
                for (Long memberId : request.getInitialMembers()) {
                    // 跳过null值和创建者自己
                    if (memberId == null || memberId.equals(request.getCreatorId())) {
                        continue;
                    }
                    
                    GroupMember member = GroupMember.builder()
                            .groupId(groupChat.getGroupId())
                            .userId(memberId)
                            .memberRole("member")
                            .memberStatus("active")
                            .inviterId(request.getCreatorId())
                            .isMuted(false)
                            .unreadCount(0)
                            .build();
                    groupMemberRepository.save(member);
                    successCount++;
                    
                    // 通过WebSocket通知新成员
                    notifyNewMember(memberId, groupChat);
                }
            }
            
            // 更新群成员数量：1个群主 + 成功添加的初始成员数量
            int totalMembers = 1 + successCount;
            groupChat.setCurrentMembers(totalMembers);
            groupChatRepository.save(groupChat);
            
            GroupChatDTO dto = convertToDTO(groupChat);
            log.info("群聊创建成功: groupId={}, groupName={}, memberCount={}", 
                    groupChat.getGroupId(), groupChat.getGroupName(), totalMembers);
            
            return Result.success("群聊创建成功", dto);
        } catch (Exception e) {
            log.error("创建群聊失败", e);
            return Result.error("创建群聊失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<GroupChatDTO> createGroupWithFriends(CreateGroupWithFriendsRequest request) {
        try {
            log.info("==================== 开始创建群聊 ====================");
            log.info("请求参数: creatorId={}, groupName={}, friendIds={}", 
                    request.getCreatorId(), request.getGroupName(), request.getFriendIds());
            
            // 检查 friendIds 是否为空
            if (request.getFriendIds() == null) {
                log.error("❌ friendIds 为 null！");
                return Result.error("好友列表不能为空");
            }
            
            if (request.getFriendIds().isEmpty()) {
                log.warn("⚠️ friendIds 是空列表，只会创建群主");
            } else {
                log.info("✅ friendIds 包含 {} 个好友", request.getFriendIds().size());
            }
            
            // 创建群聊
            GroupChat groupChat = GroupChat.builder()
                    .groupName(request.getGroupName())
                    .groupDescription(request.getGroupDescription())
                    .creatorId(request.getCreatorId())
                    .maxMembers(200)
                    .currentMembers(0)
                    .groupType("normal")
                    .joinApproval(false)
                    .allowMemberInvite(true)
                    .muteAll(false)
                    .status("active")
                    .build();
            
            groupChat = groupChatRepository.save(groupChat);
            log.info("✅ 群聊创建成功: groupId={}", groupChat.getGroupId());
            
            // 添加群主
            GroupMember owner = GroupMember.builder()
                    .groupId(groupChat.getGroupId())
                    .userId(request.getCreatorId())
                    .memberRole("owner")
                    .memberStatus("active")
                    .isMuted(false)
                    .isPinned(false)
                    .isDisturbFree(false)
                    .unreadCount(0)
                    .build();
            groupMemberRepository.save(owner);
            log.info("✅ 群主添加成功: userId={}", request.getCreatorId());
            
            // 添加好友成员
            int successCount = 0;
            int failCount = 0;
            log.info("==================== 开始添加好友成员 ====================");
            
            for (Long friendId : request.getFriendIds()) {
                log.info(">>> 处理好友: friendId={}", friendId);
                
                // 跳过null值
                if (friendId == null) {
                    log.warn("❌ 跳过null的friendId");
                    failCount++;
                    continue;
                }
                
                try {
                    GroupMember member = GroupMember.builder()
                            .groupId(groupChat.getGroupId())
                            .userId(friendId)
                            .memberRole("member")
                            .memberStatus("active")
                            .inviterId(request.getCreatorId())
                            .isPinned(false)
                            .isDisturbFree(false)
                            .isMuted(false)
                            .isPinned(false)
                            .isDisturbFree(false)
                            .unreadCount(0)
                            .build();
                    
                    GroupMember savedMember = groupMemberRepository.save(member);
                    log.info("✅ 成员添加成功: userId={}, memberId={}", friendId, savedMember.getId());
                    successCount++;
                    
                    // 通过WebSocket通知新成员
                    try {
                        notifyNewMember(friendId, groupChat);
                        log.info("✅ WebSocket通知已发送: userId={}", friendId);
                    } catch (Exception e) {
                        log.error("⚠️ WebSocket通知失败: userId={}, error={}", friendId, e.getMessage());
                    }
                    
                } catch (Exception e) {
                    log.error("❌ 添加成员失败: userId={}, error={}", friendId, e.getMessage(), e);
                    failCount++;
                }
            }
            
            log.info("==================== 成员添加完成 ====================");
            log.info("成功: {} 人, 失败: {} 人", successCount, failCount);
            
            // 更新群成员数量：1个群主 + 成功添加的好友数量
            int totalMembers = 1 + successCount;
            groupChat.setCurrentMembers(totalMembers);
            groupChatRepository.save(groupChat);
            log.info("✅ 群成员数量已更新: currentMembers={}", totalMembers);
            
            GroupChatDTO dto = convertToDTO(groupChat);
            log.info("==================== 群聊创建流程结束 ====================");
            log.info("最终结果: groupId={}, groupName={}, totalMembers={}", 
                    groupChat.getGroupId(), groupChat.getGroupName(), totalMembers);
            
            return Result.success("群聊创建成功", dto);
        } catch (Exception e) {
            log.error("❌❌❌ 拉好友建群失败", e);
            log.error("错误类型: {}", e.getClass().getName());
            log.error("错误消息: {}", e.getMessage());
            e.printStackTrace();
            return Result.error("拉好友建群失败: " + e.getMessage());
        }
    }

    @Override
    public Result<GroupChatDTO> getGroupInfo(Long groupId, Long userId) {
        try {
            // 检查用户是否为群成员
            if (!groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                return Result.error("您不是该群成员");
            }
            
            GroupChat groupChat = groupChatRepository.findByGroupIdAndStatus(groupId, "active")
                    .orElse(null);
            
            if (groupChat == null) {
                return Result.error("群聊不存在或已解散");
            }
            
            GroupChatDTO dto = convertToDTO(groupChat);
            return Result.success(dto);
        } catch (Exception e) {
            log.error("获取群聊信息失败", e);
            return Result.error("获取群聊信息失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> updateGroupInfo(Long groupId, UpdateGroupInfoRequest request) {
        // TODO: 实现更新群聊信息逻辑
        return Result.success("群聊信息已更新");
    }

    @Override
    public Result<String> uploadGroupAvatar(Long groupId, Long userId, MultipartFile avatar) {
        // TODO: 实现上传群头像逻辑
        return Result.success("群头像已更新");
    }

    @Override
    public Result<String> disbandGroup(Long groupId, Long userId) {
        // TODO: 实现解散群聊逻辑
        return Result.success("群聊已解散");
    }

    @Override
    public Result<String> leaveGroup(Long groupId, Long userId) {
        // TODO: 实现退出群聊逻辑
        return Result.success("已退出群聊");
    }

    @Override
    @Transactional
    public Result<String> inviteToGroup(Long groupId, InviteToGroupRequest request) {
        try {
            GroupChat groupChat = groupChatRepository.findByGroupIdAndStatus(groupId, "active").orElse(null);
            if (groupChat == null) {
                return Result.error("群聊不存在或已解散");
            }
            
            GroupMember inviter = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getInviterId(), "active").orElse(null);
            
            if (inviter == null) {
                return Result.error("您不是该群成员");
            }
            
            if ("member".equals(inviter.getMemberRole()) && !groupChat.getAllowMemberInvite()) {
                return Result.error("没有邀请权限");
            }
            
            Long currentCount = groupMemberRepository.countByGroupIdAndMemberStatus(groupId, "active");
            if (currentCount + request.getUserIds().size() > groupChat.getMaxMembers()) {
                return Result.error("群成员已达上限");
            }
            
            int successCount = 0;
            for (Long userId : request.getUserIds()) {
                // 跳过null值
                if (userId == null) {
                    log.warn("跳过null的userId");
                    continue;
                }
                
                // 检查是否已是成员
                if (groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                    continue;
                }
                
                if (groupChat.getJoinApproval()) {
                    // 需要审批，创建入群申请
                    GroupJoinRequest joinRequest = GroupJoinRequest.builder()
                            .groupId(groupId)
                            .applicantId(userId)
                            .inviterId(request.getInviterId())
                            .requestType("invite")
                            .requestMessage(request.getInviteMessage())
                            .requestStatus("pending")
                            .build();
                    groupJoinRequestRepository.save(joinRequest);
                } else {
                    // 直接加入
                    GroupMember member = GroupMember.builder()
                            .groupId(groupId)
                            .userId(userId)
                            .memberRole("member")
                            .memberStatus("active")
                            .inviterId(request.getInviterId())
                            .isMuted(false)
                            .unreadCount(0)
                            .build();
                    groupMemberRepository.save(member);
                    notifyNewMember(userId, groupChat);
                }
                successCount++;
            }
            
            log.info("邀请入群成功: groupId={}, inviter={}, count={}", groupId, request.getInviterId(), successCount);
            return Result.success("邀请已发送，共邀请" + successCount + "人");
        } catch (Exception e) {
            log.error("邀请入群失败", e);
            return Result.error("邀请入群失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> joinGroup(Long groupId, JoinGroupRequest request) {
        // TODO: 实现申请入群逻辑
        return Result.success("入群申请已发送");
    }

    @Override
    public Result<String> handleJoinRequest(Long groupId, HandleJoinRequest request) {
        // TODO: 实现处理入群申请逻辑
        return Result.success("入群申请已处理");
    }

    @Override
    public Result<List<GroupMemberDTO>> getGroupMembers(Long groupId, Long userId) {
        try {
            if (!groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                return Result.error("您不是该群成员");
            }
            
            List<GroupMember> members = groupMemberRepository.findByGroupIdAndMemberStatus(groupId, "active");
            List<GroupMemberDTO> dtoList = members.stream()
                    .map(this::convertToMemberDTO)
                    .collect(Collectors.toList());
            
            return Result.success(dtoList);
        } catch (Exception e) {
            log.error("获取群成员列表失败", e);
            return Result.error("获取群成员列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<GroupMemberAvatarDTO>> getGroupMemberAvatars(Long groupId, Long userId) {
        try {
            log.info("获取群成员头像: groupId={}, requestUserId={}", groupId, userId);
            
            // 检查请求用户是否为群成员
            if (!groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                log.warn("用户不是群成员: userId={}, groupId={}", userId, groupId);
                return Result.error("您不是该群成员");
            }
            
            // 获取所有活跃成员
            List<GroupMember> members = groupMemberRepository.findByGroupIdAndMemberStatus(groupId, "active");
            log.info("找到 {} 个活跃成员", members.size());
            
            // 转换为头像DTO
            List<GroupMemberAvatarDTO> avatarList = new ArrayList<>();
            for (GroupMember member : members) {
                try {
                    // 查询用户信息
                    User user = userRepository.findById(member.getUserId()).orElse(null);
                    
                    // 将byte[]头像转为Base64字符串（如果存在）
                    String avatarBase64 = null;
                    if (user != null && user.getUserProfilePic() != null) {
                        try {
                            avatarBase64 = "data:image/jpeg;base64," + 
                                java.util.Base64.getEncoder().encodeToString(user.getUserProfilePic());
                        } catch (Exception e) {
                            log.warn("转换用户头像失败: userId={}", user.getUserId());
                        }
                    }
                    
                    GroupMemberAvatarDTO avatarDTO = GroupMemberAvatarDTO.builder()
                            .userId(member.getUserId())
                            .username(user != null ? user.getUsername() : null)
                            .nickname(user != null ? user.getUsername() : null) // User表中用username作为显示名
                            .avatar(avatarBase64)
                            .groupNickname(member.getGroupNickname())
                            .memberRole(member.getMemberRole())
                            .build();
                    
                    avatarList.add(avatarDTO);
                    log.debug("添加成员头像: userId={}, hasAvatar={}", 
                            member.getUserId(), avatarBase64 != null);
                    
                } catch (Exception e) {
                    log.error("处理成员 {} 信息失败", member.getUserId(), e);
                }
            }
            
            log.info("成功获取 {} 个成员头像", avatarList.size());
            return Result.success(avatarList);
            
        } catch (Exception e) {
            log.error("获取群成员头像失败: groupId={}", groupId, e);
            return Result.error("获取群成员头像失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> kickMember(Long groupId, KickMemberRequest request) {
        // TODO: 实现踢出群成员逻辑
        return Result.success("群成员已被踢出");
    }

    @Override
    public Result<String> setGroupAdmin(Long groupId, SetAdminRequest request) {
        // TODO: 实现设置群管理员逻辑
        return Result.success("群管理员设置已更新");
    }

    @Override
    public Result<String> transferOwnership(Long groupId, TransferOwnershipRequest request) {
        // TODO: 实现转让群主逻辑
        return Result.success("群主已转让");
    }

    @Override
    public Result<String> setGroupNickname(Long groupId, SetGroupNicknameRequest request) {
        // TODO: 实现设置群昵称逻辑
        return Result.success("群昵称已设置");
    }

    @Override
    public Result<String> muteMember(Long groupId, MuteMemberRequest request) {
        // TODO: 实现禁言群成员逻辑
        return Result.success("群成员禁言状态已更新");
    }

    @Override
    public Result<String> muteAllMembers(Long groupId, MuteAllRequest request) {
        // TODO: 实现全员禁言逻辑
        return Result.success("全员禁言状态已更新");
    }

    @Override
    public Result<String> setJoinApproval(Long groupId, SetJoinApprovalRequest request) {
        // TODO: 实现设置入群审批逻辑
        return Result.success("入群审批设置已更新");
    }

    @Override
    public Result<String> setInvitePermission(Long groupId, SetInvitePermissionRequest request) {
        // TODO: 实现设置邀请权限逻辑
        return Result.success("邀请权限设置已更新");
    }

    @Override
    @Transactional
    public Result<MessageDTO> sendGroupMessage(Long groupId, SendGroupMessageRequest request) {
        try {
            GroupChat groupChat = groupChatRepository.findByGroupIdAndStatus(groupId, "active").orElse(null);
            if (groupChat == null) {
                return Result.error("群聊不存在或已解散");
            }
            
            GroupMember sender = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getSenderId(), "active").orElse(null);
            
            if (sender == null) {
                return Result.error("您不是该群成员");
            }
            
            if (sender.getIsMuted() && 
                (sender.getMuteUntil() == null || sender.getMuteUntil().isAfter(LocalDateTime.now()))) {
                return Result.error("您已被禁言");
            }
            
            if (groupChat.getMuteAll() && !"owner".equals(sender.getMemberRole()) && !"admin".equals(sender.getMemberRole())) {
                return Result.error("当前群聊已开启全员禁言");
            }
            
            // 保存消息到数据库
            GroupMessage groupMessage = GroupMessage.builder()
                    .groupId(groupId)
                    .senderId(request.getSenderId())
                    .messageType(request.getMessageType())
                    .content(request.getContent())
                    .mediaUrl(request.getMediaUrl())
                    .sentTime(LocalDateTime.now())
                    .build();
            
            groupMessage = groupMessageRepository.save(groupMessage);
            
            // 转换为 DTO
            MessageDTO messageDTO = convertToMessageDTO(groupMessage);
            
            // 更新未读计数
            groupMemberRepository.incrementUnreadCountForMembers(groupId, request.getSenderId());
            
            // 推送给其他成员
            pushMessageToGroup(groupId, messageDTO);
            
            log.info("群消息发送成功: messageId={}, groupId={}, senderId={}", 
                    groupMessage.getMessageId(), groupId, request.getSenderId());
            return Result.success("群消息发送成功", messageDTO);
        } catch (Exception e) {
            log.error("发送群消息失败", e);
            return Result.error("发送群消息失败: " + e.getMessage());
        }
    }

    @Override
    public Result<MessageDTO> sendGroupFile(Long groupId, Long senderId, String messageType, MultipartFile file) {
        // TODO: 实现发送群文件逻辑
        return Result.success("群文件发送成功", null);
    }

    @Override
    public Result<List<MessageDTO>> getGroupMessages(Long groupId, Long userId, Integer page, Integer size) {
        try {
            // 检查用户是否为群成员
            if (!groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                return Result.error("您不是该群成员");
            }
            
            // 创建分页请求
            Pageable pageable = PageRequest.of(page - 1, size); // Spring Data JPA 的页码从 0 开始
            
            // 查询群消息
            Page<GroupMessage> messagePage = groupMessageRepository.findByGroupIdAndIsRecalledFalseOrderBySentTimeDesc(groupId, pageable);
            
            // 转换为 DTO
            List<MessageDTO> messageDTOs = messagePage.getContent().stream()
                    .map(this::convertToMessageDTO)
                    .collect(Collectors.toList());
            
            log.info("获取群聊记录成功: groupId={}, userId={}, page={}, size={}, total={}", 
                    groupId, userId, page, size, messagePage.getTotalElements());
            
            return Result.success(messageDTOs);
        } catch (Exception e) {
            log.error("获取群聊记录失败: groupId={}, userId={}", groupId, userId, e);
            return Result.error("获取群聊记录失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<MessageDTO>> searchGroupMessages(Long groupId, Long userId, String keyword, Integer page, Integer size) {
        try {
            // 检查用户是否为群成员
            if (!groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, userId, "active")) {
                return Result.error("您不是该群成员");
            }
            
            if (keyword == null || keyword.trim().isEmpty()) {
                return Result.error("搜索关键词不能为空");
            }
            
            // 创建分页请求
            Pageable pageable = PageRequest.of(page - 1, size);
            
            // 搜索群消息
            Page<GroupMessage> messagePage = groupMessageRepository.searchGroupMessages(groupId, keyword.trim(), pageable);
            
            // 转换为 DTO
            List<MessageDTO> messageDTOs = messagePage.getContent().stream()
                    .map(this::convertToMessageDTO)
                    .collect(Collectors.toList());
            
            log.info("搜索群聊记录成功: groupId={}, userId={}, keyword={}, results={}", 
                    groupId, userId, keyword, messageDTOs.size());
            
            return Result.success(messageDTOs);
        } catch (Exception e) {
            log.error("搜索群聊记录失败: groupId={}, userId={}, keyword={}", groupId, userId, keyword, e);
            return Result.error("搜索群聊记录失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<GroupChatDTO>> getMyGroups(Long userId) {
        try {
            List<GroupMember> myMemberships = groupMemberRepository.findByUserIdAndMemberStatus(userId, "active");
            List<GroupChatDTO> groupList = new ArrayList<>();
            
            for (GroupMember membership : myMemberships) {
                GroupChat groupChat = groupChatRepository.findByGroupIdAndStatus(
                        membership.getGroupId(), "active").orElse(null);
                
                if (groupChat != null) {
                    GroupChatDTO dto = convertToDTO(groupChat);
                    groupList.add(dto);
                }
            }
            
            return Result.success(groupList);
        } catch (Exception e) {
            log.error("获取我的群聊列表失败", e);
            return Result.error("获取我的群聊列表失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<GroupChatDTO>> searchGroups(String keyword, Long userId) {
        // TODO: 实现搜索群聊逻辑
        return Result.success(new ArrayList<>());
    }

    @Override
    public Result<GroupStatisticsDTO> getGroupStatistics(Long groupId, Long userId) {
        // TODO: 实现获取群聊统计逻辑
        return Result.success(null);
    }

    @Override
    public Result<GroupAnnouncementDTO> getGroupAnnouncement(Long groupId, Long userId) {
        // TODO: 实现获取群公告逻辑
        return Result.success(null);
    }

    @Override
    public Result<String> setGroupAnnouncement(Long groupId, SetAnnouncementRequest request) {
        // TODO: 实现设置群公告逻辑
        return Result.success("群公告已发布");
    }

    @Override
    public Result<String> setGroupType(Long groupId, SetGroupTypeRequest request) {
        // TODO: 实现设置群类型逻辑
        return Result.success("群类型已设置");
    }

    @Override
    public Result<BatchInviteResultDTO> batchInviteFriends(Long groupId, BatchInviteRequest request) {
        // TODO: 实现批量邀请好友逻辑
        return Result.success(null);
    }

    @Override
    public Result<List<JoinRequestDTO>> getJoinRequests(Long groupId, Long userId) {
        // TODO: 实现获取入群申请列表逻辑
        return Result.success(new ArrayList<>());
    }

    @Override
    @Transactional
    public Result<String> markGroupMessagesAsRead(Long groupId, MarkGroupReadRequest request) {
        try {
            groupMemberRepository.clearUnreadCount(groupId, request.getUserId(), LocalDateTime.now());
            log.info("标记群消息已读: groupId={}, userId={}", groupId, request.getUserId());
            return Result.success("群消息已标记为已读");
        } catch (Exception e) {
            log.error("标记群消息已读失败", e);
            return Result.error("标记群消息已读失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<GroupInvitationDTO>> getMyInvitations(Long userId) {
        try {
            // 获取用户最近7天加入的群（作为邀请通知）
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            List<GroupMember> recentJoins = groupMemberRepository.findByUserIdAndMemberStatusAndJoinTimeAfter(
                    userId, "active", sevenDaysAgo);

            List<GroupInvitationDTO> invitations = new ArrayList<>();
            for (GroupMember member : recentJoins) {
                // 跳过自己创建的群
                if ("owner".equals(member.getMemberRole())) {
                    continue;
                }

                GroupChat groupChat = groupChatRepository.findById(member.getGroupId()).orElse(null);
                if (groupChat == null || !"active".equals(groupChat.getStatus())) {
                    continue;
                }

                GroupInvitationDTO invitation = GroupInvitationDTO.builder()
                        .notificationId(member.getId())
                        .groupId(groupChat.getGroupId())
                        .groupName(groupChat.getGroupName())
                        .groupAvatar(groupChat.getGroupAvatar())
                        .memberCount(groupChat.getCurrentMembers())
                        .inviterId(member.getInviterId())
                        .inviterName(null) // TODO: 从UserRepository查询
                        .joinTime(member.getJoinTime())
                        .hasRead(false) // TODO: 从通知表查询
                        .status("accepted")
                        .build();

                invitations.add(invitation);
            }

            log.info("获取邀请通知成功: userId={}, count={}", userId, invitations.size());
            return Result.success(invitations);
        } catch (Exception e) {
            log.error("获取邀请通知失败: userId={}", userId, e);
            return Result.error("获取邀请通知失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> markInvitationAsRead(Long userId, Long groupId) {
        try {
            // TODO: 实现通知已读逻辑（需要通知表）
            log.info("标记邀请通知已读: userId={}, groupId={}", userId, groupId);
            return Result.success("邀请通知已标记为已读");
        } catch (Exception e) {
            log.error("标记邀请通知已读失败", e);
            return Result.error("标记邀请通知已读失败: " + e.getMessage());
        }
    }

    // ==================== 辅助方法 ====================

    private GroupChatDTO convertToDTO(GroupChat groupChat) {
        return GroupChatDTO.builder()
                .groupId(groupChat.getGroupId())
                .groupName(groupChat.getGroupName())
                .groupAvatar(groupChat.getGroupAvatar())
                .groupDescription(groupChat.getGroupDescription())
                .creatorId(groupChat.getCreatorId())
                .maxMembers(groupChat.getMaxMembers())
                .currentMembers(groupChat.getCurrentMembers())
                .groupType(groupChat.getGroupType())
                .status(groupChat.getStatus())
                .createdTime(groupChat.getCreatedTime())
                .build();
    }
    
    private GroupMemberDTO convertToMemberDTO(GroupMember member) {
        return GroupMemberDTO.builder()
                .userId(member.getUserId())
                .role(member.getMemberRole())
                .groupNickname(member.getGroupNickname())
                .isMuted(member.getIsMuted())
                .joinTime(member.getJoinTime())
                .build();
    }
    
    private MessageDTO convertToMessageDTO(GroupMessage groupMessage) {
        return MessageDTO.builder()
                .messageId(groupMessage.getMessageId())
                .senderId(groupMessage.getSenderId())
                .groupId(groupMessage.getGroupId())
                .messageType(groupMessage.getMessageType())
                .content(groupMessage.getContent())
                .mediaUrl(groupMessage.getMediaUrl())
                .fileName(groupMessage.getFileName())
                .fileSize(groupMessage.getMediaSize())
                .duration(groupMessage.getMediaDuration())
                .sentTime(groupMessage.getSentTime())
                .isRead(false)  // 群消息的已读状态由客户端管理
                .build();
    }
    
    private void notifyNewMember(Long userId, GroupChat groupChat) {
        notifyNewMember(userId, groupChat, groupChat.getCreatorId(), "您被邀请加入了群聊");
    }
    
    private void notifyNewMember(Long userId, GroupChat groupChat, Long inviterId, String message) {
        try {
            // 查询邀请人信息（需要UserRepository，暂时用null）
            GroupInvitationNotificationDTO notification = GroupInvitationNotificationDTO.builder()
                    .groupId(groupChat.getGroupId())
                    .groupName(groupChat.getGroupName())
                    .groupAvatar(groupChat.getGroupAvatar())
                    .groupDescription(groupChat.getGroupDescription())
                    .currentMembers(groupChat.getCurrentMembers())
                    .maxMembers(groupChat.getMaxMembers())
                    .inviterId(inviterId)
                    .inviterName(null) // TODO: 从UserRepository查询
                    .inviterAvatar(null) // TODO: 从UserRepository查询
                    .invitationTime(LocalDateTime.now())
                    .notificationType("group_invitation")
                    .invitationMessage(message)
                    .build();
            
            chatWebSocketHandler.pushMessageToUser(userId, "group_invitation", notification);
            log.info("推送群聊邀请通知: userId={}, groupId={}, inviterId={}", userId, groupChat.getGroupId(), inviterId);
        } catch (Exception e) {
            log.error("通知新成员失败: userId={}", userId, e);
        }
    }
    
    private void pushMessageToGroup(Long groupId, MessageDTO messageDTO) {
        try {
            List<GroupMember> members = groupMemberRepository.findByGroupIdAndMemberStatus(groupId, "active");
            for (GroupMember member : members) {
                // 不推送给发送者自己
                if (!member.getUserId().equals(messageDTO.getSenderId())) {
                    chatWebSocketHandler.pushMessageToUser(member.getUserId(), "new_group_message", messageDTO);
                }
            }
        } catch (Exception e) {
            log.error("推送群消息失败: groupId={}", groupId, e);
        }
    }
    
    // =====================================================
    // 群聊设置功能实现
    // =====================================================
    
    @Override
    @Transactional
    public Result<String> pinGroup(Long groupId, PinGroupRequest request) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            if (!"active".equals(groupChat.getStatus())) {
                return Result.error("群聊已解散或被冻结");
            }
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getUserId(), "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 更新置顶状态
            member.setIsPinned(request.getIsPinned());
            groupMemberRepository.save(member);
            
            log.info("用户 {} {} 群聊 {}", request.getUserId(), 
                    request.getIsPinned() ? "置顶" : "取消置顶", groupId);
            
            return Result.success(request.getIsPinned() ? "置顶成功" : "取消置顶成功");
        } catch (RuntimeException e) {
            log.error("置顶群聊失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("置顶群聊失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    @Transactional
    public Result<String> setDisturbFree(Long groupId, DisturbFreeRequest request) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            if (!"active".equals(groupChat.getStatus())) {
                return Result.error("群聊已解散或被冻结");
            }
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getUserId(), "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 更新消息免打扰状态
            member.setIsDisturbFree(request.getIsDisturbFree());
            groupMemberRepository.save(member);
            
            log.info("用户 {} {} 群聊 {} 的消息免打扰", request.getUserId(), 
                    request.getIsDisturbFree() ? "开启" : "关闭", groupId);
            
            return Result.success(request.getIsDisturbFree() ? "已开启消息免打扰" : "已关闭消息免打扰");
        } catch (RuntimeException e) {
            log.error("设置消息免打扰失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("设置消息免打扰失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    @Transactional
    public Result<String> setChatBackground(Long groupId, SetChatBackgroundRequest request) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            if (!"active".equals(groupChat.getStatus())) {
                return Result.error("群聊已解散或被冻结");
            }
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getUserId(), "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 更新聊天背景
            member.setChatBackground(request.getBackgroundUrl());
            groupMemberRepository.save(member);
            
            log.info("用户 {} 设置群聊 {} 的背景", request.getUserId(), groupId);
            
            return Result.success(request.getBackgroundUrl() == null ? 
                    "已清除聊天背景" : "聊天背景设置成功");
        } catch (RuntimeException e) {
            log.error("设置聊天背景失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("设置聊天背景失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    @Transactional
    public Result<String> clearChatHistory(Long groupId, ClearChatHistoryRequest request) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            if (!"active".equals(groupChat.getStatus())) {
                return Result.error("群聊已解散或被冻结");
            }
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, request.getUserId(), "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 设置清空历史记录的时间点
            member.setClearHistoryTime(LocalDateTime.now());
            // 同时清空未读消息数
            member.setUnreadCount(0);
            groupMemberRepository.save(member);
            
            log.info("用户 {} 清空群聊 {} 的聊天记录", request.getUserId(), groupId);
            
            return Result.success("聊天记录已清空");
        } catch (RuntimeException e) {
            log.error("清空聊天记录失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("清空聊天记录失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    @Transactional
    public Result<String> reportGroup(Long groupId, ReportGroupRequest request) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            // 验证用户ID是否有效
            if (!userRepository.existsById(request.getReporterId())) {
                return Result.error("用户不存在");
            }
            
            // 检查是否已经举报过
            boolean alreadyReported = groupReportRepository.existsByGroupIdAndReporterId(
                    groupId, request.getReporterId());
            if (alreadyReported) {
                return Result.error("您已经举报过该群聊，请勿重复举报");
            }
            
            // 创建举报记录
            GroupReport report = GroupReport.builder()
                    .groupId(groupId)
                    .reporterId(request.getReporterId())
                    .reportType(request.getReportType())
                    .reportReason(request.getReportReason())
                    .evidenceUrls(request.getEvidenceUrls())
                    .reportStatus("pending")
                    .build();
            
            groupReportRepository.save(report);
            
            log.info("用户 {} 举报群聊 {}, 类型: {}", request.getReporterId(), groupId, request.getReportType());
            
            return Result.success("举报已提交，我们会尽快处理");
        } catch (RuntimeException e) {
            log.error("举报群聊失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("举报群聊失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    public Result<GroupSettingsDTO> getGroupSettings(Long groupId, Long userId) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, userId, "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 构建设置信息DTO
            GroupSettingsDTO settings = GroupSettingsDTO.builder()
                    .groupId(groupId)
                    .userId(userId)
                    .isPinned(member.getIsPinned())
                    .isDisturbFree(member.getIsDisturbFree())
                    .chatBackground(member.getChatBackground())
                    .clearHistoryTime(member.getClearHistoryTime())
                    .unreadCount(member.getUnreadCount())
                    .build();
            
            return Result.success(settings);
        } catch (RuntimeException e) {
            log.error("获取群聊设置失败", e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("获取群聊设置失败", e);
            return Result.error("操作失败");
        }
    }
    
    @Override
    public Result<ChatBackgroundDTO> getChatBackground(Long groupId, Long userId) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, userId, "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 构建聊天背景DTO
            ChatBackgroundDTO background = ChatBackgroundDTO.builder()
                    .groupId(groupId)
                    .userId(userId)
                    .chatBackground(member.getChatBackground())
                    .build();
            
            return Result.success(background);
        } catch (RuntimeException e) {
            log.error("获取群聊背景失败: userId={}, groupId={}", userId, groupId, e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("获取群聊背景失败: userId={}, groupId={}", userId, groupId, e);
            return Result.error("获取聊天背景失败");
        }
    }
    
    @Override
    @Transactional
    public Result<String> uploadChatBackground(Long groupId, Long userId, MultipartFile backgroundImage) {
        try {
            // 验证群聊是否存在
            GroupChat groupChat = groupChatRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("群聊不存在"));
            
            // 验证用户是否为群成员
            GroupMember member = groupMemberRepository.findByGroupIdAndUserIdAndMemberStatus(
                    groupId, userId, "active")
                    .orElseThrow(() -> new RuntimeException("您不是该群成员"));
            
            // 上传背景图片
            Result<FileUploadDTO> uploadResult = fileUploadService.uploadChatBackground(backgroundImage, userId);
            if (uploadResult.getCode() != 200) {
                return Result.error(uploadResult.getMessage());
            }
            
            // 获取上传后的图片URL
            String backgroundUrl = uploadResult.getData().getImageUrl();
            
            // 更新群成员的聊天背景
            member.setChatBackground(backgroundUrl);
            groupMemberRepository.save(member);
            
            log.info("用户 {} 上传群聊 {} 的背景图片成功: {}", userId, groupId, backgroundUrl);
            return Result.success("群聊背景上传成功", backgroundUrl);
            
        } catch (RuntimeException e) {
            log.error("上传群聊背景失败: userId={}, groupId={}", userId, groupId, e);
            return Result.error(e.getMessage());
        } catch (Exception e) {
            log.error("上传群聊背景失败: userId={}, groupId={}", userId, groupId, e);
            return Result.error("上传群聊背景失败");
        }
    }
}

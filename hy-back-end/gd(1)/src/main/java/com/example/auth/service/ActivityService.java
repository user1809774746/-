package com.example.auth.service;

import com.example.auth.dto.ActivityCreateRequest;
import com.example.auth.dto.ParticipantRegistrationRequest;
import com.example.auth.entity.Activity;
import com.example.auth.entity.ActivityParticipant;
import com.example.auth.entity.ActivityReport;
import com.example.auth.entity.User;
import com.example.auth.repository.ActivityParticipantRepository;
import com.example.auth.repository.ActivityReportRepository;
import com.example.auth.repository.ActivityRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.NotificationService;
import com.example.chat.dto.GroupChatDTOs.CreateGroupRequest;
import com.example.chat.dto.GroupChatDTOs.GroupChatDTO;
import com.example.chat.entity.GroupMember;
import com.example.chat.repository.GroupMemberRepository;
import com.example.chat.service.GroupChatService;
import com.example.common.result.Result;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;



@Service
@Transactional
public class ActivityService {
    
    @Autowired
    private ActivityRepository activityRepository;
    
    @Autowired
    private ActivityParticipantRepository participantRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ActivityReportRepository activityReportRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private GroupChatService groupChatService;

    @Autowired
    private GroupMemberRepository groupMemberRepository;
    
    
    private void updateCurrentParticipantsCount(Activity activity) {
        if (activity == null || activity.getId() == null) {
            return;
        }
        Long approvedCount = participantRepository.countApprovedParticipants(activity.getId());
        long approved = approvedCount != null ? approvedCount : 0L;
        int totalParticipants = (int) (approved + 1);
        activity.setCurrentParticipants(totalParticipants);
    }
    
    private void updateCurrentParticipantsCount(List<Activity> activities) {
        if (activities == null || activities.isEmpty()) {
            return;
        }
        for (Activity activity : activities) {
            updateCurrentParticipantsCount(activity);
        }
    }
    
    /**
     * 创建活动
     */
    public Activity createActivity(ActivityCreateRequest request, Long organizerId) {
        // 验证必填字段
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new RuntimeException("活动标题不能为空");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new RuntimeException("活动描述不能为空");
        }
        if (request.getStartTime() == null) {
            throw new RuntimeException("活动开始时间不能为空");
        }
        if (request.getEndTime() == null) {
            throw new RuntimeException("活动结束时间不能为空");
        }
        if (request.getStartTime() != null && request.getEndTime() != null && 
            request.getStartTime().isAfter(request.getEndTime())) {
            throw new RuntimeException("活动开始时间不能晚于结束时间");
        }
        
        Activity activity = new Activity();
        BeanUtils.copyProperties(request, activity);

        // 计算图片和视频数量
        if (activity.getImages() != null && !activity.getImages().trim().isEmpty()) {
            int imageCount = (int) Arrays.stream(activity.getImages().split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .count();
            activity.setImageCount(imageCount);
        } else {
            activity.setImageCount(0);
        }

        if (activity.getVideos() != null && !activity.getVideos().trim().isEmpty()) {
            int videoCount = (int) Arrays.stream(activity.getVideos().split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .count();
            activity.setVideoCount(videoCount);
        } else {
            activity.setVideoCount(0);
        }

        // 如果没有封面图但有正文图片，则使用第一张图片作为封面
        if ((activity.getCoverImage() == null || activity.getCoverImage().trim().isEmpty())
                && activity.getImages() != null && !activity.getImages().trim().isEmpty()) {
            String firstImage = Arrays.stream(activity.getImages().split(","))
                    .map(String::trim)
                    .filter(value -> !value.isEmpty())
                    .findFirst()
                    .orElse(null);
            activity.setCoverImage(firstImage);
        }
        
        // 设置组织者信息
        activity.setOrganizerId(organizerId);
        // 发起人默认参与活动，当前参与人数从1开始
        activity.setCurrentParticipants(1);

        
        // 获取组织者用户名
        Optional<User> organizer = userRepository.findById(organizerId);
        if (organizer.isPresent()) {
            activity.setOrganizerName(organizer.get().getUsername());
        }
        
        // 设置枚举值

        try {
            if (request.getCategory() != null) {
                activity.setCategory(Activity.ActivityCategory.valueOf(request.getCategory()));
            }
            if (request.getType() != null) {
                activity.setType(Activity.ActivityType.valueOf(request.getType()));
            }
            if (request.getLevel() != null) {
                activity.setLevel(Activity.ActivityLevel.valueOf(request.getLevel()));
            }
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("无效的枚举值: " + e.getMessage());
        }
        
        // 设置默认状态
        activity.setStatus(Activity.ActivityStatus.draft);
        activity.setAuditStatus(Activity.AuditStatus.pending);
        
        return activityRepository.save(activity);
    }
    
    /**
     * 发布活动（提交审核）
     */
    public Activity publishActivity(Long activityId, Long organizerId) {
        Activity activity = activityRepository.findByIdAndOrganizerId(activityId, organizerId)
                .orElseThrow(() -> new RuntimeException("活动不存在或无权限"));
        
        if (activity.getAuditStatus() == Activity.AuditStatus.approved) {
            activity.setStatus(Activity.ActivityStatus.published);
            activity.setPublishedTime(LocalDateTime.now());
        } else {
            // 提交审核
            activity.setAuditStatus(Activity.AuditStatus.pending);
        }
        
        return activityRepository.save(activity);
    }
    
    /**
     * 获取同城活动
     */
    public List<Activity> getLocalActivities(String city) {
        List<Activity> activities;
        if (city == null || city.trim().isEmpty()) {
            activities = activityRepository.findAllApproved();
        } else {
            activities = activityRepository.findByCityAndApproved(city);
        }
        updateCurrentParticipantsCount(activities);
        return activities;
    }
    
    /**
     * 获取推荐活动（所有已审核通过的活动）
     */
    public List<Activity> getRecommendedActivities() {
        List<Activity> activities = activityRepository.findAllApproved();
        updateCurrentParticipantsCount(activities);
        return activities;
    }
    
    /**
     * 获取我的活动（发布的和参与的）
     */
    public List<Activity> getMyActivities(Long userId) {
        // 获取用户发布的活动
        List<Activity> organizedActivities = activityRepository.findByOrganizerIdOrderByCreatedTimeDesc(userId);
        
        // 获取用户参与的活动
        List<Long> participatedIds = activityRepository.findParticipatedActivityIds(userId);
        List<Activity> participatedActivities = activityRepository.findByIdInOrderByCreatedTimeDesc(participatedIds);
        
        // 合并并去重
        organizedActivities.addAll(participatedActivities);
        List<Activity> result = organizedActivities.stream().distinct().toList();
        updateCurrentParticipantsCount(result);
        return result;
    }
    
    /**
     * 获取用户参与的活动（不包含其作为组织者发布的活动）
     */
    public List<Activity> getParticipatedActivities(Long userId) {
        List<Long> participatedIds = activityRepository.findParticipatedActivityIds(userId);
        if (participatedIds == null || participatedIds.isEmpty()) {
            return Collections.emptyList();
        }
        List<Activity> activities = activityRepository.findByIdInOrderByCreatedTimeDesc(participatedIds);
        updateCurrentParticipantsCount(activities);
        return activities;
    }
    
    /**
     * 获取活动详情
     */
    public Optional<Activity> getActivityDetail(Long activityId) {
        Optional<Activity> activityOptional = activityRepository.findById(activityId);
        activityOptional.ifPresent(this::updateCurrentParticipantsCount);
        return activityOptional;
    }
    
    /**
     * 报名参加活动
     */
    public ActivityParticipant registerForActivity(Long activityId, Long userId, ParticipantRegistrationRequest request) {
        // 检查活动是否存在
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));

        // 活动发起人默认参与活动，无需报名
        if (userId.equals(activity.getOrganizerId())) {
            throw new RuntimeException("活动发起人已默认参与，无需报名");
        }
        
        // 检查活动状态

        if (activity.getAuditStatus() != Activity.AuditStatus.approved || 
            activity.getStatus() != Activity.ActivityStatus.published) {
            throw new RuntimeException("活动未开放报名");
        }
        
        // 检查是否已报名
        Optional<ActivityParticipant> existing = participantRepository.findByActivityIdAndUserId(activityId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("您已报名此活动");
        }
        
        // 检查报名时间
        LocalDateTime now = LocalDateTime.now();
        if (activity.getRegistrationStart() != null && now.isBefore(activity.getRegistrationStart())) {
            throw new RuntimeException("报名尚未开始");
        }
        if (activity.getRegistrationEnd() != null && now.isAfter(activity.getRegistrationEnd())) {
            throw new RuntimeException("报名已结束");
        }
        
        // 检查人数限制（人数包含活动发起人自己）
        Integer maxParticipants = activity.getMaxParticipants();
        if (maxParticipants != null && maxParticipants > 0) {
            Long approvedCount = participantRepository.countApprovedParticipants(activityId);
            long approved = approvedCount != null ? approvedCount : 0L;
            long totalAfterThisSignup = approved + 1 + 1; // 已有参与者 + 发起人 + 本次报名用户
            if (totalAfterThisSignup > maxParticipants) {
                throw new RuntimeException("活动已满员");
            }
        }
        
        // 创建参与记录
        ActivityParticipant participant = new ActivityParticipant(activityId, userId);
        participant.setNotes(request.getNotes());
        participant.setEmergencyContact(request.getEmergencyContact());
        participant.setEmergencyPhone(request.getEmergencyPhone());
        
        // 设置状态
        if (activity.getAutoApprove()) {
            participant.setStatus(ActivityParticipant.ParticipantStatus.approved);
            participant.setApprovalTime(now);
        } else {
            participant.setStatus(ActivityParticipant.ParticipantStatus.pending);
        }


        ActivityParticipant saved = participantRepository.save(participant);

        // 如果该报名已直接通过审核，则为活动创建或复用群聊并加入该用户
        if (saved.getStatus() == ActivityParticipant.ParticipantStatus.approved
                && !userId.equals(activity.getOrganizerId())) {
            ensureActivityGroupChat(activity, userId);
        }

        // 创建活动报名通知（通知活动组织者）
        try {

            notificationService.createActivitySignupNotification(activity, userId);
        } catch (Exception e) {
            System.err.println("创建活动报名通知失败: " + e.getMessage());
        }

        return saved;
    }
    
    /**
     * 退出活动
     */
    public void quitActivity(Long activityId, Long userId) {
        ActivityParticipant participant = participantRepository.findByActivityIdAndUserId(activityId, userId)
                .orElseThrow(() -> new RuntimeException("您未报名此活动"));
        
        // 检查活动是否已开始
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        if (LocalDateTime.now().isAfter(activity.getStartTime())) {
            throw new RuntimeException("活动已开始，无法退出");
        }
        
        participantRepository.delete(participant);
    }
    
    /**
     * 审核参与者（活动组织者）
     */
    public ActivityParticipant approveParticipant(Long participantId, Long organizerId, boolean approve) {
        ActivityParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new RuntimeException("参与记录不存在"));
        
        // 验证权限
        Activity activity = activityRepository.findById(participant.getActivityId())
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new RuntimeException("无权限操作");
        }
        
        // 更新状态
        if (approve) {
            participant.setStatus(ActivityParticipant.ParticipantStatus.approved);
        } else {
            participant.setStatus(ActivityParticipant.ParticipantStatus.rejected);
        }
        participant.setApprovalTime(LocalDateTime.now());
        
        ActivityParticipant saved = participantRepository.save(participant);

        // 如果审核通过，则为活动创建或复用群聊并加入该用户
        if (approve && !saved.getUserId().equals(activity.getOrganizerId())) {
            ensureActivityGroupChat(activity, saved.getUserId());
        }
        
        return saved;

    }
    
    /**
     * 获取待审核的参与者
     */
    public List<ActivityParticipant> getPendingParticipants(Long organizerId) {
        return participantRepository.findPendingParticipantsByOrganizer(organizerId);
    }
    
    /**
     * 获取活动参与者列表
     */
    public List<ActivityParticipant> getActivityParticipants(Long activityId, Long organizerId) {
        // 验证权限
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        if (!activity.getOrganizerId().equals(organizerId)) {
            throw new RuntimeException("无权限查看");
        }
        
        return participantRepository.findByActivityIdOrderByRegistrationTimeDesc(activityId);
    }
    
    /**
     * 举报活动
     */
    public void reportActivity(Long activityId, Long reporterId, String reason) {
        // 检查活动是否存在
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));

        // 创建举报记录
        ActivityReport report = new ActivityReport(activityId, reporterId, reason);
        activityReportRepository.save(report);
    }
    
    /**
     * 获取指定活动的举报记录（按时间倒序）
     */
    public List<ActivityReport> getActivityReports(Long activityId) {
        return activityReportRepository.findByActivityIdOrderByCreatedTimeDesc(activityId);
    }
    
    /**
     * 获取被举报的活动（根据举报记录status筛选，当前使用pending）
     */
    public Page<Activity> getReportedActivities(Pageable pageable) {
        Page<Activity> page = activityRepository.findReportedActivities("pending", pageable);
        updateCurrentParticipantsCount(page.getContent());
        return page;
    }
    
    /**
     * 管理员审核活动
     */
    public Activity auditActivity(Long activityId, boolean approve, String reason) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("活动不存在"));
        
        if (approve) {
            activity.setAuditStatus(Activity.AuditStatus.approved);
            activity.setStatus(Activity.ActivityStatus.published);
            activity.setPublishedTime(LocalDateTime.now());
        } else {
            activity.setAuditStatus(Activity.AuditStatus.rejected);
            // 如果该活动此前已经是已发布/进行中，则审核拒绝时同步将状态改为已取消
            if (activity.getStatus() == Activity.ActivityStatus.published
                    || activity.getStatus() == Activity.ActivityStatus.ongoing) {
                activity.setStatus(Activity.ActivityStatus.cancelled);
            }
        }
        
        activity.setAuditReason(reason);
        activity.setAuditTime(LocalDateTime.now());
        
        // 将该活动的所有待处理举报标记为已处理
        List<ActivityReport> reports = activityReportRepository.findByActivityIdOrderByCreatedTimeDesc(activityId);
        for (ActivityReport report : reports) {
            if ("pending".equals(report.getStatus())) {
                report.setStatus("processed");
                report.setHandleTime(LocalDateTime.now());
            }
        }
        if (!reports.isEmpty()) {
            activityReportRepository.saveAll(reports);
        }
        
        return activityRepository.save(activity);
    }
    
    /**
     * 获取待审核的活动
     */
    public Page<Activity> getPendingActivities(Pageable pageable) {
        Page<Activity> page = activityRepository.findPendingActivities(pageable);
        updateCurrentParticipantsCount(page.getContent());
        return page;
    }
    
    /**
     * 检查用户参与状态
     */
    public Optional<ActivityParticipant.ParticipantStatus> getParticipantStatus(Long activityId, Long userId) {
        return participantRepository.findParticipantStatus(activityId, userId);
    }
    
    /**
     * 更新活动浏览量
     */
    public void incrementViewCount(Long activityId) {
        activityRepository.findById(activityId).ifPresent(activity -> {
            activity.setViewCount(activity.getViewCount() + 1);
            activityRepository.save(activity);
        });
    }

    /**
     * 为活动创建或复用群聊，并将指定用户加入该群
     */
    private void ensureActivityGroupChat(Activity activity, Long participantUserId) {
        try {
            // 如果活动还没有关联群聊，则先创建活动群
            if (activity.getGroupChatId() == null) {
                CreateGroupRequest groupRequest = new CreateGroupRequest();
                groupRequest.setCreatorId(activity.getOrganizerId());
                groupRequest.setGroupName("活动群 - " + activity.getTitle());
                // 为避免字符集问题，这里使用英文描述或留空
                groupRequest.setGroupDescription("Activity ID: " + activity.getId());


                Integer maxParticipants = activity.getMaxParticipants();
                if (maxParticipants != null && maxParticipants > 0) {
                    // 预留发起人一个名额
                    groupRequest.setMaxMembers(maxParticipants + 1);
                } else {
                    groupRequest.setMaxMembers(200);
                }

                groupRequest.setGroupType("normal");
                groupRequest.setJoinApproval(false);
                groupRequest.setAllowInvite(true);
                groupRequest.setInitialMembers(Collections.singletonList(participantUserId));

                Result<GroupChatDTO> result = groupChatService.createGroup(groupRequest);
                if (result != null && result.getCode() == 200 && result.getData() != null) {
                    Long groupId = result.getData().getGroupId();
                    activity.setGroupChatId(groupId);
                    activityRepository.save(activity);
                } else {
                    System.err.println("创建活动群聊失败: " + (result != null ? result.getMessage() : "未知错误"));
                }
            } else {
                // 已存在群聊，则只需将该参与用户加入群聊
                Long groupId = activity.getGroupChatId();
                boolean exists = groupMemberRepository.existsByGroupIdAndUserIdAndMemberStatus(groupId, participantUserId, "active");
                if (!exists) {
                    GroupMember member = GroupMember.builder()
                            .groupId(groupId)
                            .userId(participantUserId)
                            .memberRole("member")
                            .memberStatus("active")
                            .isMuted(false)
                            .unreadCount(0)
                            .build();
                    groupMemberRepository.save(member);
                }
            }
        } catch (Exception e) {
            System.err.println("处理活动群聊逻辑失败: " + e.getMessage());
        }
    }
}


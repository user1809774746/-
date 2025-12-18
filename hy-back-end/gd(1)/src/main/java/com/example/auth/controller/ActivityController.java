package com.example.auth.controller;

import com.example.auth.dto.ActivityCreateRequest;
import com.example.auth.dto.ParticipantRegistrationRequest;
import com.example.auth.dto.ActivityParticipantReviewResponse;
import com.example.auth.entity.Activity;
import com.example.auth.entity.ActivityParticipant;
import com.example.auth.entity.ActivityReport;
import com.example.auth.entity.User;
import com.example.auth.service.UserService;
import com.example.auth.service.ActivityService;
import com.example.auth.service.LocationService;
import com.example.auth.repository.UserRepository;
import com.example.chat.entity.UserPermission;
import com.example.chat.repository.UserPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "*")
public class ActivityController {
    
    @Autowired
    private ActivityService activityService;

    @Autowired
    private UserService userService;
    
    @Autowired
    private LocationService locationService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private UserPermissionRepository userPermissionRepository;
    
    /**
     * 创建活动
     */
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createActivity(
            @RequestBody ActivityCreateRequest request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            System.out.println("收到创建活动请求: " + request.getTitle());
            System.out.println("开始时间: " + request.getStartTime());
            System.out.println("结束时间: " + request.getEndTime());
            
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            if (userId == null) {
                response.put("code", 401);
                response.put("message", "用户未登录或不存在");
                return ResponseEntity.ok(response);
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.put("code", 404);
                response.put("message", "用户不存在");
                return ResponseEntity.ok(response);
            }
            if (user.getRealNameVerified() == null || !user.getRealNameVerified()) {
                response.put("code", 403);
                response.put("message", "请先完成实名认证后再发布活动");
                return ResponseEntity.ok(response);
            }

            Activity activity = activityService.createActivity(request, userId);
            
            response.put("code", 200);
            response.put("message", "活动创建成功");
            response.put("data", activity);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "创建失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }

    }
    
    /**
     * 发布活动（提交审核）
     */
    @PostMapping("/{activityId}/publish")
    public ResponseEntity<Map<String, Object>> publishActivity(
            @PathVariable Long activityId,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            if (userId == null) {
                response.put("code", 401);
                response.put("message", "用户未登录或不存在");
                return ResponseEntity.ok(response);
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                response.put("code", 404);
                response.put("message", "用户不存在");
                return ResponseEntity.ok(response);
            }
            if (user.getRealNameVerified() == null || !user.getRealNameVerified()) {
                response.put("code", 403);
                response.put("message", "请先完成实名认证后再发布活动");
                return ResponseEntity.ok(response);
            }

            Activity activity = activityService.publishActivity(activityId, userId);
            
            response.put("code", 200);
            response.put("message", "活动已提交审核");
            response.put("data", activity);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "发布失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }

    }
    
    /**
     * 获取同城活动
     */
    @GetMapping("/local")
    public ResponseEntity<Map<String, Object>> getLocalActivities(
            @RequestParam(required = false) String city,
            HttpServletRequest request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 如果没有提供城市，尝试从IP获取
            if (city == null || city.trim().isEmpty()) {
                String clientIp = getClientIpAddress(request);
                city = locationService.getCityFromIp(clientIp);
            }
            
            List<Activity> activities = activityService.getLocalActivities(city);
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", Map.of(
                "city", city != null ? city : "未知",
                "activities", activities
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    private boolean canViewUserMoments(Long ownerId, Long viewerId) {
        if (ownerId == null || viewerId == null) {
            return false;
        }
        if (ownerId.equals(viewerId)) {
            return true;
        }

        // 1. 检查用户的全局隐私设置
        User owner = userRepository.findById(ownerId).orElse(null);
        if (owner != null) {
            // 如果用户设置了允许陌生人查看（或者未设置默认允许），则直接通过
            if (owner.getAllowStrangerViewDynamic() == null || Boolean.TRUE.equals(owner.getAllowStrangerViewDynamic())) {
                return true;
            }
        }

        // 2. 否则检查特定权限（如好友关系）
        return userPermissionRepository
                .findByPermissionOwnerAndTargetUser(ownerId, viewerId)
                .map(permission ->
                        permission.getPermissionLevel() == UserPermission.PermissionLevel.full_access
                                || Boolean.TRUE.equals(permission.getCanViewMoments())
                )
                .orElse(false);
    }
    
    /**
     * 获取被举报的活动（管理员）
     */
    @GetMapping("/admin/reported")
    public ResponseEntity<Map<String, Object>> getReportedActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Map<String, Object> response = new HashMap<>();

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Activity> activities = activityService.getReportedActivities(pageable);

            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", Map.of(
                "content", activities.getContent(),
                "totalElements", activities.getTotalElements(),
                "totalPages", activities.getTotalPages(),
                "currentPage", activities.getNumber()
            ));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取推荐活动
     */
    @GetMapping("/recommended")
    public ResponseEntity<Map<String, Object>> getRecommendedActivities() {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Activity> activities = activityService.getRecommendedActivities();
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", activities);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取我的活动
     */
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getMyActivities(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            List<Activity> activities = activityService.getMyActivities(userId);
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", activities);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取当前用户参与的活动列表
     */
    @GetMapping("/my/participated")
    public ResponseEntity<Map<String, Object>> getMyParticipatedActivities(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            List<Activity> activities = activityService.getParticipatedActivities(userId);
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", activities);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 根据用户ID获取其参与的活动列表
     */
    @GetMapping("/participated")
    public ResponseEntity<Map<String, Object>> getUserParticipatedActivities(@RequestParam Long userId,
                                                                             Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        try {
            Long viewerId = null;
            if (authentication != null && authentication.isAuthenticated()) {
                String phone = authentication.getName();
                viewerId = userService.getUserIdByPhone(phone);
            }

            if (viewerId == null) {
                response.put("code", 401);
                response.put("message", "请先登录");
                response.put("data", List.of());
                response.put("isPrivacyProtected", true);
                return ResponseEntity.ok(response);
            }

            // 自己查看自己，始终允许
            if (!viewerId.equals(userId)) {
                boolean allowed = canViewUserMoments(userId, viewerId);
                if (!allowed) {
                    response.put("code", 403);
                    response.put("message", "对方开启了隐私保护，动态不可见");
                    // 返回空列表的同时，带上隐私保护标记
                    response.put("data", List.of());
                    response.put("isPrivacyProtected", true);
                    return ResponseEntity.ok(response);
                }
            }

            List<Activity> activities = activityService.getParticipatedActivities(userId);

            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", activities);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取活动详情
     */
    @GetMapping("/{activityId}")
    public ResponseEntity<Map<String, Object>> getActivityDetail(
            @PathVariable Long activityId,
            Authentication authentication) {
        
        System.out.println("获取活动详情请求: activityId = " + activityId);
        Map<String, Object> response = new HashMap<>();
        
        try {
            Optional<Activity> activity = activityService.getActivityDetail(activityId);
            System.out.println("活动查询结果: " + (activity.isPresent() ? "找到活动" : "活动不存在"));
            
            if (activity.isPresent()) {
                System.out.println("准备返回活动数据: " + activity.get().getTitle());

                // 获取该活动的举报记录
                List<ActivityReport> reports = activityService.getActivityReports(activityId);
                
                response.put("code", 200);
                response.put("message", "获取成功");
                response.put("data", Map.of(
                    "activity", activity.get(),
                    "reports", reports
                ));
            } else {
                response.put("code", 404);
                response.put("message", "活动不存在");
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("获取活动详情异常: " + e.getClass().getSimpleName() + " - " + e.getMessage());
            e.printStackTrace();
            response.put("code", 500);
            response.put("message", "获取失败: " + (e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName()));
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 报名参加活动
     */
    @PostMapping("/{activityId}/register")
    public ResponseEntity<Map<String, Object>> registerForActivity(
            @PathVariable Long activityId,
            @RequestBody ParticipantRegistrationRequest request,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            ActivityParticipant participant = activityService.registerForActivity(activityId, userId, request);
            
            response.put("code", 200);
            response.put("message", "报名成功");
            response.put("data", participant);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "报名失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 退出活动
     */
    @DeleteMapping("/{activityId}/quit")
    public ResponseEntity<Map<String, Object>> quitActivity(
            @PathVariable Long activityId,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            activityService.quitActivity(activityId, userId);
            
            response.put("code", 200);
            response.put("message", "已退出活动");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "退出失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 审核参与者（活动组织者）
     */
    @PostMapping("/participants/{participantId}/approve")
    public ResponseEntity<Map<String, Object>> approveParticipant(
            @PathVariable Long participantId,
            @RequestParam boolean approve,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            ActivityParticipant participant = activityService.approveParticipant(participantId, userId, approve);
            
            response.put("code", 200);
            response.put("message", approve ? "已通过审核" : "已拒绝申请");
            response.put("data", participant);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "操作失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取待审核的参与者
     */
    @GetMapping("/participants/pending")
    public ResponseEntity<Map<String, Object>> getPendingParticipants(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            List<ActivityParticipant> participants = activityService.getPendingParticipants(userId);

            List<ActivityParticipantReviewResponse> result = participants.stream().map(p -> {
                ActivityParticipantReviewResponse dto = new ActivityParticipantReviewResponse();
                dto.setId(p.getId());
                dto.setActivityId(p.getActivityId());

                Activity activity = p.getActivity();
                if (activity != null) {
                    dto.setActivityTitle(activity.getTitle());
                    dto.setActivityStartTime(activity.getStartTime());
                    dto.setActivityEndTime(activity.getEndTime());
                }

                User user = p.getUser();
                if (user != null) {
                    dto.setUserId(user.getUserId());
                    dto.setUsername(user.getUsername());
                    dto.setPhone(user.getNumber());
                }

                dto.setRegistrationTime(p.getRegistrationTime());
                dto.setEmergencyContact(p.getEmergencyContact());
                dto.setEmergencyPhone(p.getEmergencyPhone());
                dto.setNotes(p.getNotes());

                return dto;
            }).collect(Collectors.toList());
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", result);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取活动参与者列表
     */
    @GetMapping("/{activityId}/participants")
    public ResponseEntity<Map<String, Object>> getActivityParticipants(
            @PathVariable Long activityId,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            List<ActivityParticipant> participants = activityService.getActivityParticipants(activityId, userId);
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", participants);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 举报活动
     */
    @PostMapping("/{activityId}/report")
    public ResponseEntity<Map<String, Object>> reportActivity(
            @PathVariable Long activityId,
            @RequestParam String reason,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);
            activityService.reportActivity(activityId, userId, reason);
            
            response.put("code", 200);
            response.put("message", "举报成功，我们会尽快处理");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "举报失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 管理员审核活动
     */
    @PostMapping("/{activityId}/audit")
    public ResponseEntity<Map<String, Object>> auditActivity(
            @PathVariable Long activityId,
            @RequestParam boolean approve,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 这里应该检查管理员权限，暂时简化
            Activity activity = activityService.auditActivity(activityId, approve, reason);
            
            response.put("code", 200);
            response.put("message", approve ? "活动已通过审核" : "活动已被拒绝");
            response.put("data", activity);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "审核失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }
    
    /**
     * 获取待审核的活动（管理员）
     */
    @GetMapping("/admin/pending")
    public ResponseEntity<Map<String, Object>> getPendingActivities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Activity> activities = activityService.getPendingActivities(pageable);
            
            response.put("code", 200);
            response.put("message", "获取成功");
            response.put("data", Map.of(
                "content", activities.getContent(),
                "totalElements", activities.getTotalElements(),
                "totalPages", activities.getTotalPages(),
                "currentPage", activities.getNumber()
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "获取失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 上传活动媒体文件（图片或视频），返回可访问的URL
     */
    @PostMapping(value = "/media/upload", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> uploadActivityMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "type", defaultValue = "image") String type) {

        Map<String, Object> response = new HashMap<>();

        try {
            if (file == null || file.isEmpty()) {
                response.put("code", 400);
                response.put("message", "上传文件不能为空");
                return ResponseEntity.ok(response);
            }

            String normalizedType = "video".equalsIgnoreCase(type) ? "videos" : "images";

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }

            String fileName = java.util.UUID.randomUUID().toString().replace("-", "") + extension;

            Path baseDir = Paths.get("uploads", "activities", normalizedType);
            Files.createDirectories(baseDir);
            Path targetPath = baseDir.resolve(fileName);

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String url = "/api/activities/media/" + normalizedType + "/" + fileName;

            Map<String, Object> data = new HashMap<>();
            data.put("url", url);
            data.put("type", "videos".equals(normalizedType) ? "video" : "image");
            data.put("originalFilename", originalFilename);
            data.put("size", file.getSize());

            response.put("code", 200);
            response.put("message", "上传成功");
            response.put("data", data);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("code", 500);
            response.put("message", "上传失败: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * 获取活动媒体文件内容
     */
    @GetMapping("/media/{type}/{fileName:.+}")
    public ResponseEntity<byte[]> getActivityMedia(
            @PathVariable("type") String type,
            @PathVariable("fileName") String fileName) {

        try {
            String normalizedType = "videos".equalsIgnoreCase(type) ? "videos" : "images";
            Path filePath = Paths.get("uploads", "activities", normalizedType).resolve(fileName).normalize();

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            byte[] data = Files.readAllBytes(filePath);
            String contentType = Files.probeContentType(filePath);
            if (contentType == null || contentType.isBlank()) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(data);
        } catch (IOException e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    /**
     * 获取客户端IP地址
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
}


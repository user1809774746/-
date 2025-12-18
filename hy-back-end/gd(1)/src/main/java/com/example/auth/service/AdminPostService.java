package com.example.auth.service;

import com.example.auth.entity.Administrator;
import com.example.auth.entity.TravelPost;
import com.example.auth.entity.User;
import com.example.auth.entity.UserPostComment;
import com.example.auth.entity.UserPostCommentReport;
import com.example.auth.entity.UserPostReport;
import com.example.auth.entity.UserTravelPost;
import com.example.auth.repository.AdministratorRepository;
import com.example.auth.repository.TravelPostRepository;
import com.example.auth.repository.UserPostCommentReportRepository;
import com.example.auth.repository.UserPostCommentRepository;
import com.example.auth.repository.UserPostReportRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.UserTravelPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 管理员帖子审核服务
 */
@Service
public class AdminPostService {

    @Autowired
    private TravelPostRepository travelPostRepository;

    @Autowired
    private UserTravelPostRepository userPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private UserPostCommentRepository commentRepository;

    @Autowired
    private UserPostCommentReportRepository commentReportRepository;

    @Autowired
    private UserPostReportRepository postReportRepository;

    /**
     * 获取待审核帖子列表
     */
    public Map<String, Object> getPendingPosts(Integer page, Integer pageSize) {
        try {
            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdTime"));
            
            Page<TravelPost> postsPage = travelPostRepository.findByAuditStatus("pending", pageable);
            
            List<Map<String, Object>> postsList = postsPage.getContent().stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("posts", postsList);
            result.put("totalCount", postsPage.getTotalElements());
            result.put("totalPages", postsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取待审核帖子失败: " + e.getMessage());
        }
    }

    /**
     * 获取所有帖子列表（含筛选）
     */
    public Map<String, Object> getAllPosts(String auditStatus, String status, Integer page, Integer pageSize) {
        try {
            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdTime"));
            
            Page<TravelPost> postsPage;
            
            if (auditStatus != null && !auditStatus.isEmpty() && status != null && !status.isEmpty()) {
                // 同时按审核状态和发布状态筛选
                postsPage = travelPostRepository.findByAuditStatusAndStatus(auditStatus, status, pageable);
            } else if (auditStatus != null && !auditStatus.isEmpty()) {
                // 只按审核状态筛选
                postsPage = travelPostRepository.findByAuditStatus(auditStatus, pageable);
            } else if (status != null && !status.isEmpty()) {
                // 只按发布状态筛选
                postsPage = travelPostRepository.findByStatus(status, pageable);
            } else {
                // 获取所有帖子
                postsPage = travelPostRepository.findAll(pageable);
            }
            
            List<Map<String, Object>> postsList = postsPage.getContent().stream()
                    .map(this::convertToMap)
                    .collect(Collectors.toList());

            Map<String, Object> result = new HashMap<>();
            result.put("posts", postsList);
            result.put("totalCount", postsPage.getTotalElements());
            result.put("totalPages", postsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取帖子列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取评论举报列表（按状态分页）
     */
    public Map<String, Object> getCommentReports(String status, Integer page, Integer pageSize) {
        try {
            if (status == null || status.trim().isEmpty()) {
                status = "pending";
            }

            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdTime"));

            Page<UserPostCommentReport> reportsPage = commentReportRepository.findByStatus(status, pageable);

            List<Map<String, Object>> reportsList = new ArrayList<>();
            for (UserPostCommentReport report : reportsPage.getContent()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", report.getId());
                map.put("commentId", report.getCommentId());
                map.put("postId", report.getPostId());
                map.put("reporterId", report.getReporterId());
                map.put("reportedUserId", report.getReportedUserId());
                map.put("reportType", report.getReportType());
                map.put("reportReason", report.getReportReason());
                map.put("status", report.getStatus());
                map.put("handleResult", report.getHandleResult());
                map.put("createdTime", report.getCreatedTime());
                map.put("handleTime", report.getHandleTime());

                // 补充评论信息
                commentRepository.findById(report.getCommentId()).ifPresent(comment -> {
                    map.put("commentContent", comment.getCommentContent());
                    map.put("commentStatus", comment.getStatus());
                    map.put("commentUserId", comment.getUserId());
                    map.put("commentParentId", comment.getParentCommentId());
                });

                // 补充帖子标题
                travelPostRepository.findById(report.getPostId()).ifPresent(post -> {
                    map.put("postTitle", post.getTitle());
                });

                reportsList.add(map);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("reports", reportsList);
            result.put("totalCount", reportsPage.getTotalElements());
            result.put("totalPages", reportsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);
            result.put("status", status);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取评论举报列表失败: " + e.getMessage());
        }
    }

    public Map<String, Object> getPostReports(String status, Integer page, Integer pageSize) {
        try {
            if (status == null || status.trim().isEmpty()) {
                status = "pending";
            }

            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "createdTime"));

            Page<UserPostReport> reportsPage = postReportRepository.findByStatus(status, pageable);

            List<Map<String, Object>> reportsList = new ArrayList<>();
            for (UserPostReport report : reportsPage.getContent()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", report.getId());
                map.put("postId", report.getPostId());
                map.put("reporterId", report.getReporterId());
                map.put("reportType", report.getReportType());
                map.put("reportReason", report.getReportReason());
                map.put("status", report.getStatus());
                map.put("handleResult", report.getHandleResult());
                map.put("createdTime", report.getCreatedTime());
                map.put("handleTime", report.getHandleTime());

                travelPostRepository.findById(report.getPostId()).ifPresent(post -> {
                    map.put("postTitle", post.getTitle());
                    map.put("postStatus", post.getStatus());
                    map.put("postAuditStatus", post.getAuditStatus());
                    map.put("publisherId", post.getPublisherId());
                });

                userRepository.findById(report.getReporterId()).ifPresent(user -> {
                    map.put("reporterPhone", user.getNumber());
                });

                reportsList.add(map);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("reports", reportsList);
            result.put("totalCount", reportsPage.getTotalElements());
            result.put("totalPages", reportsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);
            result.put("status", status);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取帖子举报列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取帖子详情
     */
    public Map<String, Object> getPostDetail(Long postId) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        Map<String, Object> result = convertToDetailMap(post);
        
        // 获取用户信息
        Optional<User> userOpt = userRepository.findById(post.getPublisherId());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("phone", user.getNumber());
            result.put("publisherInfo", userInfo);
        }

        return result;
    }

    /**
     * 审核通过帖子
     */
    @Transactional
    public Map<String, Object> approvePost(Long postId, String adminPhone) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 检查审核状态
        if ("approved".equals(post.getAuditStatus())) {
            throw new RuntimeException("帖子已经审核通过");
        }

        // 更新审核状态
        post.setAuditStatus("approved");
        post.setAuditTime(new Date());
        post.setAuditReason("审核通过");
        
        // 如果帖子状态是draft，自动改为published
        if ("draft".equals(post.getStatus())) {
            post.setStatus("published");
            post.setPublishedTime(new Date());
        }

        travelPostRepository.save(post);

        // 同时更新UserTravelPost状态
        Optional<UserTravelPost> userPostOpt = userPostRepository.findByTravelPostIdAndPublisherId(postId, post.getPublisherId());
        if (userPostOpt.isPresent()) {
            UserTravelPost userPost = userPostOpt.get();
            if ("draft".equals(userPost.getUserStatus())) {
                userPost.setUserStatus("published");
                userPost.setUserPublishedTime(new Date());
                userPostRepository.save(userPost);
            }
        }

        System.out.println("=== 管理员审核通过帖子 ===");
        System.out.println("帖子ID: " + postId);
        System.out.println("管理员: " + adminPhone);
        System.out.println("审核时间: " + post.getAuditTime());

        Map<String, Object> result = new HashMap<>();
        result.put("postId", postId);
        result.put("auditStatus", "approved");
        result.put("status", post.getStatus());
        result.put("auditTime", post.getAuditTime());
        result.put("message", "帖子审核通过");

        return result;
    }

    /**
     * 审核拒绝帖子
     */
    @Transactional
    public Map<String, Object> rejectPost(Long postId, String adminPhone, String reason) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 检查审核状态
        if ("rejected".equals(post.getAuditStatus())) {
            throw new RuntimeException("帖子已经被拒绝");
        }

        // 更新审核状态
        post.setAuditStatus("rejected");
        post.setAuditTime(new Date());
        post.setAuditReason(reason);
        
        // 帖子状态保持draft
        if (!"deleted".equals(post.getStatus())) {
            post.setStatus("draft");
        }

        travelPostRepository.save(post);

        System.out.println("=== 管理员拒绝帖子 ===");
        System.out.println("帖子ID: " + postId);
        System.out.println("管理员: " + adminPhone);
        System.out.println("拒绝原因: " + reason);
        System.out.println("审核时间: " + post.getAuditTime());

        Map<String, Object> result = new HashMap<>();
        result.put("postId", postId);
        result.put("auditStatus", "rejected");
        result.put("reason", reason);
        result.put("auditTime", post.getAuditTime());
        result.put("message", "帖子审核拒绝");

        return result;
    }

    /**
     * 删除帖子
     */
    @Transactional
    public void deletePost(Long postId, String adminPhone, String reason) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 更新帖子状态为deleted
        post.setStatus("deleted");
        post.setDeletedTime(new Date());
        post.setAuditReason(reason);
        travelPostRepository.save(post);

        // 更新用户帖子关联状态
        Optional<UserTravelPost> userPostOpt = userPostRepository.findByTravelPostIdAndPublisherId(postId, post.getPublisherId());
        if (userPostOpt.isPresent()) {
            UserTravelPost userPost = userPostOpt.get();
            userPost.setUserStatus("deleted");
            userPost.setUserDeletedTime(new Date());
            userPostRepository.save(userPost);
        }

        System.out.println("=== 管理员删除帖子 ===");
        System.out.println("帖子ID: " + postId);
        System.out.println("管理员: " + adminPhone);
        System.out.println("删除原因: " + reason);
    }

    /**
     * 处理评论举报
     * action: delete_comment 删除评论；reject 驳回举报
     */
    @Transactional
    public Map<String, Object> handleCommentReport(Long reportId, String action, String handleResult, String adminPhone) {
        if (reportId == null) {
            throw new RuntimeException("举报ID不能为空");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new RuntimeException("处理动作不能为空");
        }

        action = action.trim().toLowerCase();

        UserPostCommentReport report = commentReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("举报记录不存在"));

        if (!"pending".equals(report.getStatus())) {
            throw new RuntimeException("该举报已处理");
        }

        Administrator admin = administratorRepository.findByPhone(adminPhone)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        if (handleResult == null) {
            handleResult = "";
        }

        if ("delete_comment".equals(action)) {
            // 删除评论
            UserPostComment comment = commentRepository.findById(report.getCommentId()).orElse(null);
            if (comment != null && !"deleted".equals(comment.getStatus())) {
                comment.setStatus("deleted");
                commentRepository.save(comment);

                // 更新帖子评论数量（按 normal 状态重新统计）
                Long postId = comment.getPostId();
                TravelPost post = travelPostRepository.findById(postId)
                        .orElseThrow(() -> new RuntimeException("帖子不存在"));
                Long normalCount = commentRepository.countByPostIdAndStatus(postId, "normal");
                post.setCommentCount(normalCount != null ? normalCount.intValue() : 0);
                travelPostRepository.save(post);

                // 更新父评论回复数量
                if (comment.getParentCommentId() != null) {
                    Long parentId = comment.getParentCommentId();
                    UserPostComment parent = commentRepository.findById(parentId).orElse(null);
                    if (parent != null) {
                        Long replyCount = commentRepository.countByParentCommentIdAndStatus(parentId, "normal");
                        parent.setReplyCount(replyCount != null ? replyCount.intValue() : 0);
                        commentRepository.save(parent);
                    }
                }
            }

            report.setStatus("resolved");
            if (handleResult.isEmpty()) {
                handleResult = "评论已删除";
            }
        } else if ("reject".equals(action)) {
            report.setStatus("rejected");
            if (handleResult.isEmpty()) {
                handleResult = "举报不成立";
            }
        } else {
            throw new RuntimeException("不支持的处理动作: " + action);
        }

        report.setHandlerId(admin.getAdminId());
        report.setHandleResult(handleResult);
        report.setHandleTime(new Date());
        commentReportRepository.save(report);

        Map<String, Object> result = new HashMap<>();
        result.put("reportId", report.getId());
        result.put("commentId", report.getCommentId());
        result.put("action", action);
        result.put("status", report.getStatus());
        result.put("handleResult", report.getHandleResult());
        result.put("handleTime", report.getHandleTime());

        return result;
    }

    @Transactional
    public Map<String, Object> handlePostReport(Long reportId, String action, String handleResult, String adminPhone) {
        if (reportId == null) {
            throw new RuntimeException("举报ID不能为空");
        }
        if (action == null || action.trim().isEmpty()) {
            throw new RuntimeException("处理动作不能为空");
        }

        action = action.trim().toLowerCase();

        UserPostReport report = postReportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("举报记录不存在"));

        if (!"pending".equals(report.getStatus())) {
            throw new RuntimeException("该举报已处理");
        }

        Administrator admin = administratorRepository.findByPhone(adminPhone)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        if (handleResult == null) {
            handleResult = "";
        }

        if ("delete_post".equals(action)) {
            String reason = handleResult.isEmpty() ? "根据举报删除帖子" : handleResult;
            deletePost(report.getPostId(), adminPhone, reason);

            report.setStatus("resolved");
            if (handleResult.isEmpty()) {
                handleResult = "帖子已删除";
            }
        } else if ("reject".equals(action)) {
            report.setStatus("rejected");
            if (handleResult.isEmpty()) {
                handleResult = "举报不成立";
            }
        } else {
            throw new RuntimeException("不支持的处理动作: " + action);
        }

        report.setHandlerId(admin.getAdminId());
        report.setHandleResult(handleResult);
        report.setHandleTime(new Date());
        postReportRepository.save(report);

        Map<String, Object> result = new HashMap<>();
        result.put("reportId", report.getId());
        result.put("postId", report.getPostId());
        result.put("action", action);
        result.put("status", report.getStatus());
        result.put("handleResult", report.getHandleResult());
        result.put("handleTime", report.getHandleTime());

        return result;
    }

    /**
     * 设置精选
     */
    @Transactional
    public void setFeatured(Long postId, boolean isFeatured, String adminPhone) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 只有已审核通过的帖子才能设置精选
        if (!"approved".equals(post.getAuditStatus())) {
            throw new RuntimeException("只有审核通过的帖子才能设置为精选");
        }

        post.setIsFeatured(isFeatured);
        travelPostRepository.save(post);

        System.out.println("=== 管理员设置精选 ===");
        System.out.println("帖子ID: " + postId);
        System.out.println("管理员: " + adminPhone);
        System.out.println("精选状态: " + isFeatured);
    }

    /**
     * 设置置顶
     */
    @Transactional
    public void setTop(Long postId, boolean isTop, String adminPhone) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 只有已审核通过的帖子才能置顶
        if (!"approved".equals(post.getAuditStatus())) {
            throw new RuntimeException("只有审核通过的帖子才能置顶");
        }

        post.setIsTop(isTop);
        travelPostRepository.save(post);

        System.out.println("=== 管理员设置置顶 ===");
        System.out.println("帖子ID: " + postId);
        System.out.println("管理员: " + adminPhone);
        System.out.println("置顶状态: " + isTop);
    }

    /**
     * 获取统计信息
     */
    public Map<String, Object> getStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        // 待审核数量
        long pendingCount = travelPostRepository.countByAuditStatus("pending");
        statistics.put("pendingCount", pendingCount);

        // 已通过数量
        long approvedCount = travelPostRepository.countByAuditStatus("approved");
        statistics.put("approvedCount", approvedCount);

        // 已拒绝数量
        long rejectedCount = travelPostRepository.countByAuditStatus("rejected");
        statistics.put("rejectedCount", rejectedCount);

        // 总帖子数
        long totalCount = travelPostRepository.count();
        statistics.put("totalCount", totalCount);

        // 已发布数量
        long publishedCount = travelPostRepository.countByStatus("published");
        statistics.put("publishedCount", publishedCount);

        // 草稿数量
        long draftCount = travelPostRepository.countByStatus("draft");
        statistics.put("draftCount", draftCount);

        // 已删除数量
        long deletedCount = travelPostRepository.countByStatus("deleted");
        statistics.put("deletedCount", deletedCount);

        // 精选数量
        long featuredCount = travelPostRepository.countByIsFeatured(true);
        statistics.put("featuredCount", featuredCount);

        // 置顶数量
        long topCount = travelPostRepository.countByIsTop(true);
        statistics.put("topCount", topCount);

        return statistics;
    }

    /**
     * 转换为Map（列表用）
     */
    private Map<String, Object> convertToMap(TravelPost post) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", post.getId());
        map.put("title", post.getTitle());
        map.put("summary", post.getSummary());
        map.put("coverImage", post.getCoverImage());
        map.put("publisherId", post.getPublisherId());
        map.put("status", post.getStatus());
        map.put("auditStatus", post.getAuditStatus());
        map.put("auditReason", post.getAuditReason());
        map.put("auditTime", post.getAuditTime());
        map.put("isFeatured", post.getIsFeatured());
        map.put("isTop", post.getIsTop());
        map.put("viewCount", post.getViewCount());
        map.put("likeCount", post.getLikeCount());
        map.put("commentCount", post.getCommentCount());
        map.put("favoriteCount", post.getFavoriteCount());
        map.put("createdTime", post.getCreatedTime());
        map.put("publishedTime", post.getPublishedTime());

        // 获取发布者信息
        Optional<User> userOpt = userRepository.findById(post.getPublisherId());
        if (userOpt.isPresent()) {
            map.put("publisherPhone", userOpt.get().getNumber());
        }

        return map;
    }

    /**
     * 转换为详细Map
     */
    private Map<String, Object> convertToDetailMap(TravelPost post) {
        Map<String, Object> map = convertToMap(post);
        // 添加详细内容
        map.put("content", post.getContent());
        map.put("contentType", post.getContentType());
        map.put("postType", post.getPostType());
        map.put("category", post.getCategory());
        map.put("images", post.getImages());
        map.put("videos", post.getVideos());
        map.put("destinationName", post.getDestinationName());
        map.put("destinationCity", post.getDestinationCity());
        map.put("destinationProvince", post.getDestinationProvince());
        map.put("destinationCountry", post.getDestinationCountry());
        map.put("travelStartDate", post.getTravelStartDate());
        map.put("travelEndDate", post.getTravelEndDate());
        map.put("travelDays", post.getTravelDays());
        map.put("travelBudget", post.getTravelBudget());
        map.put("actualCost", post.getActualCost());
        map.put("travelSeason", post.getTravelSeason());
        map.put("travelStyle", post.getTravelStyle());
        map.put("tags", post.getTags());
        map.put("keywords", post.getKeywords());
        map.put("isOriginal", post.getIsOriginal());
        map.put("shareCount", post.getShareCount());
        map.put("updatedTime", post.getUpdatedTime());
        map.put("deletedTime", post.getDeletedTime());

        return map;
    }
}


package com.example.auth.service;

import com.example.auth.dto.*;
import com.example.auth.entity.*;
import com.example.auth.repository.*;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
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
 * 用户帖子服务类 - 支持双表结构
 */
@Service
public class UserPostService {

    private static final Logger logger = LoggerFactory.getLogger(UserPostService.class);

    @Autowired
    private UserTravelPostRepository userPostRepository;

    @Autowired
    private TravelPostRepository travelPostRepository;

    @Autowired
    private UserPostDraftRepository draftRepository;

    @Autowired
    private UserPostLikeRepository likeRepository;

    @Autowired
    private UserPostCommentRepository commentRepository;

    @Autowired
    private UserPostCommentReportRepository commentReportRepository;

    @Autowired
    private UserPostReportRepository postReportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // ...

    /**
     * 举报帖子
     */
    @Transactional
    public void reportPost(String phone, Long postId, PostReportRequest request) {
        if (postId == null) {
            throw new RuntimeException("帖子ID不能为空");
        }
        if (request == null) {
            throw new RuntimeException("请求参数不能为空");
        }
        if (request.getReportType() == null || request.getReportType().trim().isEmpty()) {
            throw new RuntimeException("举报类型不能为空");
        }

        User reporter = getUserByPhone(phone);

        boolean existsPending = postReportRepository.existsByPostIdAndReporterIdAndStatus(postId, reporter.getUserId(), "pending");
        if (existsPending) {
            throw new RuntimeException("您已举报过该帖子，正在处理中");
        }

        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        UserPostReport report = new UserPostReport();
        report.setPostId(post.getId());
        report.setReporterId(reporter.getUserId());
        report.setReportType(request.getReportType());
        report.setReportReason(request.getReportReason());

        if (request.getReportEvidence() != null && !request.getReportEvidence().isEmpty()) {
            try {
                report.setReportEvidence(objectMapper.writeValueAsString(request.getReportEvidence()));
            } catch (JsonProcessingException e) {
                // 忽略证据序列化错误
            }
        }

        report.setStatus("pending");
        postReportRepository.save(report);
    }

    @Transactional
    public void reportComment(String phone, CommentReportRequest request) {
        if (request == null || request.getCommentId() == null) {
            throw new RuntimeException("评论ID不能为空");
        }

        if (request.getReportReason() == null || request.getReportReason().trim().isEmpty()) {
            throw new RuntimeException("举报原因不能为空");
        }

        if (request.getReportType() == null || request.getReportType().trim().isEmpty()) {
            request.setReportType("comment_inappropriate");
        }

        User reporter = getUserByPhone(phone);

        UserPostComment comment = commentRepository.findById(request.getCommentId())
                .orElseThrow(() -> new RuntimeException("评论不存在"));

        UserPostCommentReport report = new UserPostCommentReport();
        report.setCommentId(comment.getId());
        report.setPostId(comment.getPostId());
        report.setReporterId(reporter.getUserId());
        report.setReportedUserId(comment.getUserId());
        report.setReportType(request.getReportType());
        report.setReportReason(request.getReportReason());

        if (request.getReportEvidence() != null && !request.getReportEvidence().isEmpty()) {
            try {
                report.setReportEvidence(objectMapper.writeValueAsString(request.getReportEvidence()));
            } catch (JsonProcessingException e) {
                // 忽略证据序列化错误
            }
        }

        report.setStatus("pending");
        commentReportRepository.save(report);
    }

    @Transactional
    public PostResponse createPost(String phone, PostCreateRequest request) {
        User user = getUserByPhone(phone);

        TravelPost travelPost = new TravelPost();
        copyRequestToTravelPost(request, travelPost);
        travelPost.setPublisherId(user.getUserId());
        travelPost.setStatus("draft");
        travelPost.setAuditStatus("pending");

        TravelPost savedTravelPost = travelPostRepository.save(travelPost);

        UserTravelPost userPost = new UserTravelPost();
        userPost.setTravelPostId(savedTravelPost.getId());
        userPost.setPublisherId(user.getUserId());
        userPost.setPublisherNickname(user.getNumber());
        userPost.setUserStatus("draft");
        userPost.setIsOriginal(request.getIsOriginal() != null ? request.getIsOriginal() : Boolean.TRUE);

        UserTravelPost savedUserPost = userPostRepository.save(userPost);

        return convertToResponse(savedTravelPost, savedUserPost, user.getUserId());
    }

    @Transactional
    public PostResponse publishPost(String phone, Long postId) {
        User user = getUserByPhone(phone);

        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        if (!user.getUserId().equals(post.getPublisherId())) {
            throw new RuntimeException("无权操作该帖子");
        }

        if ("deleted".equals(post.getStatus())) {
            throw new RuntimeException("帖子已删除");
        }

        post.setStatus("published");
        if (post.getPublishedTime() == null) {
            post.setPublishedTime(new Date());
        }
        post.setAuditStatus("pending");
        TravelPost savedPost = travelPostRepository.save(post);

        UserTravelPost userPost = userPostRepository
                .findByTravelPostIdAndPublisherId(postId, user.getUserId())
                .orElseGet(() -> {
                    UserTravelPost up = new UserTravelPost();
                    up.setTravelPostId(postId);
                    up.setPublisherId(user.getUserId());
                    up.setPublisherNickname(user.getNumber());
                    return up;
                });
        userPost.setUserStatus("published");
        if (userPost.getUserPublishedTime() == null) {
            userPost.setUserPublishedTime(new Date());
        }
        UserTravelPost savedUserPost = userPostRepository.save(userPost);

        return convertToResponse(savedPost, savedUserPost, user.getUserId());
    }

    @Transactional
    public PostResponse updatePost(String phone, Long postId, PostCreateRequest request) {
        User user = getUserByPhone(phone);

        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        if (!user.getUserId().equals(post.getPublisherId())) {
            throw new RuntimeException("无权操作该帖子");
        }
        if ("deleted".equals(post.getStatus())) {
            throw new RuntimeException("帖子已删除，无法编辑");
        }

        copyRequestToTravelPost(request, post);
        TravelPost savedPost = travelPostRepository.save(post);

        UserTravelPost userPost = userPostRepository
                .findByTravelPostIdAndPublisherId(postId, user.getUserId())
                .orElse(null);

        return convertToResponse(savedPost, userPost, user.getUserId());
    }

    @Transactional
    public void deletePost(String phone, Long postId) {
        User user = getUserByPhone(phone);

        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        if (!user.getUserId().equals(post.getPublisherId())) {
            throw new RuntimeException("无权删除该帖子");
        }

        if ("deleted".equals(post.getStatus())) {
            return;
        }

        post.setStatus("deleted");
        post.setDeletedTime(new Date());
        travelPostRepository.save(post);

        userPostRepository.findByTravelPostIdAndPublisherId(postId, user.getUserId())
                .ifPresent(userPost -> {
                    userPost.setUserStatus("deleted");
                    userPost.setUserDeletedTime(new Date());
                    userPostRepository.save(userPost);
                });
    }

    public PostResponse getPostDetail(Long postId, String viewerPhone) {
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        if ("deleted".equals(post.getStatus())) {
            throw new RuntimeException("帖子已删除");
        }

        Long currentUserId = getCurrentUserId(viewerPhone);

        UserTravelPost userPost = userPostRepository.findByTravelPostId(postId).orElse(null);

        if (currentUserId != null && !currentUserId.equals(post.getPublisherId())) {
            if (post.getViewCount() == null) {
                post.setViewCount(0);
            }
            post.setViewCount(post.getViewCount() + 1);
            travelPostRepository.save(post);

            try {
                notificationService.createViewNotification(postId, currentUserId);
            } catch (Exception e) {
                // 忽略通知错误
            }
        }

        return convertToResponse(post, userPost, currentUserId);
    }

    public List<PostResponse> getUserPosts(String phone, String status) {
        User user = getUserByPhone(phone);

        List<TravelPost> posts;
        if (status == null || status.trim().isEmpty()) {
            posts = travelPostRepository.findByPublisherIdOrderByCreatedTimeDesc(user.getUserId());
        } else {
            posts = travelPostRepository.findByPublisherIdAndStatusOrderByPublishedTimeDesc(user.getUserId(), status);
        }

        List<PostResponse> responses = new ArrayList<>();
        for (TravelPost post : posts) {
            UserTravelPost userPost = userPostRepository
                    .findByTravelPostIdAndPublisherId(post.getId(), user.getUserId())
                    .orElse(null);
            responses.add(convertToResponse(post, userPost, user.getUserId()));
        }
        return responses;
    }

    public List<PostResponse> getUserPostsByUserId(Long userId, String status, String viewerPhone) {
        List<TravelPost> posts;
        if (status == null || status.trim().isEmpty()) {
            posts = travelPostRepository.findByPublisherIdOrderByCreatedTimeDesc(userId);
        } else {
            posts = travelPostRepository.findByPublisherIdAndStatusOrderByPublishedTimeDesc(userId, status);
        }

        Long viewerId = getCurrentUserId(viewerPhone);

        List<PostResponse> responses = new ArrayList<>();
        for (TravelPost post : posts) {
            UserTravelPost userPost = userPostRepository
                    .findByTravelPostIdAndPublisherId(post.getId(), userId)
                    .orElse(null);
            responses.add(convertToResponse(post, userPost, viewerId));
        }
        return responses;
    }

    public Map<String, Object> getPublicPosts(String postType, String destinationCity, String viewerPhone,
                                              Integer page, Integer pageSize) {
        try {
            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "publishedTime"));

            Page<TravelPost> postsPage;
            if (postType != null && !postType.trim().isEmpty()) {
                postsPage = travelPostRepository.findByPostTypeAndStatus(postType, "published", pageable);
            } else if (destinationCity != null && !destinationCity.trim().isEmpty()) {
                postsPage = travelPostRepository.findByDestinationCityAndStatus(destinationCity, "published", pageable);
            } else {
                postsPage = travelPostRepository.findByStatus("published", pageable);
            }

            Long currentUserId = getCurrentUserId(viewerPhone);

            List<PostResponse> list = new ArrayList<>();
            for (TravelPost post : postsPage.getContent()) {
                UserTravelPost userPost = userPostRepository
                        .findByTravelPostId(post.getId())
                        .orElse(null);
                list.add(convertToResponse(post, userPost, currentUserId));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("list", list);
            result.put("posts", list);
            result.put("total", postsPage.getTotalElements());
            result.put("totalCount", postsPage.getTotalElements());
            result.put("totalPages", postsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);
            result.put("postType", postType);
            result.put("destinationCity", destinationCity);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("获取公开帖子失败: " + e.getMessage());
        }
    }

    public Map<String, Object> searchPosts(String keyword, String viewerPhone,
                                           Integer page, Integer pageSize) {
        try {
            Pageable pageable = PageRequest.of(page - 1, pageSize, Sort.by(Sort.Direction.DESC, "publishedTime"));

            Page<TravelPost> postsPage = travelPostRepository.searchPosts(keyword, "published", pageable);

            Long currentUserId = getCurrentUserId(viewerPhone);

            List<PostResponse> list = new ArrayList<>();
            for (TravelPost post : postsPage.getContent()) {
                UserTravelPost userPost = userPostRepository
                        .findByTravelPostId(post.getId())
                        .orElse(null);
                list.add(convertToResponse(post, userPost, currentUserId));
            }

            Map<String, Object> result = new HashMap<>();
            result.put("list", list);
            result.put("posts", list);
            result.put("total", postsPage.getTotalElements());
            result.put("totalCount", postsPage.getTotalElements());
            result.put("totalPages", postsPage.getTotalPages());
            result.put("currentPage", page);
            result.put("pageSize", pageSize);

            return result;
        } catch (Exception e) {
            throw new RuntimeException("搜索帖子失败: " + e.getMessage());
        }
    }
    @Transactional
    public Map<String, Object> toggleLike(String phone, Long postId) {
        User user = getUserByPhone(phone);

        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        Long userId = user.getUserId();

        boolean liked;
        Optional<UserPostLike> likeOpt = likeRepository.findByPostIdAndUserId(postId, userId);
        if (likeOpt.isPresent()) {
            likeRepository.delete(likeOpt.get());
            liked = false;
            if (post.getLikeCount() == null) {
                post.setLikeCount(0);
            }
            if (post.getLikeCount() > 0) {
                post.setLikeCount(post.getLikeCount() - 1);
            }
        } else {
            UserPostLike like = new UserPostLike();
            like.setPostId(postId);
            like.setUserId(userId);
            likeRepository.save(like);
            liked = true;
            if (post.getLikeCount() == null) {
                post.setLikeCount(0);
            }
            post.setLikeCount(post.getLikeCount() + 1);
        }
        travelPostRepository.save(post);

        Map<String, Object> result = new HashMap<>();
        result.put("isLiked", liked);
        result.put("likeCount", post.getLikeCount());
        return result;
    }

    public List<CommentResponse> getPostComments(Long postId) {
        if (postId == null) {
            throw new RuntimeException("帖子ID不能为空");
        }

        List<UserPostComment> topComments = commentRepository
                .findByPostIdAndParentCommentIdIsNullAndStatusOrderByCreatedTimeAsc(postId, "normal");

        List<CommentResponse> responses = new ArrayList<>();
        for (UserPostComment comment : topComments) {
            responses.add(convertCommentToResponse(comment));
        }
        return responses;
    }

    @Transactional
    public CommentResponse addComment(String phone, CommentCreateRequest request) {
        if (request == null || request.getPostId() == null) {
            throw new RuntimeException("帖子ID不能为空");
        }
        if (request.getCommentContent() == null || request.getCommentContent().trim().isEmpty()) {
            throw new RuntimeException("评论内容不能为空");
        }

        User user = getUserByPhone(phone);
        TravelPost post = travelPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        UserPostComment comment = new UserPostComment();
        comment.setPostId(post.getId());
        comment.setUserId(user.getUserId());
        comment.setParentCommentId(request.getParentCommentId());
        comment.setCommentContent(request.getCommentContent());
        if (request.getCommentImages() != null && !request.getCommentImages().isEmpty()) {
            try {
                comment.setCommentImages(objectMapper.writeValueAsString(request.getCommentImages()));
            } catch (JsonProcessingException e) {
                // 忽略图片序列化错误
            }
        }
        if (post.getPublisherId() != null && post.getPublisherId().equals(user.getUserId())) {
            comment.setIsAuthorReply(true);
        }

        UserPostComment savedComment = commentRepository.save(comment);

        Long normalCount = commentRepository.countByPostIdAndStatus(post.getId(), "normal");
        post.setCommentCount(normalCount != null ? normalCount.intValue() : 0);
        travelPostRepository.save(post);

        if (savedComment.getParentCommentId() != null) {
            Long parentId = savedComment.getParentCommentId();
            UserPostComment parent = commentRepository.findById(parentId).orElse(null);
            if (parent != null) {
                Long replyCount = commentRepository.countByParentCommentIdAndStatus(parentId, "normal");
                parent.setReplyCount(replyCount != null ? replyCount.intValue() : 0);
                commentRepository.save(parent);
            }
        }

        try {
            notificationService.createCommentNotification(post.getId(), user.getUserId(), savedComment);
        } catch (Exception e) {
            // 忽略通知错误
        }

        return convertCommentToResponse(savedComment);
    }

    @Transactional
    public Map<String, Object> saveDraft(String phone, DraftSaveRequest request) {
        User user = getUserByPhone(phone);

        UserPostDraft draft;
        if (request.getDraftId() != null) {
            draft = draftRepository.findByIdAndPublisherId(request.getDraftId(), user.getUserId())
                    .orElseThrow(() -> new RuntimeException("草稿不存在或无权限"));
        } else {
            draft = new UserPostDraft();
            draft.setPublisherId(user.getUserId());
        }

        draft.setDraftTitle(request.getDraftTitle());
        draft.setDraftContent(request.getDraftContent());
        if (request.getDraftData() != null) {
            try {
                draft.setDraftData(objectMapper.writeValueAsString(request.getDraftData()));
            } catch (JsonProcessingException e) {
                // 忽略序列化错误
            }
        }

        if (Boolean.TRUE.equals(request.getIsAutoSave())) {
            draft.setAutoSaveTime(new Date());
        }

        UserPostDraft savedDraft = draftRepository.save(draft);

        Map<String, Object> result = new HashMap<>();
        result.put("draftId", savedDraft.getId());
        result.put("draftTitle", savedDraft.getDraftTitle());
        result.put("draftContent", savedDraft.getDraftContent());
        result.put("createdTime", savedDraft.getCreatedTime());
        result.put("updatedTime", savedDraft.getUpdatedTime());
        return result;
    }

    public List<Map<String, Object>> getUserDrafts(String phone) {
        User user = getUserByPhone(phone);
        List<UserPostDraft> drafts = draftRepository.findByPublisherIdOrderByUpdatedTimeDesc(user.getUserId());

        List<Map<String, Object>> result = new ArrayList<>();
        for (UserPostDraft draft : drafts) {
            Map<String, Object> map = new HashMap<>();
            map.put("draftId", draft.getId());
            map.put("draftTitle", draft.getDraftTitle());
            map.put("draftContent", draft.getDraftContent());
            map.put("createdTime", draft.getCreatedTime());
            map.put("updatedTime", draft.getUpdatedTime());

            if (draft.getDraftData() != null && !draft.getDraftData().isEmpty()) {
                try {
                    PostCreateRequest draftData = objectMapper.readValue(draft.getDraftData(), PostCreateRequest.class);
                    map.put("draftData", draftData);
                } catch (Exception e) {
                    // 忽略解析错误
                }
            }

            result.add(map);
        }
        return result;
    }

    @Transactional
    public PostResponse convertDraftAndPublish(String phone, Long draftId) {
        try {
            logger.info("开始发布草稿，用户: {}, 草稿ID: {}", phone, draftId);

            User user = getUserByPhone(phone);

            UserPostDraft draft = draftRepository.findByIdAndPublisherId(draftId, user.getUserId())
                    .orElseThrow(() -> new RuntimeException("草稿不存在或无权限"));

            PostCreateRequest request;
            if (draft.getDraftData() != null && !draft.getDraftData().isEmpty()) {
                try {
                    request = objectMapper.readValue(draft.getDraftData(), PostCreateRequest.class);
                } catch (JsonProcessingException e) {
                    request = new PostCreateRequest();
                    request.setTitle(draft.getDraftTitle());
                    request.setContent(draft.getDraftContent());
                    request.setContentType("richtext");
                    request.setPostType("travel_note");
                }
            } else {
                request = new PostCreateRequest();
                request.setTitle(draft.getDraftTitle());
                request.setContent(draft.getDraftContent());
                request.setContentType("richtext");
                request.setPostType("travel_note");
            }

            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                throw new RuntimeException("草稿标题不能为空");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                throw new RuntimeException("草稿内容不能为空");
            }

            TravelPost travelPost = new TravelPost();
            copyRequestToTravelPost(request, travelPost);
            travelPost.setPublisherId(user.getUserId());
            travelPost.setStatus("published");
            travelPost.setAuditStatus("pending");
            travelPost.setPublishedTime(new Date());

            TravelPost savedTravelPost = travelPostRepository.save(travelPost);

            UserTravelPost userPost = new UserTravelPost();
            userPost.setTravelPostId(savedTravelPost.getId());
            userPost.setPublisherId(user.getUserId());
            userPost.setPublisherNickname(user.getNumber());
            userPost.setUserStatus("published");
            userPost.setUserPublishedTime(new Date());
            userPost.setIsOriginal(request.getIsOriginal() != null ? request.getIsOriginal() : Boolean.TRUE);

            UserTravelPost savedUserPost = userPostRepository.save(userPost);

            draftRepository.delete(draft);

            logger.info("草稿发布成功，草稿ID: {}, 帖子ID: {}", draftId, savedTravelPost.getId());

            return convertToResponse(savedTravelPost, savedUserPost, user.getUserId());
        } catch (Exception e) {
            logger.error("发布草稿失败，用户: {}, 草稿ID: {}, 错误: {}", phone, draftId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public void deleteDraft(String phone, Long draftId) {
        User user = getUserByPhone(phone);

        UserPostDraft draft = draftRepository.findByIdAndPublisherId(draftId, user.getUserId())
                .orElseThrow(() -> new RuntimeException("草稿不存在或无权限"));

        draftRepository.delete(draft);
        logger.info("草稿删除成功，用户: {}, 草稿ID: {}", phone, draftId);
    }

    // 私有辅助方法

    private User getUserByPhone(String phone) {
        return userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    private Long getCurrentUserId(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return null;
        }
        try {
            return getUserByPhone(phone).getUserId();
        } catch (RuntimeException e) {
            return null;
        }
    }

    /**
     * 将创建/编辑请求复制到 TravelPost 实体
     */
    private void copyRequestToTravelPost(PostCreateRequest request, TravelPost post) {
        // 手动复制基本字段，避免类型转换问题
        post.setTitle(request.getTitle());
        post.setSummary(request.getSummary());
        post.setContent(request.getContent());
        post.setContentType(request.getContentType());
        post.setPostType(request.getPostType());
        post.setCategory(request.getCategory());
        post.setCoverImage(request.getCoverImage());

        // 目的地信息
        post.setDestinationName(request.getDestinationName());
        post.setDestinationCity(request.getDestinationCity());
        post.setDestinationProvince(request.getDestinationProvince());
        post.setDestinationCountry(request.getDestinationCountry());

        // 旅行日期
        post.setTravelStartDate(request.getTravelStartDate());
        post.setTravelEndDate(request.getTravelEndDate());

        // 处理可能为空的数字字段
        if (request.getTravelDays() != null && request.getTravelDays() > 0) {
            post.setTravelDays(request.getTravelDays());
        }
        if (request.getTravelBudget() != null && request.getTravelBudget().compareTo(java.math.BigDecimal.ZERO) > 0) {
            post.setTravelBudget(request.getTravelBudget());
        }
        if (request.getActualCost() != null && request.getActualCost().compareTo(java.math.BigDecimal.ZERO) > 0) {
            post.setActualCost(request.getActualCost());
        }

        // 其他字段
        post.setTravelSeason(request.getTravelSeason());
        post.setTravelStyle(request.getTravelStyle());
        post.setCompanionType(request.getCompanionType());
        post.setTags(request.getTags());
        post.setKeywords(request.getKeywords());

        // 处理JSON字段
        try {
            if (request.getImages() != null && !request.getImages().isEmpty()) {
                post.setImages(objectMapper.writeValueAsString(request.getImages()));
            }
            if (request.getVideos() != null && !request.getVideos().isEmpty()) {
                post.setVideos(objectMapper.writeValueAsString(request.getVideos()));
            }
            if (request.getAttachments() != null && !request.getAttachments().isEmpty()) {
                post.setAttachments(objectMapper.writeValueAsString(request.getAttachments()));
            }
            if (request.getLocations() != null && !request.getLocations().isEmpty()) {
                post.setLocations(objectMapper.writeValueAsString(request.getLocations()));
            }
        } catch (JsonProcessingException e) {
            // 忽略解析错误
        }
    }

    /**
     * 将评论实体转换为响应 DTO
     */
    private CommentResponse convertCommentToResponse(UserPostComment comment) {
        if (comment == null) {
            return null;
        }

        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setPostId(comment.getPostId());
        response.setUserId(comment.getUserId());
        response.setParentCommentId(comment.getParentCommentId());
        response.setCommentContent(comment.getCommentContent());
        response.setLikeCount(comment.getLikeCount());
        response.setReplyCount(comment.getReplyCount());
        response.setStatus(comment.getStatus());
        response.setIsAuthorReply(comment.getIsAuthorReply());
        response.setCreatedTime(comment.getCreatedTime());
        response.setUpdatedTime(comment.getUpdatedTime());

        // 解析评论图片 JSON
        if (comment.getCommentImages() != null && !comment.getCommentImages().isEmpty()) {
            try {
                response.setCommentImages(
                        objectMapper.readValue(comment.getCommentImages(), new TypeReference<List<String>>() {})
                );
            } catch (JsonProcessingException e) {
                // 忽略解析错误
            }
        }

        // 获取用户信息（昵称、头像）
        userRepository.findById(comment.getUserId()).ifPresent(user -> {
            String nickname = user.getUsername();
            if (nickname == null || nickname.trim().isEmpty()) {
                nickname = user.getNumber();
            }
            response.setUserNickname(nickname);
            // 如果以后有头像 URL 字段，可以在这里设置 response.setUserAvatarUrl(...)
            if (user.getUserProfilePic() != null && user.getUserProfilePic().length > 0) {
                String base64 = java.util.Base64.getEncoder().encodeToString(user.getUserProfilePic());
                String dataUrl = "data:image/jpeg;base64," + base64;
                response.setUserAvatarUrl(dataUrl);
            }
        });

        // 获取回复列表
        List<UserPostComment> replies = commentRepository.findByParentCommentIdAndStatusOrderByCreatedTimeAsc(
                comment.getId(), "normal");
        if (replies != null && !replies.isEmpty()) {
            List<CommentResponse> replyResponses = replies.stream()
                    .map(this::convertCommentToResponse)
                    .collect(Collectors.toList());
            response.setReplies(replyResponses);
        }

        return response;
    }

    /**
     * 将帖子实体和用户关联记录转换为响应 DTO
     */
    private PostResponse convertToResponse(TravelPost travelPost, UserTravelPost userPost, Long currentUserId) {
        if (travelPost == null) {
            return null;
        }

        PostResponse response = new PostResponse();
        BeanUtils.copyProperties(travelPost, response);

        // 设置用户相关信息（ID、头像、原创标记）
        Long publisherId = null;
        if (userPost != null) {
            publisherId = userPost.getPublisherId();
            response.setPublisherId(userPost.getPublisherId());
            // 如果 userPost 中已经存了头像 URL，可以先设置
            if (userPost.getPublisherAvatarUrl() != null && !userPost.getPublisherAvatarUrl().isEmpty()) {
                response.setPublisherAvatarUrl(userPost.getPublisherAvatarUrl());
            }
            response.setIsOriginal(userPost.getIsOriginal());
        } else if (travelPost.getPublisherId() != null) {
            publisherId = travelPost.getPublisherId();
            response.setPublisherId(travelPost.getPublisherId());
        }

        // 发帖人昵称使用最新用户昵称（username），为空则回退到手机号 number
        if (publisherId != null) {
            Long finalPublisherId = publisherId;
            userRepository.findById(finalPublisherId).ifPresent(user -> {
                String nickname = user.getUsername();
                if (nickname == null || nickname.trim().isEmpty()) {
                    nickname = user.getNumber();
                }
                response.setPublisherNickname(nickname);

                if (user.getUserProfilePic() != null && user.getUserProfilePic().length > 0) {
                    String base64 = java.util.Base64.getEncoder().encodeToString(user.getUserProfilePic());
                    String dataUrl = "data:image/jpeg;base64," + base64;
                    response.setPublisherAvatarUrl(dataUrl);
                }
            });
        }

        // 解析 JSON 字段
        try {
            if (travelPost.getImages() != null && !travelPost.getImages().trim().isEmpty()) {
                response.setImages(objectMapper.readValue(travelPost.getImages(), new TypeReference<List<String>>() {}));
            }
        } catch (JsonProcessingException e) {
            logger.warn("帖子 ID={} 的 images 字段 JSON 解析失败: {}, 原始数据: {}", 
                travelPost.getId(), e.getMessage(), travelPost.getImages());
        }
        
        try {
            if (travelPost.getVideos() != null && !travelPost.getVideos().trim().isEmpty()) {
                response.setVideos(objectMapper.readValue(travelPost.getVideos(), new TypeReference<List<String>>() {}));
            }
        } catch (JsonProcessingException e) {
            logger.warn("帖子 ID={} 的 videos 字段 JSON 解析失败: {}", travelPost.getId(), e.getMessage());
        }
        
        try {
            if (travelPost.getAttachments() != null && !travelPost.getAttachments().trim().isEmpty()) {
                response.setAttachments(objectMapper.readValue(travelPost.getAttachments(), new TypeReference<List<String>>() {}));
            }
        } catch (JsonProcessingException e) {
            logger.warn("帖子 ID={} 的 attachments 字段 JSON 解析失败: {}", travelPost.getId(), e.getMessage());
        }
        
        try {
            if (travelPost.getLocations() != null && !travelPost.getLocations().trim().isEmpty()) {
                response.setLocations(objectMapper.readValue(travelPost.getLocations(), new TypeReference<List<PostResponse.LocationInfo>>() {}));
            }
        } catch (JsonProcessingException e) {
            logger.warn("帖子 ID={} 的 locations 字段 JSON 解析失败: {}", travelPost.getId(), e.getMessage());
        }

        // 设置当前用户对该帖子的操作状态
        if (currentUserId != null) {
            response.setIsLiked(likeRepository.existsByPostIdAndUserId(travelPost.getId(), currentUserId));
            // 如果以后添加收藏状态，也可以在这里设置
        }

        return response;
    }

    /**
     * 获取用户最近一次发布的帖子
     */
    public PostResponse getLatestPublishedPost(Long userId, String viewerPhone) {
        if (userId == null) {
            throw new RuntimeException("用户ID不能为空");
        }

        // 获取用户最近发布的帖子（只查询一条）
        Pageable pageable = PageRequest.of(0, 1);
        List<TravelPost> posts = travelPostRepository.findLatestPublishedByPublisherId(userId, pageable);

        if (posts == null || posts.isEmpty()) {
            throw new RuntimeException("该用户暂无已发布的帖子");
        }

        TravelPost post = posts.get(0);
        Long viewerId = getCurrentUserId(viewerPhone);

        // 获取用户关联信息
        UserTravelPost userPost = userPostRepository
                .findByTravelPostIdAndPublisherId(post.getId(), userId)
                .orElse(null);

        // 增加浏览量（如果查看者不是帖子发布者）
        if (viewerId != null && !viewerId.equals(userId)) {
            if (post.getViewCount() == null) {
                post.setViewCount(0);
            }
            post.setViewCount(post.getViewCount() + 1);
            travelPostRepository.save(post);

            try {
                notificationService.createViewNotification(post.getId(), viewerId);
            } catch (Exception e) {
                // 忽略通知错误
            }
        }

        return convertToResponse(post, userPost, viewerId);
    }
}
package com.example.auth.controller;

import com.example.auth.dto.*;
import com.example.auth.entity.User;
import com.example.auth.repository.UserRepository;
import com.example.auth.service.UserPostService;
import com.example.chat.entity.UserPermission;
import com.example.chat.repository.UserPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 用户帖子控制器
 */
@RestController
@RequestMapping("/api/post")
public class UserPostController {

    @Autowired
    private UserPostService userPostService;
    
    @Autowired  
    private UserRepository userRepository;
    
    @Autowired
    private UserPermissionRepository userPermissionRepository;
    

    /**
     * 创建帖子（保存为草稿）
     */
    @PostMapping("/create")
    public ResponseDTO createPost(@RequestBody PostCreateRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 验证必填字段
            if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
                return ResponseDTO.error(400, "帖子标题不能为空");
            }
            if (request.getContent() == null || request.getContent().trim().isEmpty()) {
                return ResponseDTO.error(400, "帖子内容不能为空");
            }

            String phone = authentication.getName();
            PostResponse post = userPostService.createPost(phone, request);

            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            e.printStackTrace(); // 打印详细错误信息
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            e.printStackTrace(); // 打印详细错误信息
            return ResponseDTO.error(500, "创建帖子失败: " + e.getMessage());
        }
    }

    /**
     * 测试接口 - 用于诊断问题
     */
    @PostMapping("/test-create")
    public ResponseDTO testCreatePost(@RequestBody PostCreateRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 创建最简单的测试数据
            PostCreateRequest testRequest = new PostCreateRequest();
            testRequest.setTitle("测试帖子");
            testRequest.setContent("测试内容");
            testRequest.setContentType("richtext");
            testRequest.setPostType("travel_note");
            testRequest.setIsPublic(true);
            testRequest.setAllowComments(true);
            testRequest.setAllowShares(true);

            String phone = authentication.getName();
            PostResponse post = userPostService.createPost(phone, testRequest);

            return ResponseDTO.success(post);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseDTO.error(500, "测试创建失败: " + e.getMessage() + " - " + e.getClass().getSimpleName());
        }
    }

    /**
     * 发布帖子
     */
    @PostMapping("/{postId}/publish")
    public ResponseDTO publishPost(@PathVariable Long postId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            PostResponse post = userPostService.publishPost(phone, postId);

            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "发布帖子失败: " + e.getMessage());
        }
    }

    /**
     * 更新帖子
     */
    @PutMapping("/{postId}")
    public ResponseDTO updatePost(@PathVariable Long postId, 
                                 @RequestBody PostCreateRequest request, 
                                 Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            PostResponse post = userPostService.updatePost(phone, postId, request);

            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "更新帖子失败: " + e.getMessage());
        }
    }

    /**
     * 删除帖子
     */
    @DeleteMapping("/{postId}")
    public ResponseDTO deletePost(@PathVariable Long postId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            userPostService.deletePost(phone, postId);

            return ResponseDTO.success("帖子删除成功");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "删除帖子失败: " + e.getMessage());
        }
    }

    /**
     * 获取帖子详情
     */
    @GetMapping("/{postId}")
    public ResponseDTO getPostDetail(@PathVariable Long postId, Authentication authentication) {
        try {
            String phone = null;
            if (authentication != null && authentication.isAuthenticated()) {
                phone = authentication.getName();
            }

            PostResponse post = userPostService.getPostDetail(postId, phone);
            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取帖子详情失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的帖子列表
     */
    @GetMapping("/my")
    public ResponseDTO getMyPosts(@RequestParam(required = false) String status, 
                                 Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            List<PostResponse> posts = userPostService.getUserPosts(phone, status);

            Map<String, Object> result = new HashMap<>();
            result.put("total", posts.size());
            result.put("list", posts);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取用户帖子失败: " + e.getMessage());
        }
    }

    /**
<<<<<<< master_test
     * 获取指定用户发布的帖子列表
     */
    @GetMapping("/user/{userId}")
    public ResponseDTO getUserPostsByUserId(@PathVariable Long userId,
                                            @RequestParam(required = false) String status,
                                            Authentication authentication) {
        try {
            String viewerPhone = null;
            Long viewerId = null;
            if (authentication != null && authentication.isAuthenticated()) {
                viewerPhone = authentication.getName();
                User viewer = userRepository.findByNumber(viewerPhone).orElse(null);
                if (viewer != null) {
                    viewerId = viewer.getUserId();
                }
            }
            
            // 未登录用户不允许查看他人动态
            if (viewerId == null) {
                return ResponseDTO.error(401, "请先登录");
            }
            
            // 查看自己，始终允许
            if (!viewerId.equals(userId)) {
                // 检查对方是否允许查看动态（使用 user_permissions 表）
                boolean allowed = canViewUserMoments(userId, viewerId);
                if (!allowed) {
                    // 返回200状态码，但code为403，告知前端由于隐私设置无法查看
                    // data 字段可以包含一个标识，明确是隐私设置导致的
                    Map<String, Object> privacyResult = new HashMap<>();
                    privacyResult.put("total", 0);
                    privacyResult.put("list", List.of());
                    privacyResult.put("isPrivacyProtected", true); // 前端可据此显示"对方设置了隐私"
                    
                    return new ResponseDTO(403, "对方开启了隐私保护，动态不可见", privacyResult);
                }
            }
            
            List<PostResponse> posts = userPostService.getUserPostsByUserId(userId, status, viewerPhone);
            
            Map<String, Object> result = new HashMap<>();
            result.put("total", posts.size());
            result.put("list", posts);
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取用户帖子失败: " + e.getMessage());
        }
    }

    /**
     * 判断 viewerId 是否可以查看 ownerId 的动态（帖子/活动）
     */
    private boolean canViewUserMoments(Long ownerId, Long viewerId) {
        // 自己查看自己在调用前已处理
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
     * 获取公开帖子列表

     */
    @GetMapping("/public")
    public ResponseDTO getPublicPosts(@RequestParam(required = false) String postType,
                                     @RequestParam(required = false) String destinationCity,
                                     @RequestParam(defaultValue = "1") Integer page,
                                     @RequestParam(defaultValue = "10") Integer pageSize,
                                     Authentication authentication) {
        try {
            String phone = null;
            if (authentication != null && authentication.isAuthenticated()) {
                phone = authentication.getName();
            }

            Map<String, Object> result = userPostService.getPublicPosts(postType, destinationCity, phone, page, pageSize);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取公开帖子失败: " + e.getMessage());
        }
    }

    /**
     * 搜索帖子（支持分页）
     */
    @GetMapping("/search")
    public ResponseDTO searchPosts(@RequestParam String keyword,
                                   @RequestParam(defaultValue = "1") Integer page,
                                   @RequestParam(defaultValue = "10") Integer pageSize,
                                   Authentication authentication) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseDTO.error(400, "搜索关键词不能为空");
            }

            String phone = null;
            if (authentication != null && authentication.isAuthenticated()) {
                phone = authentication.getName();
            }

            Map<String, Object> result = userPostService.searchPosts(keyword, phone, page, pageSize);
            result.put("keyword", keyword);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "搜索帖子失败: " + e.getMessage());
        }
    }

    /**
     * 点赞/取消点赞帖子
     */
    @PostMapping("/{postId}/like")
    public ResponseDTO toggleLike(@PathVariable Long postId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            Map<String, Object> result = userPostService.toggleLike(phone, postId);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "点赞操作失败: " + e.getMessage());
        }
    }

    /**
     * 获取帖子评论列表
     */
    @GetMapping("/{postId}/comments")
    public ResponseDTO getPostComments(@PathVariable Long postId) {
        try {
            List<CommentResponse> comments = userPostService.getPostComments(postId);

            Map<String, Object> result = new HashMap<>();
            result.put("total", comments.size());
            result.put("list", comments);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取评论失败: " + e.getMessage());
        }
    }

    /**
     * 添加评论
     */
    @PostMapping("/comment")
    public ResponseDTO addComment(@RequestBody CommentCreateRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 验证必填字段
            if (request.getPostId() == null) {
                return ResponseDTO.error(400, "帖子ID不能为空");
            }
            if (request.getCommentContent() == null || request.getCommentContent().trim().isEmpty()) {
                return ResponseDTO.error(400, "评论内容不能为空");
            }

            String phone = authentication.getName();
            CommentResponse comment = userPostService.addComment(phone, request);

            return ResponseDTO.success(comment);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "添加评论失败: " + e.getMessage());
        }
    }

    /**
     * 举报评论
     */
    @PostMapping("/comment/report")
    public ResponseDTO reportComment(@RequestBody CommentReportRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            if (request == null || request.getCommentId() == null) {
                return ResponseDTO.error(400, "评论ID不能为空");
            }

            if (request.getReportReason() == null || request.getReportReason().trim().isEmpty()) {
                return ResponseDTO.error(400, "举报原因不能为空");
            }

            String phone = authentication.getName();
            userPostService.reportComment(phone, request);

            return ResponseDTO.success("评论举报已提交");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "评论举报失败: " + e.getMessage());
        }
    }

    /**
     * 举报帖子
     */
    @PostMapping("/{postId}/report")
    public ResponseDTO reportPost(@PathVariable Long postId,
                                  @RequestBody PostReportRequest request,
                                  Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            if (postId == null) {
                return ResponseDTO.error(400, "帖子ID不能为空");
            }

            if (request == null || request.getReportType() == null || request.getReportType().trim().isEmpty()) {
                return ResponseDTO.error(400, "举报类型不能为空");
            }

            String phone = authentication.getName();
            userPostService.reportPost(phone, postId, request);

            return ResponseDTO.success("帖子举报已提交");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "帖子举报失败: " + e.getMessage());
        }
    }

    /**
     * 保存草稿
     */
    @PostMapping("/draft/save")
    public ResponseDTO saveDraft(@RequestBody DraftSaveRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            Map<String, Object> result = userPostService.saveDraft(phone, request);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "保存草稿失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户草稿列表
     */
    @GetMapping("/draft/my")
    public ResponseDTO getMyDrafts(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            List<Map<String, Object>> drafts = userPostService.getUserDrafts(phone);

            Map<String, Object> result = new HashMap<>();
            result.put("total", drafts.size());
            result.put("list", drafts);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取草稿列表失败: " + e.getMessage());
        }
    }

    /**
     * 草稿转换为帖子并发布
     * 一步完成：草稿 → 帖子 → 发布
     */
    @PostMapping("/draft/{draftId}/convert-and-publish")
    public ResponseDTO convertDraftAndPublish(@PathVariable Long draftId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            PostResponse post = userPostService.convertDraftAndPublish(phone, draftId);

            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "发布草稿失败: " + e.getMessage());
        }
    }

    /**
     * 删除草稿
     */
    @DeleteMapping("/draft/{draftId}")
    public ResponseDTO deleteDraft(@PathVariable Long draftId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            userPostService.deleteDraft(phone, draftId);

            return ResponseDTO.success("草稿删除成功");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "删除草稿失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户最近一次发布的帖子
     */
    @GetMapping("/latest/{userId}")
    public ResponseDTO getLatestPost(@PathVariable Long userId, Authentication authentication) {
        try {
            if (userId == null) {
                return ResponseDTO.error(400, "用户ID不能为空");
            }

            String viewerPhone = null;
            if (authentication != null && authentication.isAuthenticated()) {
                viewerPhone = authentication.getName();
            }

            PostResponse post = userPostService.getLatestPublishedPost(userId, viewerPhone);
            return ResponseDTO.success(post);
        } catch (RuntimeException e) {
            return ResponseDTO.error(404, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取最新帖子失败: " + e.getMessage());
        }
    }
}

package com.example.auth.controller;

import com.example.auth.dto.AttractionFavoriteResponse;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.dto.TravelPostFavoriteResponse;
import com.example.auth.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 收藏管理控制器
 */
@RestController
@RequestMapping("/api/favorite")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    /**
     * 获取用户收藏的景点列表
     */
    @GetMapping("/attractions")
    public ResponseDTO getAttractionFavorites(
            @RequestParam(required = false) String attractionType,
            @RequestParam(required = false) String visitStatus,
            @RequestParam(required = false) String city,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取景点收藏列表
            List<AttractionFavoriteResponse> attractions = favoriteService
                    .getUserAttractionFavorites(phone, attractionType, visitStatus, city);

            // 组装响应数据
            Map<String, Object> result = new HashMap<>();
            result.put("total", attractions.size());
            result.put("list", attractions);
            
            // 添加筛选条件信息
            Map<String, String> filters = new HashMap<>();
            if (attractionType != null) filters.put("attractionType", attractionType);
            if (visitStatus != null) filters.put("visitStatus", visitStatus);
            if (city != null) filters.put("city", city);
            result.put("filters", filters);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取景点收藏列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户收藏的帖子列表
     */
    @GetMapping("/posts")
    public ResponseDTO getPostFavorites(
            @RequestParam(required = false) String postType,
            @RequestParam(required = false) String favoriteCategory,
            @RequestParam(required = false) String readStatus,
            @RequestParam(required = false) String destinationCity,
            @RequestParam(required = false) Integer priorityLevel,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取帖子收藏列表
            List<TravelPostFavoriteResponse> posts = favoriteService
                    .getUserPostFavorites(phone, postType, favoriteCategory, readStatus, 
                                        destinationCity, priorityLevel);

            // 组装响应数据
            Map<String, Object> result = new HashMap<>();
            result.put("total", posts.size());
            result.put("list", posts);
            
            // 添加筛选条件信息
            Map<String, Object> filters = new HashMap<>();
            if (postType != null) filters.put("postType", postType);
            if (favoriteCategory != null) filters.put("favoriteCategory", favoriteCategory);
            if (readStatus != null) filters.put("readStatus", readStatus);
            if (destinationCity != null) filters.put("destinationCity", destinationCity);
            if (priorityLevel != null) filters.put("priorityLevel", priorityLevel);
            result.put("filters", filters);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取帖子收藏列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户收藏统计信息
     */
    @GetMapping("/stats")
    public ResponseDTO getFavoriteStats(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取收藏统计信息
            Map<String, Object> stats = favoriteService.getUserFavoriteStats(phone);

            return ResponseDTO.success(stats);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取收藏统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取收藏概览（包含景点和帖子的简要信息）
     */
    @GetMapping("/overview")
    public ResponseDTO getFavoriteOverview(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取最近的景点收藏（限制5条）
            List<AttractionFavoriteResponse> recentAttractions = favoriteService
                    .getUserAttractionFavorites(phone, null, null, null)
                    .stream()
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());

            // 获取最近的帖子收藏（限制5条）
            List<TravelPostFavoriteResponse> recentPosts = favoriteService
                    .getUserPostFavorites(phone, null, null, null, null, null)
                    .stream()
                    .limit(5)
                    .collect(java.util.stream.Collectors.toList());

            // 获取统计信息
            Map<String, Object> stats = favoriteService.getUserFavoriteStats(phone);

            // 组装概览数据
            Map<String, Object> overview = new HashMap<>();
            overview.put("recentAttractions", recentAttractions);
            overview.put("recentPosts", recentPosts);
            overview.put("stats", stats);

            return ResponseDTO.success(overview);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取收藏概览失败: " + e.getMessage());
        }
    }

    /**
     * 添加帖子收藏（支持幂等性）
     */
    @PostMapping("/post/{postId}")
    public ResponseDTO addPostFavorite(
            @PathVariable Long postId,
            @RequestParam(required = false) String favoriteCategory,
            @RequestParam(required = false) String favoriteTags,
            @RequestParam(required = false) String userNotes,
            @RequestParam(required = false) Integer priorityLevel,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 调用service添加收藏
            TravelPostFavoriteResponse favorite = favoriteService.addPostFavorite(
                    phone, postId, favoriteCategory, favoriteTags, userNotes, priorityLevel);

            return ResponseDTO.success(favorite);
        } catch (org.hibernate.exception.ConstraintViolationException e) {
            // 🔧 约束冲突异常的特殊处理（兜底方案）
            System.err.println("⚠️ 检测到数据库约束冲突（这不应该发生，因为Service层已实现幂等性）");
            e.printStackTrace();
            return ResponseDTO.error(409, "该帖子已在收藏列表中");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 🔧 数据完整性异常的处理
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("constraint")) {
                System.err.println("⚠️ 检测到数据完整性冲突");
                return ResponseDTO.error(409, "该帖子已在收藏列表中");
            }
            return ResponseDTO.error(400, "数据验证失败: " + (errorMsg != null ? errorMsg : "未知错误"));
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "添加收藏失败: " + e.getMessage());
        }
    }

    /**
     * 取消帖子收藏
     */
    @DeleteMapping("/post/{postId}")
    public ResponseDTO removePostFavorite(
            @PathVariable Long postId,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 调用service取消收藏
            favoriteService.removePostFavorite(phone, postId);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "取消收藏成功");
            result.put("postId", postId);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "取消收藏失败: " + e.getMessage());
        }
    }

    /**
     * 检查帖子是否已收藏
     */
    @GetMapping("/post/{postId}/status")
    public ResponseDTO checkPostFavoriteStatus(
            @PathVariable Long postId,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 检查是否已收藏
            boolean isFavorited = favoriteService.isPostFavorited(phone, postId);

            Map<String, Object> result = new HashMap<>();
            result.put("postId", postId);
            result.put("isFavorited", isFavorited);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "检查收藏状态失败: " + e.getMessage());
        }
    }

    /**
     * 添加景点收藏（支持幂等性）
     */
    @PostMapping("/attraction")
    public ResponseDTO addAttractionFavorite(
            @RequestParam String name,
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(required = false) String icon,
            @RequestParam(required = false) String address,
            @RequestParam(required = false) Float rating,
            @RequestParam(required = false) String distance,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 调用service添加景点收藏
            AttractionFavoriteResponse favorite = favoriteService.addAttractionFavorite(
                    phone, name, lat, lng, icon, address, rating, distance);

            return ResponseDTO.success(favorite);
        } catch (org.hibernate.exception.ConstraintViolationException e) {
            // 🔧 约束冲突异常的特殊处理（兜底方案）
            System.err.println("⚠️ 检测到数据库约束冲突（这不应该发生，因为Service层已实现幂等性）");
            e.printStackTrace();
            return ResponseDTO.error(409, "该景点已在收藏列表中");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            // 🔧 数据完整性异常的处理
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("constraint")) {
                System.err.println("⚠️ 检测到数据完整性冲突");
                return ResponseDTO.error(409, "该景点已在收藏列表中");
            }
            return ResponseDTO.error(400, "数据验证失败: " + (errorMsg != null ? errorMsg : "未知错误"));
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "添加景点收藏失败: " + e.getMessage());
        }
    }

    /**
     * 取消景点收藏
     */
    @DeleteMapping("/attraction")
    public ResponseDTO removeAttractionFavorite(
            @RequestParam String name,
            @RequestParam Double lat,
            @RequestParam Double lng,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 调用service取消景点收藏
            favoriteService.removeAttractionFavorite(phone, name, lat, lng);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "取消景点收藏成功");
            result.put("name", name);
            result.put("lat", lat);
            result.put("lng", lng);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "取消景点收藏失败: " + e.getMessage());
        }
    }

    /**
     * 检查景点是否已收藏
     */
    @GetMapping("/attraction/status")
    public ResponseDTO checkAttractionFavoriteStatus(
            @RequestParam String name,
            @RequestParam Double lat,
            @RequestParam Double lng,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 检查是否已收藏
            boolean isFavorited = favoriteService.isAttractionFavorited(phone, name, lat, lng);

            Map<String, Object> result = new HashMap<>();
            result.put("name", name);
            result.put("lat", lat);
            result.put("lng", lng);
            result.put("isFavorited", isFavorited);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "检查景点收藏状态失败: " + e.getMessage());
        }
    }
}

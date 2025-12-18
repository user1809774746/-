package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.dto.RouteFavoriteResponseDTO;
import com.example.auth.dto.TripSchemeDTO;
import com.example.auth.service.TripSchemeService;
import com.example.auth.service.UserService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 路线收藏管理控制器
 * 支持两种收藏方式：
 * 1. 收藏数据库中已有的旅游方案（通过 routeId）
 * 2. 收藏前端规划的路线（通过完整的 TripSchemeDTO）
 */
@RestController
@RequestMapping("/api/favorites/route")
public class RouteFavoriteController {

    @Autowired
    private TripSchemeService tripSchemeService;

    @Autowired
    private UserService userService;

    /**
     * 收藏已有的旅游方案（通过 routeId）
     * 适用于：收藏数据库中已存在的旅游方案
     */
    @PostMapping("/{routeId}")
    public ResponseDTO favoriteExistingRoute(
            @PathVariable Integer routeId,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户ID
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);

            if (userId == null) {
                return ResponseDTO.error(401, "用户不存在");
            }

            // 收藏路线
            RouteFavoriteResponseDTO favorite = tripSchemeService.favoriteRouteByRouteId(userId, routeId);

            return ResponseDTO.success(favorite);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "收藏路线失败: " + e.getMessage());
        }
    }

    /**
     * 收藏前端规划的路线（通过完整数据）
     * 适用于：用户自己规划的路线，需要先创建方案再收藏
     */
    @PostMapping("/custom")
    public ResponseDTO favoriteCustomRoute(
            @RequestBody TripSchemeDTO tripSchemeDTO,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户ID
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);

            if (userId == null) {
                return ResponseDTO.error(401, "用户不存在");
            }

            // 参数验证
            if (tripSchemeDTO.getTrip_title() == null || tripSchemeDTO.getTrip_title().trim().isEmpty()) {
                return ResponseDTO.error(400, "路线标题不能为空");
            }
            if (tripSchemeDTO.getTotal_days() == null || tripSchemeDTO.getTotal_days() <= 0) {
                return ResponseDTO.error(400, "旅游天数必须大于0");
            }

            // 创建并收藏路线
            RouteFavoriteResponseDTO favorite = tripSchemeService.favoriteTripScheme(userId, tripSchemeDTO);

            return ResponseDTO.success(favorite);
        } catch (JsonProcessingException e) {
            return ResponseDTO.error(500, "路线数据格式错误");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "收藏路线失败: " + e.getMessage());
        }
    }

    /**
     * 取消收藏路线
     */
    @DeleteMapping("/{routeId}")
    public ResponseDTO unfavoriteRoute(
            @PathVariable Integer routeId,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户ID
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);

            if (userId == null) {
                return ResponseDTO.error(401, "用户不存在");
            }

            // 取消收藏
            tripSchemeService.unfavoriteTripScheme(userId, routeId);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "取消路线收藏成功");
            result.put("routeId", routeId);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "取消收藏失败: " + e.getMessage());
        }
    }

    /**
     * 检查路线是否已收藏
     */
    @GetMapping("/{routeId}/status")
    public ResponseDTO checkRouteFavoriteStatus(
            @PathVariable Integer routeId,
            Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户ID
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);

            if (userId == null) {
                return ResponseDTO.error(401, "用户不存在");
            }

            // 检查是否已收藏
            boolean isFavorited = tripSchemeService.isRouteFavorited(userId, routeId);

            Map<String, Object> result = new HashMap<>();
            result.put("routeId", routeId);
            result.put("isFavorited", isFavorited);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "检查收藏状态失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的所有路线收藏列表
     */
    @GetMapping("/list")
    public ResponseDTO getMyFavoriteRoutes(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户ID
            String phone = authentication.getName();
            Long userId = userService.getUserIdByPhone(phone);

            if (userId == null) {
                return ResponseDTO.error(401, "用户不存在");
            }

            // 获取收藏列表
            List<RouteFavoriteResponseDTO> favoriteRoutes = tripSchemeService.getAllFavoriteRoutes(userId);

            Map<String, Object> result = new HashMap<>();
            result.put("total", favoriteRoutes.size());
            result.put("list", favoriteRoutes);

            return ResponseDTO.success(result);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取收藏列表失败: " + e.getMessage());
        }
    }
}


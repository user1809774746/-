package com.example.auth.controller;

import com.example.auth.dto.ResponseDTO;
import com.example.auth.dto.RouteHistoryResponse;
import com.example.auth.dto.RouteSearchRequest;
import com.example.auth.service.RouteHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 路线历史记录控制器
 */
@RestController
@RequestMapping("/api/route")
public class RouteHistoryController {

    @Autowired
    private RouteHistoryService routeHistoryService;

    /**
     * 保存路线查询记录
     * 当用户在前端输入出发地和目的地并规划路线后，调用此接口保存记录
     */
    @PostMapping("/save-search")
    public ResponseDTO saveRouteSearch(@RequestBody RouteSearchRequest request, 
                                       Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 验证必填字段
            if (request.getDeparture() == null || request.getDeparture().trim().isEmpty()) {
                return ResponseDTO.error(400, "出发地不能为空");
            }
            if (request.getDestination() == null || request.getDestination().trim().isEmpty()) {
                return ResponseDTO.error(400, "目的地不能为空");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 保存路线查询记录
            RouteHistoryResponse savedHistory = routeHistoryService.saveRouteSearch(phone, request);

            Map<String, Object> result = new HashMap<>();
            result.put("message", "路线查询记录已保存");
            result.put("historyId", savedHistory.getId());
            result.put("history", savedHistory);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "保存路线查询记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的历史记录列表
     * 当用户点击历史记录时，调用此接口显示所有历史查询记录
     */
    @GetMapping("/history")
    public ResponseDTO getRouteHistory(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取历史记录列表
            List<RouteHistoryResponse> historyList = routeHistoryService.getUserRouteHistory(phone);

            Map<String, Object> result = new HashMap<>();
            result.put("total", historyList.size());
            result.put("list", historyList);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取历史记录失败: " + e.getMessage());
        }
    }

    /**
     * 获取收藏的路线
     */
    @GetMapping("/favorites")
    public ResponseDTO getFavoriteRoutes(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            List<RouteHistoryResponse> favoriteList = routeHistoryService.getUserFavoriteRoutes(phone);

            Map<String, Object> result = new HashMap<>();
            result.put("total", favoriteList.size());
            result.put("list", favoriteList);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取收藏路线失败: " + e.getMessage());
        }
    }

    /**
     * 删除历史记录
     */
    @DeleteMapping("/history/{historyId}")
    public ResponseDTO deleteRouteHistory(@PathVariable Long historyId, 
                                         Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            routeHistoryService.deleteRouteHistory(phone, historyId);

            return ResponseDTO.success("历史记录已删除");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "删除历史记录失败: " + e.getMessage());
        }
    }

    /**
     * 切换收藏状态
     */
    @PostMapping("/history/{historyId}/toggle-favorite")
    public ResponseDTO toggleFavorite(@PathVariable Long historyId, 
                                     Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            String phone = authentication.getName();
            RouteHistoryResponse updatedHistory = routeHistoryService.toggleFavorite(phone, historyId);

            Map<String, Object> result = new HashMap<>();
            result.put("message", updatedHistory.getIsFavorite() ? "已添加到收藏" : "已取消收藏");
            result.put("history", updatedHistory);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "操作失败: " + e.getMessage());
        }
    }
}


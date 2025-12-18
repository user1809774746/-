package com.example.auth.controller;

import com.example.auth.dto.PopularTravelPlanSaveRequest;
import com.example.auth.dto.PopularTravelPlanResponse;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.service.PopularTravelPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/popular-travel-plans")
public class PopularTravelPlanController {

    @Autowired
    private PopularTravelPlanService popularTravelPlanService;

    /**
     * 保存或更新旅行计划
     */
    @PostMapping("/save")
    public ResponseDTO saveTravelPlan(@Valid @RequestBody PopularTravelPlanSaveRequest request, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }
            PopularTravelPlanResponse response = popularTravelPlanService.saveTravelPlan(authentication.getName(), request);
            return ResponseDTO.success(response);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "保存旅行计划失败: " + e.getMessage());
        }
    }

    /**
     * 收藏/取消收藏旅行计划
     */
    @PostMapping("/{planId}/toggle-favorite")
    public ResponseDTO toggleFavoriteTravelPlan(@PathVariable Long planId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }
            PopularTravelPlanResponse response = popularTravelPlanService.toggleFavoriteTravelPlan(authentication.getName(), planId);
            return ResponseDTO.success(response);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "收藏/取消收藏旅行计划失败: " + e.getMessage());
        }
    }

    /**
     * 获取旅行计划详情
     */
    @GetMapping("/{planId}")
    public ResponseDTO getTravelPlanDetail(@PathVariable Long planId, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }
            PopularTravelPlanResponse response = popularTravelPlanService.getTravelPlanById(authentication.getName(), planId);
            return ResponseDTO.success(response);
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取旅行计划详情失败: " + e.getMessage());
        }
    }
}

package com.example.auth.service;

import com.example.auth.dto.DayDetailDTO;
import com.example.auth.dto.RouteFavoriteResponseDTO;
import com.example.auth.dto.TripSchemeDTO;
import com.example.auth.entity.RouteFavorite;
import com.example.auth.entity.TripScheme;
import com.example.auth.repository.RouteFavoriteRepository;
import com.example.auth.repository.TripSchemeRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TripSchemeService {

    @Autowired
    private TripSchemeRepository tripSchemeRepository;

    @Autowired
    private RouteFavoriteRepository routeFavoriteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * 收藏旅游方案（支持幂等性）
     * 通过已存在的路线ID进行收藏
     */
    @Transactional
    public RouteFavoriteResponseDTO favoriteRouteByRouteId(Long userId, Integer routeId) {
        // 验证路线是否存在
        TripScheme tripScheme = tripSchemeRepository.findById(routeId)
                .orElseThrow(() -> new RuntimeException("旅游方案不存在，ID: " + routeId));

        // 检查用户是否已经收藏过该路线
        Optional<RouteFavorite> existingFavorite = routeFavoriteRepository.findByUserIdAndRouteId(userId, routeId);

        RouteFavorite routeFavorite;
        if (existingFavorite.isPresent()) {
            routeFavorite = existingFavorite.get();
            
            // 如果已经是有效状态，直接返回（幂等性）
            if (Boolean.TRUE.equals(routeFavorite.getIsValid())) {
                System.out.println("✅ 路线已在收藏列表中（幂等返回）");
                return convertToRouteFavoriteResponseDto(routeFavorite, tripScheme);
            }
            
            // 如果之前取消过收藏，恢复收藏状态
            System.out.println("🔄 恢复之前取消的路线收藏");
            routeFavorite.setIsValid(true);
            routeFavorite.setCreateTime(LocalDateTime.now()); // 更新收藏时间
            routeFavorite = routeFavoriteRepository.save(routeFavorite);
        } else {
            // 创建新的收藏记录
            System.out.println("➕ 创建新的路线收藏记录");
            routeFavorite = new RouteFavorite();
            routeFavorite.setUserId(userId);
            routeFavorite.setRouteId(routeId);
            routeFavorite.setIsValid(true);
            routeFavorite = routeFavoriteRepository.save(routeFavorite);
        }

        return convertToRouteFavoriteResponseDto(routeFavorite, tripScheme);
    }

    /**
     * 收藏旅游方案（通过完整数据，会创建新方案）
     * 用于前端规划的路线收藏
     */
    @Transactional
    public RouteFavoriteResponseDTO favoriteTripScheme(Long userId, TripSchemeDTO tripSchemeDTO) throws JsonProcessingException {
        // Convert DayDetailDTO list to JSON string
        String routeContent = objectMapper.writeValueAsString(tripSchemeDTO.getDays());

        // 创建新的旅游方案
        TripScheme tripScheme = new TripScheme();
        tripScheme.setTripTitle(tripSchemeDTO.getTrip_title());
        tripScheme.setTotalDays(tripSchemeDTO.getTotal_days());
        tripScheme.setSummary(tripSchemeDTO.getSummary());
        tripScheme.setRouteContent(routeContent);

        TripScheme savedTripScheme = tripSchemeRepository.save(tripScheme);

        // 创建收藏记录
        RouteFavorite routeFavorite = new RouteFavorite();
        routeFavorite.setUserId(userId);
        routeFavorite.setRouteId(savedTripScheme.getId());
        routeFavorite.setIsValid(true);
        routeFavorite = routeFavoriteRepository.save(routeFavorite);

        return convertToRouteFavoriteResponseDto(routeFavorite, savedTripScheme);
    }

    /**
     * 取消收藏旅游方案（软删除）
     */
    @Transactional
    public void unfavoriteTripScheme(Long userId, Integer routeId) {
        RouteFavorite favorite = routeFavoriteRepository.findByUserIdAndRouteId(userId, routeId)
                .orElseThrow(() -> new RuntimeException("未找到该路线的收藏记录"));

        // 检查是否已经取消收藏
        if (Boolean.FALSE.equals(favorite.getIsValid())) {
            throw new RuntimeException("该路线收藏已被取消");
        }

        // 软删除：设置 is_valid 为 false
        favorite.setIsValid(false);
        routeFavoriteRepository.save(favorite);
        
        System.out.println("✅ 路线收藏已取消");
    }

    /**
     * 检查路线是否已收藏
     */
    public boolean isRouteFavorited(Long userId, Integer routeId) {
        Optional<RouteFavorite> favorite = routeFavoriteRepository.findByUserIdAndRouteId(userId, routeId);
        return favorite.isPresent() && Boolean.TRUE.equals(favorite.get().getIsValid());
    }

    public List<RouteFavoriteResponseDTO> getAllFavoriteRoutes(Long userId) {
        List<RouteFavorite> favoriteRoutes = routeFavoriteRepository.findAllByUserIdAndIsValid(userId, true);
        return favoriteRoutes.stream()
                .map(favorite -> {
                    Optional<TripScheme> tripSchemeOpt = tripSchemeRepository.findById(favorite.getRouteId());
                    if (tripSchemeOpt.isPresent()) {
                        TripScheme tripScheme = tripSchemeOpt.get();
                        return convertToRouteFavoriteResponseDto(favorite, tripScheme);
                    }
                    return null; // Or throw an exception, depending on error handling strategy
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
    }

    private TripSchemeDTO convertToDto(TripScheme tripScheme) {
        TripSchemeDTO dto = new TripSchemeDTO();
        dto.setId(tripScheme.getId()); // 设置id
        dto.setTrip_title(tripScheme.getTripTitle());
        dto.setTotal_days(tripScheme.getTotalDays());
        dto.setSummary(tripScheme.getSummary());
        try {
            List<DayDetailDTO> days = objectMapper.readValue(tripScheme.getRouteContent(), new TypeReference<List<DayDetailDTO>>() {});
            dto.setDays(days);
        } catch (JsonProcessingException e) {
            // Handle exception, e.g., log it and return empty list or throw custom exception
            System.err.println("Error parsing route content: " + e.getMessage());
            dto.setDays(Collections.emptyList());
        }
        return dto;
    }

    private RouteFavoriteResponseDTO convertToRouteFavoriteResponseDto(RouteFavorite favorite, TripScheme tripScheme) {
        RouteFavoriteResponseDTO dto = new RouteFavoriteResponseDTO();
        dto.setId(favorite.getId());
        dto.setRouteId(favorite.getRouteId());
        dto.setUserId(favorite.getUserId());
        dto.setCreateTime(favorite.getCreateTime());
        dto.setIsValid(favorite.getIsValid());

        // Set embedded TripScheme details
        dto.setTrip_title(tripScheme.getTripTitle());
        dto.setTotal_days(tripScheme.getTotalDays());
        dto.setSummary(tripScheme.getSummary());
        try {
            List<DayDetailDTO> days = objectMapper.readValue(tripScheme.getRouteContent(), new TypeReference<List<DayDetailDTO>>() {});
            dto.setDays(days);
        } catch (JsonProcessingException e) {
            System.err.println("Error parsing route content for favorite response: " + e.getMessage());
            dto.setDays(Collections.emptyList());
        }
        return dto;
    }
}

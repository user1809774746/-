package com.example.auth.service;

import com.example.auth.dto.RouteHistoryResponse;
import com.example.auth.dto.RouteSearchRequest;
import com.example.auth.entity.RouteHistory;
import com.example.auth.entity.User;
import com.example.auth.repository.RouteHistoryRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 路线历史记录服务类
 */
@Service
public class RouteHistoryService {

    @Autowired
    private RouteHistoryRepository routeHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 保存路线查询记录
     */
    @Transactional
    public RouteHistoryResponse saveRouteSearch(String phone, RouteSearchRequest request) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 创建历史记录
        RouteHistory history = new RouteHistory();
        history.setUserId(user.getUserId());
        history.setDeparture(request.getDeparture());
        history.setDestination(request.getDestination());
        history.setDepartureLat(request.getDepartureLat());
        history.setDepartureLng(request.getDepartureLng());
        history.setDestinationLat(request.getDestinationLat());
        history.setDestinationLng(request.getDestinationLng());
        history.setDistance(request.getDistance());
        history.setDuration(request.getDuration());
        history.setRouteType(request.getRouteType());
        history.setNotes(request.getNotes());
        history.setIsFavorite(false);

        // 保存到数据库
        RouteHistory savedHistory = routeHistoryRepository.save(history);

        // 转换为响应对象
        return convertToResponse(savedHistory);
    }

    /**
     * 获取用户的历史记录列表
     */
    public List<RouteHistoryResponse> getUserRouteHistory(String phone) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 查询历史记录
        List<RouteHistory> historyList = routeHistoryRepository
                .findByUserIdOrderBySearchTimeDesc(user.getUserId());

        // 转换为响应对象列表
        return historyList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户收藏的历史记录
     */
    public List<RouteHistoryResponse> getUserFavoriteRoutes(String phone) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        List<RouteHistory> historyList = routeHistoryRepository
                .findByUserIdAndIsFavoriteOrderBySearchTimeDesc(user.getUserId(), true);

        return historyList.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 删除历史记录
     */
    @Transactional
    public void deleteRouteHistory(String phone, Long historyId) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        RouteHistory history = routeHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("历史记录不存在"));

        // 验证该记录是否属于当前用户
        if (!history.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("无权删除该历史记录");
        }

        routeHistoryRepository.delete(history);
    }

    /**
     * 切换收藏状态
     */
    @Transactional
    public RouteHistoryResponse toggleFavorite(String phone, Long historyId) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        RouteHistory history = routeHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("历史记录不存在"));

        // 验证该记录是否属于当前用户
        if (!history.getUserId().equals(user.getUserId())) {
            throw new RuntimeException("无权操作该历史记录");
        }

        history.setIsFavorite(!history.getIsFavorite());
        RouteHistory updatedHistory = routeHistoryRepository.save(history);

        return convertToResponse(updatedHistory);
    }

    /**
     * 转换为响应对象
     */
    private RouteHistoryResponse convertToResponse(RouteHistory history) {
        RouteHistoryResponse response = new RouteHistoryResponse();
        BeanUtils.copyProperties(history, response);
        return response;
    }
}


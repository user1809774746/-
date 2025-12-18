package com.example.auth.service;

import com.example.auth.dto.AttractionFavoriteResponse;
import com.example.auth.dto.TravelPostFavoriteResponse;
import com.example.auth.entity.AttractionFavorite;
import com.example.auth.entity.TravelPost;
import com.example.auth.entity.TravelPostFavorite;
import com.example.auth.entity.User;
import com.example.auth.repository.AttractionFavoriteRepository;
import com.example.auth.repository.TravelPostFavoriteRepository;
import com.example.auth.repository.TravelPostRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 收藏管理服务类
 */
@Service
public class FavoriteService {

    @Autowired
    private AttractionFavoriteRepository attractionFavoriteRepository;

    @Autowired
    private TravelPostFavoriteRepository travelPostFavoriteRepository;

    @Autowired
    private TravelPostRepository travelPostRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationService notificationService;

    /**
     * 获取用户收藏的景点列表
     */
    public List<AttractionFavoriteResponse> getUserAttractionFavorites(String phone, String attractionType, 
                                                                       String visitStatus, String city) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        List<AttractionFavorite> favorites = attractionFavoriteRepository
                .findAllByUserIdAndIsValid(user.getUserId().intValue(), 1);

        // 转换为响应对象列表
        return favorites.stream()
                .map(this::convertAttractionToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户收藏的帖子列表
     * 支持多条件组合筛选
     */
    public List<TravelPostFavoriteResponse> getUserPostFavorites(String phone, String postType, 
                                                                String favoriteCategory, String readStatus, 
                                                                String destinationCity, Integer priorityLevel) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 使用多条件组合查询
        List<TravelPostFavorite> favorites = travelPostFavoriteRepository.findByMultipleConditions(
                user.getUserId(),
                postType,
                favoriteCategory,
                readStatus,
                destinationCity,
                priorityLevel
        );

        // 转换为响应对象列表
        return favorites.stream()
                .map(this::convertPostToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 获取用户收藏统计信息
     */
    public Map<String, Object> getUserFavoriteStats(String phone) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Map<String, Object> stats = new HashMap<>();

        // 景点收藏统计
        Long attractionCount = (long) attractionFavoriteRepository.countByUserIdAndIsValid(user.getUserId().intValue(), 1);

        // 帖子收藏统计
        Long postCount = travelPostFavoriteRepository.countByUserIdAndStatusAndIsDeleted(
                user.getUserId(), "active", false);
        List<Object[]> postTypeStats = travelPostFavoriteRepository
                .countByUserIdAndStatusGroupByPostType(user.getUserId(), "active", false);
        List<Object[]> destinationStats = travelPostFavoriteRepository
                .countByUserIdAndStatusGroupByDestination(user.getUserId(), "active", false);

        // 组装统计数据
        stats.put("totalAttractions", attractionCount);
        stats.put("totalPosts", postCount);
        stats.put("totalFavorites", attractionCount + postCount);

        // 景点类型统计 (Removed as this method is no longer available)
        // Map<String, Long> attractionTypeMap = new HashMap<>();
        // for (Object[] stat : attractionTypeStats) {
        //     attractionTypeMap.put((String) stat[0], (Long) stat[1]);
        // }
        // stats.put("attractionTypeStats", attractionTypeMap);

        // 帖子类型统计
        Map<String, Long> postTypeMap = new HashMap<>();
        for (Object[] stat : postTypeStats) {
            postTypeMap.put((String) stat[0], (Long) stat[1]);
        }
        stats.put("postTypeStats", postTypeMap);

        // 目的地统计
        Map<String, Long> destinationMap = new HashMap<>();
        for (Object[] stat : destinationStats) {
            destinationMap.put((String) stat[0], (Long) stat[1]);
        }
        stats.put("destinationStats", destinationMap);

        return stats;
    }

    /**
     * 转换景点收藏为响应对象
     */
    private AttractionFavoriteResponse convertAttractionToResponse(AttractionFavorite favorite) {
        AttractionFavoriteResponse response = new AttractionFavoriteResponse();
        BeanUtils.copyProperties(favorite, response);
        return response;
    }

    /**
     * 转换帖子收藏为响应对象
     */
    private TravelPostFavoriteResponse convertPostToResponse(TravelPostFavorite favorite) {
        TravelPostFavoriteResponse response = new TravelPostFavoriteResponse();
        BeanUtils.copyProperties(favorite, response);
        return response;
    }

    /**
     * 添加帖子收藏（支持幂等性）
     * 如果已经收藏过，直接返回成功；如果之前取消过收藏，则恢复收藏状态
     */
    @Transactional
    public TravelPostFavoriteResponse addPostFavorite(String phone, Long postId, 
                                                     String favoriteCategory, String favoriteTags,
                                                     String userNotes, Integer priorityLevel) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查帖子是否存在
        TravelPost post = travelPostRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("帖子不存在"));

        // 🔧 幂等性检查：查找是否存在收藏记录（不论状态）
        Optional<TravelPostFavorite> existingFavorite = travelPostFavoriteRepository
                .findByUserIdAndPostId(user.getUserId(), postId);

        if (existingFavorite.isPresent()) {
            TravelPostFavorite favorite = existingFavorite.get();
            
            // 如果已经是活跃状态，直接返回（幂等性）
            if ("active".equals(favorite.getStatus()) && !favorite.getIsDeleted()) {
                System.out.println("✅ 帖子已在收藏列表中（幂等返回）");
                return convertPostToResponse(favorite);
            }
            
            // 如果之前取消过收藏，恢复收藏状态
            System.out.println("🔄 恢复之前取消的收藏");
            favorite.setStatus("active");
            favorite.setIsDeleted(false);
            favorite.setDeletedTime(null);
            favorite.setFavoriteTime(new Date()); // 更新收藏时间
            
            // 更新用户自定义信息
            favorite.setFavoriteCategory(favoriteCategory != null ? favoriteCategory : "general");
            favorite.setFavoriteTags(favoriteTags);
            favorite.setUserNotes(userNotes);
            favorite.setPriorityLevel(priorityLevel != null ? priorityLevel : 3);
            favorite.setReadStatus("unread");
            
            TravelPostFavorite savedFavorite = travelPostFavoriteRepository.save(favorite);
            
            // 更新帖子的收藏数
            if (post.getFavoriteCount() != null) {
                post.setFavoriteCount(post.getFavoriteCount() + 1);
                travelPostRepository.save(post);
            }
            
            // 创建收藏通知
            try {
                notificationService.createFavoriteNotification(postId, user.getUserId());
            } catch (Exception e) {
                System.err.println("创建收藏通知失败: " + e.getMessage());
                // 通知创建失败不影响收藏功能，只记录日志
            }
            
            return convertPostToResponse(savedFavorite);
        }

        // 创建新的收藏记录
        System.out.println("➕ 创建新的收藏记录");
        TravelPostFavorite favorite = new TravelPostFavorite();
        favorite.setUserId(user.getUserId());
        favorite.setPostId(postId);
        favorite.setPublisherId(post.getPublisherId());

        // 设置帖子基本信息（冗余存储）
        favorite.setPostTitle(post.getTitle());
        favorite.setPostType(post.getPostType());
        favorite.setCoverImage(post.getCoverImage());

        // 设置目的地信息
        favorite.setDestinationName(post.getDestinationName());
        favorite.setDestinationCity(post.getDestinationCity());
        favorite.setDestinationProvince(post.getDestinationProvince());
        favorite.setDestinationCountry(post.getDestinationCountry());

        // 设置旅行信息
        favorite.setTravelDays(post.getTravelDays());
        if (post.getTravelBudget() != null) {
            favorite.setTravelBudget(post.getTravelBudget().doubleValue());
        }
        favorite.setTravelSeason(post.getTravelSeason());
        favorite.setTravelStyle(post.getTravelStyle());

        // 设置用户自定义信息
        favorite.setFavoriteCategory(favoriteCategory != null ? favoriteCategory : "general");
        favorite.setFavoriteTags(favoriteTags);
        favorite.setUserNotes(userNotes);
        favorite.setPriorityLevel(priorityLevel != null ? priorityLevel : 3);

        // 设置默认状态
        favorite.setReadStatus("unread");
        favorite.setIsArchived(false);
        favorite.setReminderEnabled(false);
        favorite.setIsShared(false);
        favorite.setShareCount(0);
        favorite.setStatus("active");
        favorite.setIsDeleted(false);

        // 保存收藏记录
        TravelPostFavorite savedFavorite = travelPostFavoriteRepository.save(favorite);

        // 更新帖子的收藏数（如果travel_post表有favoriteCount字段）
        if (post.getFavoriteCount() != null) {
            post.setFavoriteCount(post.getFavoriteCount() + 1);
            travelPostRepository.save(post);
        }

        // 创建收藏通知
        try {
            notificationService.createFavoriteNotification(postId, user.getUserId());
        } catch (Exception e) {
            System.err.println("创建收藏通知失败: " + e.getMessage());
            // 通知创建失败不影响收藏功能，只记录日志
        }

        // 转换为响应对象
        return convertPostToResponse(savedFavorite);
    }

    /**
     * 取消帖子收藏
     */
    @Transactional
    public void removePostFavorite(String phone, Long postId) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 查找收藏记录
        TravelPostFavorite favorite = travelPostFavoriteRepository
                .findByUserIdAndPostId(user.getUserId(), postId)
                .orElseThrow(() -> new RuntimeException("未找到收藏记录"));

        // 检查是否已经取消收藏
        if (favorite.getIsDeleted()) {
            throw new RuntimeException("该收藏已被取消");
        }

        // 软删除：设置删除标记
        favorite.setIsDeleted(true);
        favorite.setStatus("deleted");
        favorite.setDeletedTime(new Date());

        travelPostFavoriteRepository.save(favorite);

        // 更新帖子的收藏数（如果travel_post表有favoriteCount字段）
        TravelPost post = travelPostRepository.findById(postId).orElse(null);
        if (post != null && post.getFavoriteCount() != null && post.getFavoriteCount() > 0) {
            post.setFavoriteCount(post.getFavoriteCount() - 1);
            travelPostRepository.save(post);
        }
    }

    /**
     * 检查帖子是否已收藏
     */
    public boolean isPostFavorited(String phone, Long postId) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 检查是否已收藏
        return travelPostFavoriteRepository
                .existsByUserIdAndPostIdAndStatusAndIsDeleted(user.getUserId(), postId, "active", false);
    }

    /**
     * 添加景点收藏（支持幂等性）
     * 如果已经收藏过，直接返回成功；如果之前取消过收藏，则恢复收藏状态
     */
    @Transactional
    public AttractionFavoriteResponse addAttractionFavorite(String phone, String name, Double lat, Double lng,
                                                           String icon, String address, Float rating, String distance) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 参数验证
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("景点名称不能为空");
        }
        if (lat == null || lng == null) {
            throw new RuntimeException("经纬度不能为空");
        }

        // 🔧 幂等性检查：查找是否存在收藏记录（不论状态）
        Optional<AttractionFavorite> existingFavorite = attractionFavoriteRepository
                .findByUserIdAndNameAndLatAndLng(user.getUserId().intValue(), name, lat, lng);

        if (existingFavorite.isPresent()) {
            AttractionFavorite favorite = existingFavorite.get();
            
            // 如果已经是有效状态，直接返回（幂等性）
            if (Integer.valueOf(1).equals(favorite.getIsValid())) {
                System.out.println("✅ 景点已在收藏列表中（幂等返回）");
                return convertAttractionToResponse(favorite);
            }
            
            // 如果之前取消过收藏，恢复收藏状态
            System.out.println("🔄 恢复之前取消的景点收藏");
            favorite.setIsValid(1);
            favorite.setCreateTime(LocalDateTime.now()); // 更新收藏时间
            
            // 更新景点信息
            if (icon != null) favorite.setIcon(icon);
            if (address != null) favorite.setAddress(address);
            if (rating != null) favorite.setRating(rating);
            if (distance != null) favorite.setDistance(distance);
            
            AttractionFavorite savedFavorite = attractionFavoriteRepository.save(favorite);
            return convertAttractionToResponse(savedFavorite);
        }

        // 创建新的收藏记录
        System.out.println("➕ 创建新的景点收藏记录");
        AttractionFavorite favorite = new AttractionFavorite();
        favorite.setUserId(user.getUserId().intValue());
        favorite.setName(name);
        favorite.setLat(lat);
        favorite.setLng(lng);
        favorite.setIcon(icon);
        favorite.setAddress(address);
        favorite.setRating(rating);
        favorite.setDistance(distance);
        favorite.setIsValid(1); // 1=有效
        favorite.setCreateTime(LocalDateTime.now());

        // 保存收藏记录
        AttractionFavorite savedFavorite = attractionFavoriteRepository.save(favorite);

        // 转换为响应对象
        return convertAttractionToResponse(savedFavorite);
    }

    /**
     * 取消景点收藏（软删除）
     */
    @Transactional
    public void removeAttractionFavorite(String phone, String name, Double lat, Double lng) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 参数验证
        if (name == null || name.trim().isEmpty()) {
            throw new RuntimeException("景点名称不能为空");
        }
        if (lat == null || lng == null) {
            throw new RuntimeException("经纬度不能为空");
        }

        // 查找收藏记录
        AttractionFavorite favorite = attractionFavoriteRepository
                .findByUserIdAndNameAndLatAndLng(user.getUserId().intValue(), name, lat, lng)
                .orElseThrow(() -> new RuntimeException("未找到该景点的收藏记录"));

        // 检查是否已经取消收藏
        if (Integer.valueOf(0).equals(favorite.getIsValid())) {
            throw new RuntimeException("该景点收藏已被取消");
        }

        // 软删除：设置 is_valid 为 0
        favorite.setIsValid(0);
        attractionFavoriteRepository.save(favorite);
        
        System.out.println("✅ 景点收藏已取消");
    }

    /**
     * 检查景点是否已收藏
     */
    public boolean isAttractionFavorited(String phone, String name, Double lat, Double lng) {
        // 根据手机号查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 参数验证
        if (name == null || lat == null || lng == null) {
            return false;
        }

        // 检查是否已收藏（is_valid=1）
        Optional<AttractionFavorite> favorite = attractionFavoriteRepository
                .findByUserIdAndNameAndLatAndLng(user.getUserId().intValue(), name, lat, lng);
        
        return favorite.isPresent() && Integer.valueOf(1).equals(favorite.get().getIsValid());
    }
}

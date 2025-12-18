package com.example.auth.service;

import com.example.auth.dto.DayInfo;
import com.example.auth.dto.PopularTravelPlanSaveRequest;
import com.example.auth.dto.PopularTravelPlanResponse;
import com.example.auth.entity.PopularTravelPlan;
import com.example.auth.entity.User;
import com.example.auth.repository.PopularTravelPlanRepository;
import com.example.auth.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

@Service
public class PopularTravelPlanService {

    @Autowired
    private PopularTravelPlanRepository popularTravelPlanRepository;

    @Autowired
    private UserRepository userRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private User getUserByPhone(String phone) {
        return userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }

    @Transactional
    public PopularTravelPlanResponse saveTravelPlan(String phone, PopularTravelPlanSaveRequest request) {
        User user = getUserByPhone(phone);
        PopularTravelPlan popularTravelPlan;

        if (request.getPlanId() != null) {
            popularTravelPlan = popularTravelPlanRepository.findById(request.getPlanId())
                    .orElseThrow(() -> new RuntimeException("旅行计划不存在"));
            if (!popularTravelPlan.getUserId().equals(user.getUserId())) {
                throw new RuntimeException("无权修改此旅行计划");
            }
        } else {
            popularTravelPlan = new PopularTravelPlan();
            popularTravelPlan.setUserId(user.getUserId());
            popularTravelPlan.setCreatedAt(LocalDateTime.now());
        }

        BeanUtils.copyProperties(request, popularTravelPlan, "planId", "userId", "createdAt", "isFavorited", "days");

        try {
            popularTravelPlan.setDaysData(objectMapper.writeValueAsString(request.getDays()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("无法序列化每日行程数据", e);
        }

        popularTravelPlan.setIsFavorited(request.getIsFavorited() != null ? request.getIsFavorited() : false);

        PopularTravelPlan savedPlan = popularTravelPlanRepository.save(popularTravelPlan);

        PopularTravelPlanResponse response = new PopularTravelPlanResponse();
        BeanUtils.copyProperties(savedPlan, response);

        try {
            response.setDays(objectMapper.readValue(savedPlan.getDaysData(), objectMapper.getTypeFactory().constructCollectionType(List.class, DayInfo.class)));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("无法反序列化每日行程数据", e);
        }

        return response;
    }

    @Transactional
    public PopularTravelPlanResponse toggleFavoriteTravelPlan(String phone, Long planId) {
        User user = getUserByPhone(phone);

        PopularTravelPlan popularTravelPlan = popularTravelPlanRepository.findByPlanIdAndUserId(planId, user.getUserId())
                .orElseThrow(() -> new RuntimeException("旅行计划不存在或无权操作"));

        popularTravelPlan.setIsFavorited(!popularTravelPlan.getIsFavorited());

        PopularTravelPlan updatedPlan = popularTravelPlanRepository.save(popularTravelPlan);

        PopularTravelPlanResponse response = new PopularTravelPlanResponse();
        BeanUtils.copyProperties(updatedPlan, response);
        
        try {
            response.setDays(objectMapper.readValue(updatedPlan.getDaysData(), objectMapper.getTypeFactory().constructCollectionType(List.class, DayInfo.class)));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("无法反序列化每日行程数据", e);
        }
        
        return response;
    }

    public PopularTravelPlanResponse getTravelPlanById(String phone, Long planId) {
        User user = getUserByPhone(phone);

        PopularTravelPlan popularTravelPlan = popularTravelPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("旅行计划不存在"));

        PopularTravelPlanResponse response = new PopularTravelPlanResponse();
        BeanUtils.copyProperties(popularTravelPlan, response);

        try {
            response.setDays(objectMapper.readValue(popularTravelPlan.getDaysData(), objectMapper.getTypeFactory().constructCollectionType(List.class, DayInfo.class)));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("无法反序列化每日行程数据", e);
        }

        return response;
    }
}

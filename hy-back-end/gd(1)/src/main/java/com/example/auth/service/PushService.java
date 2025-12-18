package com.example.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PushService {

    @Value("${push.api.url}")
    private String pushUrl;

    private final RestTemplate restTemplate;

    public PushService() {
        this.restTemplate = new RestTemplate();
    }

    // 发送登录通知
    public void sendLoginNotification(String username, String userType, String userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> content = new HashMap<>();
            content.put("title", "用户登录通知");
            content.put("content", userType + "用户 [" + username + "] 已登录，ID: " + userId);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(content, headers);
            restTemplate.postForEntity(pushUrl, request, String.class);
        } catch (Exception e) {
            // 记录错误但不影响登录流程
            System.err.println("推送通知失败: " + e.getMessage());
        }
    }
}
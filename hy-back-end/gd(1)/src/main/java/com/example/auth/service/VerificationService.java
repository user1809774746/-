package com.example.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VerificationService {

    @Value("${verification.api.url}")
    private String verificationUrl;

    private final RestTemplate restTemplate;

    // 存储验证码：手机号 -> 验证码信息
    private final Map<String, VerificationCode> verificationCodes = new ConcurrentHashMap<>();

    // 验证码有效期（毫秒）- 5分钟
    private static final long CODE_EXPIRATION = 5 * 60 * 1000;

    public VerificationService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 发送验证码
     */
    public void sendVerificationCode(String phone) {
        // 生成6位数字验证码
        String code = generateCode();

        // 保存验证码
        verificationCodes.put(phone, new VerificationCode(code, System.currentTimeMillis()));

        try {
            // 根据图片中的格式构建URL
            // https://push.spug.cc/send/A27L****bgEY?name=推送助手&code=153146&targets=186xxxx9898
            String url = UriComponentsBuilder.fromHttpUrl(verificationUrl)
                    .queryParam("code", code)
                    .queryParam("targets", phone)
                    .toUriString();

            // 发送GET请求
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

            System.out.println("=== 验证码发送成功 ===");
            System.out.println("手机号: " + phone);
            System.out.println("验证码: " + code);
            System.out.println("响应: " + response.getBody());
            System.out.println("==================");

        } catch (Exception e) {
            System.err.println("发送验证码失败: " + e.getMessage());
            System.out.println("=== 验证码发送失败，但已保存在服务器 ===");
            System.out.println("手机号: " + phone);
            System.out.println("验证码: " + code);
            System.out.println("==================");
            // 即使推送失败，验证码也已保存，可以继续使用
        }
    }

    /**
     * 验证验证码
     */
    public boolean verifyCode(String phone, String code) {
        VerificationCode storedCode = verificationCodes.get(phone);

        if (storedCode == null) {
            return false;
        }

        // 检查是否过期
        if (System.currentTimeMillis() - storedCode.getTimestamp() > CODE_EXPIRATION) {
            verificationCodes.remove(phone);
            return false;
        }

        // 验证码正确则删除（一次性使用）
        if (storedCode.getCode().equals(code)) {
            verificationCodes.remove(phone);
            return true;
        }

        return false;
    }

    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    /**
     * 验证码信息类
     */
    private static class VerificationCode {
        private final String code;
        private final long timestamp;

        public VerificationCode(String code, long timestamp) {
            this.code = code;
            this.timestamp = timestamp;
        }

        public String getCode() {
            return code;
        }

        public long getTimestamp() {
            return timestamp;
        }
    }
}


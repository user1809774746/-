package com.example.auth.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

/**
 * 测试用的验证码控制器
 * 模拟第三方验证码平台返回验证码
 */
@RestController
@RequestMapping("/api/test")
public class TestVerificationController {

    // 存储发送的验证码（用于开发测试）
    private static final Map<String, String> sentCodes = new HashMap<>();
    
    /**
     * 模拟第三方验证码平台接口
     * 验证码直接发送到手机号，不返回给客户端
     */
    @PostMapping("/verification-code")
    public Map<String, Object> getVerificationCode(@RequestBody Map<String, Object> request) {
        String phone = (String) request.get("phone");
        
        // 生成6位数字验证码
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        String verificationCode = String.valueOf(code);
        
        // 存储验证码用于开发测试
        sentCodes.put(phone, verificationCode);
        
        // 模拟发送短信到手机号
        System.out.println("=== 模拟短信发送 ===");
        System.out.println("收件人: " + phone);
        System.out.println("短信内容: 您的验证码是：" + verificationCode + "，5分钟内有效。请勿告知他人。");
        System.out.println("发送状态: 发送成功");
        System.out.println("注意: 这是模拟发送，实际环境中会调用真实短信服务");
        System.out.println("==================");
        
        // 在实际生产环境中，这里应该调用真实的短信服务API
        // 例如：阿里云短信、腾讯云短信、华为云短信等
        // 示例代码：
        // smsService.sendSms(phone, "您的验证码是：" + verificationCode + "，5分钟内有效。");
        
        // 返回成功响应，但不包含验证码
        Map<String, Object> response = new HashMap<>();
        response.put("code", 200);
        response.put("msg", "验证码已发送到手机号");
        response.put("phone", phone);
        response.put("expireTime", "5分钟");
        // 注意：不返回验证码给客户端
        
        return response;
    }
    
    /**
     * 开发测试用接口：获取已发送的验证码
     */
    @GetMapping("/get-sent-code/{phone}")
    public Map<String, Object> getSentCode(@PathVariable String phone) {
        Map<String, Object> response = new HashMap<>();
        String code = sentCodes.get(phone);
        if (code != null) {
            response.put("code", 200);
            response.put("phone", phone);
            response.put("verificationCode", code);
            response.put("msg", "获取成功（仅用于开发测试）");
        } else {
            response.put("code", 404);
            response.put("msg", "未找到该手机号的验证码");
        }
        return response;
    }
    
    /**
     * 模拟第三方验证码平台接口 - 返回204状态
     */
    @PostMapping("/verification-code-204")
    public Map<String, Object> getVerificationCode204(@RequestBody Map<String, Object> request) {
        String phone = (String) request.get("phone");
        
        Map<String, Object> response = new HashMap<>();
        response.put("code", 204);
        response.put("msg", "请求成功，但未匹配到推送对象");
        response.put("phone", phone);
        
        System.out.println("=== 第三方验证码平台响应(204) ===");
        System.out.println("手机号: " + phone);
        System.out.println("状态: 204 - 未匹配到推送对象");
        System.out.println("==============================");
        
        return response;
    }
}

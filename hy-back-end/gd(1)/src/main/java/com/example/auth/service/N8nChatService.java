package com.example.auth.service;

import com.example.auth.dto.ChatRequest;
import com.example.auth.dto.ChatResponse;
import com.example.auth.dto.TravelPlanDTO;
import com.example.auth.entity.ChatMessage;
import com.example.auth.repository.ChatRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class N8nChatService {

    private final RestTemplate restTemplate;
    private final ChatRepository chatRepository;
    private final ObjectMapper objectMapper;
    private final ChatServiceUtils chatServiceUtils;

    @Value("${n8n.webhook.url:}")
    private String n8nWebhookUrl;

    @Value("${n8n.enabled:false}")
    private boolean n8nEnabled;

    public N8nChatService(RestTemplate restTemplate, ChatRepository chatRepository, ObjectMapper objectMapper, ChatServiceUtils chatServiceUtils) {
        this.restTemplate = restTemplate;
        this.chatRepository = chatRepository;
        this.objectMapper = objectMapper;
        this.chatServiceUtils = chatServiceUtils;
    }

    public ChatResponse sendMessage(ChatRequest request) {
        System.out.println("=== N8n 发送聊天消息 ===");
        System.out.println("SessionId: " + request.getSessionId());
        System.out.println("UserId: " + request.getUserId());
        System.out.println("ChatInput: " + request.getChatInput());
        System.out.println("n8n配置: " + (n8nEnabled ? "已启用" : "未启用"));
        System.out.println("n8n URL: " + n8nWebhookUrl);

        String reply;
        TravelPlanDTO.TravelPlanData travelPlanData = null;
        Long travelPlanId = null;

        if (n8nEnabled && chatServiceUtils.isValidUrl(n8nWebhookUrl)) {
            try {
                System.out.println("⏳ 正在调用n8n webhook...");

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                Map<String, Object> payload = Map.of(
                        "sessionId", request.getSessionId(),
                        "action", "sendMessage",
                        "chatInput", request.getChatInput()
                );
                System.out.println("📤 发送给n8n的数据: " + payload);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                ResponseEntity<Object> response = restTemplate.postForEntity(n8nWebhookUrl, entity, Object.class);

                System.out.println("📥 n8n HTTP状态码: " + response.getStatusCode());
                Object responseBody = response.getBody();
                System.out.println("📥 n8n返回体类型: " + (responseBody != null ? responseBody.getClass().getName() : "null"));
                System.out.println("📥 n8n返回体内容: " + responseBody);

                String extractedReply = extractN8nReply(responseBody);
                System.out.println("🔍 extractN8nReply结果: " + extractedReply);
                TravelPlanDTO.TravelPlanData extractedPlan = extractN8nTravelPlan(responseBody);
                System.out.println("🔍 extractN8nTravelPlan结果: " + (extractedPlan != null ? "有行程数据" : "无行程数据"));
                if (extractedPlan != null) {
                    travelPlanData = extractedPlan;
                    travelPlanId = chatServiceUtils.persistTravelPlan(extractedPlan, request.getUserId(), request.getOriginalTravelPlanId());
                }
                if (extractedReply != null && !extractedReply.trim().isEmpty()) {
                    reply = extractedReply;
                    System.out.println("✅ n8n响应成功: " + reply);
                } else {
                    reply = "抱歉，AI助手暂时无法回复，请稍后再试。";
                    System.err.println("⚠️ n8n响应格式错误，使用默认回复");
                }
            } catch (Exception e) {
                System.err.println("❌ 调用n8n失败");
                System.err.println("异常类型: " + e.getClass().getName());
                System.err.println("异常信息: " + e.getMessage());
                if (e.getCause() != null) {
                    System.err.println("根本原因: " + e.getCause().getMessage());
                }
                e.printStackTrace(); // 打印完整堆栈，方便排查
                reply = getMockResponse(request.getChatInput());
                System.out.println("💡 N8n调用失败，使用模拟响应: " + reply);
            }
        } else {
            System.out.println("💡 n8n未配置或未启用，使用模拟响应");
            reply = getMockResponse(request.getChatInput());
        }

        return ChatResponse.builder()
                .reply(reply)
                .travelPlan(travelPlanData)
                .travelPlanId(travelPlanId)
                .build();
    }


    public void streamMessage(ChatRequest request, HttpServletResponse servletResponse) {
        System.out.println("=== N8n 流式聊天开始 ===");
        System.out.println("SessionId: " + request.getSessionId());
        System.out.println("UserId: " + request.getUserId());
        System.out.println("ChatInput: " + request.getChatInput());
        System.out.println("n8n配置: " + (n8nEnabled ? "已启用" : "未启用"));
        System.out.println("n8n URL: " + n8nWebhookUrl);

        try {
            ChatMessage userMsg = new ChatMessage();
            userMsg.setUserId(request.getUserId());
            userMsg.setSessionId(request.getSessionId());
            userMsg.setRole("user");
            userMsg.setMessage(request.getChatInput());
            chatRepository.save(userMsg);
            System.out.println("✅ 用户消息已保存到数据库");
        } catch (Exception e) {
            System.err.println("⚠️ 保存用户消息失败: " + e.getMessage());
        }

        if (!n8nEnabled || !chatServiceUtils.isValidUrl(n8nWebhookUrl)) {
            try {
                servletResponse.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
                servletResponse.setContentType("text/plain;charset=UTF-8");
                servletResponse.getWriter().write("n8n 未启用或未正确配置");
                servletResponse.getWriter().flush();
            } catch (Exception ignored) {
            }
            return;
        }

        final StringBuilder fullDataCache = new StringBuilder();

        com.example.auth.util.StreamMetrics metrics = new com.example.auth.util.StreamMetrics();

        try {
            System.out.println("🚀 准备调用 n8n: " + n8nWebhookUrl);

            restTemplate.execute(n8nWebhookUrl, HttpMethod.POST, clientRequest -> {
                System.out.println("📤 正在发送请求到 n8n...");
                clientRequest.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                Map<String, Object> payload = Map.of(
                        "sessionId", request.getSessionId(),
                        "action", "sendMessage",
                        "chatInput", request.getChatInput()
                );
                objectMapper.writeValue(clientRequest.getBody(), payload);
            }, clientResponse -> {
                System.out.println("📥 收到 n8n 响应，开始处理流...");
                MediaType contentType = clientResponse.getHeaders().getContentType();
                if (contentType != null) {
                    servletResponse.setContentType(contentType.toString());
                }
                servletResponse.setHeader("Cache-Control", "no-cache");

                try (InputStream in = clientResponse.getBody();
                     OutputStream out = servletResponse.getOutputStream();
                     java.io.InputStreamReader reader = new java.io.InputStreamReader(in, java.nio.charset.StandardCharsets.UTF_8);
                     java.io.BufferedReader bufferedReader = new java.io.BufferedReader(reader)) {

                    System.out.println("🔄 开始读取流数据...");
                    char[] charBuffer = new char[8192];
                    int len;

                    while ((len = bufferedReader.read(charBuffer)) != -1) {
                        String chunk = new String(charBuffer, 0, len);
                        metrics.recordChunkReceived(chunk.length());

                        fullDataCache.append(chunk);

                        byte[] bytes = chunk.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        out.write(bytes);
                        out.flush();
                        metrics.recordChunkSent(bytes.length);
                    }

                    System.out.println("✅ 流数据读取完成，缓存大小: " + fullDataCache.length() + " 字符");
                }
                return null;
            });

            metrics.logSummary();

            System.out.println("🔍 开始解析缓存的完整数据...");
            parseAndSaveCompleteData(fullDataCache.toString(), request);

        } catch (Exception e) {
            System.err.println("❌ 流式调用 n8n 失败: " + e.getMessage());
            e.printStackTrace();
            try {
                if (!servletResponse.isCommitted()) {
                    servletResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
                    servletResponse.setContentType("text/plain;charset=UTF-8");
                    servletResponse.getWriter().write("调用 n8n 失败: " + e.getMessage());
                    servletResponse.getWriter().flush();
                }
            } catch (Exception ignored) {
            }
        }

        System.out.println("=== 流式聊天结束 ===");
    }

    /**
     * 从n8n响应体中提取回复文本，兼容对象或数组格式
     */
    @SuppressWarnings("unchecked")
    private String extractN8nReply(Object responseBody) {
        if (responseBody == null) {
            System.out.println("⚠️ extractN8nReply: responseBody 为 null");
            return null;
        }

        System.out.println("🔍 extractN8nReply: responseBody类型 = " + responseBody.getClass().getName());

        if (responseBody instanceof Map) {
            System.out.println("🔍 extractN8nReply: 检测到Map格式");
            Map<String, Object> map = (Map<String, Object>) responseBody;
            System.out.println("🔍 extractN8nReply: Map的所有key = " + map.keySet());
            Object text = map.get("text");
            if (text != null) {
                System.out.println("✅ extractN8nReply: 从Map中成功提取text字段");
                return text.toString();
            } else {
                System.out.println("⚠️ extractN8nReply: Map中没有text字段");
                Object reply = map.get("reply");
                if (reply != null) {
                    System.out.println("✅ extractN8nReply: 从Map中提取到reply字段");
                    return reply.toString();
                }
                Object message = map.get("message");
                if (message != null) {
                    System.out.println("✅ extractN8nReply: 从Map中提取到message字段");
                    return message.toString();
                }
            }
            return null;
        }

        if (responseBody instanceof List) {
            System.out.println("🔍 extractN8nReply: 检测到List格式");
            List<Object> list = (List<Object>) responseBody;
            System.out.println("🔍 extractN8nReply: List长度 = " + list.size());
            if (list.isEmpty()) {
                System.out.println("⚠️ extractN8nReply: List为空");
                return null;
            }
            Object first = list.get(0);
            System.out.println("🔍 extractN8nReply: List第一个元素类型 = " + (first != null ? first.getClass().getName() : "null"));
            if (first instanceof Map) {
                System.out.println("🔍 extractN8nReply: List第一个元素是Map");
                Map<String, Object> map = (Map<String, Object>) first;
                System.out.println("🔍 extractN8nReply: Map的所有key = " + map.keySet());
                Object text = map.get("text");
                if (text != null) {
                    System.out.println("✅ extractN8nReply: 从List[0].text中成功提取");
                    return text.toString();
                } else {
                    Object reply = map.get("reply");
                    if (reply != null) {
                        System.out.println("✅ extractN8nReply: 从List[0].reply中提取");
                        return reply.toString();
                    }
                    Object message = map.get("message");
                    if (message != null) {
                        System.out.println("✅ extractN8nReply: 从List[0].message中提取");
                        return message.toString();
                    }
                }
            }
            if (first != null) {
                System.out.println("🔍 extractN8nReply: List第一个元素直接toString");
                return first.toString();
            }
        }

        System.out.println("⚠️ extractN8nReply: 使用兜底方案 responseBody.toString()");
        return responseBody.toString();
    }

    /**
     * 提取travel_plan字段并转换为DTO
     */
    @SuppressWarnings("unchecked")
    private TravelPlanDTO.TravelPlanData extractN8nTravelPlan(Object responseBody) {
        if (responseBody == null) {
            System.err.println("❌ extractN8nTravelPlan: responseBody is null");
            return null;
        }

        System.out.println("🔍 extractN8nTravelPlan: responseBody类型 = " + responseBody.getClass().getName());

        Object container = responseBody;
        if (container instanceof List) {
            List<Object> list = (List<Object>) container;
            System.out.println("🔍 extractN8nTravelPlan: 是List，大小 = " + list.size());
            if (list.isEmpty()) {
                System.err.println("❌ extractN8nTravelPlan: List为空");
                return null;
            }
            container = list.get(0);
            System.out.println("🔍 extractN8nTravelPlan: List第一个元素类型 = " + container.getClass().getName());
        }

        if (container instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) container;
            System.out.println("🔍 extractN8nTravelPlan: Map的keys = " + map.keySet());

            Object travelPlanNode = map.containsKey("travel_plan") ? map.get("travel_plan") : map.get("travelPlan");
            if (travelPlanNode == null) {
                System.err.println("❌ extractN8nTravelPlan: 找不到travel_plan或travelPlan字段");
                return null;
            }

            System.out.println("🔍 extractN8nTravelPlan: travelPlanNode类型 = " + travelPlanNode.getClass().getName());

            try {
                if (travelPlanNode instanceof String) {
                    String jsonStr = ((String) travelPlanNode).trim();
                    System.out.println("🔍 extractN8nTravelPlan: travel_plan是String，长度 = " + jsonStr.length());
                    if (jsonStr.isEmpty()) {
                        System.err.println("❌ extractN8nTravelPlan: travel_plan字符串为空");
                        return null;
                    }
                    TravelPlanDTO.TravelPlanData result = objectMapper.readValue(jsonStr, TravelPlanDTO.TravelPlanData.class);
                    System.out.println("✅ extractN8nTravelPlan: 成功解析travel_plan (从String)");
                    return result;
                }
                TravelPlanDTO.TravelPlanData result = objectMapper.convertValue(travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                System.out.println("✅ extractN8nTravelPlan: 成功解析travel_plan (从Object)");
                return result;
            } catch (Exception e) {
                System.err.println("❌ extractN8nTravelPlan: travel_plan解析失败: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("❌ extractN8nTravelPlan: container不是Map，类型 = " + container.getClass().getName());
        }

        return null;
    }

    /**
     * 从SSE流中提取实际的AI回复文本
     * 支持两种格式：
     * 1. 标准SSE: data: {"type":"chunk","content":"你好"}
     * 2. n8n格式: {"type":"item","content":"你好"}
     */
    @SuppressWarnings("unchecked")
    private String extractN8nTextFromSSE(String sseResponse) {
        if (sseResponse == null || sseResponse.isEmpty()) {
            return null;
        }

        StringBuilder textBuilder = new StringBuilder();

        try {
            String[] lines = sseResponse.split("\n");

            for (String line : lines) {
                line = line.trim();

                if (line.isEmpty()) {
                    continue;
                }

                String jsonStr = line;
                if (line.startsWith("data:")) {
                    jsonStr = line.substring(5).trim();
                }

                if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                    continue;
                }

                try {
                    Map<String, Object> data = objectMapper.readValue(jsonStr, Map.class);
                    String type = (String) data.get("type");

                    if (("chunk".equals(type) || "item".equals(type)) && data.containsKey("content")) {
                        Object contentObj = data.get("content");
                        if (contentObj != null) {
                            String contentStr = contentObj.toString();

                            try {
                                Map<String, Object> contentData = objectMapper.readValue(contentStr, Map.class);

                                if (contentData.containsKey("text")) {
                                    Object textObj = contentData.get("text");
                                    if (textObj != null) {
                                        textBuilder.append(textObj.toString());
                                    }
                                } else {
                                    textBuilder.append(contentStr);
                                }
                            } catch (Exception e) {
                                textBuilder.append(contentStr);
                            }
                        }
                    }
                } catch (Exception e) {
                }
            }

            String result = textBuilder.toString().trim();
            System.out.println("🔍 从SSE流中提取的文本: " + (result.isEmpty() ? "(空)" : result.length() > 100 ? result.substring(0, 100) + "..." : result));
            return result.isEmpty() ? null : result;

        } catch (Exception e) {
            System.err.println("❌ 解析SSE流失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 从SSE流中提取travel_plan数据
     * 支持格式:
     * 1. data: {"type":"travel_plan","content":{...}}
     * 2. {"type":"travel_plan","content":{...}}
     * 3. data: {"travel_plan":{...}}
     *
     * 只有当返回的是有效的JSON格式旅行计划时才会提取
     */
    @SuppressWarnings("unchecked")
    private TravelPlanDTO.TravelPlanData extractN8nTravelPlanFromSSE(String sseResponse) {
        if (sseResponse == null || sseResponse.isEmpty()) {
            System.out.println("⚠️ extractN8nTravelPlanFromSSE: SSE响应为空");
            return null;
        }

        try {
            StringBuilder contentBuilder = new StringBuilder();
            String[] lines = sseResponse.split("\n");

            System.out.println("🔍 开始解析SSE流，共 " + lines.length + " 行");

            for (String line : lines) {
                line = line.trim();

                if (line.isEmpty()) {
                    continue;
                }

                String jsonStr = line;
                if (line.startsWith("data:")) {
                    jsonStr = line.substring(5).trim();
                }

                if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                    continue;
                }

                try {
                    Map<String, Object> data = objectMapper.readValue(jsonStr, Map.class);
                    String type = (String) data.get("type");

                    if ("item".equals(type) && data.containsKey("content")) {
                        Object content = data.get("content");
                        if (content != null) {
                            contentBuilder.append(content.toString());
                        }
                    }
                } catch (Exception e) {
                }
            }

            String fullContent = contentBuilder.toString();
            if (fullContent.isEmpty()) {
                System.out.println("⚠️ 未能从SSE流中提取到content内容");
                return null;
            }

            System.out.println("✅ 拼接后的content长度: " + fullContent.length());
            System.out.println("📝 content前200字符: " + fullContent.substring(0, Math.min(200, fullContent.length())));

            String jsonContent = extractJsonFromMarkdown(fullContent);
            if (jsonContent == null || jsonContent.isEmpty()) {
                System.out.println("⚠️ 无法从content中提取JSON数据");
                return null;
            }

            System.out.println("✅ 提取到的JSON长度: " + jsonContent.length());

            try {
                Map<String, Object> contentData = objectMapper.readValue(jsonContent, Map.class);

                if (contentData.containsKey("travel_plan")) {
                    Object travelPlanNode = contentData.get("travel_plan");
                    if (travelPlanNode != null) {
                        System.out.println("✅ 在content中找到travel_plan字段");

                        TravelPlanDTO.TravelPlanData travelPlan;
                        if (travelPlanNode instanceof String) {
                            travelPlan = objectMapper.readValue((String) travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                        } else {
                            travelPlan = objectMapper.convertValue(travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                        }

                        if (chatServiceUtils.isValidTravelPlan(travelPlan)) {
                            System.out.println("✅ 验证通过：这是一个有效的旅行计划JSON");
                            return travelPlan;
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("⚠️ 解析content失败: " + e.getMessage());
            }

            System.out.println("ℹ️ SSE流中未找到travel_plan数据");
            return null;

        } catch (Exception e) {
            System.err.println("❌ 从SSE流提取travel_plan失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 从可能包含Markdown代码块的文本中提取JSON
     * 支持格式：
     * 1. ```json { ... } ```
     * 2. ``` { ... } ```
     * 3. 纯JSON { ... }
     */
    private String extractJsonFromMarkdown(String content) {
        if (content == null || content.isEmpty()) {
            return null;
        }

        String trimmed = content.trim();

        Pattern pattern = Pattern.compile(
                "```(?:json)?\\s*\\r?\\n([\\s\\S]*?)\\r?\\n```",
                Pattern.DOTALL
        );
        Matcher matcher = pattern.matcher(trimmed);

        if (matcher.find()) {
            String extracted = matcher.group(1).trim();
            System.out.println("🔍 从Markdown代码块中提取到JSON");
            return extracted;
        }

        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            System.out.println("🔍 content直接是JSON格式");
            return trimmed;
        }

        int firstBrace = trimmed.indexOf('{');
        int lastBrace = trimmed.lastIndexOf('}');

        if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
            String extracted = trimmed.substring(firstBrace, lastBrace + 1);
            System.out.println("🔍 通过大括号提取到JSON片段");
            return extracted;
        }

        System.out.println("⚠️ 无法从content中识别JSON格式");
        return null;
    }

    /**
     * 解析并保存缓存的完整流式数据
     * 在流传输结束后调用，从完整数据中提取AI回复和travel_plan
     */
    @SuppressWarnings("unchecked")
    private void parseAndSaveCompleteData(String fullData, ChatRequest request) {
        System.out.println("📊 parseAndSaveCompleteData: 开始解析完整数据");
        System.out.println("   - 数据大小: " + fullData.length() + " 字符");

        try {
            String aiReply = extractN8nTextFromSSE(fullData);
            if (aiReply == null) {
                aiReply = "";
            }

            if (!aiReply.isEmpty()) {
                ChatMessage aiMsg = new ChatMessage();
                aiMsg.setUserId(request.getUserId());
                aiMsg.setSessionId(request.getSessionId());
                aiMsg.setRole("assistant");
                aiMsg.setMessage(aiReply);
                chatRepository.save(aiMsg);
                System.out.println("✅ AI回复已保存到chat_history表");
            }

            TravelPlanDTO.TravelPlanData travelPlanData = extractN8nTravelPlanFromSSE(fullData);

            if (travelPlanData != null) {
                System.out.println("✅ 检测到travel_plan数据，准备保存...");
                try {
                    Long travelPlanId = chatServiceUtils.persistTravelPlan(
                            travelPlanData,
                            request.getUserId(),
                            request.getOriginalTravelPlanId()
                    );

                    if (travelPlanId != null) {
                        System.out.println("✅ 旅行计划已保存到travel_plans表，ID: " + travelPlanId);
                    }
                } catch (Exception e) {
                    System.err.println("❌ 保存旅行计划时发生异常: " + e.getMessage());
                    e.printStackTrace();
                }
            }

        } catch (Exception e) {
            System.err.println("❌ parseAndSaveCompleteData失败: " + e.getMessage());
            e.printStackTrace();
        }

        System.out.println("📊 parseAndSaveCompleteData: 解析完成");
    }

    /**
     * 模拟AI响应
     * 当n8n不可用时使用
     */
    private String getMockResponse(String userMessage) {
        String lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.contains("你好") || lowerMessage.contains("hi") || lowerMessage.contains("hello")) {
            return "你好！我是AI旅游助手，很高兴为您服务。请问有什么可以帮助您的吗？";
        } else if (lowerMessage.contains("景点") || lowerMessage.contains("旅游")) {
            return "我可以为您推荐热门旅游景点和制定旅游路线。请告诉我您想去哪个城市或地区？";
        } else if (lowerMessage.contains("路线") || lowerMessage.contains("规划")) {
            return "我可以帮您规划旅游路线。请告诉我您的出发地、目的地和大概的时间安排。";
        } else if (lowerMessage.contains("天气")) {
            return "要查询天气信息，请告诉我具体的城市名称和日期。";
        } else if (lowerMessage.contains("谢谢") || lowerMessage.contains("感谢")) {
            return "不客气！如有其他问题，随时欢迎咨询。祝您旅途愉快！";
        } else if (lowerMessage.contains("再见") || lowerMessage.contains("拜拜")) {
            return "再见！期待下次为您服务，祝您生活愉快！";
        } else {
            return "收到您的消息：「" + userMessage + "」。" +
                    "我是AI旅游助手，目前正在学习中。如需完整功能，请联系管理员配置n8n服务。" +
                    "我可以帮您查询景点信息、规划旅游路线等。有什么我可以帮助您的吗？";
        }
    }
}

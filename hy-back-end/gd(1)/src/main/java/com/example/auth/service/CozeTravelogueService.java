package com.example.auth.service;

import com.example.auth.dto.TravelogueRequest;
import com.example.auth.dto.TravelogueResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class CozeTravelogueService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ChatServiceUtils chatServiceUtils;

    @Value("${coze.api.url}")
    private String cozeApiUrl;

    @Value("${coze.api.token}")
    private String cozeApiToken;

    @Value("${coze.bot.id:}")
    private String cozeBotId;

    @Value("${coze.enabled:false}")
    private boolean cozeEnabled;

    public TravelogueResponse generateTravelogue(TravelogueRequest request) {
        System.out.println("=== Coze 生成游记 ===");
        System.out.println("UserId: " + request.getUserId());
        System.out.println("Destination: " + request.getDestination());
        System.out.println("TravelPlan: " + request.getTravelPlan());
        System.out.println("Coze配置: " + (cozeEnabled ? "已启用" : "未启用"));
        System.out.println("Coze URL: " + cozeApiUrl);

        String travelogueContent = "";

        if (!cozeEnabled || !chatServiceUtils.isValidUrl(cozeApiUrl)) {
            System.out.println("💡 Coze未启用或未正确配置，无法生成游记。");
            return TravelogueResponse.builder()
                    .content("Coze游记生成服务未启用或未正确配置。")
                    .success(false)
                    .build();
        }

        try {
            System.out.println("⏳ 正在调用Coze API 生成游记...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(cozeApiToken);

            List<Map<String, Object>> messages = new ArrayList<>();
            String promptContent = buildPrompt(request);
            System.out.println("DEBUG: buildPrompt returned: " + promptContent);
            Map<String, Object> messageEntry = new HashMap<>();
            messageEntry.put("role", "user");
            messageEntry.put("content", promptContent); // 直接放入 JSON 字符串
            System.out.println("DEBUG: messageEntry before adding: " + objectMapper.writeValueAsString(messageEntry));
            messages.add(messageEntry);

            Map<String, Object> body = new HashMap<>();
            body.put("conversation_id", request.getUserId() + "_travelogue");
            body.put("bot_id", cozeBotId);
            body.put("user_id", request.getUserId()); // 将 "user" 改为 "user_id"
            body.put("stream", false);
            body.put("additional_messages", messages); // 将 "messages" 改为 "additional_messages"

            // 添加日志，打印将发送给Coze的完整JSON请求体
            System.out.println("📤 发送给Coze的完整JSON请求体: " + objectMapper.writeValueAsString(body));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Object> response = restTemplate.postForEntity(cozeApiUrl, entity, Object.class);

            System.out.println("📥 Coze HTTP状态码: " + response.getStatusCode());
            Object responseBody = response.getBody();
            System.out.println("📥 Coze返回体类型: " + (responseBody != null ? responseBody.getClass().getName() : "null"));
            System.out.println("📥 Coze返回体内容: " + responseBody);

            // 尝试从第一次响应中获取 conversation_id
            String conversationId = null;
            if (responseBody instanceof Map) {
                Map<String, Object> responseMap = (Map<String, Object>) responseBody;
                if (responseMap.containsKey("data")) {
                    Object dataObj = responseMap.get("data");
                    if (dataObj instanceof Map) {
                        Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                        conversationId = (String) dataMap.get("conversation_id");
                        System.out.println("🔍 从Coze响应中提取到conversation_id: " + conversationId);
                    }
                }
            }

            // 如果获取到 conversation_id，则进行轮询
            if (conversationId != null && !conversationId.isEmpty()) {
                int maxRetries = 10; // 最大重试次数
                long retryDelayMillis = 2000; // 重试间隔（毫秒）

                for (int i = 0; i < maxRetries; i++) {
                    System.out.println("🔁 正在轮询Coze API获取完整消息 (尝试 " + (i + 1) + "/" + maxRetries + ")...");

                    // 构建轮询请求体 (只包含必要信息，不发送新的用户消息)
                    Map<String, Object> pollingBody = new HashMap<>();
                    pollingBody.put("conversation_id", conversationId);
                    pollingBody.put("bot_id", cozeBotId);
                    pollingBody.put("user_id", request.getUserId());
                    pollingBody.put("stream", false);
                    // 不再发送 "additional_messages" 字段，因为我们是在查询而不是发送新消息

                    // 打印轮询请求体（用于调试）
                    System.out.println("📤 发送给Coze的轮询JSON请求体: " + objectMapper.writeValueAsString(pollingBody));

                    HttpEntity<Map<String, Object>> pollingEntity = new HttpEntity<>(pollingBody, headers);
                    ResponseEntity<Object> pollingResponse = restTemplate.postForEntity(cozeApiUrl, pollingEntity, Object.class);

                    System.out.println("📥 Coze轮询HTTP状态码: " + pollingResponse.getStatusCode());
                    Object pollingResponseBody = pollingResponse.getBody();
                    System.out.println("📥 Coze轮询返回体类型: " + (pollingResponseBody != null ? pollingResponseBody.getClass().getName() : "null"));
                    System.out.println("📥 Coze轮询返回体内容: " + pollingResponseBody);

                    String currentTravelogueContent = extractTravelogueFromCozeResponse(pollingResponseBody);

                    if (currentTravelogueContent != null && !currentTravelogueContent.trim().isEmpty()) {
                        travelogueContent = currentTravelogueContent;
                        System.out.println("✅ 轮询成功：获取到Coze生成的游记内容。");
                        break; // 获取到内容，跳出循环
                    }

                    if (i < maxRetries - 1) {
                        Thread.sleep(retryDelayMillis); // 延迟后重试
                    }
                }
            } else {
                System.err.println("❌ 未能从Coze的第一次响应中获取到conversation_id，无法进行轮询。");
                // 如果没有conversation_id，也无法获取游记内容
                travelogueContent = "抱歉，无法与Coze建立有效对话。";
            }

            if (travelogueContent != null && !travelogueContent.trim().isEmpty()) {
                System.out.println("✅ Coze游记生成成功。");
                return TravelogueResponse.builder()
                        .content(travelogueContent)
                        .success(true)
                        .build();
            } else {
                System.err.println("⚠️ Coze响应格式错误或未生成游记内容，使用默认回复。");
                travelogueContent = "抱歉，Coze暂时无法生成游记，请稍后再试。";
                return TravelogueResponse.builder()
                        .content(travelogueContent)
                        .success(false)
                        .build();
            }
        } catch (Exception e) {
            System.err.println("❌ 调用Coze API 生成游记失败");
            System.err.println("异常类型: " + e.getClass().getName());
            System.err.println("异常信息: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("根本原因: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            travelogueContent = "Coze游记服务暂时不可用，请稍后再试。";
            return TravelogueResponse.builder()
                    .content(travelogueContent)
                    .success(false)
                    .build();
        }
    }

    public void streamTravelogue(TravelogueRequest request, HttpServletResponse servletResponse) {
        System.out.println("=== Coze 流式生成游记 ===");
        System.out.println("UserId: " + request.getUserId());
        System.out.println("Destination: " + request.getDestination());
        System.out.println("TravelPlan: " + request.getTravelPlan());
        System.out.println("Coze配置: " + (cozeEnabled ? "已启用" : "未启用"));
        System.out.println("Coze URL: " + cozeApiUrl);

        if (!cozeEnabled || !chatServiceUtils.isValidUrl(cozeApiUrl)) {
            try {
                servletResponse.setStatus(org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE.value());
                servletResponse.setContentType("text/plain;charset=UTF-8");
                servletResponse.getWriter().write("Coze服务未启用或API URL未正确配置。");
                servletResponse.getWriter().flush();
            } catch (Exception ignored) {
            }
            return;
        }

        try {
            System.out.println("⏳ 正在调用Coze API 流式生成游记...");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(cozeApiToken);

            List<Map<String, Object>> messages = new ArrayList<>();
            String promptContent = buildPrompt(request);
            System.out.println("DEBUG: buildPrompt returned: " + promptContent);
            Map<String, Object> messageEntry = new HashMap<>();
            messageEntry.put("role", "user");
            messageEntry.put("content", promptContent); // 直接放入 JSON 字符串
            System.out.println("DEBUG: messageEntry before adding: " + objectMapper.writeValueAsString(messageEntry));
            messages.add(messageEntry);

            Map<String, Object> body = new HashMap<>();
            body.put("conversation_id", request.getUserId() + "_travelogue");
            body.put("bot_id", cozeBotId);
            body.put("user_id", request.getUserId());
            body.put("stream", true); // 启用流式模式
            body.put("additional_messages", messages);

            System.out.println("📤 发送给Coze的完整JSON请求体: " + objectMapper.writeValueAsString(body));

            // 使用 RestTemplate 的 execute 方法处理流式响应
            restTemplate.execute(cozeApiUrl, org.springframework.http.HttpMethod.POST, clientRequest -> {
                clientRequest.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                clientRequest.getHeaders().setBearerAuth(cozeApiToken);
                objectMapper.writeValue(clientRequest.getBody(), body);
            }, clientResponse -> {
                servletResponse.setContentType(MediaType.TEXT_EVENT_STREAM_VALUE); // SSE Content Type
                servletResponse.setCharacterEncoding("UTF-8");
                servletResponse.setHeader("Cache-Control", "no-cache");
                servletResponse.setHeader("Connection", "keep-alive");

                try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(clientResponse.getBody(), java.nio.charset.StandardCharsets.UTF_8));
                     java.io.PrintWriter writer = servletResponse.getWriter()) {

                    String line;
                    while ((line = reader.readLine()) != null) {
                        System.out.println("🔍 收到Coze流数据: " + line); // 打印收到的每一行数据
                        if (line.startsWith("data:")) {
                            String jsonData = line.substring(5).trim();

                            // 增加日志，打印完整的jsonData内容
                            System.out.println("🔍 尝试解析Coze流数据JSON: " + jsonData);

                            // 在尝试解析JSON之前，更严格地检查是否是 "[DONE]"
                            if (jsonData.equals("[DONE]")) {
                                System.out.println("✅ 收到Coze流结束标识 [DONE]");
                                writer.write("data: [DONE]\n\n"); // 转发结束标识
                                writer.flush();
                                break; // 结束循环
                            }

                            // 直接转发原始JSON数据块到客户端
                            writer.write("event: message\n"); // 保持事件类型
                            writer.write("data: " + jsonData + "\n\n"); // 转发原始JSON字符串
                            writer.flush();
                            System.out.println("✅ 转发原始JSON数据块: " + jsonData.substring(0, Math.min(jsonData.length(), 50)) + "...");

                        } else if (!line.trim().isEmpty()) { // 非数据行但非空，直接转发（例如心跳包）
                            writer.write(line + "\n\n"); // 转发原始行，确保有双换行
                            writer.flush();
                        }
                    }
                }
                return null;
            });

        } catch (Exception e) {
            System.err.println("❌ 调用Coze API 流式生成游记失败");
            System.err.println("异常类型: " + e.getClass().getName());
            System.err.println("异常信息: " + e.getMessage());
            if (e.getCause() != null) {
                System.err.println("根本原因: " + e.getCause().getMessage());
            }
            e.printStackTrace();
            try {
                if (!servletResponse.isCommitted()) {
                    servletResponse.setStatus(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR.value());
                    servletResponse.setContentType("text/plain;charset=UTF-8");
                    servletResponse.getWriter().write("Coze游记服务暂时不可用或发生错误: " + e.getMessage());
                    servletResponse.getWriter().flush();
                }
            } catch (Exception ignored) {
            }
        }
        System.out.println("=== Coze 流式生成游记结束 ===");
    }

    private String buildPrompt(TravelogueRequest request) {
        Map<String, String> contentMap = new HashMap<>();
        // 仅在有实际数据时才添加到 contentMap
        if (request.getTravelPlan() != null && !request.getTravelPlan().isEmpty()) {
            contentMap.put("TravelPlan", request.getTravelPlan());
        }
        if (request.getDestination() != null && !request.getDestination().isEmpty()) {
            contentMap.put("Destination", request.getDestination());
        }
        if (request.getExistingTravelogue() != null && !request.getExistingTravelogue().isEmpty()) {
            contentMap.put("ExistingTravelogue", request.getExistingTravelogue());
        }

        try {
            // 返回纯JSON字符串
            return objectMapper.writeValueAsString(contentMap);
        } catch (Exception e) {
            System.err.println("❌ 构建Coze请求内容JSON失败: " + e.getMessage());
            return "{}"; // 降级为发送空JSON对象字符串
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTravelogueFromCozeResponse(Object responseBody) {
        // 此方法不再用于流式响应的实时解析，但可能在错误处理时用于解析非流式响应
        if (responseBody instanceof Map) {
            Map<String, Object> responseMap = (Map<String, Object>) responseBody;
            if (responseMap.containsKey("data")) {
                Object dataObj = responseMap.get("data");
                if (dataObj instanceof Map) {
                    Map<String, Object> dataMap = (Map<String, Object>) dataObj;
                    if (dataMap.containsKey("messages")) {
                        List<Map<String, Object>> messages = (List<Map<String, Object>>) dataMap.get("messages");
                        for (Map<String, Object> message : messages) {
                            String type = (String) message.get("type");
                            if ("answer".equals(type) && message.containsKey("content")) {
                                return (String) message.get("content");
                            }
                        }
                    } else if (dataMap.containsKey("additional_messages")) {
                        List<Map<String, Object>> messages = (List<Map<String, Object>>) dataMap.get("additional_messages");
                        for (Map<String, Object> message : messages) {
                            String type = (String) message.get("type");
                            if ("answer".equals(type) && message.containsKey("content")) {
                                return (String) message.get("content");
                            }
                        }
                    } else {
                        System.out.println("ℹ️ Coze响应的data中未找到messages或additional_messages字段。");
                    }
                } else {
                    System.out.println("ℹ️ Coze响应的data字段不是Map类型。");
                }
            } else {
                System.out.println("ℹ️ Coze响应中未找到data字段。");
            }
        }
        return null;
    }
}

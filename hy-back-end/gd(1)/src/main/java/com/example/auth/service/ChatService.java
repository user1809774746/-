package com.example.auth.service;

import com.example.auth.dto.ChatRequest;
import com.example.auth.dto.ChatResponse;
import com.example.auth.entity.ChatMessage;
import com.example.auth.entity.TravelPlan;
import com.example.auth.repository.ChatRepository;
import com.example.auth.dto.TravelogueRequest;
import com.example.auth.dto.TravelPlanDTO;
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
public class ChatService {
    private final ChatRepository chatRepository;
    private final CozeTravelogueService cozeTravelogueService;
    private final N8nChatService n8nChatService;
    private final ChatServiceUtils chatServiceUtils;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TravelPlanService travelPlanService;

    @Value("${n8n.webhook.url:}")
    private String n8nWebhookUrl;

    @Value("${n8n.enabled:false}")
    private boolean n8nEnabled;

    public ChatService(ChatRepository chatRepository, CozeTravelogueService cozeTravelogueService, 
                      N8nChatService n8nChatService, ChatServiceUtils chatServiceUtils,
                      RestTemplate restTemplate, ObjectMapper objectMapper, 
                      TravelPlanService travelPlanService) {
        this.chatRepository = chatRepository;
        this.cozeTravelogueService = cozeTravelogueService;
        this.n8nChatService = n8nChatService;
        this.chatServiceUtils = chatServiceUtils;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.travelPlanService = travelPlanService;
    }

    /**
     * 发送聊天消息
     * 根据配置决定使用Coze、n8n或模拟响应
     */
    public ChatResponse sendMessage(ChatRequest request) {
        // 保存用户输入
        ChatMessage userMsg = new ChatMessage();
        userMsg.setUserId(request.getUserId());
        userMsg.setSessionId(request.getSessionId());
        userMsg.setRole("user");
        userMsg.setMessage(request.getChatInput());
        chatRepository.save(userMsg);
        System.out.println("✅ 用户消息已保存到数据库");

        String reply;
        TravelPlanDTO.TravelPlanData travelPlanData = null;
        Long travelPlanId = null;

        // 检查n8n是否配置且启用
        if (n8nEnabled && isValidUrl(n8nWebhookUrl)) {
            try {
                System.out.println("⏳ 正在调用n8n webhook...");
                
                // 调用 n8n（按照n8n要求的格式）
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                Map<String, Object> payload = Map.of(
                        "sessionId", request.getSessionId(),
                        "action", "sendMessage",  // 固定值
                        "chatInput", request.getChatInput()
                );
                System.out.println("📤 发送给n8n的数据: " + payload);
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
                ResponseEntity<Object> response = restTemplate.postForEntity(n8nWebhookUrl + "wait=true", entity, Object.class);

                System.out.println("📥 n8n HTTP状态码: " + response.getStatusCode());
                Object responseBody = response.getBody();
                System.out.println("📥 n8n返回体类型: " + (responseBody != null ? responseBody.getClass().getName() : "null"));
                System.out.println("📥 n8n返回体内容: " + responseBody);
                
                String extractedReply = extractReply(responseBody);
                System.out.println("🔍 extractReply结果: " + extractedReply);
                TravelPlanDTO.TravelPlanData extractedPlan = extractTravelPlan(responseBody);
                System.out.println("🔍 extractTravelPlan结果: " + (extractedPlan != null ? "有行程数据" : "无行程数据"));
                if (extractedPlan != null) {
                    travelPlanData = extractedPlan;
                    travelPlanId = persistTravelPlan(extractedPlan, request.getUserId(), request.getOriginalTravelPlanId());
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
                System.out.println("💡 使用模拟响应: " + reply);
            }
        } else {
            // n8n未配置，使用模拟响应
            System.out.println("💡 n8n未配置，使用模拟响应");
            reply = getMockResponse(request.getChatInput());
        }
        ChatResponse response = n8nChatService.sendMessage(request);

        // 保存AI回复
        ChatMessage aiMsg = new ChatMessage();
        aiMsg.setUserId(request.getUserId());
        aiMsg.setSessionId(request.getSessionId());
        aiMsg.setRole("assistant");
        aiMsg.setMessage(response.getReply());
        chatRepository.save(aiMsg);
        System.out.println("✅ AI回复已保存到数据库");
        System.out.println("===================\n");

        return response;
    }

    /**
     * 流式转发 AI 的响应给前端
     */
    public void streamMessage(ChatRequest request, HttpServletResponse servletResponse) {
        System.out.println("=== 流式聊天开始 ===");
        System.out.println("SessionId: " + request.getSessionId());
        System.out.println("UserId: " + request.getUserId());
        System.out.println("ChatInput: " + request.getChatInput());
        System.out.println("n8n配置: " + (n8nEnabled ? "已启用" : "未启用"));
        System.out.println("n8n URL: " + n8nWebhookUrl);

        // 保存用户输入到数据库
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

        if (!n8nEnabled || !isValidUrl(n8nWebhookUrl)) {
            try {
                servletResponse.setStatus(HttpStatus.SERVICE_UNAVAILABLE.value());
                servletResponse.setContentType("text/plain;charset=UTF-8");
                servletResponse.getWriter().write("n8n 未启用或未正确配置");
                servletResponse.getWriter().flush();
            } catch (Exception ignored) {
            }
            return;
        }

        // 用于缓存完整的流式数据（用于最终解析）
        final StringBuilder fullDataCache = new StringBuilder();
        // 用于实时累积AI回复文本（用于实时返回）
        final StringBuilder textBuilder = new StringBuilder();
        
        // 行缓冲器
        final com.example.auth.util.StreamLineBuffer lineBuffer = new com.example.auth.util.StreamLineBuffer();
        com.example.auth.util.StreamMetrics metrics = new com.example.auth.util.StreamMetrics();
        
        // 用于收集完整的AI回复和travel_plan
        final TravelPlanDTO.TravelPlanData[][] collectedTravelPlan = {{null}};

        // 先使用临时变量构建最终要发送给n8n的chatInput
        String tempChatInput = request.getChatInput();
        if (request.getOriginalTravelPlanId() != null) {
            try {
                String composed = travelPlanService.buildShareToAIContext(
                        request.getOriginalTravelPlanId(),
                        null,
                        request.getChatInput() + "\n\n请忽略之前对话中提到的其他旅行计划，只针对上面的这份计划进行修改，并返回更新后的 travel_plan 数据。"
                );
                if (composed != null && !composed.trim().isEmpty()) {
                    tempChatInput = composed;
                }
            } catch (Exception e) {
                System.err.println("⚠️ 构建带行程上下文的chatInput失败: " + e.getMessage());
            }
        }

        // 将最终结果赋值给实际用于lambda中的final变量
        final String chatInputToSend = tempChatInput;

        try {
            System.out.println("🚀 准备调用 n8n: " + n8nWebhookUrl);
            
            // 调用 n8n 并处理响应流
            restTemplate.execute(n8nWebhookUrl, HttpMethod.POST, clientRequest -> {
                System.out.println("📤 正在发送请求到 n8n...");
                clientRequest.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                Map<String, Object> payload = Map.of(
                        "sessionId", request.getSessionId(),
                        "action", "sendMessage",
                        "chatInput", chatInputToSend
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
                    char[] charBuffer = new char[8192]; // 增大缓冲区
                    int len;
                    
                    while ((len = bufferedReader.read(charBuffer)) != -1) {
                        String chunk = new String(charBuffer, 0, len);
                        metrics.recordChunkReceived(chunk.length());
                        
                        // 缓存完整数据到内存
                        fullDataCache.append(chunk);
                        
                        // 同时实时转发给前端（保持用户体验）
                        byte[] bytes = chunk.getBytes(java.nio.charset.StandardCharsets.UTF_8);
                        out.write(bytes);
                        out.flush();
                        metrics.recordChunkSent(bytes.length);
                    }
                    
                    System.out.println("✅ 流数据读取完成，缓存大小: " + fullDataCache.length() + " 字符");
                }
                return null;
            });
            
            // 记录统计信息
            metrics.logSummary();
            
            // 流结束后，解析缓存的完整数据
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
     * 转义JSON字符串中的特殊字符
     */
    private String escapeJson(String str) {
        if (str == null) {
            return "";
        }
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    /**
     * 从n8n响应体中提取回复文本，兼容对象或数组格式
     * 支持n8n新格式: [{"output": "文本内容..."}]
     */
    @SuppressWarnings("unchecked")
    private String extractReply(Object responseBody) {
        if (responseBody == null) {
            System.out.println("⚠️ extractReply: responseBody 为 null");
            return null;
        }

        System.out.println("🔍 extractReply: responseBody类型 = " + responseBody.getClass().getName());

        if (responseBody instanceof Map) {
            System.out.println("🔍 extractReply: 检测到Map格式");
            Map<String, Object> map = (Map<String, Object>) responseBody;
            System.out.println("🔍 extractReply: Map的所有key = " + map.keySet());
            
            // 优先检查output字段（n8n新格式）
            Object output = map.get("output");
            if (output != null) {
                System.out.println("✅ extractReply: 从Map中提取到output字段");
                return output.toString();
            }
            
            Object text = map.get("text");
            if (text != null) {
                System.out.println("✅ extractReply: 从Map中成功提取text字段");
                return text.toString();
            } else {
                System.out.println("⚠️ extractReply: Map中没有text字段");
                // 尝试其他常见字段名
                Object reply = map.get("reply");
                if (reply != null) {
                    System.out.println("✅ extractReply: 从Map中提取到reply字段");
                    return reply.toString();
                }
                Object message = map.get("message");
                if (message != null) {
                    System.out.println("✅ extractReply: 从Map中提取到message字段");
                    return message.toString();
                }
            }
            return null;
        }

        if (responseBody instanceof List) {
            System.out.println("🔍 extractReply: 检测到List格式");
            List<Object> list = (List<Object>) responseBody;
            System.out.println("🔍 extractReply: List长度 = " + list.size());
            if (list.isEmpty()) {
                System.out.println("⚠️ extractReply: List为空");
                return null;
            }
            Object first = list.get(0);
            System.out.println("🔍 extractReply: List第一个元素类型 = " + (first != null ? first.getClass().getName() : "null"));
            if (first instanceof Map) {
                System.out.println("🔍 extractReply: List第一个元素是Map");
                Map<String, Object> map = (Map<String, Object>) first;
                System.out.println("🔍 extractReply: Map的所有key = " + map.keySet());
                
                // 优先检查output字段（n8n新格式）
                Object output = map.get("output");
                if (output != null) {
                    System.out.println("✅ extractReply: 从List[0].output中提取");
                    return output.toString();
                }
                
                Object text = map.get("text");
                if (text != null) {
                    System.out.println("✅ extractReply: 从List[0].text中成功提取");
                    return text.toString();
                } else {
                    System.out.println("⚠️ extractReply: List[0]中没有text字段");
                    // 尝试其他常见字段名
                    Object reply = map.get("reply");
                    if (reply != null) {
                        System.out.println("✅ extractReply: 从List[0].reply中提取");
                        return reply.toString();
                    }
                    Object message = map.get("message");
                    if (message != null) {
                        System.out.println("✅ extractReply: 从List[0].message中提取");
                        return message.toString();
                    }
                }
            }
            if (first != null) {
                System.out.println("🔍 extractReply: List第一个元素直接toString");
                return first.toString();
            }
        }

        System.out.println("⚠️ extractReply: 使用兜底方案 responseBody.toString()");
        return responseBody.toString();
    }

    /**
     * 提取travel_plan字段并转换为DTO
     * 支持n8n新格式: [{"output": "...```json\n{\"travel_plan\":{...}}\n```..."}]
     */
    @SuppressWarnings("unchecked")
    private TravelPlanDTO.TravelPlanData extractTravelPlan(Object responseBody) {
        if (responseBody == null) {
            System.err.println("❌ extractTravelPlan: responseBody is null");
            return null;
        }

        System.out.println("🔍 extractTravelPlan: responseBody类型 = " + responseBody.getClass().getName());

        Object container = responseBody;
        if (container instanceof List) {
            List<Object> list = (List<Object>) container;
            System.out.println("🔍 extractTravelPlan: 是List，大小 = " + list.size());
            if (list.isEmpty()) {
                System.err.println("❌ extractTravelPlan: List为空");
                return null;
            }
            container = list.get(0);
            System.out.println("🔍 extractTravelPlan: List第一个元素类型 = " + container.getClass().getName());
        }

        if (container instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) container;
            System.out.println("🔍 extractTravelPlan: Map的keys = " + map.keySet());
            
            // 优先检查是否有output字段（n8n新格式）
            if (map.containsKey("output")) {
                Object outputObj = map.get("output");
                if (outputObj != null) {
                    String outputStr = outputObj.toString();
                    System.out.println("🔍 extractTravelPlan: 检测到output字段，长度 = " + outputStr.length());
                    
                    // 从output字符串中提取JSON
                    String jsonContent = extractJsonFromMarkdown(outputStr);
                    if (jsonContent != null && !jsonContent.isEmpty()) {
                        try {
                            System.out.println("🔍 extractTravelPlan: 尝试从output的JSON中提取travel_plan");
                            Map<String, Object> contentData = objectMapper.readValue(jsonContent, Map.class);
                            
                            if (contentData.containsKey("travel_plan")) {
                                Object travelPlanNode = contentData.get("travel_plan");
                                if (travelPlanNode != null) {
                                    System.out.println("✅ extractTravelPlan: 在output的JSON中找到travel_plan字段");
                                    TravelPlanDTO.TravelPlanData result;
                                    if (travelPlanNode instanceof String) {
                                        result = objectMapper.readValue((String) travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                                    } else {
                                        result = objectMapper.convertValue(travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                                    }
                                    return result;
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("⚠️ extractTravelPlan: 从output解析失败: " + e.getMessage());
                        }
                    }
                }
            }
            
            // 兜底：直接查找travel_plan字段（旧格式）
            Object travelPlanNode = map.containsKey("travel_plan") ? map.get("travel_plan") : map.get("travelPlan");
            if (travelPlanNode == null) {
                System.err.println("❌ extractTravelPlan: 找不到travel_plan或travelPlan字段");
                return null;
            }
            
            System.out.println("🔍 extractTravelPlan: travelPlanNode类型 = " + travelPlanNode.getClass().getName());
            
            try {
                if (travelPlanNode instanceof String) {
                    String jsonStr = ((String) travelPlanNode).trim();
                    System.out.println("🔍 extractTravelPlan: travel_plan是String，长度 = " + jsonStr.length());
                    if (jsonStr.isEmpty()) {
                        System.err.println("❌ extractTravelPlan: travel_plan字符串为空");
                        return null;
                    }
                    TravelPlanDTO.TravelPlanData result = objectMapper.readValue(jsonStr, TravelPlanDTO.TravelPlanData.class);
                    System.out.println("✅ extractTravelPlan: 成功解析travel_plan (从String)");
                    return result;
                }
                TravelPlanDTO.TravelPlanData result = objectMapper.convertValue(travelPlanNode, TravelPlanDTO.TravelPlanData.class);
                System.out.println("✅ extractTravelPlan: 成功解析travel_plan (从Object)");
                return result;
            } catch (Exception e) {
                System.err.println("❌ extractTravelPlan: travel_plan解析失败: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.err.println("❌ extractTravelPlan: container不是Map，类型 = " + container.getClass().getName());
        }

        return null;
    }

    private Long persistTravelPlan(TravelPlanDTO.TravelPlanData travelPlanData, String userId, Long originalTravelPlanId) {
        System.out.println("📦 persistTravelPlan 被调用");
        System.out.println("   - travelPlanData: " + (travelPlanData != null ? "存在" : "null"));
        System.out.println("   - userId: " + userId);
        System.out.println("   - originalTravelPlanId: " + originalTravelPlanId);
        
        if (travelPlanData == null) {
            System.err.println("❌ persistTravelPlan: travelPlanData为null，无法保存");
            return null;
        }
        
        try {
            Long targetUserId = parseUserId(userId);
            System.out.println("   - 解析后的targetUserId: " + targetUserId);
            
            TravelPlan savedPlan;
            
            if (originalTravelPlanId != null) {
                // 更新现有计划
                System.out.println("🔄 更新现有旅行计划，ID: " + originalTravelPlanId);
                savedPlan = travelPlanService.updateTravelPlanFromN8n(travelPlanData, targetUserId, originalTravelPlanId);
                System.out.println("✅ 旅行计划已更新，ID: " + savedPlan.getId());
            } else {
                // 创建新计划
                System.out.println("➕ 创建新旅行计划");
                System.out.println("   - 标题: " + travelPlanData.getTitle());
                System.out.println("   - 目的地: " + travelPlanData.getDestination());
                savedPlan = travelPlanService.saveTravelPlanFromN8n(travelPlanData, targetUserId);
                System.out.println("✅ 旅行计划已保存，ID: " + savedPlan.getId());
            }
            
            return savedPlan.getId();
        } catch (Exception e) {
            System.err.println("❌ 保存/更新旅行计划失败: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (Exception e) {
            return 1L;
        }
    }

    /**
     * 获取聊天历史记录
     */
    public List<ChatMessage> getHistory(String sessionId) {
        return chatRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }

    /**
     * 调用Coze服务流式生成游记
     */
    private boolean isValidUrl(String url) {
        if (url == null || url.trim().isEmpty()) {
            return false;
        }
        // 检查是否是占位符
        if (url.contains("your-n8n-domain") || url.contains("example.com")) {
            return false;
        }
        return url.startsWith("http://") || url.startsWith("https://");
    }

    /**
     * 从SSE流中提取实际的AI回复文本
     * 支持两种格式：
     * 1. 标准SSE: data: {"type":"chunk","content":"你好"}
     * 2. n8n格式: {"type":"item","content":"你好"}
     */
    private String extractTextFromSSE(String sseResponse) {
        if (sseResponse == null || sseResponse.isEmpty()) {
            return null;
        }

        StringBuilder textBuilder = new StringBuilder();
        
        try {
            // 按行分割响应
            String[] lines = sseResponse.split("\n");
            
            for (String line : lines) {
                line = line.trim();
                
                // 跳过空行
                if (line.isEmpty()) {
                    continue;
                }
                
                // 提取JSON字符串（支持带data:前缀和不带前缀）
                String jsonStr = line;
                if (line.startsWith("data:")) {
                    jsonStr = line.substring(5).trim();
                }
                
                if (jsonStr.isEmpty() || jsonStr.equals("[DONE]")) {
                    continue;
                }
                
                try {
                    // 解析JSON
                    Map<String, Object> data = objectMapper.readValue(jsonStr, Map.class);
                    String type = (String) data.get("type");
                    
                    // 提取content字段（支持chunk和item类型）
                    if (("chunk".equals(type) || "item".equals(type)) && data.containsKey("content")) {
                        Object contentObj = data.get("content");
                        if (contentObj != null) {
                            String contentStr = contentObj.toString();
                            
                            // 尝试解析content，看是否为JSON格式（包含text字段）
                            try {
                                Map<String, Object> contentData = objectMapper.readValue(contentStr, Map.class);
                                
                                // 如果content是JSON且包含text字段，只提取text
                                if (contentData.containsKey("text")) {
                                    Object textObj = contentData.get("text");
                                    if (textObj != null) {
                                        textBuilder.append(textObj.toString());
                                    }
                                } else {
                                    // content是JSON但不包含text，拼接整个content
                                    textBuilder.append(contentStr);
                                }
                            } catch (Exception e) {
                                // content不是JSON，直接拼接
                                textBuilder.append(contentStr);
                            }
                        }
                    }
                } catch (Exception e) {
                    // 忽略无法解析的行
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
    private TravelPlanDTO.TravelPlanData extractTravelPlanFromSSE(String sseResponse) {
        if (sseResponse == null || sseResponse.isEmpty()) {
            System.out.println("⚠️ extractTravelPlanFromSSE: SSE响应为空");
            return null;
        }

        try {
            // 第一步：提取并拼接所有 type:"item" 的 content 字段
            StringBuilder contentBuilder = new StringBuilder();
            String[] lines = sseResponse.split("\n");
            
            System.out.println("🔍 开始解析SSE流，共 " + lines.length + " 行");
            
            for (String line : lines) {
                line = line.trim();
                
                if (line.isEmpty()) {
                    continue;
                }
                
                // 提取JSON字符串
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
                    
                    // n8n返回格式：{"type":"item","content":"..."}
                    if ("item".equals(type) && data.containsKey("content")) {
                        Object content = data.get("content");
                        if (content != null) {
                            contentBuilder.append(content.toString());
                        }
                    }
                } catch (Exception e) {
                    // 继续下一行
                }
            }
            
            String fullContent = contentBuilder.toString();
            if (fullContent.isEmpty()) {
                System.out.println("⚠️ 未能从SSE流中提取到content内容");
                return null;
            }
            
            System.out.println("✅ 拼接后的content长度: " + fullContent.length());
            System.out.println("📝 content前200字符: " + fullContent.substring(0, Math.min(200, fullContent.length())));
            
            // 第二步：从content中提取JSON（可能被markdown代码块包裹）
            String jsonContent = extractJsonFromMarkdown(fullContent);
            if (jsonContent == null || jsonContent.isEmpty()) {
                System.out.println("⚠️ 无法从content中提取JSON数据");
                return null;
            }
            
            System.out.println("✅ 提取到的JSON长度: " + jsonContent.length());
            
            // 第三步：解析JSON，提取travel_plan
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
                        
                        // 验证是否为有效的旅行计划
                        if (isValidTravelPlan(travelPlan)) {
                            System.out.println("✅ 验证通过：这是一个有效的旅行计划JSON");
                            return travelPlan;
                        } else {
                            System.out.println("⚠️ 验证失败：travel_plan数据不完整，跳过保存");
                            return null;
                        }
                    }
                } else {
                    System.out.println("ℹ️ content中没有travel_plan字段");
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
        
        // 尝试提取markdown代码块中的JSON
        // 匹配 ```json ... ``` 或 ``` ... ```
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile(
            "```(?:json)?\\s*\\r?\\n([\\s\\S]*?)\\r?\\n```", 
            java.util.regex.Pattern.DOTALL
        );
        java.util.regex.Matcher matcher = pattern.matcher(trimmed);
        
        if (matcher.find()) {
            String extracted = matcher.group(1).trim();
            System.out.println("🔍 从Markdown代码块中提取到JSON");
            return extracted;
        }
        
        // 如果没有代码块，检查是否直接是JSON
        if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
            System.out.println("🔍 content直接是JSON格式");
            return trimmed;
        }
        
        // 最后尝试：查找第一个 { 到最后一个 } 之间的内容
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
     * 验证旅行计划数据是否有效
     * 必须包含：标题、目的地、天数
     */
    private boolean isValidTravelPlan(TravelPlanDTO.TravelPlanData travelPlan) {
        if (travelPlan == null) {
            System.out.println("   - 验证失败：travelPlan为null");
            return false;
        }
        
        // 1️⃣ 标题和目的地是最基本的必填字段
        if (travelPlan.getTitle() == null || travelPlan.getTitle().trim().isEmpty()) {
            System.out.println("   - 验证失败：缺少标题");
            return false;
        }

        if (travelPlan.getDestination() == null || travelPlan.getDestination().trim().isEmpty()) {
            System.out.println("   - 验证失败：缺少目的地");
            return false;
        }

        // 2️⃣ 旅行天数缺失时仅做告警，不再拦截保存
        if (travelPlan.getTravelDays() == null || travelPlan.getTravelDays().trim().isEmpty()) {
            System.out.println("   - 警告：缺少旅行天数，将依赖后续默认值处理");
        }

        // 3️⃣ 每日行程缺失时同样只做告警，允许保存简化行程
        int itineraryCount = 0;
        if (travelPlan.getDailyItinerary() == null || travelPlan.getDailyItinerary().isEmpty()) {
            System.out.println("   - 警告：缺少每日行程，将保存为无明细的旅行计划");
        } else {
            itineraryCount = travelPlan.getDailyItinerary().size();
        }

        System.out.println("   - 标题: " + travelPlan.getTitle());
        System.out.println("   - 目的地: " + travelPlan.getDestination());
        System.out.println("   - 天数: " + travelPlan.getTravelDays());
        System.out.println("   - 行程数: " + itineraryCount);
        
        return true;
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
            // 1. 提取AI回复文本
            String aiReply = extractTextFromSSE(fullData);
            if (aiReply == null) {
                aiReply = "";
            } else {
                aiReply = aiReply.trim();
            }
            System.out.println("   - AI回复长度: " + aiReply.length());
            
            // 2. 保存AI回复到chat_history
            if (!aiReply.isEmpty()) {
                ChatMessage aiMsg = new ChatMessage();
                aiMsg.setUserId(request.getUserId());
                aiMsg.setSessionId(request.getSessionId());
                aiMsg.setRole("assistant");
                aiMsg.setMessage(aiReply);
                chatRepository.save(aiMsg);
                System.out.println("✅ AI回复已保存到chat_history表");
            } else {
                System.err.println("⚠️ AI回复为空，未保存到数据库");
            }
            
            // 3. 尝试从完整数据中提取travel_plan
            TravelPlanDTO.TravelPlanData travelPlanData = extractTravelPlanFromSSE(fullData);
            
            // 4. 保存travel_plan到数据库
            if (travelPlanData != null) {
                System.out.println("✅ 检测到travel_plan数据，准备保存...");
                try {
                    Long travelPlanId = persistTravelPlan(
                        travelPlanData, 
                        request.getUserId(), 
                        request.getOriginalTravelPlanId()
                    );
                    
                    if (travelPlanId != null) {
                        System.out.println("✅ 旅行计划已保存到travel_plans表，ID: " + travelPlanId);
                    } else {
                        System.err.println("⚠️ 旅行计划保存失败，返回ID为null");
                    }
                } catch (Exception e) {
                    System.err.println("❌ 保存旅行计划时发生异常: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("ℹ️ 完整数据中未检测到travel_plan，可能是普通对话");
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

        // 简单的关键词匹配
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

    /**
     * 流式生成游记
     * 委托给CozeTravelogueService处理
     */
    public void streamTravelogue(TravelogueRequest request, HttpServletResponse response) {
        cozeTravelogueService.streamTravelogue(request, response);
    }
}


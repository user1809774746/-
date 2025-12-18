package com.example.auth.controller;

import com.example.auth.dto.ChatRequest;
import com.example.auth.dto.ChatResponse;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.entity.ChatMessage;
import com.example.auth.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import javax.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.example.auth.dto.TravelogueRequest;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    /**
     * 发送聊天消息到n8n
     * @param request 包含用户消息、sessionId、userId
     * @return 统一响应格式，包含AI回复
     */
    @PostMapping("/send")
    public ResponseDTO sendMessage(@RequestBody ChatRequest request) {
        try {
            // 参数验证
            if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
                return ResponseDTO.error(400, "会话ID不能为空");
            }
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                return ResponseDTO.error(400, "用户ID不能为空");
            }
            if (request.getChatInput() == null || request.getChatInput().trim().isEmpty()) {
                return ResponseDTO.error(400, "消息内容不能为空");
            }

            ChatResponse chatResponse = chatService.sendMessage(request);

            Map<String, Object> result = new HashMap<>();
            result.put("reply", chatResponse.getReply());
            result.put("travelPlanId", chatResponse.getTravelPlanId());
            result.put("travelPlan", chatResponse.getTravelPlan());
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(500, "发送消息失败: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "服务器错误: " + e.getMessage());
        }
    }

    /**
     * 流式发送聊天消息到n8n
     * 直接转发n8n的流式响应给前端，前端可以实现打字机效果
     * @param request 包含用户消息、sessionId、userId
     * @param response HttpServletResponse，用于写入流式数据
     */
    @PostMapping("/stream")
    public void streamMessage(@RequestBody ChatRequest request, HttpServletResponse response) {
        try {
            // 参数验证
            if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
                response.setStatus(400);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("会话ID不能为空");
                response.getWriter().flush();
                return;
            }
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                response.setStatus(400);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("用户ID不能为空");
                response.getWriter().flush();
                return;
            }
            if (request.getChatInput() == null || request.getChatInput().trim().isEmpty()) {
                response.setStatus(400);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("消息内容不能为空");
                response.getWriter().flush();
                return;
            }

            // 调用service的流式方法，直接转发n8n的响应
            chatService.streamMessage(request, response);
        } catch (Exception e) {
            try {
                if (!response.isCommitted()) {
                    response.setStatus(500);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("服务器错误: " + e.getMessage());
                    response.getWriter().flush();
                }
            } catch (Exception ignored) {
            }
        }
    }

    /**
     * 获取聊天历史记录
     * @param sessionId 会话ID
     * @return 统一响应格式，包含历史消息列表
     */
    @GetMapping("/history")
    public ResponseDTO getHistory(@RequestParam String sessionId) {
        try {
            // 参数验证
            if (sessionId == null || sessionId.trim().isEmpty()) {
                return ResponseDTO.error(400, "会话ID不能为空");
            }

            List<ChatMessage> history = chatService.getHistory(sessionId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("sessionId", sessionId);
            result.put("total", history.size());
            result.put("messages", history);
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(500, "获取历史记录失败: " + e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "服务器错误: " + e.getMessage());
        }
    }

    /**
     * 调用Coze服务流式生成游记
     * @param request 包含用户ID、目的地、旅行计划详情、文风、长度等信息
     * @param response HttpServletResponse，用于写入流式数据
     */
    @PostMapping("/travelogue/stream-generate")
    public void streamGenerateTravelogue(@RequestBody TravelogueRequest request, HttpServletResponse response) {
        try {
            if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
                response.setStatus(400);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("用户ID不能为空");
                response.getWriter().flush();
                return;
            }
            if ((request.getDestination() == null || request.getDestination().trim().isEmpty()) &&
                (request.getTravelPlan() == null || request.getTravelPlan().trim().isEmpty()) &&
                (request.getExistingTravelogue() == null || request.getExistingTravelogue().trim().isEmpty())) {
                response.setStatus(400);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("目的地、旅行计划详情或需要润色的游记内容至少填写一项");
                response.getWriter().flush();
                return;
            }

            chatService.streamTravelogue(request, response);
        } catch (Exception e) {
            try {
                if (!response.isCommitted()) {
                    response.setStatus(500);
                    response.setContentType("text/plain;charset=UTF-8");
                    response.getWriter().write("服务器错误: " + e.getMessage());
                    response.getWriter().flush();
                }
            } catch (Exception ignored) {
            }
        }
    }
}


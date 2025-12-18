package com.example.chat.config;

import com.example.chat.websocket.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket配置类
 */
@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final ChatWebSocketHandler chatWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // 注册聊天WebSocket处理器
        registry.addHandler(chatWebSocketHandler, "/api/ws/chat")
                .setAllowedOrigins("*") // 生产环境应该限制具体域名
                .withSockJS(); // 支持SockJS降级
        
        // 不使用SockJS的原生WebSocket连接
        registry.addHandler(chatWebSocketHandler, "/api/ws/chat/native")
                .setAllowedOrigins("*");
    }
}

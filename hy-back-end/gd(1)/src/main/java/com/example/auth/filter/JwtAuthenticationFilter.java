package com.example.auth.filter;

import com.example.auth.util.JwtUtil;
import com.example.auth.service.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.lang.NonNull;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

/**
 * JWT认证过滤器
 * 负责验证请求中的token，并实现顶号检测
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private TokenService tokenService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String token = extractTokenFromRequest(request);

        if (token != null && jwtUtil.validateToken(token)) {
            String phone = jwtUtil.getUsernameFromToken(token);
            String userType = jwtUtil.getUserTypeFromToken(token);

            // 验证token是否为当前活跃token（顶号检测：如果被新登录覆盖则验证失败）
            if (tokenService.validateToken(token, phone, userType)) {
                // Token有效，创建认证对象并设置到安全上下文
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        phone,
                        null,
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userType.toUpperCase()))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                System.out.println("请求认证成功: " + phone + " (" + userType + ")");
            } else {
                // Token无效（被顶号、已过期或已清除），清除认证信息
                SecurityContextHolder.clearContext();
                System.out.println("⚠️ Token验证失败，用户: " + phone + " (" + userType + ") - 可能被顶号或已过期");
                
                // 设置响应状态码为401，并添加错误信息
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"code\":401,\"message\":\"Token已失效，请重新登录\",\"data\":\"您的账号可能在其他设备登录，或token已过期\"}");
                return; // 终止请求处理
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
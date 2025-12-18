package com.example.auth.config;

import com.example.auth.filter.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf().disable() // 禁用CSRF保护，适用于REST API
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 无状态会话
            .and()
            .authorizeRequests()


            .antMatchers("/api/auth/register", "/api/auth/login", "/api/auth/login-by-code", "/api/auth/send-verification-code", "/api/auth/auto-login", "/api/auth/check-auto-login", "/api/auth/admin/quick-register", "/test/**", "/api/chat/**", "/api/user-chat/**", "/api/group/**", "/api/ws/**", "/swagger-ui/**", "/v3/api-docs/**", "/api/travel-plans/images/**", "/api/provinces/**", "/images/**", "/api/activities/media/**", "/uploads/**").permitAll() // 允许注册、登录、验证码登录、发送验证码、七天免密登录、管理员快速注册、聊天API、WebSocket、测试接口、省份API、活动媒体访问、上传文件访问不需要认证


            .anyRequest().authenticated() // 其他所有请求都需要认证
            .and()
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // 添加JWT过滤器
        
        return http.build();
    }
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的来源（支持生产环境域名和本地开发）
        configuration.setAllowedOriginPatterns(Collections.singletonList("*"));
        // 允许所有 HTTP 方法
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // 允许所有头部（包括 Authorization、Content-Type 等）
        configuration.setAllowedHeaders(Arrays.asList("*"));
        

        // 允许携带凭证（cookies、authorization headers）
        configuration.setAllowCredentials(false);

        // 暴露的响应头
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization", "Content-Type", "Content-Disposition",
            "X-Request-ID", "X-Response-Time"
        ));

        // 预检请求缓存时间（1小时）
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 应用于所有路径

        return source;
    }

}
package com.example.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // 连接超时：10秒
        factory.setConnectTimeout(10000);
        // 读取超时：60秒（AI生成内容可能需要较长时间）
        factory.setReadTimeout(60000);
        return new RestTemplate(factory);
    }
}

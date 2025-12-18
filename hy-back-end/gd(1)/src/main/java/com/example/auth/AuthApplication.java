package com.example.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.servlet.server.ConfigurableServletWebServerFactory;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication(scanBasePackages = {"com.example.auth", "com.example.chat", "com.example.common"})
@EntityScan(basePackages = {"com.example.auth.entity", "com.example.chat.entity", "com.example.common.entity"})
@EnableJpaRepositories(basePackages = {"com.example.auth.repository", "com.example.chat.repository", "com.example.common.repository"})
@EnableScheduling
public class AuthApplication {

    public static void main(String[] args) {
        // 获取ApplicationContext对象
        ConfigurableApplicationContext context = SpringApplication.run(AuthApplication.class, args);
        
        // 添加JVM关闭钩子，确保应用程序正常关闭时释放资源
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("应用程序正在关闭，释放端口资源...");
            // 关闭Spring上下文，这会自动关闭所有资源，包括网络连接和数据库连接
            context.close();
            System.out.println("应用程序已关闭，端口资源已释放");
        }));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Autowired
    private Environment environment;
    
    // 配置优雅关闭的Tomcat参数，确保连接正确关闭
    @Bean
    public ConfigurableServletWebServerFactory webServerFactory() {
        TomcatServletWebServerFactory factory = new TomcatServletWebServerFactory();
        factory.addConnectorCustomizers(connector -> {
            connector.setPort(Integer.parseInt(environment.getProperty("server.port", "8081")));
            // 设置关闭超时时间为5秒
            connector.setProperty("connectionTimeout", "5000");
        });
        return factory;
    }
}
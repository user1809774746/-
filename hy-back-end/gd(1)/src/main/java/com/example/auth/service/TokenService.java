package com.example.auth.service;

import com.example.auth.entity.Administrator;
import com.example.auth.entity.User;
import com.example.auth.repository.AdministratorRepository;
import com.example.auth.repository.UserRepository;
import com.example.auth.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Calendar;
import java.util.Date;

/**
 * Token服务 - 统一管理token的生成、存储、验证和删除
 * 实现七天免密登录和顶号机制
 */
@Service
public class TokenService {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    // Token有效期：7天
    private static final int TOKEN_VALIDITY_DAYS = 7;

    /**
     * 为用户生成并保存token
     * @param phone 手机号
     * @param userType 用户类型 "user" 或 "admin"
     * @return 生成的token
     */
    @Transactional
    public String generateAndSaveToken(String phone, String userType) {
        // 生成JWT token
        String token = jwtUtil.generateToken(phone, userType);
        
        // 计算token过期时间（7天后）
        Calendar calendar = Calendar.getInstance();
        Date now = calendar.getTime();
        calendar.add(Calendar.DAY_OF_MONTH, TOKEN_VALIDITY_DAYS);
        Date expiresAt = calendar.getTime();

        // 根据用户类型保存token
        if ("user".equals(userType)) {
            User user = userRepository.findByNumber(phone)
                    .orElseThrow(() -> new RuntimeException("用户不存在"));
            
            // 保存新token（会自动覆盖旧token，实现顶号）
            user.setActiveToken(token);
            user.setTokenCreatedAt(now);
            user.setTokenExpiresAt(expiresAt);
            user.setLastLoginDate(now);
            userRepository.save(user);
            
            System.out.println("=== 用户Token已生成并保存 ===");
            System.out.println("手机号: " + phone);
            System.out.println("Token过期时间: " + expiresAt);
            
        } else if ("admin".equals(userType)) {
            Administrator admin = administratorRepository.findByPhone(phone)
                    .orElseThrow(() -> new RuntimeException("管理员不存在"));
            
            // 保存新token（会自动覆盖旧token，实现顶号）
            admin.setActiveToken(token);
            admin.setTokenCreatedAt(now);
            admin.setTokenExpiresAt(expiresAt);
            admin.setLastLoginDate(now);
            administratorRepository.save(admin);
            
            System.out.println("=== 管理员Token已生成并保存 ===");
            System.out.println("手机号: " + phone);
            System.out.println("Token过期时间: " + expiresAt);
        }

        return token;
    }

    /**
     * 验证token是否有效
     * @param token 待验证的token
     * @param phone 手机号
     * @param userType 用户类型
     * @return true表示token有效，false表示无效
     */
    public boolean validateToken(String token, String phone, String userType) {
        try {
            // 1. 首先验证JWT token本身的有效性
            if (!jwtUtil.validateToken(token)) {
                System.out.println("Token验证失败: JWT格式无效");
                return false;
            }

            // 2. 从数据库获取存储的activeToken
            String storedToken = null;
            Date expiresAt = null;

            if ("user".equals(userType)) {
                User user = userRepository.findByNumber(phone).orElse(null);
                if (user != null) {
                    storedToken = user.getActiveToken();
                    expiresAt = user.getTokenExpiresAt();
                }
            } else if ("admin".equals(userType)) {
                Administrator admin = administratorRepository.findByPhone(phone).orElse(null);
                if (admin != null) {
                    storedToken = admin.getActiveToken();
                    expiresAt = admin.getTokenExpiresAt();
                }
            }

            // 3. 检查数据库中是否有存储的token
            if (storedToken == null) {
                System.out.println("Token验证失败: 数据库中无此token（可能从未登录或已被清除）");
                return false;
            }

            // 4. 比对token是否一致（顶号检测：如果不一致说明被新登录顶掉了）
            if (!token.equals(storedToken)) {
                System.out.println("Token验证失败: Token不匹配（已被顶号）");
                System.out.println("请求Token: " + token.substring(0, Math.min(20, token.length())) + "...");
                System.out.println("存储Token: " + storedToken.substring(0, Math.min(20, storedToken.length())) + "...");
                return false;
            }

            // 5. 检查token是否过期
            if (expiresAt != null && new Date().after(expiresAt)) {
                System.out.println("Token验证失败: Token已过期");
                System.out.println("过期时间: " + expiresAt);
                // 清除过期token
                clearToken(phone, userType);
                return false;
            }

            System.out.println("Token验证成功: " + phone + " (" + userType + ")");
            return true;

        } catch (Exception e) {
            System.err.println("Token验证异常: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 清除用户的token（用于登出或token过期）
     * @param phone 手机号
     * @param userType 用户类型
     */
    @Transactional
    public void clearToken(String phone, String userType) {
        try {
            if ("user".equals(userType)) {
                User user = userRepository.findByNumber(phone).orElse(null);
                if (user != null) {
                    user.setActiveToken(null);
                    user.setTokenCreatedAt(null);
                    user.setTokenExpiresAt(null);
                    userRepository.save(user);
                    System.out.println("用户Token已清除: " + phone);
                }
            } else if ("admin".equals(userType)) {
                Administrator admin = administratorRepository.findByPhone(phone).orElse(null);
                if (admin != null) {
                    admin.setActiveToken(null);
                    admin.setTokenCreatedAt(null);
                    admin.setTokenExpiresAt(null);
                    administratorRepository.save(admin);
                    System.out.println("管理员Token已清除: " + phone);
                }
            }
        } catch (Exception e) {
            System.err.println("清除Token失败: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * 检查用户是否可以使用七天免密登录
     * @param phone 手机号
     * @param userType 用户类型
     * @return true表示可以免密登录，false表示需要重新登录
     */
    public boolean canAutoLogin(String phone, String userType) {
        try {
            String storedToken = null;
            Date expiresAt = null;

            if ("user".equals(userType)) {
                User user = userRepository.findByNumber(phone).orElse(null);
                if (user != null) {
                    storedToken = user.getActiveToken();
                    expiresAt = user.getTokenExpiresAt();
                }
            } else if ("admin".equals(userType)) {
                Administrator admin = administratorRepository.findByPhone(phone).orElse(null);
                if (admin != null) {
                    storedToken = admin.getActiveToken();
                    expiresAt = admin.getTokenExpiresAt();
                }
            }

            // 检查是否有有效的token
            if (storedToken == null || expiresAt == null) {
                return false;
            }

            // 检查token是否过期
            if (new Date().after(expiresAt)) {
                // 清除过期token
                clearToken(phone, userType);
                return false;
            }

            return true;

        } catch (Exception e) {
            System.err.println("检查自动登录失败: " + e.getMessage());
            return false;
        }
    }

    /**
     * 获取用户的当前token
     * @param phone 手机号
     * @param userType 用户类型
     * @return token字符串，如果不存在返回null
     */
    public String getActiveToken(String phone, String userType) {
        try {
            if ("user".equals(userType)) {
                User user = userRepository.findByNumber(phone).orElse(null);
                return user != null ? user.getActiveToken() : null;
            } else if ("admin".equals(userType)) {
                Administrator admin = administratorRepository.findByPhone(phone).orElse(null);
                return admin != null ? admin.getActiveToken() : null;
            }
        } catch (Exception e) {
            System.err.println("获取Token失败: " + e.getMessage());
        }
        return null;
    }
}


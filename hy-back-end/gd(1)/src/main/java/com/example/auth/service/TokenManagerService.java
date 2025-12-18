package com.example.auth.service;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Service
public class TokenManagerService {

    // 存储用户的活跃令牌：用户标识 -> 令牌ID
    private final Map<String, String> activeTokens = new ConcurrentHashMap<>();
    
    // 存储令牌详细信息：令牌ID -> 令牌信息
    private final Map<String, TokenInfo> tokenDetails = new ConcurrentHashMap<>();

    /**
     * 用户登录时，设置新的活跃令牌（顶号逻辑）
     * @param userKey 用户唯一标识（手机号+用户类型）
     * @param tokenId 新令牌的唯一标识
     * @param token 完整的JWT令牌
     */
    public void setActiveToken(String userKey, String tokenId, String token) {
        System.out.println("=== 顶号逻辑执行 ===");
        
        // 检查是否有旧令牌
        String oldTokenId = activeTokens.get(userKey);
        if (oldTokenId != null) {
            System.out.println("检测到用户 " + userKey + " 的旧令牌: " + oldTokenId);
            // 移除旧令牌
            tokenDetails.remove(oldTokenId);
            System.out.println("旧令牌已失效");
        }
        
        // 设置新令牌
        activeTokens.put(userKey, tokenId);
        tokenDetails.put(tokenId, new TokenInfo(userKey, token, System.currentTimeMillis()));
        
        System.out.println("用户 " + userKey + " 的新令牌已激活: " + tokenId);
        System.out.println("当前活跃令牌数量: " + activeTokens.size());
    }

    /**
     * 验证令牌是否为当前活跃令牌
     * @param tokenId 令牌ID
     * @return true表示令牌有效，false表示令牌已被顶掉
     */
    public boolean isTokenActive(String tokenId) {
        TokenInfo tokenInfo = tokenDetails.get(tokenId);
        if (tokenInfo == null) {
            return false;
        }
        
        // 检查该令牌是否为用户的当前活跃令牌
        String currentActiveTokenId = activeTokens.get(tokenInfo.getUserKey());
        return tokenId.equals(currentActiveTokenId);
    }

    /**
     * 获取用户的当前活跃令牌ID
     * @param userKey 用户唯一标识
     * @return 当前活跃的令牌ID，如果没有则返回null
     */
    public String getActiveTokenId(String userKey) {
        return activeTokens.get(userKey);
    }

    /**
     * 主动注销令牌
     * @param userKey 用户唯一标识
     */
    public void revokeToken(String userKey) {
        String tokenId = activeTokens.remove(userKey);
        if (tokenId != null) {
            tokenDetails.remove(tokenId);
            System.out.println("用户 " + userKey + " 的令牌已主动注销");
        }
    }

    /**
     * 清理过期令牌（可以定期调用）
     */
    public void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        long sevenDaysInMillis = 7 * 24 * 60 * 60 * 1000L;
        
        tokenDetails.entrySet().removeIf(entry -> {
            boolean expired = (currentTime - entry.getValue().getCreatedTime()) > sevenDaysInMillis;
            if (expired) {
                String userKey = entry.getValue().getUserKey();
                activeTokens.remove(userKey);
                System.out.println("清理过期令牌: " + entry.getKey() + " (用户: " + userKey + ")");
            }
            return expired;
        });
    }

    /**
     * 获取当前活跃令牌统计
     */
    public Map<String, Object> getTokenStats() {
        Map<String, Object> stats = new ConcurrentHashMap<>();
        stats.put("activeTokenCount", activeTokens.size());
        stats.put("totalTokenCount", tokenDetails.size());
        return stats;
    }

    /**
     * 生成用户唯一标识
     * @param phone 手机号
     * @param userType 用户类型
     * @return 用户唯一标识
     */
    public static String generateUserKey(String phone, String userType) {
        return phone + ":" + userType;
    }

    /**
     * 令牌信息内部类
     */
    private static class TokenInfo {
        private final String userKey;
        private final String token;
        private final long createdTime;

        public TokenInfo(String userKey, String token, long createdTime) {
            this.userKey = userKey;
            this.token = token;
            this.createdTime = createdTime;
        }

        public String getUserKey() {
            return userKey;
        }

        public String getToken() {
            return token;
        }

        public long getCreatedTime() {
            return createdTime;
        }
    }
}

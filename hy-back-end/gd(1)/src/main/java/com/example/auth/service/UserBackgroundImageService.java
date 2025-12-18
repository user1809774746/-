package com.example.auth.service;

import com.example.auth.entity.User;
import com.example.auth.entity.UserBackgroundImage;
import com.example.auth.repository.UserBackgroundImageRepository;
import com.example.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

@Service
public class UserBackgroundImageService {

    @Autowired
    private UserBackgroundImageRepository backgroundImageRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 上传/更新用户背景图片
     */
    @Transactional
    public UserBackgroundImage uploadBackgroundImage(String phone, String imageBase64, String imageFormat) {
        System.out.println("=== 开始上传背景图片 ===");
        System.out.println("用户手机号: " + phone);
        System.out.println("图片格式: " + imageFormat);

        // 查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Long userId = user.getUserId();
        System.out.println("找到用户ID: " + userId);

        try {
            // 验证图片格式
            if (!isValidImageFormat(imageFormat)) {
                throw new RuntimeException("不支持的图片格式，仅支持 jpg、jpeg、png、gif");
            }

            // 验证Base64数据
            if (imageBase64 == null || imageBase64.trim().isEmpty()) {
                throw new RuntimeException("图片数据不能为空");
            }

            // 移除Base64前缀（如果存在）
            String cleanBase64 = imageBase64;
            if (imageBase64.contains(",")) {
                cleanBase64 = imageBase64.split(",")[1];
            }

            // 解码Base64数据
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);
            System.out.println("解码后图片大小: " + imageBytes.length + " bytes");

            // 验证图片大小（限制为10MB，背景图片可能比头像大）
            if (imageBytes.length > 10 * 1024 * 1024) {
                throw new RuntimeException("图片大小不能超过10MB");
            }

            // 查找是否已存在背景图片
            UserBackgroundImage backgroundImage = backgroundImageRepository.findByUserId(userId)
                    .orElse(null);

            if (backgroundImage == null) {
                // 创建新记录
                backgroundImage = new UserBackgroundImage();
                backgroundImage.setUserId(userId);
                System.out.println("创建新的背景图片记录");
            } else {
                System.out.println("更新已有的背景图片记录");
            }

            // 设置背景图片数据
            backgroundImage.setBackgroundImage(imageBytes);

            // 保存到数据库
            UserBackgroundImage savedImage = backgroundImageRepository.save(backgroundImage);
            System.out.println("背景图片保存成功！");
            return savedImage;

        } catch (IllegalArgumentException e) {
            System.err.println("Base64解码错误: " + e.getMessage());
            throw new RuntimeException("无效的Base64图片数据");
        } catch (Exception e) {
            System.err.println("背景图片上传异常: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("背景图片上传失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户背景图片
     */
    public byte[] getBackgroundImage(String phone) {
        System.out.println("=== 开始获取背景图片 ===");
        System.out.println("用户手机号: " + phone);

        // 查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Long userId = user.getUserId();
        System.out.println("找到用户ID: " + userId);

        // 查找背景图片
        UserBackgroundImage backgroundImage = backgroundImageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("用户未设置背景图片"));

        System.out.println("找到背景图片，大小: " + backgroundImage.getBackgroundImage().length + " bytes");
        return backgroundImage.getBackgroundImage();
    }

    /**
     * 根据用户ID获取背景图片
     */
    public byte[] getBackgroundImageByUserId(Long userId) {
        System.out.println("=== 根据用户ID获取背景图片 ===");
        System.out.println("用户ID: " + userId);

        // 查找背景图片
        UserBackgroundImage backgroundImage = backgroundImageRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("用户未设置背景图片"));

        System.out.println("找到背景图片，大小: " + backgroundImage.getBackgroundImage().length + " bytes");
        return backgroundImage.getBackgroundImage();
    }

    /**
     * 删除用户背景图片
     */
    @Transactional
    public void deleteBackgroundImage(String phone) {
        System.out.println("=== 开始删除背景图片 ===");
        System.out.println("用户手机号: " + phone);

        // 查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        Long userId = user.getUserId();
        System.out.println("找到用户ID: " + userId);

        // 删除背景图片
        backgroundImageRepository.deleteByUserId(userId);
        System.out.println("背景图片删除成功！");
    }

    /**
     * 验证图片格式
     */
    private boolean isValidImageFormat(String format) {
        if (format == null) return false;
        String lowerFormat = format.toLowerCase();
        return lowerFormat.equals("jpg") || lowerFormat.equals("jpeg") ||
                lowerFormat.equals("png") || lowerFormat.equals("gif");
    }

    /**
     * 检查用户是否已设置背景图片
     */
    public boolean hasBackgroundImage(String phone) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        return backgroundImageRepository.existsByUserId(user.getUserId());
    }
}

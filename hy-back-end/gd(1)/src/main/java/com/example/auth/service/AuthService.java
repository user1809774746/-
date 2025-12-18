package com.example.auth.service;

import com.example.auth.entity.User;
import com.example.auth.entity.Administrator;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.AdministratorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdministratorRepository administratorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private PushService pushService;

    @Autowired
    private TokenService tokenService;

    // 用户注册
    public User registerUser(String username, String password, String number, byte[] userProfilePic) {
        if (userRepository.existsByNumber(number)) {
            throw new RuntimeException("该手机号已注册");
        }

        User user = new User();
        user.setUsername(username != null ? username.trim() : null);
        user.setPassword(passwordEncoder.encode(password));
        user.setNumber(number);
        user.setUserProfilePic(userProfilePic);

        return userRepository.save(user);
    }

    // 管理员注册
    public Administrator registerAdmin(String phone, String password) {
        System.out.println("=== AuthService.registerAdmin() 被调用 ===");
        System.out.println("手机号: " + phone);
        System.out.println("密码: " + password);
        
        System.out.println("检查手机号是否已注册...");
        if (administratorRepository.existsByPhone(phone)) {
            System.out.println("手机号已注册，抛出异常");
            throw new RuntimeException("该手机号已注册为管理员");
        }
        
        System.out.println("手机号未注册，创建新管理员...");
        Administrator admin = new Administrator();
        admin.setAdminName(phone); // 使用手机号作为管理员名称
        admin.setPassword(passwordEncoder.encode(password));
        admin.setPhone(phone);
        
        System.out.println("管理员信息设置完成，准备保存到数据库...");
        Administrator savedAdmin = administratorRepository.save(admin);
        System.out.println("管理员保存成功，ID: " + savedAdmin.getAdminId());
        
        return savedAdmin;
    }

    // 用户登录
    public String loginUser(String phone, String password) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("手机号或密码错误"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("手机号或密码错误");
        }

        // 发送登录通知
        pushService.sendLoginNotification(phone, "普通", user.getUserId().toString());

        // 生成并保存Token（自动实现顶号机制：新token会覆盖旧token）
        String token = tokenService.generateAndSaveToken(phone, "user");
        
        System.out.println("=== 用户密码登录成功 ===");
        System.out.println("手机号: " + phone);
        
        return token;
    }

    // 管理员登录
    public String loginAdmin(String phone, String password) {
        Administrator admin = administratorRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("手机号或密码错误"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("手机号或密码错误");
        }

        // 发送登录通知
        pushService.sendLoginNotification(phone, "管理员", admin.getAdminId().toString());

        // 生成并保存Token（自动实现顶号机制：新token会覆盖旧token）
        String token = tokenService.generateAndSaveToken(phone, "admin");
        
        System.out.println("=== 管理员密码登录成功 ===");
        System.out.println("手机号: " + phone);
        
        return token;
    }

    // 用户验证码登录
    public String loginUserByVerificationCode(String phone) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("该手机号未注册"));

        // 发送登录通知
        pushService.sendLoginNotification(user.getNumber(), "普通", user.getUserId().toString());

        // 生成并保存Token（自动实现顶号机制：新token会覆盖旧token）
        String token = tokenService.generateAndSaveToken(phone, "user");
        
        System.out.println("=== 用户验证码登录成功 ===");
        System.out.println("手机号: " + phone);
        
        return token;
    }

    // 管理员验证码登录
    public String loginAdminByVerificationCode(String phone) {
        Administrator admin = administratorRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("该手机号未注册"));

        // 发送登录通知
        pushService.sendLoginNotification(phone, "管理员", admin.getAdminId().toString());

        // 生成并保存Token（自动实现顶号机制：新token会覆盖旧token）
        String token = tokenService.generateAndSaveToken(phone, "admin");
        
        System.out.println("=== 管理员验证码登录成功 ===");
        System.out.println("手机号: " + phone);
        
        return token;
    }

    // 上传用户头像
    public User uploadUserAvatar(String phone, String imageBase64, String imageFormat) {
        System.out.println("=== 开始上传头像 ===");
        System.out.println("用户手机号: " + phone);
        System.out.println("图片格式: " + imageFormat);
        
        // 查找用户
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        System.out.println("找到用户ID: " + user.getUserId());

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

            // 验证图片大小（限制为5MB）
            if (imageBytes.length > 5 * 1024 * 1024) {
                throw new RuntimeException("图片大小不能超过5MB");
            }

            // 更新用户头像
            System.out.println("准备保存头像到数据库...");
            user.setUserProfilePic(imageBytes);
            
            User savedUser = userRepository.save(user);
            System.out.println("头像保存成功！");
            return savedUser;

        } catch (IllegalArgumentException e) {
            System.err.println("Base64解码错误: " + e.getMessage());
            throw new RuntimeException("无效的Base64图片数据");
        } catch (Exception e) {
            System.err.println("头像上传异常: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("头像上传失败: " + e.getMessage());
        }
    }

    // 获取用户头像
    public byte[] getUserAvatar(String phone) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
        
        if (user.getUserProfilePic() == null) {
            throw new RuntimeException("用户未设置头像");
        }
        
        return user.getUserProfilePic();
    }

    // 验证图片格式
    private boolean isValidImageFormat(String format) {
        if (format == null) return false;
        String lowerFormat = format.toLowerCase();
        return lowerFormat.equals("jpg") || lowerFormat.equals("jpeg") || 
               lowerFormat.equals("png") || lowerFormat.equals("gif");
    }

    // 七天免密登录 - 用户（基于token验证）
    public String autoLoginUser(String phone, String token) {
        User user = userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 验证token是否有效（包含顶号检测和过期检测）
        if (!tokenService.validateToken(token, phone, "user")) {
            throw new RuntimeException("Token无效或已过期，请重新登录");
        }

        System.out.println("=== 七天免密登录成功（静默验证）===");
        System.out.println("用户手机号: " + phone);
        System.out.println("Token验证通过");

        // 注意：自动登录是静默的token验证过程，不发送登录通知，避免用户刷新页面时重复提示

        // 返回原token（无需重新生成）
        return token;
    }

    // 七天免密登录 - 管理员（基于token验证）
    public String autoLoginAdmin(String phone, String token) {
        Administrator admin = administratorRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("管理员不存在"));

        // 验证token是否有效（包含顶号检测和过期检测）
        if (!tokenService.validateToken(token, phone, "admin")) {
            throw new RuntimeException("Token无效或已过期，请重新登录");
        }

        System.out.println("=== 管理员七天免密登录成功（静默验证）===");
        System.out.println("管理员手机号: " + phone);
        System.out.println("Token验证通过");

        // 注意：自动登录是静默的token验证过程，不发送登录通知，避免管理员刷新页面时重复提示

        // 返回原token（无需重新生成）
        return token;
    }

    // 检查用户是否可以使用七天免密登录（基于token）
    public boolean canAutoLogin(String phone, String userType) {
        return tokenService.canAutoLogin(phone, userType);
    }

    // 注销登录 - 清除token
    public void logout(String phone, String userType) {
        tokenService.clearToken(phone, userType);
        System.out.println("=== 用户已登出 ===");
        System.out.println("手机号: " + phone);
        System.out.println("用户类型: " + userType);
    }

    // 根据手机号获取用户信息
    public User getUserByPhone(String phone) {
        return userRepository.findByNumber(phone)
                .orElseThrow(() -> new RuntimeException("用户不存在"));
    }
}
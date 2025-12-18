package com.example.auth.controller;

import com.example.auth.dto.LoginRequest;
import com.example.auth.dto.RegisterRequest;
import com.example.auth.dto.ResponseDTO;
import com.example.auth.dto.VerificationCodeRequest;
import com.example.auth.dto.VerificationLoginRequest;
import com.example.auth.dto.AvatarUploadRequest;
import com.example.auth.dto.AutoLoginRequest;
import com.example.auth.dto.UserReportRequest;
import com.example.auth.service.AuthService;
import com.example.auth.service.VerificationService;
import com.example.auth.service.TokenManagerService;
import com.example.auth.service.UserService;
import com.example.auth.service.RealNameVerificationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;

import java.util.HashMap;
import java.util.Map;
import java.util.Base64;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.example.auth.repository.UserRepository;
import com.example.auth.entity.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;
    
    @Autowired
    private VerificationService verificationService;
    
    @Autowired
    private TokenManagerService tokenManagerService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private RealNameVerificationService realNameVerificationService;


    // 获取验证码接口
    @PostMapping("/send-verification-code")
    public ResponseDTO sendVerificationCode(@RequestBody VerificationCodeRequest request) {
        try {
            String phone = request.getPhone();
            if (phone == null || phone.trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            
            // 验证手机号格式
            if (!isValidPhone(phone)) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }
            
            // 发送验证码
            verificationService.sendVerificationCode(phone);
            return ResponseDTO.success("验证码已发送");
            
        } catch (Exception e) {
            return ResponseDTO.error(500, "发送验证码失败: " + e.getMessage());
        }
    }

    // 注册接口
    @PostMapping("/register")
    public ResponseDTO register(@RequestBody RegisterRequest request) {
        try {
            // 验证必填字段
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            if ("user".equals(request.getUserType())) {
                if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
                    return ResponseDTO.error(400, "用户名不能为空");
                }
            }
            if (request.getVerificationCode() == null || request.getVerificationCode().trim().isEmpty()) {
                return ResponseDTO.error(400, "验证码不能为空");
            }
            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                return ResponseDTO.error(400, "密码不能为空");
            }
            if (request.getConfirmPassword() == null || request.getConfirmPassword().trim().isEmpty()) {
                return ResponseDTO.error(400, "确认密码不能为空");
            }
            
            // 验证手机号格式
            if (!isValidPhone(request.getPhone())) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }

            // 验证密码和确认密码是否一致
            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return ResponseDTO.error(400, "密码和确认密码不一致");
            }
            
            // 验证验证码
            if (!verificationService.verifyCode(request.getPhone(), request.getVerificationCode())) {
                return ResponseDTO.error(400, "验证码错误或已过期");
            }

            // 执行注册逻辑
            if ("user".equals(request.getUserType())) {
                authService.registerUser(
                        request.getUsername().trim(),
                        request.getPassword(),
                        request.getPhone(),
                        request.getUserProfilePic()
                );
                return ResponseDTO.success("用户注册成功");
            } else if ("admin".equals(request.getUserType())) {
                authService.registerAdmin(
                        request.getPhone(),
                        request.getPassword()
                );
                return ResponseDTO.success("管理员注册成功");
            } else {
                return ResponseDTO.error(400, "无效的用户类型");
            }
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        }
    }

    // 快速注册管理员接口（无需验证码）
    @PostMapping("/admin/quick-register")
    public ResponseDTO quickRegisterAdmin(@RequestBody Map<String, String> request) {
        try {
            String phone = request.get("phone");
            String password = request.get("password");
            
            System.out.println("=== 管理员快速注册接口被调用 ===");
            System.out.println("接收到的手机号: " + phone);
            System.out.println("接收到的密码: " + password);
            
            // 参数验证
            if (phone == null || phone.trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            if (password == null || password.trim().isEmpty()) {
                return ResponseDTO.error(400, "密码不能为空");
            }
            
            // 验证手机号格式
            if (!isValidPhone(phone)) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }
            
            // 密码长度验证
            if (password.length() < 6) {
                return ResponseDTO.error(400, "密码长度至少6位");
            }
            
            System.out.println("参数验证通过，开始调用 authService.registerAdmin()");
            
            // 注册管理员
            authService.registerAdmin(phone, password);
            
            System.out.println("管理员注册成功！");
            
            Map<String, Object> result = new HashMap<>();
            result.put("phone", phone);
            result.put("message", "管理员注册成功");
            
            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            System.err.println("管理员注册失败: " + e.getMessage());
            e.printStackTrace();
            return ResponseDTO.error(400, e.getMessage());
        }
    }

    // 登录接口（用户名密码）
    @PostMapping("/login")
    public ResponseDTO login(@RequestBody LoginRequest request) {
        try {
            String token;
            if ("user".equals(request.getUserType())) {
                token = authService.loginUser(request.getPhone(), request.getPassword());
            } else if ("admin".equals(request.getUserType())) {
                token = authService.loginAdmin(request.getPhone(), request.getPassword());
            } else {
                return ResponseDTO.error(400, "无效的用户类型");
            }

            Map<String, String> result = new HashMap<>();
            result.put("token", token);
            result.put("userType", request.getUserType());
            result.put("phone", request.getPhone());

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(401, e.getMessage());
        }
    }

    // 验证码登录接口
    @PostMapping("/login-by-code")
    public ResponseDTO loginByVerificationCode(@RequestBody VerificationLoginRequest request) {
        try {
            // 验证必填字段
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            if (request.getVerificationCode() == null || request.getVerificationCode().trim().isEmpty()) {
                return ResponseDTO.error(400, "验证码不能为空");
            }
            if (request.getUserType() == null || request.getUserType().trim().isEmpty()) {
                return ResponseDTO.error(400, "用户类型不能为空");
            }

            // 验证手机号格式
            if (!isValidPhone(request.getPhone())) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }

            // 验证验证码
            if (!verificationService.verifyCode(request.getPhone(), request.getVerificationCode())) {
                return ResponseDTO.error(400, "验证码错误或已过期");
            }

            // 根据用户类型进行登录
            String token;
            if ("user".equals(request.getUserType())) {
                token = authService.loginUserByVerificationCode(request.getPhone());
            } else if ("admin".equals(request.getUserType())) {
                token = authService.loginAdminByVerificationCode(request.getPhone());
            } else {
                return ResponseDTO.error(400, "无效的用户类型");
            }

            Map<String, String> result = new HashMap<>();
            result.put("token", token);
            result.put("userType", request.getUserType());
            result.put("phone", request.getPhone());

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(401, e.getMessage());
        }
    }


    // 测试认证接口
    @GetMapping("/profile")
    public ResponseDTO getProfile(Authentication authentication) {
        try {
            System.out.println("=== 获取用户Profile ===");
            
            if (authentication == null || !authentication.isAuthenticated()) {
                System.err.println("❌ 用户未认证");
                return ResponseDTO.error(401, "未认证");
            }

            String phone = authentication.getName(); // 获取手机号
            System.out.println("📱 手机号: " + phone);
            
            Map<String, Object> profile = new HashMap<>();
            profile.put("phone", phone);
            profile.put("authorities", authentication.getAuthorities());
            
            // 从数据库获取完整的用户信息，包括userId
            try {
                System.out.println("🔍 查询用户信息...");
                User user = userRepository.findByNumber(phone).orElse(null);
                if (user != null) {
                    System.out.println("✅ 找到用户: " + user.getUserId());
                    profile.put("userId", user.getUserId());
                    profile.put("username", user.getUsername());
                    profile.put("gender", user.getGender());
                    profile.put("realName", user.getRealName());
                    profile.put("realNameVerified", user.getRealNameVerified());
                    profile.put("realNameVerifiedAt", user.getRealNameVerifiedAt());
                } else {
                    System.err.println("⚠️ 未找到用户: " + phone);
                }

            } catch (Exception e) {
                // 如果获取用户信息失败，仍然返回基本信息
                System.err.println("❌ 获取用户详细信息失败: " + e.getMessage());
                e.printStackTrace();
            }

            System.out.println("✅ 返回Profile数据");
            return ResponseDTO.success(profile);
        } catch (Exception e) {
            System.err.println("❌ getProfile异常: " + e.getMessage());
            e.printStackTrace();
            return ResponseDTO.error(500, "获取用户信息失败: " + e.getMessage());
        }
    }

    // 更新资料接口（昵称/性别）
    @PutMapping("/profile")
    public ResponseDTO updateProfile(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }
            String phone = authentication.getName();
            User user = userRepository.findByNumber(phone).orElse(null);
            if (user == null) {
                return ResponseDTO.error(404, "用户不存在");
            }
            String username = payload.get("username");
            String gender = payload.get("gender");
            if (username != null) {
                user.setUsername(username.trim());
            }
            if (gender != null) {
                user.setGender(gender.trim());
            }
            userRepository.save(user);
            Map<String, Object> result = new HashMap<>();
            result.put("userId", user.getUserId());
            result.put("username", user.getUsername());
            result.put("gender", user.getGender());
            return ResponseDTO.success(result);
        } catch (Exception e) {
            return ResponseDTO.error(500, "更新资料失败: " + e.getMessage());
        }
    }

    // 举报用户
    @PostMapping("/users/{userId}/report")
    public ResponseDTO reportUser(@PathVariable Long userId,
                                  @RequestBody UserReportRequest request,
                                  Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            if (request == null || request.getReportType() == null || request.getReportType().trim().isEmpty()) {
                return ResponseDTO.error(400, "举报类型不能为空");
            }

            String phone = authentication.getName();
            userService.reportUser(phone, userId, request);

            return ResponseDTO.success("举报成功，我们会尽快处理");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "举报失败: " + e.getMessage());
        }
    }

    // 管理员查看被举报用户列表
    @GetMapping("/admin/reported-users")
    public ResponseDTO getReportedUsers(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseDTO.error(403, "权限不足，需要管理员权限");
            }

            java.util.List<java.util.Map<String, Object>> reportedUsers = userService.getReportedUsersSummary();
            return ResponseDTO.success(reportedUsers);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取被举报用户列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/admin/users/{userId}/reports")
    public ResponseDTO getUserReportDetails(@PathVariable Long userId,
                                            Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseDTO.error(403, "权限不足，需要管理员权限");
            }

            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return ResponseDTO.error(404, "被举报用户不存在");
            }

            java.util.List<com.example.auth.entity.UserReport> reports =
                    userService.getReportsByReportedUser(userId);

            java.util.Map<String, Object> data = new java.util.HashMap<>();
            java.util.Map<String, Object> userInfo = new java.util.HashMap<>();
            userInfo.put("userId", user.getUserId());
            userInfo.put("username", user.getUsername());
            userInfo.put("phone", user.getNumber());

            data.put("user", userInfo);
            data.put("reports", reports);

            return ResponseDTO.success(data);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取举报详情失败: " + e.getMessage());
        }
    }

    // 获取用户隐私设置
    @GetMapping("/privacy")
    public ResponseDTO getPrivacySettings(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }
            String phone = authentication.getName();
            User user = userRepository.findByNumber(phone).orElse(null);
            if (user == null) {
                return ResponseDTO.error(404, "用户不存在");
            }
            
            Map<String, Object> privacySettings = new HashMap<>();
            // 如果 allowStrangerViewDynamic 为 null，默认为 true
            privacySettings.put("allowStrangerViewDynamic", 
                user.getAllowStrangerViewDynamic() != null ? user.getAllowStrangerViewDynamic() : true);
            
            return ResponseDTO.success(privacySettings);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取隐私设置失败: " + e.getMessage());
        }
    }

    // 更新用户隐私设置
    @PutMapping("/privacy")
    public ResponseDTO updatePrivacySettings(@RequestBody Map<String, Boolean> settings, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }
            String phone = authentication.getName();
            User user = userRepository.findByNumber(phone).orElse(null);
            if (user == null) {
                return ResponseDTO.error(404, "用户不存在");
            }
            
            if (settings.containsKey("allowStrangerViewDynamic")) {
                user.setAllowStrangerViewDynamic(settings.get("allowStrangerViewDynamic"));
            }
            
            userRepository.save(user);
            
            return ResponseDTO.success("隐私设置更新成功");
        } catch (Exception e) {
            return ResponseDTO.error(500, "更新隐私设置失败: " + e.getMessage());
        }
    }

    // 管理员专用接口
    @GetMapping("/admin/users")
    public ResponseDTO getUsers(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            // 检查是否是管理员
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseDTO.error(403, "权限不足，需要管理员权限");
            }

            Map<String, String> users = new HashMap<>();
            users.put("user1", "普通用户");
            users.put("user2", "VIP用户");

            return ResponseDTO.success(users);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取用户列表失败: " + e.getMessage());
        }
    }

    // 上传头像接口
    @PostMapping("/upload-avatar")
    public ResponseDTO uploadAvatar(@RequestBody AvatarUploadRequest request, Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 验证必填字段
            if (request.getImageBase64() == null || request.getImageBase64().trim().isEmpty()) {
                return ResponseDTO.error(400, "图片数据不能为空");
            }
            if (request.getImageFormat() == null || request.getImageFormat().trim().isEmpty()) {
                return ResponseDTO.error(400, "图片格式不能为空");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 上传头像
            authService.uploadUserAvatar(phone, request.getImageBase64(), request.getImageFormat());

            return ResponseDTO.success("头像上传成功");
        } catch (RuntimeException e) {
            return ResponseDTO.error(400, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "头像上传失败: " + e.getMessage());
        }
    }

    // 获取头像接口
    @GetMapping("/avatar")
    public ResponseEntity<?> getAvatar(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(401).body(ResponseDTO.error(401, "请先登录"));
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取头像数据
            byte[] avatarData = authService.getUserAvatar(phone);

            // 返回图片数据
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG); // 默认为JPEG，实际应根据存储的格式确定
            headers.setContentLength(avatarData.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(avatarData);

        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(ResponseDTO.error(404, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ResponseDTO.error(500, "获取头像失败: " + e.getMessage()));
        }
    }

    // 获取头像Base64格式接口
    @GetMapping("/avatar-base64")
    public ResponseDTO getAvatarBase64(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "请先登录");
            }

            // 获取当前用户手机号
            String phone = authentication.getName();

            // 获取头像数据
            byte[] avatarData = authService.getUserAvatar(phone);

            // 转换为Base64
            String base64Avatar = Base64.getEncoder().encodeToString(avatarData);

            Map<String, String> result = new HashMap<>();
            result.put("avatar", "data:image/jpeg;base64," + base64Avatar);
            result.put("phone", phone);

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            return ResponseDTO.error(404, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取头像失败: " + e.getMessage());
        }
    }

    // 七天免密登录接口（基于token验证）
    @PostMapping("/auto-login")
    public ResponseDTO autoLogin(@RequestBody AutoLoginRequest request) {
        try {
            // 验证必填字段
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            if (request.getUserType() == null || request.getUserType().trim().isEmpty()) {
                return ResponseDTO.error(400, "用户类型不能为空");
            }
            if (request.getToken() == null || request.getToken().trim().isEmpty()) {
                return ResponseDTO.error(400, "Token不能为空");
            }

            // 验证手机号格式
            if (!isValidPhone(request.getPhone())) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }

            // 执行七天免密登录（验证token是否有效，包含顶号检测）
            String token;
            if ("user".equals(request.getUserType())) {
                token = authService.autoLoginUser(request.getPhone(), request.getToken());
            } else if ("admin".equals(request.getUserType())) {
                token = authService.autoLoginAdmin(request.getPhone(), request.getToken());
            } else {
                return ResponseDTO.error(400, "无效的用户类型");
            }

            Map<String, String> result = new HashMap<>();
            result.put("token", token);
            result.put("userType", request.getUserType());
            result.put("phone", request.getPhone());
            result.put("loginType", "auto_login");

            return ResponseDTO.success(result);
        } catch (RuntimeException e) {
            // Token无效或已被顶号
            return ResponseDTO.error(401, e.getMessage());
        } catch (Exception e) {
            return ResponseDTO.error(500, "七天免密登录失败: " + e.getMessage());
        }
    }

    // 检查是否可以使用七天免密登录
    @PostMapping("/check-auto-login")
    public ResponseDTO checkAutoLogin(@RequestBody AutoLoginRequest request) {
        try {
            // 验证必填字段
            if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
                return ResponseDTO.error(400, "手机号不能为空");
            }
            if (request.getUserType() == null || request.getUserType().trim().isEmpty()) {
                return ResponseDTO.error(400, "用户类型不能为空");
            }

            // 验证手机号格式
            if (!isValidPhone(request.getPhone())) {
                return ResponseDTO.error(400, "手机号格式不正确");
            }

            // 检查是否可以使用七天免密登录
            boolean canAutoLogin = authService.canAutoLogin(request.getPhone(), request.getUserType());

            Map<String, Object> result = new HashMap<>();
            result.put("canAutoLogin", canAutoLogin);
            result.put("phone", request.getPhone());
            result.put("userType", request.getUserType());

            if (canAutoLogin) {
                return ResponseDTO.success(result);
            } else {
                result.put("message", "七天免密登录已过期或用户不存在");
                return new ResponseDTO(403, "七天免密登录已过期或用户不存在", result);
            }
        } catch (Exception e) {
            return ResponseDTO.error(500, "检查七天免密登录状态失败: " + e.getMessage());
        }
    }

    // 获取当前登录用户的身份信息
    @GetMapping("/user-info")
    public ResponseDTO getUserInfo(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 获取用户信息
            String phone = authentication.getName();
            // 从authorities中获取用户类型
            String userType = authentication.getAuthorities().iterator().next().getAuthority();
            userType = userType.replace("ROLE_", "").toLowerCase();

            // 构建返回数据
            Map<String, Object> userInfo = new HashMap<>();
            userInfo.put("phone", phone);
            userInfo.put("userType", userType);
            
            if ("user".equals(userType)) {
                userInfo.put("userRole", "普通用户");
                userInfo.put("isAdmin", false);
            } else if ("admin".equals(userType)) {
                userInfo.put("userRole", "管理员");
                userInfo.put("isAdmin", true);
            }

            System.out.println("=== 获取用户信息 ===");
            System.out.println("手机号: " + phone);
            System.out.println("用户类型: " + userType);

            return ResponseDTO.success(userInfo);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取用户信息失败: " + e.getMessage());
        }
    }

    /**
     * 实名认证接口：前端提交姓名和身份证号，后端调用聚合数据V7接口进行校验
     */
    @PostMapping("/real-name/verify")
    public ResponseDTO verifyRealName(@RequestBody Map<String, String> payload, Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            String realName = payload.get("realName");
            String idCard = payload.get("idCard");

            if (realName == null || realName.trim().isEmpty()) {
                return ResponseDTO.error(400, "姓名不能为空");
            }
            if (idCard == null || idCard.trim().isEmpty()) {
                return ResponseDTO.error(400, "身份证号不能为空");
            }

            Map<String, Object> apiResult = realNameVerificationService.verifyRealName(realName.trim(), idCard.trim());
            if (apiResult == null) {
                return ResponseDTO.error(500, "实名认证服务无响应");
            }

            Object errorCodeObj = apiResult.get("error_code");
            int errorCode = (errorCodeObj instanceof Number) ? ((Number) errorCodeObj).intValue() : -1;
            String reason = apiResult.get("reason") != null ? apiResult.get("reason").toString() : "";

            if (errorCode != 0) {
                return ResponseDTO.error(400, "实名认证失败: " + reason + " (error_code=" + errorCode + ")");
            }

            Object resultObj = apiResult.get("result");
            Map<String, Object> resultMap = null;
            if (resultObj instanceof Map) {
                // noinspection unchecked
                resultMap = (Map<String, Object>) resultObj;
            }

            String resStr = resultMap != null && resultMap.get("res") != null
                    ? resultMap.get("res").toString()
                    : null;
            boolean match = "1".equals(resStr);

            Map<String, Object> data = new HashMap<>();
            data.put("match", match);
            if (resultMap != null) {
                data.put("orderId", resultMap.get("orderid"));
            }

            if (!match) {
                return new ResponseDTO(200, "身份证信息不匹配", data);
            }

            // 实名认证通过，更新用户信息
            String phone = authentication.getName();
            User user = userRepository.findByNumber(phone).orElse(null);
            if (user != null) {
                user.setRealName(realName.trim());
                user.setIdCardNumber(idCard.trim());
                user.setRealNameVerified(true);
                user.setRealNameVerifiedAt(new java.util.Date());
                userRepository.save(user);
            }

            return ResponseDTO.success(data);
        } catch (Exception e) {
            return ResponseDTO.error(500, "实名认证服务异常: " + e.getMessage());
        }
    }

    // 主动注销令牌接口（清除token）

    @PostMapping("/logout")
    public ResponseDTO logout(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "用户未登录");
            }

            // 获取用户信息
            String phone = authentication.getName();
            // 从authorities中获取用户类型
            String userType = authentication.getAuthorities().iterator().next().getAuthority();
            userType = userType.replace("ROLE_", "").toLowerCase();

            // 清除token（注销登录）
            authService.logout(phone, userType);

            return ResponseDTO.success("注销成功");
        } catch (Exception e) {
            return ResponseDTO.error(500, "注销失败: " + e.getMessage());
        }
    }

    // 获取令牌统计信息接口（管理员专用）
    @GetMapping("/admin/token-stats")
    public ResponseDTO getTokenStats(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            // 检查是否是管理员
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseDTO.error(403, "权限不足，需要管理员权限");
            }

            // 获取令牌统计信息
            Map<String, Object> stats = tokenManagerService.getTokenStats();
            return ResponseDTO.success(stats);
        } catch (Exception e) {
            return ResponseDTO.error(500, "获取令牌统计失败: " + e.getMessage());
        }
    }

    // 清理过期令牌接口（管理员专用）
    @PostMapping("/admin/cleanup-tokens")
    public ResponseDTO cleanupTokens(Authentication authentication) {
        try {
            // 检查用户是否已登录
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseDTO.error(401, "未认证");
            }

            // 检查是否是管理员
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin) {
                return ResponseDTO.error(403, "权限不足，需要管理员权限");
            }

            // 清理过期令牌
            tokenManagerService.cleanupExpiredTokens();
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "过期令牌清理完成");
            result.put("timestamp", System.currentTimeMillis());
            
            return ResponseDTO.success(result);
        } catch (Exception e) {
            return ResponseDTO.error(500, "清理令牌失败: " + e.getMessage());
        }
    }

    /**
     * 验证手机号格式
     */
    private boolean isValidPhone(String phone) {
        // 简单的手机号格式验证，支持11位数字，以1开头
        return phone != null && phone.matches("^1[3-9]\\d{9}$");
    }
}

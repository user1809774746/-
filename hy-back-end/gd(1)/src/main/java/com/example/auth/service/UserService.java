package com.example.auth.service;

import com.example.auth.dto.UserReportRequest;
import com.example.auth.entity.User;
import com.example.auth.entity.UserReport;
import com.example.auth.repository.UserRepository;
import com.example.auth.repository.UserReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserReportRepository userReportRepository;

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getUserId)
                .orElse(null);
    }

    /**
     * 通过手机号查询用户ID
     * @param phone 手机号
     * @return 用户ID，如果不存在返回null
     */
    public Long getUserIdByPhone(String phone) {
        return userRepository.findByNumber(phone)
                .map(User::getUserId)
                .orElse(null);
    }

    /**
     * 举报用户
     */
    public void reportUser(String reporterPhone, Long reportedUserId, UserReportRequest request) {
        if (request == null || request.getReportType() == null || request.getReportType().trim().isEmpty()) {
            throw new RuntimeException("举报类型不能为空");
        }

        User reporter = userRepository.findByNumber(reporterPhone)
                .orElseThrow(() -> new RuntimeException("举报用户不存在"));

        User reportedUser = userRepository.findById(reportedUserId)
                .orElseThrow(() -> new RuntimeException("被举报用户不存在"));

        UserReport report = new UserReport();
        report.setReportedUserId(reportedUser.getUserId());
        report.setReporterId(reporter.getUserId());
        report.setReportType(request.getReportType());
        report.setReportReason(request.getReportReason());

        if (request.getReportEvidence() != null && !request.getReportEvidence().isEmpty()) {
            String jsonEvidence = "[" + request.getReportEvidence().stream()
                    .map(s -> "\"" + s.replace("\"", "\\\"") + "\"")
                    .collect(java.util.stream.Collectors.joining(",")) + "]";
            report.setReportEvidence(jsonEvidence);
        }

        report.setStatus("pending");

        userReportRepository.save(report);
    }

    /**
     * 获取被举报用户汇总列表（管理员查看）
     */
    public List<Map<String, Object>> getReportedUsersSummary() {
        List<UserReport> reports = userReportRepository.findAll();
        if (reports == null || reports.isEmpty()) {
            return Collections.emptyList();
        }

        // 按被举报用户ID分组
        Map<Long, List<UserReport>> grouped = reports.stream()
                .collect(Collectors.groupingBy(UserReport::getReportedUserId));

        // 一次性查出所有相关用户信息，避免 N+1 查询
        Set<Long> userIds = grouped.keySet();
        List<User> users = userRepository.findAllById(userIds);
        Map<Long, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));

        List<Map<String, Object>> result = new ArrayList<>();

        for (Map.Entry<Long, List<UserReport>> entry : grouped.entrySet()) {
            Long reportedUserId = entry.getKey();
            List<UserReport> userReports = entry.getValue();

            long totalReports = userReports.size();
            long pendingReports = userReports.stream()
                    .filter(r -> r.getStatus() != null && "pending".equalsIgnoreCase(r.getStatus()))
                    .count();

            Date lastReportTime = userReports.stream()
                    .map(UserReport::getCreatedTime)
                    .filter(Objects::nonNull)
                    .max(Date::compareTo)
                    .orElse(null);

            User reportedUser = userMap.get(reportedUserId);

            Map<String, Object> item = new HashMap<>();
            item.put("userId", reportedUserId);
            if (reportedUser != null) {
                item.put("username", reportedUser.getUsername());
                item.put("phone", reportedUser.getNumber());
            } else {
                item.put("username", null);
                item.put("phone", null);
            }
            item.put("totalReports", totalReports);
            item.put("pendingReports", pendingReports);
            item.put("lastReportTime", lastReportTime);

            result.add(item);
        }

        // 按待处理举报数量和最近举报时间排序，方便管理员优先处理
        result.sort((a, b) -> {
            long pendingA = ((Number) a.getOrDefault("pendingReports", 0L)).longValue();
            long pendingB = ((Number) b.getOrDefault("pendingReports", 0L)).longValue();
            if (pendingA != pendingB) {
                return Long.compare(pendingB, pendingA); // 待处理多的在前
            }
            Date timeA = (Date) a.get("lastReportTime");
            Date timeB = (Date) b.get("lastReportTime");
            if (timeA == null && timeB == null) return 0;
            if (timeA == null) return 1;
            if (timeB == null) return -1;
            return timeB.compareTo(timeA); // 最近的在前
        });

        return result;
    }

    public List<UserReport> getReportsByReportedUser(Long reportedUserId) {
        if (reportedUserId == null) {
            return Collections.emptyList();
        }
        return userReportRepository.findByReportedUserIdOrderByCreatedTimeDesc(reportedUserId);
    }
}

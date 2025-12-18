package com.example.auth.scheduler;

import com.example.auth.service.TravelPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 旅行计划定时任务
 */
@Component
public class TravelPlanScheduler {

    @Autowired
    private TravelPlanService travelPlanService;

    /**
     * 每天凌晨2点自动完成已过期的旅行计划
     * 将结束日期早于今天且状态为active的计划改为completed
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoCompleteExpiredPlans() {
        System.out.println("⏰ 开始执行定时任务：自动完成过期旅行计划");
        
        try {
            int count = travelPlanService.autoCompleteExpiredPlans();
            System.out.println("✅ 定时任务完成：共自动完成 " + count + " 个旅行计划");
        } catch (Exception e) {
            System.err.println("❌ 定时任务执行失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

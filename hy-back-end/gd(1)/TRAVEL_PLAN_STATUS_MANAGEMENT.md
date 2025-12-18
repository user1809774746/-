# 🎯 旅行计划状态管理功能

## 功能概述

实现了旅行计划的完整生命周期管理，包括手动更新状态和自动完成过期计划的功能。

---

## 📊 旅行计划状态流转

```
┌─────────┐    用户确认开始    ┌─────────┐    到达结束日期    ┌──────────┐
│  draft  │ ───────────────→ │ active  │ ───────────────→ │completed │
│  草稿   │                   │ 进行中  │    (自动触发)     │  已完成  │
└─────────┘                   └─────────┘                   └──────────┘
```

### 状态说明

| 状态 | 英文 | 说明 | 触发方式 |
|------|------|------|----------|
| 草稿 | draft | AI生成后的初始状态 | 自动 |
| 进行中 | active | 用户确认开始执行旅行 | 手动 |
| 已完成 | completed | 旅行已结束 | 自动/手动 |

---

## 🔧 实现的功能

### 1. 手动更新状态接口

**接口**: `PUT /api/travel-plans/{id}/status`

**功能**: 允许用户手动更改旅行计划的状态

**使用场景**:
- 用户收到旅行提醒后，确认开始执行计划
- 用户提前结束旅行，手动标记为已完成
- 用户重新激活已完成的计划（如果需要）

**请求示例**:
```bash
curl -X PUT http://localhost:8082/api/travel-plans/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "travelPlanId": 1,
    "title": "北京3日游",
    "oldStatus": "draft",
    "newStatus": "active",
    "message": "旅行计划状态已更新"
  }
}
```

---

### 2. 自动完成过期计划

**定时任务**: 每天凌晨2点执行

**功能**: 自动将已过期的旅行计划标记为已完成

**执行逻辑**:
1. 查询所有状态为 `active` 的旅行计划
2. 检查每个计划的 `endDate`（结束日期）
3. 如果 `endDate` 早于今天，自动改为 `completed`
4. 记录日志并统计完成数量

**日志示例**:
```
⏰ 开始执行定时任务：自动完成过期旅行计划
✅ 自动完成旅行计划: 1 - 北京3日游
✅ 自动完成旅行计划: 3 - 上海周末游
✅ 定时任务完成：共自动完成 2 个旅行计划
```

---

## 📁 新增文件

### 1. UpdateTravelPlanStatusRequest.java
```java
package com.example.auth.dto;

@Data
public class UpdateTravelPlanStatusRequest {
    private Long travelPlanId;
    private String status;  // draft, active, completed
}
```

### 2. TravelPlanScheduler.java
```java
package com.example.auth.scheduler;

@Component
public class TravelPlanScheduler {
    
    @Autowired
    private TravelPlanService travelPlanService;

    // 每天凌晨2点执行
    @Scheduled(cron = "0 0 2 * * ?")
    public void autoCompleteExpiredPlans() {
        int count = travelPlanService.autoCompleteExpiredPlans();
        System.out.println("✅ 定时任务完成：共自动完成 " + count + " 个旅行计划");
    }
}
```

---

## 🔄 修改的文件

### 1. TravelPlanService.java

**新增方法**:

#### updateTravelPlanStatus()
```java
public TravelPlan updateTravelPlanStatus(Long travelPlanId, String newStatus) {
    TravelPlan plan = getTravelPlanById(travelPlanId);
    if (plan == null) {
        throw new RuntimeException("旅行计划不存在");
    }

    // 验证状态值
    TravelPlan.TravelPlanStatus status;
    try {
        status = TravelPlan.TravelPlanStatus.valueOf(newStatus);
    } catch (IllegalArgumentException e) {
        throw new RuntimeException("无效的状态值");
    }

    plan.setStatus(status);
    return travelPlanRepository.save(plan);
}
```

#### autoCompleteExpiredPlans()
```java
@Transactional
public int autoCompleteExpiredPlans() {
    LocalDate today = LocalDate.now();
    List<TravelPlan> activePlans = travelPlanRepository.findByStatus(
        TravelPlan.TravelPlanStatus.active
    );
    
    int count = 0;
    for (TravelPlan plan : activePlans) {
        if (plan.getEndDate() != null && plan.getEndDate().isBefore(today)) {
            plan.setStatus(TravelPlan.TravelPlanStatus.completed);
            travelPlanRepository.save(plan);
            count++;
        }
    }
    
    return count;
}
```

---

### 2. TravelPlanRepository.java

**新增方法**:
```java
List<TravelPlan> findByStatus(TravelPlan.TravelPlanStatus status);
```

---

### 3. TravelPlanController.java

**新增接口**:
```java
@PutMapping("/{id}/status")
public ResponseDTO updateTravelPlanStatus(
        @PathVariable Long id,
        @RequestBody UpdateTravelPlanStatusRequest request) {
    
    TravelPlan updatedPlan = travelPlanService.updateTravelPlanStatus(
        id, request.getStatus()
    );
    
    return ResponseDTO.success(data);
}
```

---

### 4. AuthApplication.java

**启用定时任务**:
```java
@SpringBootApplication
@EnableScheduling  // ← 新增
public class AuthApplication {
    // ...
}
```

---

## 🎬 完整使用流程

### 场景：用户规划并执行旅行

#### 1. AI生成旅行计划
```
用户: "帮我规划北京3日游"
AI: 生成计划并保存到数据库
状态: draft
```

#### 2. 用户收到提醒（旅行开始日期到达）
```
GET /api/travel-plans/user/123/reminders

响应:
{
  "travelPlans": [
    {
      "id": 1,
      "title": "北京3日游",
      "startDate": "2025-12-01",
      "endDate": "2025-12-03",
      "status": "draft"
    }
  ]
}
```

#### 3. 前端弹窗提醒
```
┌─────────────────────────────────┐
│  🎒 旅行提醒                     │
├─────────────────────────────────┤
│  您的"北京3日游"即将开始！      │
│  日期：2025-12-01 至 2025-12-03 │
│                                  │
│  [开始执行]  [稍后提醒]         │
└─────────────────────────────────┘
```

#### 4. 用户点击"开始执行"
```
PUT /api/travel-plans/1/status
{
  "status": "active"
}

响应:
{
  "code": 200,
  "data": {
    "newStatus": "active",
    "message": "旅行计划状态已更新"
  }
}
```

#### 5. 旅行结束后自动完成（2025-12-04 凌晨2点）
```
⏰ 定时任务执行
✅ 自动完成旅行计划: 1 - 北京3日游
状态: active → completed
```

---

## ⚙️ 定时任务配置

### Cron表达式说明

```
@Scheduled(cron = "0 0 2 * * ?")
                  │ │ │ │ │ │
                  │ │ │ │ │ └─ 星期（任意）
                  │ │ │ │ └─── 月份（任意）
                  │ │ │ └───── 日期（任意）
                  │ │ └─────── 小时（2点）
                  │ └───────── 分钟（0分）
                  └─────────── 秒（0秒）
```

**执行时间**: 每天凌晨2:00:00

### 修改执行时间

如需修改定时任务的执行时间，编辑 `TravelPlanScheduler.java`:

```java
// 每天上午10点执行
@Scheduled(cron = "0 0 10 * * ?")

// 每小时执行一次
@Scheduled(cron = "0 0 * * * ?")

// 每30分钟执行一次
@Scheduled(cron = "0 */30 * * * ?")
```

---

## 🧪 测试步骤

### 1. 测试手动更新状态

```bash
# 创建测试计划（假设ID为1）
# ...

# 更新状态为active
curl -X PUT http://localhost:8082/api/travel-plans/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# 验证状态已更新
curl http://localhost:8082/api/travel-plans/1
```

### 2. 测试自动完成功能

```bash
# 1. 创建一个结束日期为昨天的计划
# 2. 手动设置状态为active
# 3. 等待定时任务执行（或重启应用触发）
# 4. 查询计划，验证状态已改为completed
```

### 3. 手动触发定时任务（测试用）

在 `TravelPlanScheduler` 中添加测试接口：

```java
@GetMapping("/test/auto-complete")
public ResponseDTO testAutoComplete() {
    int count = travelPlanService.autoCompleteExpiredPlans();
    return ResponseDTO.success("完成 " + count + " 个计划");
}
```

---

## 📊 数据库变更

**无需新建表**，使用现有的 `travel_plan` 表。

确保 `status` 字段支持以下值：
- `draft`
- `active`
- `completed`

---

## ⚠️ 注意事项

### 1. 时区问题
- 定时任务使用服务器时区
- 确保服务器时区与业务时区一致

### 2. 性能考虑
- 定时任务会查询所有 `active` 状态的计划
- 如果数据量大，考虑添加索引：
  ```sql
  CREATE INDEX idx_status_enddate ON travel_plan(status, end_date);
  ```

### 3. 并发安全
- 使用 `@Transactional` 确保数据一致性
- 定时任务不会与手动更新冲突

### 4. 日志监控
- 定时任务执行日志会输出到控制台
- 建议配置日志文件持久化

---

## 🔮 未来扩展

### 1. 状态变更通知
- 状态改变时发送通知给用户
- 支持邮件、短信、App推送

### 2. 更多状态
- `cancelled`: 已取消
- `postponed`: 已延期

### 3. 状态历史记录
- 记录每次状态变更的时间和操作人
- 支持查询状态变更历史

### 4. 灵活的定时规则
- 支持用户自定义提醒时间
- 支持多次提醒（出发前3天、1天、当天）

---

## 📚 相关文档

- [API接口文档](src/main/md/API接口文档.md) - 完整的API说明
- [TravelPlan实体](src/main/java/com/example/auth/entity/TravelPlan.java) - 数据模型
- [Spring定时任务文档](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#scheduling)

---

**功能已完成！** 🎉

现在系统支持：
- ✅ 手动更新旅行计划状态
- ✅ 自动完成过期的旅行计划
- ✅ 完整的状态流转管理
- ✅ 定时任务自动化处理

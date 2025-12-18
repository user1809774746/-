# 需求文档 - 修复流式输出中断问题

## 简介

本文档描述修复后端从n8n接收流式响应并转发给前端时，前端接收到的数据中途中断的问题。

## 术语表

- **System**: 后端Spring Boot应用
- **n8n**: 外部AI工作流服务
- **SSE**: Server-Sent Events，服务器推送事件
- **Chunk**: 数据块，流式传输中的一个数据片段
- **Frontend**: 前端应用

## 需求

### 需求 1: 完整数据传输

**用户故事:** 作为前端开发者，我希望能够完整接收n8n返回的所有流式数据，以便用户能看到完整的AI回复。

#### 验收标准

1. WHEN System从n8n接收流式数据 THEN System SHALL将所有接收到的数据完整转发给Frontend
2. WHEN 数据块在JSON对象边界被切分 THEN System SHALL正确处理跨边界的数据
3. WHEN 过滤travel_plan字段时 THEN System SHALL保留所有text内容不丢失
4. WHEN 流式传输过程中发生错误 THEN System SHALL记录详细的错误日志
5. WHEN 数据块包含不完整的JSON THEN System SHALL缓存并等待完整数据后再处理

### 需求 2: 数据过滤准确性

**用户故事:** 作为系统管理员，我希望travel_plan字段被正确过滤，同时不影响text内容的传输。

#### 验收标准

1. WHEN 数据块包含travel_plan字段 THEN System SHALL移除该字段但保留text字段
2. WHEN 数据块只包含text字段 THEN System SHALL直接转发不做修改
3. WHEN 数据块包含多个JSON对象 THEN System SHALL逐个处理每个对象
4. WHEN JSON解析失败 THEN System SHALL将原始数据转发给Frontend
5. WHEN 过滤后的数据为空 THEN System SHALL记录警告但不中断流

### 需求 3: 错误处理和日志

**用户故事:** 作为运维人员，我希望能够通过日志快速定位流式传输中的问题。

#### 验收标准

1. WHEN 读取n8n响应流时 THEN System SHALL记录每个数据块的大小和内容摘要
2. WHEN 过滤数据时发生异常 THEN System SHALL记录异常详情和原始数据
3. WHEN 流传输完成时 THEN System SHALL记录总共传输的数据量和块数
4. WHEN 检测到数据丢失时 THEN System SHALL记录警告日志
5. WHEN 流传输中断时 THEN System SHALL记录中断原因和已传输的数据量

### 需求 4: 性能和稳定性

**用户故事:** 作为用户，我希望流式输出响应迅速且稳定，不会出现卡顿或中断。

#### 验收标准

1. WHEN 接收到数据块时 THEN System SHALL在100毫秒内完成处理和转发
2. WHEN 缓冲区满时 THEN System SHALL立即flush数据到Frontend
3. WHEN 处理大量数据时 THEN System SHALL保持内存使用在合理范围内
4. WHEN 网络波动时 THEN System SHALL继续尝试读取数据直到流结束
5. WHEN 长时间无数据时 THEN System SHALL发送心跳保持连接活跃

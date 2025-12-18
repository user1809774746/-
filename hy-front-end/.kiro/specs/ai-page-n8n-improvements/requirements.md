# Requirements Document

## Introduction

本文档定义了 AiPage_N8N 组件的改进需求，主要解决两个核心问题：
1. AI回复中的图片链接应该以图片形式显示而不是文本链接
2. 流式输出在传输过程中提前终止的问题

## Glossary

- **AiPage_N8N**: AI助手页面组件，使用N8N后端进行AI对话
- **流式输出 (Streaming Output)**: 服务器逐步发送响应数据，前端实时显示的技术
- **图片URL (Image URL)**: 指向图片资源的网络地址，通常以 .jpg、.png 等扩展名结尾
- **Markdown解析器 (Markdown Parser)**: 将Markdown格式文本转换为HTML的工具函数
- **ReadableStream**: Web API提供的流式数据读取接口

## Requirements

### Requirement 1

**User Story:** 作为用户，我希望AI回复中的图片链接能够直接显示为图片，这样我可以直观地看到推荐的景点照片，而不需要点击链接。

#### Acceptance Criteria

1. WHEN AI回复包含图片URL THEN 系统应该识别并提取所有图片URL
2. WHEN 图片URL被识别后 THEN 系统应该在消息内容下方渲染实际的图片元素
3. WHEN 图片渲染时 THEN 系统应该从原始文本中移除图片URL以避免重复显示
4. WHEN 图片加载失败 THEN 系统应该优雅地隐藏失败的图片元素而不显示错误图标
5. WHERE 消息包含多个图片URL THEN 系统应该按顺序显示所有图片

### Requirement 2

**User Story:** 作为用户，我希望AI的流式回复能够完整地显示所有内容，这样我可以获得完整的旅行建议，而不是被截断的信息。

#### Acceptance Criteria

1. WHEN 后端发送流式数据 THEN 前端应该持续读取直到流结束
2. WHEN 流式数据包含JSON对象 THEN 系统应该正确解析每个完整的JSON对象
3. WHEN JSON解析遇到不完整数据 THEN 系统应该缓冲数据直到获得完整的JSON对象
4. WHEN 流读取完成 THEN 系统应该处理缓冲区中的剩余数据
5. IF 流读取过程中发生错误 THEN 系统应该保留已接收的部分内容并记录错误
6. WHEN 流式传输结束 THEN 系统应该调用完成回调函数并更新UI状态

### Requirement 3

**User Story:** 作为开发者，我希望能够调试流式输出问题，这样我可以快速定位数据传输中断的原因。

#### Acceptance Criteria

1. WHEN 流式数据被接收 THEN 系统应该在控制台记录接收到的数据块
2. WHEN JSON解析成功或失败 THEN 系统应该记录解析结果和错误信息
3. WHEN 流读取完成或中断 THEN 系统应该记录最终状态和缓冲区内容
4. WHEN 图片URL被提取 THEN 系统应该记录提取到的URL列表

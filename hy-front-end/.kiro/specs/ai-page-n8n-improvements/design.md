# Design Document

## Overview

本设计文档描述了 AiPage_N8N 组件的两个关键改进：图片URL自动渲染和流式输出完整性保障。这些改进将显著提升用户体验，使AI助手能够更好地展示视觉内容，并确保完整的响应内容传递。

## Architecture

### 当前架构分析

AiPage_N8N 组件采用以下架构：
- **前端组件**: React函数组件，管理消息状态和UI渲染
- **流式处理**: 使用 Fetch API 的 ReadableStream 接收后端数据
- **消息解析**: 自定义 JSON 提取函数处理流式数据
- **Markdown渲染**: 自定义 parseMarkdown 函数将Markdown转换为HTML

### 改进架构

改进将在现有架构基础上增强以下部分：

1. **图片处理层**
   - 图片URL识别模块
   - 图片渲染组件
   - 文本清理模块

2. **流式处理增强**
   - 改进的缓冲区管理
   - 更健壮的JSON解析
   - 完整的错误处理和恢复机制

## Components and Interfaces

### 1. 图片URL提取函数 (extractImageUrls)

**当前实现**:
```javascript
const extractImageUrls = (text) => {
  if (!text) return [];
  const imageUrlPattern = /(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s<>"']*)?)/gi;
  const matches = text.match(imageUrlPattern);
  return matches ? [...new Set(matches)] : [];
};
```

**问题分析**:
- 正则表达式可能无法匹配所有图片URL格式
- 没有处理Markdown图片语法 `![alt](url)`
- 没有验证URL的有效性

**改进方案**:
- 增强正则表达式以支持更多URL格式
- 添加Markdown图片语法支持
- 添加URL验证逻辑

### 2. 图片URL移除函数 (removeImageUrls)

**当前实现**:
```javascript
const removeImageUrls = (text) => {
  if (!text) return text;
  const imageUrlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s]*)?)/gi;
  return text.replace(imageUrlPattern, '').trim();
};
```

**问题分析**:
- 移除URL后可能留下多余的空白或标点
- 没有处理Markdown图片语法

**改进方案**:
- 清理移除URL后的多余空白和标点
- 处理Markdown图片语法

### 3. 流式处理函数 (processStream)

**当前实现问题**:
- 缓冲区管理不够健壮
- JSON解析可能在不完整数据时失败
- 错误处理不完整，可能导致数据丢失

**改进方案**:
- 增强缓冲区管理，确保完整JSON对象
- 添加更详细的日志记录
- 改进错误恢复机制
- 确保流结束时处理所有剩余数据

### 4. JSON提取函数 (extractJson)

**当前实现问题**:
- 深度计数可能在复杂嵌套时出错
- 字符串转义处理可能不完整
- 没有处理数组作为顶层结构的情况

**改进方案**:
- 改进深度计数逻辑
- 增强字符串转义处理
- 支持数组作为顶层结构

## Data Models

### Message对象

```javascript
{
  id: number,           // 消息唯一标识
  text: string,         // 消息文本内容
  sender: 'user' | 'ai', // 发送者类型
  timestamp: string,    // 时间戳（格式化后）
  images?: string[]     // 可选：提取的图片URL数组
}
```

### StreamData对象

```javascript
{
  type: 'item' | 'message',  // 数据类型
  content?: string,          // item类型的内容
  text?: string             // message类型的文本
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: 图片URL提取完整性
*For any* 包含图片URL的文本字符串，extractImageUrls函数应该识别并返回所有有效的图片URL，不遗漏任何一个。
**Validates: Requirements 1.1**

### Property 2: 图片URL移除一致性
*For any* 包含图片URL的文本字符串，在调用removeImageUrls后，返回的文本应该不包含任何原始的图片URL。
**Validates: Requirements 1.3**

### Property 3: 图片顺序保持性
*For any* 包含多个图片URL的文本，extractImageUrls返回的URL数组应该保持与原文本中相同的顺序。
**Validates: Requirements 1.5**

### Property 4: 流式数据完整性
*For any* 完整的流式数据序列，processStream函数应该读取并处理所有数据块，直到流结束。
**Validates: Requirements 2.1**

### Property 5: JSON解析完整性
*For any* 包含有效JSON对象的流式数据，extractJson和processStream应该正确解析并提取所有完整的JSON对象。
**Validates: Requirements 2.2**

### Property 6: 缓冲区数据保留性
*For any* 被分块传输的完整JSON对象，系统应该缓冲不完整的数据片段，直到接收到完整对象后再解析。
**Validates: Requirements 2.3**

### Property 7: 流结束数据处理性
*For any* 在流结束时缓冲区中仍有数据的情况，系统应该尝试解析这些剩余数据。
**Validates: Requirements 2.4**

### Property 8: 错误恢复数据保留性
*For any* 在流读取过程中发生错误的情况，系统应该保留已成功接收和解析的所有数据。
**Validates: Requirements 2.5**

## Error Handling

### 图片加载错误
- 使用 `onError` 事件处理器捕获图片加载失败
- 失败时隐藏图片元素（设置 `display: none`）
- 不显示破损图片图标，保持UI整洁

### 流式传输错误
- 在 `processStream` 中使用 try-catch 捕获解析错误
- 错误发生时保留已接收的部分内容
- 调用 `onError` 回调，传递错误信息和部分内容
- 记录详细的错误日志便于调试

### JSON解析错误
- 在 `extractJson` 中使用 try-catch 包裹 JSON.parse
- 解析失败时继续尝试下一个可能的JSON对象
- 不因单个对象解析失败而中断整个流处理

### URL提取错误
- 使用防御性编程，检查输入是否为空或无效
- 正则表达式匹配失败时返回空数组
- 不抛出异常，保证函数总是返回有效结果

## Testing Strategy

### 单元测试

本项目将使用 **Jest** 和 **React Testing Library** 进行单元测试。

#### 图片URL处理测试
- 测试 `extractImageUrls` 能识别各种格式的图片URL
- 测试 `removeImageUrls` 正确移除URL并清理空白
- 测试边缘情况：空字符串、无URL文本、特殊字符

#### 流式处理测试
- 测试 `extractJson` 正确提取完整JSON对象
- 测试 `processStream` 处理完整流数据
- 测试缓冲区管理和不完整数据处理
- 测试错误恢复机制

#### 组件渲染测试
- 测试消息组件正确渲染图片元素
- 测试图片加载失败时的错误处理
- 测试多图片消息的渲染顺序

### 属性测试 (Property-Based Testing)

本项目将使用 **fast-check** 库进行属性测试。每个属性测试将运行至少 100 次迭代。

#### 属性测试要求
- 每个属性测试必须使用注释标记对应的设计文档属性
- 标记格式：`// Feature: ai-page-n8n-improvements, Property X: [property description]`
- 每个正确性属性必须有对应的属性测试

#### 测试生成器
- **URL生成器**: 生成各种格式的图片URL（http/https、不同扩展名、带/不带查询参数）
- **文本生成器**: 生成包含URL的随机文本
- **JSON流生成器**: 生成有效的JSON对象流，可选择性地分块
- **错误场景生成器**: 生成各种错误情况（不完整JSON、无效URL等）

### 集成测试

- 测试完整的消息发送和接收流程
- 测试图片URL从提取到渲染的完整流程
- 测试流式输出的端到端场景
- 使用模拟的后端响应进行测试

### 调试和日志

- 在关键点添加 console.log 记录数据流
- 记录图片URL提取结果
- 记录JSON解析成功/失败
- 记录流读取状态变化
- 使用不同的日志级别（info、warn、error）

## Implementation Notes

### 图片URL正则表达式改进

当前正则表达式：
```javascript
/(https?:\/\/[^\s<>"']+\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?[^\s<>"']*)?)/gi
```

改进建议：
- 支持更多图片格式（ico、tiff等）
- 处理URL中的特殊字符
- 支持Markdown图片语法 `![alt](url)`

### 流式处理改进要点

1. **缓冲区管理**
   - 维护一个字符串��冲区
   - 每次读取新数据时追加到缓冲区
   - 成功解析后从缓冲区移除已处理数据

2. **JSON提取改进**
   - 改进括号匹配逻辑
   - 正确处理字符串中的转义字符
   - 支持嵌套对象和数组

3. **错误恢复**
   - 捕获所有可能的异常
   - 保留部分成功的数据
   - 提供有意义的错误信息

4. **完成处理**
   - 流结束时检查缓冲区
   - 尝试解析剩余数据
   - 调用完成回调

### 性能考虑

- 图片URL提取使用正则表达式，性能良好
- 避免在每次渲染时重新提取URL（使用useMemo）
- 流式处理使用增量更新，避免重新渲染整个消息列表
- 图片懒加载可以考虑在未来添加

### 兼容性

- 确保在所有现代浏览器中工作
- ReadableStream API 在所有主流浏览器中都支持
- 正则表达式使用标准语法，兼容性好

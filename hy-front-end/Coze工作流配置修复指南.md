# Coze工作流配置修复指南

## ❌ 当前错误

```
错误码：4200
错误信息：Conversation not found. Please create a conversation before attempting to perform any related operations.
```

**原因：** 工作流没有正确处理"首次对话（conversationId为空）"的情况。

## 🔧 解决方案：调整Coze工作流

### 步骤1：检查输入参数配置

打开你的Coze工作流，确认输入参数：

```
开始节点 - 输入参数：
├─ CONVERSATION_NAME (字符串，必填)
├─ USER_INPUT (字符串，必填)
└─ conversationId (字符串，选填) ⚠️ 注意：必须设置为"选填"
```

### 步骤2：修改选择器节点

#### 错误配置（可能导致问题）：
```
选择器节点
├─ 条件：如果 conversationId 存在
│   └─ 是 → 进入大模型节点
│   └─ 否 → ❌ 没有处理或直接报错
```

#### 正确配置：
```
选择器节点
├─ 条件：判断 conversationId 是否为空或不存在
│   
│   分支1：conversationId 为空 (isEmpty 或 isNull)
│   └─ 进入"创建会话"节点
│       └─ 输出：新的 conversationId
│           └─ 进入"大模型"节点
│   
│   分支2：conversationId 不为空 (isNotEmpty)
│   └─ 直接进入"大模型"节点
```

### 步骤3：创建会话节点配置

如果你的工作流中没有"创建会话"节点，需要添加：

```
创建会话节点（推荐使用"代码"节点）
├─ 输入：CONVERSATION_NAME
├─ 处理：
│   function main(input) {
│     // 生成新的 conversationId
│     const conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
│     return {
│       conversationId: conversationId
│     };
│   }
└─ 输出：conversationId
```

### 步骤4：大模型节点配置

```
大模型节点
├─ 输入：
│   ├─ USER_INPUT (用户输入)
│   ├─ conversationId (从创建会话节点或选择器节点传入)
│   └─ CONVERSATION_NAME (用于上下文管理)
├─ 配置：
│   └─ 启用"记忆"功能，使用 conversationId 作为会话标识
└─ 输出：
    └─ AI回复内容
```

### 步骤5：结束节点配置

```
结束节点
└─ 输出：
    ├─ conversation_id (必须返回，前端需要保存)
    └─ messages (对话消息数组)
        └─ [
              {
                "role": "assistant",
                "type": "answer",
                "content": "AI的回复内容"
              }
            ]
```

## 📊 完整工作流结构

```
┌─────────────────────────────────────────────────────────────┐
│                         开始节点                             │
│  输入：CONVERSATION_NAME, USER_INPUT, conversationId        │
└────────────────────────────┬────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────┐
│                       选择器节点                             │
│  判断：conversationId 是否为空？                            │
└────────┬─────────────────────────────────────┬──────────────┘
         ↓ 为空                              ↓ 不为空
┌────────────────────┐              ┌──────────────────────┐
│  创建会话节点      │              │   （跳过创建）        │
│  生成新的ID        │              │                      │
└────────┬───────────┘              └──────────┬───────────┘
         ↓                                     ↓
         └──────────────────┬──────────────────┘
                            ↓
                ┌───────────────────────┐
                │    大模型节点         │
                │  处理用户输入         │
                │  使用conversationId   │
                │  保持上下文           │
                └───────────┬───────────┘
                            ↓
                ┌───────────────────────┐
                │    结束节点           │
                │  返回：                │
                │  - conversation_id    │
                │  - messages           │
                └───────────────────────┘
```

## 🎯 关键配置要点

### 1. 选择器节点的判断条件

**正确的判断条件：**
```
条件表达式：{{ conversationId == null || conversationId == "" || conversationId == undefined }}

或者使用 Coze 的内置函数：
isEmpty(conversationId)
```

### 2. conversationId 的传递

确保 conversationId 在整个流程中正确传递：

```
开始节点 (conversationId) 
  → 选择器节点 (conversationId)
    → 创建会话节点 (生成新 conversationId) 或 跳过
      → 大模型节点 (使用 conversationId)
        → 结束节点 (返回 conversationId)
```

### 3. 大模型的记忆配置

在大模型节点中：
- ✅ 启用"记忆"或"上下文"功能
- ✅ 使用 `conversationId` 作为会话标识
- ✅ 确保每次请求都传入相同的 `conversationId` 来保持上下文

## 🧪 测试工作流

在 Coze 平台测试你的工作流：

### 测试1：首次对话（无 conversationId）
```json
{
  "CONVERSATION_NAME": "test_user_001",
  "USER_INPUT": "你好",
  "conversationId": ""
}
```

**预期结果：**
- ✅ 进入"创建会话"分支
- ✅ 生成新的 conversationId
- ✅ 返回 AI 回复和新的 conversationId

### 测试2：继续对话（有 conversationId）
```json
{
  "CONVERSATION_NAME": "test_user_001",
  "USER_INPUT": "我刚才说了什么",
  "conversationId": "conv_1234567890"
}
```

**预期结果：**
- ✅ 跳过"创建会话"分支
- ✅ 直接使用已有的 conversationId
- ✅ AI 能记住之前的对话（"你好"）

## 🔍 调试技巧

### 1. 检查选择器节点输出

在选择器节点后添加"调试输出"节点，查看：
```
- conversationId 的值是什么？
- 选择了哪个分支？
- 为什么选择这个分支？
```

### 2. 检查创建会话节点

确认创建会话节点能正确生成新的 conversationId：
```javascript
// 测试代码
console.log('创建新会话...');
const newId = 'conv_' + Date.now();
console.log('新的 conversationId:', newId);
return { conversationId: newId };
```

### 3. 检查大模型节点输入

确认大模型节点接收到的参数：
```
- conversationId: 是否存在？
- USER_INPUT: 是否正确？
- CONVERSATION_NAME: 是否正确？
```

## ⚠️ 常见错误

### 错误1：选择器条件写错
```
❌ 错误：条件为 "conversationId 存在" 但没有 else 分支
✅ 正确：条件为 "conversationId 为空" 然后创建，否则直接使用
```

### 错误2：没有返回 conversationId
```
❌ 错误：结束节点只返回 messages，没有返回 conversation_id
✅ 正确：必须返回 conversation_id 和 messages
```

### 错误3：大模型没有启用记忆
```
❌ 错误：每次都是新对话，不记得之前的内容
✅ 正确：启用记忆功能，使用 conversationId 作为会话标识
```

## 📝 配置清单

完成配置后，检查以下项目：

- [ ] 输入参数包含 CONVERSATION_NAME、USER_INPUT、conversationId（选填）
- [ ] 选择器节点能正确判断 conversationId 是否为空
- [ ] 有"创建会话"节点或逻辑，能生成新的 conversationId
- [ ] 大模型节点启用了记忆/上下文功能
- [ ] 结束节点返回 conversation_id 和 messages
- [ ] 在 Coze 平台测试通过（有无 conversationId 两种情况）

## 🚀 配置完成后

完成以上配置后，前端代码无需修改，应该就能正常工作了！

如果还有问题，请提供：
1. Coze 工作流的截图或配置导出
2. 完整的错误日志
3. 测试时的输入参数

我会继续帮你排查！


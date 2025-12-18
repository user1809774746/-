# Coze工作流 - 添加 CONVERSATION_NAME 参数

## 🎯 目标

在Coze工作流中添加 `CONVERSATION_NAME` 参数，用于实现多用户隔离。

## 📋 操作步骤

### 步骤1：编辑工作流

1. 打开你的Coze工作流（当前已经能正常运行的那个）
2. 点击"编辑"按钮

### 步骤2：修改"用户输入 UserInput"节点

找到工作流左侧的"用户输入 UserInput"节点，添加第三个输入参数：

**当前配置（2个参数）：**
```
用户输入 UserInput
├─ USER_INPUT (字符串，必填)
└─ conversationId (字符串，选填)
```

**修改为（3个参数）：**
```
用户输入 UserInput
├─ USER_INPUT (字符串，必填)
├─ conversationId (字符串，选填)
└─ CONVERSATION_NAME (字符串，必填) ← 新增这个
```

### 步骤3：在大模型节点中使用 CONVERSATION_NAME

#### 方案A：作为系统提示的一部分（推荐）

在"调用 LLM 大模型"节点的系统提示中添加：

```
你是一个旅游规划助手。
当前用户标识：{{CONVERSATION_NAME}}
请为用户提供个性化的旅游建议。
```

#### 方案B：作为用户上下文

在大模型节点的配置中，可以将 `CONVERSATION_NAME` 作为用户标识，帮助AI区分不同用户。

### 步骤4：测试修改后的工作流

在Coze平台测试界面输入：

```json
{
  "USER_INPUT": "你好",
  "conversationId": "",
  "CONVERSATION_NAME": "user_13800138000"
}
```

**预期结果：**
- ✅ 不报错
- ✅ AI正常回复
- ✅ 返回 conversation_id

### 步骤5：再次测试前端

修改完Coze工作流后：
1. 回到前端应用
2. 刷新页面
3. 发送消息
4. 应该能正常工作了！

## 🎨 工作流结构（修改后）

```
用户输入 a002
  ├─ USER_INPUT
  ├─ conversationId
  └─ CONVERSATION_NAME ← 新增
      ↓
用户输入 UserInput
  ├─ USER_INPUT
  ├─ conversationId
  └─ CONVERSATION_NAME ← 新增
      ↓
工作流 a002
      ↓
选择器
  判断：conversationId 是否为空
      ↓
调用 LLM 大模型
  使用 CONVERSATION_NAME 区分用户 ← 新功能
      ↓
工作流结果 结束
```

## ✅ 添加后的好处

1. **多用户隔离**：每个用户有独立的 CONVERSATION_NAME
2. **上下文保持**：conversationId 保持对话连续性
3. **灵活管理**：可以基于 CONVERSATION_NAME 做更多功能

## 🧪 测试用例

### 测试1：用户A首次对话
```json
{
  "USER_INPUT": "我想去北京",
  "conversationId": "",
  "CONVERSATION_NAME": "user_13800138000"
}
```

### 测试2：用户A继续对话
```json
{
  "USER_INPUT": "我刚才说要去哪里",
  "conversationId": "返回的conversation_id",
  "CONVERSATION_NAME": "user_13800138000"
}
```

### 测试3：用户B独立对话
```json
{
  "USER_INPUT": "推荐上海景点",
  "conversationId": "",
  "CONVERSATION_NAME": "user_13900139000"
}
```

## 📝 注意事项

- ✅ CONVERSATION_NAME 设置为"必填"
- ✅ 每个用户使用唯一的 CONVERSATION_NAME
- ✅ 格式: `user_手机号` 或 `guest_时间戳`

完成后，前端代码无需修改，直接就能工作！


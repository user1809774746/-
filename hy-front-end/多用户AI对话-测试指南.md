# 多用户AI对话功能 - 测试指南

## 🎯 测试目标

验证不同用户能够在各自的页面独立与AI对话，互不干扰，且能保持各自的上下文记忆。

## 📋 测试前准备

### 1. 确认Coze工作流配置

打开你的Coze工作流，确认包含以下节点：

```
开始节点
  ↓
  输入参数：
  - CONVERSATION_NAME (必填)
  - USER_INPUT (必填)
  - conversationId (选填)
  ↓
选择器节点
  ↓
  判断：conversationId 是否为空
  ↓
  是 → 创建会话节点 → 生成新的 conversationId
  ↓
  否 → 直接进入大模型节点
  ↓
大模型节点
  ↓
  输入：USER_INPUT + conversationId
  输出：AI回复
  ↓
结束节点
  ↓
  返回：conversation_id + messages
```

### 2. 准备测试账号

- **账号A**：13800138000（或你的测试账号1）
- **账号B**：13900139000（或你的测试账号2）

### 3. 准备浏览器

- **浏览器1**：Chrome/Edge（用于账号A）
- **浏览器2**：Firefox/Safari/隐身模式Chrome（用于账号B）

## 🧪 测试用例

### 测试用例1：首次对话（验证conversation_id创建）

#### 步骤：

1. **浏览器1 - 账号A**
   ```
   操作：登录账号A → 进入AI页面 → 打开浏览器控制台(F12)
   发送消息："你好，我是用户A"
   
   观察控制台日志：
   ✅ 应该看到：🔑 当前用户会话标识: user_13800138000
   ✅ 应该看到：🆕 这是新的对话，将创建新的 conversation_id
   ✅ 应该看到：💾 保存 conversation_id: conv_xxxxx
   ```

2. **验证LocalStorage**
   ```
   控制台输入：localStorage.getItem('coze_conversation_id')
   预期结果：返回 conversation_id（如 "conv_xxxxx"）
   ```

#### 预期结果：
- ✅ AI正常回复
- ✅ 生成了新的 conversation_id
- ✅ conversation_id 保存到了 localStorage

---

### 测试用例2：上下文记忆（同一用户）

#### 步骤：

1. **继续在浏览器1 - 账号A**
   ```
   发送消息："我刚才说了什么？"
   
   观察控制台日志：
   ✅ 应该看到：🔄 使用已有的 conversation_id 保持上下文: conv_xxxxx
   ```

#### 预期结果：
- ✅ AI能够记住之前的对话内容
- ✅ AI回复类似："你刚才说'你好，我是用户A'"
- ✅ 使用的是同一个 conversation_id

---

### 测试用例3：多用户隔离（不同用户）

#### 步骤：

1. **浏览器2 - 账号B**
   ```
   操作：登录账号B → 进入AI页面 → 打开浏览器控制台(F12)
   发送消息："你好，我是用户B，今天天气怎么样？"
   
   观察控制台日志：
   ✅ 应该看到：🔑 当前用户会话标识: user_13900139000  （不同于用户A）
   ✅ 应该看到：🆕 这是新的对话，将创建新的 conversation_id
   ✅ 应该看到：💾 保存 conversation_id: conv_yyyyy  （不同于用户A的ID）
   ```

2. **验证用户B的上下文**
   ```
   继续发送："我刚才问了什么？"
   
   预期结果：AI回复与"天气"相关，不会提到"用户A"
   ```

3. **返回浏览器1 - 账号A**
   ```
   发送消息："我之前说过天气的问题吗？"
   
   预期结果：AI回复"没有"或类似内容，不会提到用户B的对话
   ```

#### 预期结果：
- ✅ 用户A和用户B使用不同的 CONVERSATION_NAME
- ✅ 用户A和用户B使用不同的 conversation_id
- ✅ 两个用户的对话内容完全隔离
- ✅ AI不会混淆不同用户的对话

---

### 测试用例4：清除对话（重置conversation_id）

#### 步骤：

1. **浏览器1 - 账号A**
   ```
   操作：点击页面右上角的"清除"按钮
   确认弹窗
   
   观察控制台日志：
   ✅ 应该看到：✅ 聊天历史已清除，下次对话将创建新会话（新的 conversation_id）
   ```

2. **验证LocalStorage**
   ```
   控制台输入：localStorage.getItem('coze_conversation_id')
   预期结果：null（已清除）
   ```

3. **发送新消息**
   ```
   发送消息："现在几点了？"
   
   观察控制台日志：
   ✅ 应该看到：🆕 这是新的对话，将创建新的 conversation_id
   ✅ 应该看到：💾 保存 conversation_id: conv_zzzzz（新的ID，不同于之前的）
   ```

4. **验证上下文重置**
   ```
   发送消息："我刚才说了什么？"
   
   预期结果：AI回复"现在几点了"，不会提到"用户A"的内容
   ```

#### 预期结果：
- ✅ 清除对话成功
- ✅ conversation_id 被重置
- ✅ 新对话生成新的 conversation_id
- ✅ AI不会记住清除前的对话内容

---

### 测试用例5：页面刷新（验证持久化）

#### 步骤：

1. **浏览器1 - 账号A**
   ```
   发送消息："我喜欢旅游"
   等待AI回复
   ```

2. **刷新页面（F5）**
   ```
   观察：聊天历史应该恢复显示
   ```

3. **发送新消息**
   ```
   发送消息："我刚才说我喜欢什么？"
   
   观察控制台日志：
   ✅ 应该看到：✅ 已恢复聊天历史，共 X 条消息
   ✅ 应该看到：🔄 使用已有的 conversation_id 保持上下文
   ```

#### 预期结果：
- ✅ 刷新后聊天历史恢复
- ✅ conversation_id 保持不变
- ✅ AI能够记住刷新前的对话内容

---

### 测试用例6：游客模式（未登录）

#### 步骤：

1. **新的无痕窗口**
   ```
   操作：打开无痕窗口 → 直接访问AI页面（不登录）
   打开控制台
   发送消息："你好"
   
   观察控制台日志：
   ✅ 应该看到：🔑 当前用户会话标识: user_guest_xxxxxxxxx（时间戳）
   ```

2. **刷新页面**
   ```
   预期结果：会话标识会变化（因为没有登录，user_phone为null）
   ```

#### 预期结果：
- ✅ 未登录用户也能使用AI功能
- ✅ 使用 guest_时间戳 作为唯一标识
- ✅ 刷新后会生成新的guest标识（建议引导用户登录）

---

## 🔍 调试技巧

### 1. 查看控制台日志

关键日志标识：
- `🔑 当前用户会话标识` - CONVERSATION_NAME
- `🆕 这是新的对话` - 首次对话
- `🔄 使用已有的 conversation_id` - 上下文对话
- `💾 保存 conversation_id` - ID保存成功

### 2. 查看LocalStorage

```javascript
// 控制台输入以下命令：
console.log('用户手机号:', localStorage.getItem('user_phone'));
console.log('对话ID:', localStorage.getItem('coze_conversation_id'));
console.log('聊天历史:', JSON.parse(localStorage.getItem('coze_chat_history')));
```

### 3. 查看请求参数

在 `callCozeAPI` 函数中查看：
```javascript
console.log('🚀 对话流请求体:', JSON.stringify(requestBody, null, 2));
```

应该看到：
```json
{
  "workflow_id": "7566523293693673514",
  "app_id": "7566481327336439808",
  "parameters": {
    "CONVERSATION_NAME": "user_13800138000",  // 用户唯一标识
    "USER_INPUT": "你好"
  },
  "conversation_id": "conv_xxxxx"  // 如果有的话
}
```

### 4. 清除所有数据重新测试

```javascript
// 控制台输入：
localStorage.removeItem('coze_conversation_id');
localStorage.removeItem('coze_chat_history');
localStorage.removeItem('coze_conversation_name');
location.reload();
```

## ✅ 测试检查清单

- [ ] 首次对话能创建新的 conversation_id
- [ ] 同一用户能保持上下文记忆
- [ ] 不同用户的对话完全隔离
- [ ] 清除对话能重置 conversation_id
- [ ] 页面刷新后上下文保持不变
- [ ] 游客模式能正常工作
- [ ] 控制台日志显示正确的 CONVERSATION_NAME
- [ ] LocalStorage正确保存和读取数据

## 🎉 测试通过标准

所有测试用例都应该满足：
1. ✅ 不同用户使用不同的 `CONVERSATION_NAME`
2. ✅ 不同用户的 `conversation_id` 完全独立
3. ✅ AI能记住同一用户的对话历史
4. ✅ AI不会混淆不同用户的对话内容
5. ✅ 清除对话能正确重置状态
6. ✅ 页面刷新不影响对话上下文

## 🐛 常见问题排查

### 问题1：AI记住了其他用户的对话

**原因**：`CONVERSATION_NAME` 没有正确设置为用户唯一标识

**解决**：检查代码中是否正确使用了 `user_${userPhone}`

### 问题2：刷新页面后丢失上下文

**原因**：`conversation_id` 没有正确保存到 LocalStorage

**解决**：检查是否在收到响应后保存了 `conversation_id`

### 问题3：游客模式刷新后失去对话

**原因**：游客使用时间戳作为标识，刷新会变化

**解决**：这是预期行为，建议引导游客登录

### 问题4：Coze返回错误

**排查步骤**：
1. 检查 workflow_id 和 app_id 是否正确
2. 检查 token 是否有效
3. 检查 Coze 工作流是否正确配置
4. 查看控制台的完整错误信息

## 📞 需要帮助？

如果测试过程中遇到问题，请提供：
1. 控制台完整日志
2. LocalStorage 中的数据
3. 测试步骤和预期结果
4. 实际结果截图

这样我可以更好地帮你排查问题！


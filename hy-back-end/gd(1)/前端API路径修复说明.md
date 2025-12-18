# 前端API路径修复说明

## 问题描述

前端调用群聊API时出现404错误：
```
API请求失败: /api/group/create/my-groups?userId=1 Error: HTTP 404: Not Found
```

## 问题原因

前端请求路径错误，多了一个 `/create` 部分：
- ❌ 错误路径：`/api/group/create/my-groups?userId=1`
- ✅ 正确路径：`/api/group/my-groups?userId=1`

## 修复方案

### 方案1：检查API配置文件（推荐）

打开前端的 `config.js` 或 API配置文件，找到 `getMyGroups` 函数定义（大约在2133行），修改为：

**错误的代码（需要修复）：**
```javascript
// 错误示例1：基础路径配置错误
const getMyGroups = async (userId) => {
  return await apiRequest('GET', `/group/create/my-groups?userId=${userId}`);
};

// 错误示例2：路径拼接错误
const BASE_PATH = '/api/group/create';
const getMyGroups = async (userId) => {
  return await apiRequest('GET', `${BASE_PATH}/my-groups?userId=${userId}`);
};
```

**正确的代码：**
```javascript
// 方式1：直接使用完整路径
const getMyGroups = async (userId) => {
  return await apiRequest('GET', `/api/group/my-groups?userId=${userId}`);
};

// 方式2：使用正确的基础路径
const BASE_PATH = '/api/group';
const getMyGroups = async (userId) => {
  return await apiRequest('GET', `${BASE_PATH}/my-groups?userId=${userId}`);
};
```

### 方案2：使用axios直接调用

如果你使用的是axios，可以这样调用：

```javascript
import axios from 'axios';

const getMyGroups = async (userId) => {
  try {
    const response = await axios.get('/api/group/my-groups', {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('获取群聊列表失败:', error);
    throw error;
  }
};
```

---

## 完整的群聊API路径列表

以下是所有群聊相关的正确API路径，请检查前端配置：

### 群聊管理
| 功能 | 方法 | 正确路径 |
|------|------|----------|
| 创建群聊 | POST | `/api/group/create` |
| 拉好友建群 | POST | `/api/group/create-with-friends` |
| 获取群信息 | GET | `/api/group/{groupId}/info` |
| 获取我的群聊 | GET | `/api/group/my-groups` |
| 搜索群聊 | GET | `/api/group/search` |

### 成员管理
| 功能 | 方法 | 正确路径 |
|------|------|----------|
| 邀请入群 | POST | `/api/group/{groupId}/invite` |
| 获取成员列表 | GET | `/api/group/{groupId}/members` |
| 申请入群 | POST | `/api/group/{groupId}/join` |

### 群消息
| 功能 | 方法 | 正确路径 |
|------|------|----------|
| 发送群消息 | POST | `/api/group/{groupId}/send-message` |
| 获取聊天记录 | GET | `/api/group/{groupId}/messages` |
| 标记已读 | POST | `/api/group/{groupId}/mark-read` |

---

## 前端完整示例代码

### React示例

```javascript
// api/groupChat.js
import axios from 'axios';

const BASE_URL = '/api/group';

export const groupChatAPI = {
  // 获取我的群聊列表
  getMyGroups: async (userId) => {
    const response = await axios.get(`${BASE_URL}/my-groups`, {
      params: { userId }
    });
    return response.data;
  },

  // 创建群聊（拉好友建群）
  createGroupWithFriends: async (data) => {
    const response = await axios.post(`${BASE_URL}/create-with-friends`, data);
    return response.data;
  },

  // 获取群信息
  getGroupInfo: async (groupId, userId) => {
    const response = await axios.get(`${BASE_URL}/${groupId}/info`, {
      params: { userId }
    });
    return response.data;
  },

  // 获取群成员列表
  getGroupMembers: async (groupId, userId) => {
    const response = await axios.get(`${BASE_URL}/${groupId}/members`, {
      params: { userId }
    });
    return response.data;
  },

  // 发送群消息
  sendGroupMessage: async (groupId, data) => {
    const response = await axios.post(`${BASE_URL}/${groupId}/send-message`, data);
    return response.data;
  },

  // 标记群消息已读
  markAsRead: async (groupId, userId) => {
    const response = await axios.post(`${BASE_URL}/${groupId}/mark-read`, {
      userId
    });
    return response.data;
  },

  // 邀请用户入群
  inviteToGroup: async (groupId, data) => {
    const response = await axios.post(`${BASE_URL}/${groupId}/invite`, data);
    return response.data;
  }
};
```

### Vue示例

```javascript
// api/groupChat.js
import axios from 'axios';

const BASE_URL = '/api/group';

export default {
  // 获取我的群聊列表
  async getMyGroups(userId) {
    const { data } = await axios.get(`${BASE_URL}/my-groups`, {
      params: { userId }
    });
    return data;
  },

  // 创建群聊（拉好友建群）
  async createGroupWithFriends(formData) {
    const { data } = await axios.post(`${BASE_URL}/create-with-friends`, formData);
    return data;
  },

  // 获取群信息
  async getGroupInfo(groupId, userId) {
    const { data } = await axios.get(`${BASE_URL}/${groupId}/info`, {
      params: { userId }
    });
    return data;
  },

  // 发送群消息
  async sendGroupMessage(groupId, message) {
    const { data } = await axios.post(`${BASE_URL}/${groupId}/send-message`, message);
    return data;
  },

  // 标记群消息已读
  async markAsRead(groupId, userId) {
    const { data } = await axios.post(`${BASE_URL}/${groupId}/mark-read`, {
      userId
    });
    return data;
  }
};
```

---

## 快速测试

### 使用浏览器测试（GET请求）

打开浏览器控制台，输入：

```javascript
// 测试获取群聊列表
fetch('/api/group/my-groups?userId=1')
  .then(res => res.json())
  .then(data => console.log('群聊列表:', data))
  .catch(err => console.error('错误:', err));
```

### 使用Postman测试

1. **获取我的群聊列表**
   - 方法：GET
   - URL：`http://localhost:8082/api/group/my-groups?userId=1`
   
2. **创建群聊**
   - 方法：POST
   - URL：`http://localhost:8082/api/group/create-with-friends`
   - Body (JSON):
   ```json
   {
     "creatorId": 1,
     "groupName": "测试群聊",
     "groupDescription": "这是一个测试群",
     "friendIds": [2, 3, 4]
   }
   ```

3. **发送群消息**
   - 方法：POST
   - URL：`http://localhost:8082/api/group/1/send-message`
   - Body (JSON):
   ```json
   {
     "senderId": 1,
     "messageType": "text",
     "content": "大家好！"
   }
   ```

---

## 常见错误排查

### 1. 404 Not Found
- ✅ 检查路径是否正确
- ✅ 检查是否多了或少了某些部分
- ✅ 确认后端服务是否正常运行

### 2. 405 Method Not Allowed
- ✅ 检查HTTP方法是否正确（GET/POST/PUT/DELETE）

### 3. 500 Internal Server Error
- ✅ 检查请求参数是否完整
- ✅ 检查后端日志查看具体错误

---

## 总结

**修复步骤**：
1. ✅ 找到前端 `config.js` 文件的第2133行附近
2. ✅ 找到 `getMyGroups` 函数
3. ✅ 将路径从 `/api/group/create/my-groups` 改为 `/api/group/my-groups`
4. ✅ 检查其他API函数的路径是否正确
5. ✅ 重新加载前端页面测试

**记住**：所有群聊API的基础路径都是 `/api/group`，不要额外添加 `/create` 部分！

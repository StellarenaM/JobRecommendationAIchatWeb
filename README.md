# 前端应用（Frontend）

智能岗位推荐系统的前端单页应用，基于 Vue 3 + Vite，负责对话界面、会话管理、岗位卡片展示以及与后端 SSE 流式交互。

---

## 1. 功能概述

- 对话界面
  - 支持类似 ChatGPT 的多轮对话展示
  - 显示用户与助手的消息气泡
- 会话管理
  - 左侧会话列表，支持查看历史会话
  - 切换会话时自动加载对应历史消息
- 岗位推荐展示
  - 在对话下方渲染岗位推荐卡片
  - 支持点击岗位卡片放大查看详情，右上角圆形关闭按钮
- 流式回复体验
  - 通过 SSE 接收后端流式响应
  - 消息逐字“刷出”，提升交互体验

---

## 2. 项目结构（前端）

```text
Frontend/
  src/
    api/
      chat.js        # 聊天相关接口封装
      jobs.js        # 岗位相关接口封装
    components/
      ChatInput.vue  # 输入框与发送按钮
      ChatSidebar.vue# 会话列表与会话切换
      ChatWindow.vue # 对话消息 + 岗位卡片 + 详情弹层
      JobCard.vue    # 单个岗位卡片组件
    router/
      index.js       # 路由配置（/chat）
    store/
      chat.js        # 使用 Pinia 管理会话、消息、推荐岗位等
    utils/
      sse.js         # 封装 SSE 协议解析与流式回调处理
    views/
      ChatPage.vue   # 主页面布局（侧边栏 + 内容区）
    App.vue          # 根组件
    main.js          # 应用入口，挂载 Vue 应用
  index.html
  package.json
  vite.config.js
```

### 2.1 关键组件职责

- `ChatPage.vue`
  - 整体布局容器，组合侧边栏、聊天窗口与输入框
- `ChatSidebar.vue`
  - 展示会话列表，支持新建和切换会话
  - 挂载时调用 `chatStore.fetchSessionList` 拉取会话列表
- `ChatWindow.vue`
  - 展示当前会话的所有消息
  - 下方展示推荐岗位卡片网格
  - 维护 `selectedJob`，控制岗位详情弹层的显示/隐藏
- `ChatInput.vue`
  - 负责用户输入与发送操作
  - 调用 `chatStore.sendMessage` 触发一次完整对话流程
- `JobCard.vue`
  - 展示岗位名称、公司、城市、薪资、简要描述等信息
  - 点击后向上层 emit 当前岗位，触发详情弹层
- `store/chat.js`
  - 统一管理前端状态：
    - `sessions`、`messages`、`recommendedJobs`
    - `currentSessionId`、`isStreaming` 等
  - 提供 `fetchSessionList`、`loadSession`、`sendMessage` 等核心 action
- `utils/sse.js`
  - 使用 `fetch` + `ReadableStream` 手动解析 `text/event-stream`
  - 对 `start/chunk/end` 事件做分发，供 `chatStore` 挂接回调

---

## 3. 关键技术点

- 技术栈
  - `Vue 3` + Composition API
  - `Pinia` 作为状态管理
  - `Vite` 作为构建工具
  - UI 组件库可按需引入（如 Element Plus）
- 状态管理与模块划分
  - 使用 `store/chat.js` 管理会话、消息和推荐岗位
  - 组件之间通过 props/emit 与 store 解耦
- 流式渲染实现
  - 前端通过 `utils/sse.js` 调用 `/api/chat/stream`
  - 解析 SSE 流中 `start/chunk/end` 事件
  - 使用消息队列和 `requestAnimationFrame` 将文本增量追加到当前 assistant 消息，实现“字逐渐刷出”的效果
- 体验优化
  - 加载历史消息时显示加载状态，避免空白闪烁
  - 在流式回复阶段可显示“正在生成”提示
  - 岗位卡片布局自适应，详情弹层适配不同屏幕尺寸

---

## 4. 系统与交互流程图（前端视角）


### 4.1 系统整体流程图（高层）

```mermaid
flowchart TD
  A[用户打开 /chat 页面] --> B[前端加载会话列表\n拉取历史会话]
  B --> C[用户输入求职意图\n点击发送]
  C --> D[前端调用 sendMessage\n发起 /api/chat/stream]
  D --> E[后端读取会话历史\n与用户画像]
  E --> F[调用 RAG 引擎\n检索候选岗位]
  F --> G[调用大模型流式生成回复]
  G --> H[后端以 SSE 流式返回\n回复内容 + 岗位数据]
  H --> I[前端解析 SSE\n队列驱动流式渲染]
  I --> J[前端渲染岗位卡片\n展示推荐岗位]
  J --> K[用户点击岗位卡片\n查看岗位详情]
```

---

### 4.2 会话与历史消息加载流程图

```mermaid
sequenceDiagram
  autonumber
  participant U as 用户
  participant FE as 前端(Vue3)
  participant BE as 后端(Flask)
  participant DB as 数据库

  U->>FE: 打开 /chat 页面
  FE->>BE: GET /api/chat/history?page=1&page_size=20
  BE->>DB: 查询 chat_sessions 列表
  DB-->>BE: 会话列表
  BE-->>FE: {items:[{session_id,title,...}]}
  FE->>FE: 渲染侧边栏会话列表

  U->>FE: 点击历史会话
  FE->>FE: loadSession(sessionId)\n清空 messages / recommendedJobs
  FE->>BE: GET /api/chat/history?session_id=xxx
  BE->>DB: 查询 chat_sessions.context
  DB-->>BE: context(JSON)
  BE-->>FE: {history:[...],session_id}
  FE->>FE: 填充 messages\n显示历史对话
```

---

### 4.3 聊天与 SSE 流式响应流程图

```mermaid
sequenceDiagram
  autonumber
  participant U as 用户
  participant FE as 前端(Vue3)
  participant BE as 后端(Flask)
  participant RAG as RAG 引擎
  participant LLM as 大模型服务
  participant DB as DB/向量库

  U->>FE: 输入问题并点击发送
  FE->>FE: chatStore.sendMessage()\n追加 user 消息
  FE->>BE: POST /api/chat/stream\n{user_message,user_id,session_id?}

  BE->>DB: 读取会话历史、用户画像
  BE->>RAG: 构造 search_query + prompt
  RAG->>DB: 检索候选岗位
  DB-->>RAG: 候选岗位列表
  RAG-->>BE: prompt + recommended_jobs

  BE->>LLM: stream_llm(prompt)
  BE-->>FE: SSE data:{event:"start",session_id}
  loop 生成中
    LLM-->>BE: 部分 token
    BE-->>FE: SSE data:{event:"chunk",content}
    FE->>FE: messageQueue 入队 + 流式渲染
  end

  BE-->>FE: SSE data:{event:"end",data:{reply,jobs,show_jobs}}
  FE->>FE: 更新 messages / recommendedJobs\n渲染岗位卡片
```

---

## 5. 项目启动
- sh
# 本地开发
环境要求
`Node >=20.19.0（或 >=22.12.0）`
npm / pnpm / yarn（示例以 npm 为准）
岗位推荐 AI Agent 后端服务，默认地址：`http://127.0.0.5000`
# 安装依赖
`npm install`
# 启动开发服务器
`npm run dev`
默认使用 Vite 开发服务器`（通常为 http://localhost:5173）`， 通过代理 / 直连方式访问后端 `http://127.0.0.1:8000`。

# 构建与质量检查
生产构建
`npm run build`
-

默认通过 Vite 启动开发服务器，前端在本地运行并通过 `/api/*` 与后端交互。

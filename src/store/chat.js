import { defineStore } from 'pinia'
import { fetchSessionList, fetchSessionHistory } from '../api/chat'
import { startChatStream } from '../utils/sse'

function getUserId() {
  let id = localStorage.getItem('user_id')
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 9)
    localStorage.setItem('user_id', id)
  }
  return id
}

export const useChatStore = defineStore('chat', {
  state: () => ({
    sessions: [],
    messages: [],
    currentSessionId: null,
    isStreaming: false,
    isLoadingSessions: false,
    isLoadingHistory: false,
    recommendedJobs: [],
  }),
  actions: {
    async fetchSessionList() {
      this.isLoadingSessions = true
      try {
        const data = await fetchSessionList()
        this.sessions = data.items || []
      } finally {
        this.isLoadingSessions = false
      }
    },
    async loadSession(sessionId) {
      if (this.currentSessionId === sessionId) return
      this.currentSessionId = sessionId
      this.messages = []
      this.recommendedJobs = []
      this.isLoadingHistory = true
      try {
        const data = await fetchSessionHistory(sessionId)
        this.messages = data.history || []
      } finally {
        this.isLoadingHistory = false
      }
    },
    resetSession() {
      this.currentSessionId = null
      this.messages = []
      this.recommendedJobs = []
    },
    async sendMessage(content) {
      if (this.isStreaming) return

      this.messages.push({ role: 'user', content })
      this.isStreaming = true
      this.recommendedJobs = []

      // 消息队列及状态
      const messageQueue = []
      let isProcessingQueue = false
      let streamFinished = false

      // Delay creation of assistant message
      let assistantMsg = null
      let thinkingTimer = null

      const createAssistantMsg = (initialContent = '') => {
        if (!assistantMsg) {
          assistantMsg = { role: 'assistant', content: initialContent, streaming: true }
          this.messages.push(assistantMsg)
        }
      }

      //从队列中读取内容并渲染
      const processQueue = () => {
        if (messageQueue.length > 0) {
          const chunk = messageQueue.shift()
          if (!assistantMsg) createAssistantMsg('')

          if (assistantMsg.content === '🤖 正在思考，请稍候…') {
             assistantMsg.content = ''
          }

          // 强制触发 Vue 响应式更新：使用字符串拼接 + 重新赋值数组引用
          assistantMsg.content = assistantMsg.content + chunk
          this.messages = [...this.messages]
        }

        if (messageQueue.length > 0 || !streamFinished) {
           requestAnimationFrame(processQueue)
        } else {
           isProcessingQueue = false
           if (assistantMsg) {
             assistantMsg.streaming = false
             this.messages = [...this.messages] // 确保结束状态更新
             if (!assistantMsg.content) {
                 assistantMsg.content = '[无回复内容]'
             }
           }
        }
      }

      //将内容推入队列并启动消费者
      const enqueue = (content) => {
        if (!content) return
        messageQueue.push(content)
        if (!isProcessingQueue) {
          isProcessingQueue = true
          requestAnimationFrame(processQueue)
        }
      }

      // If no response within 1s, show "Thinking..."
      thinkingTimer = setTimeout(() => {
        if (!assistantMsg && !isProcessingQueue) {
          createAssistantMsg('🤖 正在思考，请稍候…')
        }
      }, 1000)

      try {
        const payload = {
          user_message: content,
          user_id: getUserId()
        }
        if (this.currentSessionId) {
          payload.session_id = this.currentSessionId
        }

        await startChatStream(payload, {
          onStart: (data) => {
            if (thinkingTimer) clearTimeout(thinkingTimer)

            if (assistantMsg && assistantMsg.content === '🤖 正在思考，请稍候…') {
                 assistantMsg.content = ''
            } else if (!assistantMsg) {
                 createAssistantMsg('')
            }

            if (data.session_id) {
              this.currentSessionId = data.session_id
            }
          },
          onChunk: (data) => {
            enqueue(data.content)
          },
          onEnd: (data) => {
            if (thinkingTimer) clearTimeout(thinkingTimer)
            streamFinished = true

            if (!assistantMsg && data.reply) {
               enqueue(data.reply)
            }

            if (data.show_jobs && data.jobs) {
              this.recommendedJobs = data.jobs
            } else {
              this.recommendedJobs = []
            }
            this.fetchSessionList()

            if (!isProcessingQueue) {
                requestAnimationFrame(processQueue)
            }
          },
          onError: (err) => {
            if (thinkingTimer) clearTimeout(thinkingTimer)
            streamFinished = true
            console.error(err)

            if (!assistantMsg) createAssistantMsg('')
            enqueue('\n[Error: Connection failed]')

            if (!isProcessingQueue) {
                requestAnimationFrame(processQueue)
            }
          }
        })
      } catch (e) {
        if (thinkingTimer) clearTimeout(thinkingTimer)
        streamFinished = true
        console.error(e)
        if (assistantMsg) assistantMsg.streaming = false
      } finally {
        this.isStreaming = false
      }
    }
  }
})

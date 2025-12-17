<template>
  <div class="sidebar">
    <div class="new-chat-btn-wrapper">
      <el-button class="new-chat-btn" @click="newChat">
        <span class="plus-icon">+</span> 新对话
      </el-button>
    </div>

    <div class="history-label" v-if="sessions.length || isLoading">历史记录</div>

    <el-scrollbar>
      <div v-if="isLoading" class="loading-skeleton">
        <el-skeleton :rows="5" animated />
      </div>
      <div v-else class="session-list">
        <div
          v-for="s in sessions"
          :key="s.session_id"
          class="session-item"
          :class="{ active: s.session_id === currentSessionId }"
          @click="openSession(s.session_id)"
        >
          <div class="session-icon">
            <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="14" width="14" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <div class="session-title">{{ s.title || '新的对话' }}</div>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useChatStore } from '@/store/chat'

const chatStore = useChatStore()
const sessions = computed(() => chatStore.sessions)
const currentSessionId = computed(() => chatStore.currentSessionId)
const isLoading = computed(() => chatStore.isLoadingSessions)

onMounted(() => {
  chatStore.fetchSessionList()
})

function newChat() {
  chatStore.resetSession()
}

function openSession(id) {
  chatStore.loadSession(id)
}
</script>

<style scoped>
.sidebar {
  width: 260px;
  background: #F0F9FF; /* Very light sky blue tint */
  color: #334155;
  display: flex;
  flex-direction: column;
  height: 100%;
  border-right: 1px solid #E0F2FE;
}

.new-chat-btn-wrapper {
  padding: 16px;
}

.new-chat-btn {
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #BAE6FD; /* Sky blue border */
  color: #0EA5E9; /* Sky blue text */
  text-align: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(14, 165, 233, 0.1);
  border-radius: 20px; /* Pill shape */
  height: 40px;
  font-weight: 600;
}
.new-chat-btn:hover {
  background: #0EA5E9;
  border-color: #0EA5E9;
  color: #FFFFFF;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
}

.plus-icon {
  margin-right: 4px;
  font-size: 16px;
  font-weight: bold;
}

.history-label {
  padding: 8px 20px;
  font-size: 12px;
  color: #94A3B8;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.loading-skeleton {
  padding: 0 20px;
  margin-top: 10px;
}
</style>
<style>
.session-list {
  padding: 0 12px;
}

.session-item {
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 4px;
  font-size: 14px;
  color: #475569;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.session-icon {
  color: #94A3B8;
  display: flex;
  align-items: center;
}

.session-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.session-item:hover {
  background: #FFFFFF;
  color: #0EA5E9;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.session-item.active {
  background: #FFFFFF;
  color: #0284C7; /* Darker Blue */
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}
</style>

<template>
  <div class="chat-page">
    <ChatSidebar class="sidebar-container" />
    <div class="main-content" :class="{ 'is-center': !hasMessages }">
      <ChatWindow v-show="hasMessages" class="chat-window-flex" />

      <div v-if="!hasMessages" class="center-container">
        <h1 class="welcome-text">May I Help You?</h1>
      </div>

      <ChatInput class="chat-input-component" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ChatSidebar from '@/components/ChatSidebar.vue'
import ChatWindow from '@/components/ChatWindow.vue'
import ChatInput from '@/components/ChatInput.vue'
import { useChatStore } from '@/store/chat'

const chatStore = useChatStore()
const hasMessages = computed(() => chatStore.messages && chatStore.messages.length > 0)
</script>

<style scoped>
.chat-page {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #FFFFFF;
}

.sidebar-container {
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background: #FFFFFF;
}

.main-content.is-center {
  justify-content: center;
  align-items: center;
}

.chat-window-flex {
  flex: 1;
  width: 100%;
  overflow: hidden;
}

.center-container {
  margin-bottom: 20px;
  text-align: center;
  width: 100%;
  max-width: 800px; /* Match input width */
  padding: 0 24px;
}

.welcome-text {
  font-size: 28px;
  font-weight: 600;
  color: #000000;
  margin: 0;
}

.chat-input-component {
  width: 100%;
  transition: all 0.3s ease;
}
</style>

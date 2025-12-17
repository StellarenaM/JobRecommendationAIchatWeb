<template>
  <div class="input-area">
    <div class="input-wrapper">
      <el-input
        v-model="input"
        type="textarea"
        :autosize="{ minRows: 1, maxRows: 6 }"
        placeholder="输入消息..."
        resize="none"
        @keydown.enter.prevent="handleEnter"
        :disabled="chatStore.isStreaming"
        class="custom-textarea"
      />
      <button class="send-btn" @click="send" :disabled="!input.trim() || chatStore.isStreaming">
        <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
      </button>
    </div>
    <div class="footer-text">AI也可能犯错,请斟酌使用</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChatStore } from '@/store/chat'

const chatStore = useChatStore()
const input = ref('')

function handleEnter(e) {
  if (!e.shiftKey) {
    send()
  }
}

function send() {
  const text = input.value.trim()
  if (!text || chatStore.isStreaming) return

  chatStore.sendMessage(text)
  input.value = ''
}
</script>

<style scoped>
.input-area {
  background: #FFFFFF;
  padding: 20px 24px 30px; /* More bottom padding */
  position: relative;
  /* Removed gradient that was causing "dirty" look */
}

.input-wrapper {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  background: #FFFFFF;
  border-radius: 16px; /* Rounder corners */
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* Softer shadow */
  padding: 12px 16px;
  display: flex;
  align-items: flex-end;
  border: 1px solid #E2E8F0;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.input-wrapper:focus-within {
  box-shadow: 0 8px 30px rgba(56, 189, 248, 0.15); /* Sky blue glow */
  border-color: #7DD3FC; /* Light sky blue */
}

.custom-textarea :deep(.el-textarea__inner) {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  color: #334155 !important;
  padding: 0;
  padding-right: 10px;
  font-family: inherit;
  font-size: 16px;
  line-height: 1.6;
}

.custom-textarea :deep(.el-textarea__inner::placeholder) {
  color: #94A3B8;
}

.send-btn {
  background: #F0F9FF;
  border: none;
  color: #38BDF8;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  margin-bottom: 2px;
  transition: all 0.2s ease;
}

.send-btn:hover:not(:disabled) {
  background: #38BDF8;
  color: white;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #F1F5F9;
  color: #CBD5E1;
  cursor: default;
}

.footer-text {
  text-align: center;
  font-size: 12px;
  color: #CBD5E1;
  margin-top: 12px;
}
</style>

<template>
  <div class="chat-window">
    <el-scrollbar ref="scrollbarRef" class="chat-scrollbar">
      <div class="chat-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
           <el-skeleton :rows="3" animated />
           <br />
           <el-skeleton :rows="3" animated />
        </div>

        <!-- Messages -->
        <div v-else>
          <div v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role">
          <div class="avatar" :class="msg.role">
            {{ msg.role === 'user' ? 'U' : 'AI' }}
          </div>
          <div class="message-content">
            <div class="text-content">
              {{ msg.content }}
              <span v-if="msg.streaming && !msg.content" class="typing-dots">
                <span></span><span></span><span></span>
              </span>
            </div>
          </div>
          </div>
        </div>

        <!-- Jobs -->
        <div v-if="recommendedJobs.length > 0" class="jobs-section">
          <div class="jobs-header">
            <div class="jobs-title">🎯 本轮匹配岗位 ({{ recommendedJobs.length }})</div>
            <div class="jobs-subtitle">基于你本轮的对话内容与画像推荐</div>
          </div>
          <div class="jobs-grid">
            <JobCard
              v-for="job in recommendedJobs"
              :key="job.job_id"
              :job="job"
              @click="selectedJob = job"
            />
          </div>
        </div>

        <div class="bottom-spacer"></div>
      </div>
    </el-scrollbar>

    <!-- Job Detail Modal -->
    <div v-if="selectedJob" class="job-modal-overlay" @click.self="selectedJob = null">
      <div class="job-modal-content">
        <button class="close-btn" @click="selectedJob = null" title="关闭">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div class="modal-header">
          <h2 class="modal-title">{{ selectedJob.job_title }}</h2>
          <div class="modal-company">{{ selectedJob.company }}</div>
          <div class="modal-tags">
            <span v-if="selectedJob.location" class="modal-tag location">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              {{ selectedJob.location }}
            </span>
            <span v-if="selectedJob.salary" class="modal-tag salary">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              {{ selectedJob.salary }}
            </span>
          </div>
        </div>

        <div class="modal-body">
          <div v-if="selectedJob.job_description" class="modal-section">
            <div class="modal-section-title">职位描述</div>
            <div class="modal-description">{{ selectedJob.job_description }}</div>
          </div>
          <div v-if="selectedJob.job_requirement" class="modal-section">
            <div class="modal-section-title">任职要求</div>
            <div class="modal-description">{{ selectedJob.job_requirement }}</div>
          </div>
          <div v-if="!selectedJob.job_description && !selectedJob.job_requirement" class="modal-description">
            暂无职位详情
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useChatStore } from '@/store/chat'
import JobCard from './JobCard.vue'

const chatStore = useChatStore()
const messages = computed(() => chatStore.messages)
const recommendedJobs = computed(() => chatStore.recommendedJobs)
const isLoading = computed(() => chatStore.isLoadingHistory)
const scrollbarRef = ref(null)
const selectedJob = ref(null)

const handleJobClick = (job) => {
  selectedJob.value = job
}

// Auto scroll
watch([() => messages.value.length, () => messages.value[messages.value.length - 1]?.content], () => {
  nextTick(() => {
    scrollToBottom()
  })
}, { deep: true })

// Also watch jobs
watch(() => recommendedJobs.value.length, () => {
  nextTick(() => scrollToBottom())
})

// Watch loading state
watch(isLoading, (newVal) => {
  if (!newVal) {
    nextTick(() => scrollToBottom())
  }
})

function scrollToBottom() {
  if (scrollbarRef.value) {
    const wrap = scrollbarRef.value.wrapRef
    if (wrap) {
      wrap.scrollTop = wrap.scrollHeight
    }
  }
}
</script>

<style scoped>
.chat-window {
  flex: 1;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;
}

.chat-scrollbar {
  height: 100%;
}

.chat-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.loading-state {
  padding: 20px 0;
}

.message-row {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  color: #334155;
  animation: fadeIn 0.3s ease;
}

.message-row.user {
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* .message-row.assistant styling removed to unify bubble layout */

.typing-dots {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  height: 1em;
  vertical-align: middle;
}

.typing-dots span {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin: 0 2px;
  background-color: #64748B;
  border-radius: 50%;
  animation: dot-jump 1.2s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes dot-jump {
  0%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-5px);
  }
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0,0,0,0.06);
}
.avatar.user {
  background: linear-gradient(135deg, #7DD3FC, #38BDF8); /* Light Sky Blue Gradient */
  color: white;
}
.avatar.assistant {
  background: linear-gradient(135deg, #F9A8D4, #F472B6); /* Soft Pink Gradient */
  color: white;
}

.message-content {
  flex: 1;
  font-size: 15px; /* Slightly smaller for cleaner look */
  line-height: 1.7;
  display: flex;
  flex-direction: column;
}

.message-row.user .message-content {
  align-items: flex-end;
}

.message-row.assistant .message-content {
  align-items: flex-start;
}

.text-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 90%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-row.user .text-content {
  background-color: #E0F2FE; /* Light Blue */
  color: #0C4A6E;
  border-top-right-radius: 2px;
}

.message-row.assistant .text-content {
  background-color: #fafafa; /* Softer, almost white background */
  color: #334155; /* Slate-700, professional dark grey */
  border-top-left-radius: 2px;
  border: 1px solid #e2e8f0; /* Very light border */
}

.jobs-section {
  margin-top: 30px;
  border-top: 1px dashed #E2E8F0;
  padding-top: 20px;
}
.jobs-header {
  margin-bottom: 20px;
  text-align: center;
}
.jobs-title {
  color: #334155;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}
.jobs-subtitle {
  color: #94A3B8;
  font-size: 12px;
}
.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.bottom-spacer {
  height: 60px;
}

/* Modal Styles */
.job-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease-out;
}

.job-modal-content {
  background: white;
  width: 90%;
  max-width: 600px;
  max-height: 85vh;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #F8FAFC;
  border: 1px solid #E2E8F0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #64748B;
  transition: all 0.2s;
  z-index: 10;
  padding: 0;
}

.close-btn:hover {
  background: #F1F5F9;
  color: #0F172A;
  transform: rotate(90deg);
  border-color: #CBD5E1;
}

.modal-header {
  padding: 32px 32px 20px;
  border-bottom: 1px solid #F1F5F9;
  background: #FFFFFF;
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1E293B;
  margin: 0 0 8px 0;
  padding-right: 40px;
  line-height: 1.3;
}

.modal-company {
  font-size: 15px;
  color: #64748B;
  margin-bottom: 16px;
}

.modal-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.modal-tag {
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.modal-tag.location {
  background: #F0F9FF;
  color: #0284C7;
  border: 1px solid #E0F2FE;
}

.modal-tag.salary {
  background: #FDF2F8;
  color: #DB2777;
  border: 1px solid #FCE7F3;
}

.modal-body {
  padding: 24px 32px;
  overflow-y: auto;
  line-height: 1.7;
  color: #334155;
}

.modal-section {
  margin-bottom: 16px;
}

.modal-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1E293B;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.modal-section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background: #3B82F6;
  margin-right: 10px;
  border-radius: 2px;
}

.modal-description {
  white-space: pre-wrap;
  font-size: 15px;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.96); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>

<template>
  <div class="job-card" @click="handleClick">
    <div class="job-title">{{ job.job_title || 'Unknown Position' }}</div>
    <div class="job-company">{{ job.company || 'Unknown Company' }}</div>
    <div class="job-info">
      <el-tag size="small" effect="plain" class="tag-location" v-if="job.location">{{ job.location }}</el-tag>
      <el-tag size="small" effect="plain" class="tag-salary" v-if="job.salary">{{ job.salary }}</el-tag>
      <el-tag size="small" effect="plain" class="tag-salary-missing" v-else>薪资面议</el-tag>
    </div>
    <div class="job-desc" v-if="job.job_description">
      {{ job.job_description }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  job: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['click'])

const handleClick = () => {
  emit('click', props.job)
}
</script>

<style scoped>
.job-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  padding: 16px;
  color: #334155;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  height: 100%; /* Force full height in grid */
  min-height: 160px; /* Minimum visual height */
  box-sizing: border-box;
  cursor: pointer;
}
.job-card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06);
  transform: translateY(-1px);
}
.job-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
  color: #1E293B;
  /* Ensure title doesn't break layout if too long */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.job-company {
  font-size: 13px;
  color: #64748B;
  margin-bottom: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.job-info {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap; /* Allow tags to wrap if needed */
}
.tag-location {
  --el-tag-text-color: #0EA5E9;
  --el-tag-border-color: #BAE6FD;
  --el-tag-bg-color: #F0F9FF;
}
.tag-salary {
  --el-tag-text-color: #EC4899;
  --el-tag-border-color: #FBCFE8;
  --el-tag-bg-color: #FDF2F8;
}
.tag-salary-missing {
  --el-tag-text-color: #94A3B8;
  --el-tag-border-color: #E2E8F0;
  --el-tag-bg-color: #F8FAFC;
}
.job-desc {
  font-size: 13px;
  color: #475569;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: auto; /* Push description to bottom if space allows, or just stay flow */
  flex-grow: 1; /* Allow description to take available space */
}
</style>

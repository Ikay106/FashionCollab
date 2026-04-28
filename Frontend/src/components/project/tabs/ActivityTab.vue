<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
    <ProjectActivity :project-id="projectId" ref="activityRef" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProjectActivity from '@/components/activity/ProjectActivity.vue'

defineProps({
  projectId: { type: [String, Number], required: true }
})

const activityRef = ref(null)

const fetchActivity = () => activityRef.value?.fetchActivity()

defineExpose({ fetchActivity })
</script>
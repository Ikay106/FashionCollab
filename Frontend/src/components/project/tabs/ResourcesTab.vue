<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
    <ProjectLinks :project-id="projectId" />
  </div>
</template>

<script setup>
import ProjectLinks from '@/components/ProjectLinks.vue'

defineProps({
  projectId: { type: [String, Number], required: true }
})
</script>
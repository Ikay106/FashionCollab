<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
    <ProjectNotes :project-id="projectId" />
  </div>
</template>

<script setup>
import ProjectNotes from '@/components/ProjectNotes.vue'

defineProps({
  projectId: { type: [String, Number], required: true }
})
</script>
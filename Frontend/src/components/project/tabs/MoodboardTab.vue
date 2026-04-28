<template>
  <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
    <MoodboardSection
      :project-id="projectId"
      :images="images"
      :is-owner="isOwner"
      @delete="$emit('delete', $event)"
      @upload="$emit('upload', $event)"
    />
  </div>
</template>

<script setup>
import MoodboardSection from '@/components/MoodboardSection.vue'

defineProps({
  projectId: { type: [String, Number], required: true },
  images: { type: Array, default: () => [] },
  isOwner: { type: Boolean, default: false }
})

defineEmits(['delete', 'upload'])
</script>
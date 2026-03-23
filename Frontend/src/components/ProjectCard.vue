<template>
  <div
    class="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100"
    @click="$emit('click')"
  >
    <!-- Visual thumbnail placeholder (fashion vibe) -->
    <div class="h-48 bg-gradient-to-br from-teal-50 via-pink-50 to-purple-50 relative flex items-center justify-center">
      <span class="text-8xl opacity-20">📸</span>
      <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>

    <div class="p-6">
      <div class="flex justify-between items-start mb-3">
        <div class="flex items-center gap-2">
  <h3 class="text-lg font-semibold text-gray-800">
    {{ project.title }}
  </h3>

  <span
    :class="[
      'px-2 py-1 text-xs rounded-full font-medium',
      project.memberStatus === 'Owner'
        ? 'bg-green-100 text-green-700'
        : 'bg-blue-100 text-blue-700'
    ]"
  >
    {{ project.memberStatus }}
  </span>
</div>

        <span
          class="px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
          :class="statusBadgeClass"
        >
          {{ project.status || 'N/A' }}
        </span>
      </div>

      <p class="text-gray-600 text-sm mb-4 line-clamp-2">
        {{ project.description || 'No description provided' }}
      </p>

      <div class="flex flex-wrap gap-4 text-xs text-gray-500">
        <div v-if="project.location" class="flex items-center gap-1">
          <span>📍</span> {{ project.location }}
        </div>

        <div v-if="project.shoot_date" class="flex items-center gap-1">
          <span>📅</span> {{ new Date(project.shoot_date).toLocaleDateString() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: {
    type: Object,
    required: true
  }
})

const statusBadgeClass = computed(() => {
  const s = props.project.status?.toLowerCase() || ''
  if (s === 'draft') return 'bg-gray-100 text-gray-700'
  if (s === 'planned') return 'bg-blue-100 text-blue-700'
  if (s === 'in_progress') return 'bg-orange-100 text-orange-700'
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
})
</script>
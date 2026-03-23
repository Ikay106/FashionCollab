<template>
  <div class="flex justify-between items-center">
    <button
  @click="router.push('/dashboard')"
  class="flex items-center text-teal-600 hover:text-teal-800 font-medium mb-2"
>
  ← My Projects
</button>
    <div class="flex items-center gap-3">
      <h1 class="text-3xl font-bold text-gray-800">
        {{ project.title }}
      </h1>

      <span
        :class="[
          'px-3 py-1 text-xs rounded-full font-medium',
          memberStatus === 'Owner'
            ? 'bg-green-100 text-green-700'
            : 'bg-blue-100 text-blue-700'
        ]"
      >
        {{ project.memberStatus }}
      </span>
    </div>

    <div class="flex gap-3">
      <button @click="$emit('edit')" class="bg-gray-200 px-4 py-2 rounded-lg">
        Edit
      </button>

      <button
       v-if="project.memberStatus === 'Owner'"
        @click="$emit('delete')"
        class="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Delete
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  project: {
    type: Object,
    required: true
  },
  memberStatus:String
})

const router = useRouter()

const emit = defineEmits(['edit', 'delete'])

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
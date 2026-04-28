<template>
  <div class="py-12 border-b border-gray-200">
    <div class="flex flex-wrap items-center gap-3 mb-5">
      <span
        class="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
        :class="isOwner ? 'bg-gray-900 text-white' : 'bg-teal-600 text-white'"
      >
        {{ memberStatus }}
      </span>
      <span
        class="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full"
        :class="statusClass(project.status)"
      >
        {{ project.status?.replace(/_/g, ' ') }}
      </span>
    </div>

    <h1
      class="text-5xl md:text-7xl font-black tracking-tight text-gray-900 leading-none mb-6"
      style="font-family: Georgia, 'Times New Roman', serif; letter-spacing: -2px;"
    >
      {{ project.title }}
    </h1>

    <div class="flex flex-wrap gap-6 text-sm text-gray-400 mb-6">
      <span v-if="project.location" class="flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
        {{ project.location }}
      </span>
      <span v-if="project.shoot_date" class="flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        Shoot {{ new Date(project.shoot_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}
      </span>
      <span class="flex items-center gap-1.5">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        Created {{ new Date(project.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) }}
      </span>
    </div>

    <p v-if="project.description" class="text-gray-500 text-lg leading-relaxed max-w-2xl">
      {{ project.description }}
    </p>
  </div>
</template>

<script setup>
defineProps({
  project: { type: Object, required: true },
  isOwner: { type: Boolean, default: false },
  memberStatus: { type: String, default: '' }
})

const statusClass = (status) => {
  const s = status?.toLowerCase() || ''
  if (s === 'draft') return 'bg-gray-100 text-gray-600'
  if (s === 'planned') return 'bg-blue-100 text-blue-700'
  if (s === 'in_progress') return 'bg-amber-100 text-amber-700'
  if (s === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}
</script>
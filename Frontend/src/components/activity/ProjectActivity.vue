<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Activity</h2>
        <p class="text-sm text-gray-400 mt-0.5">Recent actions in this project</p>
      </div>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="flex gap-3 animate-pulse">
        <div class="w-8 h-8 rounded-full bg-gray-200 shrink-0"></div>
        <div class="flex-1 space-y-2 py-1">
          <div class="h-3 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>

    <div
      v-else-if="activities.length === 0"
      class="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl"
    >
      No activity yet — actions will appear here as the team gets to work.
    </div>

    <div v-else class="space-y-1">
      <div
        v-for="activity in activities"
        :key="activity.id"
        class="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0"
      >
        <!-- Avatar -->
        <div class="shrink-0">
          <div
            v-if="activity.avatar_url"
            class="w-8 h-8 rounded-full overflow-hidden"
          >
            <img :src="activity.avatar_url" class="w-full h-full object-cover" />
          </div>
          <div
            v-else
            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            :class="getAvatarColor(activity)"
          >
            {{ getInitials(activity) }}
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800">
            <span class="font-semibold">{{ activity.full_name || activity.username || 'Someone' }}</span>
            {{ activity.action }}
            <span v-if="activity.entity_label" class="font-medium text-gray-600">
              "{{ activity.entity_label }}"
            </span>
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ formatDate(activity.created_at) }}</p>
        </div>

        <!-- Entity icon -->
        <span class="text-lg shrink-0" :title="activity.entity_type">
          {{ entityIcon(activity.entity_type) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  projectId: { type: [String, Number], required: true }
})

const activities = ref([])
const loading = ref(true)

const fetchActivity = async () => {
  loading.value = true
  try {
    const res = await axios.get(
      `http://localhost:4000/api/projects/${props.projectId}/activity`,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    activities.value = res.data.activities || []
  } catch (err) {
    console.error('Fetch activity error:', err)
  } finally {
    loading.value = false
  }
}

const entityIcon = (type) => {
  const icons = {
    image: '🖼️',
    note: '📝',
    link: '🔗',
    member: '👤',
    comment: '💬'
  }
  return icons[type] || '📌'
}

const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500']

const getInitials = (item) => {
  if (item.full_name) return item.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (item.username) return item.username.slice(0, 2).toUpperCase()
  return '??'
}

const getAvatarColor = (item) => {
  const key = item.user_id || 'x'
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

onMounted(fetchActivity)

// Expose refresh so parent can call it after actions
defineExpose({ fetchActivity })
</script>
<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Team</h2>
      <span class="text-sm text-gray-400">{{ members.length }} member{{ members.length === 1 ? '' : 's' }}</span>
    </div>

    <div v-if="members.length" class="space-y-3">
      <div
        v-for="member in members"
        :key="member.id"
        class="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition group"
      >
        <!-- Avatar -->
        <div
          @click="$emit('view-profile', member.id)"
          class="cursor-pointer flex items-center gap-3 flex-1 min-w-0"
        >
          <div
            v-if="member.avatar_url"
            class="w-10 h-10 rounded-full overflow-hidden shrink-0"
          >
            <img :src="member.avatar_url" class="w-full h-full object-cover" />
          </div>
          <div
            v-else
            class="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
            :class="getAvatarColor(member)"
          >
            {{ getInitials(member) }}
          </div>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-gray-900 truncate">
              {{ member.full_name || member.username || 'Unnamed' }}
            </p>
            <p class="text-xs text-gray-500">{{ member.project_role || 'Collaborator' }}</p>
          </div>
        </div>

        <!-- Remove button — only visible to owner, and not on the owner row itself -->
        <button
          v-if="isOwner && member.project_role !== 'Owner'"
          @click="confirmRemove(member)"
          class="opacity-0 group-hover:opacity-100 transition w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center shrink-0 text-xs font-bold"
          title="Remove member"
        >
          ✕
        </button>
      </div>
    </div>

    <div v-else class="text-sm text-gray-400 py-4 text-center">
      No members yet.
    </div>

    <!-- Confirm removal dialog -->
    <div
      v-if="memberToRemove"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div class="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Remove member?</h3>
        <p class="text-gray-500 text-sm mb-6">
          Are you sure you want to remove
          <span class="font-semibold text-gray-800">
            {{ memberToRemove.full_name || memberToRemove.username || 'this member' }}
          </span>
          ({{ memberToRemove.project_role || 'Collaborator' }}) from the project?
        </p>

        <div class="flex gap-3">
          <button
            @click="memberToRemove = null"
            class="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            @click="removeMember"
            :disabled="removing"
            class="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            {{ removing ? 'Removing...' : 'Remove' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  members: { type: Array, default: () => [] },
  projectId: { type: [String, Number], required: true },
  isOwner: { type: Boolean, default: false }
})

const emit = defineEmits(['view-profile', 'member-removed'])

const memberToRemove = ref(null)
const removing = ref(false)

const confirmRemove = (member) => {
  memberToRemove.value = member
}

const removeMember = async () => {
  if (!memberToRemove.value) return
  removing.value = true

  try {
    await axios.delete(
      `http://localhost:4000/api/projects/${props.projectId}/members/${memberToRemove.value.id}`,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    emit('member-removed', memberToRemove.value.id)
    memberToRemove.value = null
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to remove member')
  } finally {
    removing.value = false
  }
}

// Avatar helpers
const colors = ['bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-orange-500']

const getInitials = (member) => {
  if (member.full_name) return member.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (member.username) return member.username.slice(0, 2).toUpperCase()
  return '??'
}

const getAvatarColor = (member) => {
  const key = member.id || member.username || 'default'
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}
</script>
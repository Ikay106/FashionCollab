<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
  >
    <div class="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        &times;
      </button>

      <h2 class="text-2xl font-bold text-gray-900 mb-1">
        {{ invite?.projects?.title || `Project #${invite?.project_id}` }}
      </h2>

      <p class="text-gray-500 text-sm mb-6">
        {{ invite?.projects?.description || 'No description available.' }}
      </p>

      <!-- Invited by -->
      <div class="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl mb-6">
        <div
          v-if="invite?.owner?.avatar_url"
          class="w-10 h-10 rounded-full overflow-hidden shrink-0"
        >
          <img :src="invite.owner.avatar_url" class="w-full h-full object-cover" />
        </div>
        <div
          v-else
          class="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0"
        >
          {{ ownerInitials }}
        </div>
        <div>
          <p class="text-xs text-gray-400 uppercase tracking-wide font-medium">Invited by</p>
          <p class="text-sm font-semibold text-gray-900">
            {{ invite?.owner?.full_name || invite?.owner?.username || 'Unknown' }}
          </p>
          <p v-if="invite?.owner?.role" class="text-xs text-gray-500">{{ invite.owner.role }}</p>
        </div>
      </div>

      <p class="text-xs text-gray-400 mb-8">
        Invited on {{ formatDate(invite?.invited_at) }}
      </p>

      <div class="flex gap-3">
        <button
          @click="handleAccept"
          :disabled="loading"
          class="flex-1 py-3 bg-gradient-to-r from-teal-600 to-pink-600 text-white rounded-2xl font-semibold text-sm hover:from-teal-700 hover:to-pink-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Accept' }}
        </button>

        <button
          @click="handleDecline"
          :disabled="loading"
          class="flex-1 py-3 border border-red-200 text-red-500 rounded-2xl font-semibold text-sm hover:bg-red-50 transition disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Decline' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: { type: Boolean, default: false },
  invite: { type: Object, default: null }
})

const emit = defineEmits(['close', 'accepted', 'declined'])
const loading = ref(false)

const ownerInitials = computed(() => {
  const name = props.invite?.owner?.full_name || props.invite?.owner?.username || ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
})

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const handleAccept = async () => {
  if (!props.invite) return
  loading.value = true
  try {
    await axios.patch(`http://localhost:4000/api/projects/${props.invite.project_id}/accept`)
    emit('accepted', props.invite)
    emit('close')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to accept invite')
  } finally {
    loading.value = false
  }
}

const handleDecline = async () => {
  if (!props.invite) return
  if (!confirm('Decline this invite?')) return
  loading.value = true
  try {
    await axios.delete(`http://localhost:4000/api/projects/${props.invite.id}/decline`)
    emit('declined', props.invite)
    emit('close')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to decline invite')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
  >
    <div class="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8 relative">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
      >
        &times;
      </button>

      <h2 class="text-2xl font-bold text-gray-800 mb-4">
        {{ invite?.projects?.title || `Project #${invite?.project_id}` }}
      </h2>

      <p class="text-gray-600 mb-4">
        {{ invite?.projects?.description || 'No description available.' }}
      </p>

      <p class="text-sm text-gray-500 mb-8">
        Invited on {{ formatDate(invite?.invited_at) }}
      </p>

      <div class="flex gap-4">
        <button
          @click="handleAccept"
          :disabled="loading"
          class="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Accept' }}
        </button>

        <button
          @click="handleDecline"
          :disabled="loading"
          class="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Decline' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  invite: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'accepted', 'declined'])

const loading = ref(false)

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
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

  const confirmed = confirm('Decline this invite?')
  if (!confirmed) return

  loading.value = true
  try {
    await axios.delete(`http://localhost:4000/api/projects/${props.invite.project_id}/accept`)
    emit('declined', props.invite)
    emit('close')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to decline invite')
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div v-if="isOwner">
    <form @submit.prevent="sendInvite" class="space-y-3">

      <!-- Email input -->
      <input
        v-model="inviteEmail"
        type="email"
        placeholder="Enter collaborator's email"
        required
        class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
      />

      <!-- Role dropdown -->
      <select
        v-model="inviteRole"
        class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-gray-700 appearance-none cursor-pointer"
      >
        <option value="Model">Model</option>
        <option value="Stylist">Stylist</option>
        <option value="Photographer">Photographer</option>
        <option value="Makeup Artist">Makeup Artist</option>
        <option value="Designer">Designer</option>
        <option value="Creative Director">Creative Director</option>
      </select>

      <!-- Invite button -->
      <button
        type="submit"
        :disabled="loading"
        class="w-full py-3 bg-teal-600 text-white rounded-2xl text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-50"
      >
        {{ loading ? 'Sending...' : 'Send Invite' }}
      </button>

      <!-- Feedback -->
      <p v-if="success" class="text-sm text-green-600 text-center">Invite sent!</p>
      <p v-if="error" class="text-sm text-red-500 text-center">{{ error }}</p>

    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  projectId: [String, Number],
  isOwner: Boolean
})

const emit = defineEmits(['invited'])
const authStore = useAuthStore()

const inviteEmail = ref('')
const inviteRole = ref('Model')
const loading = ref(false)
const success = ref(false)
const error = ref('')

const sendInvite = async () => {
  loading.value = true
  success.value = false
  error.value = ''

  try {
    await axios.post(
      `http://localhost:4000/api/projects/${props.projectId}/invite`,
      { email: inviteEmail.value.trim(), role: inviteRole.value },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )

    success.value = true
    inviteEmail.value = ''
    inviteRole.value = 'Model'
    emit('invited')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send invite'
  } finally {
    loading.value = false
  }
}
</script>
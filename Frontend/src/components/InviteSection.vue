<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({
  projectId: [String, Number],
  isOwner: Boolean
})

const emit = defineEmits(['invited'])
const authStore = useAuthStore()
const router = useRouter()

const inviteEmail = ref('')
const inviteRole = ref('Model')
const loading = ref(false)
const success = ref(false)
const error = ref('')
const inviteError = ref('')

const sendInvite = async () => {
  loading.value = true
  success.value = false
  error.value = ''

  try {
    await axios.post(
      `http://localhost:4000/api/projects/${props.projectId}/invite`,
      {
        email: inviteEmail.value.trim(),
        role: inviteRole.value
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    success.value = true
    inviteEmail.value = ''
    inviteRole.value = 'Model'
    emit('invited')
    router.push(`/projects/${props.invite.project_id}`)

  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to send invite'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div v-if="isOwner" class="bg-white p-8 rounded-2xl shadow-lg mb-10">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Invite Collaborator</h2>
    <form @submit.prevent="sendInvite" class="flex flex-col sm:flex-row gap-4">
      <input
        v-model="inviteEmail"
        type="email"
        class="flex-1 p-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
        placeholder="Enter email"
        required
      />

      <select v-model="inviteRole">
      <option value="Model">Model</option>
      <option value="Stylist">Stylist</option>
      <option value="Photographer">Photographer</option>
      <option value="Makeup Artist">Makeup Artist</option>
      <option value="Designer">Designer</option>
      <option value="Creative Director">Creative Director</option>
    </select>
      <button
        type="submit"
        :disabled="loading"
        class="px-8 py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition disabled:opacity-50"
      >
        {{ loading ? 'Sending...' : 'Invite' }}
      </button>
    </form>
    <p v-if="inviteError" class="mt-4 text-red-600 text-center">{{ inviteError }}</p>
  </div>
</template>
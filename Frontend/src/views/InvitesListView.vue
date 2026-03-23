<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-3xl font-bold text-gray-800">Pending Invites</h1>

        <router-link
          to="/dashboard"
          class="px-5 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition"
        >
          Back to Dashboard
        </router-link>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600 text-xl">Loading your invites...</p>
      </div>

      <div
        v-else-if="invites.length === 0"
        class="text-center py-12 bg-white rounded-2xl shadow-md"
      >
        <h2 class="text-2xl font-bold text-gray-800 mb-4">No Pending Invites</h2>
        <p class="text-gray-600">You haven’t been invited to any projects yet.</p>
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="invite in invites"
          :key="invite.id"
          class="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition"
        >
          <div class="flex justify-between items-start gap-4">
            <div>
              <h3 class="text-xl font-bold text-gray-800 mb-2">
                {{ invite.projects?.title || `Project #${invite.project_id}` }}
              </h3>

              <p class="text-gray-600 mb-2">
                {{ invite.projects?.description || 'No description available.' }}
              </p>

              <p class="text-sm text-gray-500">
                Invited on {{ formatDate(invite.invited_at) }}
              </p>
            </div>

            <button
              @click="openInvite(invite)"
              class="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
            >
              View Invite
            </button>
          </div>
        </div>
      </div>
    </div>

    <InviteDetailsModal
      :show="showModal"
      :invite="selectedInvite"
      @close="closeModal"
      @accepted="handleAccepted"
      @declined="handleDeclined"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import InviteDetailsModal from '@/components/InviteDetailsModal.vue'

const invites = ref([])
const loading = ref(true)
const showModal = ref(false)
const selectedInvite = ref(null)

const fetchInvites = async () => {
  loading.value = true
  try {
    const response = await axios.get('http://localhost:4000/api/projects/invites')
    invites.value = response.data.invites || []
  } catch (err) {
    console.error('Fetch invites error:', err)
    alert(err.response?.data?.error || 'Failed to load invites')
  } finally {
    loading.value = false
  }
}

const openInvite = (invite) => {
  selectedInvite.value = invite
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedInvite.value = null
}

const handleAccepted = async () => {
  await fetchInvites()
}

const handleDeclined = async () => {
  await fetchInvites()
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

onMounted(fetchInvites)
</script>
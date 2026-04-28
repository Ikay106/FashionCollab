<template>
  <div class="min-h-screen" style="background: #f9f7f4;">

    <!-- Header -->
    <header class="border-b border-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          @click="router.push('/dashboard')"
          class="text-sm font-medium text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
        >
          ← My Projects
        </button>
        <span class="text-sm font-semibold text-gray-900">Pending Invites</span>
        <div class="w-24"></div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-10">

      <!-- Hero -->
      <div class="mb-10">
        <p class="text-sm uppercase tracking-[0.18em] text-gray-400 mb-3">Collaboration</p>
        <h1
          class="text-4xl md:text-5xl font-black tracking-tight text-gray-900 leading-none mb-4"
          style="font-family: Georgia, 'Times New Roman', serif; letter-spacing: -1.5px;"
        >
          Pending Invites
        </h1>
        <p class="text-gray-500 text-base max-w-lg">
          Projects you've been invited to join. Accept to start collaborating or decline to remove the invite.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="bg-white rounded-3xl p-6 animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div class="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>

      <!-- Empty state -->
      <div
        v-else-if="invites.length === 0"
        class="bg-white rounded-3xl border border-black/5 shadow-sm p-16 text-center"
      >
        <p class="text-5xl mb-4">✉️</p>
        <p class="text-xl font-semibold text-gray-900 mb-2">No pending invites</p>
        <p class="text-gray-500 text-sm">When someone invites you to a project, it'll appear here.</p>
      </div>

      <!-- Invites list -->
      <div v-else class="space-y-4">
        <div
          v-for="invite in invites"
          :key="invite.id"
          class="bg-white rounded-3xl border border-black/5 shadow-sm p-6 hover:shadow-md transition"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1 min-w-0">

              <!-- Project title -->
              <h3 class="text-lg font-bold text-gray-900 mb-1 truncate">
                {{ invite.projects?.title || `Project #${invite.project_id}` }}
              </h3>

              <!-- Description -->
              <p v-if="invite.projects?.description" class="text-sm text-gray-500 mb-4 line-clamp-2">
                {{ invite.projects.description }}
              </p>

              <!-- Invited by -->
              <div class="flex items-center gap-2 mt-3">
                <div
                  v-if="invite.owner?.avatar_url"
                  class="w-7 h-7 rounded-full overflow-hidden shrink-0"
                >
                  <img :src="invite.owner.avatar_url" class="w-full h-full object-cover" />
                </div>
                <div
                  v-else
                  class="w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold shrink-0"
                >
                  {{ getInitials(invite.owner) }}
                </div>
                <div class="flex items-center gap-1.5 text-sm text-gray-500">
                  <span>Invited by</span>
                  <span class="font-semibold text-gray-800">
                    {{ invite.owner?.full_name || invite.owner?.username || 'Unknown' }}
                  </span>
                  <span v-if="invite.owner?.role" class="text-gray-400">· {{ invite.owner.role }}</span>
                </div>
              </div>

              <p class="text-xs text-gray-400 mt-2">
                {{ formatDate(invite.invited_at) }}
              </p>
            </div>

            <!-- Action button -->
            <button
              @click="openInvite(invite)"
              class="shrink-0 px-5 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition"
            >
              View
            </button>
          </div>
        </div>
      </div>

    </main>

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
import { useRouter } from 'vue-router'
import axios from 'axios'
import InviteDetailsModal from '@/components/InviteDetailsModal.vue'

const router = useRouter()
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

const handleAccepted = async () => await fetchInvites()
const handleDeclined = async () => await fetchInvites()

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

const getInitials = (owner) => {
  const name = owner?.full_name || owner?.username || ''
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '??'
}

onMounted(fetchInvites)
</script>
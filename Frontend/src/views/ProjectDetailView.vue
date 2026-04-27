<template>
  <div class="min-h-screen bg-[#f7f7f5]">

    <!-- Header bar -->
    <header class="border-b border-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          @click="router.push('/dashboard')"
          class="text-sm text-gray-500 hover:text-gray-900 transition flex items-center gap-2"
        >
          ← My Projects
        </button>

        <div v-if="!loading && project.title" class="flex items-center gap-3">
          <button
            @click="goToEdit"
            class="px-4 py-2 rounded-full border border-black/10 text-sm text-gray-700 hover:bg-gray-100 transition"
          >
            Edit
          </button>
          <button
            v-if="isOwner"
            @click="deleteProject"
            class="px-4 py-2 rounded-full bg-black text-white text-sm hover:bg-gray-900 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20">
        <p class="text-gray-400 text-lg">Loading project...</p>
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-6 rounded-3xl text-center"
      >
        {{ error }}
      </div>

      <template v-else>

        <!-- Project title + meta -->
        <div class="mb-10">
          <div class="flex items-center gap-2 flex-wrap mb-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
              {{ memberStatus }}
            </span>
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
              :class="statusClass(project.status)"
            >
              {{ project.status?.replace(/_/g, ' ') }}
            </span>
          </div>

          <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900 mb-4">
            {{ project.title }}
          </h1>

          <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-400 mb-5">
            <span v-if="project.location" class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="9" r="2.5"/>
              </svg>
              {{ project.location }}
            </span>
            <span v-if="project.shoot_date" class="flex items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
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

          <p v-if="project.description" class="text-gray-500 leading-relaxed max-w-3xl text-base border-l-2 border-gray-200 pl-4">
            {{ project.description }}
          </p>
        </div>

        <!-- TWO-COLUMN: Moodboard (2/3) | Members + Invite (1/3) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          <!-- Moodboard -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
              <MoodboardSection
                :project-id="projectId"
                :images="images"
                @delete="deleteImage"
                @upload="handleUpload"
              />
            </div>
          </div>

          <!-- Invite + Members -->
          <div class="lg:col-span-1 flex flex-col gap-6">
            <div v-if="isOwner" class="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Invite Collaborator</h2>
              <InviteSection
                :project-id="projectId"
                :is-owner="isOwner"
                @invited="fetchMembers"
              />
            </div>

            <div class="bg-white rounded-3xl border border-black/5 shadow-sm p-6">
              <ProjectMembers
                :members="members"
                :project-id="projectId"
                :is-owner="isOwner"
                @view-profile="goToProfile"
                @member-removed="handleMemberRemoved"
              />
            </div>
          </div>
        </div>

        <!-- Notes + Links -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div class="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
            <ProjectNotes :project-id="projectId" />
          </div>
          <div class="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
            <ProjectLinks :project-id="projectId" />
          </div>
        </div>

        <!-- Activity feed -->
        <div class="bg-white rounded-3xl border border-black/5 shadow-sm p-8">
          <ProjectActivity :project-id="projectId" ref="activityFeed" />
        </div>

      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

import MoodboardSection from '@/components/MoodboardSection.vue'
import InviteSection from '@/components/InviteSection.vue'
import ProjectMembers from '@/components/ProjectMembers.vue'
import ProjectNotes from '@/components/ProjectNotes.vue'
import ProjectLinks from '@/components/ProjectLinks.vue'
import ProjectActivity from '@/components/activity/ProjectActivity.vue'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref({})
const loading = ref(true)
const error = ref('')
const isOwner = ref(false)
const memberStatus = ref('')
const members = ref([])
const images = ref([])
const activityFeed = ref(null)

const statusClass = (status) => {
  const s = status?.toLowerCase() || ''
  if (s === 'draft') return 'bg-gray-100 text-gray-600'
  if (s === 'planned') return 'bg-blue-100 text-blue-700'
  if (s === 'in_progress') return 'bg-amber-100 text-amber-700'
  if (s === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-600'
}

const fetchProject = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${projectId}`)
    project.value = res.data.project
    isOwner.value = project.value.memberStatus === 'Owner'
    memberStatus.value = isOwner.value ? 'Owner' : 'Collaborator'
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load project'
  } finally {
    loading.value = false
  }
}

const fetchImages = async () => {
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${projectId}/images`)
    images.value = res.data.images || []
  } catch (err) {
    console.error('Fetch images error:', err)
  }
}

const fetchMembers = async () => {
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${projectId}/members`)
    members.value = res.data.members || []
  } catch (err) {
    console.error('Fetch members error:', err)
  }
}

const handleUpload = async ({ file, description }) => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('description', description)
  try {
    await axios.post(`http://localhost:4000/api/projects/${projectId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await fetchImages()
    activityFeed.value?.fetchActivity()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to upload image')
  }
}

const deleteImage = async (imageId) => {
  if (!confirm('Delete this image?')) return
  try {
    await axios.delete(`http://localhost:4000/api/projects/${projectId}/images/${imageId}`)
    await fetchImages()
    activityFeed.value?.fetchActivity()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete image')
  }
}

const deleteProject = async () => {
  if (!confirm('Delete this project? This cannot be undone.')) return
  try {
    await axios.delete(`http://localhost:4000/api/projects/${projectId}`)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to delete project'
  }
}

const handleMemberRemoved = (removedUserId) => {
  members.value = members.value.filter(m => m.id !== removedUserId)
}

const goToEdit = () => router.push(`/projects/${projectId}/edit`)
const goToProfile = (id) => router.push(`/profile/${id}`)

onMounted(async () => {
  await fetchProject()
  await fetchImages()
  await fetchMembers()
})
</script>
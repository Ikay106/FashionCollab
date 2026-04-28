<template>
  <div class="min-h-screen" style="background: #f9f7f4;">

    <!-- Top nav -->
    <header class="sticky top-0 z-30 border-b border-black/5" style="background: rgba(249,247,244,0.85); backdrop-filter: blur(12px);">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          @click="router.push('/dashboard')"
          class="text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          ← Projects
        </button>
        <div v-if="!loading" class="flex items-center gap-2">
          <button @click="goToEdit" class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-100 transition">
            Edit
          </button>
          <button v-if="isOwner" @click="handleDelete" class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-black transition">
            Delete
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6">
      <div v-if="loading" class="flex items-center justify-center py-32">
        <p class="text-gray-400 tracking-widest text-sm uppercase">Loading...</p>
      </div>

      <div v-else-if="error" class="py-20 text-center text-red-500">{{ error }}</div>

      <template v-else>
        <ProjectHero
          :project="project"
          :is-owner="isOwner"
          :member-status="memberStatus"
        />

        <ProjectTabs :tabs="tabs" v-model:active="activeTab" />

        <div class="pb-20">
          <MoodboardTab
            v-if="activeTab === 'moodboard'"
            :project-id="projectId"
            :images="images"
            :is-owner="isOwner"
            @upload="handleUpload"
            @delete="deleteImage"
            @activity-refresh="refreshActivity"
          />
          <NotesTab v-if="activeTab === 'notes'" :project-id="projectId" />
          <ResourcesTab v-if="activeTab === 'resources'" :project-id="projectId" />
          <MembersTab
            v-if="activeTab === 'members'"
            :project-id="projectId"
            :members="members"
            :is-owner="isOwner"
            @member-removed="handleMemberRemoved"
            @invited="fetchMembers"
            @view-profile="goToProfile"
          />
          <ActivityTab v-if="activeTab === 'activity'" :project-id="projectId" ref="activityFeed" />
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

import ProjectHero from '@/components/project/ProjectHero.vue'
import ProjectTabs from '@/components/project/ProjectTabs.vue'
import MoodboardTab from '@/components/project/tabs/MoodboardTab.vue'
import NotesTab from '@/components/project/tabs/NotesTab.vue'
import ResourcesTab from '@/components/project/tabs/ResourcesTab.vue'
import MembersTab from '@/components/project/tabs/MembersTab.vue'
import ActivityTab from '@/components/project/tabs/ActivityTab.vue'

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
const activeTab = ref('moodboard')

const tabs = [
  { key: 'moodboard', label: 'Moodboard' },
  { key: 'notes', label: 'Notes' },
  { key: 'resources', label: 'Resources' },
  { key: 'members', label: 'Members' },
  { key: 'activity', label: 'Activity' }
]

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
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to upload image')
  }
}

const deleteImage = async (imageId) => {
  if (!confirm('Delete this image?')) return
  try {
    await axios.delete(`http://localhost:4000/api/projects/${projectId}/images/${imageId}`)
    await fetchImages()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete image')
  }
}

const handleDelete = async () => {
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

const refreshActivity = () => activityFeed.value?.fetchActivity()
const goToEdit = () => router.push(`/projects/${projectId}/edit`)
const goToProfile = (id) => router.push(`/profile/${id}`)

onMounted(async () => {
  await fetchProject()
  await fetchImages()
  await fetchMembers()
})
</script>
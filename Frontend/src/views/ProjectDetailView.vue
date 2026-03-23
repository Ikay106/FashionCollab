<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-5xl mx-auto space-y-10">
      <div v-if="loading" class="text-center py-12 text-gray-600">
        Loading project...
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
        {{ error }}
      </div>

      <template v-else>
        <ProjectHeader
          :project="project"
          :memberStatus="memberStatus"
          @edit="goToEdit"
          @delete="deleteProject"
        />

        <ProjectInfo :project="project" />

        <InviteSection
        :project-id="projectId"
        :is-owner="isOwner"
        @invited="fetchProject"
        />
        
        <MoodboardSection
          :images="images"
          @upload="openUpload"
        />

        <div
          v-if="editMode"
          class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
        >
          <div class="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-gray-800 mb-6">Edit Project</h2>
            <!-- Edit form here -->
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import ProjectHeader from '@/components/ProjectHeader.vue'
import ProjectInfo from '@/components/ProjectInfo.vue'
import InviteSection from '@/components/InviteSection.vue'
import MoodboardSection from '@/components/MoodboardSection.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref({})
const images = ref([])
const loading = ref(true)
const error = ref('')
const isOwner = ref(false)
const editMode = ref(false)
const memberStatus = ref('')

const fetchProject = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`http://localhost:4000/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    project.value = response.data.project
    isOwner.value = project.value.memberStatus === 'Owner'
    memberStatus.value = isOwner.value ? 'Owner' : 'Collaborator'
  } catch (err) {
    console.error('Fetch project error:', err)
    error.value = err.response?.data?.error || 'Failed to load project'
  } finally {
    loading.value = false
  }
}

const deleteProject = async () => {
  if (!confirm('Delete this project?')) return

  try {
    await axios.delete(`http://localhost:4000/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    router.push('/dashboard')
  } catch (err) {
    console.error('Delete project error:', err)
    error.value = err.response?.data?.error || 'Failed to delete project'
  }
}

const goToEdit = () => {
  router.push(`/projects/${projectId}/edit`)
}

const openUpload = () => {
  alert('Upload modal coming soon!')
}

onMounted(fetchProject)
</script>
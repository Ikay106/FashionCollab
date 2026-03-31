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
          @invited="handleInviteSuccess"
        />
        <MoodboardSection
          :images="images"
          @upload="triggerFileInput"
          @delete="deleteImage"
        />

        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileUpload"
        />

    <ProjectMembers
      :members="members"
      @view-profile="goToProfile"
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
import ProjectMembers from '@/components/ProjectMembers.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()
const projectId = route.params.id

const project = ref({})
const loading = ref(true)
const error = ref('')
const isOwner = ref(false)
const editMode = ref(false)
const memberStatus = ref('')
const members = ref([])

const images = ref([])
const fileInput = ref(null)
const uploadLoading = ref(false)

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

const fetchImages = async () => {
  try {
    const response = await axios.get(`http://localhost:4000/api/projects/${projectId}/images`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    images.value = response.data.images || []
  } catch (err) {
    console.error('Fetch images error:', err)
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const description = prompt('Add a short description for this image:') || ''

  const formData = new FormData()
  formData.append('image', file)
  formData.append('description', description)

  uploadLoading.value = true

  try {
    await axios.post(
      `http://localhost:4000/api/projects/${projectId}/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    )

    await fetchImages()
    alert('Image uploaded successfully!')
  } catch (err) {
    console.error('Upload image error:', err)
    alert(err.response?.data?.error || 'Failed to upload image')
  } finally {
    uploadLoading.value = false
    event.target.value = ''
  }
}

const deleteImage = async (imageId) => {
  const confirmed = confirm('Are you sure you want to delete this image?')
  if (!confirmed) return

  try {
    await axios.delete(`http://localhost:4000/api/projects/${projectId}/images/${imageId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    await fetchImages()
    alert('Image deleted successfully!')
  } catch (err) {
    console.error('Delete image error:', err)
    alert(err.response?.data?.error || 'Failed to delete image')
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

const fetchMembers = async () => {
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${projectId}/members`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    members.value = res.data.members || []
  } catch (err) {
    console.error('Fetch members error:', err)
  }
}

const goToEdit = () => {
  router.push(`/projects/${projectId}/edit`)
}
const goToProfile = (id) => {
  router.push(`/profile/${id}`)
}
const handleInviteSuccess = async () => {
  await fetchProject()
  await fetchMembers()
}

onMounted(async () => {
  await fetchProject()
  await fetchImages()
  await fetchMembers()
})
</script>
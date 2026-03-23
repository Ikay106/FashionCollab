<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4">
    <div class="max-w-5xl mx-auto space-y-8">
      <div v-if="loading" class="text-center py-12 text-gray-600">
        Loading project...
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl"
      >
        {{ error }}
      </div>

      <template v-else-if="project">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              @click="router.back()"
              class="flex items-center text-teal-600 hover:text-teal-800 font-medium mb-2"
            >
              ← Back
            </button>

            <div class="flex items-center gap-3 flex-wrap">
              <h1 class="text-3xl font-bold text-gray-800">
                Edit Project
              </h1>

              <span
                :class="[
                  'px-3 py-1 text-xs rounded-full font-medium',
                  memberStatus === 'Owner'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-blue-100 text-blue-700'
                ]"
              >
                {{ memberStatus }}
              </span>
            </div>

            <p class="text-gray-500 mt-1">
              {{ project.title }}
            </p>
          </div>
        </div>

        <!-- Owner-only project fields -->
        <div
          v-if="memberStatus === 'Owner'"
          class="bg-white rounded-2xl shadow-lg p-8"
        >
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Project Details</h2>

          <form @submit.prevent="saveProject" class="space-y-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Title</label>
              <input
                v-model="form.title"
                type="text"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                v-model="form.description"
                rows="5"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2">Location</label>
                <input
                  v-model="form.location"
                  type="text"
                  class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2">Shoot Date</label>
                <input
                  v-model="form.shoot_date"
                  type="date"
                  class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Status</label>
              <select
                v-model="form.status"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="flex gap-4">
              <button
                type="submit"
                :disabled="saving"
                class="px-8 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-50"
              >
                {{ saving ? 'Saving...' : 'Save Changes' }}
              </button>

              <button
                type="button"
                @click="router.back()"
                class="px-8 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <!-- Invitee info -->
        <div
          v-else
          class="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl"
        >
          You can edit the moodboard for this project, but only the owner can edit project details.
        </div>

        <!-- Moodboard section for both Owner and Invitee -->
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Moodboard</h2>

            <label
              class="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition cursor-pointer"
            >
              Upload Image
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleFileSelect"
              />
            </label>
          </div>

          <div v-if="uploading" class="text-sm text-gray-600 mb-4">
            Uploading image...
          </div>

          <div v-if="imageError" class="text-sm text-red-600 mb-4">
            {{ imageError }}
          </div>

          <div v-if="images.length === 0" class="text-center py-12 text-gray-600">
            No images yet — start adding moodboard references!
          </div>

          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            <div
              v-for="img in images"
              :key="img.id"
              class="aspect-square rounded-xl overflow-hidden shadow"
            >
              <img
                :src="img.image_url"
                alt="Moodboard"
                class="w-full h-full object-cover"
              />
            </div>
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
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const projectId = route.params.id

const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const error = ref('')
const imageError = ref('')

const project = ref(null)
const images = ref([])
const memberStatus = ref('Invitee')

const form = ref({
  title: '',
  description: '',
  location: '',
  shoot_date: '',
  status: 'draft'
})

const fetchProject = async () => {
  loading.value = true
  error.value = ''

  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${projectId}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    project.value = res.data.project

    // Prefer backend memberStatus if present, fallback to owner check
    memberStatus.value =
      project.value.memberStatus ||
      (String(project.value.user_id) === String(authStore.user?.id) ? 'Owner' : 'Invitee')

    form.value = {
      title: project.value.title || '',
      description: project.value.description || '',
      location: project.value.location || '',
      shoot_date: project.value.shoot_date || '',
      status: project.value.status || 'draft'
    }
  } catch (err) {
    console.error('Project fetch error:', err)
    error.value = err.response?.data?.error || 'Failed to load project'
    loading.value = false
    return
  }

  try {
    const imgRes = await axios.get(`http://localhost:4000/api/projects/${projectId}/images`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    images.value = imgRes.data.images || []
  } catch (err) {
    console.warn('Images fetch failed:', err)
    images.value = []
  } finally {
    loading.value = false
  }
}

const saveProject = async () => {
  if (memberStatus.value !== 'Owner') return

  saving.value = true
  error.value = ''

  try {
    const res = await axios.patch(
      `http://localhost:4000/api/projects/${projectId}`,
      form.value,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    project.value = res.data.project || { ...project.value, ...form.value }
    router.push(`/projects/${projectId}`)
  } catch (err) {
    console.error('Save project error:', err)
    error.value = err.response?.data?.error || 'Failed to save project changes'
  } finally {
    saving.value = false
  }
}

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  uploading.value = true
  imageError.value = ''

  try {
    const formData = new FormData()
    formData.append('image', file)

    await axios.post(
      `http://localhost:4000/api/projects/${projectId}/images`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    await fetchProject()
  } catch (err) {
    console.error('Upload image error:', err)
    imageError.value = err.response?.data?.error || 'Failed to upload image'
  } finally {
    uploading.value = false
    event.target.value = ''
  }
}

onMounted(fetchProject)
</script>
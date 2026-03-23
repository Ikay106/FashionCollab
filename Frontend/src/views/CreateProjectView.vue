<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-pink-50 to-white py-10 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- Card -->
      <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-teal-100">
        <!-- Header -->
        <div class="bg-gradient-to-r from-teal-600 to-pink-600 px-8 py-10 text-white text-center">
          <h1 class="text-4xl font-extrabold">Create New Project</h1>
          <p class="mt-3 text-teal-100 opacity-90">Set up your fashion shoot or campaign</p>
        </div>

        <!-- Error message -->
        <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mx-8 mt-6 rounded-lg">
          <p class="text-red-700 font-medium">{{ error }}</p>
          <ul v-if="errorDetails?.length" class="mt-2 text-red-600 text-sm list-disc pl-5">
            <li v-for="(detail, index) in errorDetails" :key="index">{{ detail }}</li>
          </ul>
        </div>

        <!-- Form -->
        <form @submit.prevent="createProject" class="p-8 space-y-8">
          <!-- Title -->
          <div>
            <label class="block text-gray-800 font-medium mb-2">Project Title <span class="text-red-500">*</span></label>
            <input
              v-model="form.title"
              type="text"
              class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
              placeholder="e.g. Summer Beach Editorial"
              required
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-gray-800 font-medium mb-2">Description</label>
            <textarea
              v-model="form.description"
              rows="5"
              class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
              placeholder="Describe the vision, theme, mood, or needs..."
            ></textarea>
          </div>

          <!-- Location & Shoot Date (side by side on larger screens) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-800 font-medium mb-2">Location</label>
              <input
                v-model="form.location"
                type="text"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
                placeholder="e.g. Manchester Central Studio"
              />
            </div>

            <div>
              <label class="block text-gray-800 font-medium mb-2">Shoot Date</label>
              <input
                v-model="form.shoot_date"
                type="date"
                class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition shadow-sm"
              />
            </div>
          </div>

          <!-- Status -->
          <div>
            <label class="block text-gray-800 font-medium mb-2">Status</label>
            <select
              v-model="form.status"
              class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white shadow-sm"
            >
              <option value="draft">Draft (Planning)</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 pt-8">
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 py-4 bg-gradient-to-r from-teal-600 to-pink-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {{ loading ? 'Creating...' : 'Create Project' }}
            </button>

            <button
              type="button"
              @click="router.back()"
              class="flex-1 py-4 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const form = ref({
  title: '',
  description: '',
  location: '',
  shoot_date: '',
  status: 'draft'
})

const loading = ref(false)
const error = ref('')
const errorDetails = ref([])

const createProject = async () => {
  loading.value = true
  error.value = ''
  errorDetails.value = []

  try {
    const response = await axios.post('http://localhost:4000/api/projects', form.value)
    console.log('Project created:', response.data)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create project'
    errorDetails.value = err.response?.data?.details || []
    console.error('Create error:', err)
  } finally {
    loading.value = false
  }
}
</script>
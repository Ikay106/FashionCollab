<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-pink-50 to-white flex items-center justify-center p-4">
    <div class="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-teal-100">

      <h1 class="text-4xl font-extrabold text-center mb-2 bg-gradient-to-r from-teal-600 to-pink-600 bg-clip-text text-transparent">
        FashionCollab
      </h1>
      <p class="text-center text-gray-500 mb-8">Set up your fashion shoot or campaign</p>

      <!-- Error -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
        {{ error }}
      </div>

      <form @submit.prevent="createProject" class="space-y-6">

        <div>
          <label class="block text-gray-700 font-medium mb-2">Project Title <span class="text-red-500">*</span></label>
          <input
            v-model="form.title"
            type="text"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="e.g. Summer Beach Editorial"
            required
          />
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            v-model="form.description"
            rows="4"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="Describe the vision, theme, mood, or needs..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Location</label>
            <input
              v-model="form.location"
              type="text"
              class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
              placeholder="e.g. Manchester Central Studio"
            />
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Shoot Date</label>
            <input
              v-model="form.shoot_date"
              type="date"
              class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            />
          </div>
        </div>

        <div>
          <label class="block text-gray-700 font-medium mb-2">Status</label>
          <select
            v-model="form.status"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
          >
            <option value="draft">Draft (Planning)</option>
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div class="flex gap-4 pt-2">
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-4 bg-gradient-to-r from-teal-600 to-pink-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Creating...' : 'Create Project' }}
          </button>

          <button
            type="button"
            @click="router.back()"
            class="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>

      </form>
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

const createProject = async () => {
  loading.value = true
  error.value = ''

  try {
    await axios.post('http://localhost:4000/api/projects', form.value)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create project'
  } finally {
    loading.value = false
  }
}
</script>
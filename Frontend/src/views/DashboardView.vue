<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-6xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800">My Projects</h1>
        <button
    @click="router.push('/projects/create')"
    class="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition flex items-center gap-2"
  >
    <span>+</span> Create New Project
  </button>
  <router-link
    to="/invites"
    class="px-6 py-3 bg-purple-600 text-white rounded-xl"
    >
    View Invites
    </router-link>
      </div>

      <div v-if="loading" class="text-center py-12">
        <p class="text-gray-600">Loading projects...</p>
      </div>

      <div v-else-if="projects.length === 0" class="text-center py-12 bg-white rounded-2xl shadow">
        <p class="text-xl text-gray-600 mb-4">No projects yet</p>
        <button
          @click="goToCreate"
          class="px-8 py-4 bg-pink-600 text-white rounded-xl font-semibold hover:bg-pink-700 transition"
        >
          Create Your First Project
        </button>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProjectCard
          v-for="project in projects"
          :key="project.id"
          :project="project"
          @click="goToDetail(project.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import ProjectCard from '@/components/ProjectCard.vue'

const authStore = useAuthStore()
const router = useRouter()

const projects = ref([])
const loading = ref(true)
const error = ref('')

const fetchProjects = async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/projects/my', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    projects.value = response.data.projects
  } catch (err) {
    console.error('Fetch projects error:', err)
    alert('Failed to load projects')
  } finally {
    loading.value = false
  }
}

const goToCreate = () => router.push('/projects/create')
const goToDetail = (id) => router.push(`/projects/${id}`)

onMounted(fetchProjects)
</script>
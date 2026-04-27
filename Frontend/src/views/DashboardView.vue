<template>
  <div class="min-h-screen bg-[#f7f7f5]">
    <!-- Top App Bar -->
    <header class="border-b border-black/5 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          @click="router.push('/dashboard')"
          class="text-2xl font-semibold tracking-tight text-gray-900 hover:opacity-80 transition"
        >
          FashionCollab
        </button>

        <div class="flex items-center gap-3">
          <router-link
            to="/invites"
            class="px-4 py-2 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
          >
            Invites
          </router-link>

          <button
            @click="router.push('/projects/create')"
            class="px-5 py-2.5 rounded-full bg-black text-white text-sm font-medium hover:bg-gray-900 transition"
          >
            + New Project
          </button>

          <!-- Profile dropdown -->
          <div class="relative" ref="dropdownRef">
            <button
              @click="dropdownOpen = !dropdownOpen"
              class="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-black/10 hover:border-black/20 transition"
            >
              <div class="w-8 h-8 rounded-full overflow-hidden bg-teal-600 flex items-center justify-center shrink-0">
                <img
                  v-if="profileAvatar"
                  :src="profileAvatar"
                  alt="Profile"
                  class="w-full h-full object-cover"
                />
                <span v-else class="text-white text-sm font-semibold">{{ profileInitials }}</span>
              </div>
              <span class="text-sm font-medium text-gray-800 hidden sm:inline">Profile</span>
              <span class="text-gray-400 text-xs hidden sm:inline">▾</span>
            </button>

            <div
              v-if="dropdownOpen"
              class="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-black/5 py-2 z-50"
            >
              <button
                @click="goToProfile"
                class="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                👤 View Profile
              </button>
              <div class="border-t border-gray-100 my-1"></div>
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                → Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10">
      <!-- Hero -->
      <section class="mb-10">
        <p class="text-sm uppercase tracking-[0.18em] text-gray-400 mb-3">
          Creative workspace
        </p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight text-gray-900">
          Projects
        </h1>
        <p class="text-gray-500 mt-4 text-base md:text-lg leading-relaxed max-w-2xl">
          Plan shoots, organise references, manage collaborators, and keep every detail in one place.
        </p>
      </section>

      <!-- Search bar -->
      <div v-if="!loading && projects.length > 0" class="mb-8">
        <div
          class="relative max-w-xl group"
          :class="searchFocused ? 'max-w-2xl' : 'max-w-xl'"
          style="transition: max-width 0.3s ease"
        >
          <!-- Search icon -->
          <div class="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              class="w-5 h-5 transition-colors duration-200"
              :class="searchFocused ? 'text-teal-500' : 'text-gray-400'"
              fill="none" stroke="currentColor" stroke-width="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" stroke-linecap="round" />
            </svg>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search projects by name, location, status..."
            @focus="searchFocused = true"
            @blur="searchFocused = false"
            class="w-full pl-14 pr-12 py-4 bg-white border rounded-2xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200"
            :class="searchFocused
              ? 'border-teal-400 shadow-[0_0_0_4px_rgba(20,184,166,0.1)]'
              : 'border-black/8 shadow-sm hover:border-black/15'"
          />

          <!-- Clear button -->
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition text-gray-500 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Result count -->
        <p v-if="searchQuery" class="mt-3 text-sm text-gray-400">
          <span class="font-semibold text-gray-700">{{ filteredProjects.length }}</span>
          {{ filteredProjects.length === 1 ? 'project' : 'projects' }} found
          <span v-if="filteredProjects.length !== projects.length">
            out of {{ projects.length }}
          </span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-16">
        <p class="text-gray-400 text-lg">Loading projects...</p>
      </div>

      <!-- Empty state — no projects at all -->
      <div
        v-else-if="projects.length === 0"
        class="bg-white rounded-[2rem] border border-black/5 shadow-sm p-12 text-center"
      >
        <p class="text-2xl font-semibold text-gray-900 mb-3">No projects yet</p>
        <p class="text-gray-500 mb-8">Start your first collaboration space and bring your team together.</p>
        <button
          @click="router.push('/projects/create')"
          class="px-8 py-4 rounded-full bg-black text-white font-medium hover:bg-gray-900 transition"
        >
          Create Your First Project
        </button>
      </div>

      <!-- Empty state — search returned nothing -->
      <div
        v-else-if="filteredProjects.length === 0"
        class="bg-white rounded-[2rem] border border-black/5 shadow-sm p-12 text-center"
      >
        <p class="text-5xl mb-4">🔍</p>
        <p class="text-xl font-semibold text-gray-900 mb-2">No projects match "{{ searchQuery }}"</p>
        <p class="text-gray-500 mb-6">Try a different name, location, or status.</p>
        <button
          @click="searchQuery = ''"
          class="px-6 py-3 rounded-full border border-black/10 text-gray-700 text-sm font-medium hover:bg-gray-100 transition"
        >
          Clear search
        </button>
      </div>

      <!-- Project grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <ProjectCard
          v-for="project in filteredProjects"
          :key="project.id"
          :project="project"
          @click="goToDetail(project.id)"
        />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import ProjectCard from '@/components/ProjectCard.vue'

const authStore = useAuthStore()
const router = useRouter()

const projects = ref([])
const loading = ref(true)
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
const searchQuery = ref('')
const searchFocused = ref(false)
const profileAvatar = ref(null)

const profileInitials = computed(() => {
  const name =
    authStore.user?.user_metadata?.full_name ||
    authStore.user?.email ||
    'FC'
  return name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
})

const fetchAvatar = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/api/profiles/me', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    profileAvatar.value = data?.avatar_url || null
  } catch (err) {
    console.warn('Could not fetch avatar:', err.message)
  }
}

// Filter projects by title, description, location, or status
const filteredProjects = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return projects.value
  return projects.value.filter(p =>
    p.title?.toLowerCase().includes(q) ||
    p.description?.toLowerCase().includes(q) ||
    p.location?.toLowerCase().includes(q) ||
    p.status?.toLowerCase().includes(q)
  )
})

const fetchProjects = async () => {
  try {
    const response = await axios.get('http://localhost:4000/api/projects/my', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    })
    projects.value = response.data.projects || []
  } catch (err) {
    console.error('Fetch projects error:', err)
    alert('Failed to load projects')
  } finally {
    loading.value = false
  }
}

const goToDetail = (id) => router.push(`/projects/${id}`)

const goToProfile = () => {
  dropdownOpen.value = false
  router.push('/profile/me')
}

const handleLogout = () => {
  dropdownOpen.value = false
  authStore.logout()
  router.push('/login')
}

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    dropdownOpen.value = false
  }
}

onMounted(() => {
  fetchProjects()
  fetchAvatar()
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
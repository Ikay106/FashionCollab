<template>
  <div class="bg-white rounded-2xl shadow-lg p-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Resources & Links</h2>
        <p class="text-sm text-gray-500 mt-1">
          Keep project references, folders, and external resources in one place.
        </p>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          v-model="newTitle"
          type="text"
          placeholder="Link title"
          class="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />

        <input
          v-model="newUrl"
          type="text"
          placeholder="Paste URL"
          class="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
        />

        <input
          v-model="newCategory"
          type="text"
          placeholder="Category (optional, e.g. Pinterest, Drive, Venue)"
          class="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 md:col-span-2"
        />

        <div class="flex md:justify-end">
          <button
            @click="addLink"
            :disabled="saving"
            class="w-full md:w-auto px-5 py-3 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Add Link' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading links...
    </div>

    <div
      v-else-if="links.length === 0"
      class="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-2xl"
    >
      No resources added yet.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="link in links"
        :key="link.id"
        class="border border-gray-200 rounded-2xl p-5 bg-gray-50"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="font-semibold text-gray-900 break-words">
                {{ link.title }}
              </h3>

              <span
                v-if="link.category"
                class="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-200 text-gray-700"
              >
                {{ link.category }}
              </span>
            </div>

            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm text-teal-700 hover:underline break-all mt-2 inline-block"
            >
              {{ link.url }}
            </a>

            <p class="text-xs text-gray-500 mt-3">
              Added by {{ link.full_name || link.username || 'Unknown user' }}
              · {{ formatDate(link.created_at) }}
            </p>
          </div>

          <button
            @click="deleteLink(link.id)"
            class="text-sm text-red-500 hover:text-red-700 shrink-0"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  projectId: {
    type: [String, Number],
    required: true
  }
})

const links = ref([])
const loading = ref(true)
const saving = ref(false)
const newTitle = ref('')
const newUrl = ref('')
const newCategory = ref('')

const fetchLinks = async () => {
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${props.projectId}/links`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    links.value = res.data.links || []
  } catch (err) {
    console.error('Fetch links error:', err)
  } finally {
    loading.value = false
  }
}

const addLink = async () => {
  if (!newTitle.value.trim() || !newUrl.value.trim()) return

  saving.value = true
  try {
    await axios.post(
      `http://localhost:4000/api/projects/${props.projectId}/links`,
      {
        title: newTitle.value.trim(),
        url: newUrl.value.trim(),
        category: newCategory.value.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    newTitle.value = ''
    newUrl.value = ''
    newCategory.value = ''
    await fetchLinks()
  } catch (err) {
    console.error('Add link error:', err)
    alert(err.response?.data?.error || 'Failed to add link')
  } finally {
    saving.value = false
  }
}

const deleteLink = async (linkId) => {
  try {
    await axios.delete(
      `http://localhost:4000/api/projects/${props.projectId}/links/${linkId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    links.value = links.value.filter(link => link.id !== linkId)
  } catch (err) {
    console.error('Delete link error:', err)
    alert(err.response?.data?.error || 'Failed to delete link')
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString([], {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(fetchLinks)
</script>
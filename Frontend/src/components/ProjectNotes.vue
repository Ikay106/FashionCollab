<template>
  <div class="bg-white rounded-2xl shadow-lg p-8">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Notes</h2>
        <p class="text-sm text-gray-500 mt-1">
          General project thoughts, reminders, and planning notes.
        </p>
      </div>
    </div>

    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
      <input
        v-model="newTitle"
        type="text"
        placeholder="Optional note title"
        class="w-full mb-3 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      <textarea
        v-model="newContent"
        rows="4"
        placeholder="Write a project note..."
        class="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
      ></textarea>

      <div class="flex justify-end mt-3">
        <button
          @click="addNote"
          :disabled="saving"
          class="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium hover:bg-teal-700 transition disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Add Note' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-8 text-gray-500">
      Loading notes...
    </div>

    <div v-else-if="notes.length === 0" class="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-2xl">
      No notes yet.
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="note in notes"
        :key="note.id"
        class="border border-gray-200 rounded-2xl p-5 bg-gray-50"
      >
        <div class="flex items-start gap-3">
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
            :class="getAvatarColor(note)"
          >
            {{ getInitials(note) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p class="font-semibold text-gray-900">
                  {{ note.full_name || note.username || 'Unknown user' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ note.profile_role || 'Collaborator' }} · {{ formatDate(note.created_at) }}
                </p>
              </div>
            </div>

            <h3
              v-if="note.title"
              class="text-base font-semibold text-gray-800 mt-3"
            >
              {{ note.title }}
            </h3>

            <p class="text-sm text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">
              {{ note.content }}
            </p>
          </div>
          <button
  @click="deleteNote(note.id)"
  class="text-xs text-red-500 hover:text-red-700"
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

const notes = ref([])
const loading = ref(true)
const saving = ref(false)
const newTitle = ref('')
const newContent = ref('')

const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:4000/api/projects/${props.projectId}/notes`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    notes.value = res.data.notes || []
  } catch (err) {
    console.error('Fetch notes error:', err)
  } finally {
    loading.value = false
  }
}

const addNote = async () => {
  if (!newContent.value.trim()) return

  saving.value = true
  try {
    await axios.post(
      `http://localhost:4000/api/projects/${props.projectId}/notes`,
      {
        title: newTitle.value.trim(),
        content: newContent.value.trim()
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    newTitle.value = ''
    newContent.value = ''
    await fetchNotes()
  } catch (err) {
    console.error('Add note error:', err)
    alert(err.response?.data?.error || 'Failed to add note')
  } finally {
    saving.value = false
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

const getInitials = (item) => {
  if (item.full_name) {
    return item.full_name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  if (item.username) {
    return item.username.slice(0, 2).toUpperCase()
  }

  return '??'
}

const colors = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500'
]

const getAvatarColor = (item) => {
  const key = item.id || item.username || 'default'
  let hash = 0

  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
const deleteNote = async (noteId) => {
  try {
    await axios.delete(
      `http://localhost:4000/api/projects/${props.projectId}/notes/${noteId}`,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    notes.value = notes.value.filter(n => n.id !== noteId)
  } catch (err) {
    console.error(err)
  }
}

onMounted(fetchNotes)
</script>
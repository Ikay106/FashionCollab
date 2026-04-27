<template>
  <div>
    <!-- Existing comments -->
    <div v-if="comments.length" class="space-y-2 mb-3 max-h-40 overflow-y-auto">
      <div
        v-for="comment in comments"
        :key="comment.id"
        class="flex gap-2 group"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
          :class="getAvatarColor(comment)"
        >
          {{ getInitials(comment) }}
        </div>

        <div class="flex-1 bg-white rounded-xl px-3 py-2 border border-gray-100">
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold text-gray-800">
                {{ comment.full_name || comment.username || 'Unknown' }}
                <span class="text-gray-400 font-normal">· {{ comment.project_role || 'Collaborator' }}</span>
              </p>
              <p class="text-xs text-gray-400">{{ formatDate(comment.created_at) }}</p>
            </div>

            <!-- Delete — only visible on hover, only for author or project owner -->
            <button
              v-if="canDelete(comment)"
              @click="deleteComment(comment.id)"
              class="opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-600 text-xs shrink-0 mt-0.5"
              title="Delete comment"
            >
              ✕
            </button>
          </div>

          <p class="text-sm text-gray-700 mt-1">{{ comment.comment }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-xs text-gray-400 mb-3">No comments yet.</div>

    <!-- Add comment -->
    <div class="flex gap-2">
      <input
        v-model="newComment"
        type="text"
        placeholder="Add a comment..."
        class="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        @keydown.enter.prevent="submitComment"
      />
      <button
        @click="submitComment"
        :disabled="!newComment.trim()"
        class="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40"
      >
        Send
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  image: { type: Object, required: true },
  projectId: { type: [String, Number], required: true },
  isOwner: { type: Boolean, default: false }
})

const comments = ref([])
const newComment = ref('')

const currentUserId = authStore.user?.id

const canDelete = (comment) => {
  return comment.user_id === currentUserId || props.isOwner
}

const fetchComments = async () => {
  try {
    const res = await axios.get(
      `http://localhost:4000/api/projects/${props.projectId}/images/${props.image.id}/comments`,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    comments.value = res.data.comments || []
  } catch (err) {
    console.error('Fetch comments error:', err)
  }
}

const submitComment = async () => {
  const text = newComment.value.trim()
  if (!text) return
  try {
    await axios.post(
      `http://localhost:4000/api/projects/${props.projectId}/images/${props.image.id}/comments`,
      { comment: text },
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    newComment.value = ''
    await fetchComments()
  } catch (err) {
    console.error('Add comment error:', err)
  }
}

const deleteComment = async (commentId) => {
  if (!confirm('Delete this comment?')) return
  try {
    await axios.delete(
      `http://localhost:4000/api/projects/${props.projectId}/images/${props.image.id}/comments/${commentId}`,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )
    // Remove instantly from local list — no refetch needed
    comments.value = comments.value.filter(c => c.id !== commentId)
  } catch (err) {
    console.error('Delete comment error:', err)
    alert(err.response?.data?.error || 'Failed to delete comment')
  }
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const colors = ['bg-pink-400', 'bg-purple-400', 'bg-indigo-400', 'bg-blue-400', 'bg-emerald-400', 'bg-orange-400']

const getInitials = (item) => {
  if (item.full_name) return item.full_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (item.username) return item.username.slice(0, 2).toUpperCase()
  return '??'
}

const getAvatarColor = (item) => {
  const key = item.user_id || item.username || 'x'
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

onMounted(fetchComments)
</script>
<template>
  <div class="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">

      <!-- Modal Header -->
      <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900">Edit Profile</h2>
        <button
          @click="$emit('cancel')"
          class="text-gray-400 hover:text-gray-600 text-3xl leading-none"
        >
          &times;
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="save" class="p-8 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">

        <!-- Avatar upload -->
        <div class="flex flex-col items-center gap-4">
          <div class="relative">
            <div class="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-gray-100 border-4 border-white shadow-lg">
              <img
                v-if="avatarPreview || localForm.avatar_url"
                :src="avatarPreview || localForm.avatar_url"
                alt="Avatar preview"
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center text-gray-400 text-4xl"
              >
                👤
              </div>
            </div>

            <!-- Upload overlay button -->
            <label
              class="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center cursor-pointer shadow-md transition"
              title="Upload photo"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <input
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleAvatarSelect"
              />
            </label>
          </div>

          <div v-if="avatarUploading" class="text-sm text-gray-500">Uploading...</div>
          <div v-if="avatarError" class="text-sm text-red-500">{{ avatarError }}</div>
          <p class="text-xs text-gray-400">Click the + to upload a profile photo</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              v-model="localForm.full_name"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input
              v-model="localForm.username"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="username"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Role</label>
            <select
              v-model="localForm.role"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500 bg-white"
            >
              <option value="">Select role</option>
              <option value="Model">Model</option>
              <option value="Stylist">Stylist</option>
              <option value="Photographer">Photographer</option>
              <option value="Designer">Designer</option>
              <option value="Creative Director">Creative Director</option>
              <option value="Makeup Artist">Makeup Artist</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Location</label>
            <input
              v-model="localForm.location"
              type="text"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="Manchester, United Kingdom"
            />
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
            <textarea
              v-model="localForm.bio"
              rows="5"
              class="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:outline-none focus:border-rose-500 resize-y"
              placeholder="Tell others about yourself..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
            <input
              v-model="localForm.instagram_url"
              type="url"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="https://instagram.com/yourusername"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Portfolio URL</label>
            <input
              v-model="localForm.portfolio_url"
              type="url"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="https://yourportfolio.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Website URL</label>
            <input
              v-model="localForm.website_url"
              type="url"
              class="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-rose-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <button
            type="button"
            @click="$emit('cancel')"
            class="px-8 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-2xl transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading || avatarUploading"
            class="px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold rounded-2xl transition"
          >
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps({
  initialForm: { type: Object, required: true }
})

const emit = defineEmits(['save', 'cancel'])

const localForm = ref({ ...props.initialForm })
const loading = ref(false)
const avatarPreview = ref(null)
const avatarUploading = ref(false)
const avatarError = ref('')

watch(() => props.initialForm, (newVal) => {
  localForm.value = { ...newVal }
}, { deep: true })

const handleAvatarSelect = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // Show preview immediately
  const reader = new FileReader()
  reader.onload = (e) => { avatarPreview.value = e.target.result }
  reader.readAsDataURL(file)

  // Upload to backend
  avatarUploading.value = true
  avatarError.value = ''

  try {
    const formData = new FormData()
    formData.append('image', file)

    const { data } = await axios.post(
      'http://localhost:4000/api/profiles/me/avatar',
      formData,
      { headers: { Authorization: `Bearer ${authStore.token}` } }
    )

    // Update form with new URL so it's included in save
    localForm.value.avatar_url = data.avatar_url
  } catch (err) {
    console.error('Avatar upload error:', err)
    avatarError.value = err.response?.data?.error || 'Failed to upload photo'
    avatarPreview.value = null
  } finally {
    avatarUploading.value = false
    event.target.value = ''
  }
}

const save = async () => {
  loading.value = true
  emit('save', localForm.value)
  loading.value = false
}
</script>
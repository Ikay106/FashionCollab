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
            :disabled="loading"
            class="px-8 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-semibold rounded-2xl transition flex items-center gap-2"
          >
            <span v-if="loading">Saving...</span>
            <span v-else>Save Changes</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  initialForm: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'cancel'])

const localForm = ref({ ...props.initialForm })
const loading = ref(false)

watch(() => props.initialForm, (newVal) => {
  localForm.value = { ...newVal }
}, { deep: true })

const save = async () => {
  loading.value = true
  emit('save', localForm.value)
  loading.value = false
}
</script>
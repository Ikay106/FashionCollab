<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">

        <!-- Header -->
        <div class="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Upload Image</h2>
          <button @click="$emit('cancel')" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <!-- Preview -->
        <div class="px-8 pt-6">
          <div class="w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-6">
            <img
              :src="previewUrl"
              alt="Preview"
              class="w-full h-full object-cover"
            />
          </div>
        </div>

        <!-- Form -->
        <div class="px-8 pb-8 space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Image Name</label>
            <input
              v-model="localName"
              type="text"
              class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Give this image a name..."
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Description <span class="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              v-model="localDescription"
              rows="3"
              class="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              placeholder="Describe the mood, reference, or notes..."
            ></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button
              @click="$emit('cancel')"
              class="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              @click="confirm"
              class="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-pink-600 text-white text-sm font-semibold hover:from-teal-700 hover:to-pink-700 transition"
            >
              Upload
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  file: { type: File, required: true },
  previewUrl: { type: String, required: true }
})

const emit = defineEmits(['confirm', 'cancel'])

const localName = ref(props.file.name.replace(/\.[^/.]+$/, '')) // strip extension
const localDescription = ref('')

const confirm = () => {
  emit('confirm', {
    name: localName.value.trim() || props.file.name,
    description: localDescription.value.trim()
  })
}
</script>
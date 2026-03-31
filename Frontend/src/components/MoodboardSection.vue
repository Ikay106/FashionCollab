<template>
  <div class="bg-white rounded-2xl shadow-lg p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Moodboard</h2>

      <button
        @click="openUpload"
        class="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition flex items-center gap-2"
      >
        <span>+</span> Upload Image
      </button>
    </div>

    <div v-if="images.length === 0" class="text-center py-12 text-gray-600">
      No moodboard images yet — upload some to inspire the team!
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="image in images"
        :key="image.id"
        class="bg-gray-50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100"
      >
        <div class="relative group">
          <img
            :src="image.image_url"
            :alt="image.file_name || 'Moodboard image'"
            class="w-full h-64 object-cover"
          />

          <div
            class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
          >
            <button
              @click="removeImage(image.id)"
              class="text-white bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="p-4">
          <p class="font-semibold text-gray-800 mb-1">
            {{ image.file_name || 'Untitled image' }}
          </p>

          <p class="text-sm text-gray-600 mb-2">
            {{ image.description || 'No description provided.' }}
          </p>

          <div class="flex justify-between items-center text-xs text-gray-500">
            <span>Uploaded by: {{ image.uploader_role || 'Unknown' }}</span>
            <span>{{ formatDate(image.uploaded_at) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['upload', 'delete'])

const openUpload = () => {
  emit('upload')
}

const removeImage = (imageId) => {
  emit('delete', imageId)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString()
}
</script>
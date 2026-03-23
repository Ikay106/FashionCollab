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

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div
        v-for="image in images"
        :key="image.id"
        class="aspect-square rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group relative"
      >
        <img :src="image.image_url" alt="Moodboard image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <button class="text-white bg-red-600 px-4 py-2 rounded-lg text-sm hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  images: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['upload'])

const openUpload = () => {
  emit('upload')
}
</script>
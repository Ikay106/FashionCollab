<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-lg font-semibold text-gray-900">Moodboard</h2>
        <p class="text-sm text-gray-400 mt-0.5">{{ images.length }} image{{ images.length === 1 ? '' : 's' }}</p>
      </div>
      <button
        @click="triggerUpload"
        class="px-5 py-2.5 rounded-full bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition"
      >
        + Upload
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="images.length === 0" class="text-center py-16 text-gray-400 text-sm border border-dashed border-gray-200 rounded-2xl">
      No images yet — upload some to inspire the team!
    </div>

    <!-- Image grid -->
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="(image, index) in images"
        :key="image.id"
        class="group relative bg-gray-50 rounded-2xl overflow-hidden aspect-square cursor-pointer"
        @click="openViewer(index)"
      >
        <img
          :src="image.image_url"
          :alt="image.file_name || 'Moodboard image'"
          class="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-end justify-start p-3">
          <button
            @click.stop="emit('delete', image.id)"
            class="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition"
          >
            Delete
          </button>
          <div class="mt-auto w-full">
            <p class="text-white text-xs font-medium truncate">
              {{ image.description || image.file_name || '' }}
            </p>
            <p class="text-white/60 text-xs">{{ image.uploader_role }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Image viewer modal -->
    <ImageViewerModal
      :image="viewerImage"
      :has-prev="viewerIndex > 0"
      :has-next="viewerIndex < images.length - 1"
      @close="viewerImage = null"
      @prev="viewerIndex--; viewerImage = images[viewerIndex]"
      @next="viewerIndex++; viewerImage = images[viewerIndex]"
    />

    <!-- Upload modal -->
    <UploadImageModal
      v-if="showUploadModal"
      :file="pendingFile"
      :preview-url="pendingPreviewUrl"
      @confirm="handleUploadConfirm"
      @cancel="cancelUpload"
    />

    <!-- Image comments -->
    <div v-if="images.length > 0" class="mt-8 space-y-4">
      <h3 class="text-sm font-semibold text-gray-700 uppercase tracking-wider">Image Comments</h3>
      <div
        v-for="image in images"
        :key="'comments-' + image.id"
        class="border border-gray-100 rounded-2xl p-4 bg-gray-50"
      >
        <p class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          {{ image.file_name || 'Untitled image' }}
        </p>
        <MoodboardComments :image="image" :project-id="projectId" />
      </div>
    </div>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      class="hidden"
      @change="handleFileChange"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageViewerModal from '@/components/ImageViewerModal.vue'
import MoodboardComments from '@/components/MoodboardComments.vue'
import UploadImageModal from '@/components/UploadImageModal.vue'

const props = defineProps({
  projectId: { type: [String, Number], required: true },
  images: { type: Array, default: () => [] }
})

const emit = defineEmits(['delete', 'upload'])

const fileInput = ref(null)
const viewerImage = ref(null)
const viewerIndex = ref(0)
const showUploadModal = ref(false)
const pendingFile = ref(null)
const pendingPreviewUrl = ref('')

const triggerUpload = () => fileInput.value?.click()

const openViewer = (index) => {
  viewerIndex.value = index
  viewerImage.value = props.images[index]
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  pendingFile.value = file
  pendingPreviewUrl.value = URL.createObjectURL(file)
  showUploadModal.value = true
  event.target.value = ''
}

const handleUploadConfirm = ({ name, description }) => {
  const ext = pendingFile.value.name.split('.').pop()
  const nameWithExt = name.endsWith(`.${ext}`) ? name : `${name}.${ext}`
  
  const renamedFile = new File([pendingFile.value], nameWithExt, { type: pendingFile.value.type })
  
  console.log('original file:', pendingFile.value.name, pendingFile.value.type)
  console.log('renamed file:', renamedFile.name, renamedFile.type)
  
  emit('upload', { file: renamedFile, description })
  cancelUpload()
}

const cancelUpload = () => {
  showUploadModal.value = false
  pendingFile.value = null
  if (pendingPreviewUrl.value) {
    URL.revokeObjectURL(pendingPreviewUrl.value)
    pendingPreviewUrl.value = ''
  }
}
</script>
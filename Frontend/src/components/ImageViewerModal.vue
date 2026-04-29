<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="image"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      @click.self="$emit('close')"
    >
      <div class="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-[#111] rounded-3xl overflow-hidden shadow-2xl">

        <!-- Top bar -->
        <div class="flex items-center justify-between px-6 py-4 bg-black/40 shrink-0">
          <div class="min-w-0">
            <p class="text-white font-semibold text-sm truncate">
              {{ image.file_name || 'Untitled image' }}
            </p>
            <p class="text-white/50 text-xs mt-0.5">
              Uploaded by {{ image.uploader_role || 'Unknown' }}
              <span v-if="image.uploaded_at"> · {{ formatDate(image.uploaded_at) }}</span>
            </p>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-4">
            <!-- Download button -->
            <a
              :href="image.image_url"
              :download="image.file_name || 'moodboard-image'"
              target="_blank"
              class="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition"
              @click.stop
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 4v12m0 0l-4-4m4 4l4-4" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M4 20h16" stroke-linecap="round"/>
              </svg>
              Download
            </a>

            <!-- Close button -->
            <button
              @click="$emit('close')"
              class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Image -->
        <div class="flex-1 overflow-hidden flex items-center justify-center bg-black min-h-0">
          <img
            :src="image.image_url"
            :alt="image.file_name || 'Moodboard image'"
            class="max-w-full max-h-full object-contain"
          />
        </div>

        <!-- Bottom bar — description -->
        <div
          v-if="image.description"
          class="px-6 py-4 bg-black/40 shrink-0"
        >
          <p class="text-xs text-white/40 uppercase tracking-wider mb-1">Description</p>
          <p class="text-white/80 text-sm leading-relaxed">{{ image.description }}</p>
        </div>

        <!-- Prev / Next navigation -->
        <button
          v-if="hasPrev"
          @click.stop="$emit('prev')"
          class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
        >
          ‹
        </button>
        <button
          v-if="hasNext"
          @click.stop="$emit('next')"
          class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
        >
          ›
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  image: { type: Object, default: null },
  hasPrev: { type: Boolean, default: false },
  hasNext: { type: Boolean, default: false }
})

defineEmits(['close', 'prev', 'next'])

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleString([], {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}
</script>
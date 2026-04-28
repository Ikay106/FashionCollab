<template>
  <div
    class="sticky top-[65px] z-20 border-b border-gray-200 mb-10"
    style="background: rgba(249,247,244,0.95); backdrop-filter: blur(12px);"
  >
    <div class="flex gap-0 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="$emit('update:active', tab.key)"
        class="relative px-6 py-4 text-sm font-semibold tracking-wide uppercase transition whitespace-nowrap"
        :class="active === tab.key ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'"
      >
        {{ tab.label }}
        <span
          v-if="active === tab.key"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-pink-500 rounded-full"
        ></span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true },
  active: { type: String, required: true }
})

defineEmits(['update:active'])
</script>

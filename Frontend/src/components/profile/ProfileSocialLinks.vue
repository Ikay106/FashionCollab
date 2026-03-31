<template>
  <div v-if="hasSocialLinks" class="px-8 py-8 border-t border-gray-100 bg-gray-50">
    <h3 class="text-sm font-semibold text-gray-500 mb-4">Connect with me</h3>
    <div class="flex flex-wrap gap-6">
      <a
        v-if="profile.instagram_url"
        :href="profile.instagram_url"
        target="_blank"
        class="flex items-center gap-3 text-pink-600 hover:text-pink-700 transition-colors"
      >
        <span class="text-2xl">📷</span>
        <span class="font-medium">Instagram</span>
      </a>

      <a
        v-if="profile.portfolio_url"
        :href="profile.portfolio_url"
        target="_blank"
        class="flex items-center gap-3 text-blue-600 hover:text-blue-700 transition-colors"
      >
        <span class="text-2xl">🌐</span>
        <span class="font-medium">Portfolio</span>
      </a>

      <a
        v-if="profile.website_url"
        :href="profile.website_url"
        target="_blank"
        class="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span class="text-2xl">🔗</span>
        <span class="font-medium">Website</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: {
    type: Object,
    default: () => ({})
  }
})

const hasSocialLinks = computed(() => 
  !!props.profile?.instagram_url || 
  !!props.profile?.portfolio_url || 
  !!props.profile?.website_url
)
</script>
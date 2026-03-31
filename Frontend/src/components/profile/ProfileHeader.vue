<template>
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <h1 class="text-4xl font-bold text-gray-900">
        {{ isOwnProfile ? 'My Profile' : `${profile.full_name || 'User'}'s Profile` }}
      </h1>
      <p class="mt-2 text-gray-600 text-lg">
        {{ isOwnProfile 
          ? 'Manage how you appear to the fashion community' 
          : 'Member profile' }}
      </p>
    </div>

    <div class="flex items-center gap-4">
      <button
        v-if="isOwnProfile"
        @click="$emit('edit')"
        class="px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl transition-all active:scale-95"
      >
        Edit Profile
      </button>

      <button
        @click="$emit('back')"
        class="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-medium"
      >
        ← Back
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  profile: Object,
  isOwnProfile: Boolean
})
</script>
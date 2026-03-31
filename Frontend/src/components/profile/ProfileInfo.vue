<template>
  <div class="p-10">
    <!-- Avatar -->
    <div class="flex justify-center mb-10">
      <div class="w-40 h-40 bg-gradient-to-br from-rose-100 to-gray-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
        <span v-if="profile.avatar_url" class="text-8xl">👤</span>
        <span v-else class="text-8xl text-gray-400">👤</span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
      <!-- Full Name -->
      <div>
        <p class="text-sm uppercase tracking-widest text-gray-500 font-medium">Full Name</p>
        <p class="mt-2 text-3xl font-semibold text-gray-900">
          {{ profile.full_name || 'Not provided' }}
        </p>
      </div>

      <!-- Username -->
      <div>
        <p class="text-sm uppercase tracking-widest text-gray-500 font-medium">Username</p>
        <p class="mt-2 text-3xl font-semibold text-gray-900">
          @{{ profile.username || '—' }}
        </p>
      </div>

      <!-- Role -->
      <div>
        <p class="text-sm uppercase tracking-widest text-gray-500 font-medium">Role</p>
        <p class="mt-2 text-2xl font-medium text-rose-600">
          {{ profile.role || 'Not specified' }}
        </p>
      </div>

      <!-- Location -->
      <div>
        <p class="text-sm uppercase tracking-widest text-gray-500 font-medium">Location</p>
        <p class="mt-2 text-2xl text-gray-700">
          {{ profile.location || '—' }}
        </p>
      </div>

      <!-- Bio -->
      <div class="md:col-span-2">
        <p class="text-sm uppercase tracking-widest text-gray-500 font-medium mb-3">Bio</p>
        <p class="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
          {{ profile.bio || 'No bio added yet.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  profile: {
    type: Object,
    default: () => ({})
  }
})
</script>
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-2">Description</h3>
      <p class="text-gray-600 whitespace-pre-line">{{ project.description || 'No description provided' }}</p>
    </div>

    <div class="space-y-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Location</h3>
        <p class="text-gray-600">{{ project.location || 'Not set' }}</p>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Shoot Date</h3>
        <p class="text-gray-600">
          {{ project.shoot_date ? new Date(project.shoot_date).toLocaleDateString() : 'Not set' }}
        </p>
      </div>

      <div>
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Created</h3>
        <p class="text-gray-600">
          {{ new Date(project.created_at).toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true
  }
})
</script>
<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div v-if="isOwner" class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <h2 class="text-lg font-bold text-gray-900 mb-1">Invite Collaborator</h2>
      <p class="text-sm text-gray-400 mb-6">Add someone to this project by email</p>
      <InviteSection
        :project-id="projectId"
        :is-owner="isOwner"
        @invited="$emit('invited')"
      />
    </div>

    <div class="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
      <ProjectMembers
        :members="members"
        :project-id="projectId"
        :is-owner="isOwner"
        @view-profile="$emit('view-profile', $event)"
        @member-removed="$emit('member-removed', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import InviteSection from '@/components/InviteSection.vue'
import ProjectMembers from '@/components/ProjectMembers.vue'

defineProps({
  projectId: { type: [String, Number], required: true },
  members: { type: Array, default: () => [] },
  isOwner: { type: Boolean, default: false }
})

defineEmits(['invited', 'view-profile', 'member-removed'])
</script>
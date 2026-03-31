<template>
  <div class="mt-8">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-xl font-bold text-gray-900">Project Members</h3>
      <span class="text-sm text-gray-500">
        {{ members.length }} {{ members.length === 1 ? 'member' : 'members' }}
      </span>
    </div>

    <div v-if="members.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="member in members"
        :key="member.id"
        @click="$emit('view-profile', member.id)"
        class="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer shadow-sm hover:shadow-md hover:border-pink-200 transition"
      >
        <div class="flex items-start gap-4">
          <div
            v-if="member.avatar_url"
            class="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-1 ring-gray-200"
          >
            <img
              :src="member.avatar_url"
              alt="Profile avatar"
              class="w-full h-full object-cover"
            />
          </div>

          <div
            v-else
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
            :class="[
              getAvatarColor(member),
              (member.project_role || member.role) === 'Owner' ? 'ring-2 ring-pink-200' : ''
            ]"
          >
            {{ getInitials(member) }}
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap">
              <p class="font-semibold text-gray-900 truncate">
                {{ member.full_name || member.username || 'Unnamed user' }}
              </p>

              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="
                  (member.project_role || member.role) === 'Owner'
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-gray-100 text-gray-700'
                "
              >
                {{ member.project_role || member.role || 'Collaborator' }}
              </span>
            </div>

            <p class="text-sm text-gray-500 mt-1 truncate">
              @{{ member.username || 'no-username' }}
            </p>

            <p v-if="member.location" class="text-sm text-gray-400 mt-2 truncate">
              {{ member.location }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="bg-white border border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500"
    >
      No members yet.
    </div>
  </div>
</template>

<script setup>
defineProps({
  members: {
    type: Array,
    default: () => []
  }
})

defineEmits(['view-profile'])

const getInitials = (member) => {
  if (member.full_name) {
    return member.full_name
      .split(' ')
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  if (member.username) {
    return member.username.slice(0, 2).toUpperCase()
  }

  return '??'
}

const colors = [
  'bg-pink-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-orange-500'
]

const getAvatarColor = (member) => {
  const key = member.id || member.username || 'default'
  let hash = 0

  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash)
  }

  const index = Math.abs(hash) % colors.length
  return colors[index]
}
</script>
<template>
  <div class="max-w-4xl mx-auto py-10 px-6">
    <ProfileHeader 
      :profile="profile" 
      :is-own-profile="isOwnProfile"
      @edit="showEditModal = true"
      @back="goBack"
    />

    <div class="mt-8 bg-white rounded-3xl shadow border border-gray-100 overflow-hidden">
      <ProfileInfo :profile="profile" />
      <ProfileSocialLinks :profile="profile" />
    </div>

    <ProfileEditModal
      v-if="showEditModal"
      :initial-form="form"
      @save="handleSave"
      @cancel="showEditModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

import ProfileHeader from '@/components/profile/ProfileHeader.vue'
import ProfileInfo from '@/components/profile/ProfileInfo.vue'
import ProfileSocialLinks from '@/components/profile/ProfileSocialLinks.vue'
import ProfileEditModal from '@/components/profile/ProfileEditModal.vue'

const isSetupMode = computed(() => route.query.setup === '1')
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const profile = ref({})
const form = ref({})
const showEditModal = ref(false)
const loading = ref(true)

const isOwnProfile = computed(() =>
  !route.params.id || route.params.id === 'me'
)

const fetchProfile = async () => {
  loading.value = true
  try {
    const endpoint = isOwnProfile.value
      ? `http://localhost:4000/api/profiles/me`
      : `http://localhost:4000/api/profiles/${route.params.id}`

    const { data } = await axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    profile.value = data || {}
    form.value = { ...data }
    if (isSetupMode.value) {
  showEditModal.value = true
}
  } catch (err) {
    console.error('Fetch profile error:', err)
  } finally {
    loading.value = false
  }
}

const handleSave = async (updatedData) => {
  try {
    const { data } = await axios.put(
      'http://localhost:4000/api/profiles/me',
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    )

    profile.value = data.profile || {}
    form.value = { ...data.profile }
    showEditModal.value = false

    if (isSetupMode.value) {
      router.push('/dashboard')
    }

  } catch (err) {
    console.error('Save profile error:', err)
    alert(err.response?.data?.error || 'Failed to save')
  }
}

const goBack = () => {
  if (isSetupMode.value) return
  router.back()
}

onMounted(fetchProfile)
</script>
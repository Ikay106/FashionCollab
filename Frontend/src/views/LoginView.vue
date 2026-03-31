<template>
  <div class="min-h-screen bg-gradient-to-br from-teal-50 via-pink-50 to-white flex items-center justify-center p-4">
    <div class="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-teal-100">
      <h1 class="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-teal-600 to-pink-600 bg-clip-text text-transparent">
        FashionCollab
      </h1>

      <div class="flex mb-8 border-b border-gray-200">
        <button
          @click="isLogin = true"
          :class="{
            'border-b-4 border-teal-600 text-teal-700 font-semibold': isLogin,
            'text-gray-500 hover:text-teal-600': !isLogin
          }"
          class="flex-1 py-4 text-lg transition-colors"
        >
          Log In
        </button>
        <button
          @click="isLogin = false"
          :class="{
            'border-b-4 border-pink-600 text-pink-700 font-semibold': !isLogin,
            'text-gray-500 hover:text-pink-600': isLogin
          }"
          class="flex-1 py-4 text-lg transition-colors"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="mb-8">
          <label class="block text-gray-700 font-medium mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="!isLogin" class="mb-8">
          <label class="block text-gray-700 font-medium mb-2">Role</label>
          <select
            v-model="role"
            class="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition bg-white"
            required
          >
            <option value="">Select your role</option>
            <option value="photographer">Photographer</option>
            <option value="model">Model</option>
            <option value="stylist">Stylist</option>
            <option value="makeup_artist">Makeup Artist</option>
            <option value="hair_stylist">Hair Stylist</option>
            <option value="videographer">Videographer</option>
            <option value="creative_director">Creative Director</option>
            <option value="brand_rep">Brand Representative</option>
          </select>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-4 bg-gradient-to-r from-teal-600 to-pink-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up') }}
        </button>
      </form>

      <p v-if="error" class="text-center mt-6 text-red-600 font-medium">
        {{ error }}
      </p>

      <p class="text-center mt-8 text-gray-600">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <button @click="isLogin = !isLogin" class="text-teal-600 font-medium hover:underline ml-1">
          {{ isLogin ? 'Sign Up' : 'Log In' }}
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const role = ref('')
const loading = ref(false)
const error = ref('')

const checkProfileAndRedirect = async () => {
  try {
    const res = await axios.get('http://localhost:4000/api/profiles/me', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })

    const profile = res.data || {}

    const isIncomplete =
      !profile.full_name ||
      !profile.username ||
      !profile.role

    if (isIncomplete) {
      router.push('/profile/me?setup=1')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    console.error('Profile check error:', err)

    // no profile at all → go create one
    router.push('/profile/me?setup=1')
  }
}

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    let response
    if (isLogin.value) {
      response = await axios.post('http://localhost:4000/api/auth/login', {
        email: email.value,
        password: password.value
      })
    } else {
      response = await axios.post('http://localhost:4000/api/auth/signup', {
        email: email.value,
        password: password.value,
        role: role.value
      })
    }

    console.log('login response:', response.data)
    const { access_token,user } = response.data
    authStore.setToken(access_token)
    authStore.setUser(user)
   await checkProfileAndRedirect()
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
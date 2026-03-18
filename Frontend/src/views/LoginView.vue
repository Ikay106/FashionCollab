<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-3xl font-bold text-center mb-8 text-gray-800">FashionCollab</h1>

      <div class="flex mb-6 border-b">
        <button
          @click="isLogin = true"
          :class="{
            'border-b-2 border-blue-600 text-blue-600 font-semibold': isLogin,
            'text-gray-500 hover:text-gray-700': !isLogin
          }"
          class="flex-1 py-3 text-center transition"
        >
          Login
        </button>
        <button
          @click="isLogin = false"
          :class="{
            'border-b-2 border-blue-600 text-blue-600 font-semibold': !isLogin,
            'text-gray-500 hover:text-gray-700': isLogin
          }"
          class="flex-1 py-3 text-center transition"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-5">
          <label class="block text-gray-700 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <input
            v-model="password"
            type="password"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="!isLogin" class="mb-6">
          <label class="block text-gray-700 mb-2">Role</label>
          <select
            v-model="role"
            class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          :disabled="loading"
        >
          {{ loading ? 'Loading...' : (isLogin ? 'Log In' : 'Sign Up') }}
        </button>
      </form>

      <p v-if="error" class="text-center mt-4 text-red-600">
        {{ error }}
      </p>

      <p class="text-center mt-6 text-gray-600">
        {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
        <button @click="isLogin = !isLogin" class="text-blue-600 underline ml-1">
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

    const { access_token } = response.data
    authStore.setToken(access_token)
    router.push('/dashboard')
  } catch (err) {
    error.value = err.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
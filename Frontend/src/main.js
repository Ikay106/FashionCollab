import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Auto-add token to every request
axios.interceptors.request.use(config => {
  const store = useAuthStore(pinia)
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

// Optional: handle 401 (unauthorized) → auto logout
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      const store = useAuthStore(pinia)
      store.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

app.mount('#app')
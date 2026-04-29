import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import './assets/main.css'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPhotoFilm, faNoteSticky, faLink, faUser, faComment, faThumbtack } from '@fortawesome/free-solid-svg-icons'
library.add(faPhotoFilm, faNoteSticky, faLink, faUser, faComment, faThumbtack)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

// Auto-add token to every request
axios.interceptors.request.use(config => {
  const store = useAuthStore(pinia)
  if (store.token) {
    config.headers.Authorization = `Bearer ${store.token}`
  }
  return config
})

// handle 401 (unauthorized) 
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
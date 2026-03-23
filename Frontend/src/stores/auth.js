import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  actions: {
    setToken(newToken) {
      this.token = newToken
      localStorage.setItem('token', newToken)
    },

    setUser(userData) {
      this.user = userData
      localStorage.setItem('user', JSON.stringify(userData))
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
       localStorage.removeItem('user')
    }
  }
})
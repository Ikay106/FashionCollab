import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', name: 'Login', component: () => import('@/views/LoginView.vue') },
  { path: '/dashboard', name: 'Dashboard', component: () => import('@/views/DashboardView.vue') },
  { path: '/projects/create', name: 'CreateProject', component: () => import('@/views/CreateProjectView.vue') },
  { path: '/projects/:id', name: 'ProjectDetail', component: () => import('@/views/ProjectDetailView.vue') },
  { path: '/projects/:id/edit', name: 'EditProject', component: () => import('@/views/EditProjectView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
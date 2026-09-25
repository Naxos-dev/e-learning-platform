import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Role } from '@/types/api'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    role?: Role
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'courses',
      component: () => import('@/views/CourseListView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/courses/new',
      name: 'course-new',
      component: () => import('@/views/CourseFormView.vue'),
      meta: { requiresAuth: true, role: 'FORMATEUR' },
    },
    {
      path: '/courses/:courseId',
      name: 'course-detail',
      component: () => import('@/views/CourseDetailView.vue'),
      props: true,
    },
    {
      path: '/courses/:courseId/edit',
      name: 'course-edit',
      component: () => import('@/views/CourseFormView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'FORMATEUR' },
    },
    {
      path: '/courses/:courseId/chapters/new',
      name: 'chapter-new',
      component: () => import('@/views/ChapterFormView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'FORMATEUR' },
    },
    {
      path: '/courses/:courseId/dashboard',
      name: 'course-dashboard',
      component: () => import('@/views/DashboardView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'FORMATEUR' },
    },
    {
      path: '/chapters/:chapterId',
      name: 'chapter-detail',
      component: () => import('@/views/ChapterView.vue'),
      props: true,
    },
    {
      path: '/chapters/:chapterId/edit',
      name: 'chapter-edit',
      component: () => import('@/views/ChapterFormView.vue'),
      props: true,
      meta: { requiresAuth: true, role: 'FORMATEUR' },
    },
    {
      path: '/my-progress',
      name: 'my-progress',
      component: () => import('@/views/MyProgressView.vue'),
      meta: { requiresAuth: true, role: 'APPRENANT' },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'courses' }
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (typeof to.meta.role === 'string' && auth.user?.role !== to.meta.role) {
    return { name: 'courses' }
  }

  return true
})

export default router

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { CourseSummary, EnrollmentSummary } from '@/types/api'

const auth = useAuthStore()
const courses = ref<CourseSummary[]>([])
const myEnrollments = ref<EnrollmentSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const inProgressEnrollments = computed(() =>
  [...myEnrollments.value].sort((a, b) => {
    const aDone = a.chaptersCompleted >= a.course.totalChapters && a.course.totalChapters > 0
    const bDone = b.chaptersCompleted >= b.course.totalChapters && b.course.totalChapters > 0
    return Number(aDone) - Number(bDone)
  }),
)

const ACCENT_COLORS = [
  'border-t-indigo-400',
  'border-t-emerald-400',
  'border-t-amber-400',
  'border-t-rose-400',
  'border-t-sky-400',
  'border-t-violet-400',
]

function accentColor(id: string): string {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return ACCENT_COLORS[hash % ACCENT_COLORS.length]!
}

function progressPercent(enrollment: EnrollmentSummary): number {
  if (enrollment.course.totalChapters === 0) return 0
  return Math.round((enrollment.chaptersCompleted / enrollment.course.totalChapters) * 100)
}

onMounted(async () => {
  try {
    const [coursesResult, enrollmentsResult] = await Promise.all([
      api.get<CourseSummary[]>('/courses'),
      auth.isApprenant ? api.get<EnrollmentSummary[]>('/enrollments/me') : Promise.resolve([]),
    ])
    courses.value = coursesResult
    myEnrollments.value = enrollmentsResult
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger les cours'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <section v-if="!auth.isAuthenticated" class="mb-12 text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.25"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mx-auto h-12 w-12 text-slate-900"
        aria-hidden="true"
      >
        <path
          d="M12 6.5c-1.5-1-4-1.5-6-1.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1c2 0 4.5.5 6 1.5c1.5-1 4-1.5 6-1.5a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1c-2 0-4.5.5-6 1.5Z"
        />
        <path d="M12 6.5V19" />
      </svg>

      <h1 class="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">LearnFlow</h1>
      <p class="mx-auto mt-3 max-w-xl text-slate-600">
        Apprenez les technologies qui font tourner le web moderne. Cours structurés par chapitres,
        quiz interactifs et suivi de progression — Vue, Node.js, TypeScript, et plus encore.
      </p>

      <div class="mt-6 flex items-center justify-center gap-3">
        <RouterLink
          to="/register"
          class="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
        >
          Commencer gratuitement
        </RouterLink>
        <RouterLink
          to="/login"
          class="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          J'ai déjà un compte
        </RouterLink>
      </div>
    </section>

    <section v-if="auth.isApprenant && inProgressEnrollments.length > 0" class="mb-10">
      <h2 class="mb-4 text-lg font-semibold text-slate-900">Continuer l'apprentissage</h2>
      <div class="grid gap-3 sm:grid-cols-2">
        <RouterLink
          v-for="enrollment in inProgressEnrollments"
          :key="enrollment.id"
          :to="{ name: 'course-detail', params: { courseId: enrollment.course.id } }"
          class="block rounded-lg border border-slate-200 bg-white p-4 hover:border-slate-400"
        >
          <div class="flex items-center justify-between">
            <span class="font-medium text-slate-900">{{ enrollment.course.title }}</span>
            <span class="text-xs text-slate-500">
              {{ enrollment.chaptersCompleted }}/{{ enrollment.course.totalChapters }}
            </span>
          </div>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              class="h-full bg-slate-900"
              :style="{ width: `${progressPercent(enrollment)}%` }"
            />
          </div>
        </RouterLink>
      </div>
    </section>

    <h2 class="mb-6 text-2xl font-semibold text-slate-900">Cours disponibles</h2>

    <p v-if="loading" class="text-slate-500">Chargement...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>
    <p v-else-if="courses.length === 0" class="text-slate-500">Aucun cours pour le moment.</p>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="course in courses"
        :key="course.id"
        :to="{ name: 'course-detail', params: { courseId: course.id } }"
        class="block rounded-lg border border-t-4 border-slate-200 bg-white p-5 hover:border-slate-400"
        :class="accentColor(course.id)"
      >
        <h3 class="font-semibold text-slate-900">{{ course.title }}</h3>
        <p v-if="course.description" class="mt-1 line-clamp-2 text-sm text-slate-600">
          {{ course.description }}
        </p>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-slate-500">
          <span>Par {{ course.author.email }}</span>
          <span>{{ course._count.chapters }} chapitre(s) · {{ course._count.enrollments }} inscrit(s)</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

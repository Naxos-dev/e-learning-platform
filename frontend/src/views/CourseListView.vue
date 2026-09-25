<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import type { CourseSummary } from '@/types/api'

const courses = ref<CourseSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    courses.value = await api.get<CourseSummary[]>('/courses')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger les cours'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-semibold text-slate-900">Cours disponibles</h1>

    <p v-if="loading" class="text-slate-500">Chargement...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>
    <p v-else-if="courses.length === 0" class="text-slate-500">Aucun cours pour le moment.</p>

    <div v-else class="grid gap-4 sm:grid-cols-2">
      <RouterLink
        v-for="course in courses"
        :key="course.id"
        :to="{ name: 'course-detail', params: { courseId: course.id } }"
        class="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400"
      >
        <h2 class="font-semibold text-slate-900">{{ course.title }}</h2>
        <p v-if="course.description" class="mt-1 line-clamp-2 text-sm text-slate-600">
          {{ course.description }}
        </p>
        <div class="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Par {{ course.author.email }}</span>
          <span>{{ course._count.chapters }} chapitre(s) · {{ course._count.enrollments }} inscrit(s)</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

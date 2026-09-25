<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import type { EnrollmentSummary } from '@/types/api'

const enrollments = ref<EnrollmentSummary[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    enrollments.value = await api.get<EnrollmentSummary[]>('/enrollments/me')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger votre progression'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <h1 class="mb-6 text-2xl font-semibold text-slate-900">Ma progression</h1>

    <p v-if="loading" class="text-slate-500">Chargement...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>
    <p v-else-if="enrollments.length === 0" class="text-slate-500">
      Vous n'êtes inscrit à aucun cours pour l'instant.
      <RouterLink to="/" class="underline">Parcourir les cours</RouterLink>
    </p>

    <div v-else class="space-y-4">
      <RouterLink
        v-for="enrollment in enrollments"
        :key="enrollment.id"
        :to="{ name: 'course-detail', params: { courseId: enrollment.course.id } }"
        class="block rounded-lg border border-slate-200 bg-white p-5 hover:border-slate-400"
      >
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-slate-900">{{ enrollment.course.title }}</h2>
          <span class="text-sm text-slate-500">
            {{ enrollment.chaptersCompleted }} / {{ enrollment.course.totalChapters }} chapitres
          </span>
        </div>
        <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            class="h-full bg-slate-900"
            :style="{
              width:
                enrollment.course.totalChapters > 0
                  ? `${Math.round((enrollment.chaptersCompleted / enrollment.course.totalChapters) * 100)}%`
                  : '0%',
            }"
          />
        </div>
      </RouterLink>
    </div>
  </div>
</template>

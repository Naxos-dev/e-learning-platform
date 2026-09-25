<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import type { Dashboard } from '@/types/api'

const props = defineProps<{ courseId: string }>()

const dashboard = ref<Dashboard | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    dashboard.value = await api.get<Dashboard>(`/courses/${props.courseId}/dashboard`)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger le dashboard'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <RouterLink
      :to="{ name: 'course-detail', params: { courseId } }"
      class="text-sm text-slate-500 hover:underline"
    >
      ‹ Retour au cours
    </RouterLink>

    <h1 class="mt-2 mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

    <p v-if="loading" class="text-slate-500">Chargement...</p>
    <p v-else-if="error" class="text-red-600">{{ error }}</p>

    <template v-else-if="dashboard">
      <section>
        <h2 class="text-lg font-semibold text-slate-900">
          Apprenants inscrits ({{ dashboard.totalStudents }})
        </h2>
        <p v-if="dashboard.students.length === 0" class="mt-2 text-sm text-slate-500">
          Aucun apprenant inscrit.
        </p>
        <table v-else class="mt-2 w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="py-1 pr-4 font-medium">Email</th>
              <th class="py-1 pr-4 font-medium">Inscrit le</th>
              <th class="py-1 pr-4 font-medium">Chapitres terminés</th>
              <th class="py-1 font-medium">Progression</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in dashboard.students" :key="student.userId" class="border-t border-slate-100">
              <td class="py-2 pr-4">{{ student.email }}</td>
              <td class="py-2 pr-4 text-slate-500">
                {{ new Date(student.enrolledAt).toLocaleDateString() }}
              </td>
              <td class="py-2 pr-4">{{ student.chaptersCompleted }} / {{ dashboard.totalChapters }}</td>
              <td class="py-2">{{ student.completionRate }}%</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-slate-900">Scores moyens par quiz</h2>
        <p v-if="dashboard.quizStats.length === 0" class="mt-2 text-sm text-slate-500">
          Aucun quiz avec réponses pour l'instant.
        </p>
        <table v-else class="mt-2 w-full text-left text-sm">
          <thead class="text-slate-500">
            <tr>
              <th class="py-1 pr-4 font-medium">Chapitre</th>
              <th class="py-1 pr-4 font-medium">Questions</th>
              <th class="py-1 pr-4 font-medium">Tentatives</th>
              <th class="py-1 font-medium">Score moyen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="stat in dashboard.quizStats" :key="stat.chapterId" class="border-t border-slate-100">
              <td class="py-2 pr-4">{{ stat.chapterTitle }}</td>
              <td class="py-2 pr-4">{{ stat.questionCount }}</td>
              <td class="py-2 pr-4">{{ stat.submissionCount }}</td>
              <td class="py-2">{{ stat.averageScore !== null ? `${stat.averageScore}%` : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </section>
    </template>
  </div>
</template>

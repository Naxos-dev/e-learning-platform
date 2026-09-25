<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import type { CourseDetail, EnrollmentSummary } from '@/types/api'

const props = defineProps<{ courseId: string }>()
const auth = useAuthStore()
const router = useRouter()

const course = ref<CourseDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const enrolling = ref(false)
const isEnrolled = ref(false)

const isOwner = computed(() => auth.isFormateur && auth.user?.id === course.value?.authorId)

async function loadCourse() {
  loading.value = true
  error.value = null
  try {
    course.value = await api.get<CourseDetail>(`/courses/${props.courseId}`)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger le cours'
  } finally {
    loading.value = false
  }
}

async function checkEnrollment() {
  if (!auth.isApprenant) return
  try {
    const enrollments = await api.get<EnrollmentSummary[]>('/enrollments/me')
    isEnrolled.value = enrollments.some((e) => e.course.id === props.courseId)
  } catch {
    // Le bouton d'inscription reste affiché par défaut ; l'erreur n'est pas bloquante ici.
  }
}

async function handleEnroll() {
  enrolling.value = true
  error.value = null
  try {
    await api.post(`/courses/${props.courseId}/enroll`)
    isEnrolled.value = true
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible de s'inscrire"
  } finally {
    enrolling.value = false
  }
}

async function handleDelete() {
  if (!confirm('Supprimer ce cours et tout son contenu (chapitres, quiz, inscriptions) ?')) return
  try {
    await api.delete(`/courses/${props.courseId}`)
    await router.push('/')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de supprimer le cours'
  }
}

onMounted(() => {
  void loadCourse()
  void checkEnrollment()
})
</script>

<template>
  <div>
    <p v-if="loading" class="text-slate-500">Chargement...</p>
    <p v-else-if="error && !course" class="text-red-600">{{ error }}</p>

    <template v-else-if="course">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">{{ course.title }}</h1>
          <p class="mt-1 text-sm text-slate-500">Par {{ course.author.email }}</p>
        </div>

        <div v-if="isOwner" class="flex shrink-0 gap-2">
          <RouterLink
            :to="{ name: 'course-dashboard', params: { courseId: course.id } }"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Dashboard
          </RouterLink>
          <RouterLink
            :to="{ name: 'course-edit', params: { courseId: course.id } }"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Modifier
          </RouterLink>
          <button
            type="button"
            class="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            @click="handleDelete"
          >
            Supprimer
          </button>
        </div>

        <button
          v-else-if="auth.isApprenant && !isEnrolled"
          type="button"
          :disabled="enrolling"
          class="shrink-0 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          @click="handleEnroll"
        >
          {{ enrolling ? 'Inscription...' : "S'inscrire" }}
        </button>
        <span v-else-if="auth.isApprenant" class="shrink-0 text-sm font-medium text-green-700">
          ✓ Inscrit
        </span>
      </div>

      <p v-if="course.description" class="mt-4 text-slate-700">{{ course.description }}</p>
      <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

      <div class="mt-8">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Chapitres</h2>
          <RouterLink
            v-if="isOwner"
            :to="{ name: 'chapter-new', params: { courseId: course.id } }"
            class="text-sm font-medium text-slate-900 underline"
          >
            + Ajouter un chapitre
          </RouterLink>
        </div>

        <p v-if="course.chapters.length === 0" class="text-slate-500">Aucun chapitre pour le moment.</p>

        <ol v-else class="space-y-2">
          <li v-for="chapter in course.chapters" :key="chapter.id">
            <RouterLink
              :to="{ name: 'chapter-detail', params: { chapterId: chapter.id } }"
              class="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-slate-400"
            >
              <span class="text-slate-800">{{ chapter.order }}. {{ chapter.title }}</span>
              <span v-if="chapter.videoUrl" class="text-xs text-slate-400">🎬 vidéo</span>
            </RouterLink>
          </li>
        </ol>
      </div>
    </template>
  </div>
</template>

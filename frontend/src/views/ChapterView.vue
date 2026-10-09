<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api, ApiError } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import LoadingIndicator from '@/components/LoadingIndicator.vue'
import VideoUploader from '@/components/VideoUploader.vue'
import QuizManager from '@/components/QuizManager.vue'
import QuizTaker from '@/components/QuizTaker.vue'
import type { Chapter, CourseDetail, EnrollmentSummary, Progress } from '@/types/api'

const props = defineProps<{ chapterId: string }>()
const auth = useAuthStore()
const router = useRouter()

const chapter = ref<Chapter | null>(null)
const course = ref<CourseDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const needsLogin = ref(false)
const completing = ref(false)
const completed = ref(false)
const isEnrolled = ref(false)
const enrolling = ref(false)

const isOwner = computed(() => auth.isFormateur && auth.user?.id === course.value?.authorId)

const currentIndex = computed(() => {
  if (!course.value || !chapter.value) return -1
  return course.value.chapters.findIndex((c) => c.id === chapter.value!.id)
})
const previousChapter = computed(() => {
  if (currentIndex.value <= 0 || !course.value) return null
  return course.value.chapters[currentIndex.value - 1] ?? null
})
const nextChapter = computed(() => {
  if (currentIndex.value === -1 || !course.value) return null
  return course.value.chapters[currentIndex.value + 1] ?? null
})

async function load() {
  loading.value = true
  error.value = null
  needsLogin.value = false
  try {
    chapter.value = await api.get<Chapter>(`/chapters/${props.chapterId}`)
    course.value = await api.get<CourseDetail>(`/courses/${chapter.value.courseId}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      needsLogin.value = true
    } else {
      error.value = err instanceof ApiError ? err.message : 'Impossible de charger le chapitre'
    }
  } finally {
    loading.value = false
  }
}

async function loadProgress() {
  completed.value = false
  isEnrolled.value = false
  if (!auth.isApprenant || !chapter.value) return
  try {
    const enrollments = await api.get<EnrollmentSummary[]>('/enrollments/me')
    isEnrolled.value = enrollments.some((e) => e.course.id === chapter.value!.courseId)
    for (const enrollment of enrollments) {
      const match = enrollment.progress.find((p) => p.chapterId === props.chapterId)
      if (match) completed.value = match.completed
    }
  } catch {
    // Silencieux : la case "terminé" reste simplement décochée par défaut.
  }
}

async function handleEnroll() {
  if (!chapter.value) return
  enrolling.value = true
  error.value = null
  try {
    await api.post(`/courses/${chapter.value.courseId}/enroll`)
    await load()
    await loadProgress()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible de s'inscrire"
  } finally {
    enrolling.value = false
  }
}

async function toggleCompleted() {
  completing.value = true
  error.value = null
  try {
    const progress = await api.put<Progress>(`/chapters/${props.chapterId}/progress`, {
      completed: !completed.value,
    })
    completed.value = progress.completed
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de mettre à jour la progression'
  } finally {
    completing.value = false
  }
}

async function handleDeleteChapter() {
  if (!chapter.value || !confirm('Supprimer ce chapitre ?')) return
  try {
    await api.delete(`/chapters/${props.chapterId}`)
    await router.push({ name: 'course-detail', params: { courseId: chapter.value.courseId } })
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de supprimer le chapitre'
  }
}

function handleVideoUpdate(url: string | null) {
  if (chapter.value) chapter.value.videoUrl = url
}

// Vue Router réutilise ce composant en naviguant entre deux chapitres du même cours
// (même route "chapter-detail", seul le param change) : sans ce watch, le contenu
// affiché resterait celui de l'ancien chapitre après un clic sur précédent/suivant.
async function loadAll() {
  await load()
  await loadProgress()
}

watch(
  () => props.chapterId,
  () => {
    void loadAll()
  },
)

onMounted(() => {
  void loadAll()
})
</script>

<template>
  <div>
    <LoadingIndicator v-if="loading" />

    <div v-else-if="needsLogin" class="rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
      <p class="text-slate-700">🔒 Ce chapitre est réservé aux membres connectés.</p>
      <RouterLink
        :to="{ name: 'login', query: { redirect: $route.fullPath } }"
        class="mt-3 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
      >
        Se connecter
      </RouterLink>
    </div>

    <div v-else-if="chapter?.locked" class="rounded-md border border-slate-200 bg-slate-50 p-6 text-center">
      <p class="text-slate-700">🔒 Inscrivez-vous à ce cours pour accéder à ce chapitre.</p>
      <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
      <div class="mt-3 flex items-center justify-center gap-4">
        <button
          v-if="auth.isApprenant"
          type="button"
          :disabled="enrolling"
          class="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
          @click="handleEnroll"
        >
          {{ enrolling ? 'Inscription...' : "S'inscrire" }}
        </button>
        <RouterLink
          :to="{ name: 'course-detail', params: { courseId: chapter.courseId } }"
          class="text-sm text-slate-500 hover:underline"
        >
          ‹ Retour au cours
        </RouterLink>
      </div>
    </div>

    <p v-else-if="error && !chapter" class="text-red-600">{{ error }}</p>

    <template v-else-if="chapter">
      <RouterLink
        :to="{ name: 'course-detail', params: { courseId: chapter.courseId } }"
        class="text-sm text-slate-500 hover:underline"
      >
        ‹ Retour au cours
      </RouterLink>

      <div class="mt-2 flex items-start justify-between gap-4">
        <h1 class="text-2xl font-semibold text-slate-900">{{ chapter.title }}</h1>

        <div v-if="isOwner" class="flex shrink-0 gap-2">
          <RouterLink
            :to="{ name: 'chapter-edit', params: { chapterId: chapter.id } }"
            class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            Modifier
          </RouterLink>
          <button
            type="button"
            class="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            @click="handleDeleteChapter"
          >
            Supprimer
          </button>
        </div>
      </div>

      <VideoUploader
        v-if="isOwner"
        class="mt-4"
        :chapter-id="chapter.id"
        :video-url="chapter.videoUrl"
        @update:video-url="handleVideoUpdate"
      />
      <video v-else-if="chapter.videoUrl" :src="chapter.videoUrl" controls class="mt-4 w-full rounded-md bg-black" />

      <p v-if="chapter.content" class="mt-4 whitespace-pre-wrap text-slate-700">{{ chapter.content }}</p>

      <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

      <div class="mt-8 border-t border-slate-200 pt-6">
        <QuizManager v-if="isOwner" :chapter-id="chapter.id" />
        <QuizTaker
          v-else-if="auth.isApprenant"
          :chapter-id="chapter.id"
          :course-id="chapter.courseId"
          @enrolled="loadProgress"
        />
        <p v-else class="text-sm text-slate-500">
          <RouterLink to="/login" class="underline">Connectez-vous</RouterLink> en tant qu'apprenant pour
          passer le quiz.
        </p>
      </div>

      <div v-if="auth.isApprenant && isEnrolled" class="mt-8 flex justify-center border-t border-slate-200 pt-6">
        <button
          type="button"
          :disabled="completing"
          class="rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50"
          :class="
            completed
              ? 'border border-green-300 bg-green-50 text-green-700'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
          "
          @click="toggleCompleted"
        >
          {{ completed ? '✓ Chapitre terminé' : 'Marquer ce chapitre comme terminé' }}
        </button>
      </div>

      <div class="mt-8 flex items-stretch justify-between gap-4 border-t border-slate-200 pt-6">
        <RouterLink
          v-if="previousChapter"
          :to="{ name: 'chapter-detail', params: { chapterId: previousChapter.id } }"
          class="flex max-w-[45%] flex-col rounded-md border border-slate-300 px-4 py-2 text-right hover:bg-slate-100"
        >
          <span class="text-xs text-slate-500">‹ Précédent</span>
          <span class="truncate text-sm font-medium text-slate-800">{{ previousChapter.title }}</span>
        </RouterLink>
        <span v-else class="max-w-[45%] rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-300">
          ‹ Précédent
        </span>

        <RouterLink
          v-if="nextChapter"
          :to="{ name: 'chapter-detail', params: { chapterId: nextChapter.id } }"
          class="flex max-w-[45%] flex-col rounded-md border border-slate-300 px-4 py-2 text-left hover:bg-slate-100"
        >
          <span class="text-xs text-slate-500">Suivant ›</span>
          <span class="truncate text-sm font-medium text-slate-800">{{ nextChapter.title }}</span>
        </RouterLink>
        <span v-else class="max-w-[45%] rounded-md border border-slate-200 px-4 py-2 text-right text-sm text-slate-300">
          Suivant ›
        </span>
      </div>
    </template>
  </div>
</template>

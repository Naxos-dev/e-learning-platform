<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, ApiError } from '@/lib/api'
import type { Chapter } from '@/types/api'

const props = defineProps<{ courseId?: string; chapterId?: string }>()
const router = useRouter()

const title = ref('')
const content = ref('')
const order = ref<number | null>(null)
const courseIdForEdit = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const isEdit = computed(() => Boolean(props.chapterId))
const backToCourseId = computed(() => props.courseId ?? courseIdForEdit.value)

onMounted(async () => {
  if (!props.chapterId) return
  try {
    const chapter = await api.get<Chapter>(`/chapters/${props.chapterId}`)
    title.value = chapter.title
    content.value = chapter.content ?? ''
    order.value = chapter.order
    courseIdForEdit.value = chapter.courseId
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger le chapitre'
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    if (props.chapterId) {
      await api.patch(`/chapters/${props.chapterId}`, {
        title: title.value,
        content: content.value || undefined,
        order: order.value ?? undefined,
      })
      await router.push({ name: 'chapter-detail', params: { chapterId: props.chapterId } })
    } else if (props.courseId) {
      const created = await api.post<Chapter>(`/courses/${props.courseId}/chapters`, {
        title: title.value,
        content: content.value || undefined,
        order: order.value ?? undefined,
      })
      await router.push({ name: 'chapter-detail', params: { chapterId: created.id } })
    }
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible d'enregistrer le chapitre"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <h1 class="mb-6 text-2xl font-semibold text-slate-900">
      {{ isEdit ? 'Modifier le chapitre' : 'Nouveau chapitre' }}
    </h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="title" class="block text-sm font-medium text-slate-700">Titre</label>
        <input
          id="title"
          v-model="title"
          type="text"
          required
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="content" class="block text-sm font-medium text-slate-700">Contenu</label>
        <textarea
          id="content"
          v-model="content"
          rows="8"
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="order" class="block text-sm font-medium text-slate-700">
          Ordre <span class="font-normal text-slate-400">(laisser vide pour auto)</span>
        </label>
        <input
          id="order"
          v-model.number="order"
          type="number"
          min="1"
          class="mt-1 w-32 rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-2">
        <button
          type="submit"
          :disabled="loading"
          class="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
        </button>
        <RouterLink
          v-if="backToCourseId"
          :to="{ name: 'course-detail', params: { courseId: backToCourseId } }"
          class="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
        >
          Annuler
        </RouterLink>
      </div>
    </form>
  </div>
</template>

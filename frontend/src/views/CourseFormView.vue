<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, ApiError } from '@/lib/api'
import type { CourseDetail } from '@/types/api'

const props = defineProps<{ courseId?: string }>()
const router = useRouter()

const title = ref('')
const description = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const isEdit = computed(() => Boolean(props.courseId))

onMounted(async () => {
  if (!props.courseId) return
  try {
    const course = await api.get<CourseDetail>(`/courses/${props.courseId}`)
    title.value = course.title
    description.value = course.description ?? ''
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de charger le cours'
  }
})

async function handleSubmit() {
  loading.value = true
  error.value = null
  try {
    const payload = { title: title.value, description: description.value || undefined }
    if (props.courseId) {
      await api.patch(`/courses/${props.courseId}`, payload)
      await router.push({ name: 'course-detail', params: { courseId: props.courseId } })
    } else {
      const created = await api.post<{ id: string }>('/courses', payload)
      await router.push({ name: 'course-detail', params: { courseId: created.id } })
    }
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible d'enregistrer le cours"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg">
    <h1 class="mb-6 text-2xl font-semibold text-slate-900">
      {{ isEdit ? 'Modifier le cours' : 'Nouveau cours' }}
    </h1>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div>
        <label for="title" class="block text-sm font-medium text-slate-700">Titre</label>
        <input
          id="title"
          v-model="title"
          type="text"
          required
          minlength="3"
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div>
        <label for="description" class="block text-sm font-medium text-slate-700">Description</label>
        <textarea
          id="description"
          v-model="description"
          rows="4"
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
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
          to="/"
          class="rounded-md border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-100"
        >
          Annuler
        </RouterLink>
      </div>
    </form>
  </div>
</template>

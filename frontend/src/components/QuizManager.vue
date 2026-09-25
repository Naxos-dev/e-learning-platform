<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import QuestionForm from './QuestionForm.vue'
import type { Question, QuestionInput, Quiz } from '@/types/api'

const props = defineProps<{ chapterId: string }>()

const questions = ref<Question[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showAddForm = ref(false)
const editingId = ref<string | null>(null)

async function loadQuiz() {
  loading.value = true
  try {
    const quiz = await api.get<Quiz>(`/chapters/${props.chapterId}/quiz`)
    questions.value = quiz.questions
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      questions.value = []
    } else {
      error.value = err instanceof ApiError ? err.message : 'Impossible de charger le quiz'
    }
  } finally {
    loading.value = false
  }
}

async function handleCreate(payload: QuestionInput) {
  error.value = null
  try {
    await api.post(`/chapters/${props.chapterId}/questions`, payload)
    showAddForm.value = false
    await loadQuiz()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible d'ajouter la question"
  }
}

async function handleUpdate(questionId: string, payload: QuestionInput) {
  error.value = null
  try {
    await api.patch(`/questions/${questionId}`, payload)
    editingId.value = null
    await loadQuiz()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de modifier la question'
  }
}

async function handleDelete(questionId: string) {
  if (!confirm('Supprimer cette question ?')) return
  error.value = null
  try {
    await api.delete(`/questions/${questionId}`)
    await loadQuiz()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de supprimer la question'
  }
}

onMounted(loadQuiz)
</script>

<template>
  <div>
    <h3 class="text-lg font-semibold text-slate-900">Quiz</h3>

    <p v-if="loading" class="mt-2 text-sm text-slate-500">Chargement...</p>
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

    <ul v-if="!loading" class="mt-3 space-y-3">
      <li v-for="question in questions" :key="question.id">
        <QuestionForm
          v-if="editingId === question.id"
          :initial-text="question.text"
          :initial-options="question.options.map((o) => ({ text: o.text, isCorrect: Boolean(o.isCorrect) }))"
          submit-label="Mettre à jour"
          @submit="(payload) => handleUpdate(question.id, payload)"
          @cancel="editingId = null"
        />
        <div v-else class="rounded-md border border-slate-200 bg-white p-4">
          <div class="flex items-start justify-between gap-2">
            <p class="font-medium text-slate-800">{{ question.text }}</p>
            <div class="flex shrink-0 gap-2 text-sm">
              <button type="button" class="text-slate-500 hover:underline" @click="editingId = question.id">
                Modifier
              </button>
              <button type="button" class="text-red-600 hover:underline" @click="handleDelete(question.id)">
                Supprimer
              </button>
            </div>
          </div>
          <ul class="mt-2 space-y-1 text-sm text-slate-600">
            <li v-for="option in question.options" :key="option.id">
              <span :class="option.isCorrect ? 'font-medium text-green-700' : ''">
                {{ option.isCorrect ? '✓' : '·' }} {{ option.text }}
              </span>
            </li>
          </ul>
        </div>
      </li>
    </ul>

    <QuestionForm
      v-if="showAddForm"
      class="mt-3"
      submit-label="Ajouter la question"
      @submit="handleCreate"
      @cancel="showAddForm = false"
    />
    <button
      v-else
      type="button"
      class="mt-3 text-sm font-medium text-slate-900 underline"
      @click="showAddForm = true"
    >
      + Ajouter une question
    </button>
  </div>
</template>

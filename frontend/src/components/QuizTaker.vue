<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import type { Quiz, QuizSubmitResult } from '@/types/api'

const props = defineProps<{ chapterId: string; courseId: string }>()
const emit = defineEmits<{ enrolled: [] }>()

const quiz = ref<Quiz | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const submitting = ref(false)
const result = ref<QuizSubmitResult | null>(null)
const answers = reactive<Record<string, string>>({})
const locked = ref(false)
const enrolling = ref(false)

const allAnswered = computed(
  () => quiz.value !== null && quiz.value.questions.every((q) => Boolean(answers[q.id])),
)

async function loadQuiz() {
  loading.value = true
  locked.value = false
  try {
    quiz.value = await api.get<Quiz>(`/chapters/${props.chapterId}/quiz`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 403) {
      locked.value = true
    } else if (!(err instanceof ApiError && err.status === 404)) {
      error.value = err instanceof ApiError ? err.message : 'Impossible de charger le quiz'
    }
  } finally {
    loading.value = false
  }
}

async function handleEnroll() {
  enrolling.value = true
  error.value = null
  try {
    await api.post(`/courses/${props.courseId}/enroll`)
    emit('enrolled')
    await loadQuiz()
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible de s'inscrire"
  } finally {
    enrolling.value = false
  }
}

async function handleSubmit() {
  if (!quiz.value) return
  error.value = null
  submitting.value = true
  try {
    const payload = {
      answers: quiz.value.questions.map((q) => ({ questionId: q.id, optionId: answers[q.id] })),
    }
    result.value = await api.post<QuizSubmitResult>(`/chapters/${props.chapterId}/quiz/submit`, payload)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Impossible d'envoyer vos réponses"
  } finally {
    submitting.value = false
  }
}

function retake() {
  result.value = null
}

onMounted(loadQuiz)
</script>

<template>
  <div v-if="loading" class="text-sm text-slate-500">Chargement du quiz...</div>

  <div v-else-if="locked" class="rounded-md border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
    <p class="text-sm text-slate-600">🔒 Inscrivez-vous à ce cours pour débloquer le quiz de ce chapitre.</p>
    <button
      type="button"
      :disabled="enrolling"
      class="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      @click="handleEnroll"
    >
      {{ enrolling ? 'Inscription...' : "S'inscrire pour débloquer le quiz" }}
    </button>
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>

  <div v-else-if="quiz && quiz.questions.length > 0">
    <h3 class="text-lg font-semibold text-slate-900">Quiz</h3>

    <div v-if="result" class="mt-3 space-y-4">
      <div class="rounded-md border border-slate-200 bg-slate-50 p-4">
        <p class="text-lg font-semibold" :class="result.score >= 50 ? 'text-green-700' : 'text-red-600'">
          Score : {{ result.score }}% ({{ result.correctCount }}/{{ result.totalQuestions }})
        </p>
        <button type="button" class="mt-2 text-sm text-slate-900 underline" @click="retake">
          Repasser le quiz
        </button>
      </div>

      <ul class="space-y-3">
        <li
          v-for="item in result.results"
          :key="item.questionId"
          class="rounded-md border p-4"
          :class="item.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
        >
          <p class="font-medium text-slate-800">{{ item.questionText }}</p>
          <p class="mt-1 text-sm" :class="item.isCorrect ? 'text-green-700' : 'text-red-700'">
            {{ item.isCorrect ? '✓' : '✗' }} Votre réponse : {{ item.selectedOptionText }}
          </p>
          <p v-if="!item.isCorrect && item.correctOptionText" class="mt-0.5 text-sm text-green-700">
            ✓ Bonne réponse : {{ item.correctOptionText }}
          </p>
        </li>
      </ul>
    </div>

    <form v-else class="mt-3 space-y-4" @submit.prevent="handleSubmit">
      <fieldset v-for="question in quiz.questions" :key="question.id">
        <legend class="font-medium text-slate-800">{{ question.text }}</legend>
        <div class="mt-1 space-y-1">
          <label
            v-for="option in question.options"
            :key="option.id"
            class="flex items-center gap-2 text-sm text-slate-700"
          >
            <input v-model="answers[question.id]" type="radio" :name="question.id" :value="option.id" />
            {{ option.text }}
          </label>
        </div>
      </fieldset>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="!allAnswered || submitting"
        class="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {{ submitting ? 'Envoi...' : 'Valider mes réponses' }}
      </button>
    </form>
  </div>

  <p v-else-if="error" class="text-sm text-red-600">{{ error }}</p>
</template>

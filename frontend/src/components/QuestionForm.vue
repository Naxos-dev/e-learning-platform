<script setup lang="ts">
import { ref, useId } from 'vue'
import type { QuestionInput } from '@/types/api'

const radioGroupName = useId()

const props = withDefaults(
  defineProps<{
    initialText?: string
    initialOptions?: { text: string; isCorrect: boolean }[]
    submitLabel?: string
  }>(),
  {
    initialText: '',
    initialOptions: () => [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
    ],
    submitLabel: 'Enregistrer',
  },
)

const emit = defineEmits<{ submit: [payload: QuestionInput]; cancel: [] }>()

const text = ref(props.initialText)
const options = ref(props.initialOptions.map((o) => ({ ...o })))
const error = ref<string | null>(null)

function addOption() {
  if (options.value.length >= 8) return
  options.value.push({ text: '', isCorrect: false })
}

function removeOption(index: number) {
  if (options.value.length <= 2) return
  options.value.splice(index, 1)
}

function setCorrect(index: number) {
  options.value.forEach((option, i) => {
    option.isCorrect = i === index
  })
}

function handleSubmit() {
  error.value = null

  if (!text.value.trim()) {
    error.value = 'Le texte de la question est requis'
    return
  }
  if (options.value.some((o) => !o.text.trim())) {
    error.value = 'Chaque option doit avoir un texte'
    return
  }
  if (options.value.filter((o) => o.isCorrect).length !== 1) {
    error.value = 'Sélectionnez exactement une bonne réponse'
    return
  }

  emit('submit', { text: text.value.trim(), options: options.value })
}
</script>

<template>
  <form class="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4" @submit.prevent="handleSubmit">
    <div>
      <label class="block text-sm font-medium text-slate-700">Question</label>
      <input
        v-model="text"
        type="text"
        required
        class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
      />
    </div>

    <div class="space-y-2">
      <p class="text-sm font-medium text-slate-700">Options (sélectionnez la bonne réponse)</p>
      <div v-for="(option, index) in options" :key="index" class="flex items-center gap-2">
        <input
          type="radio"
          :name="radioGroupName"
          :checked="option.isCorrect"
          @change="setCorrect(index)"
        />
        <input
          v-model="option.text"
          type="text"
          required
          class="flex-1 rounded-md border border-slate-300 px-3 py-1.5 focus:border-slate-500 focus:outline-none"
        />
        <button
          type="button"
          class="text-slate-400 hover:text-red-600 disabled:opacity-30"
          :disabled="options.length <= 2"
          @click="removeOption(index)"
        >
          ✕
        </button>
      </div>
      <button
        type="button"
        class="text-sm text-slate-600 hover:underline disabled:opacity-30"
        :disabled="options.length >= 8"
        @click="addOption"
      >
        + Ajouter une option
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <div class="flex gap-2">
      <button
        type="submit"
        class="rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-700"
      >
        {{ submitLabel }}
      </button>
      <button
        type="button"
        class="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
        @click="emit('cancel')"
      >
        Annuler
      </button>
    </div>
  </form>
</template>

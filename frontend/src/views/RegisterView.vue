<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.register(email.value, password.value)
    await router.push('/')
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex min-h-[65vh] max-w-sm flex-col justify-center">
    <div class="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
      <h1 class="mb-6 text-2xl font-semibold text-slate-900">Inscription</h1>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-slate-700">Mot de passe</label>
          <input
            id="password"
            v-model="password"
            type="password"
            minlength="8"
            required
            class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
          />
          <p class="mt-1 text-xs text-slate-500">8 caractères minimum</p>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {{ loading ? 'Inscription...' : "S'inscrire" }}
        </button>
      </form>

      <p class="mt-4 text-sm text-slate-600">
        Déjà un compte ?
        <RouterLink to="/login" class="font-medium text-slate-900 underline">Se connecter</RouterLink>
      </p>
    </div>
  </div>
</template>

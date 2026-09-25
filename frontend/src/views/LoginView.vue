<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await router.push(redirect)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Une erreur est survenue'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-sm">
    <h1 class="mb-6 text-2xl font-semibold text-slate-900">Connexion</h1>

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
          required
          class="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {{ loading ? 'Connexion...' : 'Se connecter' }}
      </button>
    </form>

    <p class="mt-4 text-sm text-slate-600">
      Pas encore de compte ?
      <RouterLink to="/register" class="font-medium text-slate-900 underline">S'inscrire</RouterLink>
    </p>
  </div>
</template>

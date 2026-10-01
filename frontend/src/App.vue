<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

function handleLogout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <RouterLink to="/" class="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-5 w-5 shrink-0"
            aria-hidden="true"
          >
            <path
              d="M12 6.5c-1.5-1-4-1.5-6-1.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1c2 0 4.5.5 6 1.5c1.5-1 4-1.5 6-1.5a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1c-2 0-4.5.5-6 1.5Z"
            />
            <path d="M12 6.5V19" />
          </svg>
          LearnFlow
        </RouterLink>

        <div class="flex items-center gap-4 text-sm">
          <RouterLink to="/" class="text-slate-600 hover:text-slate-900">Cours</RouterLink>

          <template v-if="auth.isAuthenticated">
            <RouterLink
              v-if="auth.isApprenant"
              to="/my-progress"
              class="text-slate-600 hover:text-slate-900"
            >
              Ma progression
            </RouterLink>
            <RouterLink
              v-if="auth.isFormateur"
              to="/courses/new"
              class="text-slate-600 hover:text-slate-900"
            >
              Nouveau cours
            </RouterLink>
            <span class="text-slate-400">{{ auth.user?.email }}</span>
            <button
              type="button"
              class="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
              @click="handleLogout"
            >
              Déconnexion
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-slate-600 hover:text-slate-900">Connexion</RouterLink>
            <RouterLink
              to="/register"
              class="rounded-md bg-slate-900 px-3 py-1.5 text-white hover:bg-slate-700"
            >
              Inscription
            </RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

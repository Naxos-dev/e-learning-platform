import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { api, setAuthToken } from '@/lib/api'
import type { AuthResult, User } from '@/types/api'

const STORAGE_KEY = 'elearning.auth'

function loadFromStorage(): { user: User; token: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as { user: User; token: string }) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadFromStorage()
  const user = ref<User | null>(stored?.user ?? null)
  const token = ref<string | null>(stored?.token ?? null)
  setAuthToken(token.value)

  const isAuthenticated = computed(() => token.value !== null)
  const isFormateur = computed(() => user.value?.role === 'FORMATEUR')
  const isApprenant = computed(() => user.value?.role === 'APPRENANT')

  watch([user, token], ([nextUser, nextToken]) => {
    setAuthToken(nextToken)
    if (nextUser && nextToken) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, token: nextToken }))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  })

  async function register(email: string, password: string): Promise<void> {
    const result = await api.post<AuthResult>('/auth/register', { email, password })
    user.value = result.user
    token.value = result.token
  }

  async function login(email: string, password: string): Promise<void> {
    const result = await api.post<AuthResult>('/auth/login', { email, password })
    user.value = result.user
    token.value = result.token
  }

  function logout(): void {
    user.value = null
    token.value = null
  }

  return { user, token, isAuthenticated, isFormateur, isApprenant, register, login, logout }
})

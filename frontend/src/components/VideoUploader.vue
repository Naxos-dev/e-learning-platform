<script setup lang="ts">
import { ref } from 'vue'
import { api, ApiError } from '@/lib/api'
import type { Chapter, PresignedUpload } from '@/types/api'

const props = defineProps<{ chapterId: string; videoUrl: string | null }>()
const emit = defineEmits<{ 'update:videoUrl': [url: string | null] }>()

const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']

const uploading = ref(false)
const progress = ref(0)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

function uploadToS3(url: string, file: File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`Échec de l'upload S3 (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error("Erreur réseau pendant l'upload"))
    xhr.send(file)
  })
}

async function handleFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  error.value = null

  if (!ALLOWED_TYPES.includes(file.type)) {
    error.value = 'Formats acceptés : mp4, webm, mov'
    return
  }

  uploading.value = true
  progress.value = 0
  try {
    const { uploadUrl, videoKey } = await api.post<PresignedUpload>(
      `/chapters/${props.chapterId}/video/presign`,
      { contentType: file.type },
    )
    await uploadToS3(uploadUrl, file, (pct) => {
      progress.value = pct
    })
    const chapter = await api.patch<Chapter>(`/chapters/${props.chapterId}/video`, { videoKey })
    emit('update:videoUrl', chapter.videoUrl)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : "Échec de l'upload"
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function handleDelete() {
  if (!confirm('Supprimer la vidéo de ce chapitre ?')) return
  error.value = null
  try {
    const chapter = await api.delete<Chapter>(`/chapters/${props.chapterId}/video`)
    emit('update:videoUrl', chapter.videoUrl)
  } catch (err) {
    error.value = err instanceof ApiError ? err.message : 'Impossible de supprimer la vidéo'
  }
}
</script>

<template>
  <div>
    <video v-if="videoUrl" :src="videoUrl" controls class="w-full rounded-md bg-black" />

    <div class="mt-2 flex items-center gap-3">
      <label
        class="cursor-pointer rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
      >
        {{ videoUrl ? 'Remplacer la vidéo' : 'Ajouter une vidéo' }}
        <input
          ref="fileInput"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          class="hidden"
          :disabled="uploading"
          @change="handleFileChange"
        />
      </label>
      <button
        v-if="videoUrl"
        type="button"
        class="text-sm text-red-600 hover:underline"
        @click="handleDelete"
      >
        Supprimer
      </button>
    </div>

    <div v-if="uploading" class="mt-2">
      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-full bg-slate-900 transition-all"
          :style="{ width: `${progress}%` }"
        />
      </div>
      <p class="mt-1 text-xs text-slate-500">Envoi en cours... {{ progress }}%</p>
    </div>

    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

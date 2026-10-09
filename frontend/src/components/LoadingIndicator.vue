<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const SLOW_THRESHOLD_MS = 2500

// Sur les tiers gratuits, un premier appel peut traîner (réveil du backend/de la base).
// Au lieu de laisser un "Chargement..." silencieux, on affiche un message explicatif
// une fois ce seuil dépassé, pour que l'attente ne ressemble pas à une page cassée.
// Le composant est monté/démonté via le v-if="loading" de l'appelant : son cycle de vie
// porte directement celui du minuteur, sans watcher ni nettoyage manuel à gérer ailleurs.
const isSlow = ref(false)
let timer: ReturnType<typeof setTimeout>

onMounted(() => {
  timer = setTimeout(() => {
    isSlow.value = true
  }, SLOW_THRESHOLD_MS)
})

onUnmounted(() => {
  clearTimeout(timer)
})
</script>

<template>
  <p class="text-slate-500">
    Chargement...
    <span v-if="isSlow" class="mt-1 block text-xs text-slate-400">
      Le serveur (hébergement gratuit) se réveille, encore quelques secondes...
    </span>
  </p>
</template>

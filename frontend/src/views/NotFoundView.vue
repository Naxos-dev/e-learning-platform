<template>
  <div class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center text-center">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.25"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="h-10 w-10 text-slate-300"
      aria-hidden="true"
    >
      <path
        d="M12 6.5c-1.5-1-4-1.5-6-1.5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1c2 0 4.5.5 6 1.5c1.5-1 4-1.5 6-1.5a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1c-2 0-4.5.5-6 1.5Z"
      />
      <path d="M12 6.5V19" />
    </svg>

    <p class="mt-4 text-5xl font-bold tracking-tight text-slate-300">404</p>
    <h1 class="mt-2 text-xl font-semibold text-slate-900">Page introuvable</h1>
    <p class="mt-2 text-sm text-slate-500">Ce cours ou ce chapitre n'existe pas, ou a été déplacé.</p>

    <RouterLink
      to="/"
      class="mt-6 rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
    >
      Retour à l'accueil
    </RouterLink>
  </div>
</template>

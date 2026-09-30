import type { CourseSeed } from './types.js';

export const nuxtCourse: CourseSeed = {
  title: 'Nuxt.js : SSR avec Vue',
  description:
    'Le framework full-stack basé sur Vue 3 : rendu côté serveur, routing par fichiers, et data fetching optimisé pour le SEO et la performance.',
  authorEmail: 'sarah.leroy@example.com',
  chapters: [
    {
      title: 'Pourquoi le rendu côté serveur (SSR) ?',
      content:
        'Une application Vue classique (SPA) envoie au navigateur une page HTML quasiment vide, puis JavaScript prend le relais pour construire l’interface : le temps entre le premier affichage et une page réellement utilisable peut être significatif, et les moteurs de recherche ou les aperçus de réseaux sociaux qui n’exécutent pas JavaScript ne voient qu’une coquille vide.\n\n' +
        'Le rendu côté serveur (SSR) exécute les composants Vue sur le serveur pour générer le HTML complet de la page avant de l’envoyer au navigateur, qui l’affiche immédiatement puis "hydrate" cette page (attache les écouteurs d’événements JavaScript sur le HTML déjà présent) pour la rendre interactive. Nuxt.js construit précisément ce pipeline SSR par-dessus Vue, avec zéro configuration nécessaire pour démarrer.\n\n' +
        'Nuxt propose aussi des modes hybrides : SSG (Static Site Generation, tout le HTML est pré-généré au build, idéal pour du contenu qui ne change pas souvent) et même du rendu par route (certaines pages en SSR, d’autres en SPA ou statiques), permettant de choisir la stratégie optimale page par page plutôt qu’un choix unique pour toute l’application.',
      quiz: [
        {
          text: 'Quel est le principal problème d’une SPA classique pour le SEO ?',
          options: [
            { text: 'Les moteurs de recherche qui n’exécutent pas JavaScript ne voient qu’une page HTML quasiment vide', isCorrect: true },
            { text: 'Les SPA sont toujours plus lentes qu’un site statique', isCorrect: false },
            { text: 'Le SEO n’a aucun rapport avec le rendu JavaScript', isCorrect: false },
            { text: 'Les SPA ne peuvent pas avoir d’URLs propres', isCorrect: false },
          ],
        },
        {
          text: 'Que signifie "hydratation" dans le contexte du SSR ?',
          options: [
            { text: 'Attacher les écouteurs d’événements JavaScript sur du HTML déjà rendu par le serveur', isCorrect: true },
            { text: 'Compresser le HTML avant envoi', isCorrect: false },
            { text: 'Charger les images en différé', isCorrect: false },
            { text: 'Générer le CSS dynamiquement', isCorrect: false },
          ],
        },
        {
          text: 'Qu’est-ce que le SSG (Static Site Generation) dans Nuxt ?',
          options: [
            { text: 'Le HTML est entièrement pré-généré au moment du build, avant tout déploiement', isCorrect: true },
            { text: 'Le HTML est généré à chaque requête par le serveur', isCorrect: false },
            { text: 'C’est un synonyme exact de SSR', isCorrect: false },
            { text: 'Le rendu se fait uniquement côté client', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Routing par fichiers et structure d’un projet Nuxt',
      content:
        'Contrairement à Vue Router où l’on déclare manuellement chaque route dans un fichier de configuration, Nuxt génère automatiquement le routing à partir de la structure du dossier pages/ : pages/index.vue devient la route /, pages/courses/[id].vue devient la route dynamique /courses/:id, sans aucune déclaration explicite à maintenir.\n\n' +
        'Le dossier components/ contient les composants auto-importés (utilisables dans n’importe quelle page sans écrire d’import manuel), composables/ les fonctions réutilisables basées sur la Composition API, et server/api/ permet d’écrire des endpoints backend directement dans le projet Nuxt, exécutés côté serveur uniquement — un vrai backend léger intégré, utile pour proxifier des appels ou exposer une petite API sans service séparé.\n\n' +
        'app.vue (ou layouts/default.vue) définit la structure commune à toutes les pages (navigation, pied de page), et le fichier nuxt.config.ts centralise la configuration du projet : modules activés, variables d’environnement publiques, métadonnées SEO par défaut.',
      quiz: [
        {
          text: 'Comment Nuxt détermine-t-il les routes d’une application ?',
          options: [
            { text: 'Automatiquement, à partir de la structure du dossier pages/', isCorrect: true },
            { text: 'Il faut les déclarer manuellement comme avec Vue Router', isCorrect: false },
            { text: 'Toutes les pages partagent la même route', isCorrect: false },
            { text: 'Via un fichier routes.json séparé', isCorrect: false },
          ],
        },
        {
          text: 'Que permet le dossier server/api/ dans un projet Nuxt ?',
          options: [
            { text: 'Écrire des endpoints backend exécutés côté serveur, directement dans le projet', isCorrect: true },
            { text: 'Stocker des fichiers statiques uniquement', isCorrect: false },
            { text: 'Définir des tests end-to-end', isCorrect: false },
            { text: 'Configurer uniquement la base de données', isCorrect: false },
          ],
        },
        {
          text: 'Quel fichier définit la structure commune (navigation, pied de page) partagée par toutes les pages ?',
          options: [
            { text: 'app.vue ou layouts/default.vue', isCorrect: true },
            { text: 'nuxt.config.ts', isCorrect: false },
            { text: 'package.json', isCorrect: false },
            { text: 'pages/index.vue uniquement', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Data fetching avec useFetch et useAsyncData',
      content:
        'Nuxt fournit des composables dédiés pour récupérer des données de façon compatible SSR : useFetch(\'/api/courses\') exécute la requête côté serveur pendant le rendu initial, sérialise le résultat dans le HTML envoyé au client, puis le réutilise directement lors de l’hydratation — évitant ainsi de refaire inutilement le même appel réseau une seconde fois côté navigateur.\n\n' +
        'useAsyncData offre plus de contrôle : on lui passe une clé unique et une fonction asynchrone arbitraire (pas uniquement un fetch), utile pour combiner plusieurs sources de données ou appliquer une transformation avant de retourner le résultat au composant. Les deux composables exposent le même type d’état réactif : data, pending, error, refresh.\n\n' +
        'Une erreur fréquente chez les débutants est d’utiliser fetch() natif ou axios directement dans onMounted() comme dans une SPA classique : ce code ne s’exécute qu’après l’hydratation côté client, perdant tout le bénéfice du SSR pour cette donnée (l’utilisateur verrait d’abord un état de chargement vide, alors que useFetch aurait pu livrer la donnée déjà présente dans le HTML initial).',
      quiz: [
        {
          text: 'Quel est l’avantage de useFetch par rapport à un fetch() classique dans onMounted() ?',
          options: [
            {
              text: 'Il s’exécute côté serveur pendant le SSR et évite de refaire l’appel réseau côté client à l’hydratation',
              isCorrect: true,
            },
            { text: 'Il est simplement plus court à écrire', isCorrect: false },
            { text: 'Il fonctionne uniquement en mode développement', isCorrect: false },
            { text: 'Il remplace complètement le besoin d’une API', isCorrect: false },
          ],
        },
        {
          text: 'Quand préfère-t-on useAsyncData à useFetch ?',
          options: [
            {
              text: 'Quand on a besoin de combiner plusieurs sources de données ou d’une logique arbitraire, pas juste un appel HTTP simple',
              isCorrect: true,
            },
            { text: 'useAsyncData est toujours strictement supérieur, il faut l’utiliser systématiquement', isCorrect: false },
            { text: 'useFetch est déprécié', isCorrect: false },
            { text: 'Il n’y a aucune différence entre les deux', isCorrect: false },
          ],
        },
        {
          text: 'Quel est le risque d’utiliser fetch() dans onMounted() pour une donnée affichée immédiatement ?',
          options: [
            {
              text: 'Perdre le bénéfice du SSR : l’utilisateur voit un état de chargement vide au lieu de la donnée déjà présente dans le HTML initial',
              isCorrect: true,
            },
            { text: 'Le code ne compile pas', isCorrect: false },
            { text: 'Ça fonctionne exactement comme useFetch, sans différence', isCorrect: false },
            { text: 'Ça désactive le routing par fichiers', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

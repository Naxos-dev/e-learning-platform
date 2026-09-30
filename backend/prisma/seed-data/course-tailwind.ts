import type { CourseSeed } from './types.js';

export const tailwindCourse: CourseSeed = {
  title: 'Tailwind CSS : construire des interfaces rapidement',
  description:
    'Le framework CSS utility-first : classes utilitaires, responsive design, dark mode et personnalisation du design system.',
  authorEmail: 'sarah.leroy@example.com',
  chapters: [
    {
      title: 'Philosophie utility-first',
      content:
        'Contrairement à un framework CSS traditionnel (Bootstrap) qui fournit des composants préconstruits, Tailwind expose des classes utilitaires atomiques, chacune ciblant une seule propriété CSS : flex, pt-4, text-center, bg-slate-900. On compose l’interface directement dans le HTML/JSX en combinant ces classes, sans écrire de CSS personnalisé pour la majorité des besoins.\n\n' +
        'Cette approche évite le problème classique du CSS qui grossit indéfiniment au fil du projet (des classes génériques réutilisées de façons imprévues, des surcharges en cascade difficiles à tracer) : les styles restent colocalisés avec le markup, donc visibles et modifiables directement là où ils sont utilisés, sans naviguer entre plusieurs fichiers.\n\n' +
        'Tailwind scanne le code source au build et ne génère que le CSS effectivement utilisé (via son moteur JIT), ce qui garde le bundle final très léger même avec des milliers de classes disponibles en théorie. C’est ce mécanisme qui permet d’avoir accès à toute la palette de couleurs, d’espacements et de tailles sans jamais payer le coût en poids de fichier pour ce qui n’est pas utilisé.',
      quiz: [
        {
          text: 'Quelle est la différence principale entre Tailwind et un framework comme Bootstrap ?',
          options: [
            { text: 'Tailwind fournit des classes utilitaires atomiques à composer, plutôt que des composants préconstruits', isCorrect: true },
            { text: 'Tailwind ne fonctionne qu’avec React', isCorrect: false },
            { text: 'Bootstrap est plus récent que Tailwind', isCorrect: false },
            { text: 'Il n’y a aucune différence, ce sont des synonymes', isCorrect: false },
          ],
        },
        {
          text: 'Quel est l’avantage de garder les styles directement dans le markup (classes utilitaires) ?',
          options: [
            { text: 'Les styles restent visibles et modifiables directement là où ils sont utilisés, sans CSS séparé à tracer', isCorrect: true },
            { text: 'Le HTML devient plus court', isCorrect: false },
            { text: 'Ça supprime le besoin de responsive design', isCorrect: false },
            { text: 'Ça améliore automatiquement les performances serveur', isCorrect: false },
          ],
        },
        {
          text: 'Comment Tailwind garde-t-il le CSS final léger malgré des milliers de classes disponibles ?',
          options: [
            { text: 'Il scanne le code source et ne génère que les classes effectivement utilisées (JIT)', isCorrect: true },
            { text: 'Il compresse le CSS avec gzip uniquement', isCorrect: false },
            { text: 'Il charge les classes à la demande via JavaScript', isCorrect: false },
            { text: 'Il limite le nombre de classes utilisables par projet', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Responsive design et états interactifs',
      content:
        'Tailwind utilise une approche mobile-first : une classe sans préfixe s’applique à toutes les tailles d’écran, et les préfixes de breakpoint (sm:, md:, lg:, xl:) surchargent le style à partir de cette taille d’écran vers le haut. class="text-sm md:text-base lg:text-lg" affiche donc un texte progressivement plus grand à mesure que l’écran s’agrandit.\n\n' +
        'Les variantes d’état suivent la même logique de préfixe : hover:bg-blue-600, focus:ring-2, disabled:opacity-50 appliquent un style uniquement dans cet état, sans écrire de pseudo-classe CSS séparée. Ces préfixes se combinent entre eux (md:hover:underline) pour cibler des situations précises.\n\n' +
        'Le dark mode fonctionne sur le même principe avec le préfixe dark:, activé soit automatiquement selon les préférences système de l’utilisateur, soit manuellement via une classe sur l’élément racine (class="dark" sur <html>), ce qui permet à l’utilisateur de choisir explicitement son thème plutôt que de subir uniquement la préférence système.',
      quiz: [
        {
          text: 'Quelle approche responsive utilise Tailwind par défaut ?',
          options: [
            {
              text: 'Mobile-first : les classes sans préfixe s’appliquent partout, les préfixes (md:, lg:...) surchargent à partir de cette taille',
              isCorrect: true,
            },
            { text: 'Desktop-first : il faut surcharger pour le mobile', isCorrect: false },
            { text: 'Tailwind ne supporte pas le responsive nativement', isCorrect: false },
            { text: 'Il faut écrire des media queries CSS séparément', isCorrect: false },
          ],
        },
        {
          text: 'Que fait la classe hover:bg-blue-600 ?',
          options: [
            { text: 'Applique un fond bleu uniquement quand l’élément est survolé par la souris', isCorrect: true },
            { text: 'Applique un fond bleu en permanence', isCorrect: false },
            { text: 'Désactive le survol de l’élément', isCorrect: false },
            { text: 'S’applique uniquement sur mobile', isCorrect: false },
          ],
        },
        {
          text: 'Comment activer le dark mode manuellement (indépendamment des préférences système) ?',
          options: [
            { text: 'En ajoutant la classe dark sur un élément racine comme <html>', isCorrect: true },
            { text: 'En installant un plugin externe obligatoire', isCorrect: false },
            { text: 'Ce n’est pas possible avec Tailwind', isCorrect: false },
            { text: 'En renommant toutes les classes de couleur', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Personnaliser le design system',
      content:
        'Plutôt que d’utiliser les valeurs par défaut de Tailwind, on personnalise généralement la palette (couleurs de marque), les espacements ou la typographie du projet dans la configuration (tailwind.config.js en v3, ou directement en CSS via @theme en v4), pour que ces valeurs deviennent les nouvelles classes utilitaires disponibles partout dans le projet.\n\n' +
        'Quand une combinaison de classes utilitaires se répète beaucoup (un bouton avec 8 classes identiques réutilisé 50 fois), plutôt que de dupliquer la liste partout, on peut soit extraire un composant (la bonne pratique dans un framework comme Vue ou React), soit définir une classe personnalisée avec @apply pour regrouper ces utilitaires sous un seul nom réutilisable en CSS.\n\n' +
        'Les design tokens (couleurs, espacements, rayons de bordure) définis une seule fois dans la configuration garantissent une cohérence visuelle sur tout le projet : changer la couleur primaire de la marque à un seul endroit propage le changement partout où elle est utilisée, sans chercher-remplacer dans des dizaines de fichiers.',
      quiz: [
        {
          text: 'Où personnalise-t-on la palette de couleurs ou les espacements d’un projet Tailwind ?',
          options: [
            { text: 'Dans la configuration du projet (tailwind.config.js, ou @theme en v4)', isCorrect: true },
            { text: 'Directement dans chaque composant individuellement', isCorrect: false },
            { text: 'Ce n’est pas personnalisable', isCorrect: false },
            { text: 'Uniquement via un plugin payant', isCorrect: false },
          ],
        },
        {
          text: 'Quel est l’intérêt de centraliser les design tokens (couleurs, espacements) dans la config ?',
          options: [
            { text: 'Garantir la cohérence visuelle et pouvoir changer une valeur partout à la fois depuis un seul endroit', isCorrect: true },
            { text: 'Réduire la taille du fichier HTML', isCorrect: false },
            { text: 'Accélérer le rendu JavaScript', isCorrect: false },
            { text: 'Remplacer le besoin de responsive design', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

import type { CourseSeed } from './types.js';

export const gitCourse: CourseSeed = {
  title: 'Git & collaboration en équipe',
  description:
    'Maîtriser Git au-delà des commandes de base : branches, résolution de conflits, workflow d’équipe et bonnes pratiques de code review.',
  authorEmail: 'sarah.leroy@example.com',
  chapters: [
    {
      title: 'Branches, merge et rebase',
      content:
        'Une branche Git est simplement un pointeur mobile vers un commit ; créer une branche (git branch feature-x ou git checkout -b feature-x) est donc une opération quasi instantanée, ce qui encourage à en créer une par fonctionnalité ou correctif plutôt que de tout développer sur main.\n\n' +
        'git merge intègre les changements d’une branche dans une autre en créant un commit de fusion (merge commit) qui a deux parents, préservant l’historique complet tel qu’il s’est déroulé. git rebase réécrit l’historique en rejouant les commits d’une branche par-dessus une autre, produisant un historique linéaire plus lisible, mais modifiant les hash de commits existants.\n\n' +
        'Règle d’or : ne jamais rebaser une branche déjà partagée/publiée (poussée et utilisée par d’autres), car réécrire l’historique casse la synchronisation pour quiconque a déjà basé du travail dessus. Le rebase est idéal en local, sur sa propre branche de feature, avant de la pousser ou avant une pull request, pour nettoyer l’historique.',
      quiz: [
        {
          text: 'Qu’est-ce qu’une branche Git, techniquement ?',
          options: [
            { text: 'Un pointeur mobile vers un commit', isCorrect: true },
            { text: 'Une copie complète de tous les fichiers du dépôt', isCorrect: false },
            { text: 'Un dossier séparé sur le disque', isCorrect: false },
            { text: 'Un tag immuable', isCorrect: false },
          ],
        },
        {
          text: 'Quelle est la différence principale entre merge et rebase ?',
          options: [
            {
              text: 'merge crée un commit de fusion et préserve l’historique ; rebase réécrit l’historique en rejouant les commits',
              isCorrect: true,
            },
            { text: 'merge et rebase font exactement la même chose', isCorrect: false },
            { text: 'rebase ne fonctionne qu’avec GitHub', isCorrect: false },
            { text: 'merge supprime la branche source automatiquement', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi évite-t-on de rebaser une branche déjà partagée avec l’équipe ?',
          options: [
            {
              text: 'Ça réécrit l’historique et casse la synchronisation pour les autres qui ont déjà basé du travail dessus',
              isCorrect: true,
            },
            { text: 'Le rebase est toujours plus lent que le merge', isCorrect: false },
            { text: 'Git l’interdit techniquement', isCorrect: false },
            { text: 'Ça supprime les fichiers non commités', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Résoudre les conflits de fusion',
      content:
        'Un conflit survient quand Git ne peut pas fusionner automatiquement deux versions d’une même zone d’un fichier, généralement parce que les deux branches l’ont modifiée différemment. Git marque le fichier avec des balises <<<<<<<, ======= et >>>>>>> délimitant les deux versions concurrentes, et met la fusion en pause en attendant une résolution manuelle.\n\n' +
        'Résoudre un conflit consiste à éditer le fichier pour ne garder que la version voulue (ou une combinaison des deux), supprimer les balises de conflit, puis git add le fichier résolu et terminer avec git commit (pour un merge) ou git rebase --continue (pour un rebase). git status liste à tout moment les fichiers encore en conflit.\n\n' +
        'Pour limiter les conflits en équipe : intégrer fréquemment les changements de main dans sa branche (plutôt que de laisser diverger longtemps), découper le travail en petites pull requests ciblées, et communiquer quand plusieurs personnes touchent la même zone d’un fichier critique.',
      quiz: [
        {
          text: 'Que représentent les balises <<<<<<< / ======= / >>>>>>> dans un fichier en conflit ?',
          options: [
            { text: 'Les deux versions concurrentes du même passage de code, à choisir ou fusionner manuellement', isCorrect: true },
            { text: 'Une erreur de syntaxe à corriger', isCorrect: false },
            { text: 'Des commentaires générés automatiquement par Git', isCorrect: false },
            { text: 'La liste des fichiers modifiés', isCorrect: false },
          ],
        },
        {
          text: 'Après avoir résolu un conflit manuellement, quelle est la suite des étapes pour un merge ?',
          options: [
            { text: 'git add sur le(s) fichier(s) résolu(s), puis git commit', isCorrect: true },
            { text: 'git push directement, sans autre étape', isCorrect: false },
            { text: 'git reset --hard pour tout annuler', isCorrect: false },
            { text: 'Rien, Git termine automatiquement', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Pull requests et code review efficaces',
      content:
        'Une pull request (ou merge request) propose d’intégrer les changements d’une branche dans une autre, et sert de point de passage obligé pour la revue de code avant fusion. Une bonne pull request reste petite et ciblée sur un seul sujet : plus elle est large, plus elle est difficile et longue à relire correctement, ce qui augmente le risque de laisser passer des bugs.\n\n' +
        'Un message de pull request efficace explique le "pourquoi" du changement (le contexte, le problème résolu), pas seulement le "quoi" (que le diff montre déjà). Lier la pull request à un ticket/issue et inclure les étapes de test manuel facilite grandement le travail du relecteur.\n\n' +
        'Côté relecteur, une bonne review distingue les remarques bloquantes (bug, faille de sécurité, régression) des suggestions optionnelles (style, préférence personnelle) — souvent préfixées "nit:" pour signaler qu’elles ne bloquent pas la fusion. L’objectif d’une review n’est pas de trouver des fautes, mais de partager la connaissance du code et de garantir sa qualité collectivement.',
      quiz: [
        {
          text: 'Pourquoi préfère-t-on des pull requests petites et ciblées ?',
          options: [
            { text: 'Elles sont plus rapides et plus fiables à relire, réduisant le risque de laisser passer des bugs', isCorrect: true },
            { text: 'GitHub les traite plus vite', isCorrect: false },
            { text: 'Elles ne nécessitent pas de tests', isCorrect: false },
            { text: 'Elles se fusionnent automatiquement', isCorrect: false },
          ],
        },
        {
          text: 'Qu’est-ce qu’une bonne description de pull request devrait expliquer en priorité ?',
          options: [
            { text: 'Le pourquoi du changement (contexte, problème résolu), pas seulement le quoi', isCorrect: true },
            { text: 'La liste exhaustive de tous les fichiers modifiés', isCorrect: false },
            { text: 'Le nom de l’auteur', isCorrect: false },
            { text: 'La date de création de la branche', isCorrect: false },
          ],
        },
        {
          text: 'Que signifie généralement le préfixe "nit:" dans un commentaire de review ?',
          options: [
            { text: 'Une suggestion mineure, non bloquante pour la fusion', isCorrect: true },
            { text: 'Une faille de sécurité critique', isCorrect: false },
            { text: 'Une erreur de compilation', isCorrect: false },
            { text: 'Une demande de fusion immédiate', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

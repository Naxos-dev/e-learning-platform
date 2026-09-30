import type { CourseSeed } from './types.js';

export const cicdCourse: CourseSeed = {
  title: 'Déploiement & CI/CD (Vercel, Railway, Render)',
  description:
    'Automatiser les tests et le déploiement : intégration continue avec GitHub Actions, déploiement sur Vercel/Render, variables d’environnement.',
  authorEmail: 'marie.dev@example.com',
  chapters: [
    {
      title: 'Intégration continue avec GitHub Actions',
      content:
        'L’intégration continue (CI) consiste à exécuter automatiquement une suite de vérifications (tests, lint, build) à chaque push ou pull request, pour détecter les régressions avant qu’elles n’atteignent la branche principale. GitHub Actions définit ces workflows dans des fichiers YAML sous .github/workflows/, déclenchés par des événements (on: push, on: pull_request).\n\n' +
        'Un workflow est composé de jobs, eux-mêmes composés d’étapes (steps) exécutées séquentiellement sur une machine virtuelle éphémère : installer les dépendances, lancer les tests, construire l’application. Chaque job peut s’exécuter sur un environnement différent (matrice de versions de Node.js, par exemple), et des jobs indépendants tournent en parallèle par défaut pour accélérer le pipeline.\n\n' +
        'Une pull request avec un check CI en échec (rouge) est un signal fort pour ne pas fusionner tant que le problème n’est pas corrigé ; on peut d’ailleurs configurer une règle de protection de branche sur GitHub pour rendre ce check obligatoire, empêchant techniquement la fusion tant qu’il n’est pas vert.',
      quiz: [
        {
          text: 'Où définit-on les workflows GitHub Actions dans un dépôt ?',
          options: [
            { text: 'Dans des fichiers YAML sous .github/workflows/', isCorrect: true },
            { text: 'Dans le package.json uniquement', isCorrect: false },
            { text: 'Dans un fichier .ci séparé à la racine', isCorrect: false },
            { text: 'GitHub Actions ne nécessite aucune configuration', isCorrect: false },
          ],
        },
        {
          text: 'Que permet une règle de protection de branche liée à un check CI ?',
          options: [
            { text: 'Empêcher techniquement la fusion d’une pull request tant que le check n’est pas passé', isCorrect: true },
            { text: 'Supprimer automatiquement les branches obsolètes', isCorrect: false },
            { text: 'Accélérer l’exécution des tests', isCorrect: false },
            { text: 'Chiffrer le code source', isCorrect: false },
          ],
        },
        {
          text: 'Par défaut, comment s’exécutent des jobs indépendants dans un même workflow ?',
          options: [
            { text: 'En parallèle, pour accélérer le pipeline', isCorrect: true },
            { text: 'Toujours séquentiellement', isCorrect: false },
            { text: 'Un seul job peut exister par workflow', isCorrect: false },
            { text: 'Ils s’exécutent uniquement la nuit', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Déployer automatiquement sur push',
      content:
        'Des plateformes comme Vercel ou Render s’intègrent directement à GitHub : chaque push sur la branche principale déclenche automatiquement un nouveau build et déploiement, sans configuration CI manuelle. Vercel va plus loin en générant un déploiement de prévisualisation unique pour chaque pull request, permettant de tester visuellement les changements avant de les fusionner.\n\n' +
        'Pour un monorepo (frontend et backend dans le même dépôt), chaque plateforme doit être configurée avec un "Root Directory" pointant vers le bon sous-dossier, pour qu’elle sache où se trouve le code à builder et quelles commandes exécuter, indépendamment du reste du dépôt.\n\n' +
        'Un déploiement zero-downtime bascule le trafic vers la nouvelle version seulement une fois qu’elle a démarré avec succès (souvent vérifié via un health check HTTP), en gardant l’ancienne version active jusque-là — ce qui évite toute coupure de service perceptible pour les utilisateurs pendant la mise à jour.',
      quiz: [
        {
          text: 'Que génère Vercel automatiquement pour chaque pull request ?',
          options: [
            { text: 'Un déploiement de prévisualisation unique, accessible via une URL dédiée', isCorrect: true },
            { text: 'Une nouvelle base de données', isCorrect: false },
            { text: 'Un nouveau compte utilisateur', isCorrect: false },
            { text: 'Rien, il faut le configurer manuellement', isCorrect: false },
          ],
        },
        {
          text: 'Dans un monorepo, à quoi sert le paramètre "Root Directory" sur Render/Vercel ?',
          options: [
            { text: 'Indiquer à la plateforme quel sous-dossier builder et déployer', isCorrect: true },
            { text: 'Définir le mot de passe de la base de données', isCorrect: false },
            { text: 'Choisir la région du serveur', isCorrect: false },
            { text: 'Activer le mode debug', isCorrect: false },
          ],
        },
        {
          text: 'Qu’est-ce qu’un health check dans le contexte d’un déploiement zero-downtime ?',
          options: [
            {
              text: 'Une route HTTP vérifiée pour confirmer que la nouvelle version a démarré avec succès avant de basculer le trafic',
              isCorrect: true,
            },
            { text: 'Un test unitaire exécuté après le déploiement', isCorrect: false },
            { text: 'Une alerte envoyée par email', isCorrect: false },
            { text: 'Un outil de monitoring payant', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Variables d’environnement et secrets',
      content:
        'Les variables d’environnement séparent la configuration du code : URL de base de données, clés d’API, secrets JWT changent entre développement, test et production sans jamais toucher au code source. Elles ne doivent jamais être committées dans le dépôt Git — un fichier .env local reste dans .gitignore, seul un .env.example documentant les clés attendues (sans valeurs réelles) est versionné.\n\n' +
        'Chaque plateforme de déploiement (Render, Vercel, Railway) fournit une interface dédiée pour définir ces variables de façon chiffrée, injectées dans l’environnement d’exécution au démarrage du service. Valider leur présence et leur format au démarrage de l’application (par exemple avec un schéma Zod) permet de faire échouer le déploiement immédiatement avec un message clair plutôt que de laisser l’application planter de façon confuse plus tard.\n\n' +
        'Un secret qui a fuité (committé par erreur, exposé dans des logs) doit être considéré comme compromis immédiatement : le rotater (en générer un nouveau et invalider l’ancien) est la seule réponse fiable, réécrire l’historique Git ne suffit pas puisque le secret a déjà pu être vu ou indexé.',
      quiz: [
        {
          text: 'Où doit-on définir les variables d’environnement pour un déploiement en production ?',
          options: [
            {
              text: 'Dans l’interface dédiée de la plateforme d’hébergement (Render, Vercel...), jamais committées dans le code',
              isCorrect: true,
            },
            { text: 'Directement dans le fichier server.ts', isCorrect: false },
            { text: 'Dans un fichier .env poussé sur GitHub', isCorrect: false },
            { text: 'Dans les commentaires du code', isCorrect: false },
          ],
        },
        {
          text: 'Que doit contenir un fichier .env.example versionné ?',
          options: [
            { text: 'La liste des clés attendues, sans les valeurs réelles/secrètes', isCorrect: true },
            { text: 'Les vraies valeurs de production', isCorrect: false },
            { text: 'Rien, il ne doit jamais exister', isCorrect: false },
            { text: 'Le mot de passe de l’administrateur', isCorrect: false },
          ],
        },
        {
          text: 'Que faire si un secret (clé API, JWT_SECRET) a été committé par erreur puis poussé sur GitHub ?',
          options: [
            { text: 'Le considérer comme compromis et le rotater immédiatement (en générer un nouveau)', isCorrect: true },
            { text: 'Simplement le supprimer du dernier commit', isCorrect: false },
            { text: 'Rien, tant que le dépôt est privé', isCorrect: false },
            { text: 'Attendre l’expiration naturelle du token', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

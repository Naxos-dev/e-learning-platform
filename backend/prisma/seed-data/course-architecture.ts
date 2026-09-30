import type { CourseSeed } from './types.js';

export const architectureCourse: CourseSeed = {
  title: 'Architecture backend : bonnes pratiques (MVC, services, couches)',
  description:
    'Structurer une API pour qu’elle reste maintenable : séparation des responsabilités, couche services, gestion des erreurs et principes SOLID.',
  authorEmail: 'marie.dev@example.com',
  chapters: [
    {
      title: 'Séparer les responsabilités : routes, contrôleurs, services',
      content:
        'Une architecture en couches sépare clairement les responsabilités : les routes déclarent uniquement le mapping URL/méthode HTTP vers une fonction, les contrôleurs valident la requête entrante et formatent la réponse, et les services contiennent la logique métier réelle (calculs, règles, accès aux données via l’ORM). Cette séparation rend chaque couche testable et remplaçable indépendamment des autres.\n\n' +
        'Un piège fréquent est de tout mélanger dans le contrôleur : validation, logique métier ET accès direct à la base de données dans la même fonction. Ça fonctionne au début, mais devient vite difficile à tester (il faut mocker Express au complet pour tester la moindre règle métier) et à réutiliser (la même logique ne peut pas être appelée depuis un script CLI ou un job planifié sans dupliquer du code).\n\n' +
        'En extrayant la logique dans des services (des fonctions pures, indépendantes d’Express), on peut les tester directement sans monter un serveur HTTP, les réutiliser dans plusieurs contrôleurs, ou même les appeler depuis un script de seed ou une tâche cron — exactement le pattern utilisé dans ce projet, où chaque contrôleur ne fait qu’appeler une fonction du service correspondant.',
      quiz: [
        {
          text: 'Quelle est la responsabilité d’un contrôleur dans une architecture routes/contrôleurs/services ?',
          options: [
            { text: 'Valider la requête entrante et formater la réponse, sans contenir la logique métier', isCorrect: true },
            { text: 'Définir le schéma de la base de données', isCorrect: false },
            { text: 'Gérer directement les connexions TCP', isCorrect: false },
            { text: 'Remplacer le besoin de services', isCorrect: false },
          ],
        },
        {
          text: 'Quel est l’inconvénient principal de mettre toute la logique métier directement dans le contrôleur ?',
          options: [
            {
              text: 'Ça devient difficile à tester isolément et impossible à réutiliser en dehors d’Express sans dupliquer le code',
              isCorrect: true,
            },
            { text: 'Le code s’exécute plus lentement', isCorrect: false },
            { text: 'Express ne le permet techniquement pas', isCorrect: false },
            { text: 'Ça améliore la sécurité par défaut', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi extraire la logique métier dans des services indépendants d’Express ?',
          options: [
            {
              text: 'Pour pouvoir les tester et les réutiliser (CLI, cron, autre contrôleur) sans dépendre du framework HTTP',
              isCorrect: true,
            },
            { text: 'Parce qu’Express l’exige techniquement', isCorrect: false },
            { text: 'Pour réduire le nombre de fichiers du projet', isCorrect: false },
            { text: 'Ça n’apporte aucun bénéfice concret', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Gestion centralisée des erreurs',
      content:
        'Plutôt que de dupliquer des try/catch avec des réponses HTTP formatées à la main dans chaque contrôleur, on définit une classe d’erreur métier personnalisée (par exemple AppError avec un statusCode et un message) que n’importe quelle couche peut lever, et un middleware d’erreur Express unique qui l’intercepte pour formater une réponse JSON cohérente sur toute l’API.\n\n' +
        'Express reconnaît un middleware de gestion d’erreurs à sa signature à quatre paramètres (err, req, res, next), placé en dernier dans la chaîne de middlewares. Depuis Express 5, une exception levée dans une fonction async (ou une promesse rejetée) est automatiquement transmise à ce middleware, sans avoir besoin d’un try/catch explicite dans chaque contrôleur pour la propager avec next(err).\n\n' +
        'Cette centralisation garantit une cohérence : toutes les erreurs métier renvoient le même format de réponse JSON, les erreurs inattendues (bugs) sont loguées de façon uniforme côté serveur, et le message exposé au client peut être différent en développement (détaillé, utile au debug) et en production (générique, pour ne pas exposer de détails d’implémentation sensibles).',
      quiz: [
        {
          text: 'À quoi sert une classe d’erreur personnalisée comme AppError dans une API ?',
          options: [
            { text: 'Représenter une erreur métier avec un statusCode et un message, interceptée de façon centralisée', isCorrect: true },
            { text: 'Remplacer complètement le besoin de validation des entrées', isCorrect: false },
            { text: 'Chiffrer les réponses HTTP', isCorrect: false },
            { text: 'Accélérer les requêtes à la base de données', isCorrect: false },
          ],
        },
        {
          text: 'À quoi reconnaît-on un middleware de gestion d’erreurs dans Express ?',
          options: [
            { text: 'À sa signature à quatre paramètres (err, req, res, next)', isCorrect: true },
            { text: 'Il doit obligatoirement s’appeler errorHandler', isCorrect: false },
            { text: 'Il doit être le premier middleware déclaré', isCorrect: false },
            { text: 'Il ne peut y en avoir qu’un par route', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi afficher un message d’erreur différent en développement et en production ?',
          options: [
            {
              text: 'Pour donner des détails utiles au debug en dev, sans exposer de détails d’implémentation sensibles en production',
              isCorrect: true,
            },
            { text: 'Express l’exige techniquement', isCorrect: false },
            { text: 'Pour réduire la taille de la réponse HTTP', isCorrect: false },
            { text: 'Ça n’a aucune importance en pratique', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Principes SOLID appliqués à une API',
      content:
        'Le "S" de SOLID (Single Responsibility) recommande qu’un module n’ait qu’une seule raison de changer : un service course.service.ts qui gère à la fois les cours ET l’envoi d’emails de notification devra être modifié pour des raisons totalement différentes, signe qu’il devrait être scindé en deux modules distincts.\n\n' +
        'Le "D" (Dependency Inversion) recommande de dépendre d’abstractions plutôt que d’implémentations concrètes : un service qui a besoin d’envoyer un email devrait dépendre d’une interface EmailSender plutôt que directement du SDK d’un fournisseur précis (SendGrid, AWS SES). Ça permet de remplacer l’implémentation, ou de la mocker dans les tests, sans toucher au code qui l’utilise.\n\n' +
        'Ces principes ne sont pas des règles absolues à appliquer partout dès le premier jour : sur un petit projet, une architecture volontairement plus simple reste souvent le bon choix (over-engineering un projet de 3 routes avec des abstractions inutiles est aussi un piège). Ils deviennent surtout précieux à mesure qu’un projet grandit en complexité et en nombre de contributeurs, quand le coût du changement dépasse le coût de l’abstraction.',
      quiz: [
        {
          text: 'Que recommande le principe de responsabilité unique (le "S" de SOLID) ?',
          options: [
            { text: 'Qu’un module n’ait qu’une seule raison de changer', isCorrect: true },
            { text: 'Qu’un module gère le plus de fonctionnalités possible', isCorrect: false },
            { text: 'D’utiliser uniquement une seule classe par projet', isCorrect: false },
            { text: 'De ne jamais découper le code en plusieurs fichiers', isCorrect: false },
          ],
        },
        {
          text: 'Que recommande l’inversion de dépendance ("D" de SOLID) ?',
          options: [
            { text: 'Dépendre d’abstractions (interfaces) plutôt que d’implémentations concrètes précises', isCorrect: true },
            { text: 'Toujours utiliser la dernière version d’une bibliothèque', isCorrect: false },
            { text: 'Éviter complètement les dépendances externes', isCorrect: false },
            { text: 'Dupliquer le code plutôt que de créer une dépendance', isCorrect: false },
          ],
        },
        {
          text: 'Quel est le risque d’appliquer SOLID de façon systématique sur un très petit projet ?',
          options: [
            { text: 'Sur-ingénierer avec des abstractions inutiles alors qu’une solution simple suffirait', isCorrect: true },
            { text: 'Le code ne compile plus', isCorrect: false },
            { text: 'SOLID ne s’applique qu’aux gros projets, jamais aux petits', isCorrect: false },
            { text: 'Ça rend le code plus lent à l’exécution', isCorrect: false },
          ],
        },
        {
          text: 'Quand les principes SOLID deviennent-ils particulièrement précieux ?',
          options: [
            { text: 'Quand un projet grandit en complexité et en nombre de contributeurs', isCorrect: true },
            { text: 'Uniquement lors du tout premier jour d’un projet', isCorrect: false },
            { text: 'Jamais, ce sont des principes purement théoriques', isCorrect: false },
            { text: 'Uniquement pour les projets sans base de données', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

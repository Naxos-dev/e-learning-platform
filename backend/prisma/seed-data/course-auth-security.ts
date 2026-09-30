import type { CourseSeed } from './types.js';

export const authSecurityCourse: CourseSeed = {
  title: 'Authentification & sécurité web (JWT, OAuth)',
  description:
    'Comprendre et implémenter une authentification robuste : sessions vs JWT, hashing de mots de passe, OAuth 2.0 et bonnes pratiques.',
  authorEmail: 'formateur.demo@example.com',
  chapters: [
    {
      title: 'Sessions vs JWT : quelle approche choisir ?',
      content:
        'L\'authentification par session repose sur un identifiant stocké côté serveur (mémoire, Redis, base de données) et référencé par un cookie envoyé au client. Le serveur doit interroger ce stockage à chaque requête pour vérifier que la session est valide, ce qui la rend "stateful" : elle nécessite de partager cet état entre toutes les instances du serveur si l\'application est distribuée.\n\n' +
        'Le JWT (JSON Web Token) est une alternative "stateless" : le token contient lui-même les informations nécessaires (identifiant utilisateur, rôle, date d\'expiration), signées cryptographiquement par le serveur. N\'importe quelle instance peut vérifier la signature sans consulter de base de données partagée, ce qui simplifie le scaling horizontal.\n\n' +
        "Le revers de la médaille : un JWT ne peut pas être révoqué facilement avant son expiration (contrairement à une session qu'on supprime simplement du stockage serveur). C'est pourquoi on limite généralement sa durée de vie et qu'on combine parfois JWT (access token, courte durée) avec un refresh token stocké côté serveur pour permettre la révocation.",
      quiz: [
        {
          text: 'Pourquoi dit-on que l’authentification par JWT est "stateless" ?',
          options: [
            {
              text: 'Le serveur n’a pas besoin de stocker l’état de la session ; toute l’info est dans le token signé',
              isCorrect: true,
            },
            { text: 'Parce qu’elle n’utilise jamais de cookies', isCorrect: false },
            { text: 'Parce qu’elle ne nécessite pas de mot de passe', isCorrect: false },
            { text: 'Parce que le token n’expire jamais', isCorrect: false },
          ],
        },
        {
          text: 'Quel est un inconvénient majeur du JWT par rapport aux sessions serveur ?',
          options: [
            { text: 'Il ne peut pas être révoqué facilement avant son expiration', isCorrect: true },
            { text: 'Il est toujours plus lent à vérifier', isCorrect: false },
            { text: 'Il ne peut pas contenir le rôle de l’utilisateur', isCorrect: false },
            { text: 'Il nécessite obligatoirement une base de données', isCorrect: false },
          ],
        },
        {
          text: 'Quel est l’intérêt de combiner un access token JWT court avec un refresh token ?',
          options: [
            {
              text: 'Limiter les dégâts d’un token volé tout en permettant de révoquer l’accès via le refresh token',
              isCorrect: true,
            },
            { text: 'Éviter d’avoir à hasher les mots de passe', isCorrect: false },
            { text: 'Remplacer complètement le besoin de HTTPS', isCorrect: false },
            { text: 'Accélérer le hashing bcrypt', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Hasher les mots de passe correctement',
      content:
        'Un mot de passe ne doit jamais être stocké en clair, ni même simplement haché avec un algorithme rapide comme SHA-256 : ces algorithmes sont conçus pour être rapides, ce qui les rend justement vulnérables aux attaques par force brute (des milliards de hachages par seconde sur du matériel dédié).\n\n' +
        'bcrypt (et ses alternatives comme argon2) sont des fonctions de hachage volontairement lentes et paramétrables via un "cost factor" (le nombre de rounds), ce qui rend le brute-force économiquement inefficace. bcrypt génère aussi automatiquement un sel (salt) unique par mot de passe, intégré au hash final, pour empêcher les attaques par rainbow table.\n\n' +
        "En pratique : on hache le mot de passe à l'inscription (bcrypt.hash(password, 12)) et on compare le mot de passe fourni au hash stocké à la connexion (bcrypt.compare(password, hash)) — jamais l'inverse, un hash bcrypt n'est pas déchiffrable. Le cost factor 12 est un bon compromis actuel entre sécurité et temps de calcul (~200-300ms par hash).",
      quiz: [
        {
          text: 'Pourquoi ne faut-il pas hacher un mot de passe avec un simple SHA-256 ?',
          options: [
            { text: 'C’est un algorithme rapide, donc vulnérable au brute-force à grande échelle', isCorrect: true },
            { text: 'SHA-256 ne fonctionne qu’en Python', isCorrect: false },
            { text: 'Il ne produit pas de résultat déterministe', isCorrect: false },
            { text: 'Il est interdit par la loi', isCorrect: false },
          ],
        },
        {
          text: 'À quoi sert le sel (salt) intégré par bcrypt ?',
          options: [
            {
              text: 'Empêcher les attaques par rainbow table en rendant chaque hash unique même pour un mot de passe identique',
              isCorrect: true,
            },
            { text: 'Accélérer le calcul du hash', isCorrect: false },
            { text: 'Chiffrer la base de données entière', isCorrect: false },
            { text: 'Remplacer le besoin de HTTPS', isCorrect: false },
          ],
        },
        {
          text: 'Peut-on "déchiffrer" un hash bcrypt pour retrouver le mot de passe original ?',
          options: [
            { text: 'Non, on ne peut que comparer un mot de passe candidat au hash stocké', isCorrect: true },
            { text: 'Oui, avec la bonne clé privée', isCorrect: false },
            { text: 'Oui, si on connaît le cost factor', isCorrect: false },
            { text: 'Oui, bcrypt est réversible par design', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'OAuth 2.0 : déléguer l’authentification',
      content:
        'OAuth 2.0 est un protocole d\'autorisation qui permet à une application (le "client") d\'accéder à des ressources d\'un utilisateur hébergées par un autre service (le "resource server", ex. Google, GitHub) sans jamais manipuler son mot de passe. L\'utilisateur autorise l\'accès via un écran de consentement chez le fournisseur, qui redirige ensuite vers l\'application avec un code d\'autorisation.\n\n' +
        "Le flow le plus courant côté web est l'Authorization Code Flow : l'application redirige l'utilisateur vers le fournisseur OAuth, récupère un code temporaire après consentement, puis échange ce code contre un access token en backend (jamais côté navigateur, pour ne pas exposer les secrets du client). Ce token permet ensuite d'appeler les APIs du fournisseur au nom de l'utilisateur.\n\n" +
        "Il ne faut pas confondre authentification et autorisation : OAuth 2.0 est nativement un protocole d'autorisation (donner accès à des ressources), pas d'authentification (prouver une identité). OpenID Connect (OIDC) est une extension construite au-dessus d'OAuth 2.0 qui ajoute une couche d'authentification standardisée, avec un ID Token (JWT) contenant l'identité de l'utilisateur — c'est ce qu'utilisent la plupart des boutons « Se connecter avec Google ».",
      quiz: [
        {
          text: 'Quel est l’objectif principal d’OAuth 2.0 ?',
          options: [
            {
              text: 'Permettre à une application d’accéder à des ressources d’un utilisateur sans manipuler son mot de passe',
              isCorrect: true,
            },
            { text: 'Chiffrer les communications HTTP', isCorrect: false },
            { text: 'Remplacer bcrypt pour le hashing', isCorrect: false },
            { text: 'Stocker les sessions utilisateur', isCorrect: false },
          ],
        },
        {
          text: 'Dans l’Authorization Code Flow, où doit-on échanger le code contre un access token ?',
          options: [
            { text: 'Côté serveur (backend), jamais directement dans le navigateur', isCorrect: true },
            { text: 'Toujours côté client, dans le JavaScript du navigateur', isCorrect: false },
            { text: 'Dans l’URL de redirection', isCorrect: false },
            { text: 'Peu importe, les deux sont équivalents en sécurité', isCorrect: false },
          ],
        },
        {
          text: 'Quelle est la différence entre OAuth 2.0 et OpenID Connect (OIDC) ?',
          options: [
            {
              text: 'OAuth 2.0 gère l’autorisation ; OIDC ajoute une couche d’authentification standardisée par-dessus',
              isCorrect: true,
            },
            { text: 'Ce sont deux noms pour exactement le même protocole', isCorrect: false },
            { text: 'OIDC remplace complètement OAuth 2.0', isCorrect: false },
            { text: 'OAuth 2.0 est plus récent qu’OIDC', isCorrect: false },
          ],
        },
        {
          text: 'Qu’est-ce que l’ID Token dans OpenID Connect ?',
          options: [
            { text: 'Un JWT contenant l’identité de l’utilisateur authentifié', isCorrect: true },
            { text: 'Le mot de passe chiffré de l’utilisateur', isCorrect: false },
            { text: 'Un identifiant de session côté serveur', isCorrect: false },
            { text: 'Le nom du fournisseur OAuth', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Bonnes pratiques de sécurité côté API',
      content:
        'Helmet (middleware Express) configure automatiquement une série d\'en-têtes HTTP de sécurité : Content-Security-Policy pour limiter les sources de scripts exécutables, X-Content-Type-Options pour empêcher le MIME sniffing, ou encore Strict-Transport-Security pour forcer HTTPS. C\'est une première ligne de défense simple à mettre en place.\n\n' +
        "CORS (Cross-Origin Resource Sharing) doit être configuré avec une liste blanche précise d'origines autorisées plutôt qu'un wildcard (*), surtout dès qu'on utilise credentials: true pour transmettre des cookies ou des headers d'authentification — les deux ne sont d'ailleurs pas compatibles ensemble par spec.\n\n" +
        'Le rate limiting (limiter le nombre de requêtes par IP ou par utilisateur sur une fenêtre de temps) protège contre le brute-force sur les routes de connexion et le déni de service applicatif. Enfin, valider systématiquement les entrées utilisateur (avec Zod, par exemple) avant tout traitement métier évite toute une classe de vulnérabilités liées à des données malformées ou malveillantes.',
      quiz: [
        {
          text: 'Que fait le middleware Helmet dans une app Express ?',
          options: [
            { text: 'Il configure automatiquement des en-têtes HTTP de sécurité (CSP, HSTS...)', isCorrect: true },
            { text: 'Il hashe les mots de passe', isCorrect: false },
            { text: 'Il gère les migrations de base de données', isCorrect: false },
            { text: 'Il remplace le besoin de JWT', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi éviter Access-Control-Allow-Origin: * avec credentials: true ?',
          options: [
            {
              text: 'Ce n’est pas autorisé par la spec CORS et pose un risque de sécurité en exposant les credentials à n’importe quelle origine',
              isCorrect: true,
            },
            { text: 'Ça ralentit les requêtes', isCorrect: false },
            { text: 'Ça désactive automatiquement HTTPS', isCorrect: false },
            { text: 'Ça n’a aucun impact, c’est juste une convention', isCorrect: false },
          ],
        },
        {
          text: 'À quoi sert le rate limiting sur une route de connexion ?',
          options: [
            { text: 'Limiter le nombre de tentatives pour se protéger du brute-force', isCorrect: true },
            { text: 'Accélérer le hashing des mots de passe', isCorrect: false },
            { text: 'Remplacer la validation des données', isCorrect: false },
            { text: 'Chiffrer le trafic HTTP', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

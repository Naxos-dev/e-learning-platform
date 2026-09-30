import type { CourseSeed } from './types.js';

export const testingCourse: CourseSeed = {
  title: 'Introduction aux tests (Jest/Vitest)',
  description:
    'Écrire des tests fiables : tests unitaires, tests d’intégration, mocking et bonnes pratiques pour un code plus robuste.',
  authorEmail: 'formateur.demo@example.com',
  chapters: [
    {
      title: 'Pourquoi et quoi tester ?',
      content:
        'Un test automatisé vérifie qu’un comportement précis du code reste correct, de façon reproductible et sans intervention manuelle — contrairement à tester "à la main" dans le navigateur ou Postman à chaque changement, ce qui devient vite impraticable à mesure qu’un projet grossit. Les tests documentent aussi le comportement attendu du code, souvent mieux qu’un commentaire qui peut devenir obsolète sans qu’on s’en aperçoive.\n\n' +
        'La pyramide des tests distingue plusieurs niveaux : les tests unitaires (une fonction ou un module isolé, rapides et nombreux), les tests d’intégration (plusieurs modules ensemble, comme une route HTTP complète avec sa vraie base de données), et les tests end-to-end (l’application entière depuis l’interface utilisateur). Plus on monte dans la pyramide, plus les tests sont lents et coûteux à maintenir, mais représentatifs d’un usage réel.\n\n' +
        'Tout ne mérite pas le même niveau de couverture : prioriser les tests sur la logique métier critique (calcul de prix, autorisations, scoring) et les chemins à haut risque (authentification, paiement) apporte beaucoup plus de valeur que de viser 100% de couverture sur des getters/setters triviaux qui ne peuvent presque pas casser.',
      quiz: [
        {
          text: 'Quel est l’avantage principal d’un test automatisé par rapport à un test manuel dans le navigateur ?',
          options: [
            { text: 'Il est reproductible et rapide à relancer, sans intervention humaine à chaque fois', isCorrect: true },
            { text: 'Il remplace complètement le besoin de relire le code', isCorrect: false },
            { text: 'Il est toujours plus rapide à écrire qu’à exécuter manuellement une fois', isCorrect: false },
            { text: 'Il ne peut détecter que les erreurs de syntaxe', isCorrect: false },
          ],
        },
        {
          text: 'Dans la pyramide des tests, qu’est-ce qui distingue un test unitaire d’un test d’intégration ?',
          options: [
            {
              text: 'Le test unitaire isole une fonction/un module ; le test d’intégration vérifie plusieurs modules ensemble (ex : une route HTTP avec sa DB)',
              isCorrect: true,
            },
            { text: 'Le test unitaire est toujours plus lent', isCorrect: false },
            { text: 'Ce sont deux noms pour la même chose', isCorrect: false },
            { text: 'Le test d’intégration ne teste jamais de vraie base de données', isCorrect: false },
          ],
        },
        {
          text: 'Où faut-il prioriser l’effort de test dans un projet ?',
          options: [
            { text: 'Sur la logique métier critique et les chemins à haut risque (auth, calculs, autorisations)', isCorrect: true },
            { text: 'Uniquement sur les getters et setters', isCorrect: false },
            { text: 'Viser 100% de couverture partout, sans exception', isCorrect: false },
            { text: 'Sur le code déjà stable et jamais modifié', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Écrire un premier test avec Vitest',
      content:
        'Un test suit généralement la structure "Arrange, Act, Assert" : préparer les données et l’état nécessaires, exécuter le code à tester, puis vérifier le résultat avec des assertions (expect(result).toBe(42)). Vitest regroupe les tests liés avec describe() et définit chaque cas avec it() (ou test()), rendant la sortie lisible sous forme d’arborescence.\n\n' +
        'Un bon test unitaire est indépendant des autres : il ne doit pas dépendre de l’ordre d’exécution ni laisser d’état partagé qui affecterait un test suivant. Pour ça, on réinitialise l’état nécessaire avant chaque test avec beforeEach(), plutôt que de réutiliser un état construit progressivement par les tests précédents.\n\n' +
        'Les assertions vont au-delà de la simple égalité : toEqual compare deux objets en profondeur (utile pour des structures de données complexes), toThrow vérifie qu’une fonction lève une erreur, toHaveBeenCalledWith vérifie les arguments d’un mock — chaque type d’assertion existe pour rendre l’intention du test aussi explicite que possible à la lecture.',
      quiz: [
        {
          text: 'Que signifie la structure "Arrange, Act, Assert" d’un test ?',
          options: [
            { text: 'Préparer les données, exécuter le code testé, puis vérifier le résultat', isCorrect: true },
            { text: 'Trois bibliothèques de test différentes à choisir', isCorrect: false },
            { text: 'Un ordre obligatoire imposé par Vitest dans le code', isCorrect: false },
            { text: 'Les trois types de tests de la pyramide', isCorrect: false },
          ],
        },
        {
          text: 'Pourquoi un test ne doit-il pas dépendre de l’ordre d’exécution des autres tests ?',
          options: [
            {
              text: 'Pour rester fiable et isolé, sans état partagé qui casserait un test si l’ordre change',
              isCorrect: true,
            },
            { text: 'Parce que Vitest exécute toujours les tests dans un ordre aléatoire imprévisible', isCorrect: false },
            { text: 'Ce n’est pas important en pratique', isCorrect: false },
            { text: 'Parce que ça ralentit l’exécution', isCorrect: false },
          ],
        },
        {
          text: 'Quelle assertion utilise-t-on pour comparer deux objets en profondeur (pas juste leur référence) ?',
          options: [
            { text: 'toEqual', isCorrect: true },
            { text: 'toBe', isCorrect: false },
            { text: 'toThrow', isCorrect: false },
            { text: 'toHaveBeenCalled', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Mocker les dépendances externes',
      content:
        'Un mock remplace une dépendance réelle (appel réseau, base de données, horloge système) par une version contrôlée dont on définit le comportement pour le test, permettant de tester une unité de code isolément, sans dépendre de la disponibilité ou de la lenteur d’un service externe réel. vi.fn() crée une fonction mock dont on peut définir la valeur de retour et vérifier les appels.\n\n' +
        'vi.spyOn(objet, \'methode\') surveille (et peut remplacer) une méthode existante sur un objet réel, utile pour mocker une seule fonction d’un module sans devoir reconstruire tout le module. C’est exactement le pattern utilisé pour éviter de vraiment appeler AWS S3 pendant des tests automatisés : on mocke la méthode send du client S3 pour qu’elle retourne un succès simulé, sans requête réseau réelle.\n\n' +
        'Trop mocker peut rendre un test trompeur : s’il mocke la totalité du comportement testé, le test vérifie surtout que le mock fonctionne comme configuré, pas que le vrai système fonctionne. La règle générale : mocker les frontières externes du système (réseau, services tiers, horloge), mais garder la vraie logique métier et, quand c’est raisonnable, une vraie base de données de test pour les tests d’intégration.',
      quiz: [
        {
          text: 'À quoi sert un mock dans un test ?',
          options: [
            { text: 'Remplacer une dépendance réelle par une version contrôlée, pour tester une unité isolément', isCorrect: true },
            { text: 'Accélérer la compilation TypeScript', isCorrect: false },
            { text: 'Générer automatiquement des données de test aléatoires', isCorrect: false },
            { text: 'Remplacer le besoin d’écrire des assertions', isCorrect: false },
          ],
        },
        {
          text: 'Que permet vi.spyOn(objet, \'methode\') ?',
          options: [
            { text: 'Surveiller et éventuellement remplacer une méthode existante sur un objet réel', isCorrect: true },
            { text: 'Créer un objet complètement vide', isCorrect: false },
            { text: 'Supprimer une méthode définitivement', isCorrect: false },
            { text: 'Générer un rapport de couverture de code', isCorrect: false },
          ],
        },
        {
          text: 'Quel est le risque de trop mocker dans un test ?',
          options: [
            {
              text: 'Le test vérifie surtout que le mock se comporte comme configuré, pas que le vrai système fonctionne',
              isCorrect: true,
            },
            { text: 'Les tests deviennent plus lents à exécuter', isCorrect: false },
            { text: 'Ça n’a aucun inconvénient', isCorrect: false },
            { text: 'Ça empêche le test de compiler', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

import type { CourseSeed } from './types.js';

export const typescriptCourse: CourseSeed = {
  title: 'TypeScript pour les développeurs JavaScript',
  description:
    'Ajoutez des types statiques à vos projets JavaScript : syntaxe de base, interfaces, generics et configuration.',
  authorEmail: 'formateur.demo@example.com',
  chapters: [
    {
      title: 'Les bases : types primitifs et inférence',
      content:
        "TypeScript est un sur-ensemble de JavaScript qui ajoute un système de types statique, vérifié à la compilation plutôt qu'à l'exécution. Le compilateur (tsc) transpile le code TypeScript en JavaScript standard, ce qui signifie que n'importe quel fichier .js valide est aussi un fichier .ts valide.\n\n" +
        "On peut annoter explicitement une variable (let age: number = 30), mais dans la majorité des cas TypeScript infère automatiquement le type à partir de la valeur assignée. Les types primitifs de base sont string, number, boolean, null, undefined, ainsi que les types composés comme les tableaux (string[]) et les tuples ([string, number]).\n\n" +
        'Le mode strict ("strict": true dans tsconfig.json) active un ensemble de vérifications plus rigoureuses, notamment strictNullChecks, qui empêche d\'assigner null ou undefined à une variable sans l\'avoir explicitement autorisé dans son type. C\'est la configuration recommandée pour tout nouveau projet.',
      quiz: [
        {
          text: 'Que fait le compilateur TypeScript (tsc) ?',
          options: [
            { text: 'Il transpile le code TypeScript en JavaScript standard', isCorrect: true },
            { text: 'Il exécute directement le code TypeScript dans le navigateur', isCorrect: false },
            { text: 'Il remplace Node.js', isCorrect: false },
            { text: 'Il minifie le code JavaScript', isCorrect: false },
          ],
        },
        {
          text: "Dans la plupart des cas, comment TypeScript détermine-t-il le type d'une variable ?",
          options: [
            { text: 'Par inférence, à partir de la valeur assignée', isCorrect: true },
            { text: 'Il faut toujours l’annoter manuellement', isCorrect: false },
            { text: 'Il utilise le type any par défaut', isCorrect: false },
            { text: 'Il demande à l’utilisateur au runtime', isCorrect: false },
          ],
        },
        {
          text: 'Que fait l’option strictNullChecks ?',
          options: [
            {
              text: 'Empêche d’assigner null/undefined à une variable sans l’autoriser explicitement dans son type',
              isCorrect: true,
            },
            { text: 'Interdit l’utilisation de null dans tout le projet', isCorrect: false },
            { text: 'Convertit automatiquement null en undefined', isCorrect: false },
            { text: 'Désactive les vérifications de type', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Interfaces et types personnalisés',
      content:
        "Une interface décrit la forme d'un objet : quelles propriétés il possède et de quel type. interface User { id: string; email: string; role: 'FORMATEUR' | 'APPRENANT' } définit un contrat que n'importe quel objet peut respecter, sans lien d'héritage explicite (typage structurel, pas nominal).\n\n" +
        "Le mot-clé type permet aussi de définir des alias de types, avec en plus la possibilité de créer des unions (type Status = 'idle' | 'loading' | 'error') et des intersections (type A = B & C). Pour décrire la forme d'un objet, interface et type sont largement interchangeables ; la différence principale est qu'une interface peut être étendue (extends) et fusionnée si déclarée plusieurs fois, alors qu'un type ne le peut pas.\n\n" +
        'Les propriétés optionnelles (age?: number) et en lecture seule (readonly id: string) permettent d\'affiner un contrat. Un bon réflexe : définir les types de retour d\'API (comme les DTOs) une seule fois, puis les réutiliser côté frontend et backend pour garantir la cohérence des données échangées.',
      quiz: [
        {
          text: 'Comment TypeScript compare-t-il deux objets pour vérifier qu’ils respectent une interface ?',
          options: [
            {
              text: 'Par typage structurel : il compare la forme (les propriétés), pas le nom du type',
              isCorrect: true,
            },
            {
              text: 'Par typage nominal : les objets doivent explicitement implémenter l’interface',
              isCorrect: false,
            },
            { text: 'Il ne compare jamais les objets', isCorrect: false },
            { text: 'Seulement au runtime', isCorrect: false },
          ],
        },
        {
          text: 'Quelle syntaxe crée une union de types ?',
          options: [
            { text: "type Status = 'idle' | 'loading' | 'error'", isCorrect: true },
            { text: "type Status = 'idle' & 'loading' & 'error'", isCorrect: false },
            { text: "type Status = ['idle', 'loading', 'error']", isCorrect: false },
            { text: "interface Status extends 'idle', 'loading'", isCorrect: false },
          ],
        },
        {
          text: 'Que permet readonly sur une propriété ?',
          options: [
            { text: 'Interdire sa réassignation après l’initialisation de l’objet', isCorrect: true },
            { text: 'La rendre invisible en dehors du module', isCorrect: false },
            { text: 'La rendre optionnelle', isCorrect: false },
            { text: 'L’exclure du typage', isCorrect: false },
          ],
        },
      ],
    },
    {
      title: 'Generics et utilisation en conditions réelles',
      content:
        'Les generics permettent d\'écrire des fonctions et types réutilisables sans perdre l\'information de type. function first<T>(items: T[]): T | undefined { return items[0] } fonctionne avec n\'importe quel tableau, et TypeScript infère automatiquement T à partir de l\'argument passé, tout en garantissant que la valeur retournée a le bon type.\n\n' +
        "Les generics sont partout dans les bibliothèques modernes : Promise<User>, Array<string>, ou encore useState<number>() en React. Prisma Client en est un excellent exemple : chaque méthode (findUnique, create...) est typée génériquement pour retourner exactement la forme de données correspondant au schéma et aux options select/include passées.\n\n" +
        'Dans un projet réel, on utilise rarement les generics pour des cas abstraits : ils servent surtout à typer des fonctions utilitaires (wrapper d\'API, gestion d\'état, helpers de formulaire) qui doivent rester génériques sur le type de données manipulé, tout en gardant une sécurité de type complète pour l\'appelant.',
      quiz: [
        {
          text: 'À quoi servent les generics en TypeScript ?',
          options: [
            { text: 'Écrire du code réutilisable sans perdre l’information de type', isCorrect: true },
            { text: 'Rendre une fonction plus rapide à l’exécution', isCorrect: false },
            { text: 'Supprimer le besoin de typer le code', isCorrect: false },
            { text: 'Convertir automatiquement les types entre eux', isCorrect: false },
          ],
        },
        {
          text: 'Dans function first<T>(items: T[]), comment T est-il déterminé lors de l’appel first([1,2,3]) ?',
          options: [
            { text: 'TypeScript l’infère automatiquement (ici, number)', isCorrect: true },
            { text: 'Il faut toujours l’écrire explicitement : first<number>([1,2,3])', isCorrect: false },
            { text: 'T vaut toujours any', isCorrect: false },
            { text: 'Ça ne compile pas sans annotation', isCorrect: false },
          ],
        },
        {
          text: 'Quel exemple illustre l’usage de generics dans une bibliothèque courante ?',
          options: [
            { text: 'Promise<User>', isCorrect: true },
            { text: 'console.log()', isCorrect: false },
            { text: 'Array.isArray()', isCorrect: false },
            { text: 'JSON.stringify()', isCorrect: false },
          ],
        },
      ],
    },
  ],
};

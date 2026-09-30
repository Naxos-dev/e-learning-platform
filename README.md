# E-learning Platform

Mini-plateforme e-learning (cours, chapitres, quiz, suivi de progression) — projet portfolio
axé sur les compétences backend : Node.js, TypeScript, PostgreSQL/Prisma, upload S3, JWT.

## Démo en ligne

- **App** : https://e-learning-platform-three-livid.vercel.app
- **API** : https://e-learning-platform-xdh8.onrender.com/api/health
- Comptes de démo : voir [Données de démo](#données-de-démo) ci-dessous

Le backend est hébergé sur le tier gratuit de Render : il se met en veille après 15 min
d'inactivité, donc le premier appel après une pause peut prendre jusqu'à ~1 min à répondre.

## Stack

- **Frontend** : Vue 3, TypeScript, Vite, Vue Router, Pinia, Tailwind CSS (`frontend/`)
- **Backend** : Node.js, Express 5, TypeScript (`backend/`)
- **Base de données** : PostgreSQL + Prisma ORM
- **Stockage vidéo** : AWS S3 (URLs pré-signées)
- **Auth** : JWT, rôles `formateur` / `apprenant`

## Structure

```
e-learning-platform/
├── backend/     API Express/TypeScript
└── frontend/    App Vue 3 / TypeScript
```

## Démarrer le backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Le serveur démarre sur `http://localhost:4000`. Vérifier qu'il tourne :

```bash
curl http://localhost:4000/api/health
```

## Démarrer le frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'app démarre sur `http://localhost:5173` (le backend doit tourner sur `http://localhost:4000` en parallèle).

## Données de démo

Un script de seed peuple la base avec un jeu de données réaliste (comptes, cours, chapitres, quiz,
inscriptions et progression variée) pour servir de vitrine :

```bash
cd backend
npm run db:seed
```

Idempotent : relançable sans dupliquer les données (les comptes de démo précédents sont supprimés
avant recréation). Contenu généré :

- **3 formateurs**, **4 apprenants**, **12 cours** couvrant la stack du projet elle-même (Vue 3,
  Node/Express, TypeScript, auth & sécurité, Git, Tailwind, CI/CD, S3, Nuxt, tests, architecture
  backend, PostgreSQL/Prisma), 36 chapitres avec un vrai contenu pédagogique, 91 questions de quiz,
  10 inscriptions avec progression et scores variés
- Identifiants de démo (mot de passe commun à tous les comptes) :
  - `formateur.demo@example.com` / `Demo1234!` — voir le dashboard sur ses cours Vue 3 et Node/Express
  - `apprenant.demo@example.com` / `Demo1234!` — progression partielle sur plusieurs cours

Le chapitre "Introduction à Vue 3" du cours Vue 3 a une vidéo de démonstration uploadée pour
montrer le flow complet (upload direct navigateur → S3 → lecture publique).

## Tests

Suite Vitest + Supertest (37 tests) contre une branche Neon dédiée (jamais la base de dev/prod) :
auth, ownership cours/chapitres/quiz, scoring de quiz, inscription/progression, agrégation du
dashboard formateur, upload vidéo (SDK S3 mocké).

```bash
cd backend
cp .env.test.example .env.test   # à créer : branche Neon "test" séparée, voir ci-dessous
npm test
```

Créer la branche de test dans la console Neon (**Branches → Create branch**, nom `test`), copier ses
deux connection strings (directe + poolée) dans `backend/.env.test`. Les migrations sont appliquées
automatiquement avant chaque run (`globalSetup`).

## Déploiement

- **Backend** : Render (Web Service), root `backend/`, build `npm install && npx prisma migrate
  deploy && npm run build`, start `npm start`, health check `/api/health`
- **Frontend** : Vercel, root `frontend/`, preset Vite, variable `VITE_API_URL` pointant vers l'API
  Render (+ `/api`). `vercel.json` contient un rewrite SPA (obligatoire en mode `history` de Vue
  Router, sinon 404 sur tout accès direct à une route type `/courses/:id`)
- **Base de données** : Neon (branche par défaut, distincte de la branche `test`)
- **CORS** : `CORS_ORIGIN` (backend) et la bucket policy CORS S3 doivent inclure le domaine Vercel

## Avancement

- [x] Étape 1 — squelette du backend (Express/TS, structure routes/controllers/services)
- [x] Étape 2 — Prisma + schéma PostgreSQL
- [x] Étape 3 — Auth JWT + middleware de rôles
- [x] Étape 4 — API cours/chapitres/quiz
- [x] Étape 5 — Upload vidéo S3 (URLs pré-signées)
- [x] Étape 6 — Inscription/progression + dashboard formateur
- [x] Étape 7 — Tests sur les routes critiques (36 tests, Vitest + Supertest)
- [x] Étape 8 — Frontend Vue (auth, cours/chapitres, quiz, progression, dashboard formateur, upload vidéo)
- [x] Étape 9 — Déploiement (backend Render, frontend Vercel, testé de bout en bout en production)

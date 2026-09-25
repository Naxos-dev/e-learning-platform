# E-learning Platform

Mini-plateforme e-learning (cours, chapitres, quiz, suivi de progression) — projet portfolio
axé sur les compétences backend : Node.js, TypeScript, PostgreSQL/Prisma, upload S3, JWT.

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

## Tests

Suite Vitest + Supertest (36 tests) contre une branche Neon dédiée (jamais la base de dev/prod) :
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

## Avancement

- [x] Étape 1 — squelette du backend (Express/TS, structure routes/controllers/services)
- [x] Étape 2 — Prisma + schéma PostgreSQL
- [x] Étape 3 — Auth JWT + middleware de rôles
- [x] Étape 4 — API cours/chapitres/quiz
- [x] Étape 5 — Upload vidéo S3 (URLs pré-signées)
- [x] Étape 6 — Inscription/progression + dashboard formateur
- [x] Étape 7 — Tests sur les routes critiques (36 tests, Vitest + Supertest)
- [x] Étape 8 — Frontend Vue (auth, cours/chapitres, quiz, progression, dashboard formateur, upload vidéo)
- [ ] Étape 9 — Déploiement

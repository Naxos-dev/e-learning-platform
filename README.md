# E-learning Platform

Mini-plateforme e-learning (cours, chapitres, quiz, suivi de progression) — projet portfolio
axé sur les compétences backend : Node.js, TypeScript, PostgreSQL/Prisma, upload S3, JWT.

## Stack

- **Frontend** : Vue 3 (`frontend/`, à venir)
- **Backend** : Node.js, Express 5, TypeScript (`backend/`)
- **Base de données** : PostgreSQL + Prisma ORM
- **Stockage vidéo** : AWS S3 (URLs pré-signées)
- **Auth** : JWT, rôles `formateur` / `apprenant`

## Structure

```
e-learning-platform/
├── backend/     API Express/TypeScript
└── frontend/    App Vue 3 (étape ultérieure)
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

## Avancement

- [x] Étape 1 — squelette du backend (Express/TS, structure routes/controllers/services)
- [x] Étape 2 — Prisma + schéma PostgreSQL
- [x] Étape 3 — Auth JWT + middleware de rôles
- [x] Étape 4 — API cours/chapitres/quiz
- [x] Étape 5 — Upload vidéo S3 (URLs pré-signées)
- [ ] Étape 6 — Inscription/progression + dashboard formateur
- [ ] Étape 7 — Tests sur les routes critiques
- [ ] Étape 8 — Frontend Vue
- [ ] Étape 9 — Déploiement

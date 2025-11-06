# Todo List - CI/CD Pipeline

> Application Todo List full-stack avec pipeline CI/CD complète, sécurité DevSecOps et monitoring.

## 📋 Table des matières

- [Équipe](#équipe)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Installation locale](#installation-locale)
- [Pipeline CI/CD](#pipeline-cicd)
- [Déploiement](#déploiement)
- [Stratégie de rollback](#stratégie-de-rollback)
- [Secrets et configuration](#secrets-et-configuration)

---

## 👥 Équipe

| NOM | Prénom |
|-----|--------|
| GARNIER | Quentin |
| CANDILLE | Thomas |
| MOCCAND-JACQUET | Michel |

---

## 🏗️ Architecture

### Structure du projet

Ce projet est un monorepo contenant deux applications principales :

```
CI-CD-course/
├── packages/
│   ├── client/          # Frontend React + Vite + TypeScript
│   └── server/          # Backend Node.js + Express + TypeScript
├── .github/
│   └── workflows/       # Pipelines GitHub Actions
└── README.md
```

### Architecture applicative

- **Frontend (Client)** : Application React avec Tailwind CSS pour l'interface utilisateur
- **Backend (Server)** : API REST Node.js/Express avec persistance en fichier JSON
- **Conteneurisation** : Docker multi-stage pour optimiser la taille et la sécurité
- **CI/CD** : GitHub Actions pour l'automatisation complète
- **Déploiement** :
  - Frontend : Vercel (Production)
  - Backend : Render (Docker container)
- **Monitoring** : Sentry pour le suivi des erreurs en production

---

## 🛠️ Stack technique

### Frontend
- React 18
- TypeScript 5
- Vite (build tool)
- Tailwind CSS
- Lucide React (icônes)

### Backend
- Node.js 20
- Express 4
- TypeScript 5
- Vitest (tests unitaires)
- ts-node (développement)

### DevOps
- Docker (multi-stage build)
- GitHub Actions
- Trivy (scan de sécurité)
- Vercel (déploiement frontend)
- Render (déploiement backend)
- Sentry (monitoring)
- Discord (notifications)

---

## 💻 Installation locale

### Prérequis

- Node.js 18+ et npm
- Docker (optionnel, pour tester le build)
- Git

### 1. Cloner le repository

```bash
git clone https://github.com/IIM-Backrow/CI-CD-course
cd CI-CD-course
```

### 2. Installation du serveur

```bash
cd packages/server
npm install
```

### 3. Installation du client

```bash
cd packages/client
npm install
```

### 4. Lancer en mode développement

**Terminal 1 - Backend :**
```bash
cd packages/server
npm run dev
```
Le serveur démarre sur `http://localhost:3001`

**Terminal 2 - Frontend :**
```bash
cd packages/client
npm run dev
```
Le client démarre sur `http://localhost:5173`

### 5. Lancer les tests

```bash
cd packages/server
npm test                 # Tests en mode watch
npm run test:coverage    # Tests avec couverture
```

### 6. Tester le build Docker (optionnel)

```bash
cd packages/server
docker build -t todo-api:local .
docker run -p 3001:3001 todo-api:local
```

---

## 🔄 Pipeline CI/CD

Notre pipeline CI/CD est composée de **5 workflows GitHub Actions** couvrant la qualité, la sécurité, le packaging et le déploiement.

### 📊 Vue d'ensemble des workflows

| Workflow | Déclenchement | Objectif |
|----------|--------------|----------|
| `tests.yml` | Push, PR | Tests unitaires et couverture |
| `lint-commits.yml` | Push, PR | Validation des Conventional Commits |
| `npm-audit.yml` | Push, PR | Scan de sécurité des dépendances npm |
| `docker-ci.yml` | PR, Tags | Build Docker et scan Trivy |
| `deploy.yml` | Tags `v*.*.*` | Déploiement en production |

### 1️⃣ Qualité du code - `tests.yml`

**Jobs :**

- **`test-unit`** : 
  - Exécute les tests unitaires du backend avec Vitest
  - Génère un rapport de couverture de code
  - Upload le rapport de couverture comme artéfact
  - Seuil minimum : 80% de couverture

- **`coverage`** (PR uniquement) :
  - Télécharge l'artéfact de couverture
  - Vérifie que les seuils de couverture sont respectés
  - Échoue si la couverture est insuffisante

**Déclenchement :** Tous les push et PR

### 2️⃣ Validation des commits - `lint-commits.yml`

**Jobs :**

- **`commitlint`** :
  - Utilise `commitlint` avec les règles Conventional Commits
  - Vérifie tous les messages de commits de la PR
  - Empêche le merge si les commits ne respectent pas les conventions

**Format attendu :**
```
feat: ajout d'une nouvelle fonctionnalité
fix: correction d'un bug
docs: mise à jour de la documentation
chore: tâche de maintenance
test: ajout de tests
```

**Déclenchement :** Tous les push et PR

### 3️⃣ Sécurité NPM - `npm-audit.yml`

**Jobs :**

- **`scan-frontend`** :
  - Lance `npm audit` avec niveau `high` sur le client
  - Échoue si des vulnérabilités high/critical sont trouvées

- **`scan-backend`** :
  - Lance `npm audit` avec niveau `high` sur le serveur
  - Échoue si des vulnérabilités high/critical sont trouvées

**Déclenchement :** Push sur `main` et toutes les PR

### 4️⃣ Docker & Sécurité - `docker-ci.yml`

**Jobs :**

- **`build-docker`** :
  - Build l'image Docker multi-stage
  - Sur PR : tag avec le SHA du commit
  - Sur tag : tag avec la version du tag Git
  - Sauvegarde l'image comme artéfact pour le scan

- **`security-scan-docker`** (PR uniquement) :
  - Utilise Trivy pour scanner l'image Docker
  - Recherche les vulnérabilités CRITICAL
  - Échoue si des failles critiques sont détectées

- **`push-docker`** (tags uniquement) :
  - Se déclenche uniquement sur les tags `v*.*.*`
  - Push l'image sur Docker Hub avec le tag versionné
  - **Jamais** de tag `:latest`

**Déclenchement :** PR et tags `v*.*.*`

### 5️⃣ Déploiement Production - `deploy.yml`

**Jobs (dans l'ordre) :**

1. **`build-and-push-docker`** :
   - Extrait la version depuis le tag Git
   - Build et push l'image Docker sur Docker Hub
   - Tag : `<username>/todo-api:v1.0.0` (exemple)

2. **`deploy-frontend`** :
   - Déploie le frontend sur Vercel
   - Utilise l'environnement de production
   - Retourne l'URL de déploiement

3. **`deploy-backend`** :
   - Déclenche le déploiement sur Render via webhook
   - Render pull automatiquement la nouvelle image Docker

4. **`smoke-test`** :
   - Attend que les déploiements soient effectifs
   - Teste la santé du frontend (HTTP 200)
   - Teste la santé du backend (endpoint `/health`)
   - Teste l'intégration API (`/api/todos`)
   - Échoue si un service n'est pas accessible

5. **`notify-success`** (si succès) :
   - Envoie une notification Discord avec :
     - Version déployée
     - Repository
     - Utilisateur déclencheur
     - Tag Docker

6. **`notify-failure`** (si échec) :
   - Envoie une notification Discord d'erreur
   - Lien vers les logs de la pipeline

**Déclenchement :** Uniquement sur les tags `v*.*.*`

### 🚀 Déployer une nouvelle version

```bash
# 1. Créer une Pull Request avec vos changements
git checkout -b feat/ma-nouvelle-fonctionnalité
git commit -m "feat: ajout de la fonctionnalité X"
git push origin feat/ma-nouvelle-fonctionnalité

# 2. Attendre la validation de la PR (tests, scans, etc.)
# 3. Merger la PR dans main

# 4. Créer et pousser un tag pour déclencher le déploiement
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```

---

## 🌐 Déploiement

### URLs de production

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `https://ci-cd-course-xi.vercel.app/` | Interface utilisateur React |
| **Backend** | `https://backrow-cicd-course-public-1-0-0.onrender.com/` | API REST Express |

---

## ♻️ Stratégie de rollback

### Scénario : Rollback de v1.0.2 vers v1.0.1

**Exemple concret :**  
Vous venez de déployer v1.0.2 mais elle a un bug. Vous voulez revenir à v1.0.1 rapidement.

**Backend (Render) :**
1. Aller sur le dashboard Render
2. Cliquer sur l'onglet **"Events"**
3. Trouver la version v1.0.1 dans la liste
4. Cliquer sur le bouton **"Rollback"**
5. ✅ C'est tout ! Render redéploie automatiquement v1.0.1

### Pourquoi notre stratégie fonctionne

1. **Images Docker versionnées** : Chaque tag Git génère une image unique sur Docker Hub
   ```
   <username>/todo-api:v1.0.0
   <username>/todo-api:v1.0.1
   <username>/todo-api:v1.0.2
   ```

2. **Immutabilité** : Les images ne sont jamais écrasées (pas de tag `:latest`)

3. **Disponibilité** : Toutes les versions restent disponibles sur Docker Hub

4. **Reproductibilité** : Chaque version peut être redéployée à l'identique

### Bonnes pratiques

- 📌 **Ne jamais supprimer les tags Git** de versions déployées
- 📌 **Documenter les rollbacks** dans les release notes
- 📌 **Tester le rollback** en pré-production si possible
- 📌 **Monitorer après rollback** pour confirmer la résolution

---

## 🔐 Secrets et configuration

### Secrets GitHub requis

Pour que la pipeline fonctionne, configurez les secrets suivants dans **Settings > Secrets and variables > Actions** :

| Secret | Description | Obtention |
|--------|-------------|-----------|
| `DOCKER_USERNAME` | Nom d'utilisateur Docker Hub | [hub.docker.com](https://hub.docker.com) |
| `DOCKERHUB_TOKEN` | Token d'accès Docker Hub | Docker Hub > Account Settings > Security |
| `VERCEL_TOKEN` | Token d'API Vercel | Vercel > Settings > Tokens |
| `VERCEL_ORG_ID` | ID de l'organisation Vercel | `.vercel/project.json` après premier déploiement |
| `VERCEL_PROJECT_ID` | ID du projet Vercel | `.vercel/project.json` après premier déploiement |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Secret pour bypass protection Vercel | Vercel > Project Settings > Deployment Protection |
| `RENDER_DEPLOY_HOOK` | Webhook de déploiement Render | Render > Service > Settings > Deploy Hook |
| `BACKEND_URL` | URL du backend en production | Ex: `https://todo-api.onrender.com` |
| `DISCORD_WEBHOOK_URL` | URL du webhook Discord | Discord Server > Edit Channel > Integrations > Webhooks |

### Variables GitHub

Dans **Settings > Secrets and variables > Actions > Variables** :

| Variable | Valeur | Description |
|----------|--------|-------------|
| `DOCKERHUB_REPOSITORY` | `<username>/todo-api` | Nom du repo Docker Hub |

---

## 📚 Documentation complémentaire

### Conventional Commits

Format : `<type>(<scope>): <description>`

**Types autorisés :**
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `docs` : Documentation
- `style` : Formatage, points-virgules manquants, etc.
- `refactor` : Refactoring de code
- `test` : Ajout de tests
- `chore` : Maintenance, configuration

**Exemples :**
```
feat(api): add DELETE /api/todos/:id endpoint
fix(client): resolve todo checkbox state bug
docs(readme): update deployment instructions
test(server): add unit tests for todo CRUD operations
```

### Dockerfile multi-stage

Notre Dockerfile utilise un build multi-stage pour :
1. **Stage build** : Compiler TypeScript avec toutes les dépendances
2. **Stage production** : Image finale légère avec uniquement le code compilé et les dépendances de production

**Avantages :**
- 📦 Image finale plus petite (~50% de réduction)
- 🔒 Moins de surface d'attaque (pas de devDependencies)
- ⚡ Build cache optimisé

---

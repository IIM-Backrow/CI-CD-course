# TODO — Pipeline CI/CD

Voici la liste des tâches à réaliser pour implémenter la pipeline CI/CD complète demandée (Qualité, Packaging, Sécurité, Déploiement, Observabilité, Notifications). Utilisez cette check‑list pour suivre l'avancement.

## Checklist générale

- [ ] Plan CI/CD pipeline and repo layout (EN COURS)
	- Définir les workflows, événements (push, pull_request, pull_request_target, tag), permissions et secrets.
	- Lister les fichiers à créer/modifier : `.github/workflows/*`, `server/Dockerfile`, tests, Sentry, `README.md`.
- [ ] Add unit tests for backend routes
	- Ajouter au moins 2 tests unitaires pour des routes API (ex: `GET /todos`, `POST /todos` avec body invalide).
	- S’assurer qu’ils passent localement et en CI.
- [ ] Create `test-unit` CI job
	- Installer dépendances, exécuter les tests backend.
	- Générer et uploader l’artéfact de coverage pour le job `coverage`.
- [ ] Add `lint-commits` CI job
	- Linter les messages de commit avec commitlint (Conventional Commits) sur les PRs.
	- Empêcher le merge si non conforme.
- [ ] Create `coverage` CI job (PR only)
	- Télécharger l’artéfact de coverage depuis `test-unit`.
	- Vérifier le seuil de couverture (ex: 80%) et échouer si en dessous.
- [ ] Write multi-stage Dockerfile for backend
	- `server/Dockerfile` multi-stage (build -> production image optimisée).
	- Respecter bonnes pratiques (non-root, small base, `.dockerignore`).
- [ ] Create `build-docker` job
	- Sur PR : construire l’image (sans la pousser) pour permettre scans de sécurité.
	- Sur tag : construire ET pousser l’image taggée `DOCKER_USERNAME/repo:TAG` (jamais `:latest`).
- [ ] Add `security-scan-npm` job
	- Exécuter `npm audit --audit-level=high` (client + server).
	- Échouer si vulnérabilités >= high.
- [ ] Add `security-scan-docker` job
	- Scanner l’image construite (Trivy ou équivalent) sur PR.
	- Échouer si des failles critiques sont trouvées.
- [ ] Create deploy-on-tag jobs
	- `deploy-frontend` (Vercel / Netlify / équivalent) — déclenché uniquement sur tag.
	- `deploy-backend` (Render ou équivalent) — déployer l’image Docker taggée.
- [ ] Push Docker image with Git tag
	- Utiliser `DOCKER_USERNAME` et `DOCKERHUB_TOKEN` stockés en secrets.
	- L’image doit être taggée avec la version (ex: `mon-user/todo-api:v1.0.0`).
- [ ] Add `smoke-test` job
	- Exécuter après déploiements pour valider endpoints et santé.
	- Échouer si les vérifications renvoient des erreurs.
- [ ] Configure secrets
	- Ajouter et documenter les secrets requis : `DOCKER_USERNAME`, `DOCKERHUB_TOKEN`, `RENDER_DEPLOY_HOOK`, `VERCEL_TOKEN`/`NETLIFY_TOKEN`, `SENTRY_DSN`, `DISCORD_WEBHOOK`, etc.
	- Référencer uniquement via `${{ secrets.NAME }}`.
- [ ] Integrate Sentry on backend
	- Installer Sentry SDK et configurer `SENTRY_DSN` via secret.
	- Ajouter route `GET /fail` qui lance une erreur volontaire.
	- Fournir une capture d’écran montrant l’événement dans Sentry (à mettre dans `README.md`).
- [ ] Add notification job
	- Job `notify` ou étapes conditionnelles envoyant message Discord/Slack via webhook.
	- On success: message "✅ Déploiement vX.Y.Z OK".
	- On failure: message "❌ BUILD CASSÉ sur vX.Y.Z".
- [ ] Document rollback strategy
	- Expliquer dans `README.md` comment déployer une version antérieure (ex: `v1.0.1`) en réutilisant l’image taggée.
- [ ] README and submission prep
	- Table with member names (NOM / Prénom).
	- Architecture & choices, install/run locally, test instructions.
	- CI/CD jobs description, secrets used, deployment URLs, Sentry proof, rollback strategy.
	- Indiquer repo privé et ajouter le correcteur comme collaborateur.
- [ ] Add Git history / commit hygiene
	- Respect Conventional Commits pour TOUTES modifications.
	- Optionnel : Husky + commitlint hook (commit-msg) pour retours locaux.
- [ ] Add profiling (bonus)
	- Optionnel: integrate Node profiling or clinic and document usage.
- [ ] End-to-end verification and cleanup
	- Lancer pipeline complet (incl. tag), vérifier déploiements, notifications et Sentry.
	- Corriger les éventuels soucis et finaliser la doc.

---

Si vous voulez que je commence immédiatement l'implémentation d'une tâche précise (par ex. ajouter les tests unitaires backend et le job `test-unit`, ou créer le `server/Dockerfile` et le job `build-docker`), dites-moi laquelle et je m'en occupe — je mettrai à jour cette checklist et le suivi de tâches en conséquence.


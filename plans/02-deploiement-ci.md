# Plan 02 — Déploiement automatique sur le VPS depuis GitHub Actions

**But** : un push sur `main` met à jour ecoleprimaire.app et skoolik.app, sans lancer `scripts/deploiement/deploy-vps.sh` à la main.
**À ne faire qu'après la fusion de `base-saine` dans `main`** : le workflow se déclenche sur `main` (voir le plan 11, « Avant de déployer »).

## État actuel (2026-10-07)

- `scripts/deploiement/deploy-vps.sh` construit les sites en local (`npm run build:vps` = `build:ecoleprimaire` + `build:skoolik` : vite build, fiches
  PDF/JSON, pages statiques ; environ 8 minutes pour les deux) puis fait un rsync vers l'hôte de `.deploy.env` (hors dépôt).
- `.github/workflows/deploy.yml` ne publie que la redirection GitHub Pages ; `.github/workflows/tests.yml` lance lint, types, compteurs de qualité et
  `npm test` (Chrome est préinstallé sur `ubuntu-latest`), plus le niveau complet chaque nuit.

## Étapes

1. **Clé SSH dédiée**, sur ta machine : `ssh-keygen -t ed25519 -f deploy-ecoleprimaire -C "github-actions ecole-primaire"` ; côté VPS, la clé publique dans
   `~/.ssh/authorized_keys` avec `restrict,command="rrsync <dossier-web>" ssh-ed25519 …` (limite la clé à rsync dans ce dossier) ; secrets GitHub
   `VPS_SSH_KEY` et `VPS_KNOWN_HOSTS` (`ssh-keyscan <serveur>`).
2. **Workflow `deploy-vps.yml`**, sur `push: main` et `workflow_dispatch` : `npm ci` ; un job par site (matrice) qui lance `npm run build:<site>` puis
   `rsync -az --delete --delay-updates dist-<site>/ …` ; vérification finale par `curl` (`/`, `/telechargements/`, un PDF) et comparaison du hash de
   `assets/index-*.js` en ligne avec celui du build. Tant que des fiches contiennent des emojis du système, installer `fonts-noto-color-emoji` sur le
   runner (le workflow de tests ne le fait pas) ; la question disparaît avec le guide d'iconographie (`brouillons/iconographie/`).
3. **Cache** : `actions/setup-node` avec `cache: npm`. Option : ne pas régénérer les PDF si `src/exercices`, `src/affiches`, `src/impression` et
   `scripts/build/` n'ont pas changé (clé de cache sur leur hash, restauration de `dist-*/fiches`).
4. **Garde-fous** : `concurrency: deploy-vps` ; environnement GitHub `production` avec approbation manuelle (facultatif) ; le `rsync --delete` ne touche
   que le dossier du site. Garder `deploy-vps.sh` pour les essais (`--dry-run`) et les déploiements locaux.

## Points d'attention

- fail2ban sur le VPS : avec une clé valide, il n'y a pas d'échec d'authentification, donc pas de bannissement. Pas de mot de passe. **Jamais de sonde `nc` sur le port 22.**
- `polices-locales/` (Belle Allure, Écolier) est absent du CI : les PDF utilisent les polices livrées. Voulu : ces polices ne sont pas redistribuables.
- Les builds de production génèrent **toutes** les fiches (le niveau rapide des tests n'en génère qu'un échantillon).

## Vérification

Un push de test : le workflow passe au vert, les deux sites sont à jour (hash du JS identique) et `node scripts/deploiement/stats-vps.ts 1` fonctionne toujours.
Effort : environ 2 heures, dont la clé et les secrets par l'utilisateur.

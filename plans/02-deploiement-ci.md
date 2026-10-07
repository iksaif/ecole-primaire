# Plan 02 — Déploiement automatique sur le VPS depuis GitHub Actions

**But** : un push sur `main` met à jour ecoleprimaire.app et skoolik.app, sans lancer `scripts/deploy-vps.sh`
à la main.

## État actuel

- `scripts/deploy-vps.sh` construit les deux sites en local (environ 3 min chacun avec les PDF), puis fait un
  rsync vers `<utilisateur>@<serveur>:<dossier-web>/<domaine>/`.
- Le workflow `.github/workflows/deploy.yml` ne publie que la redirection GitHub Pages.
- Ubuntu sur GitHub a Chrome. Le CI installe déjà les polices emoji, nécessaires pour le rendu des PDF.

## Étapes

1. **Clé SSH dédiée**, sur ta machine :
   - `ssh-keygen -t ed25519 -f deploy-ecoleprimaire -C "github-actions ecole-primaire"` ;
   - sur le VPS, ajouter la clé publique dans `~/.ssh/authorized_keys` avec des restrictions :
     `restrict,command="rrsync <dossier-web>" ssh-ed25519 …`. `rrsync` est fourni avec rsync ; il
     limite la clé à rsync dans ce dossier ;
   - ajouter dans GitHub les secrets `VPS_SSH_KEY` (clé privée) et `VPS_KNOWN_HOSTS`
     (`ssh-keyscan <serveur>`).
2. **Workflow `deploy-vps.yml`**, déclenché sur `push: main` et `workflow_dispatch` :
   - `npm ci`, installation de `fonts-noto-color-emoji` ;
   - `npm run build:ecoleprimaire` et `npm run build:skoolik` en parallèle, dans deux jobs (matrice) ;
   - `rsync -az --delete --delay-updates dist-<site>/ deploy@…:<domaine>/`, avec la clé du secret ;
   - vérification finale : `curl` sur `/`, `/telechargements/` et un PDF, puis comparaison du hash de
     `assets/index-*.js` en ligne avec celui du build.
3. **Cache** :
   - mettre en cache `node_modules` (actions/setup-node `cache: npm`) ;
   - option : ne pas régénérer les PDF si `src/impression`, `src/views` et `scripts/telechargements.mjs` n'ont
     pas changé. Il faut alors une clé de cache sur le hash de ces fichiers et une restauration de
     `dist-*/telechargements`.
4. **Garde-fous** :
   - `concurrency: deploy-vps`, pour éviter deux déploiements simultanés ;
   - environnement GitHub `production` avec approbation manuelle (facultatif) ;
   - le rsync `--delete` ne touche que le dossier du site.
5. Garder `scripts/deploy-vps.sh` pour les déploiements locaux et les essais (`--dry-run`).

## Points d'attention

- fail2ban sur le VPS : les IP de GitHub changent. Avec une clé valide, il n'y a pas d'échec
  d'authentification, donc pas de bannissement. Ne pas autoriser de mot de passe.
- `polices-locales/` (Belle Allure…) est absent du CI : les PDF du CI utilisent les polices incluses.
  Voulu, puisque ces polices ne sont pas redistribuables.
- Le build prend environ 7 minutes sur GitHub (gratuit pour un dépôt public).

## Vérification

Faire un push de test : le workflow passe au vert, les deux sites sont à jour (hash du JS identique) et
`node scripts/stats-vps.mjs 1` fonctionne toujours.

## Effort

Environ 2 heures, dont la création de la clé et des secrets par toi.

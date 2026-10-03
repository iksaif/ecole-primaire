# École Primaire

Exercices interactifs et fiches à imprimer pour la maternelle et l'école primaire (MS → CM2), en français.
Vue 3 + Vite, déployé sur GitHub Pages. Tout fonctionne hors ligne, sans compte.

## Développement

```sh
npm install
npm run dev        # http://localhost:5173/ecole-primaire/
npm run build      # build de l'app + génération des fiches PDF (dist/)
npm run build:app  # build de l'app seulement
```

## Fiches PDF « toutes prêtes » (référencement)

`npm run build` lance `scripts/telechargements.mjs` après `vite build` : le script sert `dist/`,
pilote Chrome sans interface (playwright-core) et génère, pour chaque fiche de
`src/impression/catalogue.js`, un PDF, une vignette et une page statique
`dist/telechargements/<slug>/`, plus `dist/telechargements/index.html`, `sitemap.xml` et `robots.txt`.
Les documents sont produits par le même code que l'app (`src/impression/*.js`).

- Chrome est cherché aux emplacements habituels, ou via `CHROME_PATH`.
- `SITE_URL` fixe l'URL publique utilisée dans le sitemap (par défaut `https://iksaif.github.io/ecole-primaire/`).
- Pour utiliser dans les PDF une police non redistribuable (Belle Allure, Écolier…), déposer le fichier dans
  `polices-locales/attache/` (ou `polices-locales/script/`). Ce dossier est ignoré par git ; vérifier la licence
  de la police avant de publier les PDF.

## Polices incluses

Playwrite FR Trad (cursive), Andika (script), OpenDyslexic — licence OFL ; Luciole © Laurent Bourcellier &
Jonathan Perez — licence CC BY 4.0 (`src/assets/fonts/luciole/LICENCE.txt`).

## Sites et déploiement sur VPS

Le même code produit plusieurs sites, choisis au build par le mode Vite (fichiers `.env*`, `src/site.js`) :

| Commande | Site | Base | Sortie |
|---|---|---|---|
| `npm run build` | GitHub Pages | `/ecole-primaire/` | `dist/` |
| `npm run build:ecoleprimaire` | https://ecoleprimaire.app (français) | `/` | `dist-ecoleprimaire/` |
| `npm run build:skoolik` | https://skoolik.app (breton activé par défaut, fiches bretonnes) | `/` | `dist-skoolik/` |

Chaque fiche pré-générée a des `langues` (`src/impression/catalogue.js`) : un site ne publie que celles de sa langue.

Déploiement (rsync sur SSH) :

```sh
cp .deploy.env.example .deploy.env   # puis adapter (non commité)
scripts/deploy-vps.sh --dry-run      # voir ce qui serait envoyé
scripts/deploy-vps.sh                # construit et envoie tous les sites
scripts/deploy-vps.sh skoolik        # un seul site
```

Chaque site va dans `$DEPLOY_ROOT/<domaine>/`. Exemples de configuration nginx dans `deploy/nginx/`
(certificats : `sudo certbot --nginx -d ecoleprimaire.app -d www.ecoleprimaire.app`).

## Traduction (français / breton)

- `src/i18n/index.js` : `useI18n({ fr: {...}, br: {...} })` dans chaque composant, textes communs dans
  `src/i18n/commun.js`, langue choisie dans la barre du haut (breton par défaut sur skoolik.app).
- Les exercices de français (dictée, grammaire…) gardent leur contenu en français ; seule l'interface est traduite.
- La traduction bretonne est automatique : les passages incertains sont marqués `// br: à relire`
  (`grep -rn "br: à relire" src`). Une fenêtre prévient les visiteurs au premier passage en breton.
- Voir `TODO.md` pour la généralisation à d'autres langues régionales.

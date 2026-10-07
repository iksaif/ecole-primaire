# Plan 05 — Référencement : image de partage, Search Console, Bing

**But** : de beaux aperçus quand on partage un lien (WhatsApp, Facebook, mail), et des fiches trouvées par
Google et Bing.

## État actuel

- Les pages de fiches ont `og:image` (leur aperçu) et `og:title` / `og:description`. Leur adresse de
  référence est réglée : les fiches avec du breton sur skoolik.app, les autres sur ecoleprimaire.app.
- L'accueil de l'app (`index.html`) n'a **ni image de partage, ni `og:*`**.
- Les sitemaps existent pour chaque domaine, mais ne sont déclarés nulle part.

## Étapes

1. **Image de partage par site**, 1200 × 630 :
   - un gabarit HTML (logo, nom du site, accroche, quelques vignettes de fiches), rendu par Chrome dans
     `scripts/telechargements.mjs` ;
   - sortie : `og-image.jpg` à la racine de chaque build ;
   - version bretonne pour skoolik (« Poelladennoù ha fichennoù da voullañ »).
2. **`index.html`** : ajouter `og:title`, `og:description`, `og:image`, `og:url`, `twitter:card`
   (`summary_large_image`) avec les variables `%VITE_…%` (nouvelles entrées `VITE_SITE_DESCRIPTION` et
   `VITE_SITE_URL` dans `.env.*`).
3. **Google Search Console**, pour les deux domaines :
   - choisir une propriété de type « Domaine » ;
   - Google donne un enregistrement TXT `google-site-verification=…`, que j'ajoute via l'API Gandi
     (`PUT /livedns/domains/<d>/records/@/TXT`, sans toucher au TXT SPF existant : on ajoute une valeur) ;
   - soumettre `https://ecoleprimaire.app/sitemap.xml` et `https://skoolik.app/sitemap.xml`.
4. **Bing Webmaster Tools** : importer depuis Search Console, ou vérification TXT de la même façon.
5. **Données structurées** (facultatif) : JSON-LD `LearningResource` sur les pages de fiches (niveau,
   matière, format PDF, gratuit), ce qui peut aider le référencement des ressources éducatives.
6. Vérifier le rendu des aperçus avec les outils de débogage de partage (Facebook Sharing Debugger,
   opengraph.xyz).

## À faire de ton côté

Se connecter à Search Console et à Bing avec ton compte Google (je ne peux pas le faire) et me donner les
codes TXT de vérification.

## Effort

1 heure, plus le temps d'indexation (quelques jours à quelques semaines).

# Plan 05 — Référencement : image de partage, Search Console, Bing

**But** : de beaux aperçus quand on partage un lien (WhatsApp, Facebook, mail), et des fiches trouvées par Google et Bing.

## Fait

Pages HTML statiques par fiche (`scripts/build/statique/`) avec `og:*`, canonical et JSON-LD, sitemap par domaine, `robots.txt`, `404.html` ; `index.html` a des
`og:*` et `twitter:card` ; les fiches avec du breton ont leur adresse de référence sur skoolik.app.

## Reste

1. **Image de partage 1200 × 630 par site** (`og-image.jpg` à la racine de chaque build) : gabarit HTML (logo, nom du site, accroche, quelques vignettes de fiches)
   rendu par Chrome dans le build des pages statiques ; version bretonne pour skoolik (« Poelladennoù ha fichennoù da voullañ » : breton à faire relire).
   `index.html` pointe aujourd'hui vers `icone-512.png` (carré) avec `twitter:card=summary` : passer à `summary_large_image` avec la nouvelle image, et la
   mettre aussi sur les pages de fiches qui n'ont que leur aperçu.
2. **Google Search Console**, propriété « Domaine » pour les deux domaines : Google donne un enregistrement TXT `google-site-verification=…` ; le script
   `scripts/ponctuel/dns-verification.mjs` est prêt à l'ajouter via l'API Gandi (sans toucher au TXT SPF existant). Soumettre ensuite
   `https://ecoleprimaire.app/sitemap.xml` et `https://skoolik.app/sitemap.xml`.
3. **Bing Webmaster Tools** : importer depuis Search Console, ou vérification TXT de la même façon.
4. Vérifier les aperçus (Facebook Sharing Debugger, opengraph.xyz).

**À faire de ton côté** : te connecter à Search Console et à Bing avec ton compte et fournir les codes TXT. Effort : 1 heure, plus le temps d'indexation.
`lastmod` du sitemap et `deploy/nginx/*.conf` périmés : voir `REPRISE.md`, « Avant de déployer ».

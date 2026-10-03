# TODO

## Généraliser « français + breton » en « français + langue régionale »

Aujourd'hui le breton est la seule langue régionale, et plusieurs endroits le supposent encore.
Objectif : ajouter une langue (occitan, alsacien, basque, corse, catalan…) en ne touchant qu'aux données.

- [ ] Interface : `src/i18n` connaît `fr` et `br` en dur (`LANGUES_INTERFACE`, messages `{ fr, br }` dans chaque
      composant). Passer à « une clé par langue » sans supposer `br`, et prévoir le repli `fr`.
- [ ] `src/data/languesRegionales.js` est la bonne base (alphabet, nombres en lettres, listes de mots) :
      y rattacher aussi le code de la langue d'interface, le drapeau (composant `Drapeau.vue` en dur pour
      le Gwenn-ha-du), le nom local et le titre de l'alphabet.
- [ ] `src/impression/nombres.js` : `langue: 'br'` signifie « langue régionale seule » ; renommer en
      `regionale` et utiliser `config.regionale` partout (légende, titres).
- [ ] `src/impression/catalogue.js` : les fiches bretonnes sont écrites à la main (`BR`, `lettresBretonnes`,
      `breton`) ; les générer à partir de la langue régionale (alphabet, listes, nombres).
- [ ] `src/site.js` : un site = une langue d'interface + des langues de fiches ; nom/domaine par langue.
- [ ] Vues d'exercices : les textes bretons sont dans chaque composant ; les sortir dans des fichiers par
      langue (`src/i18n/<langue>/…`) quand une 3e langue arrive, pour pouvoir les faire traduire/relire
      sans toucher au code.
- [ ] Synthèse vocale : pas de voix bretonne dans les navigateurs ; prévoir des enregistrements audio
      ou une voix serveur pour les langues sans TTS.
- [ ] Relecture de toute la traduction bretonne par un brittophone (commentaires `// br: à relire`).

## Site public — check-list

Fait :
- [x] HTTPS + HSTS, redirections http/www, certificats Let's Encrypt auto-renouvelés (certbot.timer)
- [x] Mentions légales et confidentialité (`/mentions-legales`), pied de page avec contact
- [x] Pas de cookie, pas de mesure d'audience, pas de compte → pas de bandeau cookies nécessaire
- [x] Sitemap + robots.txt par domaine, pages statiques indexables pour les fiches, canonical, Open Graph
- [x] Email : redirections contact@/bonjour@/admin@/webmaster@/postmaster@/abuse@, SPF, DKIM, DMARC
- [x] DNS : CAA Let's Encrypt
- [x] Cache long sur les fichiers avec empreinte, gzip
- [x] Avis de traduction automatique (breton) avec adresse de retour

À faire :
- [ ] Appliquer la nouvelle config nginx (en-têtes de sécurité, CSP, page 404) :
      `scp deploy/setup-nginx.sh iksaif@iksaif.net:setup-ecoleprimaire.sh && ssh -t iksaif@iksaif.net sudo bash setup-ecoleprimaire.sh`
- [ ] Google Search Console (et Bing Webmaster) : déclarer les deux domaines et leurs sitemaps
- [ ] GitHub Pages : rediriger vers https://ecoleprimaire.app (contenu dupliqué) ou désactiver Pages
- [ ] Déploiement automatique sur le VPS depuis GitHub Actions (clé SSH dédiée, rsync) au lieu du script local
- [ ] Surveillance : sonde de disponibilité (UptimeRobot, Uptime Kuma…) + alerte d'expiration des
      domaines (renouvellement auto désactivé) et des certificats
- [ ] Licence du code et des contenus (le dépôt n'en a pas) : ex. MIT pour le code, CC BY-NC pour les fiches
- [ ] Image Open Graph (aperçu lors d'un partage) pour l'accueil de chaque site
- [ ] Accessibilité : passe clavier / lecteur d'écran (boutons-icônes, contrastes, focus), `lang` des
      contenus français dans l'interface bretonne
- [ ] Relecture pédagogique par un·e enseignant·e (programme 2024) — points ouverts : « fois plus » et
      fractions > 1 au CE2, formulation des divisions au CE2
- [ ] Page « Nouveautés » / changelog et formulaire de retour simple (mailto suffit pour commencer)
- [ ] Mesure d'audience respectueuse si besoin (GoatCounter / Plausible auto-hébergé, sans cookie),
      à mentionner alors dans les mentions légales

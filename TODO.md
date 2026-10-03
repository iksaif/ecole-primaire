# TODO

## En cours (demandes du 2026-10-03, dans l'ordre)

- [x] **Pages de téléchargement** (`scripts/telechargements.mjs`) :
  - [x] filtres : classe, langue des fiches, « 📘 Pour apprendre » / « ✏️ Pour s'entraîner »
  - [x] sélecteur FR / BR de l'interface des pages statiques, partagé avec l'app (même clé localStorage)
  - [x] fiches d'exercices pré-générées : chaque exercice × chaque classe, 4 variantes avec pagination (fr + br)
  - [x] recherche sur l'index (champ + raccourcis `/` et Ctrl/⌘+K)
  - [x] intro de l'index : breton mentionné seulement si la langue régionale est active
  - [ ] calcul mental CM1/CM2 pré-généré : seulement + et − (réglages par défaut) — choisir des opérations par classe
- [ ] **Langue régionale = le contexte, partout** (pas le domaine) :
  - [ ] le réglage « 🏴 Langue régionale » (Paramètres) décide de l'affichage du breton dans l'app ET les pages
        statiques (fiches bretonnes, mentions « français et breton », titres, intros)
  - [ ] défaut : breton activé sur skoolik.app, désactivé sur ecoleprimaire.app ; ensuite c'est le choix de l'utilisateur
  - [x] les deux sites publient les mêmes fiches (fr + br) ; les pages statiques suivent le réglage (lien « afficher le breton »)
  - [x] `.env` / `src/site.js` : ne garder que nom, URL et valeurs par défaut (plus de `fiches: [...]` par site)
  - [ ] app : passe sur tous les textes qui parlent du breton (catalogue, accueil, cartes) pour qu'ils suivent le réglage
- [ ] **Recherche dans l'app** (type Ctrl+K, simple) : activités, pages d'impression, fiches pré-générées
      (`telechargements/fiches.json` généré au build)
- [ ] **Journaux d'usage sans cookie** :
  - [ ] signal léger (même domaine, sans identifiant) à chaque page vue (les routes `#/…` sont invisibles du serveur)
        et à chaque fiche imprimée, avec le type de fiche et ses réglages → savoir quoi pré-générer
  - [ ] nginx : `location = /journal` → 204, journal dédié **sans adresse IP** (format JSON) ; relancer setup-nginx.sh (sudo)
  - [ ] script de stats : pages les plus vues, fiches imprimées (+ réglages), PDF les plus téléchargés
  - [ ] mentions légales : décrire ces statistiques anonymes (exemptées de consentement, CNIL)
- [ ] **Pages de fiches (retours)** :
  - [ ] retirer « ✔️ Gratuit, sans inscription » (peu utile)
  - [ ] ajouter un bouton « 🖨️ Imprimer » sous « Télécharger le PDF » (impression directe du PDF)
  - [ ] affiche de l'alphabet breton : ajouter un mot exemple illustré par lettre — liste de mots bretons
        simples + emoji à vérifier (dictionnaire) avant publication ; aujourd'hui volontairement absent faute de mots vérifiés
- [ ] **Push** de la branche `ce1-ce2-fiches-vps` sur `main` (ou PR) — active la redirection GitHub Pages : en attente de réponse
- [x] Formulation « maternelle et élémentaire » (et pas « maternelle et école primaire ») — à commiter

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
- [x] Page À propos : section « Contribuer » (dépôt GitHub, issues, relecture bretonne)

À faire :
- [ ] Appliquer la nouvelle config nginx (en-têtes de sécurité, CSP, page 404) :
      `scp deploy/setup-nginx.sh iksaif@iksaif.net:setup-ecoleprimaire.sh && ssh -t iksaif@iksaif.net sudo bash setup-ecoleprimaire.sh`
- [ ] Google Search Console (et Bing Webmaster) : déclarer les deux domaines et leurs sitemaps
- [x] GitHub Pages : redirection vers https://ecoleprimaire.app (au prochain push sur `main`)
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

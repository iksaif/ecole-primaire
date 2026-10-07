# Plan 08 — Tests dans le dépôt, page « Nouveautés », retours des utilisateurs

**But** : garder la qualité quand le site évolue, et faciliter les retours.

## A. Rapatrier les tests dans le dépôt

Les tests qui ont servi à tout vérifier vivent dans `/tmp/pw` (hors dépôt, perdus au redémarrage) :

- `i18n-all.mjs` : toutes les routes en français et en breton, erreurs JS et libellés français restés dans
  l'interface bretonne ;
- `cadre-all.mjs` : 22 exercices × 2 langues, mode impression (aperçu, « Nouvelle fiche ») et mode jeu ;
- `effet.mjs` : chaque réglage du mode impression change bien la fiche (avec un hasard reproductible) ;
- `csp-live.mjs`, `cookies.mjs` : CSP, aucun cookie, aucune requête vers un tiers.

Étapes :

1. Créer `tests/` avec ces scripts nettoyés, en paramétrant l'URL (dev, preview ou production), et lancer un
   serveur `vite preview` au besoin.
2. `npm test` : build + preview + tests (environ 5 min). `npm run test:rapide` : routes et cadre seulement.
3. Lancer les tests en CI sur chaque push et chaque PR, avant le déploiement (plan 02).
4. Ajouter des tests de logique en node pour les générateurs (réponses justes, pas de doublon, déterminisme).
   Les agents en ont écrit dans `/tmp/test-agent-*` : à récupérer s'ils existent encore, sinon les réécrire
   pour les générateurs critiques (nombres en lettres FR / BR, calcul, heure, monnaie).

## B. Page « Nouveautés »

1. `CHANGELOG.md`, tenu à la main en phrases simples pour les parents, par date.
2. Route `/#/nouveautes`, qui rend ce fichier (import `?raw`), avec un lien dans le pied de page et à
   l'accueil (« Nouveau : … »).
3. Traduction bretonne des entrées : facultative, sinon affichage en français avec la mention « e galleg ».

## C. Retours depuis le site

1. Bouton « 💬 Signaler une erreur » dans chaque exercice (résultats et correction) et sur chaque page de
   fiche. Il ouvre un `mailto:contact@skoolik.app` prérempli : page, niveau, réglages, question et réponse
   attendue, langue.
2. Les signalements arrivent dans ta boîte (redirection Gandi). Pas de formulaire serveur, donc pas de
   données stockées et pas de spam de formulaire.
3. Variante plus tard : lien vers une issue GitHub préremplie, pour les visiteurs à l'aise avec GitHub.

## Effort

A : une demi-journée. B : 1 heure. C : 2 heures.

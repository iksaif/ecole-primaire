# Plan 13 — Implémentation de la structure du site

Spécification : `plans/12-structure-du-site.md` (décisions) et `plans/maquettes/index.html` + `captures/` (comportement et
aspect de référence ; ses données et son breton sont **inventés** : le vrai site lit les registres, `programme.ts` et
`src/langues/`). Base : branche locale `base-saine`, rien n'est poussé ni déployé.

## Exigences de qualité (valables pour tous les paquets)
- TypeScript strict, aucun `any`, `import type`, extensions `.ts`, `erasableSyntaxOnly`. Un module = un rôle, un en-tête qui
  dit son contrat. Pas de code mort.
- **Aucun texte en dur** : tout passe par les traductions typées (`src/langues/`), breton marqué `// br: à relire`. **Aucun
  `'br'` en dur** : on interroge le registre de langues (capacités) ou les réglages.
- **L'adresse est la source de vérité du contexte** (classes, mode de langue, vue, références) : une adresse partagée
  reconstruit la vue ; le réglage mémorisé n'est qu'un défaut ; une adresse ne modifie pas le réglage mémorisé.
- Logique pure testée en Node (analyse/écriture d'adresses, filtres, repli des domaines, index de recherche, catalogue) ;
  parcours et accessibilité testés dans Chrome (axe-core : 0 violation critique ou sérieuse, 360 et 1280 px, fr et br) ;
  `npm test` reste rapide (objectif ≤ 60 s).
- Les compteurs de `npm run qualite` ne dépassent pas ; `npm run types`, `lint`, `i18n` à 0.
- Les ressources existantes sont les **exemples** et ce qui est porté ; rien d'ancien n'est rebranché.

## Architecture et interfaces partagées
```
src/contexte/   types.ts · url.ts (pur) · useContexte.ts · partage.ts
src/ressources/ types.ts · catalogue.ts (pur) · filtres.ts (pur) · useRessources.ts
src/router/     index.ts (mode history) · routes.ts (table typée) · titres.ts · redirections.ts
src/shell/      AppNav · SelecteurLangue · SelecteurClasse · PastilleProfil · MenuMobile · AppFooter
src/pages/      Accueil · Matiere · Monde · LangueRegionale · Programme · Competence · FichesPretes · Feuille
src/recherche/  index.ts (pur) · useRecherche.ts · Recherche.vue
scripts/        fiches/ (existant) · statique/ (pages HTML par fiche, sitemap, robots, 404) ; deploy/setup-nginx.sh
```
**Contexte** (`src/contexte/types.ts`) : `Mode = 'fr' | 'bilingue' | 'regionale'` ; `Profil = 'enfant' | 'parent' | 'enseignant'` ;
`Contexte = { classes: readonly Classe[]; mode: Mode; regionale: Langue | null; profil: Profil; vue: 'cartes' | 'liste' }`.
Paramètres d'adresse : `classes=ce1,ce2` · `mode=fr|bi|reg` · `reg=<code>` (si plusieurs langues régionales) · `vue=cartes|liste`
· `refs=1` (références officielles du tableau). Le **profil** est un réglage d'appareil, pas d'adresse. Défauts par site :
ecoleprimaire = `fr` ; skoolik = `bilingue`, interface en français. Profils enfant et parent : une classe ; enseignant :
plusieurs. Enfant : classe verrouillée (appui long 2 s).
**Ressource** (`src/ressources/types.ts`) : union `exercice | affiche | fiche | competence | page`, avec `id`, titre (clé de
texte), `matiere` (`maths | francais | monde | regionale`), `domaine: DomaineId`, `classes: Classe[]`, `competences:
CompetenceId[]`, `badges` (`jeu`, `imprimable`), `usage` (`apprendre | sentrainer`), `langues`, `route`. Le catalogue est
construit **purement** à partir des registres d'exercices et d'affiches, de `programme.ts` et de l'index JSON des fiches
prêtes (chargé à l'exécution) ; les exemples n'y entrent qu'en développement. **Un exercice et son générateur de fiche = une
seule ressource à deux badges.**
**Adresses** : `/` · `/maths` `/francais` `/monde` `/<langue régionale>` · `/maths/fiches` (fiches prêtes de la matière) ·
`/telechargements/` (index A→Z) · `/telechargements/<slug>/` (feuille, slug publié inchangé, page HTML statique) ·
`/programme` · `/competence/<id>` · `/parametres` · `/about` · `/nouveautes` · `/dev/*` (développement) · exercices :
la `route` de leur définition. Anciennes adresses `#/…` : redirigées. Titre de document et `<main>` propres à chaque page.

## Paquets
**Phase 1 (en parallèle)** : **P1 contexte + routeur** (adresses propres, redirections, titres, `useContexte`, `url.ts`, `partage.ts`,
règles de profil) ; **P2 ressources** (types, catalogue pur, filtres : classes, mode, repli des domaines hors classe, dérivation des
domaines par cycle depuis le programme, `useRessources`, index de recherche pur).
**Phase 2 (en parallèle, après P1 et P2)** : **P3 shell** (barre, sélecteurs, pastille de profil, menu mobile, pied de page,
contrastes, `<main>`) · **P4 pages** Accueil (3 dispositions, « Reprendre »), Matière (cartes ▦ / liste ☰, domaines repliés,
encart « fiches toutes prêtes »), Le Monde, langue régionale · **P5 Programme + Compétence** (tableau et liste, cellules en
liens, état dans l'adresse, « Copier le lien », références officielles activables) · **P6 Recherche** (palette `Ctrl+K`/`⌘K`/`/`,
filtre de classe, résultats groupés par type, clavier, plein écran sur téléphone) · **P7 Fiches prêtes** (sous-page par matière,
feuille avec aperçu multipage, Télécharger / Imprimer, autres langues, voisines par compétence puis par domaine ; pages HTML
statiques par fiche avec titre, description, canonical, JSON-LD ; sitemap, robots, 404 ; configuration nginx).
**Phase 3** : intégration et tests de bout en bout (liens profonds, adresses partagées, axe, débordement à 320/360 px, SEO des pages
statiques, `npm test` rapide) ; critique adversariale ; corrections ; commits.

## Déploiement (pour plus tard, par l'utilisateur)
Le mode `history` demande à nginx de renvoyer les adresses inconnues vers `index.html` et de servir les pages statiques de
fiches (`deploy/setup-nginx.sh` modifié ; l'exécution avec `sudo` reste à l'utilisateur). Redirection des anciennes adresses `#/…`
par un petit script dans `index.html`.

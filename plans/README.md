# Plans — ce qui reste à faire (mis à jour le 2026-10-07)

Un plan par chantier encore ouvert. Ce dossier est versionné (comme `docs/TODO.md`, qui reste la liste la plus à jour). Un plan fait ou remplacé est supprimé :
son historique est dans git (`git log -- plans/`).

| Plan | Reste à faire | Décision ou action de ta part |
|---|---|---|
| [02 Déploiement automatique](02-deploiement-ci.md) | workflow GitHub Actions → VPS, après la fusion dans `main` | créer la clé SSH et les secrets GitHub |
| [05 Référencement](05-open-graph-seo.md) | image de partage 1200 × 630, Search Console, Bing | te connecter et fournir les codes TXT |
| [06 Accessibilité](06-accessibilite.md) | passe manuelle (clavier, VoiceOver), `lang` des contenus, SVG au clavier | — |
| [07 Relecture pédagogique](07-relecture-pedagogique.md) | cahier de relecture, points ouverts | trouver un·e enseignant·e |
| [09 Programme](09-domaines-programme.md) | décisions de contenu (français) et sources, trous CE2-CM2 | relecture par un·e enseignant·e |
| [10 Méthode qualité](10-qualite-methode.md) | principes, décisions ; Fluent/Weblate, `@playwright/test`, passes de lisibilité | Weblate : quand un relecteur est trouvé |
| 10 Couverture : [PS](10-couverture-ps.md) · [MS](10-couverture-ms.md) · [GS](10-couverture-gs.md) · [CP](10-couverture-cp.md) · [CE1](10-couverture-ce1.md) | les compétences sans ressource (`npm run couverture`) et leurs propositions | décisions de chaque plan |
| [11 Base saine](11-base-saine.md) | règles jusqu'à la fusion ; validation de l'utilisateur | valider, puis fusionner et déployer (`REPRISE.md`) |
| [12 Structure du site](12-structure-du-site.md) | décisions de structure (implémentées) ; redirections avant la mise en ligne | — |
| [Critique des lettres](critique-lettres-2026-10-07.md) | fiche, son des lettres, ouverture à la MS | — |

`maquettes/` : la maquette cliquable de référence de la structure du site (`index.html`, `captures/` ; données et breton inventés).

## Supprimés le 2026-10-07 (faits ou remplacés)

- **01 Traduction** : fait, le système est dans `src/langues/` (catalogues typés, règles, registre). Reste ailleurs : relecture du breton et synthèse vocale (`docs/TODO.md`) ;
  Fluent + Weblate est dans le plan 10.
- **03 Surveillance** : remplacée par Datadog (configuré par l'utilisateur). À retenir : le renouvellement automatique des domaines pixelette.net et pixelette.art est
  **désactivé** et ils expirent le 30/11/2026.
- **04 Licence** : faite (code AGPL-3.0 ; fiches CC BY-NC-SA 4.0, textes et données CC BY-SA 4.0, images : leur licence ; voir `LICENCE-CONTENU.md`).
- **08 Tests, nouveautés, retours** : faits (`tests/`, CI, page « Nouveautés », bouton « Signaler une erreur »).
- **13 Implémentation de la structure** et **consignes aux agents** : faits (`src/contexte/`, `src/ressources/`, `src/router/`, `src/shell/`, `src/pages/`, `src/recherche/`, `src/programme/`).
- **14 Migration restante** : terminée, l'ancien monde est supprimé (`REPRISE.md`).
- **tests-sauvegardes/** : les scripts de test rapatriés dans `tests/`.

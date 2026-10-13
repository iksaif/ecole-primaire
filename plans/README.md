# Plans — ce qui reste à faire (mis à jour le 2026-10-13)

Un plan par chantier encore ouvert. Ce dossier est versionné ; `docs/TODO.md` reste la liste la plus à jour. Un plan fait ou remplacé
est supprimé ou réduit à ses décisions : son historique est dans git (`git log -- plans/`).

| Plan | Reste à faire | Décision ou action de ta part |
|---|---|---|
| [02 Déploiement automatique](02-deploiement-ci.md) | workflow GitHub Actions → VPS | créer la clé SSH et les secrets GitHub |
| [05 Référencement](05-open-graph-seo.md) | image de partage 1200 × 630, Search Console, Bing | te connecter et fournir les codes TXT |
| [06 Accessibilité](06-accessibilite.md) | passe manuelle (clavier, VoiceOver), `lang` des contenus, SVG au clavier | — |
| [07 Relecture pédagogique](07-relecture-pedagogique.md) | cahier de relecture, points ouverts | trouver un·e enseignant·e |
| [09 Programme](09-domaines-programme.md) | décisions de contenu (français) et leurs sources, ce qui n'a pas pu être vérifié | relecture par un·e enseignant·e |
| [10 Méthode qualité](10-qualite-methode.md) | principes et décisions ; Fluent/Weblate, `@playwright/test`, passes de lisibilité | Weblate : quand un relecteur est trouvé |
| [10 Couverture CP-CE2](10-couverture-elementaire.md) | les compétences sans ressource et leurs propositions | décisions D1 à D7 |
| [14 Couverture maternelle](14-couverture-maternelle.md) | lots B à G (trier les images, temps et espace, nombres, français, objets) | décisions du § 5 |
| [15 Ceintures](15-ceintures.md) | ceintures de compétences (chantier en cours, autre session) | questions ouvertes du plan |
| [16 Géométrie du cycle 2](16-geometrie.md) | fait ; reste le breton, les positions relatives, la perspective au CE2 | positions relatives : oui ou non |
| [Critique des lettres](critique-lettres-2026-10-07.md) | fiche, son des lettres, ouverture à la MS | — |

`maquettes/` : la maquette cliquable de la structure du site (`index.html`, `captures/` ; données et breton inventés), gardée comme
référence d'aspect.

## Supprimés

- **2026-10-13** : **11 Base saine** (la base est en ligne ; ses règles sont dans `AGENTS.md`), **12 Structure du site** (implémentée :
  `src/contexte/`, `src/ressources/`, `src/router/`, `src/shell/`, `src/pages/`, `src/recherche/`, `src/programme/` et leurs README),
  **10 Couverture PS, MS, GS** (repris dans le plan 14) et **10 Couverture CP, CE1** (repris dans `10-couverture-elementaire.md`).
- **2026-10-07** : 01 Traduction (fait, `src/langues/`), 03 Surveillance (Datadog ; le renouvellement automatique des domaines
  pixelette.net et pixelette.art est **désactivé**, ils expirent le 30/11/2026), 04 Licence (faite, `LICENCE-CONTENU.md`), 08 Tests,
  nouveautés, retours (faits), 13 Implémentation de la structure (faite), 14 Migration restante (terminée, commit `c088a7b`).

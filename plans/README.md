# Plans — ce qui reste à faire

Un plan par chantier encore ouvert dans `TODO.md` (au 2026-10-03). Chaque plan donne le but, l'état actuel,
les étapes, la façon de vérifier, les décisions à prendre et une estimation. Ce dossier n'est pas versionné,
comme `TODO.md`.

| # | Plan | Points du TODO couverts | Décision ou action de ta part | Effort |
|---|---|---|---|---|
| 01 | [Traduction propre (interface / contenu)](01-traduction.md) | refonte de la traduction, généralisation aux langues régionales, synthèse vocale, relecture du breton | format des catalogues ; trouver un relecteur brittophone | 5 à 6 jours |
| 02 | [Déploiement automatique](02-deploiement-ci.md) | déploiement VPS depuis GitHub Actions | créer la clé SSH et les secrets GitHub | 2 h |
| 03 | [Surveillance](03-surveillance.md) — **remplacé par Datadog** | sonde de disponibilité, expiration des domaines et certificats | UptimeRobot ou Uptime Kuma ; où vérifier les domaines | 1 à 2 h |
| 04 | [Licence](04-licence.md) | licence du code et des contenus | choisir les licences (MIT + CC BY-NC-SA recommandées) | 30 min |
| 05 | [Référencement](05-open-graph-seo.md) | image de partage, Search Console, Bing | te connecter à Search Console et Bing | 1 h |
| 06 | [Accessibilité](06-accessibilite.md) | passe clavier et lecteur d'écran, `lang` des contenus | — | 1 à 2 jours |
| 07 | [Relecture pédagogique](07-relecture-pedagogique.md) | relecture par un·e enseignant·e, points ouverts CE2 | trouver un·e enseignant·e | 2 h + retours |
| 08 | [Tests, nouveautés, retours](08-qualite-tests-retours.md) | page « Nouveautés », retours, tests dans le dépôt | — | 1 jour |

## Ordre conseillé

1. **04 Licence** et **05 Référencement** : rapides, et utiles dès maintenant puisque le site est public.
2. **08-A Tests dans le dépôt**, puis **02 Déploiement automatique** : les tests protègent le déploiement
   automatique.
3. **03 Surveillance** : surtout l'alerte d'expiration des domaines, puisque pixelette.net et pixelette.art
   expirent le 30/11/2026.
4. **07 Relecture pédagogique** et **01 Traduction**, en parallèle : la relecture dépend de personnes
   extérieures, la traduction est le plus gros chantier technique.
5. **06 Accessibilité**, puis **08-B/C** (nouveautés, retours).

## Sauvegarde des tests

`tests-sauvegardes/` contient les scripts Playwright et node écrits pendant le développement : routes en
français et en breton, modes impression et jeu, effet de chaque réglage sur la fiche, CSP, cookies, index des
fiches, recherche, visionneuse. Avant, ils n'existaient que dans `/tmp`. Le plan 08 les rapatrie dans
`tests/`.

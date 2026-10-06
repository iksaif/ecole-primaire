# Programmes officiels (texte)

Le texte des programmes en vigueur, extrait des PDF officiels pour pouvoir le chercher et le citer en codant
(`rg "bande numérique" docs/programmes`). Le PDF fait foi : l'extraction (`pdftotext`) peut abîmer les tableaux et
les colonnes. Chaque fichier a une section « Page N » par page du PDF : ce sont les numéros utilisés par les champs
`page` des sources de `src/data/programme.ts`.

| Fichier | Contenu |
|---|---|
| `bo41.md` | BO n° 41 du 31 octobre 2024 : cycle 1 (langage, mathématiques) et cycle 2 (français, mathématiques) |
| `c2maths.md` | Programme de mathématiques du cycle 2 (annexe 4 du BO n° 41), pages de l'annexe |
| `bo19.md` | BO n° 19 du 7 mai 2026 : programme complet de l'école maternelle (cycle 1) |
| `c1consolide.md` | Programme de l'école maternelle consolidé (Éduscol, d'après les BO n° 41 et n° 19) |
| `c3maths.md` | Programme de mathématiques du cycle 3 (BO n° 16 du 17 avril 2025) |
| `c3francais.md` | Programme de français du cycle 3 (BO n° 16 du 17 avril 2025) |
| `c2sciences.md`, `c3sciences.md` | Programmes de sciences et technologie des cycles 2 et 3 (annexes 1 et 2 de l'arrêté du 5 juin 2026, BO n° 24 du 11 juin 2026) : CP et CM1 à la rentrée 2026, CE1, CE2, CM2 à la rentrée 2027 |
| `c2histgeo.md`, `c3histgeo.md` | Programmes d'histoire-géographie des cycles 2 et 3 (annexes 3 et 4 de l'arrêté du 22 avril 2026, BO n° 22 du 28 mai 2026) : même calendrier d'application |
| `emc.md` | Programme d'enseignement moral et civique du CP à la terminale (annexe de l'arrêté du 29 mai 2024, BO n° 24 du 13 juin 2024) ; seul le primaire est utilisé |
| `exemplesCM1.md`, `exemplesCM2.md`, `exemples6e.md` | Exemples de réussite en français (Éduscol, 2025) |

Les adresses des PDF sont dans `SOURCES` (`src/data/programme.ts`) et en tête de chaque fichier. Ce sont des textes
officiels publiés par le ministère de l'Éducation nationale ; ils sont repris ici tels quels, pour référence.

Pour les régénérer : télécharger chaque PDF de `SOURCES` puis `pdftotext -enc UTF-8 fichier.pdf -` (Poppler,
`brew install poppler`), une section par saut de page (`\f`).

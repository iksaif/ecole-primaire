# Prompt : (re)tagger la confiance d'une traduction bretonne

À donner à un agent (Claude Code), en remplaçant `{RESSOURCES}` (ex. `exercice:heure, affiche:corps`, ou « toutes celles que `npm run confiance` donne comme jamais évaluées »). Une ressource
déjà évaluée se **réévalue** de la même façon. Pour **traduire** de nouveaux textes : `prompt-traduire.md`.

---

Tu évalues la fiabilité des textes bretons de ces ressources : {RESSOURCES}.

Lis d'abord `docs/confiance-breton/README.md` (échelle 0 à 4 et méthode), `docs/confiance-breton/sources.md` (**les sources, classées de 1 à 6 : un mot est de classe A selon le rang de
sa source**), `docs/confiance-breton/lexique-academie.md` et `src/langues/confiance.ts`. Respecte `AGENTS.md` : n'invente jamais de breton, ne modifie aucun texte, et ne présente pas du breton non
vérifié comme sûr.

Pour chaque ressource :

1. Trouve ses textes bretons : `src/exercices/<id>/textes.ts` (bloc `br: { … }`) ou `src/affiches/<id>/textes.ts` (bloc `br: { … }`), ainsi que les listes de mots qu'elle utilise
   (`src/langues/br/donnees.ts`, `src/affiches/listeMots.ts`) et les mots communs (`src/langues/br/textes/communs.ts` : prénom, date, corrigé). Ne garde que ce qui s'imprime ou s'affiche à l'enfant
   (consignes, mots, phrases, corrigés) ; les titres et descriptions du catalogue ne comptent que s'ils sont longs.
2. Si des textes sont relus (marqueur `// br: à relire` absent **et** relecture connue dans `git log` ou dans `docs/`), cherche qui a relu et quand. Sans preuve, un texte sans marqueur n'est
   **pas** relu : le marqueur manque seulement pour les textes de départ vérifiés (nombres, alphabet, jours, mois).
3. **Classe chaque texte A, B ou C** en cherchant dans l'ordre des rangs de `sources.md` : d'abord les textes de l'académie (`rg -n "<mot>" docs/programmes/breton*.md`), puis **Geriafurch**
   (`WebFetch https://geriafurch.bzh/fr/brfr/<mot>`, qui nomme la source de chaque entrée : Termofis et Favereau pèsent plus que Glosbe), puis Wikeriadur/Wiktionnaire. Pour chaque mot, note la
   **source et son rang**. Un mot introuvable, ou trouvé avec un autre sens, est de classe C.
4. **Rétro-traduis** les textes de classe B et C les plus imprimés avec Troer (voir `sources.md`) et compare au français d'origine : un contresens se signale en tête de liste de relecture. Cela ne
   change jamais une classe vers le haut.
5. Calcule le niveau de la ressource (maillon le plus faible) et le score indicatif. Puis regarde ses fiches (affiches : une par variante ; exercices : une par classe et par compétence) : si une fiche
   n'imprime que des textes de meilleure classe que la ressource, propose une exception `'fiche:<slug>'` (slug publié, suffixe de langue compris ; `npm run fiches`).
6. Rends, pour chaque ressource, une entrée prête à coller dans `src/langues/br/confiance.ts` :

```ts
'affiche:corps': { niveau: 1, le: 'AAAA-MM-JJ', par: 'assistant', note: 'Pourquoi ce niveau : n textes A, n B, n C ; les C sont … ; sources (rang) : …' },
```

   et un tableau récapitulatif : ressource, nA / nB / nC, score, niveau, **écarts trouvés** (un mot que l'académie ou Termofis écrit autrement que nous, un contresens de la rétro-traduction), textes C à faire
   relire en priorité (clé et texte).

Règles : `par: 'assistant'` ; `relecteur` et les niveaux 3 et 4 sont réservés aux relectures humaines (jamais de nom, seulement le rôle). Mets à jour `src/langues/br/confiance.ts` seulement si on te le
demande, puis lance `node --no-warnings tests/confiance.test.mjs` et `npm run confiance`. Aucun commit.

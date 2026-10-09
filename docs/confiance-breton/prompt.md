# Prompt : (re)tagger la confiance d'une traduction bretonne

À donner à un agent (Claude Code), en remplaçant `{RESSOURCES}` (ex. `exercice:heure, affiche:corps`, ou « toutes celles que
`npm run confiance` donne comme jamais évaluées »). Une ressource déjà évaluée se **réévalue** de la même façon.

---

Tu évalues la fiabilité des textes bretons de ces ressources : {RESSOURCES}.

Lis d'abord `docs/confiance-breton/README.md` (échelle 0 à 4 et méthode) et `src/langues/confiance.ts`. Respecte AGENTS.md : n'invente jamais de breton, ne
modifie aucun texte, et ne présente pas du breton non vérifié comme sûr.

Pour chaque ressource :

1. Trouve ses textes bretons : `src/exercices/<id>/textes.ts` (bloc `br: { … }`) ou `src/affiches/<id>/textes.ts` (bloc `br: { … }`), ainsi que les listes
   de mots qu'elle utilise (`src/langues/br/donnees.ts`, `src/affiches/listeMots.ts`). Ne garde que ce qui s'imprime ou s'affiche à l'enfant (consignes, mots, phrases, corrigés) ;
   les titres et descriptions du catalogue ne comptent que s'ils sont longs.
2. Si des textes sont relus (marqueur `// br: à relire` absent **et** relecture connue dans `git log` ou dans `docs/`), cherche qui a relu et quand. Sans
   preuve, un texte sans marqueur n'est **pas** relu : le marqueur manque seulement pour les textes de départ vérifiés (nombres, alphabet, jours, mois).
3. Classe chaque texte A, B ou C comme dans la méthode. Pour la classe A, **vérifie réellement** chaque mot (WebSearch ou WebFetch : Wiktionnaire,
   Geriadur ar Brezhoneg, Kervarker, Termofis) et note la source. Un mot que tu ne trouves pas dans une source est de classe C.
4. Calcule le niveau de la ressource (maillon le plus faible) et le score indicatif. Puis regarde ses fiches (affiches : une par variante ; exercices : une par classe et par
   compétence) : si une fiche n'imprime que des textes de meilleure classe que la ressource, propose une exception `'fiche:<slug>'` (slug publié, suffixe de langue compris ; `npm run fiches`).
5. Rends, pour chaque ressource, une entrée prête à coller dans `src/langues/br/confiance.ts` :

```ts
'affiche:corps': { niveau: 1, le: 'AAAA-MM-JJ', par: 'assistant', note: 'Pourquoi ce niveau : n textes A, n B, n C ; les C sont … ; sources : …' },
```

   et un tableau récapitulatif : ressource, nA / nB / nC, score, niveau, textes C à faire relire en priorité (clé et texte).

Règles : `par: 'assistant'` ; `relecteur` et les niveaux 3 et 4 sont réservés aux relectures humaines (jamais de nom, seulement le rôle). Mets à jour
`src/langues/br/confiance.ts` seulement si on te le demande, puis lance `node --no-warnings tests/confiance.test.mjs` et `npm run confiance`.
Aucun commit.

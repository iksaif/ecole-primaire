# Prompt : traduire un texte en breton avec les sources connues

À donner à un agent (Claude Code), en remplaçant `{TEXTES}` (les textes français à traduire, avec leur clé et leur fichier, ou : « les textes bretons marqués à relire de {RESSOURCE} à
améliorer »). Il produit une proposition **sourcée**, jamais présentée comme sûre.

---

Tu traduis en breton ces textes du site : {TEXTES}. Lis d'abord `AGENTS.md` (règles du breton : n'invente rien ; les nombres, l'alphabet, les jours et les mois sont vérifiés, ne les change pas ;
chaque texte breton nouveau est marqué `// br: à relire`) et `docs/confiance-breton/sources.md` (les sources, du plus sûr au moins sûr).

Pour chaque texte :

1. **Cherche d'abord une phrase déjà attestée.** `rg -n "<mot ou tournure>" docs/programmes/breton*.md` et `docs/confiance-breton/lexique-academie.md` : consignes (`Skriv(it)`, `Liv(it)`, `Kelc’h(it)`, `Lak(it)… en urzh mat`),
   maths (`Ouzhpennañ a ran…`, `Pet unanenn / degad / kantad zo ?`, `Sammañ, lemel, lieskementiñ, rannañ`), formules de classe. **Réutilise ces phrases telles quelles**, en remplaçant
   seulement les variables : c'est le moyen le plus sûr.
2. **Vérifie chaque mot** qui n'est pas dans ces textes : Geriafurch (`WebFetch https://geriafurch.bzh/fr/brfr/<mot>` ; `…/fr/frbr/<mot>` pour français → breton). Note, pour chaque nom, son **genre** (`m.` / `f.`) et son
   **pluriel** et la **source** affichée (Termofis et Favereau d'abord). Un mot absent est à signaler, pas à deviner. Pas de calque du français ni de mot inventé.
3. **Construis simple** : phrases courtes, impératif pour les consignes (`Skrivit`, `Liv(it)`), pas de subordonnée, pas de forme rare. Applique les mutations avec le **genre vérifié** (article `ar`/`an`,
   `ur`/`un`, possessifs, après `e`, `a`, nombres : *daou/div*, *tri*…) ; si tu n'es pas sûr d'une mutation, évite la tournure ou signale-la.
4. **Rétro-traduis** avec Troer (voir `sources.md`) et compare au français d'origine. Si le sens diffère, reprends la phrase.
5. **Écris** la traduction dans le fichier de textes (`src/exercices/<id>/textes.ts`, `src/affiches/<id>/textes.ts`, `src/langues/br/textes/<section>.ts`), avec `// br: à relire` sur la ligne
   et un commentaire court quand une source la justifie (`// académie A1-A2 p. 8`). Ne touche pas aux textes déjà vérifiés. Si le texte est imprimé sur une fiche, les instantanés changent :
   `npm run instantanes -- --diff <cas>`, regarder, puis `--maj` (à justifier dans le commit).
6. **Classe chaque texte** (A, B, C comme dans `README.md`) et **rends** un tableau :

| clé | français | breton proposé | classe | sources (rang) | rétro-traduction | à faire relire ? |
|---|---|---|---|---|---|---|

Termine par : les mots sans source (à faire vérifier par un·e brittophone), les mutations incertaines, et le niveau que la ressource pourrait atteindre
(`src/langues/br/confiance.ts`, à mettre à jour seulement si on te le demande ; la table garde le niveau le plus bas). Aucun commit.

# Sources pour traduire et vérifier le breton, classées par fiabilité

Utilisées par les deux prompts (`prompt-traduire.md`, `prompt.md`). Du plus sûr au moins sûr. **Une source de rang 1 à 3 suffit pour un mot de classe A** ; au rang 4, il en faut
deux qui concordent (ou une dont la source nommée est de rang 3) ; au rang 5, jamais seul ; au rang 6, jamais. Toujours **citer la source** dans la note de `src/langues/br/confiance.ts`.

| Rang | Source | Ce qu'elle atteste | Comment la consulter | Effet sur le niveau |
|---|---|---|---|---|
| **1** | Relecture par un·e brittophone ou un·e enseignant·e de breton | un texte entier, mots, mutations, tournures | document `/dev/relecture-breton` (PDF à imprimer) ; on note le rôle, la date | niveau 3 ou 4 (ressource entière relue) |
| **2** | **Textes de l'académie de Rennes** (consignes, formulations, maths) | des mots **et des phrases entières** employées en classe | `docs/programmes/bretonA1.md`, `bretonA1A2.md`, `bretonA2B1.md`, `bretonCP.md` ; `rg -n "<mot>" docs/programmes/breton*.md` ; `lexique-academie.md` | classe A (la phrase copiée telle quelle est A ; avec nos variables, B) |
| **3** | **Termofis** (Office public de la langue bretonne : terminologie), **Favereau** (dictionnaire de référence), **Devri**, **Brezhoneg21** (dictionnaire des sciences et des techniques) | un mot, son **genre**, son **pluriel**, son domaine | **Geriafurch** : `https://geriafurch.bzh/fr/brfr/<mot>` (breton → français), `https://geriafurch.bzh/fr/frbr/<mot>` (français → breton) ; il nomme la source de chaque entrée | classe A pour le mot seul |
| **4** | Wikeriadur (br.wiktionary), Wiktionnaire fr/en, Preder, Glosbe (agrège sans contrôle : lire sa source affichée) | un mot, parfois un exemple | `https://glosbe.com/fr/br/<mot>` ; `https://fr.wiktionary.org/wiki/<mot>` ; Wikeriadur | A si deux sources concordent ; sinon B |
| **5** | Ressources pédagogiques (TES de Canopé : imagiers, manuels ; `brezhoneg.bzh/100-geriaouegi.htm`), listes de l'école, `AGENTS.md` (nombres, alphabet, jours, mois) | l'usage à l'école ; pour les nombres, l'alphabet, les jours et les mois, la vérification est faite : ne pas y toucher sans source | `https://www.reseau-canope.fr/tes/` | indice : B (A pour les listes déjà vérifiées d'`AGENTS.md`) |
| **6** | **Traducteurs automatiques** : Troer de l'OPLB (`https://niverel.brezhoneg.bzh/fr/troer/`), Google Traduction | rien : un second avis | **rétro-traduction** breton → français d'un texte de la ressource, à comparer au français d'origine (voir ci-dessous) | jamais A ; une divergence = à relire en priorité |
| — | **Notre propre traduction** (automatique, non relue) | rien | — | classe C tant que rien de plus haut ne l'atteste |

Un mot absent de Geriafurch (« Aucun résultat ») n'est pas faux : il n'est pas attesté. Un mot trouvé avec un autre sens (« skript » = script informatique, « treuzkiz » = diamètre) n'atteste
pas notre emploi.

## Rétro-traduction avec Troer (rang 6, mais très utile)

Traduire **nos textes bretons vers le français** avec Troer et comparer au français d'origine détecte les contresens que ni un dictionnaire ni nous ne voyons (exemple du 2026-10-09 :
« gromm ar strollad » est rendu « le groupe a plus de courbe » : *gromm* veut dire « courbe », « entourer » s'écrit « Kelc’h(it) » chez l'académie).
Troer est une page qui s'exécute dans le navigateur : on la pilote avec Chrome sans interface (playwright-core, comme les tests), **une phrase à la fois, à cadence lente** (environ
5 s), jamais en rafale. Le texte part chez l'éditeur du service (rien à voir avec notre site). Remplacer les `{variables}` par un nombre. Limite : 5 000 caractères.
Gabarit de script : `scripts/dev/` n'en garde pas ; en écrire un jetable dans le dépôt (il importe playwright-core), le supprimer ensuite.

| Retour de Troer | Verdict |
|---|---|
| même sens que le français d'origine | indice favorable : la phrase reste C, relecture moins urgente |
| sens différent ou incompréhensible | **à corriger ou à relire en priorité**, à noter dans la liste de relecture |
| diffère sur un mot que l'académie ou Termofis attestent | **le rang le plus haut l'emporte** : Troer rend « sammadennoù » par « fardeaux » et « lamadennoù » par « sauts » (*sammañ* = charger, *lamañ* = sauter), alors que l'académie écrit « Ur sammadenn eo. Ul lamadenn eo » (addition, soustraction) : on garde l'académie et on note l'écart |
| rend le français d'origine mot pour mot, y compris des mots français | texte probablement recopié du français : C |

Essai du 2026-10-09 (15 titres de calcul mental) : « Jediñ e penn » → « Calculer en tête », « taolenn lieskementiñ 2 » → « tableau multiplication 2 » (sens juste) ; « sammadennoù » et « lamadennoù » mal rendus, comme ci-dessus.

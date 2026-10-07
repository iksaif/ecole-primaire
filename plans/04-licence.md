# Plan 04 — Licence du code et des contenus

**But** : dire clairement ce que les gens ont le droit de faire avec le code et les fiches. Le dépôt n'a
aujourd'hui aucune licence, ce qui veut dire « tous droits réservés » par défaut, même si le dépôt est public.

## Ce qui est déjà sous licence (à respecter et à citer)

- Polices : Playwrite FR Trad, Andika, OpenDyslexic (SIL OFL 1.1) ; Luciole (CC BY 4.0, attribution
  obligatoire, déjà faite dans le README et les mentions légales).
- Emojis : rendus par la police du système, rien à redistribuer.

## Options

| Partie | Option A (simple) | Option B (protège la gratuité) |
|---|---|---|
| Code | MIT | AGPL-3.0 (un site dérivé doit publier son code) |
| Fiches, exercices, textes | CC BY 4.0 | CC BY-NC-SA 4.0 (pas d'usage commercial, partage à l'identique) |

**Recommandation** : code sous **MIT**, contenus sous **CC BY-NC-SA 4.0**. Les enseignants peuvent
photocopier, modifier et partager, mais personne ne peut vendre les fiches. C'est l'usage courant pour les
ressources scolaires.

## Étapes

1. Choisir les licences (décision à prendre).
2. Ajouter `LICENSE` (code) et `LICENSE-CONTENUS.md` (contenus), avec la liste des exceptions : polices et
   leurs licences.
3. Mettre à jour le README (section « Licence »), la page Mentions légales (« Contenus ») et le pied des
   pages statiques et des PDF : une ligne discrète « CC BY-NC-SA — ecoleprimaire.app » en bas des fiches
   générées, dans `documentImpression`.
4. Ajouter `"license": "MIT"` dans `package.json`.
5. **Contributions** : préciser dans le README que les contributions sont acceptées sous les mêmes licences.

## Décisions à prendre

MIT ou AGPL pour le code ? CC BY ou CC BY-NC-SA pour les contenus ? Une mention en bas des PDF, oui ou non ?

## Effort

30 minutes une fois la décision prise.

# Agents critiques d'une ressource (exercice, fiche à imprimer, affiche)

À la création ou au report d'une ressource — **exercice** en ligne, exercice **à imprimer** (« fiche seule » : écriture, calcul…) ou
**affiche** — (`npm run nouveau`, report depuis `ancien.js` ou depuis `src/impression/`), l'agent qui l'a écrite **propose** à
l'utilisateur de faire passer deux regards critiques, en lecture seule, avant de la considérer comme finie :

| Prompt | Point de vue | Ce qu'il cherche |
|---|---|---|
| [`enfant.md`](enfant.md) | un enfant de la classe visée | comprendre quoi faire sans lire (maternelle), avoir une vraie tâche, ne pas être piégé ni s'ennuyer |
| [`enseignant.md`](enseignant.md) | un·e enseignant·e de la classe | conformité au programme, progression, fiche utilisable en classe, consignes justes |

## Comment s'en servir

1. Remplacer dans le prompt `{RESSOURCE}` (« l'exercice lettres », « l'affiche horloge »…), `{DOSSIER}` (ex. `src/exercices/lettres/`,
   `src/affiches/horloge/`), `{ROUTE}` (ex. `/maternelle/lettres`, `/imprimer/affiches?affiche=horloge`) et `{CLASSES}` (ex. `GS, CP`).
2. Préparer ce que l'agent regardera : captures du jeu, de la fiche ou de l'affiche (une par classe ou par variante, en français et en breton si le contenu est
   traduit), prises avec le serveur de dev (`npm run dev`) et Chrome (playwright-core), dans le dossier temporaire de la session.
3. Lancer un agent par prompt (en parallèle), **en lecture seule** : il ne modifie aucun fichier, il rend une liste.
4. Trier les retours avec l'utilisateur : ce qui est un bug (programme, sens) se corrige ; ce qui est un choix va dans `docs/TODO.md`.

Les deux prompts rendent le même format : des constats classés du plus grave au moins grave, chacun avec la classe concernée, ce
qui se passe (preuve : fichier et ligne, ou capture), pourquoi c'est un problème pour l'enfant ou en classe, et une proposition.

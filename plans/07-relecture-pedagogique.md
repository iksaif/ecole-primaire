# Plan 07 — Relecture pédagogique par un·e enseignant·e

**But** : faire valider les contenus par une ou un professeur des écoles, sur le programme 2024 et la
justesse des exercices, sans lui demander de naviguer dans tout le site.

## Points ouverts connus

- CE2 : la comparaison multiplicative « fois plus » est-elle au programme ? (`ProblemesView`,
  `NIVEAUX.ce2.categories`, 'foisPlus')
- CE2 : fractions plus grandes que 1 et droite graduée de 0 à 2 ? (`FractionsView`, `droiteUnites`)
- CE2 : la division s'affiche « 42 ÷ 6 = ? ». Le programme parle plutôt de « combien de fois 6 dans 42 ? »
  (`CalcuMentalView`).
- Seuils par niveau des fiches de calcul (`src/impression/calcul.js`) : tables 2-5 et 10 au CE1, ÷ et restes
  au CM.
- Doubles et moitiés au CE1 (jusqu'à 20, plus 25, 30… 50) ; la moitié de 50 est désormais incluse.
- Lignage Seyès : 3 mm au CP, 2,5 mm au CE1, 2 mm au CE2 et après. À confirmer.
- Familles de lettres en cursive (rondes, boucles, coupes, ponts, jambages) : à confirmer selon la méthode de
  l'école.
- Formes : un carré légèrement tourné peut passer pour un rectangle (`FormesView`).
- Dictée : page « Mots à apprendre » trop découpée quand il y a peu de mots dans beaucoup de catégories.

## Étapes

1. **Cahier de relecture** généré (`scripts/cahier-relecture.mjs`) : un PDF ou une page HTML avec, pour
   chaque exercice et chaque niveau, 10 questions tirées au hasard et leurs réponses, plus les points ouverts
   ci-dessus formulés en questions. L'enseignant·e peut l'annoter sur papier.
   On réutilise la génération des fiches d'exercices (`src/impression/exercices.js`, mode impression avec
   corrigé), en ajoutant les questions « à l'écran » pour les exercices sans fiche.
2. **Formulaire de retour** : un mailto prérempli depuis chaque exercice (« Signaler une erreur dans cet
   exercice »), avec la page, le niveau, la question en cours et la réponse attendue (voir le plan 08).
3. Faire passer les corrections une par une, avec un commit par sujet. Les points tranchés quittent cette
   liste.
4. Mettre à jour la page À propos : « Relu par … », si la personne est d'accord pour être citée.

## À faire de ton côté

Trouver une ou un enseignant·e, idéalement de l'école des enfants (filière bilingue pour la partie
bretonne), et lui proposer le cahier.

## Effort

Génération du cahier : 2 heures. Corrections : selon les retours.

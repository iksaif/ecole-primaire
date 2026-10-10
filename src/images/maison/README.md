# Dessins maison au style OpenMoji

Quand [OpenMoji](https://openmoji.org) n'a pas l'image qu'il faut (le cou, le tronc, le ventre…), on la dessine ici, **au même style**, pour
qu'elle se mêle aux autres sur une fiche ou une affiche. Un fichier par dessin : `src/images/maison/<nom>.svg`.

## Pour en ajouter un

1. Dessiner `<nom>.svg` en suivant les règles ci-dessous (on peut partir d'un fichier voisin).
2. L'inscrire dans `src/images/tables.ts` : `<nom>: 'maison:<nom>'` (le nom de la table peut différer du nom du fichier).
3. `node scripts/generer/images.ts` : le dessin entre dans `src/images/donnees/` (couleur, et contour déduit : aplats → blanc ; une
   retouche à la main va dans `<nom>.contour.svg`) et se rend comme un OpenMoji, avec le rendu reçu (`ctx.images`, `imagesDe(params)` :
   `src/images/README.md`), balise marquée `data-image="maison"`. Regarder aussi le contour.
4. `node tests/images.test.mjs`, puis regarder le dessin **à côté de vrais OpenMoji** (une carte d'affiche, ou une page d'essai).
5. Pour une affiche de maternelle : proposer un regard critique « enfant » et « enseignant·e » (`docs/critiques/`) : un dessin qui se lit
   comme un visage, un vêtement ou un objet est le défaut le plus fréquent.

## Règles (celles du [guide d'OpenMoji](https://openmoji.org/styleguide/))

- Cadre `viewBox="0 0 72 72"` (le script le vérifie), sujet entier dans une marge d'environ 4 à 68, sans débord.
- Contour noir `#000`, épaisseur `2`, bouts et angles arrondis (`stroke-linecap="round" stroke-linejoin="round"`).
- Aplats seulement. Peau `#FCEA2B`, ombre de peau `#F1B31C` sur un côté du volume ; bleus `#61B2E4`, `#92D3F5` ; brun `#A57939` ;
  rouge `#EA5A47` ; vert `#B1CC33` (palette d'OpenMoji).
- Ni `id`, ni dégradé, ni renvoi (`url(#…)`), ni texte, ni script : le dessin est copié tel quel, plusieurs fois par page.
- Pas de traits qui se lisent comme un visage (deux points et un arc) sur un dessin qui n'en est pas un.

## Licence

Ces dessins suivent le style d'OpenMoji (CC BY-SA 4.0) ; ils sont publiés sous la même licence, avec le reste du contenu (`LICENCE-CONTENU.md`).

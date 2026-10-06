// Exemple d'exercice à corpus — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton).
// Un catalogue FRANÇAIS SEULEMENT : `catalogue({ … })` sans traduction. Il reste vérifié (clés lues par `T`, mots communs
// — « corrige » — repris de la section `communs`), et rien n'oblige à écrire du breton qu'on ne veut pas ; si l'exercice en
// reçoit un jour : `catalogue({ … }, { br: { … } })`, et le compilateur exige alors les mêmes clés.
// Les textes de l'INTERFACE (réglages, jeu), eux, sont traduits : src/langues/<langue>/textes/exempleCorpus.ts.
// Les mots à deviner sont dans un corpus, pas dans un catalogue : src/data/exemple-corpus.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Les synonymes',
  consigneFiche: 'Coche le mot qui veut dire presque la même chose que le mot en gras.',
})

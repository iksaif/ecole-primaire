// Grammaire — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton). Ce sont les textes français de
// l'interface (src/langues/fr/textes/grammaire.ts) : la fiche écrit les mêmes consignes, libellés et corrigés que le jeu, en français.
// Le générateur demande ses textes calculés (consignes, explications, solutions) à un traducteur : celui du jeu (l'interface) ou celui-ci.
// UN SEUL catalogue pour les cinq exercices de grammaire (chacun le reprend dans son textes.ts) ; il ajoute le titre de la fiche de chacun :
// `titreFiche_<exercice>` (fiche.ts le choisit d'après les types de questions tirés).
import { catalogue } from '../../langues/catalogue.ts'
import textesFr from '../../langues/fr/textes/grammaire.ts'

export const CONTENU = catalogue({
  ...textesFr,
  titre: 'Grammaire',
  titreFiche_phrase: 'La phrase',
  titreFiche_mots: 'La nature des mots',
  titreFiche_sujetVerbe: 'Le sujet et le verbe',
  titreFiche_accords: 'Genre, nombre et accords',
  titreFiche_complements: 'Les compléments',
})

/** Le type du catalogue : sert de type de clés au générateur et à la fiche. */
export type ContenuGrammaire = typeof CONTENU

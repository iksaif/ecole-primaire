// Lecture — textes de CONTENU, toujours en français (`contenu: 'fr'`) : les titres et consignes de la fiche. Les textes de l'INTERFACE
// (réglages, jeu) sont dans src/langues/<langue>/textes/lecture.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titreTexte: 'Fiche de lecture — {n}',
  consigneTexte: "Lis chaque phrase ou histoire à haute voix, puis colorie l'étoile :",
  titreSyllabes: 'Compter les syllabes — {n}',
  consigneSyllabes: 'Écris le nombre de syllabes pour chaque mot :',
  uniteSyllabes: 'syllabes',
  titreMots: 'Reconstituer des mots — {n}',
  consigneMots: 'Remets les syllabes dans le bon ordre pour écrire les mots :',
  corrige: 'Corrigé',
})

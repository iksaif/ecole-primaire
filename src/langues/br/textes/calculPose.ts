// Textes de l'interface — calcul posé (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier
// par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/calculPose.ts'

export default {
  titre: 'Jedadur lakaet', // br: à relire (« calcul posé »)
  description: 'Sammadennoù, lamadennoù ha liesadennoù e bannoù', // br: à relire
  operation: 'Oberiadur',
  addition: 'Sammadenn',
  soustraction: 'Lamadenn',
  multiplication: 'Liesadenn', // br: à relire
  melange: 'Kemmesket',
  taille: 'Ment an niveroù',
  aideNiveaux: 'Er CP : sammadennoù lakaet hepken. Al lamadennoù lakaet a grog er CE1.', // br: à relire
  chiffre1: '1 sifr',
  chiffres: '{n} sifr',
  retenue: "Dalc'h", // br: à relire (« dalc'h » = retenue)
  sansRetenue: "Hep dalc'h", // br: à relire
  avecRetenue: "Gant dalc'h", // br: à relire
  nbExercices: 'Niver a boelladennoù',
  chiffreN: 'Sifr {n}', // br: à relire
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  laBonneReponse: 'Ar respont mat a oa {r}',
} satisfies Traductions<typeof fr>

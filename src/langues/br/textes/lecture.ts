// Textes de l'interface — lecture (breton). Mêmes clés que fr/textes/lecture.ts. Traduction automatique : chaque texte marqué
// « br: à relire » est à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/lecture.ts'

export default {
  titre: 'Lenn',
  description: 'Kontañ ar silabennoù, adsevel gerioù, lenn a vouezh uhel', // br: à relire
  mode: 'Poelladenn',
  syllabes: 'Silabennoù',
  syllabesDesc: 'Kont silabennoù ur ger', // br: à relire
  mots: 'Adsevel ur ger',
  motsDesc: 'Laka ar silabennoù en urzh mat',
  texte: 'Lenn testennoù',
  texteDesc: 'Lenn frazennoù pe istorioù ha selaou ar gerioù',
  nbQuestions: 'Niver a goulennoù', // br: à relire
  cleApiOpt: '(diret — evit lenn istorioù nevez bepred)', // br: à relire
  cleAucune: "Alc'hwez ebet — testennoù al levraoueg", // br: à relire
  generation: 'O krouiñ an istor…',
  combienSyllabes: 'Pet silabenn a zo er ger-mañ ?',
  consigneMots: 'Adsav ar ger en ur glikañ war ar silabennoù en urzh mat :',
  consigneTexte: 'Lenn an destenn-mañ a vouezh uhel. Klik war ur ger evit e selaou :',
  ecouterTout: 'Selaou pep tra',
  arreter: 'Paouez',
  jaiLu: 'Lennet em eus ! 👍',
  erreurSyllabes: '{n} silabenn a zo e « {mot} » : {syll}',
  erreurOrdre: 'An urzh mat a oa : {syll} → {mot}',
} satisfies Traductions<typeof fr>

// Textes de la page de développement /dev/relecture-breton (breton). Traduction automatique : tous les passages sont à faire vérifier par
// un·e brittophone. Page visible seulement avec `npm run dev`.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/relecture.ts'

export default {
  titre: 'Adlenn ar brezhoneg', // br: à relire
  intro: 'Un darn vras eus an destennoù brezhonek a zo bet troet ent emgefreek. Ar bajenn-mañ a aozañ un teul da voullañ (pe da enrollañ e PDF) evit e reiñ d’ur brezhonegerez·ez : evit pep testenn, ar galleg, ar brezhoneg a-vremañ ha plas evit skrivañ ar reizhadenn.', // br: à relire
  quoi: 'Peseurt testennoù', // br: à relire
  aRelire: 'Ar re da adlenn hepken', // br: à relire
  tous: 'An holl destennoù', // br: à relire
  sources: 'A-belec’h e teu an destennoù', // br: à relire
  source: {
    interface: 'Etrefas al lec’hienn', // br: à relire
    exercice: 'Endalc’had ar poelladennoù', // br: à relire
    affiche: 'Testennoù an afichoù', // br: à relire
  },
  toutes: 'Kouchañ pep tra', // br: à relire
  aucune: 'Diguchañ pep tra', // br: à relire
  mise: 'Aozadur', // br: à relire
  lignes: 'Linennoù reizhañ', // br: à relire
  auto: 'A-ya gant hirder an destenn', // br: à relire
  cases: 'Kevreoù « mat » ha « da reizhañ »', // br: à relire
  cles: 'Diskouez an alc’hwezioù (arouezenn teknikel)', // br: à relire
  parSection: 'Ur rann dre bajenn', // br: à relire
  compte: 'Testennoù : {n}', // br: à relire
  sectionsCompte: 'Rannoù : {n}', // br: à relire
  vide: 'Testenn ebet gant an dibaboù-mañ.', // br: à relire
  docNombre: '{n} testenn', // br: à relire
  docConsigne: 'Evit pep testenn : ar galleg zo ar patrom, ar brezhoneg zo an droidigezh a-vremañ (alies emgefreek). Kouchit « mat » ma talv ar brezhoneg ; mod all skrivit ar stumm mat el lec’h roet (pe dilamit ha reizhit). Ma n’oc’h ket sur eus talvoudegezh ar galleg, notit-se. Trugarez !', // br: à relire
  docContact: 'Da gas da {contact}', // br: à relire
  docFrancais: 'Testenn e galleg', // br: à relire
  docBreton: 'Brezhoneg',
  docCorrection: 'Ho reizhadenn', // br: à relire
  docOk: 'Mat', // br: à relire
  docCorriger: 'da reizhañ', // br: à relire
  docIncertain: 'da adlenn', // br: à relire
  docAbsent: '— n’eo ket bet troet c’hoazh —', // br: à relire
  docOrigine: {
    interface: 'Etrefas', // br: à relire
    exercice: 'Danvez ar poelladenn', // br: à relire
    affiche: 'Afich', // br: à relire
  },
} satisfies Traductions<typeof fr>

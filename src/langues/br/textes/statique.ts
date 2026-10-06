// Textes des pages statiques (breton) : fiches, index A→Z, page introuvable, écrits dans le HTML au build (scripts/statique/).
// Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un brittophone.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/statique.ts'

export default {
  accueil: 'Degemer',
  fichesAImprimer: 'Fichennoù da voullañ', // br: à relire
  filAriane: 'Roudenn', // br: à relire
  apercu: 'Rakwel ar fichenn', // br: à relire
  apercuPage: 'Rakwel, pajenn {n} : {titre}', // br: à relire
  pdf: 'Pellgargañ ar PDF', // br: à relire
  portrait: 'barzh hed', // br: à relire
  landscape: 'led', // br: à relire
  pdfDetail: '{titre} ({format}, {taille})',
  taille: '{n} Ko',
  pages: { one: '{n} pajenn', two: '{n} bajenn', few: '{n} fajenn', many: '{n} pajenn', other: '{n} pajenn' }, // br: à relire
  personnaliser: 'Personelaat ar fichenn-mañ', // br: à relire
  enLigne: 'Ober enlinenn', // br: à relire
  classes: 'Klasoù', // br: à relire
  domaine: 'Domani', // br: à relire
  competences: 'Barregezhioù ar programm', // br: à relire
  programmeOfficiel: 'Programm ofisiel', // br: à relire
  voisines: 'Fichennoù tost', // br: à relire
  fiches: 'Fichennoù da bellgargañ', // br: à relire
  cadreProgramme: 'Programmoù ofisiel an Dazont-skol (Ministrerezh an Deskadurezh)', // br: à relire
  type: { affiche: 'Afich da zeskiñ', fiche: 'Fichenn labour', exercice: 'Fichenn labour' }, // br: à relire
  indexTitre: 'An holl fichennoù da voullañ', // br: à relire
  indexIntro: 'Afichoù evit deskiñ ha fichennoù evit en em ziaesaat, e PDF, digoust ha prest da voullañ, rummet dre danvez ha dre urzh al lizherenneg.', // br: à relire
  indexVide: 'Fichennoù a zeuio a-benn nebeut.', // br: à relire
  matiere: { maths: 'Matematik', francais: 'Galleg', monde: 'Ar bed', regionale: 'Yezh rannvroel' }, // br: à relire
  horsProgramme: 'Fichennoù all', // br: à relire
  introuvableTitre: 'N’eo ket bet kavet ar bajenn', // br: à relire
  introuvableTexte: 'N’eus ket eus ar chomlec’h-mañ (pe n’eus ket mui). Gallout a rez klask ur fichenn pe distreiñ d’an degemer.', // br: à relire
  rechercher: 'Klask ur fichenn', // br: à relire
  champ: 'Ger da glask (alfabet, eur, CE1…)', // br: à relire
  chercher: 'Klask', // br: à relire
} as const satisfies Traductions<typeof fr>

// Textes de l'interface — page des fiches à télécharger (breton). Traduction automatique : tout est à faire relire
// par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/telechargements.ts'

export default {
  titre: 'Fichennoù da voullañ', // br: à relire
  intro: 'Afichoù evit deskiñ ha fichennoù evit en em ober, e PDF, digoust ha prest da voullañ, rummet dre domani ar programm.', // br: à relire
  rechercher: 'Klask ur fichenn (alfabet, eur, CE1…)', // br: à relire
  filtres: 'Silioù', // br: à relire
  usage: 'Implij', // br: à relire
  classe: 'Klas', // br: à relire
  langue: 'Yezh', // br: à relire
  tout: 'Pep tra', // br: à relire
  toutes: 'An holl', // br: à relire
  apprendre: 'Evit deskiñ', // br: à relire
  sentrainer: 'Evit en em ober', // br: à relire
  compteur: { other: '{n} fichenn' }, // br: à relire
  aucune: 'N’eus fichenn ebet a glot. Klaskit ur ger all, pe lamit ur sil.', // br: à relire
  effacer: 'Diverkañ ar silioù', // br: à relire
  chargement: 'O kargañ ar fichennoù…', // br: à relire
  vide: 'N’eus fichenn ebet prest da bellgargañ el lec’hienn-mañ evit c’hoazh.', // br: à relire
  absent: 'N’eo ket bet kavet roll ar fichennoù.', // br: à relire
  absentDev: 'E-pad an diorren, krouit anezhi gant « npm run fiches:dev », ha kargit ar bajenn en-dro.', // br: à relire
  erreur: 'Ne c’helled ket lenn ar fichennoù : {message}', // br: à relire
  reessayer: 'Klask en-dro', // br: à relire
  voirRegionale: 'Diskouez ivez ar fichennoù e {langue}', // br: à relire
  variantes: { other: '{n} fichenn disheñvel' }, // br: à relire
  pages: { other: '{n} pajenn' }, // br: à relire
  retour: 'An holl fichennoù', // br: à relire
  fiche: 'Fichenn {n}', // br: à relire
  apercu: 'Rakwel ar fichenn', // br: à relire
  page: 'Pajenn {n} diwar {total}', // br: à relire
  precedent: 'A-raok', // br: à relire
  suivant: 'War-lerc’h', // br: à relire
  telecharger: 'Pellgargañ ar PDF', // br: à relire
  telechargerFormat: 'Pellgargañ e {format}', // br: à relire
  imprimer: 'Moullañ', // br: à relire
  imprimerAide: 'Moullit e « ment wirion » (100 %), hep « ober e ment gant ar bajenn ».', // br: à relire
  personnaliser: 'Personelaat ar fichenn-mañ', // br: à relire
  personnaliserAide: 'Gant « Personelaat », e cheñchit an arventennoù hag e c’hallit ober kement a fichennoù ha m’ho peus c’hoant.', // br: à relire
  infos: 'Titouroù', // br: à relire
  formats: 'Paper', // br: à relire
  poids: 'Pouez', // br: à relire
  classes: 'Klasoù', // br: à relire
  langues: 'Yezh ar fichennoù', // br: à relire
  domaine: 'Domani', // br: à relire
  programmeOfficiel: 'programm ofisiel', // br: à relire
  competences: 'Barregezhioù labouret', // br: à relire
  sourceProgramme: 'gwelet ar programm, pajenn {page}', // br: à relire
  parCompetence: 'Fichennoù dre varregezh', // br: à relire
  parCompetenceAide: 'Ar fichenn a-us a gemm holl varregezhioù ar c’hlas. Evit labourat unan hepken :', // br: à relire
  bilan: 'Holl varregezhioù ar c’hlas', // br: à relire
  voisines: 'Fichennoù all', // br: à relire
  introuvable: 'N’eus ket eus ar fichenn-mañ (pe n’eus ket mui).', // br: à relire
  exemple: 'skouer', // br: à relire
} satisfies Traductions<typeof fr>

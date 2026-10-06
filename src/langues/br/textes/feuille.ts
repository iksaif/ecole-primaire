// Textes de l'interface — feuille d'une fiche prête (breton). Traduction automatique : tout est à faire relire par un brittophone
// (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/feuille.ts'

export default {
  fil: 'Roudenn', // br: à relire
  accueil: 'Degemer',
  retour: '← Fichennoù prest : {matiere}', // br: à relire
  retourIndex: '← An holl fichennoù da voullañ', // br: à relire
  apercu: 'Rakwel', // br: à relire
  apercuPage: 'Rakwel {titre}, pajenn {n} diwar {total}', // br: à relire
  apercuAide: 'Biroù kleiz ha dehou : cheñch pajenn', // br: à relire
  page: 'Pajenn {n} diwar {total}', // br: à relire
  precedente: 'Pajenn a-raok', // br: à relire
  suivante: 'Pajenn war-lerc’h', // br: à relire
  fiche: 'Fichenn {n}', // br: à relire
  fiches: 'Skouerennoù eus ar fichenn', // br: à relire
  telecharger: '⬇️ Pellgargañ', // br: à relire
  imprimer: '🖨️ Moullañ', // br: à relire
  format: 'Ment', // br: à relire
  detailPdf: { other: 'PDF {format} · {n} pajenn · {taille}' }, // br: à relire
  imprimerAide: 'Moullit e « ment wirion » (100 %), hep « ober e ment gant ar bajenn ».', // br: à relire
  personnaliser: '✏️ Personelaat', // br: à relire
  personnaliserAide: '« Personelaat » a zigor an ekzersiz gant e arventennoù : cheñchit anezho, ha grit kement a fichennoù ha ma karit.', // br: à relire
  enLigne: '🎮 C’hoari war-linenn', // br: à relire
  memeFiche: 'Memes fichenn :', // br: à relire
  bilingue: 'divyezhek', // br: à relire
  classes: 'Klasoù', // br: à relire
  imprimable: 'da voullañ', // br: à relire
  exemple: 'skouer', // br: à relire
  competence: { other: '🎯 Barregezhioù' }, // br: à relire
  competenceToutes: 'An holl danvezioù eus ar varregezh-mañ', // br: à relire
  programmeOfficiel: '📚 programm ofisiel', // br: à relire
  programmePage: 'programm ofisiel, pajenn {page}', // br: à relire
  nouvelOnglet: '(a zigor en un ivinell nevez)', // br: à relire
  voisines: 'Fichennoù tost', // br: à relire
  memeCompetence: 'Memes barregezh', // br: à relire
  memeDomaine: 'Memes domani : {domaine}', // br: à relire
  aucuneCompetence: 'Fichenn all ebet evit ar varregezh-mañ.', // br: à relire
  aucuneDomaine: 'Fichenn all ebet er domani-mañ.', // br: à relire
  chargementVoisines: 'O klask ar fichennoù tost…', // br: à relire
  titre: 'Fichenn', // br: à relire
  chargement: 'O kargañ ar fichenn…', // br: à relire
  introuvable: 'N’eus ket eus ar fichenn-mañ (pe n’eus ket mui).', // br: à relire
  absent: 'N’eo ket bet kavet roll ar fichennoù evit poent.', // br: à relire
  erreur: 'Ne c’helled ket lenn ar fichenn : {message}', // br: à relire
  reessayer: 'Klask en-dro', // br: à relire
  voirToutes: 'Gwelet an holl fichennoù', // br: à relire
} satisfies Traductions<typeof fr>

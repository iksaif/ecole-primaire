// Textes de l'interface — page d'accueil (breton) : trois dispositions. Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/accueil.ts'

export default {
  titre: 'Afichoù, fichennoù da voullañ ha poelladennoù evit pleustriñ', // br: à relire
  sousTitre: 'Eus ar rannskol vihan betek ar CM2, digoust, hep kont.', // br: à relire
  titreEnfant: 'Demat !', // br: à relire
  maClasse: 'Ma c\'hlas', // br: à relire
  mesClasses: 'Ma klasoù', // br: à relire
  verrou: 'Prennet eo ar c\'hlas (prenn e laez) : un den bras a c\'hall e zigeriñ.', // br: à relire
  tuile: {
    maths: 'Matematik', // br: à relire
    francais: 'Galleg', // br: à relire
    monde: 'Ar Bed', // br: à relire
    programme: 'Programm', // br: à relire
    fiches: 'Fichennoù prest', // br: à relire
  },
  compte: { one: '{n} danvez · {classes}', other: '{n} danvez · {classes}' }, // br: à relire
  aucune: 'Ar danvezioù a zeu abred · {classes}', // br: à relire
  mondeDesc: 'Ar c\'hwiz, ha ar pezh a zeu : skiantoù, istor, douaroniezh', // br: à relire
  programmeDesc: 'Ar pezh a zesker : {classes}', // br: à relire
  programmeDescEnseignant: 'Klas × domani → ampladurioù → danvezioù', // br: à relire
  fichesDesc: 'PDF da pellgargañ ha da voullañ, hep reizhañ netra', // br: à relire
  reprendre: 'Kenderc\'hel', // br: à relire
  anciennete: { aujourdhui: 'hiziv', hier: 'dec\'h', jours: { one: '{n} deiz zo', other: '{n} deiz zo' } }, // br: à relire
  profil: {
    phrase: 'Un dra bennak evel :', // br: à relire
    facultatif: '(diret, ne cheñch nemet an ardeiñ)', // br: à relire
    enfant: 'bugel', // br: à relire
    parent: 'kerent', // br: à relire
    enseignant: 'kelenner', // br: à relire
  },
  copier: 'Eilañ al liamm evit ar familhoù', // br: à relire
  copierAide: 'Ar familhoù a zeu war al lec\'hienn dija reizhet war {classes}.', // br: à relire
  copie: 'Liamm eilet : ar familhoù a zeuio war {classes}.', // br: à relire
  copieEchec: 'Ne c\'haller ket eilañ. Setu al liamm da gas :', // br: à relire
} satisfies Traductions<typeof fr>

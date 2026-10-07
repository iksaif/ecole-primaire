// Textes de l'interface — page « Le programme » (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/programme.ts'

export default {
  titre: 'Programm', // br: à relire
  accueil: 'Degemer', // br: à relire
  adresse: 'Chomlec’h ar sell-mañ', // br: à relire
  chapeau: '{classes} · {matiere}. Pep barregezh a gas d’e frammoù.', // br: à relire
  fil: 'Roudenn', // br: à relire
  matiere: { legende: 'Danvez', maths: 'Jedoniezh', francais: 'Galleg', monde: 'Ar bed', regionale: 'Yezh rannvroel' }, // br: à relire
  classes: { legende: 'Klasoù', verrouillee: 'Prennet eo ar c’hlas.' }, // br: à relire
  domaine: { legende: 'Domani', aucun: 'Domani ebet eus an danvez-mañ evit ar c’hlasoù dibabet.' }, // br: à relire
  affichage: { legende: 'Diskouez', tableau: 'Taolenn', liste: 'Roll' }, // br: à relire
  refs: 'Diskouez an dave', // br: à relire
  lien: {
    copier: 'Eilañ al liamm war an daolenn-mañ', // br: à relire
    copie: 'Eilet eo al liamm : digeriñ a ra ar sell-se hag all.', // br: à relire
    echec: 'Dibosupl eilañ : eilit chomlec’h ar bajenn en ur varrenn ar merdeer.', // br: à relire
  },
  tableau: {
    legende: 'Barregezhioù an domani « {domaine} » dre glas : pep poull zo ul liamm da bajenn ar vareghezh.', // br: à relire
    competence: 'Barregezh', // br: à relire
    ressources: 'Danvezioù', // br: à relire
    cellule: '{competence}, {classe}',
    nonConcernee: 'Er programm eus ar c’hlas-se ket', // br: à relire
    choisie: 'klas dibabet', // br: à relire
    cle: '● : er programm eus ar c’hlas · bann glas : klas dibabet · ⓘ : hor lenn eus an destenn', // br: à relire
  },
  liste: {
    aucune: 'Barregezh ebet eus an domani-mañ evit ar c’hlasoù dibabet : klaskit gant an daolenn.', // br: à relire
    autresClasses: { one: '+ {n} danvez evit klasoù all', two: '+ {n} zanvez evit klasoù all', few: '+ {n} danvez evit klasoù all', many: '+ {n} danvez evit klasoù all', other: '+ {n} danvez evit klasoù all' }, // br: à relire
    toutes: 'An holl zanvezioù eus ar vareghezh-mañ', // br: à relire
  },
  sansRessource: 'Poelladenn ebet c’hoazh evit ar vareghezh-mañ.', // br: à relire
  reference: {
    page: 'pajenn PDF {page}', // br: à relire
    ouvre: 'testenn ofisiel, digeriñ ar PDF en un ivinell nevez', // br: à relire
  },
  interpretation: { resume: 'Hor lenn eus an destenn', titre: 'Hor lenn eus ar programm' }, // br: à relire
  source: {
    bo41: 'BO 41',
    c2maths: 'BO 41 · stagadenn 4', // br: à relire
    bo19: 'BO 19',
    c3maths: 'BO 16 · jedoniezh', // br: à relire
    c3francais: 'BO 16 · galleg', // br: à relire
    exemplesCM1: 'Éduscol · CM1',
    exemplesCM2: 'Éduscol · CM2',
    exemples6e: 'Éduscol · 6e',
    c2sciences: 'BO 24 · stagadenn 1', // br: à relire
    c3sciences: 'BO 24 · stagadenn 2', // br: à relire
    c2histgeo: 'BO 22 · stagadenn 3', // br: à relire
    c3histgeo: 'BO 22 · stagadenn 4', // br: à relire
    emc: 'BO 24 (2024) · EMC',
    c2ancien2015: 'Programm kozh 2015', // br: à relire
    c2ancien2020: 'Programm kozh 2020', // br: à relire
    c1consolide: 'Éduscol · rummad 1', // br: à relire
    lvc2: 'BO 12 (2026) · yezhoù bev', // br: à relire
    bretonA1: 'Akademiezh Roazhon · brezhoneg A1', // br: à relire
    bretonCP: 'Akademiezh Roazhon · CP divyezhek', // br: à relire
  },
} satisfies Traductions<typeof fr>

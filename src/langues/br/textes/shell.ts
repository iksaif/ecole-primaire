// Textes de l'interface — enveloppe du site (breton) : barre de navigation, menu du téléphone, pied de page.
// Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/shell.ts'

export default {
  logoTitre: '{nom} — Degemer', // br: à relire
  barre: {
    menu: 'Lañser pennañ', // br: à relire
    rubriques: 'Rubrikoù', // br: à relire
    menuTelephone: 'Lañser', // br: à relire
    ouvrirMenu: 'Digeriñ al lañser', // br: à relire
    fermerMenu: 'Serriñ al lañser', // br: à relire
    reglages: 'Arventennoù',
    rechercher: 'Klask', // br: à relire
    dev: 'Diorren', // br: à relire
    accueil: 'Degemer',
    fichesPretes: 'Fichennoù prest', // br: à relire
  },
  rubriques: {
    maths: 'Jedoniezh', // br: à relire
    francais: 'Galleg', // br: à relire
    monde: 'Ar bed', // br: à relire
    programme: 'Programm', // br: à relire
  },
  langue: {
    titre: 'Yezh', // br: à relire
    etat: 'Yezh : {mode}', // br: à relire
    fr: 'Galleg', // br: à relire
    frDesc: 'Etrefas, fichennoù ha poelladennoù e galleg', // br: à relire
    bilingue: 'Galleg + {langue}', // br: à relire
    bilingueDesc: 'An div yezh : titloù, fichennoù, poelladennoù', // br: à relire
    regionale: '{langue} hepken', // br: à relire
    regionaleDesc: 'Etrefas ha kelennadurioù e {langue}', // br: à relire
    retour: 'Distreiñ d’ar galleg', // br: à relire
    retourCourt: 'GA', // br: à relire
  },
  classe: {
    titre: 'Klas',
    etat: 'Klas : {classes}',
    maClasse: 'Ma klas', // br: à relire
    mesClasses: 'Ma klasoù (unan pe zoare)', // br: à relire
    cycle1: 'Skol-vamm', // br: à relire
    cycle2: 'Kelc’h 2', // br: à relire
    cycle3: 'Kelc’h 3', // br: à relire
    toutes: 'An holl glasoù', // br: à relire
    noteUne: 'Ur c’hlas hepken. Dalc’het eo en akipaj-mañ.', // br: à relire
    notePlusieurs: 'Meur a glas : ar roll a ziskouez an holl glasoù-se.', // br: à relire
    verrouillee: 'Klas prennet : {classes}. Digeriñ ar c’hadenn', // br: à relire
  },
  cadenas: {
    titre: 'Evit ar re vras hepken', // br: à relire
    consigne: 'Evit cheñch klas e talc’h un oadour ar bouton pouezet e-pad 2 eilenn.', // br: à relire
    bouton: 'Dalc’hit pouezet 2 eilenn evit digeriñ ar c’hadenn', // br: à relire
    aide: 'Dalc’hit pouezet (logodenn, biz, pe varrenn al lec’hioù)', // br: à relire
    enCours: 'O talc’hel, kendalc’hit.', // br: à relire
    tropTot: 'Lazhet re abred : ar c’hadenn a chom serret.', // br: à relire
    ouvert: 'Digor eo ar c’hadenn : gallout a rit cheñch klas.', // br: à relire
  },
  profil: {
    titre: 'Profil',
    etat: 'Profil : {profil}',
    question: 'Me zo… (diret)', // br: à relire
    note: 'N’eo ket ar profil nemet evit kemmañ an aozadur hag an niver a glasoù. Netra n’eo prennet.', // br: à relire
    enfant: 'Bugel', // br: à relire
    enfantDesc: 'Ur c’hlas, prennet gant ur c’hadenn vihan', // br: à relire
    parent: 'Kerent', // br: à relire
    parentDesc: 'Ur c’hlas, programm ha fichennoù prest', // br: à relire
    enseignant: 'Kelenner', // br: à relire
    enseignantDesc: 'Meur a glas, programm, liamm evit ar familhoù', // br: à relire
  },
  pied: {
    navigation: 'Treid ar bajenn', // br: à relire
    programme: 'Programm', // br: à relire
    fichesPretes: 'Fichennoù prest', // br: à relire
    nouveautes: 'Nevezentioù', // br: à relire
    apropos: 'Diwar-benn',
    signaler: 'Menegiñ ur fazi', // br: à relire
    depot: 'Kod war GitHub', // br: à relire
    contact: 'Darempred', // br: à relire
    libre: 'Digoust · hep bruderezh · hep toupin na spiadur',
  },
} satisfies Traductions<typeof fr>

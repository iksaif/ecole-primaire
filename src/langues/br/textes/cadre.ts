// Textes de l'interface — cadre d'un exercice ou d'une affiche (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/cadre.ts'

export default {
  jouer: '🎯 Ober ar boelladenn',
  imprimer: '🖨️ Moullañ ur fichenn',
  nouvelle: '🎲 Fichenn nevez',
  surLaFiche: 'War ar fichenn', // br: à relire
  entete: 'Anv-bihan ha deiziad', // br: à relire
  corrige_non: 'Hep reizhadenn', // br: à relire
  corrige_page: 'Reizhadenn war ur bajenn all', // br: à relire
  corrige_dessous: 'Reizhadenn en traoñ, tu gin', // br: à relire
  police: 'Nodrezh', // br: à relire
  exempleAttache: 'skol vrav',
  exempleScript: 'a b g skol',
  retirer: 'Lemel an nodrezh-mañ', // br: à relire
  aideTitre: '➕ Ouzhpennañ un nodrezh…', // br: à relire
  aideTexte: 'An nodrezhoù-skol-se a zo digoust evit ar c\'hlas hag ar gêr, met n\'eo ket aotreet gant o lañvaz o lakaat gant al lec\'hienn. Daou zoare a zo : o <strong>staliañ</strong> war an urzhiataer (war wel e vint er roll goude bezañ adkarget ar bajenn), pe <strong>ouzhpennañ ar restr</strong> amañ (miret e vo er merdeer-mañ).', // br: à relire
  modes: 'Mod ar boelladenn', // br: à relire
  installee: 'staliet',
  nonInstallee: 'n\'eo ket staliet', // br: à relire
  // sélecteur de police par groupes (ChoixPolice) et ajout d'une police (AjoutPolice)
  groupeNotres: 'Hon nodrezhoù', // br: à relire
  groupeInstallees: 'Staliet war an urzhiataer-mañ', // br: à relire
  groupeAjoutees: 'Ouzhpennet diwar ur restr', // br: à relire
  aideLiens: 'Da gaout (n\'int ket staliet c\'hoazh war an urzhiataer-mañ) :', // br: à relire
  ajouterFichier: '📂 Ouzhpennañ ur restr nodrezh', // br: à relire
  toutesPolices: 'Diskouez holl nodrezhoù an urzhiataer-mañ', // br: à relire
  toutesTrouvees: 'Nodrezhoù an urzhiataer ouzhpennet d\'ar roll : {n}.', // br: à relire
  toutesRefusees: 'N\'eo ket bet aotreet ar moned da nodrezhoù an urzhiataer.', // br: à relire
  nomPolice: 'Anv un nodrezh staliet', // br: à relire
  chercherPolice: 'Klask', // br: à relire
  nomTrouvee: '« {nom} » a zo staliet : ouzhpennet eo d\'ar roll.', // br: à relire
  nomIntrouvable: '« {nom} » n\'eo ket bet kavet war an urzhiataer-mañ : gwiriit reizhskrivadur egzakt an anv.', // br: à relire
  noteSysteme: 'Nodrezh an urzhiataer eo : n\'emañ ket er fichenn. Moulet mat e vez nemet adal an urzhiataer-mañ (ket en ur PDF pellgarget, na adal ur benveg all).', // br: à relire
  // polices incluses et notes sur les polices à obtenir ailleurs (ChoixPolice) : repris à l'identique des anciens textes
  policeAttache: 'Playwrite FR Trad — skritur a-stag skol Bro-C\'hall', // br: à relire
  policeAndika: 'Andika — savet evit deskiñ lenn (a ha g eeun)',
  policeLuciole: 'Luciole — lennus-tre, savet evit ar vugale a wel fall', // br: à relire
  policeOpenDyslexic: 'OpenDyslexic — evit al lennerien dislekseg', // br: à relire
  noteBelleAllure: "skritur a-stag implijet kalz er c'hlas, meur a stumm (GS, CP, CE…)",
  noteEcolier: 'skritur a-stag klasel, stumm « court » evit lagadennoù bihan',
  noteCursif: 'ha nodrezhoù-skol all (rummad Script › Scolaire)',
  erreurPoliceTropGrosse: "Re vras eo ar restr (3 Mo d'ar muiañ)",
  erreurPoliceNonMemorisee: "Karget eo an nodrezh evit an dro-mañ, met ne c'haller ket e virout (leun eo memor ar merdeer)", // br: à relire
} satisfies Traductions<typeof fr>

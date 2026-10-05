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
  attache: 'A-stag',
  script: 'Skript',
  police: 'Nodrezh', // br: à relire
  exempleAttache: 'skol vrav',
  exempleScript: 'a b g skol',
  retirer: 'Lemel an nodrezh-mañ', // br: à relire
  aideTitre: '➕ Implijout Belle Allure, Écolier pe un nodrezh all…',
  aideTexte: 'An nodrezhoù-skol-se a zo digoust evit ar c\'hlas hag ar gêr, met n\'eo ket aotreet gant o lañvaz o lakaat gant al lec\'hienn. Daou zoare a zo : o <strong>staliañ</strong> war an urzhiataer (war wel e vint er roll goude bezañ adkarget ar bajenn), pe <strong>ouzhpennañ ar restr</strong> amañ (miret e vo er merdeer-mañ).', // br: à relire
  ajouterAttache: '📂 Ouzhpennañ un nodrezh a-stag',
  ajouterScript: '📂 Ouzhpennañ un nodrezh skript',
  astuce: 'Alioù evit Belle Allure : dibab ar restr hep linennoù (ket « Ductus » na « Lignes ») ; ment al lizherennoù a vez azasaet ent emgefre ouzh al linennoù Seyès.',
} satisfies Traductions<typeof fr>

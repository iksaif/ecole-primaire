// Textes de l'interface — page de la langue régionale (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/regionale.ts'

export default {
  aussiTitre: 'An danvezioù all e {nom}', // br: à relire
  aussiTexte: "Er c'hlasoù divyezhek e vez desket ar matematikoù hag ar bed e {nom} ivez : ar poelladennoù hag ar skritelloù-mañ a zo e {nom} hag a zigor e {nom}.", // br: à relire
  inactif: 'Ar bajenn-mañ n\'eo ket oberiant er mod « Galleg hepken ».', // br: à relire
  inactifAide: 'Gweredekait ar yezh evit gwelet he skritelloù hag he fichennoù.', // br: à relire
  activer: 'Gweredekaat : galleg + {nom}', // br: à relire
  intro: "Evit deskiñ ar {nom}, eus ar skol-vamm d'ar CE1 : renket hervez programm ar yezhoù bev ha merkoù akademiezh Roazhon evit ar c'hlasoù divyezhek.", // br: à relire
  videTitre: 'Ar skritelloù hag ar fichennoù a zeu abred.', // br: à relire
  videTexte: "Netra c'hoazh evit ar c'hlasoù-mañ e tachennoù ar {nom} (heuliañ a ra al lec'hienn anezho eus ar skol-vamm d'ar CE1).", // br: à relire
} satisfies Traductions<typeof fr>

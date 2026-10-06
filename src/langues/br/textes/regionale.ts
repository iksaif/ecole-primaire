// Textes de l'interface — page de la langue régionale (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/regionale.ts'

export default {
  inactif: 'Ar bajenn-mañ n\'eo ket oberiant er mod « Galleg hepken ».', // br: à relire
  inactifAide: 'Gweredekait ar yezh evit gwelet he skritelloù hag he fichennoù.', // br: à relire
  activer: 'Gweredekaat : galleg + {nom}', // br: à relire
  intro: 'Skritelloù ha fichennoù da voullañ evit deskiñ ar {nom}.', // br: à relire
  videTitre: 'Ar skritelloù hag ar fichennoù a zeu abred.', // br: à relire
  videTexte: 'Al lizherenneg, an niveroù, an deizioù, ar mizioù hag ar gemmadurioù a vo skritelloù ha fichennoù da voullañ. Ar programm evit ar {nom} n\'en deus domani ebet c\'hoazh.', // br: à relire
} satisfies Traductions<typeof fr>

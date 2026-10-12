// Textes de l'interface — les brevets de ceintures (breton). Traduction automatique : à faire relire.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ceinturesBrevet.ts'

export default {
  titre: 'Brevedoù gourizioù', // br: à relire
  description: 'Brevet war paper evit ur gouriz : goulennoù, ar vevenn da dapout, ar reizhadur', // br: à relire
  intro: 'Ur brevet evit tremen d’ar gouriz a-heul : un nebeud goulennoù, hep skoazell, gant ar reizhadur. Ar vevenn hag an niver a c’houlennoù a c’heller o reiñ e « Er fichenn » pe er reolennoù.', // br: à relire
  piste: 'Hent', // br: à relire
  ceinture: 'Gouriz', // br: à relire
  prenom: 'Anv-bihan (lezel goullo evit e skrivañ gant an dorn)', // br: à relire
} as const satisfies Traductions<typeof fr>

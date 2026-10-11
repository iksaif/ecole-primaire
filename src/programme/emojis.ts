// Emojis des matières sur les pages « Programme » et « Compétence » (des contenus). Les libellés de ces pages ont des icônes
// d'interface (src/images/icones.ts, <Icone>) ; les domaines ont leurs emojis (src/ressources/emojis.ts). Pur.
import type { MatiereProgramme } from './etat.ts'
import type { NomIcone } from '../images/icones.ts'

// langue régionale : la parole quand il faut une icône ; la barre montre son drapeau dessiné (IconeMatiere)
export const EMOJI_MATIERE: Readonly<Record<MatiereProgramme, NomIcone>> = { maths: 'chiffres', francais: 'blocNotes', monde: 'terre', regionale: 'parole' }

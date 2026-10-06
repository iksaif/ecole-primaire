// Textes de l'interface — ranger les nombres (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ranger.ts'

export default {
  titre: 'Renkañ an niveroù',
  description: "Eus ar bihanañ d'ar brasañ",
  nombresDe: '{niv} — niveroù 1 da {n}',
  petitGrand: "Eus ar bihanañ d'ar brasañ",
  croissant: 'O kreskiñ',
  decroissant: 'O tigreskiñ',
  melange: 'Kemmesket',
  combien: 'Pet niver da renkañ ?',
  rangeCroissant: "Renk eus ar bihanañ d'ar brasañ",
  rangeDecroissant: "Renk eus ar brasañ d'ar bihanañ",
  petitGrandMin: "eus ar bihanañ d'ar brasañ",
  grandPetitMin: "eus ar brasañ d'ar bihanañ",
  ordreCorrect: 'An urzh reizh : {ordre}',
} as const satisfies Traductions<typeof fr>

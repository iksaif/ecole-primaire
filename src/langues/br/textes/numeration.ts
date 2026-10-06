// Textes de l'interface — les nombres (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier
// par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/numeration.ts'

export default {
  titre: 'An niveroù',
  description: 'Betek 1 000 (CE1) ha 10 000 (CE2) : dispartiañ, keñveriañ, renkañ',
  titrePlage: 'An niveroù betek {n}',
  nombresJusqua: 'Niveroù betek',
  legendeMillier: '1 kub bras = 1000',
  legende: '1 plakenn = 100 · 1 barrenn = 10 · 1 kub = 1',
  cliqueTous: 'Klik war an holl niveroù 😉',
  laBonne: '❌ Ar respont mat : {r}',
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  type_decomposer: '🧱 Dispenn', // br: à relire
  type_representation: '🟦 Skeudenn', // br: à relire
  type_lettresChiffres: '✏️ Skrivañ e sifroù',
  type_chiffresLettres: '🔤 Skrivañ e lizherennoù',
  type_comparer: '⚖️ Keñveriañ',
  type_suites: '➡️ Da-heul / heuliadoù',
  type_droite: '📏 Linenn dereziet', // br: à relire
  type_ranger: '📶 Renkañ',
} satisfies Traductions<typeof fr>

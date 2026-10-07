// Textes de l'interface — les fractions (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire
// vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/fractions.ts'

export default {
  titre: 'An darnaouennoù',
  description: "An hanter, an trederenn, ar c'hard…",
  fractions: 'Darnaouennoù',
  aideColorier: 'Stok al lodennoù evit o livañ ({n} / {total})',
  graduation: '{o} derez',
  laBonne: '❌ Ar respont mat : {r}',
  passer: 'Tremen ⏭',
  passe: '(tremenet)',
  effacer: '🧽 Diverkañ',
  types: {
    identifier: '👀 Peseurt darnaouenn ?',
    colorier: '🖍️ Livañ',
    lettres: '🔤 E lizherennoù',
    partDe: '🍪 An hanter eus…',
    egales: '🟰 Darnaouennoù kevatal',
    droite: '📏 Lenn war al linenn',
    placer: '📍 Lakaat war al linenn',
  },
  modes: {
    unitaires: 'Un hanter, un trede… (1/2, 1/3…)',
    toutes: '2/3, 3/4… ivez',
  },
} as const satisfies Traductions<typeof fr>

// Textes de l'interface — les ceintures de compétences (breton). Traduction automatique, sauf les couleurs : ruz, roz, glas, gwer, mouk, gell, du, gwenn, melen, orañjez
// sont vérifiés (Wiktionnaire, 2026-10-09 : src/affiches/couleurs/textes.ts). « gouriz » (ceinture) : à faire relire.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ceintures.ts'

export default {
  titre: 'Gourizioù', // br: à relire
  couleur: {
    blanche: 'gwenn', jaune: 'melen', orange: 'orañjez', verte: 'gwer', bleue: 'glas', marron: 'gell', noire: 'du', rouge: 'ruz',
    rose: 'roz', violette: 'mouk',
    palier1: 'live 1', palier2: 'live 2', palier3: 'live 3', palier4: 'live 4', palier5: 'live 5', // br: à relire
  },
  ceinture: 'Gouriz {couleur}', // br: à relire
  palette: {
    judo: 'Judo (7) : eus ar gwenn d’an du', // br: à relire
    'judo-rouge': 'Judo hag ar ruz (8)', // br: à relire
    'rose-violet': 'Eus ar roz d’ar mouk (6)', // br: à relire
    paliers: 'Hep liv : pemp live', // br: à relire
  },
  style: { ruban: 'Gouriz stag', bandeau: 'Bandenn', rond: 'Kelc’h (gomedenn)' }, // br: à relire
} as const satisfies Traductions<typeof fr>

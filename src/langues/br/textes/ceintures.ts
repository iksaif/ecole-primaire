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
  activer: {
    titre: 'Gourizioù barregezhioù (dibabus)', // br: à relire
    aide: 'Live liv evit heuliañ e brogres : fichennoù da voullañ (levrig, brevedoù, gourizioù da droc’hañ, taolenn ar glasad) hag, diwezhatoc’h, brevedoù da ober war ar skramm. Kuzh e chomont keit ha ma n’int ket gweredekaet.', // br: à relire
    case: 'Kinnig ar gourizioù war an trevnad-mañ', // br: à relire
    parSite: 'Kinniget e vez gant al lec’hienn-mañ da gentañ.', // br: à relire
  },
  reglage: {
    titre: 'Gourizioù', // br: à relire
    aide: 'Ar baletenn hag an treuzskrivadur eus ar gourizioù, evit an holl fichennoù gourizioù. Skrivet eo bepred anv al liv e-kichen.', // br: à relire
    palette: 'Livioù', // br: à relire
    style: 'Tresadenn', // br: à relire
    noirEtBlanc: 'Du ha gwenn (kinnigoù e plas al livioù)', // br: à relire
    nb: 'Niver a c’hourizioù', // br: à relire
    seuil: 'Evit tapout ur brevet', // br: à relire
    seuilValeur: '{n} % a respontoù mat', // br: à relire
    questions: 'Goulennoù ur brevet', // br: à relire
    chronometre: 'Kronometr', // br: à relire
    chrono: { aucun: 'Hini ebet', doux: 'Dous', strict: 'Strizh' }, // br: à relire
  },
} as const satisfies Traductions<typeof fr>

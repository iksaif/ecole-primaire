// Textes de l'interface — les ceintures de compétences (breton). Traduction automatique, sauf les couleurs : ruz, roz, glas, gwer, mouk, gell, du, gwenn, melen, orañjez
// sont vérifiés (Wiktionnaire, 2026-10-09 : src/affiches/couleurs/textes.ts). « gouriz » (ceinture), « Gouriz + couleur » : à faire relire.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/ceintures.ts'

export default {
  titre: 'Gourizioù', // br: à relire
  ongletIntro: 'Brevet war paper an hent-mañ : dibabit ar gouriz da dremen, moullit ar goulennoù hag ar reizhadur.', // br: à relire
  description: 'Levrig, gourizioù da droc’hañ, diplom ha paseporzh : live liv evit heuliañ e brogres', // br: à relire
  intro: 'Live liv, evel er judo : en em ober a reer, un brevet a dremener, ar gouriz a-heul a vez gounezet. Dibabit ar skor da voullañ hag ar skor ; al livioù a zo da reiñ e « Er fichenn » pe er reolennoù.', // br: à relire
  support: { livret: 'Levrig', bandes: 'Gourizioù da droc’hañ', diplome: 'Diplom', passeport: 'Paseporzh' }, // br: à relire
  supportDesc: { // br: à relire
    livret: 'Ul linenn dre c’gouriz : palioù da arouezañ, deiziad, sinadur',
    bandes: 'Bandennoù da droc’hañ ha da ludañ war al levrig',
    diplome: 'Ur bajenn evit ur gouriz, da gas d’ar gêr',
    passeport: 'Eizh kartenn, kement ha ur gartenn vank',
  },
  pisteLibre: 'Va falioù (o skrivañ a ran)', // br: à relire
  pisteTitre: 'Hent', // br: à relire
  supportTitre: 'Skor', // br: à relire
  intituleTitre: 'Titl an hent', // br: à relire
  intituleAuto: 'Va falioù', // br: à relire
  objectifsTitre: 'Palioù (unan dre linenn, unan dre c’hourizioù)', // br: à relire
  copies: 'Eilskridoù eus pep gouriz', // br: à relire
  numero: 'Gouriz an diplom', // br: à relire
  prenomTitre: 'Anv-bihan (lezel goullo evit e skrivañ gant an dorn)', // br: à relire
  ceinture: {
    blanche: 'Gouriz gwenn', jaune: 'Gouriz melen', orange: 'Gouriz orañjez', verte: 'Gouriz gwer', bleue: 'Gouriz glas',
    marron: 'Gouriz gell', noire: 'Gouriz du', rouge: 'Gouriz ruz', rose: 'Gouriz roz', violette: 'Gouriz mouk',
    palier1: 'Live 1', palier2: 'Live 2', palier3: 'Live 3', palier4: 'Live 4', palier5: 'Live 5', // br: à relire
  },
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
    palette: 'Livioù ar gourizioù', // br: à relire
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

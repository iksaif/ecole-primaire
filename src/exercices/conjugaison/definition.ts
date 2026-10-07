// Conjugaison — définition : QUI peut faire quoi (modèle : ../exemple-corpus/definition.ts, exercice de français).
// Programme (src/data/programme.ts, contraintes `conjugaison`) :
//   CP  : être et avoir au présent (bo41 p. 92) ;
//   CE1 : + verbes du 1er groupe ; présent, imparfait, futur, passé composé (p. 93) ; radical et terminaison ;
//   CE2 : + les 8 verbes irréguliers : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre (p. 94) ;
//   CM1 : + 2e groupe (c3francais p. 18) ; CM2 : + passé simple et plus-que-parfait (p. 19).
// Tout ce qu'un niveau propose est au programme, et tout est coché par défaut. Verbes et temps : src/data/conjugaison.js.
// Mode : « lacunes » (radical donné, l'élève écrit la terminaison) par défaut, sauf au CP : radical et terminaison sont une compétence du
// CE1 ; le CP écrit la forme entière (« complet »), « lacunes » y reste proposé en bonus (décision du 2026-10-05).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
// Les valeurs des réglages (verbes, temps, mode) sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, cases, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const ETRE_AVOIR = ['etre', 'avoir'] as const
const PREMIER = ['chanter', 'jouer', 'parler', 'aimer'] as const
const DEUXIEME = ['finir', 'grandir', 'choisir'] as const
const IRREGULIERS = ['aller', 'faire', 'dire', 'venir', 'pouvoir', 'voir', 'vouloir', 'prendre'] as const
const TEMPS_CYCLE = ['present', 'imparfait', 'futur', 'passe-compose'] as const

const LACUNES = choix(['lacunes', 'complet'], { defaut: 'lacunes' })
type TempsFiche = (typeof TEMPS_CYCLE)[number] | 'passe-simple' | 'plus-que-parfait'

export default definir({
  id: 'conjugaison',
  route: '/francais/conjugaison',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '✍️',
  niveauDefaut: 'ce1',
  // fiche : « tableaux » (quatre verbes, six personnes chacun) ou « lignes » (une forme à écrire par ligne, verbes et temps mélangés)
  reglages: { fiche: choix(['tableaux', 'lignes'], { defaut: 'tableaux' }) },

  competences: [K.conjugaisonPresentEtreAvoir, K.conjugaison4Temps, K.conjugaisonIrreguliers, K.conjugaison2eGroupe, K.conjugaisonPasseSimple, K.radicalTerminaison],

  niveaux: {
    cp: { reglages: { verbes: cases([...ETRE_AVOIR]), temps: cases(['present']), mode: choix(['complet'], { defaut: 'complet', bonus: ['lacunes'] }) } },
    ce1: { reglages: { verbes: cases([...ETRE_AVOIR, ...PREMIER]), temps: cases([...TEMPS_CYCLE]), mode: LACUNES } },
    ce2: { reglages: { verbes: cases([...ETRE_AVOIR, ...PREMIER, ...IRREGULIERS]), temps: cases([...TEMPS_CYCLE]), mode: LACUNES } },
    cm1: { reglages: { verbes: cases([...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS]), temps: cases([...TEMPS_CYCLE]), mode: LACUNES } },
    cm2: { reglages: { verbes: cases([...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS]), temps: cases([...TEMPS_CYCLE, 'passe-simple', 'plus-que-parfait']), mode: LACUNES } },
  },

  // fiches par temps, avec tous les verbes du niveau (décision de l'utilisateur) ; au CP, le présent seul : le bilan suffit
  fiches: [
    ...(['ce1', 'ce2', 'cm1', 'cm2'] as const).flatMap(niveau => TEMPS_CYCLE.map(temps => ({ id: temps, competence: K.conjugaison4Temps, niveau, reglages: { temps: [temps as TempsFiche] } }))),
    ...(['passe-simple', 'plus-que-parfait'] as const).map(temps => ({ id: temps, competence: K.conjugaisonPasseSimple, niveau: 'cm2' as const, reglages: { temps: [temps as TempsFiche] } })),
  ],
})

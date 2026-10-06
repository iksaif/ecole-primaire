// Généré par `node scripts/ids.mjs` d'après src/data/programme.ts : ne pas modifier à la main.
// Des constantes plutôt que des chaînes : K.heureEntiere se complète dans l'éditeur, une faute de frappe ne compile pas
// (et lève une erreur claire si le code tourne sans vérification de types : voir fort()).
import type { CompetenceId, DomaineId } from './types.ts'
import { AVEC_DEV } from '../dev.ts'

/** Pourquoi un Proxy : node retire les types sans les vérifier, et `K.inconnue` vaudrait undefined en silence. */
function fort<T extends object>(nom: string, ids: T): T {
  return new Proxy(ids, {
    get: (cible, cle, recepteur) => {
      if (typeof cle === 'string' && !(cle in cible)) throw new Error(`${nom}.${cle} n'existe pas (src/noyau/ids.ts, généré d'après programme.ts)${cle.startsWith('exemple') ? ' : les entrées « exemple… » sont fictives, développement seulement : jamais dans un exercice réel ni en production (src/dev.ts)' : ''}`)
      return Reflect.get(cible, cle, recepteur)
    },
  })
}

// Les entrées fictives des exemples (développement seulement) : leurs ids ne doivent pas entrer dans un build de production.
// La condition est écrite ICI avec les littéraux de Vite (src/dev.ts explique pourquoi) : en production, `{}`.
const avecDev: boolean = import.meta.env ? (import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV) : AVEC_DEV
const competencesFictives = (avecDev ? {
  exempleCompter: 'exemple-compter',
  exempleRegle: 'exemple-regle',
  exempleSynonymes: 'exemple-synonymes',
  exempleLire: 'exemple-lire',
} : {}) as {
  exempleCompter: 'exemple-compter',
  exempleRegle: 'exemple-regle',
  exempleSynonymes: 'exemple-synonymes',
  exempleLire: 'exemple-lire',
}
const domainesFictifs = (avecDev ? {
  exemple: 'exemple',
} : {}) as {
  exemple: 'exemple',
}

/** Compétences de src/data/programme.ts. */
export const K = fort('K', {
  denombrer6: 'denombrer-6',
  denombrer10: 'denombrer-10',
  denombrer3: 'denombrer-3',
  comparerQuantites: 'comparer-quantites',
  composerDecomposer: 'composer-decomposer',
  bandeNumerique: 'bande-numerique',
  problemesMaternelle: 'problemes-maternelle',
  numeration100: 'numeration-100',
  numeration1000: 'numeration-1000',
  numeration10000: 'numeration-10000',
  numeration6Chiffres: 'numeration-6-chiffres',
  numeration9Chiffres: 'numeration-9-chiffres',
  nombresEnLettres: 'nombres-en-lettres',
  comparerRanger: 'comparer-ranger',
  droiteGraduee: 'droite-graduee',
  ordinaux: 'ordinaux',
  suitesNombres: 'suites-nombres',
  pariteMultiples: 'parite-multiples',
  criteresDivisibilite: 'criteres-divisibilite',
  diviseurs: 'diviseurs',
  fractionsUnitaires: 'fractions-unitaires',
  fractionsInferieures1: 'fractions-inferieures-1',
  fractionsComparer: 'fractions-comparer',
  fractionsAdditionner: 'fractions-additionner',
  fractionsEgales: 'fractions-egales',
  fractionsMesure: 'fractions-mesure',
  fractionsSuperieures1: 'fractions-superieures-1',
  fractionQuantite: 'fraction-quantite',
  decimaux: 'decimaux',
  tablesAddition: 'tables-addition',
  tablesMultiplication: 'tables-multiplication',
  doublesMoities: 'doubles-moities',
  complementDizaine: 'complement-dizaine',
  ajouterDizaines: 'ajouter-dizaines',
  ajouter9: 'ajouter-9',
  multiplier10100: 'multiplier-10-100',
  additionPosee: 'addition-posee',
  soustractionPosee: 'soustraction-posee',
  multiplicationPosee: 'multiplication-posee',
  divisionPosee: 'division-posee',
  operationsDecimaux: 'operations-decimaux',
  sensMultiplication: 'sens-multiplication',
  sensDivision: 'sens-division',
  egalitesATrous: 'egalites-a-trous',
  problemesAdditifs: 'problemes-additifs',
  problemesMultiplicatifs: 'problemes-multiplicatifs',
  problemesEtapes: 'problemes-etapes',
  comparerLongueursMaternelle: 'comparer-longueurs-maternelle',
  comparerMassesMaternelle: 'comparer-masses-maternelle',
  longueurs: 'longueurs',
  masses: 'masses',
  contenances: 'contenances',
  perimetre: 'perimetre',
  aires: 'aires',
  angles: 'angles',
  monnaieEuros: 'monnaie-euros',
  monnaieCentimes: 'monnaie-centimes',
  heureEntiere: 'heure-entiere',
  heureDemiQuart: 'heure-demi-quart',
  heureMinutes: 'heure-minutes',
  durees: 'durees',
  formesMaternelle: 'formes-maternelle',
  solidesMaternelle: 'solides-maternelle',
  assemblagesMaternelle: 'assemblages-maternelle',
  figuresPlanes: 'figures-planes',
  angleDroit: 'angle-droit',
  tracerFigures: 'tracer-figures',
  solides: 'solides',
  patrons: 'patrons',
  symetrie: 'symetrie',
  reperageDeplacements: 'reperage-deplacements',
  tableauxDiagrammes: 'tableaux-diagrammes',
  probabilites: 'probabilites',
  proportionnalite: 'proportionnalite',
  programmesCalcul: 'programmes-calcul',
  motifsMaternelle: 'motifs-maternelle',
  momentsJournee: 'moments-journee',
  chronologieMaternelle: 'chronologie-maternelle',
  reperesEspace: 'reperes-espace',
  categoriesMots: 'categories-mots',
  joursMois: 'jours-mois',
  syllabesOrales: 'syllabes-orales',
  nomLettres: 'nom-lettres',
  sonLettres: 'son-lettres',
  decodage: 'decodage',
  fluence: 'fluence',
  comprendreTexte: 'comprendre-texte',
  gesteEcritureMaternelle: 'geste-ecriture-maternelle',
  cursive: 'cursive',
  copie: 'copie',
  dictee: 'dictee',
  ordreAlphabetique: 'ordre-alphabetique',
  synonymesAntonymes: 'synonymes-antonymes',
  famillesMots: 'familles-mots',
  orthographeLexicale: 'orthographe-lexicale',
  accentsLettres: 'accents-lettres',
  phrase: 'phrase',
  classesMots: 'classes-mots',
  sujetVerbe: 'sujet-verbe',
  accordsGn: 'accords-gn',
  radicalTerminaison: 'radical-terminaison',
  conjugaisonPresentEtreAvoir: 'conjugaison-present-etre-avoir',
  conjugaison4Temps: 'conjugaison-4-temps',
  conjugaisonIrreguliers: 'conjugaison-irreguliers',
  conjugaison2eGroupe: 'conjugaison-2e-groupe',
  conjugaisonPasseSimple: 'conjugaison-passe-simple',
  complements: 'complements',
  ...competencesFictives,
} as const satisfies Record<string, CompetenceId>)

/** Domaines de src/data/programme.ts. */
export const D = fort('D', {
  nombresCalcul: 'nombres-calcul',
  grandeursMesures: 'grandeurs-mesures',
  espaceGeometrie: 'espace-geometrie',
  donnees: 'donnees',
  proportionnalite: 'proportionnalite',
  penseeInformatique: 'pensee-informatique',
  motifs: 'motifs',
  tempsEspace: 'temps-espace',
  lecture: 'lecture',
  ecriture: 'ecriture',
  oral: 'oral',
  vocabulaire: 'vocabulaire',
  grammaire: 'grammaire',
  cultureLitteraire: 'culture-litteraire',
  ...domainesFictifs,
} as const satisfies Record<string, DomaineId>)

// Complétude : ne compile plus si le programme a une compétence ou un domaine absent de K ou D (relancer scripts/ids.mjs)
type Manquants = Exclude<CompetenceId, (typeof K)[keyof typeof K]> | Exclude<DomaineId, (typeof D)[keyof typeof D]>
export const complet: [Manquants] extends [never] ? true : never = true

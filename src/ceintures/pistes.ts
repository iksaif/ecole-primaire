// Les pistes de ceintures fournies : un barème de paliers sur une compétence ou un exercice (plans/15-ceintures.md §3, §19, §22). Données pures : les objectifs de chaque palier sont des textes de contenu
// (src/exercices/ceintures/textes.ts, `piste.<id>.objectifs`, un objectif par palier, séparés par « | »). `libre` : l'enseignant·e écrit ses objectifs (un par ligne). Une piste qui évalue un exercice du registre
// dit, pour chaque palier, quels réglages lui demander pour son brevet : le brevet est la fiche de l'exercice avec ces réglages (src/ceintures/brevet.ts). Les valeurs des réglages sont celles des exercices
// (stables : ce sont aussi les réglages mémorisés des visiteurs) ; un test vérifie que l'exercice les accepte telles quelles. Le nombre de ceintures choisi regroupe les paliers (voir plus bas).
import type { Classe } from '../data/classes.ts'
import CALCUL_MENTAL, { PLUS, MOINS, FOIS, DOUBLES, MOITIES, COMPLEMENTS_10, COMPLEMENTS_100, VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE, FOIS_10_100 } from '../exercices/calcul-mental/definition.ts'
export const IDS_PISTES = ['tables', 'calcul-mental', 'lettres'] as const
export type IdPiste = (typeof IDS_PISTES)[number]

/** Le choix « piste » de l'activité : une piste fournie, ou `libre`. */
export const CHOIX_PISTE = [...IDS_PISTES, 'libre'] as const
export type ChoixPiste = (typeof CHOIX_PISTE)[number]

/** Au plus autant d'objectifs (paliers) que de ceintures dans le plus long jeu de couleurs. */
export const MAX_OBJECTIFS = 7

/** Les objectifs d'un texte « un par ligne » ou « séparés par | » : sans lignes vides, au plus MAX_OBJECTIFS. */
export function objectifsDe(texte: string): string[] {
  return String(texte).split(/\n|\|/).map(s => s.trim()).filter(Boolean).slice(0, MAX_OBJECTIFS)
}

// ── Les paliers et les ceintures qui ont un brevet ──
// Une piste décrit un BARÈME FIN de paliers (jusqu'à 7), du plus simple au plus complet ; le nombre de ceintures choisi (3 à 7) regroupe ces paliers : des groupes contigus de tailles presque égales (les premiers
// prennent le reste), dont les réglages sont l'union de ceux de leurs paliers. La dernière ceinture contient toujours le dernier palier (« tout »). Ainsi chaque ceinture a un brevet, quel que soit leur nombre.

/** Un palier du barème d'une piste. */
export interface Palier {
  /** les classes où ce palier existe (défaut : toutes celles de l'exercice) : un palier dont aucune opération n'existe dans une classe n'y est pas proposé */
  niveaux?: readonly Classe[]
  /** les réglages de l'exercice pour son brevet (en plus de ses défauts) ; le nombre de questions n'en fait pas partie (réglage commun des ceintures) */
  reglages?: (niveau: Classe) => Readonly<Record<string, unknown>>
  /** questions du brevet, à la place du réglage commun (le palier « sans hésiter » : 30) */
  questions?: number
  /** durée conseillée, en minutes (écrite sur le brevet) */
  duree?: number
  /** plusieurs exercices dans un même brevet : un bloc par exercice (les `reglages` du palier sont alors ignorés) ; absent : un bloc, l'exercice de la piste */
  blocs?: readonly BlocDeCeinture[]
}

/** Un bloc d'un brevet : la fiche d'un exercice du registre, avec ses réglages et son nombre de questions. */
export interface BlocDeCeinture {
  exercice: string
  /** les réglages de l'exercice pour ce bloc (en plus de ses défauts) */
  reglages?: (niveau: Classe) => Readonly<Record<string, unknown>>
  /** questions de ce bloc ; absent : le total du brevet partagé à parts égales entre les blocs */
  questions?: number
}

export interface Piste {
  /** une piste fournie, ou `sur-mesure` (construite par l'enseignant·e : src/ceintures/BrevetSurMesure.vue) */
  id: IdPiste | 'sur-mesure'
  /** l'exercice du registre qui évalue la piste (ses paliers n'ont alors qu'un bloc, sauf mention contraire) ; absent : pas de brevet écrit */
  exercice?: string
  /** titre écrit sur le brevet ; absent : celui de l'exercice de la piste */
  titre?: string
  /** le barème : de 3 à 7 paliers, du plus simple au plus complet */
  paliers: readonly Palier[]
}

/** Une ceinture : un ou plusieurs paliers regroupés. */
export interface CeintureDePiste {
  /** les indices des paliers qu'elle regroupe */
  paliers: readonly number[]
  niveaux?: readonly Classe[]
  blocs: readonly BlocDeCeinture[]
  questions?: number
  duree?: number
}

const CLASSES_CE1_PLUS: readonly Classe[] = ['ce1', 'ce2', 'cm1', 'cm2']
const TOUTES_LES_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Les réglages d'un brevet de tables : ses tables, jusqu'à 10, dans le désordre (tous les calculs des tables, que le brevet coupe). */
const tables = (liste: readonly number[]) => (): Record<string, unknown> => ({ tables: liste, jusqu: 10, ordreFiche: 'melange', nbFiche: 0 })

/** Les opérations offertes par l'exercice du calcul mental dans une classe (toutes) : le dernier palier les mêle. */
const opsOffertes = (niveau: Classe): readonly string[] => ((CALCUL_MENTAL.niveaux as Record<string, { options?: { ops?: readonly string[] } }>)[niveau]?.options?.ops ?? [])
const ops = (liste: readonly string[]) => (): Record<string, unknown> => ({ ops: liste })

export const PISTES: Readonly<Record<IdPiste, Piste>> = {
  tables: {
    id: 'tables', exercice: 'tables',
    paliers: [
      { reglages: tables([2, 5, 10]) }, { reglages: tables([3, 4]) }, { reglages: tables([6]) }, { reglages: tables([7]) }, { reglages: tables([8]) }, { reglages: tables([9]) },
      // le dernier palier : toutes les tables, sans hésiter
      { reglages: tables(TOUTES_LES_TABLES), questions: 30, duree: 3 },
    ],
  },
  'calcul-mental': {
    id: 'calcul-mental', exercice: 'calcul-mental',
    paliers: [
      { reglages: ops([PLUS, MOINS]) },
      { reglages: ops([DOUBLES, MOITIES]) },
      { reglages: ops([COMPLEMENTS_10, VERS_DIZAINE, COMPLEMENTS_100]) },
      { reglages: ops([DIZAINES, NEUF_ONZE, PASSAGE]) },
      { niveaux: CLASSES_CE1_PLUS, reglages: ops([FOIS_10_100]) },
      { niveaux: CLASSES_CE1_PLUS, reglages: ops([FOIS]) },
      // le dernier palier mêle deux exercices : tout le calcul mental, et toutes les tables
      { blocs: [{ exercice: 'calcul-mental', reglages: niveau => ({ ops: opsOffertes(niveau) }) }, { exercice: 'tables', reglages: tables(TOUTES_LES_TABLES) }], niveaux: CLASSES_CE1_PLUS },
    ],
  },
  lettres: { id: 'lettres', paliers: [{}, {}, {}, {}, {}] },
}

/** La piste qu'évalue un exercice du registre (identifiant), s'il y en a une : sa page reçoit l'onglet « Ceintures ». */
export const pisteDeExercice = (exercice: string): Piste | undefined => Object.values(PISTES).find(p => p.exercice === exercice)

/** Les identifiants des exercices qui ont un brevet. */
export const EXERCICES_AVEC_BREVET: readonly string[] = Object.values(PISTES).flatMap(p => (p.exercice ? [p.exercice] : []))

/** Le total partagé entre `nb` parts : parts égales, les premières prennent le reste (10 en 3 : 4, 3, 3). */
export const partsEgales = (total: number, nb: number): number[] => Array.from({ length: nb }, (_, k) => Math.floor(total / nb) + (k < total % nb ? 1 : 0))

/** Des éléments en `n` groupes contigus de tailles presque égales (les premiers groupes sont les plus grands). Au plus autant de groupes que d'éléments. */
export function regrouper<T>(items: readonly T[], n: number): T[][] {
  const nb = Math.max(1, Math.min(n, items.length))
  const groupes: T[][] = []
  let debut = 0
  for (const taille of partsEgales(items.length, nb)) {
    groupes.push(items.slice(debut, debut + taille))
    debut += taille
  }
  return groupes
}

/** Les objectifs d'un livret regroupés en `n` ceintures : un groupe = plusieurs objectifs, chacun sa case. */
export const objectifsRegroupes = (objectifs: readonly string[], n: number): string[][] => regrouper(objectifs, n)

/** Réunit des listes de réglages : les listes se complètent (union, dans l'ordre, triée si ce sont des nombres), le reste prend la dernière valeur. */
function fusionnerReglages(liste: readonly Readonly<Record<string, unknown>>[]): Record<string, unknown> {
  const fusion: Record<string, unknown> = {}
  for (const r of liste) {
    for (const [cle, v] of Object.entries(r)) {
      const avant = fusion[cle]
      if (Array.isArray(v) && Array.isArray(avant)) {
        const union = [...new Set([...avant, ...v])]
        fusion[cle] = union.every(x => typeof x === 'number') ? union.sort((a, b) => (a as number) - (b as number)) : union
      } else {
        fusion[cle] = v
      }
    }
  }
  return fusion
}

/** Les blocs d'un palier : les siens, ou l'exercice de la piste avec les réglages du palier (aucun bloc : la piste n'a pas de brevet). */
function blocsDuPalier(piste: Piste, palier: Palier): BlocDeCeinture[] {
  if (palier.blocs) return [...palier.blocs]
  return piste.exercice ? [{ exercice: piste.exercice, reglages: palier.reglages }] : []
}

/** Les blocs de plusieurs paliers réunis : un bloc par exercice (dans l'ordre), ses réglages réunis, son nombre de questions le plus grand. */
function fusionnerBlocs(groupes: readonly (readonly BlocDeCeinture[])[]): BlocDeCeinture[] {
  const parExercice = new Map<string, BlocDeCeinture[]>()
  for (const blocs of groupes) for (const b of blocs) parExercice.set(b.exercice, [...(parExercice.get(b.exercice) ?? []), b])
  return [...parExercice].map(([exercice, blocs]): BlocDeCeinture => {
    const questions = blocs.map(b => b.questions).filter((q): q is number => q !== undefined)
    return {
      exercice,
      reglages: niveau => fusionnerReglages(blocs.map(b => b.reglages?.(niveau) ?? {})),
      ...(questions.length ? { questions: Math.max(...questions) } : {}),
    }
  })
}

/** Les ceintures d'une piste pour `n` ceintures : ses paliers regroupés (n ≥ nombre de paliers : une ceinture par palier). */
export function ceinturesDePiste(piste: Piste, n: number): CeintureDePiste[] {
  return regrouper(piste.paliers.map((p, k) => ({ p, k })), n).map(groupe => {
    const paliers = groupe.map(g => g.p)
    const niveaux = paliers.map(p => p.niveaux).filter((x): x is readonly Classe[] => !!x)
    const questions = paliers.map(p => p.questions).filter((q): q is number => q !== undefined)
    const durees = paliers.map(p => p.duree).filter((d): d is number => d !== undefined)
    return {
      paliers: groupe.map(g => g.k),
      ...(niveaux.length ? { niveaux: niveaux.reduce((commun, liste) => commun.filter(c => liste.includes(c))) } : {}),
      blocs: fusionnerBlocs(paliers.map(p => blocsDuPalier(piste, p))),
      ...(questions.length ? { questions: Math.max(...questions) } : {}),
      ...(durees.length ? { duree: Math.max(...durees) } : {}),
    }
  })
}

/** Les blocs de la ceinture `indice` pour `n` ceintures (aucun : la ceinture n'existe pas ou la piste n'a pas de brevet). */
export const blocsDe = (piste: Piste, indice: number, n: number): BlocDeCeinture[] => [...(ceinturesDePiste(piste, n)[indice]?.blocs ?? [])]

/**
 * La ceinture `indice` (pour `n` ceintures) existe-t-elle dans cette classe ? Il faut qu'elle ait des blocs, que chacun des exercices ait cette classe (`classesDe` : les classes d'un exercice
 * du registre) et que la ceinture ne l'exclue pas.
 */
export function ceintureDisponible(piste: Piste, indice: number, niveau: Classe, classesDe: (exercice: string) => readonly Classe[], n: number): boolean {
  const c = ceinturesDePiste(piste, n)[indice]
  return !!c && c.blocs.length > 0 && c.blocs.every(b => classesDe(b.exercice).includes(niveau)) && (c.niveaux ? c.niveaux.includes(niveau) : true)
}

// Les pistes de ceintures fournies : une suite de ceintures sur une compétence ou un exercice (plans/15-ceintures.md §3, §19). Données pures :
// les objectifs de chaque ceinture sont des textes de contenu (src/exercices/ceintures/textes.ts, `piste.<id>.objectifs`, un objectif par ceinture, séparés par « | »).
// `libre` : l'enseignant·e écrit ses objectifs (un par ligne). Une piste qui évalue un exercice du registre dit, pour chaque ceinture, quels réglages demander à cet exercice
// pour son brevet : le brevet est la fiche de l'exercice avec ces réglages (src/ceintures/brevet.ts). Les valeurs des réglages sont celles des exercices (stables : ce sont aussi
// les réglages mémorisés des visiteurs) ; un test vérifie que l'exercice les accepte telles quelles.
import type { Classe } from '../data/classes.ts'
import CALCUL_MENTAL, { PLUS, MOINS, FOIS, DOUBLES, MOITIES, COMPLEMENTS_10, COMPLEMENTS_100, VERS_DIZAINE, DIZAINES, NEUF_ONZE, PASSAGE, FOIS_10_100 } from '../exercices/calcul-mental/definition.ts'
export const IDS_PISTES = ['tables', 'calcul-mental', 'lettres'] as const
export type IdPiste = (typeof IDS_PISTES)[number]

/** Le choix « piste » de l'activité : une piste fournie, ou `libre`. */
export const CHOIX_PISTE = [...IDS_PISTES, 'libre'] as const
export type ChoixPiste = (typeof CHOIX_PISTE)[number]

/** Au plus autant d'objectifs que de ceintures dans la plus longue palette. */
export const MAX_OBJECTIFS = 8

/** Les objectifs d'un texte « un par ligne » ou « séparés par | » : sans lignes vides, au plus MAX_OBJECTIFS. */
export function objectifsDe(texte: string): string[] {
  return String(texte).split(/\n|\|/).map(s => s.trim()).filter(Boolean).slice(0, MAX_OBJECTIFS)
}

// ── Les ceintures qui ont un brevet ──

/** Une ceinture d'une piste qui évalue un exercice. */
export interface CeintureDePiste {
  /** les classes où cette ceinture existe (défaut : toutes celles de l'exercice) : une ceinture dont aucune opération n'existe dans une classe n'y est pas proposée */
  niveaux?: readonly Classe[]
  /** les réglages de l'exercice pour son brevet (en plus de ses défauts) ; le nombre de questions n'en fait pas partie (réglage commun des ceintures) */
  reglages?: (niveau: Classe) => Readonly<Record<string, unknown>>
  /** questions du brevet, à la place du réglage commun (la ceinture « sans hésiter » : 30) */
  questions?: number
  /** plusieurs exercices dans un même brevet : un bloc par exercice (les `reglages` de la ceinture sont alors ignorés) ; absent : un bloc, l'exercice de la piste */
  blocs?: readonly BlocDeCeinture[]
  /** durée conseillée, en minutes (écrite sur le brevet) */
  duree?: number
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
  /** l'exercice du registre qui évalue la piste (ses ceintures n'ont alors qu'un bloc, sauf mention contraire) ; absent : pas de brevet écrit */
  exercice?: string
  /** titre écrit sur le brevet ; absent : celui de l'exercice de la piste */
  titre?: string
  ceintures: readonly CeintureDePiste[]
}

const CLASSES_CE1_PLUS: readonly Classe[] = ['ce1', 'ce2', 'cm1', 'cm2']
const TOUTES_LES_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Les réglages d'un brevet de tables : ses tables, jusqu'à 10, dans le désordre (toutes les calculs des tables, que le brevet coupe). */
const tables = (liste: readonly number[]) => (): Record<string, unknown> => ({ tables: liste, jusqu: 10, ordreFiche: 'melange', nbFiche: 0 })

/** Les opérations offertes par l'exercice du calcul mental dans une classe (toutes) : la dernière ceinture les mêle. */
const opsOffertes = (niveau: Classe): readonly string[] => ((CALCUL_MENTAL.niveaux as Record<string, { options?: { ops?: readonly string[] } }>)[niveau]?.options?.ops ?? [])
const ops = (liste: readonly string[]) => (): Record<string, unknown> => ({ ops: liste })

export const PISTES: Readonly<Record<IdPiste, Piste>> = {
  tables: {
    id: 'tables', exercice: 'tables',
    ceintures: [
      { reglages: tables([2, 5, 10]) }, { reglages: tables([3, 4]) }, { reglages: tables([6, 7]) }, { reglages: tables([8, 9]) },
      { reglages: tables(TOUTES_LES_TABLES) }, { reglages: tables(TOUTES_LES_TABLES), questions: 30, duree: 3 },
    ],
  },
  'calcul-mental': {
    id: 'calcul-mental', exercice: 'calcul-mental',
    ceintures: [
      { reglages: ops([PLUS, MOINS]) },
      { reglages: ops([DOUBLES, MOITIES]) },
      { reglages: ops([COMPLEMENTS_10, VERS_DIZAINE, COMPLEMENTS_100]) },
      { reglages: ops([DIZAINES, NEUF_ONZE, PASSAGE]) },
      { niveaux: CLASSES_CE1_PLUS, reglages: ops([FOIS_10_100, FOIS]) },
      // la dernière ceinture mêle deux exercices : tout le calcul mental, et toutes les tables
      { blocs: [{ exercice: 'calcul-mental', reglages: niveau => ({ ops: opsOffertes(niveau) }) }, { exercice: 'tables', reglages: tables(TOUTES_LES_TABLES) }], niveaux: CLASSES_CE1_PLUS },
    ],
  },
  lettres: { id: 'lettres', ceintures: [{}, {}, {}, {}, {}] },
}

/** La piste qu'évalue un exercice du registre (identifiant), s'il y en a une : sa page reçoit l'onglet « Ceintures ». */
export const pisteDeExercice = (exercice: string): Piste | undefined => Object.values(PISTES).find(p => p.exercice === exercice)

/** Les identifiants des exercices qui ont un brevet. */
export const EXERCICES_AVEC_BREVET: readonly string[] = Object.values(PISTES).flatMap(p => (p.exercice ? [p.exercice] : []))

/** Les blocs d'une ceinture : les siens, ou l'exercice de la piste avec les réglages de la ceinture (aucun bloc : la piste n'a pas de brevet). */
export function blocsDe(piste: Piste, indice: number): BlocDeCeinture[] {
  const c = piste.ceintures[indice]
  if (!c) return []
  if (c.blocs) return [...c.blocs]
  return piste.exercice ? [{ exercice: piste.exercice, reglages: c.reglages }] : []
}

/**
 * La ceinture `indice` de la piste existe-t-elle dans cette classe ? Il faut qu'elle ait des blocs, que chacun des exercices ait cette classe (`classesDe` : les classes d'un exercice
 * du registre) et que la ceinture ne l'exclue pas.
 */
export function ceintureDisponible(piste: Piste, indice: number, niveau: Classe, classesDe: (exercice: string) => readonly Classe[]): boolean {
  const c = piste.ceintures[indice]
  const blocs = c ? blocsDe(piste, indice) : []
  return !!c && blocs.length > 0 && blocs.every(b => classesDe(b.exercice).includes(niveau)) && (c.niveaux ? c.niveaux.includes(niveau) : true)
}

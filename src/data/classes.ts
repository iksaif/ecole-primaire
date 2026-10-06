// Les classes, dans l'ordre, et leurs regroupements : la seule source pour toutes les listes de classes du site
// (programme.ts, activites.js, exercices.js, pages de téléchargement, vues). Données pures (lues par node).
export const NIVEAUX = ['ps', 'ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2'] as const

/** Une classe (« cp », « ce1 »…) : l'union des ids de NIVEAUX. */
export type Classe = (typeof NIVEAUX)[number]
export type Cycle = 1 | 2 | 3

export const CYCLE_DE: Readonly<Record<Classe, Cycle>> = { ps: 1, ms: 1, gs: 1, cp: 2, ce1: 2, ce2: 2, cm1: 3, cm2: 3 }
// { id, label } pour les menus (« CE1 »)
export const CLASSES: readonly { id: Classe, label: string }[] = NIVEAUX.map(id => ({ id, label: id.toUpperCase() }))

// de a à b compris (« cp » → « ce2 » : cp, ce1, ce2) ; depuis a jusqu'au CM2
export const classesEntre = (a: Classe, b: Classe): Classe[] => NIVEAUX.slice(NIVEAUX.indexOf(a), NIVEAUX.indexOf(b) + 1)
export const classesDepuis = (a: Classe): Classe[] => NIVEAUX.slice(NIVEAUX.indexOf(a))
export const classesDuCycle = (cycle: Cycle): Classe[] => NIVEAUX.filter(n => CYCLE_DE[n] === cycle)

export const MATERNELLE = classesDuCycle(1)        // ps, ms, gs
export const CYCLE_2 = classesDuCycle(2)           // cp, ce1, ce2
export const CYCLE_3 = classesDuCycle(3)           // cm1, cm2 (le cycle 3 continue en 6e, hors du site)
export const CE = classesEntre('ce1', 'ce2')
export const CM = CYCLE_3

export const estMaternelle = (n: Classe): boolean => MATERNELLE.includes(n)
// « en MS », « au CP »
export const enClasse = (n: Classe): string => `${estMaternelle(n) ? 'en' : 'au'} ${n.toUpperCase()}`

// ── Plages de classes ──
// « cp+ » : du CP à la dernière ; « -gs » : de la première à la GS ; « ce1-cm1 » : de l'une à l'autre (bornes comprises) ; « cp » : une seule.
// La notation est un type : « cp-cm3 » ne compile pas quand la plage est écrite en littéral ; un sens inverse (« ce2-ce1 ») ou un
// texte qui n'est pas une plage lève une erreur franche à l'exécution.
type Depuis<C extends Classe, L extends readonly Classe[] = typeof NIVEAUX> = L extends readonly [infer T extends Classe, ...infer R extends Classe[]]
  ? (T extends C ? L[number] : Depuis<C, R>) : never
type Jusqua<C extends Classe, L extends readonly Classe[] = typeof NIVEAUX> = L extends readonly [infer T extends Classe, ...infer R extends Classe[]]
  ? (T extends C ? T : T | Jusqua<C, R>) : never

/** Notation d'une plage de classes : `'cp'`, `'cp+'`, `'-gs'`, `'ce1-cm1'`. */
export type NotationClasses = Classe | `${Classe}+` | `-${Classe}` | `${Classe}-${Classe}`

/** Les classes d'une notation, pour le typage : `ClassesDe<'ce1-cm2'>` = `'ce1' | 'ce2' | 'cm1' | 'cm2'`. */
export type ClassesDe<N extends NotationClasses> =
  N extends `${infer A extends Classe}-${infer B extends Classe}` ? Extract<Depuis<A>, Jusqua<B>>
  : N extends `${infer A extends Classe}+` ? Depuis<A>
  : N extends `-${infer B extends Classe}` ? Jusqua<B>
  : N extends Classe ? N : never

/** Les classes jusqu'à `b` comprise (de la première à `b`). */
export const classesJusqua = (b: Classe): Classe[] => NIVEAUX.slice(0, NIVEAUX.indexOf(b) + 1)

/** Les classes d'une notation (`'cp+'`, `'-gs'`, `'ce1-cm1'`, `'cp'`), dans l'ordre. Erreur franche si la notation n'en est pas une. */
export function plageDeClasses<const N extends NotationClasses>(notation: N): ClassesDe<N>[] {
  const estClasse = (c: string): c is Classe => (NIVEAUX as readonly string[]).includes(c)
  const [, debut = '', signe = '', fin = ''] = /^([^+-]*)([+-]?)([^+-]*)$/.exec(notation) ?? []
  const a = debut || (signe === '-' ? NIVEAUX[0] : '')
  const b = signe === '+' && !fin ? NIVEAUX[NIVEAUX.length - 1] : signe === '-' ? fin : signe === '' ? debut : ''
  if (!estClasse(a) || !estClasse(b)) throw new Error(`plageDeClasses : « ${notation} » n'est pas une plage de classes (« cp », « cp+ », « -gs », « ce1-cm1 »)`)
  if (NIVEAUX.indexOf(a) > NIVEAUX.indexOf(b)) throw new Error(`plageDeClasses : « ${notation} » va à l'envers (${a} vient après ${b})`)
  return classesEntre(a, b) as ClassesDe<N>[]
}

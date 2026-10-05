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

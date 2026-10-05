// Les classes, dans l'ordre, et leurs regroupements : la seule source pour toutes les listes de classes du site
// (programme.js, activites.js, exercices.js, pages de téléchargement, vues). Données pures (lues par node).
export const NIVEAUX = ['ps', 'ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2']
export const CYCLE_DE = { ps: 1, ms: 1, gs: 1, cp: 2, ce1: 2, ce2: 2, cm1: 3, cm2: 3 }
// { id, label } pour les menus (« CE1 »)
export const CLASSES = NIVEAUX.map(id => ({ id, label: id.toUpperCase() }))

// de a à b compris (« cp » → « ce2 » : cp, ce1, ce2) ; depuis a jusqu'au CM2
export const classesEntre = (a, b) => NIVEAUX.slice(NIVEAUX.indexOf(a), NIVEAUX.indexOf(b) + 1)
export const classesDepuis = a => NIVEAUX.slice(NIVEAUX.indexOf(a))
export const classesDuCycle = cycle => NIVEAUX.filter(n => CYCLE_DE[n] === cycle)

export const MATERNELLE = classesDuCycle(1)        // ps, ms, gs
export const CYCLE_2 = classesDuCycle(2)           // cp, ce1, ce2
export const CYCLE_3 = classesDuCycle(3)           // cm1, cm2 (le cycle 3 continue en 6e, hors du site)
export const CE = classesEntre('ce1', 'ce2')
export const CM = CYCLE_3

export const estMaternelle = n => MATERNELLE.includes(n)
// « en MS », « au CP »
export const enClasse = n => `${estMaternelle(n) ? 'en' : 'au'} ${n.toUpperCase()}`

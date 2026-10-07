// Les formes que lit le rapport de couverture (src/data/programme.ts, src/ressources/couverture.ts).
export interface Competence { id: string, domaine: string, libelle: string, niveaux: readonly string[] }
export interface Domaine { id: string, court: string }
export interface Programme { COMPETENCES: readonly Competence[], DOMAINES: readonly Domaine[], NIVEAUX: readonly string[] }

export type Sorte = 'exercice' | 'fiche' | 'affiche'
/** Ce qui travaille une compétence dans une classe, par sorte. */
export type Ressources = Record<Sorte, readonly { titre: string }[]>
export interface Couverture {
  ressourcesDe: (competence: string, niveau: string) => Ressources
}

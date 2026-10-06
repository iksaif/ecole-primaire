// Les formes des modules de l'ANCIEN monde que lit le rapport (chargés par Vite : leur type est une affirmation d'ici).
export interface Competence { id: string, domaine: string, libelle: string, niveaux: string[] }
export interface Domaine { id: string, court: string }
export interface Programme { COMPETENCES: Competence[], DOMAINES: Domaine[], NIVEAUX: string[] }

export interface Activite { to: string }
export interface Fiche { competence: string, titre: string }
export interface Exercice { id: string, route: string, titre: { fr: string }, classes: { classe: string }[], fiches?: Fiche[] }
export interface Exercices {
  EXERCICES: Exercice[]
  classesDe: (code: string) => string[]
  fichesDe: (exercice: Exercice, classe: string) => Fiche[]
}

export type Sorte = 'exercice' | 'fiche' | 'affiche'
/** Ce qui travaille une compétence dans une classe, par sorte. */
export type Ressources = Record<Sorte, { titre: string }[]>
export interface Couverture {
  ressourcesDe: (competence: string, niveau: string) => Ressources
  competencesActivite: (activite: Activite, classe: string) => string[]
}

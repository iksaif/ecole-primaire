// Le tableau du programme : pour un domaine, une ligne par compétence et une cellule par classe (ps → cm2). Pur (lisible par node) :
// aucune dépendance à Vue ; le catalogue des ressources est un argument.
//   - les compétences viennent de src/data/programme.ts (jamais inventées), dans l'ordre d'introduction puis du programme (tri stable) ;
//   - une ligne est « choisie » quand une des classes choisies la travaille (l'union des classes pour un enseignant) ;
//   - les ressources d'une ligne : celles du catalogue qui travaillent la compétence ; `pourLesClasses` ne garde que celles des classes choisies.
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { competencesDu } from '../data/programme.ts'
import type { Competence, CompetenceId } from '../data/programme.ts'
import type { RessourceDeContenu } from '../ressources/types.ts'
import { filtrerParClasses, ressourcesDeCompetence } from '../ressources/filtres.ts'
import { referenceDe } from './references.ts'
import type { Reference } from './references.ts'

export interface CelluleClasse {
  readonly classe: Classe
  /** la compétence est au programme de cette classe */
  readonly concernee: boolean
  /** la classe fait partie des classes choisies */
  readonly choisie: boolean
}

export interface LigneProgramme {
  readonly competence: Competence
  readonly cellules: readonly CelluleClasse[]
  /** une des classes choisies travaille cette compétence */
  readonly choisie: boolean
  readonly reference: Reference
  /** toutes les ressources liées */
  readonly ressources: readonly RessourceDeContenu[]
  /** celles des classes choisies */
  readonly pourLesClasses: readonly RessourceDeContenu[]
}

const anneeDIntroduction = (k: Competence): number => Math.min(...k.niveaux.map(n => NIVEAUX.indexOf(n)))

/** Les compétences d'un domaine, de la classe qui les introduit la plus petite à la plus grande (à égalité : ordre du programme). */
export const competencesDuDomaine = (domaine: string): Competence[] =>
  competencesDu(domaine).sort((a, b) => anneeDIntroduction(a) - anneeDIntroduction(b))

/** Les lignes du tableau d'un domaine pour des classes choisies. */
export function lignesDuProgramme(domaine: string, classes: readonly Classe[], catalogue: readonly RessourceDeContenu[]): LigneProgramme[] {
  return competencesDuDomaine(domaine).map(competence => {
    const ressources = ressourcesDeCompetence(catalogue, competence.id as CompetenceId)
    return {
      competence,
      cellules: NIVEAUX.map(classe => ({ classe, concernee: competence.niveaux.includes(classe), choisie: classes.includes(classe) })),
      choisie: competence.niveaux.some(n => classes.includes(n)),
      reference: referenceDe(competence.source),
      ressources,
      pourLesClasses: filtrerParClasses(ressources, classes),
    }
  })
}

/** Les classes d'une compétence qui sont aussi choisies (celles que la page met en avant). */
export const classesEnCommun = (competence: Competence, classes: readonly Classe[]): Classe[] => competence.niveaux.filter(n => classes.includes(n))

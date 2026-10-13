// Les solides — générateur : celui du moteur commun de géométrie (src/moteurs/geometrie/), avec les types de questions des niveaux de la définition
// et les familles du programme que l'exercice couvre.
import DEFINITION from './definition.ts'
import { moteurGeometrie, typesDeDefinition } from '../../moteurs/geometrie/generateur.ts'

export * from '../../moteurs/geometrie/generateur.ts'
export const { questions, questionsFiche, manquesAuProgramme } = moteurGeometrie(typesDeDefinition(DEFINITION), ['solides', 'patrons'])

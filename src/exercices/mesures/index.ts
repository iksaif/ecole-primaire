// Le module de l'exercice : sa définition et ses trois fichiers, tels que le registre (src/exercices/index.ts) les lit.
import type { ModuleExercice } from '../../noyau/types.ts'
import definition from './definition.ts'
import * as generateur from './generateur.ts'
import * as fiche from './fiche.ts'
import { CONTENU } from './textes.ts'
import type { Reglages } from './types.ts'

export const module = { definition, generateur, fiche, textes: CONTENU } satisfies ModuleExercice<generateur.Question, generateur.Reponse, Reglages, generateur.Tirage>

// Le module de l'exercice : sa définition et ses trois fichiers, tels que le registre (src/exercices/index.ts) les lit. Le générateur et la fiche
// sont ceux du moteur commun de grammaire (src/moteurs/grammaire/).
import type { ModuleExercice } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import definition from './definition.ts'
import * as generateur from '../../moteurs/grammaire/generateur.ts'
import * as fiche from '../../moteurs/grammaire/fiche.ts'
import { CONTENU } from './textes.ts'

export const module = { definition, generateur, fiche, textes: CONTENU } satisfies ModuleExercice<generateur.Question, generateur.Reponse, ReglagesDeDefinition<typeof definition>, generateur.TirageFiche>

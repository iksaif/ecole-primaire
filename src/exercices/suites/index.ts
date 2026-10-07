// Le module de l'exercice : sa définition et ses trois fichiers, tels que le registre (src/exercices/index.ts) les lit.
// `satisfies` : le module respecte le contrat du noyau (ModuleExercice) sans perdre ses types précis.
import type { ModuleExercice } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import definition from './definition.ts'
import * as generateur from './generateur.ts'
import * as fiche from './fiche.ts'
import { CONTENU } from './textes.ts'

export const module = { definition, generateur, fiche, textes: CONTENU } satisfies ModuleExercice<generateur.Question, generateur.Reponse, ReglagesDeDefinition<typeof definition>>

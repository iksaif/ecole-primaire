// L'affiche des jours de la semaine, assemblée : définition, dessin, textes.
import definition from './definition.ts'
import type { Reglages } from './definition.ts'
import * as rendu from './dessin.ts'
import { TEXTES } from './textes.ts'
import type { ModuleAffiche } from '../types.ts'

export const module: ModuleAffiche<Reglages> = { definition, rendu, textes: TEXTES }

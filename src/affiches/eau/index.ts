// L'affiche « L’eau », assemblée : définition, dessin, textes. Le registre (../index.ts) lit `module`.
import definition from './definition.ts'
import type { Reglages } from './definition.ts'
import * as rendu from './dessin.ts'
import { TEXTES } from './textes.ts'
import type { ModuleAffiche } from '../types.ts'

export const module: ModuleAffiche<Reglages> = { definition, rendu, textes: TEXTES }

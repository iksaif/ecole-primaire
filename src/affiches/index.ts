// Registre des affiches au format « définition » (src/affiches/README.md). Imports statiques, avec extensions : le même
// fichier se lit dans l'app (Vite), par node (build, scripts) et dans les tests. Un dossier de src/affiches/ absent d'ici
// et de dev.ts fait échouer tests/affiches-modele.test.mjs.
//
// Les anciennes affiches (plan 11) y entrent une par une, reportées dans ce modèle (alphabet : fait).
// Les exemples (développement seulement) sont dans dev.ts, jamais importé par du code de production.
import { module as alphabet } from './alphabet/index.ts'
import { module as monnaie } from './monnaie/index.ts'
import { module as nombres } from './nombres/index.ts'
import { module as numeration } from './numeration/index.ts'
import { module as droite } from './droite/index.ts'
import { module as tables } from './tables/index.ts'
import { module as formes } from './formes/index.ts'
import { module as horloge } from './horloge/index.ts'
// nouveau:imports
import type { Reglages } from '../noyau/types.ts'
import type { ModuleAffiche } from './types.ts'

export const REGISTRE: ModuleAffiche<Reglages>[] = [
  alphabet,
  monnaie,
  nombres,
  numeration,
  droite,
  tables,
  formes,
  horloge,
  // nouveau:registre
]

export const afficheDe = (id: string): ModuleAffiche | null => REGISTRE.find(a => a.definition.id === id) ?? null

// Les affiches d'exemple, visibles en développement seulement. Ce module n'est JAMAIS importé statiquement par du code
// de production : l'app l'atteint par `import('../affiches/exemples.ts')` sous `import.meta.env.DEV` (comme la page /dev),
// que Vite supprime du build ; tests/affiches-modele.test.mjs le vérifie. Les tests node l'importent directement.
import * as exemple from './exemple/index.ts'
import type { Reglages } from '../noyau/types.ts'
import type { ModuleAffiche } from './types.ts'

export const EXEMPLES: ModuleAffiche<Reglages>[] = [exemple.module]

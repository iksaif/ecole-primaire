// Catalogue de l'interface en breton. Traduction automatique, à faire relire : les textes à vérifier portent le
// commentaire « br: à relire » (comptés par `npm run i18n`). Mêmes clés que le français (fr/textes/index.ts) : le compilateur
// refuse une clé manquante ou en trop (`satisfies Traductions<…>`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/index.ts'
import nav from './nav.ts'
import accueil from './accueil.ts'
import reglages from './reglages.ts'
import langueRegionale from './langueRegionale.ts'
import apropos from './apropos.ts'
import pied from './pied.ts'
import avis from './avis.ts'
import nouveautes from './nouveautes.ts'
import cadre from './cadre.ts'
import formulaireAffiche from './formulaireAffiche.ts'
import telechargements from './telechargements.ts'

export default { nav, accueil, reglages, langueRegionale, apropos, pied, avis, nouveautes, cadre, formulaireAffiche, telechargements } satisfies Traductions<typeof fr>

// Catalogue de l'interface en français : la SOURCE. Les autres langues ont exactement les mêmes clés (br/textes/index.ts
// et chaque section : `satisfies Traductions<typeof …>`, une clé manquante ou en trop ne compile pas).
// Une section par page ou composant ; les clés se lisent « section.cle » (t('nav.accueil')).
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
import communs from './communs.ts'
import domaines from './domaines.ts'
import exemple from './exemple.ts'
import exempleCorpus from './exempleCorpus.ts'
import dev from './dev.ts'

export default { nav, accueil, reglages, langueRegionale, apropos, pied, avis, nouveautes, cadre, formulaireAffiche, telechargements, communs, domaines, exemple, exempleCorpus, dev } as const

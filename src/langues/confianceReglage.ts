// Le réglage « fiabilité des traductions » : le niveau minimum des fiches montrées (src/langues/confiance.ts), mémorisé sur l'appareil.
// En développement (AVEC_DEV), les pages montrent tout quand même et marquent d'une pastille ce que le réglage aurait caché.
import { ref } from 'vue'
import { AVEC_DEV } from '../dev.ts'
import type { Ref } from 'vue'
import { charger, sauvegarder } from '../utils/index.js'
import { NIVEAU_PAR_DEFAUT, estNiveauConfiance } from './confiance.ts'
import { assezSure } from './confiance.ts'
import type { NiveauConfiance } from './confiance.ts'
import { confianceDe } from './registre.ts'
import type { Langue } from './registre.ts'

const CLE = 'confiance_min'

/** Le niveau mémorisé, ou le défaut si la valeur est absente ou corrompue. */
function niveauMemorise(): NiveauConfiance {
  const lu = charger(CLE, NIVEAU_PAR_DEFAUT)
  return estNiveauConfiance(lu) ? lu : NIVEAU_PAR_DEFAUT
}

/** Niveau minimum des fiches montrées. */
export const confianceMin: Ref<NiveauConfiance> = ref(niveauMemorise())

export function choisirConfianceMin(niveau: NiveauConfiance): void {
  confianceMin.value = niveau
  sauvegarder(CLE, niveau)
}

/**
 * Le bouton de cette langue peut-il être proposé sur cet exercice ou cette affiche ? La langue source, toujours ; une traduction, seulement si elle est assez
 * sûre pour le réglage (et toujours en développement). À lire dans le `computed` qui fabrique les boutons : le réglage est réactif.
 */
export function langueProposable(code: Langue, genre: 'exercice' | 'affiche', id: string): boolean {
  return AVEC_DEV || assezSure(confianceDe(code, genre, id), confianceMin.value)
}

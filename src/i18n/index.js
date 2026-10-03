// Traductions de l'interface (français, breton). Sans dépendance.
//
// Usage dans un composant :
//   const { t, langue } = useI18n({ fr: { titre: 'Les fractions' }, br: { titre: 'An darnaouennoù' } })
//   t('titre')                 → texte dans la langue courante
//   t('score', { n: 3, total: 5 })  → interpolation de {n} et {total}
// Recherche : messages locaux de la langue → messages communs (commun.js) → français → la clé elle-même.
// Les traductions bretonnes sont à faire relire par un brittophone (voir README).
import { ref, watch } from 'vue'
import { charger, sauvegarder } from '../utils'
import { SITE } from '../site'
import { COMMUN } from './commun'

export const LANGUES_INTERFACE = [
  { id: 'fr', label: 'Français', court: 'FR' },
  { id: 'br', label: 'Brezhoneg', court: 'BR' },
]

// Langue de l'interface : celle du site par défaut (breton sur skoolik.app), mémorisée ensuite
export const langue = ref(charger('langue_interface', SITE.langue))
watch(langue, v => {
  sauvegarder('langue_interface', v)
  if (typeof document !== 'undefined') document.documentElement.lang = v
}, { immediate: true })

function interpoler(texte, params) {
  if (!params || typeof texte !== 'string') return texte
  return texte.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m))
}

export function traduire(messages, cle, params, l = langue.value) {
  const v = messages?.[l]?.[cle] ?? COMMUN[l]?.[cle] ?? messages?.fr?.[cle] ?? COMMUN.fr[cle] ?? cle
  return interpoler(typeof v === 'function' ? v(params ?? {}) : v, params)
}

export function useI18n(messages = {}) {
  return {
    langue,
    t: (cle, params) => traduire(messages, cle, params),
    // choisit entre deux valeurs selon la langue : tr({ fr: '…', br: '…' })
    tr: valeurs => valeurs?.[langue.value] ?? valeurs?.fr,
  }
}

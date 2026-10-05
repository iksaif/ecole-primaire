// Traductions de l'interface (français, breton). Sans dépendance autre que vue ; imports avec extension : lisible par
// node sans Vite (tests, scripts).
//
// Usage dans un composant :
//   const { t, langue } = useI18n({ fr: { titre: 'Les fractions' }, br: { titre: 'An darnaouennoù' } })
//   t('titre')                 → texte dans la langue courante
//   t('score', { n: 3, total: 5 })  → interpolation de {n} et {total}
// Recherche : messages locaux de la langue → messages communs (commun.js) → français → la clé elle-même.
// Les traductions bretonnes sont à faire relire par un brittophone (voir README).
import { ref, watch } from 'vue'
import { chargerValeur, sauvegarder } from '../utils/index.js'
import { SITE } from '../site.js'
import { COMMUN } from './commun.js'
import { choisirPluriel } from './pluriel.js'

export const LANGUES_INTERFACE = [
  { id: 'fr', label: 'Français', court: 'FR' },
  { id: 'br', label: 'Brezhoneg', court: 'BR' },
]

// Langue de l'interface : celle du site par défaut (breton sur skoolik.app), mémorisée ensuite
export const langue = ref(chargerValeur('langue_interface', SITE.langue))
watch(langue, v => {
  sauvegarder('langue_interface', v)
  if (typeof document !== 'undefined') document.documentElement.lang = v
}, { immediate: true })

function interpoler(texte, params) {
  if (!params || typeof texte !== 'string') return texte
  return texte.replace(/\{(\w+)\}/g, (m, k) => (k in params ? params[k] : m))
}

export function traduire(messages, cle, params, l = langue.value) {
  let v = messages?.[l]?.[cle] ?? COMMUN[l]?.[cle] ?? messages?.fr?.[cle] ?? COMMUN.fr[cle] ?? cle
  v = choisirPluriel(v, params, l)
  return interpoler(typeof v === 'function' ? v(params ?? {}) : v, params)
}

// Textes de CONTENU (énoncés, consignes de fiches…) : la langue est passée explicitement, car elle peut
// différer de l'interface (ex. exercice de français au contenu français dans une interface bretonne).
//   const C = contenu({ fr: contenuFr, br: contenuBr }, () => langueContenu.value)
//   C.t('enonceAjout', { prenom, n })
export function contenu(messages, langueDe) {
  const l = () => (typeof langueDe === 'function' ? langueDe() : langueDe) ?? langue.value
  return { t: (cle, params) => traduire(messages, cle, params, l()), langue: l }
}

// Langue imposée le temps d'un rendu (voir enLangue) ; null = langue de l'interface
let langueImposee = null

// Exécute fn() en rendant tous les t() / tr() de useI18n dans la langue l, y compris les textes
// différés des questions (fonctions évaluées pendant fn). Sert aux fiches des exercices de français :
// la fiche est entièrement en français, même avec une interface bretonne.
//   const fiche = computed(() => enLangue('fr', htmlFiche))
export function enLangue(l, fn) {
  const avant = langueImposee
  langueImposee = l
  try { return fn() } finally { langueImposee = avant }
}

export function useI18n(messages = {}) {
  // langue.value est toujours lue : les computed restent dépendants de la langue de l'interface
  const courante = () => { const l = langue.value; return langueImposee ?? l }
  return {
    langue,
    t: (cle, params) => traduire(messages, cle, params, courante()),
    // choisit entre deux valeurs selon la langue : tr({ fr: '…', br: '…' })
    tr: valeurs => valeurs?.[courante()] ?? valeurs?.fr,
  }
}

// Voix (synthèse vocale du navigateur) pour lire une consigne à voix haute.
//
//   const { enLecture, peutParler, parler, arreter } = useTTS()
//   if (peutParler('fr')) parler('Compte les billes.', 'fr')
//
// Repli silencieux : la capacité vient du registre des langues (`voix.disponible` : le breton n'en a pas, aucune comparaison avec un code de langue
// ici) ET du navigateur (synthèse présente, une voix pour la langue). Sans l'une ou l'autre, `peutParler` est faux et
// `parler` ne fait rien, sans erreur ni message : la consigne reste écrite (voir ConsigneParlee, qui masque alors son bouton).
// Tant que le navigateur n'a pas chargé ses voix (Chrome le fait en différé), on suppose qu'une voix existe.
//
// Voix et vitesse : réglées par l'adulte à un seul endroit (page des réglages, ReglageVoix.vue), mémorisées sur l'appareil
// (clé `ep_voix`) et appliquées à toutes les lectures. Voix : celle choisie pour la langue, sinon la meilleure d'après la
// règle de `voix.ts` (voix de l'appareil de qualité avant une voix en ligne). Vitesse : un facteur qui multiplie la vitesse
// propre à chaque usage (0,8 pour les consignes, réglage de la Dictée…).
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { langue as definition } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { charger, sauvegarder } from '../utils/index.js'
import { choisirVoix, classerVoix } from './voix.ts'

type Voix = SpeechSynthesisVoice

/** Réglages de voix mémorisés : facteur de vitesse et voix choisie par langue (identifiant `idVoix`, absente = automatique). */
export interface PreferencesVoix {
  vitesse: number
  voix: Partial<Record<Langue, string>>
}

/** Bornes du facteur de vitesse proposé à l'adulte. */
export const VITESSE_MIN = 0.6
export const VITESSE_MAX = 1.4

const synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
// les voix du navigateur, remises à jour quand il les (re)charge ; partagées par tous les usages
const voix: Ref<readonly Voix[]> = ref(synth?.getVoices() ?? [])
synth?.addEventListener?.('voiceschanged', () => { voix.value = synth.getVoices() })

// Facteur de vitesse lu : un nombre dans les bornes, sinon 1 (sauvegarde ancienne ou abîmée)
function lireVitesse(v: unknown): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return 1
  return Math.min(VITESSE_MAX, Math.max(VITESSE_MIN, v))
}

// Voix choisies lues : on ne garde que les identifiants texte
function lireVoixChoisies(v: unknown): Partial<Record<Langue, string>> {
  if (v === null || typeof v !== 'object' || Array.isArray(v)) return {}
  const choisies: Partial<Record<Langue, string>> = {}
  for (const [code, id] of Object.entries(v)) {
    if (typeof id === 'string' && id) choisies[code as Langue] = id
  }
  return choisies
}

// Réglages mémorisés, assainis : une sauvegarde abîmée ne bloque jamais la lecture
function lirePreferences(): PreferencesVoix {
  const lu: unknown = charger('voix', null)
  const objet = lu !== null && typeof lu === 'object' && !Array.isArray(lu) ? lu as Record<string, unknown> : {}
  return { vitesse: lireVitesse(objet.vitesse), voix: lireVoixChoisies(objet.voix) }
}

const preferences: Ref<PreferencesVoix> = ref(lirePreferences())
watch(preferences, v => sauvegarder('voix', v), { deep: true })

/** La synthèse vocale existe-t-elle dans ce navigateur ? */
export const syntheseDisponible = synth !== null

/** Réglages de voix partagés (page des réglages). */
export function usePreferencesVoix() {
  /** Voix du navigateur qui parlent la langue, de la meilleure à la moins bonne (vide si la langue n'a pas de voix). */
  function voixDe(langue: Langue): Voix[] {
    const { disponible, bcp47 } = definition(langue).voix
    if (!disponible) return []
    return classerVoix(voix.value, bcp47)
  }

  /** La voix qui lira la langue (choix de l'adulte ou automatique), ou null. */
  function voixUtilisee(langue: Langue): Voix | null {
    const { disponible, bcp47 } = definition(langue).voix
    if (!disponible) return null
    return choisirVoix(voix.value, bcp47, preferences.value.voix[langue])
  }

  return { preferences, voixDe, voixUtilisee }
}

export interface OptionsParler {
  /** 1 = vitesse normale ; 0,8 par défaut (enfants) ; multipliée par le facteur réglé par l'adulte */
  vitesse?: number
  /** appelé à la fin de la lecture */
  apres?: () => void
}

export function useTTS() {
  const enLecture = ref(false)
  // une seule lecture à la fois : seule la dernière lecture peut changer l'état (cancel() termine la précédente)
  let courante: SpeechSynthesisUtterance | null = null

  /** La langue peut-elle être lue ? (capacité de la langue ET du navigateur) */
  function peutParler(langue: Langue): boolean {
    if (!synth || !definition(langue).voix.disponible) return false
    return voix.value.length === 0 || choisirVoix(voix.value, definition(langue).voix.bcp47) !== null
  }

  /** Lit le texte ; rend faux (sans rien dire) si la langue ne peut pas être lue. */
  function parler(texte: string, langue: Langue, { vitesse = 0.8, apres }: OptionsParler = {}): boolean {
    if (!synth || !peutParler(langue)) return false
    const { bcp47 } = definition(langue).voix
    synth.cancel()
    const u = new SpeechSynthesisUtterance(texte)
    u.lang = bcp47
    u.rate = vitesse * preferences.value.vitesse
    u.pitch = 1.05
    // au moment de lire : les voix sont chargées à ce stade
    const v = choisirVoix(synth.getVoices(), bcp47, preferences.value.voix[langue])
    if (v) u.voice = v
    u.onstart = () => { if (courante === u) enLecture.value = true }
    u.onend = () => { if (courante === u) { enLecture.value = false; courante = null; apres?.() } }
    u.onerror = () => { if (courante === u) { enLecture.value = false; courante = null } }
    courante = u
    synth.speak(u)
    return true
  }

  function arreter(): void {
    courante = null
    synth?.cancel()
    enLecture.value = false
  }

  return { enLecture, peutParler, parler, arreter }
}

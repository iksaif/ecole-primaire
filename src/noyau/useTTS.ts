// Voix (synthèse vocale du navigateur) pour lire une consigne à voix haute.
//
//   const { enLecture, peutParler, parler, arreter } = useTTS()
//   if (peutParler('fr')) parler('Compte les billes.', 'fr')
//
// Repli silencieux : la capacité vient du registre des langues (`voix.disponible` : le breton n'en a pas, aucune comparaison avec un code de langue
// ici) ET du navigateur (synthèse présente, une voix pour la langue). Sans l'une ou l'autre, `peutParler` est faux et
// `parler` ne fait rien, sans erreur ni message : la consigne reste écrite (voir ConsigneParlee, qui masque alors son bouton).
// Tant que le navigateur n'a pas chargé ses voix (Chrome le fait en différé), on suppose qu'une voix existe.
import { ref } from 'vue'
import type { Ref } from 'vue'
import { langue as definition } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { choisirVoix } from './voix.ts'

type Voix = SpeechSynthesisVoice

const synth: SpeechSynthesis | null = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
// les voix du navigateur, remises à jour quand il les (re)charge ; partagées par tous les usages
const voix: Ref<readonly Voix[]> = ref(synth?.getVoices() ?? [])
synth?.addEventListener?.('voiceschanged', () => { voix.value = synth.getVoices() })

export interface OptionsParler {
  /** 1 = vitesse normale ; 0,8 par défaut (enfants) */
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
    u.rate = vitesse
    u.pitch = 1.05
    const v = choisirVoix(synth.getVoices(), bcp47)   // au moment de lire : les voix sont chargées à ce stade
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

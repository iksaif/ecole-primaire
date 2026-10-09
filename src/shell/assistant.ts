// Assistant de première visite (« visite guidée ») : quelles étapes selon le profil, quand l'ouvrir, comment le revoir.
// Le composant est `AssistantAccueil.vue` (monté par l'accueil : il ne s'ouvre qu'à la première visite de l'accueil). Les éléments de la barre qu'il montre portent un attribut
// `data-repere` (AppNav) : une étape en cite plusieurs, le premier visible gagne (au téléphone, le ☰ remplace ce qui est caché).
import { ref } from 'vue'
import type { Router } from 'vue-router'
import type { Profil } from '../contexte/types.ts'
import { charger, sauvegarder } from '../utils/index.js'

/** Repères de la barre du haut (`data-repere="…"`). */
export type Repere = 'classe' | 'profil' | 'langue' | 'programme' | 'menu'

export type IdEtape = 'profil' | 'classes' | 'enfant' | 'langue' | 'programme' | 'fin'

export interface EtapeAssistant {
  readonly id: IdEtape
  /** éléments à montrer, par ordre de préférence (le premier visible) ; vide : fenêtre centrée */
  readonly reperes: readonly Repere[]
}

/** Profils que l'assistant propose : l'enfant n'arrive pas seul la première fois, le mode enfant est expliqué au parent. */
export const PROFILS_ASSISTANT = ['parent', 'enseignant'] as const satisfies readonly Profil[]

/** Demande de revoir l'assistant (bouton des réglages ou d'« À propos ») : l'accueil l'ouvre à son arrivée. */
export const assistantDemande = ref(false)

/** L'assistant a déjà été vu (ou passé) sur cet appareil : réglage mémorisé `ep_assistant_vu`. */
export const assistantVu = (): boolean => charger('assistant_vu') === true

export const marquerAssistantVu = (): void => { sauvegarder('assistant_vu', true) }

/**
 * Toute première visite : l'assistant n'a jamais été fermé et rien de ce qu'il règle n'est mémorisé (une personne qui
 * avait déjà choisi son profil ou ses classes avant l'assistant ne le voit pas d'office).
 */
export function premiereVisite(): boolean {
  if (assistantVu()) return false
  const dejaRegle = ['profil', 'classes', 'classe'].some(cle => charger(cle) !== null)
  return !dejaRegle
}

/**
 * Les étapes pour un profil. Parent : sa classe, puis le mode enfant. Enseignant : ses classes, la langue régionale (si le
 * site en propose une), le Programme. Toujours : le choix du profil d'abord, la fin ensuite.
 */
export function etapesAssistant(profil: Profil, avecLangueRegionale: boolean): EtapeAssistant[] {
  const debut: EtapeAssistant = { id: 'profil', reperes: [] }
  const classes: EtapeAssistant = { id: 'classes', reperes: ['classe'] }
  const fin: EtapeAssistant = { id: 'fin', reperes: [] }
  if (profil !== 'enseignant') {
    return [debut, classes, { id: 'enfant', reperes: ['profil', 'menu'] }, fin]
  }
  const langue: EtapeAssistant[] = avecLangueRegionale ? [{ id: 'langue', reperes: ['langue', 'menu'] }] : []
  return [debut, classes, ...langue, { id: 'programme', reperes: ['programme', 'menu'] }, fin]
}

/** Revoir l'assistant : il s'ouvre sur l'accueil. */
export async function revoirAssistant(router: Router): Promise<void> {
  assistantDemande.value = true
  await router.push('/')
}

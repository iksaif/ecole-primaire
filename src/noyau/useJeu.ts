// Boucle de jeu commune des exercices du noyau : questions, question courante, score, retour, fin.
//
//   const jeu = useJeu<Question, Reponse>({
//     generer: rng => questions({ …, rng }),   // les questions de chaque partie ; rng : graine propre à la partie
//     verifier: (q, rep) => booléen | { ok, nuance },   // juste ? nuance : remarque (ex. 'accents'), voir Verdict
//     messageErreur: (q, rep) => texte,       // retour affiché après une erreur (facultatif ; rep null si passée)
//     messageNuance: (q, nuance) => texte,    // retour quand le verdict porte une nuance (facultatif)
//     surQuestion: q => …,                    // à chaque nouvelle question (vider les champs…)
//     delai: 1600,                            // ms avant la question suivante, après une bonne réponse ; null : jamais
//                                             // seule, on attend jeu.suivante (« Suivant » : l'élève lit l'explication)
//     apresErreur: 'attendre',                // 'attendre' (bouton « Suivant » → jeu.suivante) | n ms avant la suite, seule
//     serie: false,                           // true : toutes les questions sur un écran (lignes d'un tableau) ;
//                                             // q => clé : les questions de même clé forment un écran
//   })
//   jeu.demarrer()  jeu.repondre(rep, { donne })  jeu.passer()  jeu.suivante()  jeu.recommencer()  jeu.quitter()
//
// Mode série : l'écran montre plusieurs questions (jeu.ecran : leurs indices), auxquelles l'élève répond dans l'ordre ;
// une réponse passe aussitôt à la ligne suivante du même écran, et la dernière ligne suit la règle ordinaire.
// L'historique sert au tableau de correction de fin. etat / etatDe(entrée) : '' | 'ok' | 'presque' | 'erreur' (classes
// CSS communes : .exercise-input, .feedback, .prog-dot). Le message de fin et les confettis sont déclenchés par un
// watch sur la phase (jamais dans un computed), et le minuteur est arrêté quand la vue est démontée.
// `jeu.q` est undefined hors partie : une vue l'affiche sous `v-if="jeu.phase.value === 'jeu' && jeu.q.value"`.
import { ref, computed, watch, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { confettis } from '../utils/index.js'
import { creerRng, graineAleatoire } from '../utils/hasard.ts'
import type { Rng } from '../utils/hasard.ts'
import { lireVerdict } from './reglages.ts'
import type { Verdict } from './types.ts'
import { useLangue } from '../langues/useLangue.ts'

/** Où en est la partie. */
export type PhaseJeu = 'config' | 'jeu' | 'resultats'
/** État d'un retour ou d'une entrée de l'historique : '' (pas encore répondu), 'ok', 'presque' (nuance), 'erreur'. */
export type EtatJeu = '' | 'ok' | 'presque' | 'erreur'
/** Clé du message de fin, dans la section `communs` du catalogue. */
export type CleFin = 'resultat100' | 'resultat80' | 'resultat60' | 'resultat40' | 'resultat0'

/** Retour affiché après une réponse (null tant que la question attend sa réponse). */
export interface RetourJeu { ok: boolean, nuance: string | null, message: string }

/** Une réponse donnée, rangée dans l'historique (tableau de correction) avec les `infos` passées à repondre / passer. */
export type EntreeHistorique<Q, Rep> = { question: Q, rep: Rep | null, ok: boolean, nuance: string | null } & Record<string, unknown>

/**
 * Options de useJeu. Q : une question ; Rep : la réponse de l'élève, dans la forme attendue par `verifier`.
 */
export interface OptionsJeu<Q, Rep = unknown> {
  /** tableau de questions, à chaque partie ; rng : graine propre à la partie */
  generer: (rng: Rng) => Q[]
  /** juste ? un booléen, ou { ok, nuance } */
  verifier: (q: Q, rep: Rep) => Verdict
  /** retour affiché après une erreur (rep null si la question est passée) */
  messageErreur?: ((q: Q, rep: Rep | null) => string) | null
  /** retour quand le verdict porte une nuance */
  messageNuance?: ((q: Q, nuance: string) => string) | null
  /** à chaque nouvelle question (vider les champs…) */
  surQuestion?: ((q: Q) => void) | null
  /** ms avant la question suivante, après une bonne réponse ; null : jamais seule */
  delai?: number | null
  /** après une erreur : 'attendre' le bouton « Suivant » (jeu.suivante), ou passer seule à la suite après n ms */
  apresErreur?: 'attendre' | number
  /** true : toutes les questions sur un écran ; q => clé : les questions de même clé forment un écran */
  serie?: boolean | ((q: Q) => unknown)
}

/** Ce que rend useJeu() : l'état de la partie et ses actions (jeu.q, jeu.repondre…). */
export type Jeu<Q, Rep = unknown> = ReturnType<typeof useJeu<Q, Rep>>

// clé du message de fin (section `communs`) selon la part de bonnes réponses ; confettis à partir de 80 %
export function cleFinDe(bonnes: number, total: number): CleFin {
  const pct = total ? (bonnes / total) * 100 : 0
  return pct === 100 ? 'resultat100' : pct >= 80 ? 'resultat80' : pct >= 60 ? 'resultat60' : pct >= 40 ? 'resultat40' : 'resultat0'
}
const CONFETTIS: Partial<Record<CleFin, number>> = { resultat100: 50, resultat80: 25 }

// état d'un retour ou d'une entrée de l'historique : '' (pas encore répondu), 'ok', 'presque' (nuance), 'erreur'
export const etatDe = (r: { ok: boolean, nuance?: string | null } | null | undefined): EtatJeu =>
  (!r ? '' : r.nuance ? 'presque' : r.ok ? 'ok' : 'erreur')

export function useJeu<Q, Rep = unknown>({
  generer, verifier, messageErreur = null, messageNuance = null, surQuestion = null,
  delai = 1600, apresErreur = 'attendre', serie = false,
}: OptionsJeu<Q, Rep>) {
  const { liste } = useLangue()
  const phase = ref<PhaseJeu>('config')
  const questions = ref([]) as Ref<Q[]>
  const index = ref(0)
  const bonnes = ref(0)
  const mauvaises = ref(0)
  const historique = ref([]) as Ref<EntreeHistorique<Q, Rep>[]>
  const retour = ref(null) as Ref<RetourJeu | null>   // null tant que la question attend une réponse
  const cleFin = ref<CleFin | ''>('')
  // undefined hors partie (avant demarrer, après la dernière question)
  const q = computed<Q | undefined>(() => questions.value[index.value])
  const repondu = computed(() => retour.value !== null)
  const etat = computed(() => etatDe(retour.value))
  // clé d'écran d'une question (mode série)
  const cleEcran = serie === true ? () => 0 : typeof serie === 'function' ? serie : null
  const ecran = computed<number[]>(() => {
    if (!cleEcran || !q.value) return q.value ? [index.value] : []
    const k = cleEcran(q.value)
    return questions.value.map((x, i) => i).filter(i => cleEcran(questions.value[i]) === k)
  })
  let minuteur: ReturnType<typeof setTimeout> | null = null
  const arreter = () => { if (minuteur !== null) clearTimeout(minuteur); minuteur = null }

  function nouvelleQuestion() {
    retour.value = null
    surQuestion?.(q.value as Q)   // jamais undefined : demarrer refuse une partie sans question
  }

  function demarrer() {
    arreter()
    // le jeu a sa propre graine, tirée à chaque partie (la graine de la page sert aux fiches : useGraine)
    const tirees = generer(creerRng(graineAleatoire()))
    // une partie vide serait un écran blanc sans issue : on refuse, la page reste sur ses réglages
    if (!tirees.length) throw new Error('useJeu : `generer` n\'a rendu aucune question (réglages sans valeur ? nombre de questions nul ?)')
    questions.value = tirees
    index.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
    phase.value = 'jeu'
    nouvelleQuestion()
  }

  function noter({ ok, nuance }: { ok: boolean, nuance: string | null }, rep: Rep | null, infos: Record<string, unknown>, message: string) {
    retour.value = { ok, nuance, message }
    if (ok) bonnes.value++
    else mauvaises.value++
    const courante = q.value as Q   // noter n'est appelée que par repondre / passer, qui ont vérifié q
    historique.value.push({ question: courante, rep, ok, nuance, ...infos })
    const suivanteDansEcran = cleEcran && questions.value[index.value + 1] && cleEcran(questions.value[index.value + 1]) === cleEcran(courante)
    if (suivanteDansEcran) suivante()
    else if (ok) { if (delai !== null) minuteur = setTimeout(suivante, delai) }
    else if (apresErreur !== 'attendre') minuteur = setTimeout(suivante, apresErreur)
    return ok
  }

  // rep : la réponse, dans la forme attendue par `verifier` ; infos : rangées dans l'historique (ex. { donne })
  function repondre(rep: Rep, infos: Record<string, unknown> = {}) {
    if (repondu.value || !q.value) return false
    const verdict = lireVerdict(verifier(q.value, rep))
    const bravo = liste('communs.bravo')
    const message = verdict.nuance && messageNuance ? messageNuance(q.value, verdict.nuance)
      : verdict.ok ? bravo[Math.floor(Math.random() * bravo.length)] : (messageErreur?.(q.value, rep) ?? '')
    return noter(verdict, rep, infos, message)
  }

  function passer(infos: Record<string, unknown> = {}) {
    if (repondu.value || !q.value) return
    noter({ ok: false, nuance: null }, null, infos, messageErreur?.(q.value, null) ?? '')
  }

  function suivante() {
    arreter()
    index.value++
    if (index.value >= questions.value.length) phase.value = 'resultats'
    else nouvelleQuestion()
  }

  function quitter() {
    arreter()
    phase.value = 'config'
  }

  watch(phase, p => {
    if (p !== 'resultats') return
    cleFin.value = cleFinDe(bonnes.value, questions.value.length)
    const confetti = cleFin.value && CONFETTIS[cleFin.value]
    if (confetti) confettis(confetti)
  })

  onUnmounted(arreter)

  return {
    phase, questions, index, q, ecran, bonnes, mauvaises, historique, retour, repondu, etat, cleFin,
    demarrer, repondre, passer, suivante, recommencer: demarrer, quitter,
  }
}

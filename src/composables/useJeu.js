// Boucle de jeu commune des exercices (plan 10) : questions, question courante, score, retour, fin.
//
//   const jeu = useJeu({
//     generer: rng => questions({ …, rng }),   // tableau de questions, à chaque partie ; rng : graine propre à la partie
//     verifier: (q, rep) => booléen | { ok, nuance },   // juste ? nuance : remarque (ex. 'accents'), voir lireVerdict
//     messageErreur: (q, rep) => texte,       // retour affiché après une erreur (facultatif ; rep null si passée)
//     messageNuance: (q, nuance) => texte,    // retour quand le verdict porte une nuance (facultatif)
//     surQuestion: q => …,                    // à chaque nouvelle question (vider les champs…)
//     delai: 1600,                            // ms avant la question suivante, après une bonne réponse
//     apresErreur: 'attendre',                // 'attendre' (bouton « Suivant » → jeu.suivante) | 'continuer' (seule)
//     delaiErreur: delai,                     // ms avant la suite après une erreur, si apresErreur = 'continuer'
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
import { ref, computed, watch, onUnmounted } from 'vue'
import { confettis } from '../utils/index.js'
import { creerRng, graineAleatoire } from '../utils/hasard.js'
import { lireVerdict } from '../exercices/outils.js'
import { useI18n } from '../i18n/index.js'

// clé du message de fin (catalogue commun) selon la part de bonnes réponses ; confettis à partir de 80 %
export function cleFinDe(bonnes, total) {
  const pct = total ? (bonnes / total) * 100 : 0
  return pct === 100 ? 'resultat100' : pct >= 80 ? 'resultat80' : pct >= 60 ? 'resultat60' : pct >= 40 ? 'resultat40' : 'resultat0'
}
const CONFETTIS = { resultat100: 50, resultat80: 25 }

// état d'un retour ou d'une entrée de l'historique : '' (pas encore répondu), 'ok', 'presque' (nuance), 'erreur'
export const etatDe = r => (!r ? '' : r.nuance ? 'presque' : r.ok ? 'ok' : 'erreur')

export function useJeu({
  generer, verifier, messageErreur = null, messageNuance = null, surQuestion = null,
  delai = 1600, apresErreur = 'attendre', delaiErreur = delai, serie = false,
}) {
  const { t } = useI18n()
  const phase = ref('config')          // 'config' | 'jeu' | 'resultats'
  const questions = ref([])
  const index = ref(0)
  const bonnes = ref(0)
  const mauvaises = ref(0)
  const historique = ref([])           // [{ question, rep, ok, nuance, …infos }]
  const retour = ref(null)             // null tant que la question attend une réponse, sinon { ok, nuance, message }
  const cleFin = ref('')
  const q = computed(() => questions.value[index.value])
  const repondu = computed(() => retour.value !== null)
  const etat = computed(() => etatDe(retour.value))
  // clé d'écran d'une question (mode série)
  const cleEcran = serie === true ? () => 0 : typeof serie === 'function' ? serie : null
  const ecran = computed(() => {
    if (!cleEcran || !q.value) return q.value ? [index.value] : []
    const k = cleEcran(q.value)
    return questions.value.map((x, i) => i).filter(i => cleEcran(questions.value[i]) === k)
  })
  let minuteur = null
  const arreter = () => { clearTimeout(minuteur); minuteur = null }

  function nouvelleQuestion() {
    retour.value = null
    surQuestion?.(q.value)
  }

  function demarrer() {
    arreter()
    // le jeu a sa propre graine, tirée à chaque partie (la graine de la page sert aux fiches : useGraine)
    questions.value = generer(creerRng(graineAleatoire()))
    index.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
    phase.value = 'jeu'
    nouvelleQuestion()
  }

  function noter({ ok, nuance }, rep, infos, message) {
    retour.value = { ok, nuance, message }
    if (ok) bonnes.value++
    else mauvaises.value++
    historique.value.push({ question: q.value, rep, ok, nuance, ...infos })
    const suivanteDansEcran = cleEcran && questions.value[index.value + 1] && cleEcran(questions.value[index.value + 1]) === cleEcran(q.value)
    if (suivanteDansEcran) suivante()
    else if (ok) minuteur = setTimeout(suivante, delai)
    else if (apresErreur === 'continuer') minuteur = setTimeout(suivante, delaiErreur)
    return ok
  }

  // rep : la réponse, dans la forme attendue par `verifier` ; infos : rangées dans l'historique (ex. { donne })
  function repondre(rep, infos = {}) {
    if (repondu.value || !q.value) return false
    const verdict = lireVerdict(verifier(q.value, rep))
    const bravo = t('bravo')
    const message = verdict.nuance && messageNuance ? messageNuance(q.value, verdict.nuance)
      : verdict.ok ? bravo[Math.floor(Math.random() * bravo.length)] : (messageErreur?.(q.value, rep) ?? '')
    return noter(verdict, rep, infos, message)
  }

  function passer(infos = {}) {
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
    if (CONFETTIS[cleFin.value]) confettis(CONFETTIS[cleFin.value])
  })

  onUnmounted(arreter)

  return {
    phase, questions, index, q, ecran, bonnes, mauvaises, historique, retour, repondu, etat, cleFin,
    demarrer, repondre, passer, suivante, recommencer: demarrer, quitter,
  }
}

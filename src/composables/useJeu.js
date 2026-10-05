// Boucle de jeu commune des exercices (plan 10) : questions, question courante, score, retour, fin.
//
//   const jeu = useJeu({
//     generer: () => questions(…),            // tableau de questions, appelé à chaque partie
//     verifier: (q, rep) => booléen,          // la réponse est-elle juste ?
//     messageErreur: (q, rep) => texte,       // retour affiché après une erreur (facultatif)
//     surQuestion: q => …,                    // à chaque nouvelle question (vider les champs, focus…)
//   })
//   jeu.demarrer()  jeu.repondre(rep, { donne })  jeu.passer()  jeu.suivante()  jeu.recommencer()  jeu.quitter()
//
// Après une bonne réponse, la question suivante arrive seule (`delai` ms) ; après une erreur, l'élève lit la
// correction et clique « Suivant » (jeu.suivante). L'historique sert au tableau de correction de fin.
// Le message de fin et les confettis sont déclenchés par un watch sur la phase (jamais dans un computed), et le
// minuteur est arrêté quand la vue est démontée.
import { ref, computed, watch, onUnmounted } from 'vue'
import { confettis } from '../utils/index.js'
import { useI18n } from '../i18n/index.js'

// clé du message de fin (catalogue commun) selon la part de bonnes réponses ; confettis à partir de 80 %
export function cleFinDe(bonnes, total) {
  const pct = total ? (bonnes / total) * 100 : 0
  return pct === 100 ? 'resultat100' : pct >= 80 ? 'resultat80' : pct >= 60 ? 'resultat60' : pct >= 40 ? 'resultat40' : 'resultat0'
}
const CONFETTIS = { resultat100: 50, resultat80: 25 }

export function useJeu({ generer, verifier, messageErreur = null, surQuestion = null, delai = 1600 }) {
  const { t } = useI18n()
  const phase = ref('config')          // 'config' | 'jeu' | 'resultats'
  const questions = ref([])
  const index = ref(0)
  const bonnes = ref(0)
  const mauvaises = ref(0)
  const historique = ref([])           // [{ question, rep, ok, …infos }]
  const retour = ref(null)             // null tant que la question attend une réponse, sinon { ok, message }
  const cleFin = ref('')
  const q = computed(() => questions.value[index.value])
  const repondu = computed(() => retour.value !== null)
  let minuteur = null
  const arreter = () => { clearTimeout(minuteur); minuteur = null }

  function nouvelleQuestion() {
    retour.value = null
    surQuestion?.(q.value)
  }

  function demarrer() {
    arreter()
    questions.value = generer()
    index.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
    phase.value = 'jeu'
    nouvelleQuestion()
  }

  function noter(ok, rep, infos, message) {
    retour.value = { ok, message }
    if (ok) bonnes.value++
    else mauvaises.value++
    historique.value.push({ question: q.value, rep, ok, ...infos })
    if (ok) minuteur = setTimeout(suivante, delai)
    return ok
  }

  // rep : la réponse, dans la forme attendue par `verifier` ; infos : rangées dans l'historique (ex. { donne })
  function repondre(rep, infos = {}) {
    if (repondu.value || !q.value) return false
    const ok = !!verifier(q.value, rep)
    const bravo = t('bravo')
    const message = ok ? bravo[Math.floor(Math.random() * bravo.length)] : (messageErreur?.(q.value, rep) ?? '')
    return noter(ok, rep, infos, message)
  }

  function passer(infos = {}) {
    if (repondu.value || !q.value) return
    noter(false, null, infos, messageErreur?.(q.value, null) ?? '')
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
    phase, questions, index, q, bonnes, mauvaises, historique, retour, repondu, cleFin,
    demarrer, repondre, passer, suivante, recommencer: demarrer, quitter,
  }
}

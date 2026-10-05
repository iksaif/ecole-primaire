<template>
  <div class="container">
    <h1 class="section-heading">🕐 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in Object.keys(DEFINITION.niveaux)" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('exercices') }}</div>
        <div class="btn-group">
          <button v-for="ex in options.exercices" :key="ex"
            class="level-btn" :class="{ active: config.exercices.includes(ex) }"
            @click="basculer('exercices', ex)">{{ t(`ex_${ex}`) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('precision') }}</div>
        <div class="btn-group">
          <button v-for="p in options.precisions" :key="p"
            class="level-btn" :class="{ active: config.precisions.includes(p) }"
            @click="basculer('precisions', p)">{{ t(`prec_${p}`) }}{{ estBonus(DEFINITION, config.niveau, 'precisions', p) ? ` (${t('bonus')})` : '' }}</button>
        </div>
        <div v-if="config.niveau === 'cp'" class="aide-config">{{ t('aideCp') }}</div>
        <div v-if="config.niveau === 'ce1'" class="aide-config">{{ t('aideCe1') }}</div>
      </div>

      <div class="config-section" v-if="mode === 'jouer' && config.exercices.includes('lire')">
        <div class="config-section-title">{{ t('reponseLire') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.saisie === 'choix' }" @click="config.saisie = 'choix'">{{ t('propositions4') }}</button>
          <button class="level-btn" :class="{ active: config.saisie === 'clavier' }" @click="config.saisie = 'clavier'">{{ t('jEcris') }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('aide') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.aideMinutes }" @click="config.aideMinutes = !config.aideMinutes">
            {{ config.aideMinutes ? '✓ ' : '' }}{{ t('afficherMinutes') }}
          </button>
        </div>
      </div>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <template v-if="mode === 'imprimer'">
        <div class="config-section">
          <div class="config-section-title">{{ t('nbHorloges') }}</div>
          <div class="btn-group">
            <button v-for="n in [4, 8, 12]" :key="n"
              class="level-btn" :class="{ active: config.nbHorloges === n }"
              @click="config.nbHorloges = n">{{ n }}</button>
          </div>
        </div>
      </template>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="jeu.quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <!-- (a) Lire l'heure -->
        <template v-if="q.type === 'lire'">
          <div class="consigne">{{ t('quelleHeure') }}</div>
          <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
          <div class="legende-aiguilles"><span class="leg-h">{{ t('legH') }}</span> · <span class="leg-m">{{ t('legM') }}</span></div>

          <div v-if="q.mode === 'choix'" class="choix-grille">
            <button v-for="(o, i) in q.options" :key="i" class="choix-btn"
              :class="classeChoix(i)" :disabled="repondu" @click="validerChoix(i)">{{ o.label }}</button>
          </div>
        </template>

        <!-- (b) Placer les aiguilles -->
        <template v-else-if="q.type === 'placer'">
          <div class="consigne">
            {{ t('placeAiguilles') }}
            <strong v-if="q.consigneOrale">« {{ q.oral }} »</strong>
            <strong v-else>{{ q.ecrit }}</strong>
            <button v-if="voixFr" class="btn-ecouter" :title="t('ecouter')" @click="lire(q.oral)">🔊</button>
          </div>
          <div ref="cadranEl" class="horloge deplacable"
            @pointerdown="debutGlisser" @pointermove="glisser" @pointerup="finGlisser" @pointercancel="finGlisser"
            v-html="horlogeSvg(aiguilles.h, aiguilles.m, repondu && !dernierOk ? { h: q.h, m: q.m } : null)"></div>
          <div class="legende-aiguilles">{{ t('glisser') }}</div>
          <div class="reglages">
            <div class="reglage">
              <span class="leg-h">{{ t('petiteAiguille') }}</span>
              <div class="btn-group">
                <button class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('reculerHeure')" @click="ajouterHeures(-1)">−</button>
                <button class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('avancerHeure')" @click="ajouterHeures(1)">+</button>
              </div>
            </div>
            <div class="reglage">
              <span class="leg-m">{{ t('grandeAiguille') }}</span>
              <div class="btn-group">
                <button class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('reculerMinutes', { n: 5 })" @click="ajouterMinutes(-5)">−5</button>
                <button v-if="pasMinutes === 1" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('reculerMinutes', { n: 1 })" @click="ajouterMinutes(-1)">−1</button>
                <button v-if="pasMinutes === 1" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('avancerMinutes', { n: 1 })" @click="ajouterMinutes(1)">+1</button>
                <button class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('avancerMinutes', { n: 5 })" @click="ajouterMinutes(5)">+5</button>
              </div>
            </div>
          </div>
        </template>

        <!-- (c) Matin / après-midi -->
        <template v-else-if="q.type === 'journee' && q.sous === 'lire24'">
          <div class="consigne">{{ q.phrase }}<br>{{ t('quelleHeure') }} <small>{{ t('ecrisNumerique') }}</small></div>
          <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
        </template>

        <template v-else-if="q.type === 'journee' && q.sous === 'choisir'">
          <div class="consigne">{{ t('ilEst1') }}<strong>{{ q.ecrit24 }}</strong>{{ t('ilEst2') }} {{ t('quelleHorloge') }}</div>
          <div class="choix-horloges">
            <button v-for="(o, i) in q.options" :key="i" class="choix-horloge"
              :class="classeChoix(i)" :disabled="repondu" :aria-label="t('choixHorloge', { n: i + 1 })" @click="validerChoix(i)">
              <span v-html="horlogeSvg(o.h, o.m, null, false)"></span>
            </button>
          </div>
        </template>

        <!-- (d) Durées -->
        <template v-else-if="q.type === 'duree'">
          <div class="consigne" v-if="q.sous === 'apres'">
            {{ t('ilEst1') }}<strong>{{ q.ecritDebut }}</strong>{{ t('ilEst2') }}<br>
            {{ t('dans1') }}<strong>{{ q.ecritDuree }}</strong>{{ t('dans2') }}
          </div>
          <div class="consigne" v-else>
            {{ q.act.nom }} {{ t('commenceA') }} <strong>{{ q.ecritDebut }}</strong> {{ t('termineA') }} <strong>{{ q.ecritFin }}</strong>.<br>
            {{ t('combienDure', { pronom: q.act.pronom }) }}
          </div>
          <div class="horloges-duree">
            <figure>
              <div class="horloge petite" v-html="horlogeSvg(q.h, q.m)"></div>
              <figcaption>{{ q.sous === 'apres' ? t('maintenant') : t('debut') }}</figcaption>
            </figure>
            <figure v-if="q.sous === 'combien' || (repondu && !dernierOk)">
              <div class="horloge petite" v-html="horlogeSvg(q.h2, q.m2)"></div>
              <figcaption>{{ q.sous === 'apres' ? t('plusTard') : t('fin') }}</figcaption>
            </figure>
          </div>
        </template>

        <!-- (e) Conversions h / min / s (CE2) -->
        <template v-else-if="q.type === 'conversion'">
          <div class="consigne">{{ t('complete') }}&nbsp;: <strong>{{ q.texte.replace(/ = .*/, ' =') }}</strong></div>
          <div class="aide-config" style="text-align:center;margin-bottom:.75rem;">{{ t('rappel') }} : 1 h = 60 min</div>
          <div class="saisie-heure">
            <template v-for="(u, i) in q.unites" :key="u">
              <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
                min="0" placeholder="?" v-model="champs[i]" :disabled="repondu" @keydown.enter="valider">
              <span class="unite">{{ u }}</span>
            </template>
          </div>
        </template>

        <!-- (f) Emploi du temps (CE2) -->
        <template v-else-if="q.type === 'emploi'">
          <div class="consigne">{{ t('lisEmploi') }}</div>
          <table class="correction-table emploi">
            <thead><tr><th>{{ t('debut') }}</th><th>{{ t('fin') }}</th><th>{{ t('activite') }}</th></tr></thead>
            <tbody>
              <tr v-for="l in q.emploi" :key="l.debut" :class="{ recre: l.recre }">
                <td>{{ hm(l.debut) }}</td><td>{{ hm(l.fin) }}</td><td>{{ l.nom }}</td>
              </tr>
            </tbody>
          </table>
          <div class="consigne">{{ q.question }}</div>
          <div v-if="q.options" class="choix-grille">
            <button v-for="(o, i) in q.options" :key="i" class="choix-btn"
              :class="classeChoix(i)" :disabled="repondu" @click="validerChoix(i)">{{ o.label }}</button>
          </div>
        </template>

        <!-- saisie « ? h ? min » (lire au clavier, matin / après-midi, durées, emploi du temps) -->
        <div v-if="saisieHM" class="saisie-heure">
          <input ref="inputEl" class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
            min="0" :max="sur24 ? 23 : null" placeholder="?" v-model="repH" :disabled="repondu" @keydown.enter="valider">
          <span class="unite">h</span>
          <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
            min="0" :max="sur24 ? 59 : null" placeholder="00" v-model="repM" :disabled="repondu" @keydown.enter="valider">
          <span class="unite">min</span>
        </div>

        <div class="feedback" :class="feedbackClass">
          {{ feedback }}
          <div v-if="feedbackOral" class="oral">
            « {{ feedbackOral }} »
            <button v-if="voixFr" class="btn-ecouter" :title="t('ecouter')" @click="lire(feedbackOral)">🔊</button>
          </div>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button class="btn btn-ghost" @click="jeu.passer({ donne: t('passe') })">{{ t('passer') }}</button>
            <button v-if="!estChoix" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          </template>
          <button v-else-if="!dernierOk" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <table class="correction-table">
        <thead><tr><th>{{ t('colQuestion') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('bonneReponse') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>
              <span v-if="horlogeDe(h.question)" class="mini-horloge" v-html="horlogeSvg(h.question.h, h.question.m, null, false)"></span>
              {{ h.question.texte }}
            </td>
            <td>{{ h.donne }}</td>
            <td class="mot-attendu">{{ h.question.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Lire l'heure : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/heure/ (definition.js, generateur.js, fiche.js).
import { ref, computed, nextTick, watch } from 'vue'
import { sauvegarder, chargerReglages } from '../../utils'
import { creerRng, graineAleatoire } from '../../utils/hasard'
import { useTTS } from '../../composables/useTTS'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { useGraine } from '../../composables/useGraine'
import { useJeu } from '../../composables/useJeu'
import { reglagesDuNiveau, estBonus } from '../../exercices/outils'
import DEFINITION from '../../exercices/heure/definition'
import { INTERFACE, TEXTES } from '../../exercices/heure/textes'
import { questions as genererQuestions, questionsFiche, verifier, choisis, ecrit, deux, hm } from '../../exercices/heure/generateur'
import { fiche as ficheHeure } from '../../exercices/heure/fiche'
import { svgHorloge } from '../../exercices/heure/horloge'

const { t, langue } = useI18n(INTERFACE)
// Maths : le contenu (énoncés, fiche) suit la langue de l'interface
const langueContenu = computed(() => (DEFINITION.contenu === 'fr' ? 'fr' : langue.value))
const T = contenu(TEXTES, () => langueContenu.value).t
// la lecture à voix haute n'a qu'une voix française
const voixFr = computed(() => langueContenu.value === 'fr')
const { lire } = useTTS()

// ── Réglages : défauts et options du niveau dans la définition ──
const DEFAUT = reglagesDuNiveau(DEFINITION)
const config = ref(reglagesDuNiveau(DEFINITION, chargerReglages('heure_config', DEFAUT)))
if (![4, 8, 12].includes(config.value.nbHorloges)) config.value.nbHorloges = 8
watch(config, v => sauvegarder('heure_config', v), { deep: true })
const options = computed(() => DEFINITION.niveaux[config.value.niveau].options)

// Changement de niveau : on garde les exercices qui existent dans le nouveau niveau (sinon ses défauts), et on
// reprend ses précisions par défaut.
watch(() => config.value.niveau, () => {
  const niv = DEFINITION.niveaux[config.value.niveau]
  const ex = config.value.exercices.filter(e => niv.options.exercices.includes(e))
  config.value.exercices = ex.length ? ex : [...niv.reglages.exercices]
  config.value.precisions = [...niv.reglages.precisions]
})

function basculer(champ, val) {
  const liste = config.value[champ]
  if (liste.includes(val)) {
    if (liste.length === 1) return
    config.value[champ] = liste.filter(x => x !== val)
  } else {
    config.value[champ] = [...liste, val]
  }
}

// ── Jeu ──
const repH = ref('')
const repM = ref('')
const champs = ref(['', ''])
const choixDonne = ref(null)
const inputEl = ref(null)
const cadranEl = ref(null)
const aiguilles = ref({ h: 0, m: 0 })

// message après une erreur, selon le type de question
function messageErreur(q) {
  if (q.type === 'duree' && q.sous === 'combien') return T('dureeCombienFaux', { act: q.act, attendu: q.attendu })
  if (q.type === 'conversion') return `❌ ${q.attendu}`
  if (q.type === 'emploi') return `❌ ${T('bonneReponse')} : ${q.attendu}`
  if (q.type === 'duree') return T('dureeApresFaux', { attendu: q.attendu })
  if (q.type === 'journee') return `❌ ${T('bonneReponse')} : ${ecrit(q.h24, q.m)}`
  if (q.type === 'placer') return T('placerFaux', { ecrit: q.ecrit })
  return T('lireFaux', { ecrit: ecrit(q.h, q.m) })
}

const jeu = useJeu({
  // le jeu a sa propre graine (tirée à chaque partie) : la graine de la page sert aux fiches
  generer: () => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng: creerRng(graineAleatoire()), T, nb: config.value.nbQ }),
  verifier,
  messageErreur,
  surQuestion: q => {
    repH.value = ''; repM.value = ''; champs.value = ['', '']; choixDonne.value = null
    if (q?.type === 'placer') aiguilles.value = { ...q.depart }
    nextTick(() => (inputEl.value || document.querySelector('.exercise-box input:not([disabled])'))?.focus?.())
  },
})
const { phase, questions, index: idx, q, bonnes, mauvaises, historique, retour, repondu, cleFin } = jeu

const dernierOk = computed(() => !!retour.value?.ok)
const feedback = computed(() => retour.value?.message ?? '')
const feedbackClass = computed(() => (retour.value ? (retour.value.ok ? 'ok' : 'erreur') : ''))
const inputClass = feedbackClass
const feedbackOral = computed(() => {
  if (!repondu.value) return ''
  if (q.value.type === 'journee') return T('oralJournee', { h: q.value.h24, m: q.value.m, oral: q.value.oral })
  return q.value.oral ?? ''
})
const estChoix = computed(() => q.value && (q.value.options !== undefined))
// saisie « ? h ? min » : lire au clavier, matin / après-midi (lire24), durées, emploi du temps sans propositions
const saisieHM = computed(() => q.value && ((q.value.type === 'lire' && q.value.mode !== 'choix')
  || (q.value.type === 'journee' && q.value.sous === 'lire24') || q.value.type === 'duree' || (q.value.type === 'emploi' && !q.value.options)))
const sur24 = computed(() => q.value && (q.value.type === 'lire' || q.value.type === 'journee'))
const pasMinutes = computed(() => (choisis(config.value.niveau, config.value, 'precisions').includes('minute') ? 1 : 5))
const horlogeDe = question => ['lire', 'journee', 'duree'].includes(question.type)

function horlogeSvg(h, m, fantome = null, aideMinutes = config.value.aideMinutes) {
  return svgHorloge(h, m, { aideMinutes, fantome, libelle: T('horloge') })
}

function classeChoix(i) {
  if (!repondu.value) return ''
  if (i === q.value.bonne) return 'ok'
  if (i === choixDonne.value) return 'erreur'
  return 'grise'
}

function validerChoix(i) {
  if (repondu.value) return
  choixDonne.value = i
  const o = q.value.options[i]
  jeu.repondre({ choix: i }, { donne: o.label ?? ecrit(o.h, o.m) })
}

function valider() {
  if (repondu.value) return
  const question = q.value
  if (question.type === 'placer') {
    const { h, m } = aiguilles.value
    jeu.repondre({ aiguilles: aiguilles.value }, { donne: ecrit(h === 0 ? 12 : h, m) })
    return
  }
  if (question.type === 'conversion') {
    if (champs.value.slice(0, question.unites.length).every(v => v === '')) return
    const donne = question.unites.map((u, i) => `${champs.value[i] || 0} ${u}`).join(' ')
    jeu.repondre({ h: champs.value[0], m: champs.value[1] }, { donne })
    return
  }
  if (repH.value === '' && repM.value === '') return
  const enDuree = (question.type === 'duree' && question.sous === 'combien') || (question.type === 'emploi' && question.sous === 'duree')
  const donne = enDuree
    ? `${repH.value || 0} h ${repM.value || 0} min`
    : `${repH.value || 0} h ${deux(+repM.value || 0)}`
  jeu.repondre({ h: repH.value, m: repM.value }, { donne })
}

// ── Aiguilles : boutons ──
function ajouterHeures(n) {
  aiguilles.value = { ...aiguilles.value, h: (aiguilles.value.h + n + 12) % 12 }
}
function ajouterMinutes(n) {
  let { h, m } = aiguilles.value
  m += n
  if (m >= 60) { m -= 60; h = (h + 1) % 12 }
  if (m < 0) { m += 60; h = (h + 11) % 12 }
  aiguilles.value = { h, m }
}

// ── Aiguilles : glisser ──
let aiguilleTenue = null
function angleDepuis(e) {
  const r = cadranEl.value.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  const a = Math.atan2(dx, -dy) * 180 / Math.PI
  return { angle: (a + 360) % 360, dist: Math.hypot(dx, dy) / (r.width / 2) }
}
const ecart = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }

function debutGlisser(e) {
  if (repondu.value) return
  const { angle, dist } = angleDepuis(e)
  const { h, m } = aiguilles.value
  const eH = ecart(angle, h * 30 + m / 2), eM = ecart(angle, m * 6)
  if (Math.abs(eH - eM) < 20) aiguilleTenue = dist < 0.5 ? 'h' : 'm'
  else aiguilleTenue = eH < eM ? 'h' : 'm'
  cadranEl.value.setPointerCapture?.(e.pointerId)
  glisser(e)
}
function glisser(e) {
  if (!aiguilleTenue || repondu.value) return
  const { angle } = angleDepuis(e)
  let { h, m } = aiguilles.value
  if (aiguilleTenue === 'm') {
    const pas = pasMinutes.value
    const nm = (Math.round(angle / (6 * pas)) * pas) % 60
    if (m >= 45 && nm <= 15 && nm < m) h = (h + 1) % 12
    else if (m <= 15 && nm >= 45 && nm > m) h = (h + 11) % 12
    m = nm
  } else {
    h = ((Math.round((angle - m / 2) / 30) % 12) + 12) % 12
  }
  if (h !== aiguilles.value.h || m !== aiguilles.value.m) aiguilles.value = { h, m }
}
function finGlisser() { aiguilleTenue = null }

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode } = useModeExercice()
const { graine, nouvelle, rngFiche } = useGraine()
// recalculée quand les réglages changent ou qu'on demande une nouvelle fiche (nouvelle graine)
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  const reglages = config.value
  const tirage = questionsFiche({ niveau: reglages.niveau, reglages, rng: rngFiche(), T })
  return ficheHeure({ questions: tirage, reglages, T, langue: langueContenu.value })
})
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #888; margin-top: .4rem; }
.emploi { max-width: 420px; margin: 0 auto 1rem; font-size: 1.05rem; }
.emploi tr.recre td { color: #888; font-style: italic; }

.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.5;
}
.consigne small { font-size: .8rem; color: #888; font-weight: 600; }

.horloge {
  width: min(280px, 80vw);
  aspect-ratio: 1;
  margin: 0 auto;
}
.horloge.petite { width: min(170px, 38vw); }
.horloge.deplacable { touch-action: none; cursor: grab; user-select: none; }
.horloge :deep(svg) { display: block; }

.legende-aiguilles { text-align: center; font-size: .85rem; color: #888; margin: .4rem 0 1rem; }
.leg-h { color: #c0392b; font-weight: 700; }
.leg-m { color: #1a5fb4; font-weight: 700; }

.choix-grille {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
  margin-top: .5rem;
}
.choix-btn {
  min-height: 56px;
  padding: .6rem .75rem;
  font-size: 1.15rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn.ok, .choix-horloge.ok         { border-color: var(--vert); background: #f0faf0; }
.choix-btn.erreur, .choix-horloge.erreur { border-color: var(--rouge); background: #fef0f0; }
.choix-btn.grise, .choix-horloge.grise   { opacity: .5; }

.choix-horloges {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
  max-width: 420px;
  margin: 0 auto;
}
.choix-horloge {
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  padding: .4rem;
  cursor: pointer;
  aspect-ratio: 1;
}
.choix-horloge span { display: block; width: 100%; height: 100%; }
.choix-horloge:hover:not(:disabled) { border-color: var(--bleu); }

.saisie-heure {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  margin-top: .5rem;
}
.saisie-heure .champ { width: 5.5rem; display: inline-block; }
.unite { font-size: 1.5rem; font-weight: 800; }

.reglages {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.reglage { display: flex; flex-direction: column; align-items: center; gap: .4rem; font-size: .9rem; }
.btn-rond { min-width: 56px; min-height: 48px; justify-content: center; font-size: 1.5rem; padding: .3rem 1rem; }

.horloges-duree { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: .5rem; }
.horloges-duree figure { margin: 0; text-align: center; }
.horloges-duree figcaption { font-weight: 700; color: #888; font-size: .9rem; }

.oral { font-size: 1.05rem; color: var(--texte); font-weight: 700; margin-top: .25rem; }
.btn-ecouter {
  border: none; background: none; cursor: pointer; font-size: 1.2rem;
  vertical-align: middle; padding: .1rem .3rem;
}

.mini-horloge { display: inline-block; width: 40px; height: 40px; vertical-align: middle; margin-right: .4rem; }
.mini-horloge :deep(svg) { display: block; }

@media (max-width: 520px) {
  .choix-btn { font-size: 1rem; }
  .consigne { font-size: 1.1rem; }
}
</style>

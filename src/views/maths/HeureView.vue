<template>
  <div class="container">
    <h1 class="section-heading">🕐 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="ex => t(`ex_${ex}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="precisions" v-model="config.precisions"
        :titre="t('precision')" :libelle="p => t(`prec_${p}`)">
        <div v-if="config.niveau === 'cp'" class="aide-config">{{ t('aideCp') }}</div>
        <div v-if="config.niveau === 'ce1'" class="aide-config">{{ t('aideCe1') }}</div>
      </ChoixReglage>

      <ChoixReglage v-if="mode === 'jouer' && config.exercices.includes('lire')" :definition="DEFINITION" cle="saisie"
        v-model="config.saisie" :titre="t('reponseLire')" :libelle="s => t(s === 'choix' ? 'propositions4' : 'jEcris')" />

      <div class="config-section">
        <div class="config-section-title">{{ t('aide') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.aideMinutes }" @click="config.aideMinutes = !config.aideMinutes">
            {{ config.aideMinutes ? '✓ ' : '' }}{{ t('afficherMinutes') }}
          </button>
        </div>
      </div>

      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
      <ChoixReglage v-else :definition="DEFINITION" cle="nbHorloges" v-model="config.nbHorloges" :titre="t('nbHorloges')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">

      <!-- (a) Lire l'heure -->
      <template v-if="q.type === 'lire'">
        <div class="consigne">{{ t('quelleHeure') }}</div>
        <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
        <div class="legende-aiguilles"><span class="leg-h">{{ t('legH') }}</span> · <span class="leg-m">{{ t('legM') }}</span></div>

        <ChoixReponses v-if="q.mode === 'choix'" :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="validerChoix" />
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
        <ChoixReponses images :options="q.options" :bonne="q.bonne" :repondu="repondu" :libelle="i => t('choixHorloge', { n: i + 1 })"
          @choisir="validerChoix">
          <template #default="{ option }"><span v-html="horlogeSvg(option.h, option.m, null, false)"></span></template>
        </ChoixReponses>
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
            <SaisieReponse v-model="champs[i]" type="nombre" class="exercise-input champ" :etat="etat" min="0" placeholder="?"
              :disabled="repondu" :focus="i === 0" @entree="valider" />
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
        <ChoixReponses v-if="q.options" :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="validerChoix" />
      </template>

      <!-- saisie « ? h ? min » (lire au clavier, matin / après-midi, durées, emploi du temps) -->
      <div v-if="saisieHM" class="saisie-heure">
        <SaisieReponse v-model="repH" type="nombre" class="exercise-input champ" :etat="etat" min="0" :max="sur24 ? 23 : null"
          placeholder="?" :disabled="repondu" focus @entree="valider" />
        <span class="unite">h</span>
        <!-- heures entières seulement (CP) : pas de case pour les minutes -->
        <template v-if="!q.sansMinutes">
          <SaisieReponse v-model="repM" type="nombre" class="exercise-input champ" :etat="etat" min="0" :max="sur24 ? 59 : null"
            placeholder="00" :disabled="repondu" @entree="valider" />
          <span class="unite">min</span>
        </template>
      </div>

      <div class="feedback" :class="etat">
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
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree: h }">
          <span v-if="horlogeDe(h.question)" class="mini-horloge" v-html="horlogeSvg(h.question.h, h.question.m, null, false)"></span>
          {{ h.question.texte }}
        </template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Lire l'heure : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/heure/ (definition.js, generateur.js, fiche.js).
import { ref, computed } from 'vue'
import { useTTS } from '../../composables/useTTS'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/heure/definition'
import { INTERFACE, TEXTES } from '../../exercices/heure/textes'
import { questions as genererQuestions, questionsFiche, verifier, choisis, ecrit, deux, hm } from '../../exercices/heure/generateur'
import { fiche as ficheHeure } from '../../exercices/heure/fiche'
import { svgHorloge } from '../../exercices/heure/horloge'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'heure_config')
const T = contenu(TEXTES, () => langueContenu.value).t
// la lecture à voix haute n'a qu'une voix française
const voixFr = computed(() => langueContenu.value === 'fr')
const { lire } = useTTS()

// ── Jeu ──
const repH = ref('')
const repM = ref('')
const champs = ref(['', ''])
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
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: q => {
    repH.value = ''; repM.value = ''; champs.value = ['', '']
    if (q?.type === 'placer') aiguilles.value = { ...q.depart }
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const dernierOk = computed(() => !!retour.value?.ok)
const feedback = computed(() => retour.value?.message ?? '')
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

function validerChoix(i) {
  if (repondu.value) return
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
    : question.sansMinutes ? `${repH.value || 0} h` : `${repH.value || 0} h ${deux(+repM.value || 0)}`
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
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheHeure({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
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
  .consigne { font-size: 1.1rem; }
}
</style>

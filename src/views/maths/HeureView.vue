<template>
  <div class="container">
    <h1 class="section-heading">🕐 {{ t('heure.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
          :titre="t('communs.exercices')" :libelle="ex => t(`heure.exercices.${ex}`)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="precisions" v-model="config.precisions"
          :titre="t('heure.precision')" :libelle="p => t(`heure.precisions.${p}`)">
          <div v-if="config.niveau === 'cp'" class="aide-config">{{ t('heure.aideCp') }}</div>
          <div v-if="config.niveau === 'ce1'" class="aide-config">{{ t('heure.aideCe1') }}</div>
        </ChoixReglage>

        <ChoixReglage v-if="modeCourant === 'jouer' && avecLire" :definition="DEFINITION" cle="saisie"
          v-model="config.saisie" :titre="t('heure.reponseLire')" :libelle="s => t(s === 'choix' ? 'heure.propositions4' : 'heure.jEcris')" />

        <!-- les minutes autour du cadran : pas au CP, qui ne lit que les heures entières -->
        <div v-if="minutesPossibles" class="config-section">
          <div class="config-section-title">{{ t('heure.aide') }}</div>
          <div class="btn-group">
            <button type="button" class="level-btn" :class="{ active: config.aideMinutes }" :aria-pressed="config.aideMinutes"
              @click="config.aideMinutes = !config.aideMinutes">
              {{ config.aideMinutes ? '✓ ' : '' }}{{ t('heure.afficherMinutes') }}
            </button>
          </div>
        </div>

        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
        <ChoixReglage v-else :definition="DEFINITION" cle="nbHorloges" v-model="config.nbHorloges" :titre="t('heure.nbHorloges')" />
      </template>
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">

      <!-- (a) Lire l'heure -->
      <template v-if="q.type === 'lire'">
        <div class="consigne">{{ T('quelleHeure') }}</div>
        <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
        <div class="legende-aiguilles"><span class="leg-h">{{ t('heure.legH') }}</span> · <span class="leg-m">{{ t('heure.legM') }}</span></div>

        <ChoixReponses v-if="q.mode === 'choix'" :options="q.options ?? []" :bonne="q.bonne" :repondu="repondu" :titre="T('quelleHeure')"
          @choisir="validerChoix" />
      </template>

      <!-- (b) Placer les aiguilles -->
      <template v-else-if="q.type === 'placer'">
        <div class="consigne">
          <ConsigneParlee :texte="q.oral" :auto="false">
            {{ t('heure.placeAiguilles') }}
            <strong v-if="q.consigneOrale">« {{ q.oral }} »</strong>
            <strong v-else>{{ q.ecrit }}</strong>
          </ConsigneParlee>
        </div>
        <div ref="cadranEl" class="horloge deplacable"
          @pointerdown="debutGlisser" @pointermove="glisser" @pointerup="finGlisser" @pointercancel="finGlisser"
          v-html="horlogeSvg(aiguilles.h, aiguilles.m, repondu && !dernierOk ? { h: q.h, m: q.m } : null)"></div>
        <div class="legende-aiguilles">{{ t('heure.glisser') }}</div>
        <div class="reglages">
          <div class="reglage">
            <span class="leg-h">{{ t('heure.petiteAiguille') }}</span>
            <div class="btn-group">
              <button type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.reculerHeure')" @click="ajouterHeures(-1)">−</button>
              <button type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.avancerHeure')" @click="ajouterHeures(1)">+</button>
            </div>
          </div>
          <!-- heures entières seulement : la grande aiguille reste sur le 12 -->
          <div v-if="!q.sansMinutes" class="reglage">
            <span class="leg-m">{{ t('heure.grandeAiguille') }}</span>
            <div class="btn-group">
              <button type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.reculerMinutes', { n: 5 })" @click="ajouterMinutes(-5)">−5</button>
              <button v-if="pasMinutes === 1" type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.reculerMinutes', { n: 1 })" @click="ajouterMinutes(-1)">−1</button>
              <button v-if="pasMinutes === 1" type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.avancerMinutes', { n: 1 })" @click="ajouterMinutes(1)">+1</button>
              <button type="button" class="btn btn-ghost btn-rond" :disabled="repondu" :aria-label="t('heure.avancerMinutes', { n: 5 })" @click="ajouterMinutes(5)">+5</button>
            </div>
          </div>
        </div>
      </template>

      <!-- (c) Matin / après-midi -->
      <template v-else-if="q.type === 'journee' && q.sous === 'lire24'">
        <div class="consigne">{{ q.phrase }}<br>{{ T('quelleHeure') }} <small>{{ t('heure.ecrisNumerique') }}</small></div>
        <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
      </template>

      <template v-else-if="q.type === 'journee'">
        <div class="consigne"><template v-for="(m, i) in enGras(T('journeeChoisirQ', { ecrit: MARQUE }), [q.ecrit24])" :key="i"><strong v-if="m.gras">{{ m.texte }}</strong><template v-else>{{ m.texte }}</template></template></div>
        <ChoixReponses images :options="q.options ?? []" :bonne="q.bonne" :repondu="repondu" :titre="q.texte"
          :libelle="i => t('heure.choixHorloge', { n: i + 1 })" @choisir="validerChoix">
          <template #default="{ option }"><span v-html="horlogeSvg(option.h, option.m, null, false)"></span></template>
        </ChoixReponses>
      </template>

      <!-- (d) Durées -->
      <template v-else-if="q.type === 'duree'">
        <!-- l'énoncé, avec les heures et la durée en gras -->
        <div class="consigne">
          <template v-for="(m, i) in enonceDuree(q)" :key="i"><strong v-if="m.gras">{{ m.texte }}</strong><template v-else>{{ m.texte }}</template></template>
        </div>
        <div class="horloges-duree">
          <figure>
            <div class="horloge petite" v-html="horlogeSvg(q.h, q.m)"></div>
            <figcaption>{{ q.act ? T('debut') : t('heure.maintenant') }}</figcaption>
          </figure>
          <figure v-if="q.act || (repondu && !dernierOk)">
            <div class="horloge petite" v-html="horlogeSvg(q.h2, q.m2)"></div>
            <figcaption>{{ q.act ? T('fin') : t('heure.plusTard') }}</figcaption>
          </figure>
        </div>
      </template>

      <!-- (e) Conversions h / min (CE2) -->
      <template v-else-if="q.type === 'conversion'">
        <div class="consigne">{{ t('heure.complete') }}&nbsp;: <strong>{{ q.texte.replace(/ = .*/, ' =') }}</strong></div>
        <div class="aide-config rappel">{{ T('rappel') }} : 1 h = 60 min</div>
        <div class="saisie-heure">
          <template v-for="(u, i) in q.unites" :key="u">
            <SaisieReponse v-model="champs[i]" type="nombre" class="exercise-input champ" :etat="etat" min="0" placeholder="?"
              :disabled="repondu" :focus="i === 0" :libelle="u" @entree="valider" />
            <span class="unite">{{ u }}</span>
          </template>
        </div>
      </template>

      <!-- (f) Emploi du temps (CE2) -->
      <template v-else-if="q.type === 'emploi'">
        <div class="consigne">{{ t('heure.lisEmploi') }}</div>
        <table class="correction-table emploi">
          <thead><tr><th scope="col">{{ T('debut') }}</th><th scope="col">{{ T('fin') }}</th><th scope="col">{{ T('activite') }}</th></tr></thead>
          <tbody>
            <tr v-for="l in q.emploi" :key="l.debut" :class="{ recre: l.recre }">
              <td>{{ hm(l.debut) }}</td><td>{{ hm(l.fin) }}</td><td>{{ l.nom }}</td>
            </tr>
          </tbody>
        </table>
        <div class="consigne">{{ q.question }}</div>
        <ChoixReponses v-if="q.options" :options="q.options" :bonne="q.bonne" :repondu="repondu" :titre="q.question" @choisir="validerChoix" />
      </template>

      <!-- saisie « ? h ? min » (lire au clavier, matin / après-midi, durées, emploi du temps) -->
      <div v-if="saisieHM" class="saisie-heure">
        <SaisieReponse v-model="repH" type="nombre" class="exercise-input champ" :etat="etat" min="0" :max="sur24 ? 23 : undefined"
          placeholder="?" :disabled="repondu" :libelle="t('heure.heures')" aria-describedby="heure-retour" focus @entree="valider" />
        <span class="unite">h</span>
        <!-- heures entières seulement (CP) : pas de case pour les minutes -->
        <template v-if="!sansMinutes">
          <SaisieReponse v-model="repM" type="nombre" class="exercise-input champ" :etat="etat" min="0" :max="sur24 ? 59 : undefined"
            placeholder="00" :disabled="repondu" :libelle="t('heure.minutes')" aria-describedby="heure-retour" @entree="valider" />
          <span class="unite">min</span>
        </template>
      </div>

      <RetourReponse id="heure-retour" :message="retour?.message" :etat="etat" />
      <div v-if="feedbackOral" class="oral">
        <ConsigneParlee :texte="feedbackOral" :auto="false">« {{ feedbackOral }} »</ConsigneParlee>
      </div>

      <div class="btn-group actions-question">
        <template v-if="!repondu">
          <button type="button" class="btn btn-ghost" @click="jeu.passer({ donne: t('heure.passe') })">{{ t('heure.passer') }}</button>
          <button v-if="!estChoix" type="button" class="btn btn-primary" @click="valider">{{ t('communs.valider') }}</button>
        </template>
        <button v-else-if="!dernierOk" type="button" class="btn btn-primary" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique">
        <template #question="{ entree: h }">
          <span v-if="avecHorloge(h.question)" class="mini-horloge" v-html="horlogeSvg(h.question.h, h.question.m, null, false)"></span>
          {{ h.question.texte }}
        </template>
      </TableauCorrection>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Lire l'heure : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur, dessin de l'horloge et fiche :
// src/exercices/heure/ (definition.ts, generateur.ts, horloge.ts, fiche.ts).
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import TableauCorrection from '../../noyau/TableauCorrection.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/heure/definition.ts'
import { CONTENU } from '../../exercices/heure/textes.ts'
import {
  questions as tirer, questionsFiche, verifier, messageErreur as messageFaux, oralJournee, ecrit, ecritCases, hm, aideMinutesPossible, pasDesMinutes,
} from '../../exercices/heure/generateur.ts'
import type { Question, QLire, QJournee, QDuree, Reponse } from '../../exercices/heure/generateur.ts'
import { fiche as mettreEnPage } from '../../exercices/heure/fiche.ts'
import { svgHorloge } from '../../exercices/heure/horloge.ts'
import type { Heure } from '../../exercices/heure/horloge.ts'

const { t } = useLangue()
// Réglages mémorisés (heure_config), ajustés au changement de niveau ; maths : le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION)
const T = traducteur(CONTENU, () => langueContenu.value)

const avecLire = computed(() => (config.value.exercices as readonly string[]).includes('lire'))
const minutesPossibles = computed(() => aideMinutesPossible(config.value.niveau))
const pasMinutes = computed(() => pasDesMinutes(config.value.niveau, config.value))

// ── Jeu ──
const repH = ref<number | string>('')
const repM = ref<number | string>('')
const champs = ref<(number | string)[]>(['', ''])
const cadranEl = ref<HTMLElement | null>(null)
const aiguilles = ref<Heure>({ h: 0, m: 0 })

const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur: q => messageFaux(q, T),
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: q => {
    repH.value = ''; repM.value = ''; champs.value = ['', '']
    if (q.type === 'placer') aiguilles.value = { ...q.depart }
  },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const dernierOk = computed(() => !!retour.value?.ok)
// l'heure dite en lettres, sous le retour (lire, placer, matin / après-midi)
const feedbackOral = computed(() => {
  const question = q.value
  if (!repondu.value || !question) return ''
  if (question.type === 'journee') return oralJournee(T, question.h24, question.m, question.oral)
  return 'oral' in question ? question.oral : ''
})
const estChoix = computed(() => !!q.value && 'options' in q.value && q.value.options !== undefined)
// saisie « ? h ? min » : lire au clavier, matin / après-midi (lire24), durées, emploi du temps sans propositions
const saisieHM = computed(() => {
  const question = q.value
  if (!question) return false
  return (question.type === 'lire' && question.mode !== 'choix') || (question.type === 'journee' && question.sous === 'lire24')
    || question.type === 'duree' || (question.type === 'emploi' && !question.options)
})
const sur24 = computed(() => q.value?.type === 'lire' || q.value?.type === 'journee')
// heures entières seulement (CP) : pas de case pour les minutes
const sansMinutes = computed(() => !!q.value && 'sansMinutes' in q.value && q.value.sansMinutes)
// ── Énoncés avec les heures en gras : le texte est écrit avec une marque à la place des heures, découpée ici ──
const MARQUE = '\u0001'
/** Un énoncé découpé : `valeurs` (dans l'ordre où le texte les place) sont les morceaux en gras. */
function enGras(texte: string, valeurs: string[]): { texte: string, gras: boolean }[] {
  return texte.split(MARQUE).flatMap((morceau, i) => [{ texte: morceau, gras: false }, ...(i < valeurs.length ? [{ texte: valeurs[i], gras: true }] : [])]).filter(m => m.texte)
}
function enonceDuree(question: QDuree) {
  return question.act
    ? enGras(T(`dureeCombienQ.${question.act.genre}`, { nom: question.act.nom, debut: MARQUE, fin: MARQUE }), [question.ecritDebut, question.ecritFin])
    : enGras(T('dureeApresQ', { debut: MARQUE, duree: MARQUE }), [question.ecritDebut, question.ecritDuree])
}
const avecHorloge = (question: Question): question is QLire | QJournee | QDuree =>
  question.type === 'lire' || question.type === 'journee' || question.type === 'duree'

function horlogeSvg(h: number, m: number, fantome: Heure | null = null, aideMinutes = config.value.aideMinutes && minutesPossibles.value): string {
  return svgHorloge(h, m, { aideMinutes, fantome, libelle: T('horloge') })
}

function validerChoix(i: number) {
  const question = q.value
  if (repondu.value || !question || !('options' in question) || !question.options) return
  const o = question.options[i]
  jeu.repondre({ choix: i }, { donne: o.label ?? ('h' in o ? ecrit(o.h, o.m) : '') })
}

function valider() {
  const question = q.value
  if (repondu.value || !question) return
  if (question.type === 'placer') {
    const { h, m } = aiguilles.value
    jeu.repondre({ aiguilles: { h, m } }, { donne: ecrit(h === 0 ? 12 : h, m) })
    return
  }
  if (question.type === 'conversion') {
    if (champs.value.slice(0, question.unites.length).every(v => v === '')) return
    const donne = question.unites.map((u, i) => `${champs.value[i] || 0} ${u}`).join(' ')
    jeu.repondre({ h: champs.value[0], m: champs.value[1] }, { donne })
    return
  }
  if (repH.value === '' && repM.value === '') return
  const enDuree = (question.type === 'duree' && !!question.act) || (question.type === 'emploi' && question.sous === 'duree')
  const donne = enDuree
    ? `${repH.value || 0} h ${repM.value || 0} min`
    : ecritCases(repH.value, repM.value, sansMinutes.value)
  jeu.repondre({ h: repH.value, m: repM.value }, { donne })
}

// ── Aiguilles : boutons ──
function ajouterHeures(n: number) {
  aiguilles.value = { ...aiguilles.value, h: (aiguilles.value.h + n + 12) % 12 }
}
function ajouterMinutes(n: number) {
  let { h, m } = aiguilles.value
  m += n
  if (m >= 60) { m -= 60; h = (h + 1) % 12 }
  if (m < 0) { m += 60; h = (h + 11) % 12 }
  aiguilles.value = { h, m }
}

// ── Aiguilles : glisser ──
let aiguilleTenue: 'h' | 'm' | null = null
function angleDepuis(e: PointerEvent) {
  const r = cadranEl.value!.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  const a = Math.atan2(dx, -dy) * 180 / Math.PI
  return { angle: (a + 360) % 360, dist: Math.hypot(dx, dy) / (r.width / 2) }
}
const ecart = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }

function debutGlisser(e: PointerEvent) {
  const question = q.value
  if (repondu.value || !cadranEl.value || question?.type !== 'placer') return
  const { angle, dist } = angleDepuis(e)
  const { h, m } = aiguilles.value
  const eH = ecart(angle, h * 30 + m / 2), eM = ecart(angle, m * 6)
  // heures entières seulement (CP) : on ne saisit que la petite aiguille
  if (question.sansMinutes) aiguilleTenue = 'h'
  else if (Math.abs(eH - eM) < 20) aiguilleTenue = dist < 0.5 ? 'h' : 'm'
  else aiguilleTenue = eH < eM ? 'h' : 'm'
  cadranEl.value.setPointerCapture?.(e.pointerId)
  glisser(e)
}
function glisser(e: PointerEvent) {
  if (!aiguilleTenue || repondu.value || !cadranEl.value) return
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

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => mettreEnPage({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #6b6b6b; margin-top: .4rem; }
.aide-config.rappel { text-align: center; margin-bottom: .75rem; }
.emploi { max-width: 420px; margin: 0 auto 1rem; font-size: 1.05rem; }
.emploi tr.recre td { color: #6b6b6b; font-style: italic; }

.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.5;
}
.consigne small { font-size: .8rem; color: #6b6b6b; font-weight: 600; }

.horloge {
  width: min(280px, 80vw);
  aspect-ratio: 1;
  margin: 0 auto;
}
.horloge.petite { width: min(170px, 38vw); }
.horloge.deplacable { touch-action: none; cursor: grab; user-select: none; }
.horloge :deep(svg) { display: block; }

.legende-aiguilles { text-align: center; font-size: .85rem; color: #6b6b6b; margin: .4rem 0 1rem; }
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
.horloges-duree figcaption { font-weight: 700; color: #6b6b6b; font-size: .9rem; }

.oral { font-size: 1.05rem; color: var(--texte); font-weight: 700; margin-top: .25rem; }
.actions-question { justify-content: center; margin-top: 1rem; }

.mini-horloge { display: inline-block; width: 40px; height: 40px; vertical-align: middle; margin-right: .4rem; }
.mini-horloge :deep(svg) { display: block; }

@media (max-width: 520px) {
  .consigne { font-size: 1.1rem; }
}
</style>

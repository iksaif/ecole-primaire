<template>
  <div class="container">
    <h1>✍️ {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      :desactive="!nbPaires" @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="verbes" v-model="config.verbes" :titre="t('verbeAConjuguer')">
        <template #valeur="{ valeur }">{{ verbeDe(valeur).inf }} <span class="verbe-groupe">{{ t(cleGroupe(valeur)) }}</span></template>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="temps" v-model="config.temps" :titre="t('temps')"
        :libelle="nomTemps" />

      <div class="config-section" data-reglage="mode">
        <div class="config-section-title">{{ t('mode') }}</div>
        <div class="mode-cards">
          <button v-for="m in valeursDe(DEFINITION, config.niveau, 'mode')" :key="m" class="mode-card" :data-valeur="m"
            :class="{ active: config.mode === m }" @click="config.mode = m">
            <div class="mode-icon">{{ m === 'lacunes' ? '✏️' : '📝' }}</div>
            <div class="mode-title">{{ t(m) }}</div>
            <div class="mode-desc">{{ t(m + 'Desc') }}</div>
          </button>
        </div>
      </div>
    </ConfigExercice>

    <!-- Exercice : un tableau, une question par ligne, dans l'ordre -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="conj-header">
        <span class="conj-verb">{{ verbeDe(q.verbe).inf }}</span>
        <span class="conj-temps">{{ nomTemps(q.temps) }}</span>
      </div>

      <div class="conj-table">
        <div v-for="(l, i) in questions" :key="l.cle" class="conj-row" :class="etat(i) && `row-${etat(i)}`">
          <span class="pronom">{{ l.pronom }}</span>
          <!-- lacunes : le radical (ou l'auxiliaire) est donné, l'élève écrit la fin -->
          <span v-if="l.lacunes && l.debut" class="radical">{{ l.debut }}</span>
          <input :ref="el => { champs[i] = el }" v-model="saisies[i]" class="conj-input"
            :class="[{ 'conj-input-full': !l.lacunes }, etat(i)]" :disabled="i !== index || repondu"
            :placeholder="i < index ? '' : l.lacunes ? '…' : l.pronom + ' …'"
            autocomplete="off" autocapitalize="off" spellcheck="false" @keydown.enter="validerLigne" />
          <span class="row-feedback">{{ retourLigne(i) }}</span>
        </div>
      </div>

      <div class="btn-group actions">
        <button v-if="!repondu" class="btn btn-primary" @click="validerTout">{{ t('valider') }}</button>
        <button v-else-if="!retour.ok" class="btn btn-primary" @click="jeu.suivante">{{ t('voirResultats') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div class="conj-correction">
        <div class="config-section-title">{{ t('correction') }}</div>
        <div v-for="(h, i) in historique" :key="i" class="correction-row">
          <span class="pronom">{{ h.question.pronom }}</span>
          <span class="correction-forme" :class="h.ok ? 'corr-ok' : 'corr-err'">{{ h.question.forme }}</span>
        </div>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup>
// Conjugaison : la vue ne fait que les réglages et le rendu d'un tableau. Niveaux, générateur et fiche :
// src/exercices/conjugaison/ (definition.js, generateur.js, fiche.js) ; formes : src/data/conjugaison.js.
// Exercice de français : la fiche est toujours en français, l'interface suit la langue choisie.
import { ref, computed, nextTick, watch } from 'vue'
import { sauvegarder, chargerReglages } from '../../utils'
import { creerRng, graineAleatoire } from '../../utils/hasard'
import { estVide } from '../../utils/reponses'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { useGraine } from '../../composables/useGraine'
import { usePoliceFiche } from '../../composables/usePolices'
import { useJeu } from '../../composables/useJeu'
import { reglagesDuNiveau, valeursDe } from '../../exercices/outils'
import DEFINITION from '../../exercices/conjugaison/definition'
import { INTERFACE, TEXTES } from '../../exercices/conjugaison/textes'
import { questions as genererQuestions, questionsFiche, verifier, jugement, paires, cleGroupe, cleTemps }
  from '../../exercices/conjugaison/generateur'
import { fiche as ficheConjugaison } from '../../exercices/conjugaison/fiche'
import { verbeDe } from '../../data/conjugaison.js'

const { t } = useI18n(INTERFACE)
// contenu (fiche) : toujours en français
const langueContenu = DEFINITION.contenu === 'fr' ? 'fr' : null
const T = contenu(TEXTES, () => langueContenu).t
const nomTemps = temps => t(cleTemps(temps))

// ── Réglages : défauts et options du niveau dans la définition ──
const config = ref(reglagesDuNiveau(DEFINITION, chargerReglages('conjugaison_config', reglagesDuNiveau(DEFINITION))))
watch(config, v => sauvegarder('conjugaison_config', v), { deep: true })
// changer de niveau coche tout ce qui est au programme de ce niveau (le mode reste)
watch(() => config.value.niveau, niveau => {
  const r = reglagesDuNiveau(DEFINITION, { niveau, mode: config.value.mode })
  config.value.verbes = r.verbes
  config.value.temps = r.temps
})
const nbPaires = computed(() => paires(config.value.niveau, config.value).length)

// ── Jeu : les six lignes d'un tableau sont les questions de la partie ──
const saisies = ref([])
const champs = []
const jeu = useJeu({
  // le jeu a sa propre graine (tirée à chaque partie) : la graine de la page sert aux fiches
  generer: () => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng: creerRng(graineAleatoire()) }),
  verifier,
  delai: 700,
  surQuestion: () => nextTick(() => champs[index.value]?.focus()),
})
const { phase, questions, q, index, bonnes, historique, retour, repondu, cleFin } = jeu
watch(questions, qs => { saisies.value = qs.map(() => ''); champs.length = 0 })

// état d'une ligne déjà validée : ok, presque (accents), erreur
function etat(i) {
  const h = historique.value[i]
  return !h ? '' : !h.ok ? 'erreur' : h.verdict === 'accents' ? 'presque' : 'ok'
}
function retourLigne(i) {
  const h = historique.value[i]
  if (!h) return ''
  return !h.ok ? `❌ ${h.question.forme}` : h.verdict === 'accents' ? `✅ ${t('presque')}` : '✅'
}

// Ligne courante : une bonne réponse passe aussitôt à la suivante ; la dernière laisse le temps de lire (useJeu)
function repondreLigne(vide = false) {
  const qu = q.value, i = index.value
  const rep = { texte: saisies.value[i] ?? '' }
  if (!vide && estVide(rep.texte)) return false
  const verdict = jugement(qu, rep)
  jeu.repondre(rep, { donne: rep.texte, verdict })
  // accents oubliés ou erreur : la bonne graphie reste dans le champ
  if (verdict !== 'juste') saisies.value[i] = qu.attendu
  if (i < questions.value.length - 1) jeu.suivante()
  return true
}
function validerLigne() { if (!repondu.value) repondreLigne() }
// Valider : toutes les lignes qui restent, vides comprises (comptées fausses)
function validerTout() {
  while (!repondu.value && q.value) repondreLigne(true)
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode } = useModeExercice()
const { graine, nouvelle, rngFiche } = useGraine()
// police choisie dans « Sur la fiche » (Andika par défaut)
const policeFiche = usePoliceFiche()
// tirage recalculé quand les réglages changent ou qu'on demande une nouvelle fiche ; la mise en page à part
const tirage = computed(() => {
  if (mode.value !== 'imprimer') return null
  graine.value
  return questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng: rngFiche() })
})
const fiche = computed(() => (tirage.value
  ? ficheConjugaison({ questions: tirage.value, T, langue: 'fr', ...policeFiche.value })
  : ''))
</script>

<style scoped>
.container { max-width: 640px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }
.verbe-groupe { font-size: .7rem; color: #888; font-weight: 400; }
.level-btn.active .verbe-groupe { color: rgba(255, 255, 255, .85); }

/* Mode */
.mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; }
.mode-card {
  border: 3px solid var(--gris-brd); border-radius: var(--radius);
  padding: 1rem; cursor: pointer; transition: all .15s; text-align: center;
  background: white; font-family: inherit; width: 100%;
}
.mode-card:hover  { border-color: var(--bleu); }
.mode-card:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.mode-card.active { border-color: var(--bleu); background: #eef5ff; }
.mode-icon  { font-size: 1.75rem; }
.mode-title { font-weight: 800; font-size: .95rem; margin: .3rem 0 .15rem; }
.mode-desc  { font-size: .78rem; color: #666; }

/* Exercice */
.conj-header { display: flex; align-items: baseline; gap: .75rem; justify-content: center; margin-bottom: 1.25rem; }
.conj-verb  { font-size: 1.5rem; font-weight: 800; color: var(--bleu); }
.conj-temps { font-size: 1rem; color: #888; font-weight: 600; }
.conj-table { display: flex; flex-direction: column; gap: .5rem; }
.conj-row { display: flex; align-items: center; gap: .5rem; padding: .4rem .6rem; border-radius: 8px; transition: background .2s; }
.conj-row.row-ok      { background: #f0fdf4; }
.conj-row.row-presque { background: #fff8ec; }
.conj-row.row-erreur  { background: #fff5f5; }
.pronom { min-width: 7rem; font-weight: 600; color: #555; font-size: .95rem; }
.radical { font-size: 1rem; font-weight: 600; color: #333; }
.conj-input {
  border: 2px solid #ccc; border-radius: 6px;
  padding: .35rem .6rem; font-size: 1rem; font-family: inherit;
  width: 8rem; transition: border-color .15s;
}
.conj-input-full { width: 12rem; }
.conj-input:focus { outline: none; border-color: var(--bleu); }
.conj-input.ok      { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.conj-input.presque { border-color: var(--orange); background: #fff8ec; color: #9a5b00; }
.conj-input.erreur  { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.conj-input:disabled { opacity: 1; }
.row-feedback { font-size: .85rem; font-weight: 600; min-width: 7rem; }
.actions { justify-content: center; margin-top: 1.25rem; }

/* Résultats */
.conj-correction { margin: 1rem auto; max-width: 320px; text-align: left; }
.correction-row { display: flex; align-items: center; gap: 1rem; padding: .3rem 0; border-bottom: 1px solid #f0f0f0; }
.correction-forme { font-weight: 700; font-size: 1rem; }
.corr-ok  { color: #15803d; }
.corr-err { color: var(--rouge); }
</style>

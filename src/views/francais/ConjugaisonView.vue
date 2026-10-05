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

      <ChoixReglage cartes :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('mode')"
        :libelle="m => t(m)" :icone="m => (m === 'lacunes' ? '✏️' : '📝')" :description="m => t(m + 'Desc')" />
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
          <SaisieReponse v-model="saisies[i]" class="conj-input" :class="{ 'conj-input-full': !l.lacunes }" :etat="etat(i)"
            :disabled="i !== index || repondu" :focus="i === index" :placeholder="i < index ? '' : l.lacunes ? '…' : l.pronom + ' …'"
            @entree="validerLigne" />
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
import { ref, computed, watch } from 'vue'
import { estVide } from '../../utils/reponses'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu, etatDe } from '../../composables/useJeu'
import DEFINITION from '../../exercices/conjugaison/definition'
import { INTERFACE, TEXTES } from '../../exercices/conjugaison/textes'
import { questions as genererQuestions, questionsFiche, verifier, paires, cleGroupe, cleTemps }
  from '../../exercices/conjugaison/generateur'
import { fiche as ficheConjugaison } from '../../exercices/conjugaison/fiche'
import { verbeDe } from '../../data/conjugaison.js'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés ; changer de niveau coche tout ce qui est au programme de ce niveau (ses défauts), le mode reste
// s'il est au programme (politique commune : src/composables/useReglages.js). Contenu (fiche) : toujours en français.
const { config, langueContenu } = useReglages(DEFINITION, 'conjugaison_config')
const T = contenu(TEXTES, () => langueContenu.value).t
const nomTemps = temps => t(cleTemps(temps))
const nbPaires = computed(() => paires(config.value.niveau, config.value).length)

// ── Jeu : les six lignes d'un tableau sont les questions de la partie, sur un seul écran (mode série) ──
const saisies = ref([])
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng }),
  verifier,
  delai: 700,
  // une réponse passe aussitôt à la ligne suivante ; la dernière : résultats après 700 ms, ou bouton après une erreur
  serie: true,
})
const { phase, questions, q, index, bonnes, historique, retour, repondu, cleFin } = jeu
watch(questions, qs => { saisies.value = qs.map(() => '') })

// état d'une ligne déjà validée : ok, presque (accents oubliés : comptée fausse, en orange), erreur
const etat = i => etatDe(historique.value[i])
function retourLigne(i) {
  const h = historique.value[i]
  if (!h) return ''
  return h.ok ? '✅' : h.nuance === 'accents' ? `⚠️ ${t('accents', { forme: h.question.forme })}` : `❌ ${h.question.forme}`
}

// Ligne courante (useJeu passe ensuite à la suivante) ; vide : seulement avec « Valider » (comptée fausse)
function repondreLigne(vide = false) {
  const qu = q.value, i = index.value
  const rep = { texte: saisies.value[i] ?? '' }
  if (!vide && estVide(rep.texte)) return false
  const ok = jeu.repondre(rep, { donne: rep.texte })
  // erreur ou accents oubliés : la bonne graphie reste dans le champ
  if (!ok) saisies.value[i] = qu.attendu
  return true
}
function validerLigne() { if (!repondu.value) repondreLigne() }
// Valider : toutes les lignes qui restent, vides comprises (comptées fausses)
function validerTout() {
  while (!repondu.value && q.value) repondreLigne(true)
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (questions, police) => ficheConjugaison({ questions, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.container { max-width: 640px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }
.verbe-groupe { font-size: .7rem; color: #888; font-weight: 400; }
.level-btn.active .verbe-groupe { color: rgba(255, 255, 255, .85); }

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

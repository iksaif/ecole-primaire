<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('orthographe.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="theme" v-model="config.theme" :titre="t('orthographe.theme')"
        :libelle="th => t(`orthographe.themes.${th}`)">
        <template #valeur="{ valeur: th, texte }"><span class="theme-icon">{{ ICONES[th] }}</span> {{ texte }}</template>
      </ChoixReglage>
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nb" v-model="config.nb" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <div class="phrase-display" v-html="q.html"></div>

      <ChoixReponses v-if="q.mode === 'choix'" :titre="q.phrase" :options="q.options ?? []" :bonne="q.bonne ?? 0" :repondu="repondu"
        @choisir="i => jeu.repondre({ choix: i }, { donne: q?.options?.[i]?.label ?? '' })" />
      <div v-else class="saisie-row">
        <SaisieReponse v-model="saisie" class="saisie-input" :etat="etat" :disabled="repondu" focus :placeholder="q.indice || t('orthographe.ecrisReponse')"
          @entree="repondu ? jeu.suivante() : validerSaisie()" />
        <button v-if="!repondu" type="button" class="btn btn-primary" @click="validerSaisie">{{ t('orthographe.validerCourt') }}</button>
      </div>

      <RetourReponse :message="retour?.message" :etat="etat" />
      <p v-if="repondu && q.explication" class="explication">{{ explication(q) }}</p>
      <div v-if="repondu" class="actions">
        <button type="button" class="btn btn-primary" @click="jeu.suivante">{{ t('communs.suivant') }}</button>
      </div>
    </QuestionJeu>

    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <div v-if="erreurs.length" class="erreurs-box">
        <div class="config-section-title">{{ t('orthographe.aRetravailler') }}</div>
        <div v-for="(h, i) in erreurs" :key="i" class="erreur-orth">
          <span class="erreur-phrase" v-html="phraseCorrigee(h.question)"></span>
          <span class="erreur-reponse">→ <strong>{{ h.question.attendu }}</strong></span>
        </div>
      </div>
    </ResultatsJeu>
  </div>
</template>

<script setup lang="ts">
// Orthographe : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/orthographe/
// (definition.ts, generateur.ts, fiche.ts) ; corpus : src/data/orthographe.js. Exercice de français : la fiche est toujours en français,
// l'interface (retour, explications) suit la langue choisie.
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import { echapper } from '../../utils/html.js'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import SaisieReponse from '../../noyau/SaisieReponse.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsJeu from '../../noyau/ResultatsJeu.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION, { THEMES } from '../../exercices/orthographe/definition.ts'
import { CONTENU } from '../../exercices/orthographe/textes.ts'
import { questions as tirer, questionsFiche, verifier } from '../../exercices/orthographe/generateur.ts'
import type { Question, Reponse } from '../../exercices/orthographe/generateur.ts'
import { fiche as ficheOrthographe } from '../../exercices/orthographe/fiche.ts'

const { t } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// T : les textes de la fiche (CONTENU, textes.ts), toujours en français
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES: Readonly<Record<string, string>> = Object.fromEntries(THEMES.map(th => [th.id, th.icone]))

// ── Jeu : on attend « Suivant » après chaque réponse (l'explication se lit) ──
const saisie = ref<string | number>('')
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => t('orthographe.erreur', { r: q.attendu }),
  messageNuance: q => t('orthographe.accents', { r: q.attendu }),
  surQuestion: () => { saisie.value = '' },
  delai: null,
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu
function validerSaisie(): void {
  const texte = String(saisie.value).trim()
  if (!repondu.value && texte) jeu.repondre({ texte }, { donne: texte })
}
// l'explication de la réponse : une clé des textes d'interface (le corpus la nomme)
const explication = (qu: Question): string => (qu.explication ? t(`orthographe.explications.${qu.explication}` as 'orthographe.explications.exp_ou_choix') : '')
const erreurs = computed(() => historique.value.filter(h => !h.ok))
const phraseCorrigee = (qu: Question): string => echapper(qu.phrase).replace('___', `<strong>${echapper(qu.attendu)}</strong>`)

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng }),
  mettreEnPage: (tirage, police) => ficheOrthographe({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.theme-icon { font-size: 1.1rem; }
.phrase-display { font-size: 1.4rem; font-weight: 600; text-align: center; margin-bottom: 1.5rem; line-height: 1.6; color: #222; }
.phrase-display :deep(.trou) { color: #bbb; font-weight: 400; }
.saisie-row { display: flex; gap: .5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
.saisie-input { border: 2px solid #ccc; border-radius: 8px; padding: .5rem .9rem; font-size: 1.15rem; font-family: inherit; width: 16rem; max-width: 100%; }
.saisie-input:focus { outline: none; border-color: var(--bleu); }
.saisie-input.ok { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.saisie-input.presque { border-color: var(--orange); background: #fff8ec; color: #9a5b00; }
.saisie-input.erreur { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.explication { font-weight: 600; font-size: .92rem; color: #555; text-align: center; margin: .3rem 0 0; }
.actions { display: flex; justify-content: center; margin-top: 1rem; }
.erreurs-box { text-align: left; max-width: 500px; margin: 0 auto; }
.erreur-orth { display: flex; align-items: baseline; gap: .75rem; flex-wrap: wrap; padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem; }
.erreur-phrase { flex: 1; color: #444; }
.erreur-reponse { color: #15803d; white-space: nowrap; }
</style>

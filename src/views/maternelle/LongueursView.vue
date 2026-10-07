<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('longueurs.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="n => t(`longueurs.niveaux.${n as 'ps' | 'ms' | 'gs'}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode" :titre="t('communs.exercices')"
        :libelle="m => (m === 'comparer' ? '↔️ ' : '📶 ') + t(`longueurs.modes.${m}`)" />
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="consigne" />
      <!-- comparer : on touche le crayon ; ranger : on touche les crayons du plus court au plus long -->
      <div class="crayons">
        <button v-for="(c, i) in q.crayons" :key="i" type="button" class="crayon-btn" :class="etatCrayon(i)" :disabled="repondu"
          :aria-label="t('longueurs.rang', { n: i + 1 })" @click="toucher(i)">
          <span class="crayon" v-html="svgCrayon(c)"></span>
          <span v-if="ordre.includes(i)" class="rang">{{ ordre.indexOf(i) + 1 }}</span>
        </button>
      </div>
      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Plus long, plus court : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/longueurs/ (definition.ts, generateur.ts, fiche.ts, crayon.ts). Ici on touche les crayons eux-mêmes (rang affiché
// dessus, validation immédiate) : pas de zone de réponse ni de bouton « Valider ».
import { ref, computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsEtoiles from '../../noyau/ResultatsEtoiles.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/longueurs/definition.ts'
import { CONTENU } from '../../exercices/longueurs/textes.ts'
import { questions as tirer, questionsFiche, verifier, bonPrefixe, rangsAttendus, attendu } from '../../exercices/longueurs/generateur.ts'
import type { Question, Reponse } from '../../exercices/longueurs/generateur.ts'
import { fiche as ficheLongueurs } from '../../exercices/longueurs/fiche.ts'
import { svgCrayon } from '../../exercices/longueurs/crayon.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const ordre = ref<number[]>([])   // ranger : crayons touchés, dans l'ordre des clics
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: () => t('longueurs.regarde'),
  apresErreur: 1500,
  delai: 1500,
  surQuestion: () => { ordre.value = [] },
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const consigne = computed(() => (!q.value ? '' : q.value.mode === 'ranger' ? t('longueurs.consigneRanger') : t(q.value.cherche === 'long' ? 'longueurs.consigneLong' : 'longueurs.consigneCourt')))

function etatCrayon(i: number): string {
  if (!q.value) return ''
  if (q.value.mode === 'ranger') {
    const k = ordre.value.indexOf(i)
    return k < 0 ? '' : ordre.value[k] === rangsAttendus(q.value)[k] ? 'bonne' : 'mauvaise'
  }
  if (!repondu.value) return ''
  return i === attendu(q.value) ? 'bonne' : i === ordre.value[0] ? 'mauvaise' : ''
}

function toucher(i: number): void {
  if (!q.value || repondu.value || ordre.value.includes(i)) return
  ordre.value.push(i)
  if (q.value.mode === 'ranger') {
    // faux dès le premier mauvais crayon ; juste quand tous sont rangés
    if (!bonPrefixe(q.value, ordre.value) || ordre.value.length === q.value.crayons.length) jeu.repondre({ ordre: [...ordre.value] })
  } else jeu.repondre({ choix: i })
}

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheLongueurs({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; }
.crayons { display: flex; flex-direction: column; gap: .8rem; margin-bottom: 1rem; }
.crayon-btn { position: relative; display: block; width: 100%; padding: .9rem 1rem; border-radius: 14px; border: 4px solid var(--gris-brd); background: white; cursor: pointer; min-height: 5rem; }
.crayon-btn:hover:not(:disabled) { border-color: var(--bleu); }
.crayon-btn.bonne { border-color: var(--vert); background: #f0faf0; }
.crayon-btn.mauvaise { border-color: var(--rouge); background: #fef0f0; }
.crayon { display: block; width: 100%; }
.crayon :deep(svg) { display: block; width: 100%; height: auto; max-height: 4rem; }
.rang { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); font-size: 1.6rem; font-weight: 900; color: var(--bleu-fort); }
</style>

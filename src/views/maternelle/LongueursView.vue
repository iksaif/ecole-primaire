<template>
  <div class="container">
    <h1 class="section-heading">📏 {{ t('titre') }}</h1>

    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" :libelle="n => t('niv_' + n)" />
      <ChoixReglage :definition="DEFINITION" cle="mode" v-model="config.mode" :titre="t('exercice')"
        :libelle="m => (m === 'comparer' ? '↔️ ' + t('comparer') : '📶 ' + t('ranger'))" />
    </ConfigExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="consigne" />
      <!-- comparer : on touche le crayon ; ranger : on touche les crayons du plus court au plus long -->
      <div class="crayons">
        <button v-for="(c, i) in q.crayons" :key="i" type="button" class="crayon-btn" :class="etatCrayon(i)" :disabled="repondu" @click="toucher(i)">
          <svg :viewBox="`0 0 ${LARGEUR} 34`" class="crayon">
            <rect x="2" y="7" :width="c.longueur - 24" height="20" rx="4" :fill="c.couleur" />
            <polygon :points="`${c.longueur - 22},7 ${c.longueur},17 ${c.longueur - 22},27`" fill="#f3d2a2" />
            <polygon :points="`${c.longueur - 7},14 ${c.longueur},17 ${c.longueur - 7},20`" :fill="c.couleur" />
          </svg>
          <span v-if="ordre.includes(i)" class="rang">{{ ordre.indexOf(i) + 1 }}</span>
        </button>
      </div>
      <div class="feedback" :class="etat">{{ retour?.message }}</div>
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Plus long, plus court : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/longueurs/ (definition.js, generateur.js, fiche.js). Ici on touche les crayons eux-mêmes (rang affiché
// dessus, validation immédiate) : pas de <OrdonnerClics>, qui demande une zone de réponse et un bouton « Valider ».
import { ref, computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import ResultatsEtoiles from '../../components/ResultatsEtoiles.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/longueurs/definition'
import { INTERFACE, TEXTES } from '../../exercices/longueurs/textes'
import { questions as genererQuestions, questionsFiche, verifier, bonPrefixe, rangsAttendus, attendu, LARGEUR } from '../../exercices/longueurs/generateur'
import { fiche as ficheLongueurs } from '../../exercices/longueurs/fiche'

const { t } = useI18n(INTERFACE)
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, 'longueurs_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const ordre = ref([])   // ranger : crayons touchés, dans l'ordre des clics
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: () => t('regarde'),
  apresErreur: 'continuer',
  delai: 1500,
  surQuestion: () => { ordre.value = [] },
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const consigne = computed(() => (q.value.mode === 'ranger' ? t('consigneRanger') : t(q.value.cherche === 'long' ? 'consigneLong' : 'consigneCourt')))

function etatCrayon(i) {
  if (q.value.mode === 'ranger') {
    const k = ordre.value.indexOf(i)
    return k < 0 ? '' : ordre.value[k] === rangsAttendus(q.value)[k] ? 'bonne' : 'mauvaise'
  }
  if (!repondu.value) return ''
  return i === attendu(q.value) ? 'bonne' : i === ordre.value[0] ? 'mauvaise' : ''
}

function toucher(i) {
  if (repondu.value || ordre.value.includes(i)) return
  ordre.value.push(i)
  if (q.value.mode === 'ranger') {
    // faux dès le premier mauvais crayon ; juste quand tous sont rangés
    if (!bonPrefixe(q.value, ordre.value) || ordre.value.length === q.value.crayons.length) jeu.repondre({ ordre: [...ordre.value] })
  } else jeu.repondre({ choix: i })
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheLongueurs({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem; }
.crayons { display: flex; flex-direction: column; gap: .8rem; margin-bottom: 1rem; }
.crayon-btn { position: relative; display: block; width: 100%; padding: .9rem 1rem; border-radius: 14px; border: 4px solid var(--gris-brd); background: white; cursor: pointer; min-height: 5rem; }
.crayon-btn:hover:not(:disabled) { border-color: var(--bleu); }
.crayon-btn.bonne { border-color: var(--vert); background: #f0faf0; }
.crayon-btn.mauvaise { border-color: var(--rouge); background: #fef0f0; }
.crayon { display: block; width: 100%; height: auto; max-height: 4rem; }
.rang { position: absolute; right: .8rem; top: 50%; transform: translateY(-50%); font-size: 1.6rem; font-weight: 900; color: var(--bleu); }
</style>

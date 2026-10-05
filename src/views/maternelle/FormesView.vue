<template>
  <div class="container">
    <h1 class="section-heading">🔷 {{ t('titre') }}</h1>

    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <!-- PS : trier (même forme) ; MS : reconnaître (montre le…) ; GS : nommer, compter les côtés -->
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" :libelle="n => t('niv_' + n)" />
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
        cartes :titre="t('exercice')" :libelle="m => t(m)" :icone="m => ICONES[m]" :description="m => t(DESCRIPTIONS[m])" />
      <p v-if="mode === 'imprimer'" class="note-fiche">{{ t(config.niveau === 'ps' ? 'noteFichePS' : 'noteFiche') }}</p>
    </ConfigExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="question-label" :texte="consigne" />

      <!-- Même forme (PS) : un modèle, trois formes de tailles, couleurs et orientations différentes -->
      <div v-if="config.mode === 'meme'" class="forme-display modele" v-html="q.svg"></div>
      <!-- Reconnaître / compter : on montre la forme -->
      <div v-else-if="config.mode !== 'trouver'" class="forme-display" v-html="q.svg"></div>

      <ChoixReponses v-if="config.mode === 'reconnaitre'" grand :options="choix.options" :bonne="choix.bonne" :repondu="repondu" @choisir="repondre">
        <template #default="{ option }">
          <span class="choix-forme"><span v-html="option.svg"></span><span class="choix-nom">{{ T(option.id) }}</span></span>
        </template>
      </ChoixReponses>
      <ChoixReponses v-else-if="config.mode === 'compter'" grand :options="choix.options" :bonne="choix.bonne" :repondu="repondu" @choisir="repondre" />
      <ChoixReponses v-else images :options="choix.options" :bonne="choix.bonne" :repondu="repondu" :libelle="i => t('choixForme', { n: i + 1 })" @choisir="repondre">
        <template #default="{ option }"><span class="svg-choix" v-html="option.svg"></span></template>
      </ChoixReponses>

      <div class="feedback" :class="etat">{{ retour?.message }}</div>
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup>
// Les formes : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/formes/ (definition.js, generateur.js, fiche.js).
import { computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ChoixReponses from '../../components/ChoixReponses.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import ResultatsEtoiles from '../../components/ResultatsEtoiles.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/formes/definition'
import { INTERFACE, TEXTES } from '../../exercices/formes/textes'
import { questions as genererQuestions, questionsFiche, verifier } from '../../exercices/formes/generateur'
import { fiche as ficheFormes } from '../../exercices/formes/fiche'

const { t } = useI18n(INTERFACE)
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, 'formes_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t
const ICONES = { meme: '🧩', reconnaitre: '👁️', compter: '🔢', trouver: '🔍' }
const DESCRIPTIONS = { meme: 'memeDesc', reconnaitre: 'reconnaitreDesc', compter: 'combienCotes', trouver: 'trouverDesc' }

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const nomDe = id => T(id.normalize('NFD').replace(/[̀-ͯ]/g, ''))
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => {
    const nom = nomDe(q.nom)
    if (rep?.mode === 'compter') return t('erreurCotes', { nom, n: q.cotes })
    if (rep?.mode === 'meme') return t('erreurMeme')
    return t(rep?.mode === 'trouver' ? 'erreurForme' : 'erreurNom', { nom })
  },
  apresErreur: 'continuer',
  delai: 1400,
  delaiErreur: 2200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const choix = computed(() => q.value.modes[config.value.mode])
const repondre = i => jeu.repondre({ mode: config.value.mode, choix: i })
const consigne = computed(() => ({
  meme: t('consigneMeme'), reconnaitre: t('commentSappelle'), compter: t('combienCotes'), trouver: `${t('montre')} ${nomDe(q.value.nom)}`,
})[config.value.mode])

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheFormes({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.question-label { font-size: 1.1rem; font-weight: 600; color: #444; margin-bottom: 1rem; }
.forme-display { display: flex; justify-content: center; margin-bottom: 1.25rem; }
.forme-display :deep(svg) { filter: drop-shadow(0 4px 8px rgba(0,0,0,.15)); }
.forme-display.modele { border: 3px dashed var(--gris-brd); border-radius: 16px; display: inline-flex; padding: .5rem; margin-bottom: 1rem; }
.choix-forme { display: flex; flex-direction: column; align-items: center; gap: .2rem; }
.choix-nom { font-size: .85rem; font-weight: 700; color: #444; }
.svg-choix { display: flex; align-items: center; justify-content: center; }
.svg-choix :deep(svg) { max-width: 100%; height: auto; }
.note-fiche { color: #666; font-size: .95rem; margin: 0; }
</style>

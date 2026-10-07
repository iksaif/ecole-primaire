<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('formes.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <template #default="{ mode: modeCourant }">
        <!-- PS : trier (même forme) ; MS : reconnaître (montre le…) ; GS : nommer, compter les côtés -->
        <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" />
        <ChoixReglage v-if="modeCourant === 'jouer'" :definition="DEFINITION" :niveau="config.niveau" cle="mode" v-model="config.mode"
          cartes :titre="t('formes.exercice')" :libelle="m => t(`formes.mode.${m}`)" :icone="m => ICONES[m]" :description="m => t(`formes.modeDesc.${m}`)" />
        <p v-if="modeCourant === 'imprimer'" class="note-fiche">{{ t(config.niveau === 'ps' ? 'formes.noteFichePS' : 'formes.noteFiche') }}</p>
      </template>
    </CadreExercice>

    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="question-label" :texte="consigne" />

      <!-- Même forme (PS) : un modèle, trois formes de tailles, couleurs et orientations différentes -->
      <div v-if="config.mode === 'meme'" class="forme-display modele" v-html="q.svg"></div>
      <!-- Reconnaître / compter : on montre la forme -->
      <div v-else-if="config.mode !== 'trouver'" class="forme-display" v-html="q.svg"></div>

      <ChoixReponses v-if="config.mode === 'reconnaitre'" grand :titre="consigne" :options="q.modes.reconnaitre.options" :bonne="q.modes.reconnaitre.bonne"
        :repondu="repondu" @choisir="i => repondre(i)">
        <template #default="{ option }">
          <span class="choix-forme"><span v-html="option.svg"></span><span class="choix-nom">{{ nomForme(T, option.id) }}</span></span>
        </template>
      </ChoixReponses>
      <ChoixReponses v-else-if="config.mode === 'compter'" grand :titre="consigne" :options="q.modes.compter.options" :bonne="q.modes.compter.bonne"
        :repondu="repondu" @choisir="i => repondre(i)" />
      <ChoixReponses v-else-if="config.mode === 'trouver'" images :titre="consigne" :options="q.modes.trouver.options" :bonne="q.modes.trouver.bonne"
        :repondu="repondu" :libelle="libelleForme" @choisir="i => repondre(i)">
        <template #default="{ option }"><span class="svg-choix" v-html="option.svg"></span></template>
      </ChoixReponses>
      <ChoixReponses v-else images :titre="consigne" :options="q.modes.meme.options" :bonne="q.modes.meme.bonne"
        :repondu="repondu" :libelle="libelleForme" @choisir="i => repondre(i)">
        <template #default="{ option }"><span class="svg-choix" v-html="option.svg"></span></template>
      </ChoixReponses>

      <RetourReponse :message="retour?.message" :etat="etat" />
    </QuestionJeu>

    <!-- Résultats : la maternelle garde les étoiles -->
    <ResultatsEtoiles v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter" />
  </div>
</template>

<script setup lang="ts">
// Les formes : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche : src/exercices/formes/
// (definition.ts, generateur.ts, fiche.ts) ; le dessin des formes : src/dessins/figures.ts.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import QuestionJeu from '../../noyau/QuestionJeu.vue'
import ChoixReponses from '../../noyau/ChoixReponses.vue'
import ConsigneParlee from '../../noyau/ConsigneParlee.vue'
import RetourReponse from '../../noyau/RetourReponse.vue'
import ResultatsEtoiles from '../../noyau/ResultatsEtoiles.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useJeu } from '../../noyau/useJeu.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import DEFINITION from '../../exercices/formes/definition.ts'
import { CONTENU } from '../../exercices/formes/textes.ts'
import { questions as tirer, questionsFiche, verifier, nomForme } from '../../exercices/formes/generateur.ts'
import type { ModeForme, Question, Reponse } from '../../exercices/formes/generateur.ts'
import { fiche as ficheFormes } from '../../exercices/formes/fiche.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
// T : les textes du contenu (CONTENU, textes.ts : nom des formes, couleurs, fiche), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)
const libelleNiveau = (n: string): string => t(`formes.niveau.${n as 'ps' | 'ms' | 'gs'}`)
const ICONES: Readonly<Record<ModeForme, string>> = { meme: '🧩', reconnaitre: '👁️', compter: '🔢', trouver: '🔍' }

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: (q, rep) => {
    const nom = nomForme(T, q.id)
    if (rep?.mode === 'compter') return q.cotes === 0 ? t('formes.erreurAucunCote', { nom }) : t('formes.erreurCotes', { nom, n: q.cotes })
    if (rep?.mode === 'meme') return t('formes.erreurMeme')
    return t(rep?.mode === 'trouver' ? 'formes.erreurForme' : 'formes.erreurNom', { nom })
  },
  apresErreur: 2200,
  delai: 1400,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const repondre = (i: number): void => { jeu.repondre({ mode: config.value.mode, choix: i }) }
// nom accessible des formes à choisir (sans trahir la réponse)
const libelleForme = (i: number): string => t('formes.choixForme', { n: i + 1 })
const consigne = computed(() => {
  const nom = q.value ? nomForme(T, q.value.id) : ''
  return {
    meme: t('formes.consigneMeme'), reconnaitre: t('formes.commentSappelle'), compter: t('formes.combienCotes'), trouver: t('formes.montre', { nom }),
  }[config.value.mode]
})

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheFormes({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
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

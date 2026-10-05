<template>
  <div class="container">
    <h1 class="section-heading">⚖️ {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')"
        :libelle="n => `${ICONES[n]} ${n === 'ps' ? t('beaucoupPlus', { niv: 'PS' }) : t('jusqua', { niv: n.toUpperCase(), n: NOMBRE_MAX[n] })}`" />
      <ChoixReglage :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(ps ? 'consignePS' : 'consigne')" />

      <div class="groupes">
        <div v-for="(cote, k) in COTES" :key="cote" class="groupe-et-vs">
          <div v-if="k === 1" class="vs">?</div>
          <div class="groupe" :class="{ touchable: ps && !repondu, gagnant: repondu && q.reponse === cote,
            perdant: repondu && q.reponse !== cote && q.reponse !== 'egal' }" @click="ps && repondre(cote)">
            <div class="groupe-label">{{ k === 0 ? 'A' : 'B' }}</div>
            <div class="groupe-objets">
              <span v-for="i in q[cote]" :key="i" class="objet">{{ q.emoji }}</span>
            </div>
            <!-- le nombre seulement après la réponse : on compare sans compter d'abord -->
            <div class="groupe-nb" :class="{ cache: !repondu }">{{ q[cote] }}</div>
          </div>
        </div>
      </div>

      <!-- Boutons réponse (PS : on touche le groupe) -->
      <div v-if="!ps" class="reponses">
        <button class="rep-btn rep-a" :class="{ bonne: repondu && q.reponse === 'gauche' }" :disabled="repondu" @click="repondre('gauche')">
          👈 {{ t('aPlus', { g: 'A' }) }}
        </button>
        <button class="rep-btn rep-egal" :class="{ bonne: repondu && q.reponse === 'egal' }" :disabled="repondu" @click="repondre('egal')">
          = {{ t('pareil') }}
        </button>
        <button class="rep-btn rep-b" :class="{ bonne: repondu && q.reponse === 'droite' }" :disabled="repondu" @click="repondre('droite')">
          {{ t('aPlus', { g: 'B' }) }} 👉
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
// Comparer les quantités : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/comparer/ (definition.js, generateur.js, fiche.js).
import { computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ConsigneParlee from '../../components/ConsigneParlee.vue'
import ResultatsEtoiles from '../../components/ResultatsEtoiles.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/comparer/definition'
import { INTERFACE, TEXTES } from '../../exercices/comparer/textes'
import { questions as genererQuestions, questionsFiche, verifier, NOMBRE_MAX } from '../../exercices/comparer/generateur'
import { fiche as ficheComparer } from '../../exercices/comparer/fiche'

const { t } = useI18n(INTERFACE)
// niveau : celui de la barre du haut s'il est de maternelle ; PS : on touche le groupe qui a le plus
const { config, langueContenu } = useReglages(DEFINITION, 'comparer_config', { suivreClasse: true })
const T = contenu(TEXTES, () => langueContenu.value).t
const ICONES = { ps: '🐣', ms: '🌱', gs: '🌳' }
const COTES = ['gauche', 'droite']
const ps = computed(() => config.value.niveau === 'ps')

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${q.reponse === 'egal' ? t('memeNombre')
    : q.reponse === 'gauche' ? `${t('aPlus', { g: 'A' })} : ${q.gauche} > ${q.droite}` : `${t('aPlus', { g: 'B' })} : ${q.droite} > ${q.gauche}`}`,
  apresErreur: 'continuer',
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const repondre = choix => jeu.repondre({ choix })

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheComparer({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }

.groupes { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.groupe-et-vs { display: contents; }

.groupe {
  background: var(--gris-bg); border-radius: 16px; padding: 1rem; min-width: 140px; flex: 1; max-width: 220px;
  border: 4px solid var(--gris-brd); transition: border-color .2s, background .2s;
}
.groupe.gagnant { border-color: var(--vert); background: #f0faf0; }
.groupe.perdant { border-color: var(--rouge); background: #fef5f5; opacity: .7; }

.groupe-label { font-size: 1.6rem; font-weight: 900; color: var(--bleu); margin-bottom: .5rem; }
.groupe-objets { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; min-height: 3.5rem; align-items: center; }
.objet { font-size: 2rem; }
.groupe-nb { font-size: 2rem; font-weight: 900; margin-top: .5rem; color: var(--texte); }
.groupe-nb.cache { visibility: hidden; }
.groupe.touchable { cursor: pointer; border-color: var(--bleu); }
.groupe.touchable:hover { background: #eaf2fd; transform: scale(1.02); }

.vs { font-size: 2.5rem; font-weight: 900; color: #ccc; flex-shrink: 0; order: 0; }

.reponses { display: grid; grid-template-columns: 1fr auto 1fr; gap: .75rem; margin-bottom: 1rem; }
.rep-btn {
  font-size: 1.1rem; font-weight: 800; padding: .75rem .5rem; border-radius: 12px; border: 3px solid var(--gris-brd);
  background: white; cursor: pointer; transition: all .15s;
}
.rep-btn:hover:not(:disabled) { transform: scale(1.04); }
.rep-btn:disabled { cursor: default; }
.rep-a    { border-color: var(--bleu); color: var(--bleu); }
.rep-b    { border-color: var(--violet); color: var(--violet); }
.rep-egal { border-color: var(--orange); color: var(--orange); }
.rep-btn.bonne { background: var(--vert); border-color: var(--vert); color: white; }
</style>

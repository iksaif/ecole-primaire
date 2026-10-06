<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('comparer.titre') }}</h1>

    <CadreExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche" :config="config"
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" :libelle="libelleNiveau" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="nbQ" v-model="config.nbQ" :titre="t('communs.nbQuestions')" />
    </CadreExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <ConsigneParlee :key="jeu.index.value" class="consigne" :texte="t(ps ? 'comparer.consignePS' : 'comparer.consigne')" />

      <div class="groupes">
        <div v-for="(cote, k) in COTES" :key="cote" class="groupe-et-vs">
          <div v-if="k === 1" class="vs" aria-hidden="true">?</div>
          <!-- PS : on touche le groupe (un bouton : clavier et lecteurs d'écran) ; sinon un simple cadre -->
          <component :is="ps ? 'button' : 'div'" :type="ps ? 'button' : undefined" class="groupe"
            :class="{ touchable: ps && !repondu, gagnant: repondu && q.reponse === cote, perdant: repondu && q.reponse !== cote && q.reponse !== 'egal' }"
            :disabled="ps ? repondu : undefined" :aria-label="ps ? t('comparer.groupe', { g: lettre(k) }) : undefined"
            @click="ps && repondre(cote)">
            <span class="groupe-label">{{ lettre(k) }}</span>
            <span class="groupe-objets" v-html="htmlCollection(q[cote], q.emoji, 'objet')"></span>
            <!-- le nombre seulement après la réponse : on compare sans compter d'abord -->
            <span class="groupe-nb" :class="{ cache: !repondu }">{{ q[cote] }}</span>
          </component>
        </div>
      </div>

      <!-- Boutons réponse (PS : on touche le groupe) -->
      <div v-if="!ps" class="reponses">
        <button type="button" class="rep-btn rep-a" :class="{ bonne: repondu && q.reponse === 'gauche' }" :disabled="repondu" @click="repondre('gauche')">
          👈 {{ t('comparer.aPlus', { g: 'A' }) }}
        </button>
        <button type="button" class="rep-btn rep-egal" :class="{ bonne: repondu && q.reponse === 'egal' }" :disabled="repondu" @click="repondre('egal')">
          = {{ t('comparer.pareil') }}
        </button>
        <button type="button" class="rep-btn rep-b" :class="{ bonne: repondu && q.reponse === 'droite' }" :disabled="repondu" @click="repondre('droite')">
          {{ t('comparer.aPlus', { g: 'B' }) }} 👉
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
// Comparer les quantités : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/comparer/ (definition.ts, generateur.ts, fiche.ts) ; les objets : src/dessins/collections.ts.
import { computed } from 'vue'
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
import DEFINITION from '../../exercices/comparer/definition.ts'
import { CONTENU } from '../../exercices/comparer/textes.ts'
import { questions as tirer, questionsFiche, verifier, NOMBRE_MAX } from '../../exercices/comparer/generateur.ts'
import type { Choix, Question, Reponse } from '../../exercices/comparer/generateur.ts'
import { fiche as ficheComparer } from '../../exercices/comparer/fiche.ts'
import { htmlCollection } from '../../dessins/collections.ts'

const { t } = useLangue()
// niveau : celui de la barre du haut s'il est de maternelle ; PS : on touche le groupe qui a le plus
const { config, langueContenu } = useReglages(DEFINITION, { suivreClasse: true })
const T = traducteur(CONTENU, () => langueContenu.value)
const ICONES: Readonly<Record<string, string>> = { ps: '🐣', ms: '🌱', gs: '🌳' }
const COTES = ['gauche', 'droite'] as const
const lettre = (k: number): string => (k === 0 ? 'A' : 'B')
const ps = computed(() => config.value.niveau === 'ps')
const libelleNiveau = (n: string): string => `${ICONES[n] ?? ''} ${n === 'ps' ? t('comparer.beaucoupPlus', { niv: n.toUpperCase() })
  : t('comparer.jusqua', { niv: n.toUpperCase(), n: NOMBRE_MAX[n as keyof typeof NOMBRE_MAX] ?? 0 })}`

// ── Jeu : une seule tentative, puis on enchaîne (maternelle) ──
const jeu = useJeu<Question, Reponse>({
  generer: rng => tirer({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  verifier,
  messageErreur: q => `❌ ${q.reponse === 'egal' ? t('comparer.memeNombre')
    : q.reponse === 'gauche' ? `${t('comparer.aPlus', { g: 'A' })} : ${q.gauche} > ${q.droite}` : `${t('comparer.aPlus', { g: 'B' })} : ${q.droite} > ${q.gauche}`}`,
  apresErreur: 1200,
  delai: 1200,
})
const { phase, questions, q, bonnes, retour, repondu, etat } = jeu
const repondre = (choix: Choix) => jeu.repondre({ choix })

// ── Fiche imprimable (aperçu et impression : CadreExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (tirage, police) => ficheComparer({ questions: tirage, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.consigne { font-size: 1.4rem; font-weight: 800; margin-bottom: 1.5rem; }

.groupes { display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
.groupe-et-vs { display: contents; }

.groupe {
  display: block; font: inherit; color: inherit; text-align: center;
  background: var(--gris-bg); border-radius: 16px; padding: 1rem; min-width: 140px; flex: 1; max-width: 220px;
  border: 4px solid var(--gris-brd); transition: border-color .2s, background .2s;
}
.groupe.gagnant { border-color: var(--vert); background: #f0faf0; }
.groupe.perdant { border-color: var(--rouge); background: #fef5f5; opacity: .7; }

.groupe-label { display: block; font-size: 1.6rem; font-weight: 900; color: var(--bleu-fort); margin-bottom: .5rem; }
.groupe-objets { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; min-height: 3.5rem; align-items: center; }
.groupe-objets :deep(.objet) { font-size: 2rem; }
.groupe-nb { display: block; font-size: 2rem; font-weight: 900; margin-top: .5rem; color: var(--texte); }
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
.rep-a    { border-color: var(--bleu); color: var(--bleu-fort); }
.rep-b    { border-color: var(--violet); color: var(--violet); }
.rep-egal { border-color: var(--orange); color: var(--texte); }
.rep-btn.bonne { background: var(--vert); border-color: var(--vert); color: white; }

@media (max-width: 520px) {
  .reponses { grid-template-columns: 1fr; }
}
</style>

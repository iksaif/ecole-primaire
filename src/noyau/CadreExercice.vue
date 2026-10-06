<!--
  Cadre commun des pages d'exercice du noyau :
    - onglets « Faire l'exercice » / « Imprimer une fiche » (le mode est porté par l'URL : useFicheExercice)
    - le formulaire de réglages (slot par défaut, reçoit { mode }) : un réglage propre à un mode
      s'écrit <div v-if="mode === 'jouer'">…</div>
    - en mode jeu : bouton Commencer ; en mode impression : le bloc « Sur la fiche » (prénom et date, corrigé,
      police), l'aperçu en direct, Imprimer et « Nouvelle fiche ».
  Usage : <CadreExercice v-model:mode="mode" :fiche="fiche" :config="config" @commencer="jeu.demarrer" @regenerer="nouvelle">
  Le texte de la fiche est un document HTML complet (documentFiche) ; ses options (prénom et date, corrigé) sont
  appliquées ici (optionsFiche.ts), avant l'aperçu et l'impression.
  Variantes selon l'exercice :
    - `:aleatoire="false"` : la fiche ne dépend pas du hasard (table, liste fixe) : pas de bouton « Nouvelle fiche » ;
    - `:police="false"` : l'exercice n'a pas de texte à mettre en police : pas de choix de police dans « Sur la fiche » ;
    - `fiche-seule` : exercice sans partie à l'écran (une fiche à imprimer) : ni onglets ni « Commencer », le mode est
      toujours « imprimer » (le tirage de la fiche se fait alors quel que soit `?mode=`, voir useFicheExercice).
  Pour une partie chronométrée, le temps restant s'affiche avec <Chronometre> (dans la question : useMinuteur).
  Accessibilité : les onglets suivent le motif WAI-ARIA (tablist / tab / tabpanel, aria-selected, aria-controls) ;
  flèches gauche et droite, Début et Fin changent d'onglet (activation automatique) ; un seul onglet est dans l'ordre de
  tabulation (celui qui est actif) et le panneau est relié à son onglet.
-->
<template>
  <div class="config-box cadre-exercice">
    <div v-if="!ficheSeule" class="modes" role="tablist" :aria-label="t('cadre.modes')" @keydown="touche">
      <button v-for="m in MODES" :key="m" :id="`${id}-onglet-${m}`" ref="onglets" type="button" role="tab" :aria-selected="modeCourant === m"
        :aria-controls="`${id}-panneau`" :tabindex="modeCourant === m ? 0 : -1" :class="{ actif: modeCourant === m }"
        @click="$emit('update:mode', m)">
        {{ t(m === 'jouer' ? 'cadre.jouer' : 'cadre.imprimer') }}
      </button>
    </div>

    <div :id="`${id}-panneau`" :role="ficheSeule ? undefined : 'tabpanel'" :aria-labelledby="ficheSeule ? undefined : `${id}-onglet-${modeCourant}`">
      <slot :mode="modeCourant" />

      <OptionsFiche v-if="modeCourant === 'imprimer'" :avec-corrige="avecCorrige" :police="police" />

      <div class="signalement"><SignalerErreur :reglages="config ?? undefined" /></div>

      <div v-if="modeCourant === 'jouer'" class="actions">
        <button type="button" class="btn btn-primary btn-grand" :disabled="desactive" @click="$emit('commencer')">{{ t('communs.commencer') }}</button>
      </div>
      <ApercuImpression v-else :html="ficheFinale" :fluide="true" :reglages="reglages">
        <template v-if="aleatoire" #actions>
          <button type="button" class="btn btn-ghost" @click="$emit('regenerer')">{{ t('cadre.nouvelle') }}</button>
        </template>
      </ApercuImpression>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, useId, nextTick } from 'vue'
import ApercuImpression from '../components/ApercuImpression.vue'
import SignalerErreur from '../components/SignalerErreur.vue'
import OptionsFiche from './OptionsFiche.vue'
import { useOptionsFiche, appliquerOptionsFiche, aUnCorrige } from './optionsFiche.ts'
import type { ModeExercice } from './useFicheExercice.ts'
import { useLangue } from '../langues/useLangue.ts'

const MODES: readonly ModeExercice[] = ['jouer', 'imprimer']

const props = withDefaults(defineProps<{
  mode: ModeExercice
  // document HTML complet de la fiche (calculé seulement en mode impression)
  fiche?: string
  // réglages de l'exercice (statistiques d'impression, signalement d'erreur)
  config?: Record<string, unknown> | null
  // le bouton « Commencer » est inactif (réglages incomplets)
  desactive?: boolean
  // la fiche dépend du hasard : « Nouvelle fiche » la retire
  aleatoire?: boolean
  // le choix de la police est proposé dans « Sur la fiche »
  police?: boolean
  // pas de partie à l'écran : une fiche seulement (pas d'onglets)
  ficheSeule?: boolean
}>(), { fiche: '', config: null, desactive: false, aleatoire: true, police: true, ficheSeule: false })
const emit = defineEmits<{ 'update:mode': [mode: ModeExercice], commencer: [], regenerer: [] }>()
// le formulaire de réglages reçoit le mode courant
defineSlots<{ default?(props: { mode: ModeExercice }): unknown }>()

const { t } = useLangue()
const id = useId()
const modeCourant = computed<ModeExercice>(() => (props.ficheSeule ? 'imprimer' : props.mode))

const options = useOptionsFiche()
const avecCorrige = computed(() => aUnCorrige(props.fiche))
const ficheFinale = computed(() => appliquerOptionsFiche(props.fiche, options.value))
const reglages = computed(() => (props.config ? { ...props.config, ...options.value } : options.value))

// Onglets au clavier : flèches (avec retour au début), Début, Fin ; le focus suit l'onglet activé
const onglets = ref<HTMLButtonElement[]>([])
function touche(e: KeyboardEvent) {
  const i = MODES.indexOf(modeCourant.value)
  const suivant = e.key === 'ArrowRight' ? (i + 1) % MODES.length : e.key === 'ArrowLeft' ? (i + MODES.length - 1) % MODES.length
    : e.key === 'Home' ? 0 : e.key === 'End' ? MODES.length - 1 : -1
  if (suivant < 0) return
  e.preventDefault()
  emit('update:mode', MODES[suivant])
  nextTick(() => onglets.value[suivant]?.focus())
}
</script>

<style scoped>
.modes {
  display: flex; gap: .25rem; background: var(--gris-bg); border-radius: 12px; padding: 4px;
  margin: -.5rem 0 1.5rem; width: fit-content; max-width: 100%;
}
.modes button {
  border: none; background: none; border-radius: 9px; padding: .55rem 1.1rem;
  font: inherit; font-weight: 800; font-size: .95rem; color: #666; cursor: pointer;
}
.modes button:hover { color: var(--texte); }
.modes button.actif { background: white; color: var(--texte); box-shadow: 0 1px 4px rgba(0,0,0,.12); }
.signalement { text-align: right; margin: .25rem 0 -.5rem; }
.actions { text-align: center; margin-top: 1.5rem; }
.btn-grand { font-size: 1.1rem; padding: .75rem 2rem; }
</style>

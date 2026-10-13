<!--
  Cadre commun des pages d'exercice du noyau :
    - onglets « Faire l'exercice » / « Imprimer une fiche » (le mode est porté par l'URL : useFicheExercice)
    - la langue du contenu, quand une langue régionale est active (ChoixLangueContenu : langueContenu.ts, fourni par useReglages)
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
    - `images` : la fiche dessine des emojis avec le rendu reçu (ParamsFiche.images) : choix des images dans « Sur la fiche » ;
    - `pictogrammes` : les consignes de la fiche passent par consignesDe (src/images/consignes.ts) : choix des pictogrammes des
      consignes et de leur ligne de crédit dans « Sur la fiche » ;
    - `fiche-seule` : exercice sans partie à l'écran (une fiche à imprimer) : ni onglets ni « Commencer », le mode est
      toujours « imprimer » (le tirage de la fiche se fait alors quel que soit `?mode=`, voir useFicheExercice).
  Pour une partie chronométrée, le temps restant s'affiche avec <Chronometre> (dans la question : useMinuteur).
  Accessibilité : les onglets suivent le motif WAI-ARIA (tablist / tab / tabpanel, aria-selected, aria-controls) ;
  flèches gauche et droite, Début et Fin changent d'onglet (activation automatique) ; un seul onglet est dans l'ordre de
  tabulation (celui qui est actif) et le panneau est relié à son onglet.
-->
<template>
  <div class="config-box cadre-exercice" :class="{ imbrique }">
    <div v-if="!ficheSeule" class="modes" role="tablist" :aria-label="t('cadre.modes')" @keydown="touche">
      <button v-for="o in onglets" :key="o.id" :id="`${id}-onglet-${o.id}`" ref="boutons" type="button" role="tab" :aria-selected="ongletActif === o.id"
        :aria-controls="`${id}-panneau`" :tabindex="ongletActif === o.id ? 0 : -1" :class="{ actif: ongletActif === o.id }"
        @click="ouvrirOnglet(o.id)">
        <Icone :nom="o.icone" /> {{ o.titre }}
      </button>
    </div>

    <div :id="`${id}-panneau`" :role="ficheSeule ? undefined : 'tabpanel'" :aria-labelledby="ficheSeule ? undefined : `${id}-onglet-${ongletActif}`">
      <!-- l'onglet d'une extension (src/extensions/) prend toute la place du panneau -->
      <component :is="composantExtension" v-if="ongletOuvert && composantExtension" :exercice="exerciceDeLaPage" />
      <template v-else>
      <ChoixLangueContenu />
      <slot :mode="modeCourant" />

      <OptionsFiche v-if="modeCourant === 'imprimer'" :avec-corrige="avecCorrige" :police="police" :images="images" :pictogrammes="pictogrammes" :extensions="extensions" />

      <div class="signalement"><SignalerErreur :reglages="config ?? undefined" /></div>

      <div v-if="modeCourant === 'jouer'" class="actions">
        <button type="button" class="btn btn-primary btn-grand" :disabled="desactive" @click="$emit('commencer')"><Icone nom="commencer" /> {{ t('communs.commencer') }}</button>
      </div>
      <ApercuImpression v-else :html="ficheFinale" :fluide="true" :reglages="reglages">
        <template v-if="aleatoire" #actions>
          <button type="button" class="btn btn-ghost" @click="$emit('regenerer')"><Icone nom="nouvelle" /> {{ t('cadre.nouvelle') }}</button>
        </template>
      </ApercuImpression>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
import { computed, defineAsyncComponent, ref, useId, nextTick } from 'vue'
import type { Component } from 'vue'
import { useOnglets } from '../extensions/onglets.ts'
import type { NomIcone } from '../images/icones.ts'
import ApercuImpression from './ApercuImpression.vue'
import SignalerErreur from './SignalerErreur.vue'
import OptionsFiche from './OptionsFiche.vue'
import ChoixLangueContenu from './ChoixLangueContenu.vue'
import { useOptionsFiche, appliquerOptionsFiche, aUnCorrige } from './optionsFiche.ts'
import type { ModeExercice } from './useFicheExercice.ts'
import { useLangue } from '../langues/useLangue.ts'


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
  // le choix des images (famille, style) est proposé dans « Sur la fiche »
  images?: boolean
  // le choix des pictogrammes des consignes est proposé dans « Sur la fiche »
  pictogrammes?: boolean
  // les extensions que l'exercice accepte (`extensions` de sa définition) : leurs choix communs sont proposés dans « Sur la fiche » quand elles sont actives
  extensions?: readonly string[]
  // pas de partie à l'écran : une fiche seulement (pas d'onglets)
  ficheSeule?: boolean
  // le cadre est dans un autre cadre (le contenu d'un onglet d'extension) : sans sa boîte
  imbrique?: boolean
}>(), { fiche: '', config: null, desactive: false, aleatoire: true, police: true, images: false, pictogrammes: false, extensions: () => [], ficheSeule: false, imbrique: false })
const emit = defineEmits<{ 'update:mode': [mode: ModeExercice], commencer: [], regenerer: [] }>()
// le formulaire de réglages reçoit le mode courant
defineSlots<{ default?(props: { mode: ModeExercice }): unknown }>()

const { t } = useLangue()
const id = useId()
const modeCourant = computed<ModeExercice>(() => (props.ficheSeule ? 'imprimer' : props.mode))

const options = useOptionsFiche()
const avecCorrige = computed(() => aUnCorrige(props.fiche))
const ficheFinale = computed(() => appliquerOptionsFiche(props.fiche, options.value, t('cadre.mentionPictos')))
const reglages = computed(() => (props.config ? { ...props.config, ...options.value } : options.value))

// Les onglets : « Faire l'exercice » et « Imprimer une fiche », puis ceux des extensions actives pour cet exercice (src/extensions/onglets.ts : `?mode=<id>`)
interface OngletAffiche { id: string, icone: NomIcone, titre: string }
const { onglets: ongletsExtensions, courant: ongletExtension, exercice: exerciceDeLaPage, ouvrir: ouvrirExtension } = useOnglets()
const onglets = computed<OngletAffiche[]>(() => [
  { id: 'jouer', icone: 'exercice', titre: t('cadre.jouer') },
  { id: 'imprimer', icone: 'imprimer', titre: t('cadre.imprimer') },
  ...ongletsExtensions.value.map(o => ({ id: o.id, icone: o.icone, titre: (t as (cle: string) => string)(o.titre) })),
])
// un cadre sans onglets (fiche seule) ou imbriqué dans un onglet n'ouvre jamais d'onglet d'extension (sinon l'onglet se contiendrait lui-même)
const ongletOuvert = computed(() => (props.ficheSeule || props.imbrique ? null : ongletExtension.value))
const ongletActif = computed(() => ongletOuvert.value?.id ?? modeCourant.value)
// le contenu de l'onglet d'une extension, chargé à la demande (un composant asynchrone par onglet, créé une fois)
const composants = new Map<string, Component>()
const composantExtension = computed<Component | null>(() => {
  const o = ongletOuvert.value
  if (!o) return null
  if (!composants.has(o.id)) composants.set(o.id, defineAsyncComponent(o.composant))
  return composants.get(o.id)!
})
function ouvrirOnglet(idOnglet: string): void {
  if (idOnglet === 'jouer' || idOnglet === 'imprimer') emit('update:mode', idOnglet)
  else ouvrirExtension(idOnglet)
}

// Onglets au clavier : flèches (avec retour au début), Début, Fin ; le focus suit l'onglet activé
const boutons = ref<HTMLButtonElement[]>([])
function touche(e: KeyboardEvent) {
  const i = onglets.value.findIndex(o => o.id === ongletActif.value)
  const n = onglets.value.length
  const suivant = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n
    : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
  if (suivant < 0) return
  e.preventDefault()
  ouvrirOnglet(onglets.value[suivant].id)
  nextTick(() => boutons.value[suivant]?.focus())
}
</script>

<style scoped>
.config-box.imbrique { box-shadow: none; padding: 0; border: 0; background: none; }
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

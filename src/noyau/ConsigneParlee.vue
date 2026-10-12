<!--
  Consigne dite à voix haute (maternelle : les enfants ne lisent pas encore) : lue à chaque nouveau texte, et un bouton 🔊
  pour la réécouter ou l'interrompre. Le texte est aussi écrit (slot par défaut : le texte).
    <ConsigneParlee :texte="t('consigne')" />                       lue à chaque changement de texte
    <ConsigneParlee :texte="…" :auto="false" langue="fr" />          seulement au clic ; langue du texte
  Repli silencieux (useTTS) : si la langue n'a pas de voix (le breton, d'après le registre des langues) ou que le
  navigateur n'en a pas, le bouton est masqué et rien n'est lu ; la consigne reste écrite, pour que l'adulte la lise.
  `langue` : celle du texte (par défaut, celle de l'interface).
  `verbes` et `niveau` : les pictogrammes ARASAAC de la consigne (src/images/consignes.ts), devant le texte, selon le réglage
  « Pictogrammes des consignes » (le même que celui des fiches : en maternelle par défaut, d'après `niveau`).
    <ConsigneParlee :texte="t('compter.combien', …)" :verbes="['compte']" :niveau="config.niveau" />
  Accessibilité : le bouton a un nom (« Écouter la consigne ») et `aria-pressed` quand il lit.
-->
<template>
  <div class="consigne-parlee">
    <button v-if="possible" type="button" class="ecouter" :aria-pressed="enLecture" :aria-label="t('communs.ecouter')" :title="t('communs.ecouter')" @click="basculer">
      <Icone nom="ecouter" />
    </button>
    <!-- les pictogrammes : des images de la table, décoratives (le texte est à côté) ; v-html est sûr ici -->
    <span v-if="pictos" class="pictos" v-html="pictos" />
    <span class="texte"><slot>{{ texte }}</slot></span>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
import { computed, watch, onUnmounted } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { useTTS } from './useTTS.ts'
import type { Langue } from '../langues/registre.ts'
import { pictogrammesDe } from '../images/consignes.ts'
import type { VerbeConsigne } from '../images/consignes.ts'
import { pictogrammesPrets, useImagesFiche } from '../images/useImagesFiche.ts'
import { useOptionsFiche } from './optionsFiche.ts'

const props = withDefaults(defineProps<{
  texte: string
  // langue du texte lu (par défaut, la langue de l'interface)
  langue?: Langue
  // lire à chaque nouveau texte
  auto?: boolean
  // les verbes de la consigne (pictogrammes) et la classe de l'exercice (le réglage « en maternelle » la lit)
  verbes?: readonly VerbeConsigne[]
  niveau?: string
}>(), { langue: undefined, auto: true, verbes: () => [], niveau: undefined })
defineSlots<{ default?(): unknown }>()
const { t, langue: langueInterface } = useLangue()
const { enLecture, peutParler, parler, arreter } = useTTS()

const options = useOptionsFiche()
const images = useImagesFiche()
const pictos = computed(() => {
  // lu pour se redessiner quand les pictogrammes arrivent (chargés à la demande)
  void pictogrammesPrets.value
  const params = { reglages: { niveau: props.niveau }, images: images.value, pictogrammes: options.value.pictogrammes }
  return pictogrammesDe(params, props.verbes)
})

const langueTexte = computed<Langue>(() => props.langue ?? langueInterface.value)
const possible = computed(() => peutParler(langueTexte.value))
const dire = () => parler(props.texte, langueTexte.value, { vitesse: 0.85 })
const basculer = () => (enLecture.value ? arreter() : dire())

watch(() => props.texte, () => { if (props.auto) dire() }, { immediate: true })
onUnmounted(arreter)
</script>

<style scoped>
.consigne-parlee { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.ecouter {
  flex: none; width: 3.5rem; height: 3.5rem; border-radius: 50%; border: 3px solid var(--bleu); background: white;
  font-size: 1.7rem; cursor: pointer; line-height: 1;
}
.pictos { flex: none; display: inline-flex; }
.pictos :deep(.pictos-consigne) { display: inline-flex; gap: .3rem; }
.pictos :deep(.picto-consigne) { width: 3.5rem; height: 3.5rem; border-radius: .4rem; }
.ecouter:hover { background: #eaf2fd; }
.ecouter[aria-pressed="true"] { background: #eaf2fd; border-color: var(--bleu-fort); }
</style>

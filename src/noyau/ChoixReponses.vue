<!--
  Question à choix (QCM) commune : une grille de propositions ; après la réponse, la bonne en vert, celle choisie
  (si fausse) en rouge, les autres grisées.
    <ChoixReponses :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i }, …)" />
  Contenu d'une proposition : `option.label` par défaut, ou le slot (dessin…) :
    <ChoixReponses images … :libelle="i => t('choixHorloge', { n: i + 1 })"><template #default="{ option }">…</template></ChoixReponses>
  images : cases carrées (dessins, figures), libellé accessible donné par `libelle(i)` ; colonne : une proposition par ligne.
  grand : maternelle, une seule rangée de gros boutons (nombres, dessins, un par proposition) :
    <ChoixReponses grand :options … ><template #default="{ option }">…</template></ChoixReponses>
  Accessibilité : un groupe de boutons (nommé par `titre`, la question) ; le bouton choisi porte `aria-pressed`, la bonne
  proposition et la mauvaise sont dites aux lecteurs d'écran après la réponse (« Juste » / « Faux »). Après la réponse
  les boutons restent focalisables (`aria-disabled`, pas `disabled`) : le focus ne se perd pas.
-->
<template>
  <div :class="images ? 'choix-images' : ['choix-grille', { grand, colonne }]" role="group" :aria-label="titre || undefined"
    :style="grand ? { gridTemplateColumns: `repeat(${options.length}, 1fr)` } : undefined">
    <button v-for="(o, i) in options" :key="i" type="button" :class="[images ? 'choix-image' : 'choix-btn', classe(i)]"
      :aria-pressed="repondu ? choisie === i : undefined" :aria-disabled="repondu || undefined"
      :aria-label="nom(i)" @click="choisir(i)">
      <slot :option="o" :index="i">{{ o.label }}</slot>
      <span v-if="repondu && verdict(i) && !libelle" class="sr-only">{{ verdict(i) }}</span>
    </button>
  </div>
</template>

<script setup lang="ts" generic="O extends { label?: unknown }">
import { ref, watch } from 'vue'
import { useLangue } from '../langues/useLangue.ts'

// O : une proposition ; `label` est son texte par défaut (le slot permet un dessin)
const props = withDefaults(defineProps<{
  options: readonly O[]
  // nom du groupe pour les lecteurs d'écran (la question)
  titre?: string
  // indice de la bonne proposition
  bonne?: number
  // la question a reçu sa réponse (jeu.repondu)
  repondu?: boolean
  images?: boolean
  grand?: boolean
  libelle?: ((i: number) => string) | null
  // propositions longues (phrases) : une par ligne, sur toute la largeur
  colonne?: boolean
}>(), { titre: '', bonne: -1, repondu: false, images: false, grand: false, libelle: null, colonne: false })
const emit = defineEmits<{ choisir: [i: number] }>()
defineSlots<{ default?(props: { option: O, index: number }): unknown }>()
// proposition choisie par l'élève, oubliée à chaque nouvelle question
const choisie = ref<number | null>(null)
watch(() => props.options, () => { choisie.value = null })

const { t } = useLangue()
// après la réponse : la bonne proposition « Juste », la proposition choisie si fausse « Faux »
const verdict = (i: number) => (i === props.bonne ? t('communs.juste') : i === choisie.value ? t('communs.faux') : '')
// nom accessible d'un bouton dessiné : son libellé, suivi du verdict après la réponse
const nom = (i: number) => (props.libelle ? [props.libelle(i), props.repondu ? verdict(i) : ''].filter(Boolean).join(' — ') : undefined)
const classe = (i: number) => (!props.repondu ? '' : i === props.bonne ? 'ok' : i === choisie.value ? 'erreur' : 'grise')
function choisir(i: number) {
  if (props.repondu) return
  choisie.value = i
  emit('choisir', i)
}
</script>

<style scoped>
.choix-grille {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
  margin-top: .5rem;
}
.choix-grille.colonne { grid-template-columns: 1fr; max-width: 520px; margin-left: auto; margin-right: auto; }
.choix-btn {
  min-height: 56px;
  padding: .6rem .75rem;
  font-size: 1.15rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-grille.grand { gap: .75rem; margin-bottom: 1rem; }
.choix-grille.grand .choix-btn { font-size: 2.4rem; min-height: 6rem; border-width: 4px; border-radius: 16px; line-height: 1; padding: .5rem; }
.choix-grille.grand .choix-btn:hover:not([aria-disabled]) { transform: scale(1.06); }
.choix-images {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
  max-width: 420px;
  margin: 0 auto;
}
.choix-image {
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  padding: .4rem;
  cursor: pointer;
  aspect-ratio: 1;
}
.choix-image > :deep(*) { display: block; width: 100%; height: 100%; }
.choix-btn:hover:not([aria-disabled]), .choix-image:hover:not([aria-disabled]) { border-color: var(--bleu); }
.choix-btn.ok, .choix-image.ok         { border-color: var(--vert); background: #f0faf0; }
.choix-btn.erreur, .choix-image.erreur { border-color: var(--rouge); background: #fef0f0; }
.choix-btn.grise, .choix-image.grise   { opacity: .5; }

@media (max-width: 520px) {
  .choix-btn { font-size: 1rem; }
}
</style>

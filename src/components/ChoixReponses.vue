<template>
  <!--
    Question à choix (QCM) commune : une grille de propositions ; après la réponse, la bonne en vert, celle choisie
    (si fausse) en rouge, les autres grisées.
      <ChoixReponses :options="q.options" :bonne="q.bonne" :repondu="repondu" @choisir="i => jeu.repondre({ choix: i }, …)" />
    Contenu d'une proposition : `option.label` par défaut, ou le slot (dessin…) :
      <ChoixReponses images … :libelle="i => t('choixHorloge', { n: i + 1 })"><template #default="{ option }">…</template></ChoixReponses>
    images : cases carrées (dessins, figures), libellé accessible donné par `libelle(i)`.
  -->
  <div :class="images ? 'choix-images' : 'choix-grille'">
    <button v-for="(o, i) in options" :key="i" :class="[images ? 'choix-image' : 'choix-btn', classe(i)]" :disabled="repondu"
      :aria-label="libelle ? libelle(i) : undefined" @click="choisir(i)">
      <slot :option="o" :index="i">{{ o.label }}</slot>
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  options: { type: Array, required: true },
  // indice de la bonne proposition
  bonne: { type: Number, default: -1 },
  // la question a reçu sa réponse (jeu.repondu)
  repondu: { type: Boolean, default: false },
  images: { type: Boolean, default: false },
  libelle: { type: Function, default: null },
})
const emit = defineEmits(['choisir'])
// proposition choisie par l'élève, oubliée à chaque nouvelle question
const choisie = ref(null)
watch(() => props.options, () => { choisie.value = null })

const classe = i => (!props.repondu ? '' : i === props.bonne ? 'ok' : i === choisie.value ? 'erreur' : 'grise')
function choisir(i) {
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
.choix-btn:hover:not(:disabled), .choix-image:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn.ok, .choix-image.ok         { border-color: var(--vert); background: #f0faf0; }
.choix-btn.erreur, .choix-image.erreur { border-color: var(--rouge); background: #fef0f0; }
.choix-btn.grise, .choix-image.grise   { opacity: .5; }

@media (max-width: 520px) {
  .choix-btn { font-size: 1rem; }
}
</style>

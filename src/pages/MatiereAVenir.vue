<template>
  <section class="a-venir" aria-labelledby="a-venir-titre">
    <h2 id="a-venir-titre"><span aria-hidden="true">{{ EMOJI_ACCUEIL.aVenir }}</span> {{ t('matiere.aVenirTitre') }}</h2>
    <p class="texte">{{ t('matiere.aVenirTexte', { classes: classesEnTexte(classes) }) }}</p>
    <ul class="domaines">
      <li v-for="d in domaines" :key="d" class="domaine" :data-domaine="d">
        <span class="emoji" aria-hidden="true">{{ EMOJI_DOMAINE[d] }}</span>
        <span class="nom">{{ nomDomaine(d, langueAffichee) }}</span>
        <span class="cycle">{{ cyclesDuDomaine(d, classes).map(n => t('matiere.cycle', { n })).join(', ') }}</span>
        <span class="badge">{{ EMOJI_ACCUEIL.aVenir }} {{ t('matiere.aVenirBadge') }}</span>
      </li>
    </ul>
    <p><RouterLink to="/programme" class="programme">{{ t('matiere.programme') }}</RouterLink></p>
  </section>
</template>

<script setup lang="ts">
// Les domaines du programme (des cycles de la classe) qui n'ont encore aucune ressource : annoncés « à venir », jamais inventés.
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import type { Classe, DomaineId } from '../ressources/types.ts'
import { EMOJI_ACCUEIL, classesEnTexte, cyclesDuDomaine, nomDomaine } from '../ressources/composants/presentation.ts'

defineProps<{ domaines: readonly DomaineId[], classes: readonly Classe[] }>()
const { t, langueAffichee } = useLangue()
</script>

<style scoped>
.a-venir { margin-top: 1.5rem; }
h2 { font-size: 1.15rem; }
.texte { color: var(--texte-doux); margin: .3rem 0 .8rem; }
.domaines { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .8rem; margin-bottom: .8rem; }
.domaine { display: flex; flex-direction: column; align-items: center; text-align: center; gap: .25rem; background: white; border: 2px dashed var(--gris-brd); border-radius: var(--radius); padding: .8rem; }
.emoji { font-size: 1.8rem; }
.nom { font-weight: 800; }
.cycle { font-size: .85rem; color: var(--texte-doux); }
.badge { font-size: .75rem; font-weight: 700; background: #eceff1; color: #455a64; border-radius: 999px; padding: .1rem .6rem; }
.programme { color: var(--bleu-fort); font-weight: 700; }
</style>

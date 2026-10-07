<template>
  <div class="ligne" :data-ressource="ressource.id">
    <span class="emoji" aria-hidden="true">{{ ressource.emoji }}</span>
    <RouterLink :to="lien" class="titre" :lang="langueTitre">{{ titre }}</RouterLink>
    <span class="genre">{{ t(cleGenre(genreDe(ressource))) }}</span>
    <span v-if="domaine" class="domaine">{{ nomDomaine(ressource.domaine, langueAffichee) }}</span>
    <PastillesClasses :classes="ressource.classes" :choisies="classesChoisies" />
    <BadgesRessource :badges="ressource.badges" />
    <span class="actions">
      <RouterLink :to="lien" class="bouton" :aria-label="t('ressource.ouvrirTitre', { titre })">{{ t('ressource.ouvrir') }}</RouterLink>
      <RouterLink v-if="imprimer" :to="imprimer" class="bouton" :aria-label="t('ressource.imprimerTitre', { titre })">{{ t('ressource.imprimer') }}</RouterLink>
    </span>
  </div>
</template>

<script setup lang="ts">
// Une ressource en ligne compacte (vue liste) : emoji, titre, genre, [domaine], classes en pastilles, badges, actions Ouvrir / Imprimer.
import { computed } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { texteDe, langueDifferente } from '../textes.ts'
import type { Classe, RessourceDeContenu, Langue } from '../types.ts'
import BadgesRessource from './BadgesRessource.vue'
import PastillesClasses from './PastillesClasses.vue'
import { cleGenre, genreDe, lienImprimer, nomDomaine, lienDansLaLangue } from './presentation.ts'

const props = defineProps<{
  ressource: RessourceDeContenu
  classesChoisies: readonly Classe[]
  /** montrer le domaine (inutile sous le titre d'un domaine) */
  domaine?: boolean
  /** ouvrir la ressource dans cette langue de contenu (page de la langue régionale) */
  langueContenu?: Langue
}>()
const { t, langueAffichee } = useLangue()
const titre = computed(() => texteDe(props.ressource.titre, langueAffichee.value))
// un titre qui n'existe pas dans la langue de la page (fiche prête en français sur une page bretonne) est marqué lang="fr"
const langueTitre = computed(() => langueDifferente(props.ressource.titre, langueAffichee.value))
const imprimer = computed(() => lienImprimer(props.ressource))
const lien = computed(() => lienDansLaLangue(props.ressource, props.langueContenu))
</script>

<style scoped>
.ligne {
  display: grid; grid-template-columns: 1.6rem minmax(0, 1fr) 6rem auto auto auto; align-items: center; gap: .3rem .6rem;
  padding: .45rem .2rem; border-bottom: 1px solid var(--gris-bg);
}
.emoji { font-size: 1.3rem; text-align: center; }
.titre { font-weight: 800; color: var(--texte); text-decoration: none; overflow-wrap: anywhere; }
.titre:hover { text-decoration: underline; }
.genre, .domaine { font-size: .85rem; color: var(--texte-doux); }
.actions { display: flex; gap: .4rem; }
.bouton {
  border: 2px solid var(--gris-brd); background: white; border-radius: 8px; padding: .3rem .7rem; min-height: 2rem;
  font-size: .85rem; font-weight: 700; color: var(--texte); text-decoration: none; display: inline-flex; align-items: center;
}
.bouton:hover { border-color: var(--bleu); }
@media (max-width: 760px) {
  .ligne { grid-template-columns: 1.6rem minmax(0, 1fr); }
  .ligne > :nth-child(n+3) { grid-column: 2; }
  .ligne > .genre, .ligne > .domaine { display: inline; }
}
</style>

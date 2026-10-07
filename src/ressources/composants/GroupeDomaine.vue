<template>
  <details :id="`domaine-${groupe.domaine}`" class="groupe" :open="ouvert" :data-domaine="groupe.domaine" @toggle="suivre">
    <summary>
      <h2><span aria-hidden="true">{{ emojiGroupe(groupe.domaine, EMOJI_DOMAINE) }}</span> {{ nomGroupe(groupe.domaine, langueAffichee) }}</h2>
      <span v-if="groupe.ressources.length" class="compte">{{ t('ressource.ressources', { n: groupe.ressources.length }) }}</span>
      <span v-if="groupe.horsClasse" class="hors">{{ t('ressource.horsClasse', { n: classes.length, classes: classesEnTexte(classes), total: groupe.horsClasse }) }}</span>
    </summary>
    <div class="contenu">
      <section v-for="s in sections" :key="s.usage" class="usage">
        <h3><span aria-hidden="true">{{ EMOJI_USAGE[s.usage] }}</span> {{ t(s.titre) }}</h3>
        <p v-if="!s.liste.length" class="rien">{{ t('ressource.rien') }}</p>
        <ul v-else :class="vue === 'liste' ? 'lignes' : 'cartes'">
          <li v-for="r in s.liste" :key="r.id">
            <LigneRessource v-if="vue === 'liste'" :ressource="r" :classes-choisies="classes" />
            <CarteRessource v-else :ressource="r" :classes-choisies="classes" />
          </li>
        </ul>
      </section>
    </div>
  </details>
</template>

<script setup lang="ts">
// Un domaine du programme dans une page de matière : titre, « Pour apprendre » / « Pour s'entraîner », en cartes ou en liste.
// Replié (rien pour les classes choisies) ou ouvert par défaut ; ce que le lecteur plie ou déplie est mémorisé par domaine
// (`usePlis`). « Hors de la classe CE1 : 3 » annonce les ressources des autres classes : un domaine n'est jamais masqué.
import { computed } from 'vue'
import type { Vue } from '../../contexte/types.ts'
import { useLangue } from '../../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../emojis.ts'
import type { GroupeDomaine } from '../filtres.ts'
import type { Classe } from '../types.ts'
import CarteRessource from './CarteRessource.vue'
import LigneRessource from './LigneRessource.vue'
import { EMOJI_USAGE, classesEnTexte, emojiGroupe, nomGroupe } from './presentation.ts'
import { usePlis } from './usePlis.ts'

const props = defineProps<{ groupe: GroupeDomaine, classes: readonly Classe[], vue: Vue }>()
const { t, langueAffichee } = useLangue()
const plis = usePlis()
const ouvert = computed(() => plis.ouvert(props.groupe.domaine, props.groupe.replie))
const sections = computed(() => [
  { usage: 'apprendre', titre: 'ressource.apprendre', liste: props.groupe.apprendre },
  { usage: 'sentrainer', titre: 'ressource.sentrainer', liste: props.groupe.sentrainer },
] as const)
// le navigateur annonce aussi les changements que nous faisons nous-mêmes : on n'enregistre que ceux du lecteur
function suivre(e: Event): void {
  const ferme = (e.currentTarget as HTMLDetailsElement).open
  if (ferme !== ouvert.value) plis.definir(props.groupe.domaine, ferme)
}
</script>

<style scoped>
.groupe { background: white; border-radius: var(--radius); box-shadow: var(--shadow); border-top: 4px solid var(--bleu); margin-bottom: 1rem; }
summary { display: flex; flex-wrap: wrap; align-items: center; gap: .3rem 1rem; padding: .8rem 1rem; cursor: pointer; min-height: 2.75rem; }
summary h2 { font-size: 1.2rem; margin-right: auto; }
.compte, .hors { font-size: .85rem; color: var(--texte-doux); }
.contenu { padding: 0 1rem 1rem; }
.usage + .usage { margin-top: 1rem; }
h3 { font-size: .85rem; text-transform: uppercase; letter-spacing: .03em; color: var(--bleu-fort); margin-bottom: .5rem; }
.rien { font-style: italic; color: var(--texte-doux); }
.cartes { list-style: none; display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: .8rem; }
.lignes { list-style: none; }
</style>

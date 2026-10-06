<!-- Les résultats de la recherche, groupés par type (liste à options du champ combiné de Recherche.vue). Un clic ou un survol
     choisit l'option ; l'option active est celle que le champ désigne par `aria-activedescendant`. -->
<template>
  <ul :id="ID_LISTE" class="resultats" role="listbox" :aria-label="t('recherche.resultats')">
    <li v-for="g in groupes" :key="g.type" role="presentation">
      <div :id="`${ID_LISTE}-${g.type}`" class="groupe" role="presentation">
        <span aria-hidden="true">{{ EMOJI_TYPE[g.type] }}</span> {{ t(`recherche.groupes.${g.type}`) }}
        <span v-if="g.restants" class="groupe-reste">· {{ t('recherche.autres', { n: g.restants }) }}</span>
      </div>
      <ul role="group" :aria-labelledby="`${ID_LISTE}-${g.type}`">
        <li v-for="l in g.lignes" :id="idOption(l.position)" :key="l.entree.id" class="option" role="option"
          :aria-selected="l.position === actif" @click="emit('choisir', l.entree)" @mousemove="emit('survol', l.position)">
          <span class="option-emoji" aria-hidden="true">{{ l.entree.emoji }}</span>
          <span class="option-texte">
            <strong><TexteSurligne :texte="l.entree.titre" :requete="requete" /></strong>
            <small v-if="l.entree.sousTitre">{{ l.entree.sousTitre }}</small>
          </span>
          <span v-if="l.entree.classes.length" class="option-classes">{{ resumeClasses(l.entree.classes) }}</span>
        </li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_TYPE } from '../ressources/emojis.ts'
import type { Classe } from '../ressources/types.ts'
import type { EntreeRecherche } from './index.ts'
import { ID_LISTE, idOption } from './identifiants.ts'
import type { GroupeAffiche } from './resultats.ts'
import TexteSurligne from './TexteSurligne.vue'

defineProps<{ groupes: readonly GroupeAffiche[], actif: number, requete: string }>()
const emit = defineEmits<{ choisir: [entree: EntreeRecherche], survol: [position: number] }>()
const { t } = useLangue()

/** « CP », « CE1 – CE2 », « PS – CM2 » : la première et la dernière classe d'une ressource. */
const resumeClasses = (classes: readonly Classe[]): string => {
  const premiere = classes[0]?.toUpperCase()
  const derniere = classes[classes.length - 1]?.toUpperCase()
  return premiere === derniere ? (premiere ?? '') : `${premiere} – ${derniere}`
}
</script>

<style scoped>
.resultats, .resultats ul { list-style: none; margin: 0; padding: 0; }
.resultats { overflow: auto; flex: 1; min-height: 0; padding: .3rem .5rem .6rem; }
.groupe { font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--texte-doux); padding: .6rem .5rem .2rem; }
.groupe-reste { text-transform: none; letter-spacing: 0; font-weight: 600; }
.option { display: flex; gap: .7rem; align-items: center; min-height: 44px; padding: .45rem .6rem; border-radius: 10px; cursor: pointer; color: var(--texte); }
.option[aria-selected="true"] { background: #e8f1fc; box-shadow: inset 3px 0 0 var(--bleu-fort); }
.option-emoji { font-size: 1.3rem; width: 1.6rem; text-align: center; flex: none; }
.option-texte { min-width: 0; display: flex; flex-direction: column; }
.option-texte strong { font-size: .95rem; overflow-wrap: anywhere; }
.option-texte small { color: var(--texte-doux); font-size: .8rem; }
.option-classes { margin-left: auto; flex: none; font-size: .75rem; font-weight: 700; color: var(--texte-doux); }
@media (max-width: 600px) { .option-classes { display: none; } }
</style>

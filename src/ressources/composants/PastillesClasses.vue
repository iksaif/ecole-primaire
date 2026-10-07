<template>
  <ul class="pastilles" :aria-label="t('ressource.classes')">
    <li v-for="p in pastilles" :key="p.morceau.debut" class="pastille" :class="{ choisie: p.choisies.length }">
      <template v-if="p.plage">
        <span aria-hidden="true">{{ texteMorceau(p.morceau) }}</span><span class="sr-only">{{ p.lue }}</span>
        <span v-if="p.choisies.length" class="sr-only"> {{ t('ressource.plageChoisie', { n: p.choisies.length, classes: texteClasses(p.choisies) }) }}</span>
      </template>
      <template v-else>
        {{ texteMorceau(p.morceau) }}<span v-if="p.choisies.length" class="sr-only"> {{ t('ressource.classeChoisie') }}</span>
      </template>
    </li>
  </ul>
</template>

<script setup lang="ts">
// Les classes d'une ressource en pastilles : une pastille par plage de trois classes de suite ou plus (« PS → CM2 », lue « de la
// PS au CM2 »), une par classe sinon (morceauxDeClasses, data/classes.ts). Mise en évidence (couleur ET texte caché pour les
// lecteurs d'écran) : une pastille qui contient au moins une classe choisie, car la ressource sert dans cette classe ; pour une
// plage, le texte caché dit laquelle (« dont la classe choisie : CE1 »).
import { computed } from 'vue'
import { estPlage, morceauxDeClasses, texteClasses, texteMorceau } from '../../data/classes.ts'
import type { MorceauClasses } from '../../data/classes.ts'
import { useLangue } from '../../langues/useLangue.ts'
import type { Classe } from '../types.ts'
import { ecoleDe } from './presentation.ts'

const props = defineProps<{ classes: readonly Classe[], choisies: readonly Classe[] }>()
const { t } = useLangue()

/** Une pastille : son morceau, les classes choisies qu'il contient, et sa lecture en entier si c'est une plage. */
interface Pastille {
  morceau: MorceauClasses
  plage: boolean
  choisies: Classe[]
  lue: string
}

/** La lecture d'une plage pour un lecteur d'écran : « de la PS » + « au CM2 ». */
function plageLue(m: MorceauClasses): string {
  const debut = t(`ressource.plage.debut.${ecoleDe(m.debut)}`, { classe: m.debut.toUpperCase() })
  const fin = t(`ressource.plage.fin.${ecoleDe(m.fin)}`, { classe: m.fin.toUpperCase() })
  return t('ressource.plage.phrase', { debut, fin })
}

const pastilles = computed<Pastille[]>(() => morceauxDeClasses(props.classes).map(morceau => {
  const plage = estPlage(morceau)
  return {
    morceau,
    plage,
    choisies: morceau.classes.filter(c => props.choisies.includes(c)),
    lue: plage ? plageLue(morceau) : '',
  }
}))
</script>

<style scoped>
.pastilles { list-style: none; display: flex; flex-wrap: wrap; gap: .25rem; justify-content: inherit; }
.pastille { font-size: .75rem; font-weight: 800; padding: .1rem .5rem; border-radius: 999px; background: #eceff1; color: #455a64; white-space: nowrap; }
.pastille.choisie { background: var(--bleu-fort); color: white; }
</style>

<template>
  <section v-if="elements.length" class="reprendre" :class="{ gros }" aria-labelledby="reprendre-titre">
    <h2 id="reprendre-titre"><span aria-hidden="true">{{ EMOJI_ACCUEIL.reprendre }}</span> {{ t('accueil.reprendre') }}</h2>
    <ul>
      <li v-for="e in elements" :key="e.ressource.id">
        <RouterLink :to="e.ressource.route" class="element">
          <span class="emoji" aria-hidden="true">{{ e.ressource.emoji }}</span>
          <span class="texte">
            <strong>{{ e.titre }}</strong>
            <small v-if="!gros">{{ e.detail }}</small>
          </span>
        </RouterLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
// « Reprendre » : les derniers exercices ouverts sur cet appareil (src/ressources/recents.ts), ceux qui existent encore dans le
// catalogue. Rien à montrer : la section n'apparaît pas. `gros` : la disposition enfant (titre seul, grande tuile).
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'
import { anciennete, retenirExistants } from '../ressources/recents.ts'
import type { Anciennete } from '../ressources/recents.ts'
import { texteDe } from '../ressources/textes.ts'
import { useRecents } from '../ressources/useRecents.ts'
import { useRessources } from '../ressources/useRessources.ts'

defineProps<{ gros?: boolean }>()
const { t, langueAffichee } = useLangue()
const { contexte } = useContexte()
const { catalogue } = useRessources()
const { recents } = useRecents()

const texteAnciennete = (a: Anciennete): string => (a.cle === 'jours' ? t('accueil.anciennete.jours', { n: a.n }) : t(`accueil.anciennete.${a.cle}`))
const elements = computed(() => {
  const parId = new Map(catalogue.value.map(r => [r.id, r]))
  const maintenant = Date.now()
  return retenirExistants(recents.value, id => parId.has(id)).flatMap(r => {
    const ressource = parId.get(r.id)
    if (!ressource) return []
    const classe = ressource.classes.find(c => contexte.value.classes.includes(c)) ?? ressource.classes[0]
    return [{ ressource, titre: texteDe(ressource.titre, langueAffichee.value), detail: [classe?.toUpperCase(), texteAnciennete(anciennete(r.ouvert, maintenant))].filter(Boolean).join(' · ') }]
  })
})
</script>

<style scoped>
.reprendre { margin: 2rem 0 1rem; }
h2 { font-size: 1.2rem; margin-bottom: .6rem; }
ul { list-style: none; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .8rem; }
.element { display: flex; align-items: center; gap: .8rem; background: white; border-radius: var(--radius); box-shadow: var(--shadow); border-left: 5px solid var(--orange); padding: .7rem 1rem; text-decoration: none; color: var(--texte); min-height: 3.5rem; }
.element:hover { transform: translateY(-2px); }
.emoji { font-size: 2rem; }
.texte { display: flex; flex-direction: column; }
small { color: var(--texte-doux); }
.gros { text-align: center; }
.gros .element { flex-direction: column; justify-content: center; border-left: none; border-bottom: 6px solid var(--bleu); border-radius: 24px; padding: 1.2rem 1rem; min-height: 8rem; }
.gros .emoji { font-size: 3.2rem; }
.gros strong { font-size: 1.15rem; }
</style>

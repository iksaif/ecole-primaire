<template>
  <section aria-labelledby="h-domaine-classe" class="bloc">
    <h2 id="h-domaine-classe">{{ t('competence.domaineClasse.titre', { classe: position.classe.toUpperCase() }) }}
      <span class="precision">({{ t('competence.domaineClasse.nombre', { n: position.domaine.length }) }})</span></h2>
    <ol class="liste">
      <li v-for="k in position.domaine" :key="k.id" :class="{ courante: k.id === courante }">
        <span v-if="k.id === courante" class="libelle" :lang="LANGUE_SOURCE" aria-current="true">{{ k.libelle }}<span class="sr-only"> ({{ t('competence.domaineClasse.ici') }})</span></span>
        <RouterLink v-else class="libelle" :to="vers(k.id)" :lang="LANGUE_SOURCE">{{ k.libelle }}</RouterLink>
        <span class="etat" :class="{ aucune: !nombres.get(k.id) }">{{ etatDe(k.id) }}</span>
      </li>
    </ol>
    <p class="toutes"><RouterLink :to="versLeProgramme">{{ t('competence.domaineClasse.toutes') }}</RouterLink></p>
  </section>
</template>

<script setup lang="ts">
// Tout le domaine de la compétence dans la classe lue, dans l'ordre du programme, avec ce que chaque compétence a déjà comme ressources.
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { Position } from './navigation.ts'

const props = defineProps<{ position: Position, courante: string, nombres: ReadonlyMap<string, number>, vers: (id: string) => string, versLeProgramme: string }>()
const { t } = useLangue()

/** « 3 ressources » ou « bientôt » */
function etatDe(id: string): string {
  const n = props.nombres.get(id) ?? 0
  return n > 0 ? t('competence.ressources.nombre', { n }) : t('competence.domaineClasse.bientot')
}
</script>

<style scoped>
.bloc { margin-top: 1.5rem; }
h2 { font-size: 1.15rem; margin-bottom: .5rem; }
.precision { font-size: .9rem; font-weight: 600; color: var(--texte-doux); }
.liste { list-style: none; display: grid; gap: .4rem; }
.liste li { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: .3rem .8rem; background: #fff; border-radius: 10px; box-shadow: var(--shadow); padding: .6rem .8rem; border-left: 5px solid var(--gris-brd); }
.liste li.courante { border-left-color: var(--violet); background: #f6f1ff; }
.libelle { font-weight: 700; }
.courante .libelle { color: var(--texte); }
.etat { font-size: .85rem; font-weight: 700; color: var(--vert-fort, #1d7a46); }
.etat.aucune { color: var(--texte-doux); font-weight: 600; }
.toutes { margin-top: .6rem; font-weight: 700; }
</style>

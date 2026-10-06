<template>
  <div class="choix-classes" role="group" :aria-label="t(plusieurs ? 'accueil.mesClasses' : 'accueil.maClasse')">
    <span class="titre"><span aria-hidden="true">{{ EMOJI_ACCUEIL.classe }}</span> {{ t(plusieurs ? 'accueil.mesClasses' : 'accueil.maClasse') }}</span>
    <button v-for="c in CLASSES" :key="c.id" type="button" class="puce" :class="{ active: contexte.classes.includes(c.id) }"
      :aria-pressed="contexte.classes.includes(c.id)" @click="choisir(c.id)">{{ c.label }}</button>
  </div>
</template>

<script setup lang="ts">
// Le choix des classes sur l'accueil : une seule (parent) ou plusieurs (enseignant : on ajoute et on retire, jamais moins d'une),
// par le contexte, donc dans l'adresse.
import { useContexte } from '../contexte/useContexte.ts'
import { CLASSES } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_ACCUEIL } from '../ressources/composants/presentation.ts'

const { t } = useLangue()
const { contexte, plusieursClasses: plusieurs, choisirClasses, ajouterClasse, retirerClasse } = useContexte()
async function choisir(c: Classe): Promise<void> {
  if (!plusieurs.value) await choisirClasses([c])
  else await (contexte.value.classes.includes(c) ? retirerClasse(c) : ajouterClasse(c))
}
</script>

<style scoped>
.choix-classes { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: .4rem; background: white; box-shadow: var(--shadow); border-radius: 999px; padding: .5rem 1rem; }
.titre { font-weight: 800; margin-right: .4rem; }
.puce { border: 2px solid var(--gris-brd); background: white; border-radius: 999px; min-width: 2.75rem; min-height: 2.75rem; padding: .3rem .75rem; font: inherit; font-weight: 800; font-size: .9rem; color: var(--texte); cursor: pointer; }
.puce:hover { border-color: var(--vert-texte); }
.puce.active { background: var(--vert-texte); border-color: var(--vert-texte); color: white; }
@media (max-width: 600px) { .choix-classes { border-radius: var(--radius); } }
</style>

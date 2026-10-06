<template>
  <!-- Les pastilles de classe par cycle (barre et page des réglages). Parent : une classe ; enseignant : plusieurs. -->
  <div v-for="cycle in CYCLES" :key="cycle.id" class="ligne-cycle">
    <span class="cycle">{{ t(cycle.cle) }}</span>
    <button v-for="c in cycle.classes" :key="c" type="button" class="pastille" :aria-pressed="contexte.classes.includes(c)" @click="choisir(c)">{{ c.toUpperCase() }}</button>
  </div>
  <button v-if="plusieursClasses" type="button" class="pastille toutes" @click="toutes">{{ t('shell.classe.toutes') }}</button>
  <p class="note">{{ plusieursClasses ? t('shell.classe.notePlusieurs') : t('shell.classe.noteUne') }}</p>
</template>

<script setup lang="ts">
import { NIVEAUX, classesDuCycle } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t } = useLangue()
const { contexte, plusieursClasses, choisirClasses, ajouterClasse, retirerClasse } = useContexte()

const CYCLES: readonly { id: number, cle: `shell.classe.cycle${1 | 2 | 3}`, classes: readonly Classe[] }[] = [
  { id: 1, cle: 'shell.classe.cycle1', classes: classesDuCycle(1) },
  { id: 2, cle: 'shell.classe.cycle2', classes: classesDuCycle(2) },
  { id: 3, cle: 'shell.classe.cycle3', classes: classesDuCycle(3) },
]

/** Parent : cette classe seule. Enseignant : la classe s'ajoute ou se retire (jamais moins d'une). */
const choisir = (c: Classe): Promise<boolean> => !plusieursClasses.value ? choisirClasses([c])
  : contexte.value.classes.includes(c) ? retirerClasse(c) : ajouterClasse(c)
const toutes = (): Promise<boolean> => choisirClasses(NIVEAUX)
</script>

<style scoped>
.ligne-cycle { display: flex; align-items: center; flex-wrap: wrap; gap: .3rem; margin-bottom: .4rem; }
.cycle { min-width: 5.5rem; font-size: .72rem; font-weight: 800; color: var(--texte-doux); text-transform: uppercase; }
.pastille {
  min-width: 44px; min-height: 36px; border: 2px solid var(--gris-brd); background: white; border-radius: 999px; padding: .2rem .7rem;
  font: inherit; font-size: .85rem; font-weight: 800; color: var(--texte); cursor: pointer;
}
.pastille:hover { border-color: var(--vert); }
.pastille[aria-pressed="true"] { background: var(--vert-texte); border-color: var(--vert-texte); color: white; }
.pastille.toutes { margin-top: .2rem; }
.note { font-size: .78rem; color: var(--texte-doux); margin-top: .3rem; }
@media (max-width: 640px) { .pastille { min-height: 44px; } }
</style>

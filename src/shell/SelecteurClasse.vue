<template>
  <!-- « Classe ▾ » : des pastilles par cycle. Parent : une classe ; enseignant : plusieurs ; enfant : classe verrouillée (cadenas) -->
  <div ref="racine" class="menu-deroulant" @keydown="touche" @focusout="sortie">
    <button v-if="verrouillee" ref="bouton" type="button" class="nbtn verrou" :aria-expanded="ouvert" aria-controls="menu-cadenas"
      :aria-label="t('shell.classe.verrouillee', { classes: libelle })" @click="basculer">
      <span aria-hidden="true">{{ EMOJI_BARRE.verrou }}</span> <span aria-hidden="true">{{ libelle }}</span>
    </button>
    <button v-else ref="bouton" type="button" class="nbtn classe" :aria-expanded="ouvert" aria-controls="menu-classe"
      :aria-label="t('shell.classe.etat', { classes: libelle })" @click="basculer">
      <span class="icone" aria-hidden="true">{{ EMOJI_BARRE.classe }}</span>
      <span class="etiquette etiquette-large" aria-hidden="true">{{ t('shell.classe.titre') }}</span>
      <span aria-hidden="true">{{ libelle }}</span> <span aria-hidden="true">▾</span>
    </button>

    <div v-if="ouvert && verrouillee" id="menu-cadenas" class="menu-panneau"><CadenasClasse @ouvert="ouvrirClasses" /></div>
    <div v-else-if="ouvert" id="menu-classe" class="menu-panneau panneau-classes" role="group" :aria-label="t('shell.classe.titre')">
      <h3>{{ plusieursClasses ? t('shell.classe.mesClasses') : t('shell.classe.maClasse') }}</h3>
      <div v-for="cycle in CYCLES" :key="cycle.id" class="ligne-cycle">
        <span class="cycle">{{ t(cycle.cle) }}</span>
        <button v-for="c in cycle.classes" :key="c" type="button" class="pastille" :aria-pressed="contexte.classes.includes(c)" @click="choisir(c)">{{ c.toUpperCase() }}</button>
      </div>
      <button v-if="plusieursClasses" type="button" class="pastille toutes" @click="toutes">{{ t('shell.classe.toutes') }}</button>
      <p class="note">{{ plusieursClasses ? t('shell.classe.notePlusieurs') : t('shell.classe.noteUne') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NIVEAUX, classesDuCycle } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import CadenasClasse from './CadenasClasse.vue'
import { libelleClasses } from './classes.ts'
import { EMOJI_BARRE } from './emojis.ts'
import { useMenu } from './menus.ts'

const { t } = useLangue()
const { contexte, verrouillee, plusieursClasses, choisirClasses, ajouterClasse, retirerClasse, deverrouillerClasse } = useContexte()
const { racine, bouton, ouvert, basculer, touche, sortie } = useMenu('classe')
const libelle = computed(() => libelleClasses(contexte.value.classes))

const CYCLES: readonly { id: number, cle: `shell.classe.cycle${1 | 2 | 3}`, classes: readonly Classe[] }[] = [
  { id: 1, cle: 'shell.classe.cycle1', classes: classesDuCycle(1) },
  { id: 2, cle: 'shell.classe.cycle2', classes: classesDuCycle(2) },
  { id: 3, cle: 'shell.classe.cycle3', classes: classesDuCycle(3) },
]

/** Parent : cette classe seule. Enseignant : la classe s'ajoute ou se retire (jamais moins d'une). */
const choisir = (c: Classe): Promise<boolean> => !plusieursClasses.value ? choisirClasses([c])
  : contexte.value.classes.includes(c) ? retirerClasse(c) : ajouterClasse(c)
const toutes = (): Promise<boolean> => choisirClasses(NIVEAUX)
/** Le cadenas s'est ouvert : la classe peut changer, le même menu montre alors les pastilles */
const ouvrirClasses = (): void => deverrouillerClasse()
</script>

<style scoped>
.panneau-classes { min-width: 350px; }
.ligne-cycle { display: flex; align-items: center; flex-wrap: wrap; gap: .3rem; margin-bottom: .4rem; }
.cycle { min-width: 5.5rem; font-size: .72rem; font-weight: 800; color: var(--texte-doux); text-transform: uppercase; }
.pastille {
  min-width: 44px; min-height: 36px; border: 2px solid var(--gris-brd); background: white; border-radius: 999px; padding: .2rem .7rem;
  font: inherit; font-size: .85rem; font-weight: 800; color: var(--texte); cursor: pointer;
}
.pastille:hover { border-color: var(--vert); }
.pastille[aria-pressed="true"] { background: var(--vert-texte); border-color: var(--vert-texte); color: white; }
.pastille.toutes { margin-top: .2rem; }
@media (max-width: 1440px) { .etiquette-large { display: none; } }
@media (max-width: 640px) { .pastille { min-height: 44px; } .classe .icone { display: none; } .panneau-classes { min-width: 0; } }
</style>

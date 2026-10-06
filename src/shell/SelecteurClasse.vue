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
      <ChoixClasses />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import CadenasClasse from './CadenasClasse.vue'
import ChoixClasses from './ChoixClasses.vue'
import { libelleClasses } from './classes.ts'
import { EMOJI_BARRE } from './emojis.ts'
import { useMenu } from './menus.ts'

const { t } = useLangue()
const { contexte, verrouillee, plusieursClasses, deverrouillerClasse } = useContexte()
const { racine, bouton, ouvert, basculer, touche, sortie } = useMenu('classe')
const libelle = computed(() => libelleClasses(contexte.value.classes))

/** Le cadenas s'est ouvert : la classe peut changer, le même menu montre alors les pastilles */
const ouvrirClasses = (): void => deverrouillerClasse()
</script>

<style scoped>
.panneau-classes { min-width: 350px; }
@media (max-width: 1440px) { .etiquette-large { display: none; } }
@media (max-width: 640px) { .classe .icone { display: none; } .panneau-classes { min-width: 0; } }
</style>

<template>
  <!-- pastille « 🧒 / 👨‍👩‍👧 / 🧑‍🏫 » : ouvre le choix du profil (ne change que la disposition, rien n'est verrouillé) -->
  <div ref="racine" class="menu-deroulant" @keydown="touche" @focusout="sortie">
    <button ref="bouton" type="button" class="nbtn avec-pastille" :aria-expanded="ouvert" aria-controls="menu-profil" :aria-label="libelle" @click="basculer">
      <span aria-hidden="true">{{ EMOJI_PROFIL[contexte.profil] }}</span><span class="nom-profil" :class="{ long: nomProfil.length > 7 }" aria-hidden="true">{{ nomProfil }}</span><!-- mode enseignant : une idée en construction (src/contexte/enseignant.ts) ; le texte visible (« Enseignant bêta ») fait partie du nom accessible -->
      <span v-if="enseignant" class="beta" :title="t('shell.enseignant.pastilleTitre')" aria-hidden="true">{{ t('shell.enseignant.pastille') }}</span><span aria-hidden="true">▾</span>
    </button>
    <div v-if="ouvert" id="menu-profil" class="menu-panneau">
      <h3>{{ t('shell.profil.question') }}</h3>
      <OptionsProfil @choisi="fermer(true)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import { useLangue } from '../langues/useLangue.ts'
import OptionsProfil from './OptionsProfil.vue'
import { EMOJI_PROFIL } from './emojis.ts'
import { useMenu } from './menus.ts'

const { t } = useLangue()
const { contexte } = useContexte()
const nomProfil = computed(() => t(`shell.profil.${contexte.value.profil}`))
const enseignant = computed(() => contexte.value.profil === 'enseignant')
/** le nom accessible du bouton : le profil, et pour l'enseignant que c'est une idée en construction */
const libelle = computed(() => {
  if (!enseignant.value) return t('shell.profil.etat', { profil: nomProfil.value })
  return `${t('shell.profil.etat', { profil: `${nomProfil.value} ${t('shell.enseignant.pastille')}` })} — ${t('shell.enseignant.pastilleTitre')}`
})
const { racine, bouton, ouvert, fermer, basculer, touche, sortie } = useMenu('profil')
</script>

<style scoped>
.avec-pastille { position: relative; }
/* la pastille ne prend pas de place dans la barre : elle se pose sur l'angle du bouton */
.beta { position: absolute; top: -.35rem; right: -.2rem; padding: 0 .35rem; border-radius: 8px; background: #e0a800; color: #3b2d00; font-size: .62rem; font-weight: 800; line-height: 1.3; text-transform: uppercase; letter-spacing: .03em; }
/* le nom du profil est visible quand il y a la place : au téléphone jamais, et sous 1440 px quand il est long (« Enseignant » : la barre de l'enseignant
   a aussi l'entrée « Programme », et des polices plus larges la font déborder à 1280 px) */
@media (max-width: 900px) { .nom-profil { display: none; } }
@media (max-width: 1440px) { .nom-profil.long { display: none; } }
</style>

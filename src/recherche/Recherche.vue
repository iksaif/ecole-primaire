<!-- La palette de recherche (modale) : Ctrl+K, ⌘K, « / » ou le bouton 🔍 de la barre (`ouvrirRecherche`, palette.ts).
     Monté une fois dans l'application. Champ combiné (role="combobox") + liste à options ; la classe courante filtre, un bouton
     élargit à toutes les classes. Plein écran sur téléphone. Comportement : useRechercheModale.ts, état : useRecherche.ts. -->
<template>
  <Teleport to="body">
    <div v-if="rechercheOuverte" class="fond" @mousedown.self="fermerRecherche()">
      <div ref="fenetre" class="fenetre" role="dialog" aria-modal="true" :aria-label="t('recherche.titre')" @keydown="surClavier">
        <div class="tete">
          <span aria-hidden="true">{{ EMOJI_BARRE.recherche }}</span>
          <input ref="champ" v-model="saisie" type="text" role="combobox" autocomplete="off" spellcheck="false" enterkeyhint="search"
            :placeholder="t('recherche.placeholder')" :aria-label="t('recherche.champ')" :aria-expanded="lignes.length > 0"
            :aria-controls="lignes.length ? ID_LISTE : undefined" aria-autocomplete="list"
            :aria-activedescendant="lignes.length ? idOption(position) : undefined"
            @keydown.down.prevent="aller(1)" @keydown.up.prevent="aller(-1)" @keydown.enter.prevent="choisirActive">
          <button type="button" class="fermer" :aria-label="t('recherche.fermer')" @click="fermerRecherche()">✕</button>
        </div>

        <div class="contexte">
          <span><span aria-hidden="true">{{ EMOJI_BARRE.classe }}</span> {{ t('recherche.classe', { classes: classesTexte }) }}</span>
          <button type="button" class="level-btn" :class="{ active: toutesLesClasses }" :aria-pressed="toutesLesClasses"
            @click="toutesLesClasses = !toutesLesClasses"><span aria-hidden="true">{{ EMOJI_BARRE.tous }}</span> {{ t('recherche.toutesLesClasses') }}</button>
          <span v-if="masques" class="doux">{{ t('recherche.masques', { n: masques }) }}</span>
        </div>

        <RechercheResultats v-if="lignes.length" :groupes="groupes" :actif="position" :requete="requete" @choisir="choisir" @survol="p => position = p" />
        <p v-else-if="!aRequete" class="vide">{{ t('recherche.aide') }}</p>
        <div v-else class="vide">
          <p>{{ toutesLesClasses ? t('recherche.aucunPartout', { requete }) : t('recherche.aucun', { requete, classes: classesTexte }) }}</p>
          <button v-if="!toutesLesClasses" type="button" class="level-btn" @click="toutesLesClasses = true"><span aria-hidden="true">{{ EMOJI_BARRE.tous }}</span> {{ t('recherche.essayerToutes') }}</button>
        </div>

        <p class="annonce sr-only" role="status" aria-live="polite">{{ annonce }}</p>
        <div class="pied" aria-hidden="true">
          <span>{{ t('recherche.aideClavier.choisir') }}</span><span>{{ t('recherche.aideClavier.ouvrir') }}</span>
          <span>{{ t('recherche.aideClavier.fermer') }}</span><span>{{ t('recherche.aideClavier.accents') }}</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import { ID_LISTE, idOption } from './identifiants.ts'
import { fermerRecherche, rechercheOuverte } from './palette.ts'
import RechercheResultats from './RechercheResultats.vue'
import { useRecherche } from './useRecherche.ts'
import { useRechercheModale } from './useRechercheModale.ts'

const { t } = useLangue()
const champ = ref<HTMLInputElement | null>(null)
const fenetre = ref<HTMLElement | null>(null)
const { saisie, requete, toutesLesClasses, position, classesTexte, groupes, lignes, masques, aRequete, annonce, aller, choisir, choisirActive } = useRecherche()
const { surClavier } = useRechercheModale(champ, fenetre)
</script>

<style scoped>
.fond { position: fixed; inset: 0; z-index: 90; background: rgba(20, 30, 50, .55); display: flex; justify-content: center; align-items: flex-start; padding: 10vh 1rem 1rem; }
.fenetre { background: white; border-radius: 16px; box-shadow: 0 20px 60px rgba(0, 0, 0, .4); width: 100%; max-width: 660px; max-height: 80vh; display: flex; flex-direction: column; overflow: hidden; }
.tete { display: flex; gap: .5rem; align-items: center; padding: .6rem 1rem; border-bottom: 1px solid var(--gris-brd); }
.tete:focus-within { box-shadow: inset 0 -3px 0 var(--bleu-fort); }
.tete input { flex: 1; min-width: 0; min-height: 44px; border: none; font: inherit; font-size: 1.1rem; background: transparent; color: var(--texte); }
.tete input:focus-visible { outline: none; }
.fermer { flex: none; width: 44px; height: 44px; border: none; border-radius: 50%; background: var(--gris-bg); font-weight: 900; color: var(--texte); cursor: pointer; }
.contexte { display: flex; flex-wrap: wrap; gap: .4rem .6rem; align-items: center; padding: .5rem 1rem; background: var(--gris-bg); font-size: .85rem; border-bottom: 1px solid var(--gris-brd); }
.contexte .level-btn { min-height: 44px; }
.doux { color: var(--texte-doux); }
.vide { padding: 1.2rem 1rem; color: var(--texte); display: flex; flex-direction: column; align-items: flex-start; gap: .7rem; }
.pied { border-top: 1px solid var(--gris-brd); padding: .4rem 1rem; font-size: .8rem; color: var(--texte-doux); display: flex; gap: .3rem 1rem; flex-wrap: wrap; }
/* téléphone : plein écran */
@media (max-width: 600px) {
  .fond { padding: 0; background: white; }
  .fenetre { max-width: none; max-height: none; height: 100%; border-radius: 0; box-shadow: none; }
  .pied { display: none; }
}
</style>

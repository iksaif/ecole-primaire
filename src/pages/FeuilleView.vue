<template>
  <!-- La feuille d'une fiche : /telechargements/<slug>. Fil d'Ariane, aperçu des pages, Télécharger / Imprimer, la même fiche dans les
       autres langues, Personnaliser, compétences, fiches voisines. Dit la même chose que sa page statique (scripts/build/statique/). -->
  <div class="container">
    <h1 v-if="feuille.etat.etat === 'absent' || feuille.etat.etat === 'erreur'" class="titre-etat">{{ t('feuille.titre') }}</h1>
    <p v-if="feuille.etat.etat === 'chargement'" class="message" role="status">{{ t('feuille.chargement') }}</p>

    <div v-else-if="feuille.etat.etat === 'absent'" class="message" role="alert">
      <p>{{ t('feuille.introuvable') }}</p>
      <RouterLink class="btn btn-ghost" to="/telechargements">{{ t('feuille.voirToutes') }}</RouterLink>
    </div>

    <div v-else-if="feuille.etat.etat === 'erreur'" class="message" role="alert">
      <p>{{ t('feuille.erreur', { message: feuille.etat.message }) }}</p>
      <RouterLink class="btn btn-ghost" to="/telechargements">{{ t('feuille.voirToutes') }}</RouterLink>
    </div>

    <template v-else-if="feuille.entree">
      <FilAriane :maillons="maillons" :etiquette="t('feuille.fil')" />
      <div class="feuille">
        <FeuilleApercu :feuille="feuille" />
        <div class="panneau">
          <FeuilleEntete :feuille="feuille" />
          <FeuilleActions :feuille="feuille" />
          <FeuilleLiens :feuille="feuille" />
          <FeuilleCompetences :feuille="feuille" />
        </div>
      </div>
      <FeuilleVoisines :feuille="feuille" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useLangue } from '../langues/useLangue.ts'
import { useNonIndexable } from '../router/useNonIndexable.ts'
import { useTitreDePage } from '../router/titres.ts'
import { cheminFiches, cheminMatiere } from '../telechargements/pages.ts'
import { langueDuTexte, texteDe } from '../telechargements/recherche.ts'
import { useFeuille } from '../telechargements/useFeuille.ts'
import FeuilleActions from './FeuilleActions.vue'
import FeuilleApercu from './FeuilleApercu.vue'
import FeuilleCompetences from './FeuilleCompetences.vue'
import FeuilleEntete from './FeuilleEntete.vue'
import FeuilleLiens from './FeuilleLiens.vue'
import FeuilleVoisines from './FeuilleVoisines.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import FilAriane from '../shell/FilAriane.vue'

const { t, langueAffichee } = useLangue()
const route = useRoute()
const feuille = useFeuille(() => String(route.params.slug ?? ''))

const nomMatiere = computed(() => (feuille.matiere ? t(`fichesPretes.matieres.${feuille.matiere}`) : ''))
const maillons = computed(() => {
  const e = feuille.entree
  if (!e) return []
  const matiere = feuille.matiere
  return [
    { texte: t('feuille.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
    ...(matiere ? [{ texte: nomMatiere.value, vers: cheminMatiere(matiere) ?? undefined, matiere }] : []),
    { texte: t('feuille.fichesPretes'), vers: (matiere ? cheminFiches(matiere) : null) ?? '/telechargements', emoji: EMOJI_BARRE.fichesPretes },
    { texte: texteDe(e.titre, langueAffichee.value), langue: langueDuTexte(e.titre, langueAffichee.value) },
  ]
})
useNonIndexable(() => feuille.etat.etat === 'absent')
// titre du document : le titre de la fiche (src/router/titres.ts)
useTitreDePage(() => (feuille.entree ? texteDe(feuille.entree.titre, langueAffichee.value) : ''))
</script>

<style scoped>
.titre-etat { font-size: 1.6rem; font-weight: 900; margin-top: 1.5rem; }
.message { color: var(--texte-doux); margin: 2rem 0; display: flex; flex-direction: column; gap: .75rem; align-items: flex-start; }
.feuille { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 1.6rem; align-items: start; }
.panneau { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
@media (max-width: 820px) { .feuille { grid-template-columns: 1fr; } }
</style>

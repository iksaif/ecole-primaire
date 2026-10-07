<!--
  La page d'une affiche au format « définition » (src/affiches/). Le formulaire générique est le même pour toutes les affiches du
  registre. Sans `affiche` (ou inconnue) : la première du registre.

  L'adresse suit le formulaire : elle se partage telle quelle (« Copier le lien ») et, ouverte ailleurs, redonne la même affiche.
  Elle porte l'affiche, la variante, puis seulement ce qui s'écarte des défauts de la variante, une clé par réglage, dans cet ordre :
    /imprimer/affiches?affiche=nombres&variante=cent&langues=fr,br&format=A3&orientation=landscape
                      &sections=cent,perso&de=41&a=47&pas=2&police=Luciole&titre=Notre+classe
    - `affiche`, `variante` : toujours ;
    - `langues` : langues de la feuille, séparées par des virgules (`langue` est aussi lu) ; `format` (A4, A3) ; `orientation` (portrait, landscape) ;
    - un réglage de la définition sous son nom : choix unique `cle=valeur` (true/false, nombre ou texte), choix multiple
      `cle=a,b,c`, champ texte ou nombre `cle=…` (catalogue.ts : `CLES_DE_LA_FEUILLE`, aucun réglage ne porte ces noms) ;
    - `police` (mode unique) ou `police.script`, `police.attache` (mode par type) : seulement une police LIVRÉE (Andika, Luciole,
      OpenDyslexic, Playwrite FR Trad) ; une police de l'ordinateur ou ajoutée depuis un fichier ne passe pas (défaut chez l'autre) ;
    - `titre` : titre personnalisé ; `graine` : affiche à hasard seulement.
  Écrite par queryDeReglages, relue par lireLien (catalogue.ts) et validée par reglagesDe : une valeur invalide est ignorée. Ce
  que porte l'adresse l'emporte sur les réglages mémorisés ; avec une variante (lien partagé, « Personnaliser » d'une fiche toute
  prête), seules les polices mémorisées sont gardées, pour les types que l'adresse ne fixe pas.
-->
<template>
  <div class="container" data-page="affiche">
    <template v-if="courant">
      <div class="entete">
        <h1 class="section-heading">{{ titre }}</h1>
        <button type="button" class="btn btn-ghost copier" @click="copierLien">🔗 {{ copie ? t('formulaireAffiche.lienCopie') : t('formulaireAffiche.copierLien') }}</button>
      </div>
      <FormulaireAffiche :key="cleFormulaire" :module="courant" :depart="depart" @reglages="ecrireAdresse" />
    </template>
    <p v-else>{{ t('routeur.introuvable.message') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FormulaireAffiche from '../affiches/FormulaireAffiche.vue'
import { REGISTRE } from '../affiches/index.ts'
import { lireLien, queryDeReglages } from '../affiches/catalogue.ts'
import { traducteurAffiche } from '../affiches/textes.ts'
import { useTitreDePage } from '../router/titres.ts'
import { useLangue } from '../langues/useLangue.ts'

const { t, langue } = useLangue()
const route = useRoute()
const courant = computed(() => REGISTRE.find(a => a.definition.id === route.query.affiche) ?? REGISTRE[0])
const router = useRouter()
const depart = computed(() => lireLien(route.query, courant.value?.definition))

// L'adresse suit le formulaire. Une adresse écrite par le formulaire ne le recrée pas (il garde ses autres réglages) ; une adresse venue
// d'ailleurs (lien « Personnaliser », retour en arrière) le recrée sur ces réglages.
const serialiser = (q: Record<string, unknown>): string => JSON.stringify(Object.entries(q).filter(([, v]) => v !== undefined).sort())
let ecriteParLeFormulaire = ''
const versionDepart = ref(0)
watch(() => route.query, q => { if (serialiser(q) !== ecriteParLeFormulaire) versionDepart.value++ })
const cleFormulaire = computed(() => `${courant.value?.definition.id}:${versionDepart.value}`)
function ecrireAdresse(config: Readonly<Record<string, unknown>>): void {
  if (!courant.value) return
  const query = queryDeReglages(courant.value.definition, config)
  if (serialiser(query) === serialiser(route.query)) return
  ecriteParLeFormulaire = serialiser(query)
  void router.replace({ query })
}

// « Copier le lien » : l'adresse de la page, telle que le formulaire l'a écrite
const copie = ref(false)
async function copierLien(): Promise<void> {
  try {
    await navigator.clipboard.writeText(window.location.href)
    copie.value = true
    setTimeout(() => { copie.value = false }, 2000)
  } catch { /* presse-papiers refusé : l'adresse reste dans la barre du navigateur */ }
}
// le titre de l'affiche, dans la langue de l'interface (français si elle n'a pas la traduction)
const titre = computed(() => (courant.value ? traducteurAffiche(courant.value.textes, langue.value)('titre') : ''))
useTitreDePage(() => titre.value)
</script>

<style scoped>
.entete { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.copier { font-size: .9rem; }
</style>

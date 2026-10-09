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
      <div class="etroit"><FilAriane :maillons="maillons" :etiquette="t('matiere.fil')" /></div>
      <div class="entete etroit">
        <h1 class="titre"><span class="emoji" aria-hidden="true">{{ emoji }}</span> {{ titre }}</h1>
        <button type="button" class="btn btn-ghost copier" @click="copierLien"><span aria-hidden="true">🔗</span> {{ copie ? t('formulaireAffiche.lienCopie') : t('formulaireAffiche.copierLien') }}</button>
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
import { domaineDe } from '../data/programme.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import { EMOJI_MATIERE } from '../ressources/composants/presentation.ts'
import FilAriane from '../shell/FilAriane.vue'
import { EMOJI_BARRE } from '../shell/emojis.ts'
import { cheminMatiere } from '../telechargements/pages.ts'
import { NOM_COURT } from './matieres.ts'
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
// l'icône de l'affiche (celle de sa définition, sinon celle de son domaine) et le fil d'Ariane : Accueil › la matière › l'affiche
const emoji = computed(() => courant.value?.definition.emoji ?? (courant.value ? EMOJI_DOMAINE[courant.value.definition.domaine] : ''))
const matiere = computed(() => (courant.value ? domaineDe(courant.value.definition.domaine)?.matiere ?? null : null))
const maillons = computed(() => [
  { texte: t('matiere.accueil'), vers: '/', emoji: EMOJI_BARRE.accueil },
  ...(matiere.value && matiere.value in NOM_COURT ? [{ texte: t(NOM_COURT[matiere.value as keyof typeof NOM_COURT]), vers: cheminMatiere(matiere.value) ?? undefined, emoji: EMOJI_MATIERE[matiere.value] }] : []),
  { texte: titre.value, emoji: emoji.value },
])
</script>

<style scoped>
/* l'en-tête a la largeur du formulaire (960 px, centré) : mêmes bords à gauche et à droite */
.etroit { max-width: 960px; margin-left: auto; margin-right: auto; }
.entete { display: flex; align-items: center; justify-content: space-between; gap: .75rem 1rem; flex-wrap: wrap; margin-bottom: 1.1rem; }
.titre { display: flex; align-items: center; gap: .6rem; font-size: 1.9rem; font-weight: 900; line-height: 1.2; margin: 0; }
.titre .emoji { font-size: 1.9rem; line-height: 1; }
.copier { font-size: .9rem; min-height: 44px; }
</style>

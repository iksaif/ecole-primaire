<!--
  La page d'une affiche au format « définition » (src/affiches/) : `/imprimer/affiches?affiche=<id>&variante=<v>&langues=fr,br&format=A3&orientation=landscape`.
  Le formulaire générique est le même pour toutes les affiches du registre ; ce que porte l'adresse (variante, langues, format, sens)
  l'emporte sur les réglages mémorisés (lien « Personnaliser » d'une fiche toute prête). Sans `affiche` (ou inconnue) : la première du
  registre. L'adresse suit le formulaire (variante, langues, format, sens) : elle se partage telle quelle (« Copier le lien »).
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
const depart = computed(() => lireLien(route.query))

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

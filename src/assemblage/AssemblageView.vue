<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="fiches" /> {{ t('assemblage.titre') }}</h1>
    <p class="intro">{{ t('assemblage.intro') }}</p>

    <CadreExercice fiche-seule mode="imprimer" :fiche="fiche" :police="true" @regenerer="nouvelle">
      <div class="config-section" role="group" :aria-labelledby="`${id}-classe`">
        <div :id="`${id}-classe`" class="config-section-title">{{ t('fichesPretes.classe') }}</div>
        <div class="btn-group">
          <button v-for="n in NIVEAUX" :key="n" type="button" class="level-btn" :class="{ active: choix.niveau === n }" :aria-pressed="choix.niveau === n"
            :data-valeur="n" @click="choix.niveau = n">{{ n.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section" role="group" :aria-labelledby="`${id}-exercices`" data-reglage="exercices">
        <div :id="`${id}-exercices`" class="config-section-title">{{ t('assemblage.exercices') }}</div>
        <p v-if="!disponibles.length" class="note">{{ t('assemblage.aucunPourLaClasse') }}</p>
        <div class="btn-group">
          <button v-for="m in disponibles" :key="m.definition.id" type="button" class="level-btn" :class="{ active: choisi(m) }" :aria-pressed="choisi(m)"
            :data-valeur="m.definition.id" @click="basculer(m)">{{ titreDe(m) }}</button>
        </div>
        <p v-if="!retenus.length && disponibles.length" class="note">{{ t('assemblage.aucun') }}</p>
        <p v-if="refuses.length" class="note">{{ t('assemblage.nonAssemblables', { noms: refuses.join(', ') }) }}</p>
      </div>
    </CadreExercice>
  </div>
</template>

<script setup lang="ts">
// La fiche sur mesure (extension « assemblage ») : les fiches de plusieurs exercices sur une seule feuille. Chaque exercice garde les réglages par défaut de la classe ;
// l'assemblage (une ligne Prénom / Date, un corrigé, du CSS limité à chaque bloc) est dans src/impression/assemblage.ts, le fragment d'une fiche dans src/exercices/fragment.ts.
import { computed, ref, useId, watch } from 'vue'
import Icone from '../images/Icone.vue'
import { useLangue } from '../langues/useLangue.ts'
import CadreExercice from '../noyau/CadreExercice.vue'
import { useGraine } from '../noyau/useGraine.ts'
import { usePoliceFiche } from '../noyau/polices.ts'
import { langueContenuDe } from '../noyau/reglages.ts'
import { contextesDeFiche } from '../extensions/contexte.ts'
import { ressourceMontree } from '../extensions/activation.ts'
import { assemblerFiches } from '../impression/assemblage.ts'
import { estAssemblable, fragmentDeExercice } from '../exercices/fragment.ts'
import { NIVEAUX } from '../data/classes.ts'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import type { ModuleQuelconque } from '../exercices/index.ts'
import type { Bloc } from '../impression/assemblage.ts'

const id = useId()
const { t, langue } = useLangue()
const { graine, nouvelle } = useGraine()
const police = usePoliceFiche()

// le registre est un chunk à part (src/router/index.ts) : chargé à l'ouverture de la page
const modules = ref<ModuleQuelconque[]>([])
void import('../exercices/index.ts').then(({ REGISTRE }) => { modules.value = REGISTRE.filter(estAssemblable) })

// ce qu'on a choisi, mémorisé sur l'appareil : la classe et les exercices (dans l'ordre du registre)
const choix = ref(chargerReglages('assemblage', { niveau: 'ce1', ids: [] as string[] }))
watch(choix, v => sauvegarder('assemblage', v), { deep: true })

const disponibles = computed(() => modules.value.filter(m => (m.definition.niveaux as Record<string, unknown>)[choix.value.niveau] && ressourceMontree(`exercice:${m.definition.id}`)))
const choisi = (m: ModuleQuelconque): boolean => choix.value.ids.includes(m.definition.id)
function basculer(m: ModuleQuelconque): void {
  const ids = choix.value.ids
  choix.value.ids = ids.includes(m.definition.id) ? ids.filter(i => i !== m.definition.id) : [...ids, m.definition.id]
}
const retenus = computed(() => disponibles.value.filter(choisi))

/** Le titre d'un exercice : son texte d'interface (la section porte l'identifiant en camelCase). */
const titreDe = (m: ModuleQuelconque): string => {
  const section = m.definition.id.replace(/-(\w)/g, (_: string, c: string) => c.toUpperCase())
  return (t as (cle: string) => string)(`${section}.titre`)
}

// les fragments, un par exercice choisi ; un exercice dont la fiche ne se rend pas ici (mesure du navigateur, par exemple) est signalé
const rendu = computed(() => {
  const blocs: Bloc[] = []
  const refuses: string[] = []
  for (const m of retenus.value) {
    try {
      const fragment = fragmentDeExercice(m, { niveau: choix.value.niveau, graine: graine.value, langue: langueContenuDe(m.definition, langue.value), extensions: contextesDeFiche() })
      blocs.push({ titre: titreDe(m), fragment })
    } catch {
      refuses.push(titreDe(m))
    }
  }
  return { blocs, refuses }
})
const refuses = computed(() => rendu.value.refuses)
const fiche = computed(() => (rendu.value.blocs.length
  ? assemblerFiches({ titre: t('assemblage.titreFiche'), langue: langue.value, blocs: rendu.value.blocs, corrige: t('communs.corrige'), ...police.value })
  : ''))
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; max-width: 60rem; }
.note { font-size: .9rem; color: var(--texte-doux); margin: .4rem 0 0; }
</style>

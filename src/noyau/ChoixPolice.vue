<!--
  Choix de la police des fiches d'exercice (« Sur la fiche ») : une liste native à groupes (<select> + <optgroup>), chaque
  police aperçue dans sa propre police (Chrome, Firefox) et un exemple de texte à côté :
    « Nos polices » (incluses, puis les polices scolaires suggérées : installées = sélectionnables, sinon grisées « non
    installée »), « Installées sur cet ordinateur » (nom saisi ou liste du système), « Ajoutées depuis un fichier ».
  Sous la liste : l'aide pour en obtenir d'autres (AjoutPolice, seulement pour ce qui manque) et, pour une police de
  l'ordinateur, la note qu'elle n'est pas embarquée dans la fiche. Le choix est mémorisé (polices.ts), lu par usePoliceFiche.
  Sans propriété : le choix commun des fiches. Pour une affiche à polices par type : v-model (la valeur à la place du
  choix commun), `type` ('script' ou 'attache'), `libelle` (nom du choix) et `aide` (false : pas de seconde aide).
  Textes : section `cadre`. Accessibilité : le <select> est relié à son libellé (for/id), clavier et lecteurs d'écran natifs.
-->
<template>
  <div class="choix-police">
    <div class="ligne">
      <label class="lib" :for="idSelect">{{ libelle || t('cadre.police') }}</label>
      <select :id="idSelect" :value="valeur" class="select" @change="valeur = ($event.target as HTMLSelectElement).value">
        <optgroup v-for="g in groupesAffiches" :key="g.titre" :label="g.titre">
          <option v-for="e in g.entrees" :key="e.id" :value="e.id" :disabled="e.etat === 'manquante'" :style="aperu(e)">{{ libelleDe(e) }}</option>
        </optgroup>
      </select>
      <span class="exemple" aria-hidden="true" :style="{ fontFamily: `'${valeur}'` }">{{ t(props.type === 'attache' ? 'cadre.exempleAttache' : 'cadre.exempleScript') }}</span>
      <button v-if="estPerso" type="button" class="btn-suppr" :title="t('cadre.retirer')" :aria-label="t('cadre.retirer')" @click="supprimerPolicePerso(valeur)">🗑</button>
    </div>
    <p v-if="!estEmbarquee(choisie)" class="note">{{ t('cadre.noteSysteme') }}</p>
    <AjoutPolice v-if="aide && pret" :type="props.type ?? 'script'" :manquantes="groupes.manquantes" @choisir="valeur = $event" />
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import AjoutPolice from './AjoutPolice.vue'
import { usePolices, groupesDe, memoriserSysteme } from './polices.ts'
import { estEmbarquee } from './groupesPolices.ts'
import type { EntreePolice } from './groupesPolices.ts'
import type { TypePolice } from '../utils/impression.js'
import { supprimerPolicePerso, policesPerso } from '../utils/impression.js'
import { useLangue } from '../langues/useLangue.ts'
import type { CleTexte } from '../langues/traduire.ts'

type CleCadre = Exclude<Extract<CleTexte, `cadre.${string}`>, 'cadre.toutesTrouvees' | 'cadre.nomTrouvee' | 'cadre.nomIntrouvable'>

const props = withDefaults(defineProps<{ type?: TypePolice, modelValue?: string, libelle?: string, aide?: boolean }>(), { type: undefined, modelValue: undefined, libelle: '', aide: true })
const emit = defineEmits<{ 'update:modelValue': [police: string] }>()
const { choix, pret } = usePolices()
const { t } = useLangue()
// sans type : le choix des fiches, toutes les polices connues (script et attaché)
const groupes = groupesDe(props.type ?? 'tous')
const idSelect = useId()
// la police choisie : celle du parent (v-model), sinon le choix commun des fiches
const valeur = computed({
  get: () => props.modelValue ?? choix.value.unique,
  set: (v: string) => {
    // une police de l'ordinateur choisie dans la liste est mémorisée (relue et revérifiée au prochain chargement)
    if (groupes.value.installees.some(e => e.id === v)) memoriserSysteme([v])
    if (props.modelValue === undefined) choix.value.unique = v; else emit('update:modelValue', v)
  },
})
const tous = computed(() => [...groupes.value.favorites, ...groupes.value.installees, ...groupes.value.ajoutees])
const choisie = computed(() => tous.value.find(e => e.id === valeur.value))
const estPerso = computed(() => policesPerso.value.some(p => p.id === valeur.value))
const groupesAffiches = computed(() => [
  { titre: t('cadre.groupeNotres'), entrees: groupes.value.favorites },
  { titre: t('cadre.groupeInstallees'), entrees: groupes.value.installees },
  { titre: t('cadre.groupeAjoutees'), entrees: groupes.value.ajoutees },
].filter(g => g.entrees.length))

// Textes des polices incluses, écrits en français dans src/utils/impression.js : clé du catalogue par id
const INCLUSES: Record<string, CleCadre> = {
  'Playwrite FR Trad': 'cadre.policeAttache', Andika: 'cadre.policeAndika', Luciole: 'cadre.policeLuciole', OpenDyslexic: 'cadre.policeOpenDyslexic',
}
function libelleDe(e: EntreePolice): string {
  if (e.etat === 'incluse') { const cle = INCLUSES[e.id]; return cle ? t(cle) : e.label }
  if (e.etat === 'installee') return `${e.label} (${t('cadre.installee')})`
  if (e.etat === 'manquante') return `${e.label} (${t('cadre.nonInstallee')})`
  return e.label
}
// chaque police aperçue dans sa propre police ; une police absente n'a rien à montrer
const aperu = (e: EntreePolice) => (e.etat === 'manquante' ? undefined : { fontFamily: `'${e.id}'` })
</script>

<style scoped>
.ligne { display: flex; align-items: center; gap: .5rem .75rem; flex-wrap: wrap; margin-bottom: .5rem; }
.lib { font-weight: 700; min-width: 4.5rem; }
.select {
  flex: 1; min-width: min(100%, 200px); font: inherit; min-height: 44px; padding: .45rem .6rem;
  border: 2px solid var(--gris-brd); border-radius: 8px; background: white;
}
.exemple { font-size: 1.6rem; min-width: 9rem; line-height: 1.6; }
.btn-suppr { border: none; background: none; cursor: pointer; font-size: 1.1rem; min-width: 44px; min-height: 44px; }
.note { margin: 0 0 .5rem; font-size: .85rem; color: var(--texte-doux); }
</style>

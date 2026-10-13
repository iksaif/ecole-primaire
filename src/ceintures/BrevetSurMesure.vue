<template>
  <div class="container">
    <h1 class="section-heading"><Icone nom="trophee" /> {{ t('ceintures.surMesure.titre') }}</h1>
    <p class="intro">{{ t('ceintures.surMesure.intro') }}</p>

    <CadreExercice fiche-seule mode="imprimer" :fiche="fiche" :police="true" :extensions="['ceintures']" @regenerer="nouvelle">
      <div class="config-section" role="group" :aria-labelledby="`${id}-classe`" data-reglage="niveau">
        <div :id="`${id}-classe`" class="config-section-title">{{ t('fichesPretes.classe') }}</div>
        <div class="btn-group">
          <button v-for="n in NIVEAUX" :key="n" type="button" class="level-btn" :class="{ active: choix.niveau === n }" :aria-pressed="choix.niveau === n" :data-valeur="n"
            @click="choix.niveau = n">{{ n.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section" role="group" :aria-labelledby="`${id}-exercices`" data-reglage="exercices">
        <div :id="`${id}-exercices`" class="config-section-title">{{ t('ceintures.surMesure.exercices') }}</div>
        <p v-if="!capables.length" class="note">{{ t('assemblage.aucunPourLaClasse') }}</p>
        <div class="btn-group">
          <button v-for="m in capables" :key="m.definition.id" type="button" class="level-btn" :class="{ active: choisi(m) }" :aria-pressed="choisi(m)" :data-valeur="m.definition.id"
            @click="basculer(m)">{{ titreDe(m) }}</button>
        </div>
        <p v-if="!retenus.length && capables.length" class="note">{{ t('ceintures.surMesure.aucun') }}</p>
      </div>

      <div class="config-section" role="group" :aria-labelledby="`${id}-ceinture`" data-reglage="ceinture">
        <div :id="`${id}-ceinture`" class="config-section-title">{{ t('ceintures.choixCeinture') }}</div>
        <div class="btn-group">
          <button v-for="k in nbCeintures" :key="k" type="button" class="level-btn" :class="{ active: indice === k - 1 }" :aria-pressed="indice === k - 1" :data-valeur="k"
            @click="choix.ceinture = k">{{ k }} <PastilleCeinture :indice="k - 1" /></button>
        </div>
      </div>

      <div class="config-section">
        <label :for="`${id}-titre`" class="config-section-title">{{ t('ceintures.surMesure.titreBrevet') }}</label>
        <input :id="`${id}-titre`" v-model="choix.titre" type="text" class="zone-texte" maxlength="60" :placeholder="t('ceintures.surMesure.titreAuto')">
      </div>
    </CadreExercice>
  </div>
</template>

<script setup lang="ts">
// Le brevet sur mesure (extension « ceintures ») : on choisit la classe et des exercices, et le brevet réunit leurs fiches sous un en-tête de ceinture, avec un cadre de résultat et un corrigé
// (src/ceintures/brevet.ts : une piste construite à la main, une ceinture = les blocs choisis). Le total des questions, le seuil et les couleurs sont les réglages communs des ceintures.
import { computed, ref, useId, watch } from 'vue'
import Icone from '../images/Icone.vue'
import { useLangue } from '../langues/useLangue.ts'
import CadreExercice from '../noyau/CadreExercice.vue'
import { useGraine } from '../noyau/useGraine.ts'
import { usePoliceFiche } from '../noyau/polices.ts'
import { langueContenuDe } from '../noyau/reglages.ts'
import { contextesDeFiche } from '../extensions/contexte.ts'
import { chargerReglages, sauvegarder } from '../utils/index.js'
import { NIVEAUX } from '../data/classes.ts'
import PastilleCeinture from './PastilleCeinture.vue'
import { brevetPapier, brevetPossible } from './brevet.ts'
import { reglagesCeintures } from './extension.ts'
import { nbCeinturesDe } from './reglages.ts'
import type { Piste } from './pistes.ts'
import type { Classe } from '../data/classes.ts'
import type { ModuleQuelconque } from '../exercices/index.ts'

const id = useId()
const { t, langue } = useLangue()
const { graine, nouvelle } = useGraine()
const police = usePoliceFiche()

// le registre est un chunk à part (src/router/index.ts) : chargé à l'ouverture de la page
const registre = ref<readonly ModuleQuelconque[]>([])
void import('../exercices/index.ts').then(({ REGISTRE }) => { registre.value = REGISTRE })

// ce qu'on a choisi, mémorisé sur l'appareil : la classe, la ceinture, les exercices (dans l'ordre du registre) et le titre
const choix = ref(chargerReglages('ceintures_sur_mesure', { niveau: 'ce2', ceinture: 1, ids: [] as string[], titre: '' as string }))
watch(choix, v => sauvegarder('ceintures_sur_mesure', v), { deep: true })
const niveau = computed(() => (NIVEAUX as readonly string[]).includes(choix.value.niveau) ? choix.value.niveau as Classe : 'ce2')

// les exercices qui peuvent faire un bloc de brevet dans cette classe (leur fiche se rend, avec des questions que l'on peut compter et couper)
const capables = computed(() => registre.value.filter(m => !(m as { exemple?: boolean }).exemple && brevetPossible(m, niveau.value)))
const choisi = (m: ModuleQuelconque): boolean => choix.value.ids.includes(m.definition.id)
const basculer = (m: ModuleQuelconque): void => {
  const ids = choix.value.ids
  choix.value.ids = ids.includes(m.definition.id) ? ids.filter(i => i !== m.definition.id) : [...ids, m.definition.id]
}
const retenus = computed(() => capables.value.filter(choisi))
/** Le titre d'un exercice : son texte d'interface (la section porte l'identifiant en camelCase). */
const titreDe = (m: ModuleQuelconque): string => (t as (cle: string) => string)(`${m.definition.id.replace(/-(\w)/g, (_: string, c: string) => c.toUpperCase())}.titre`)

// les ceintures montrées : le nombre choisi dans les réglages communs et les couleurs de la palette
const nbCeintures = computed(() => nbCeinturesDe(reglagesCeintures(contextesDeFiche()), 8))
const indice = computed(() => Math.min(Math.max(choix.value.ceinture, 1), nbCeintures.value) - 1)

const fiche = computed(() => {
  if (!retenus.value.length) return ''
  const blocs = retenus.value.map(m => ({ exercice: m.definition.id }))
  const piste: Piste = { id: 'sur-mesure', titre: choix.value.titre.trim() || t('ceintures.surMesure.titreAuto'), ceintures: Array.from({ length: 8 }, () => ({ blocs })) }
  const extensions = contextesDeFiche()
  try {
    return brevetPapier({
      modules: registre.value, piste, indice: indice.value, niveau: niveau.value, graine: graine.value, langue: langueContenuDe(retenus.value[0].definition, langue.value),
      ceintures: reglagesCeintures(extensions), extensions, ...police.value,
    })
  } catch {
    return ''   // un exercice dont la fiche ne se rend pas ici : pas de feuille plutôt qu'une page cassée
  }
})
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: 0 0 1rem; max-width: 60rem; }
.note { font-size: .9rem; color: var(--texte-doux); margin: .4rem 0 0; }
.zone-texte { width: 100%; max-width: 40rem; font: inherit; padding: .4rem .6rem; border: 1.5px solid var(--gris-brd, #ccc); border-radius: 8px; }
</style>

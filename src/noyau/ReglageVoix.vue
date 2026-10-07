<!--
  Réglage de la voix (page des réglages, section « Voix ») : pour chaque langue qui a une voix (registre des langues), la
  voix choisie (« Automatique » par défaut : règle de voix.ts), la vitesse (facteur commun à toutes les lectures) et un
  bouton « Écouter un exemple ». Mémorisé par useTTS (clé `ep_voix`), appliqué partout où le site lit à voix haute.
  Une voix en ligne choisie : note qui dit que le navigateur envoie le texte à son éditeur. Langues sans voix : nommées,
  leurs textes restent écrits. Textes : section `reglages.voix`. Accessibilité : chaque <select> et le curseur ont un libellé.
-->
<template>
  <div class="reglage-voix">
    <p v-if="!syntheseDisponible" class="note">{{ t('reglages.voix.sansSynthese') }}</p>
    <template v-else>
      <div v-for="l in languesParlees" :key="l.code" class="langue">
        <label class="lib" :for="`voix-${l.code}`">{{ t('reglages.voix.voixPour', { langue: nomDeLangue(l.code, langue) }) }}</label>
        <div class="ligne">
          <select :id="`voix-${l.code}`" class="select" :value="preferences.voix[l.code] ?? ''" @change="choisir(l.code, ($event.target as HTMLSelectElement).value)">
            <option value="">{{ libelleAutomatique(l.code) }}</option>
            <optgroup v-for="g in groupesDe(l.code)" :key="g.titre" :label="g.titre">
              <option v-for="v in g.voix" :key="idVoix(v)" :value="idVoix(v)">{{ libelleVoix(v) }}</option>
            </optgroup>
          </select>
          <button type="button" class="btn btn-ghost" :disabled="!peutParler(l.code)" @click="ecouter(l.code)">{{ t('reglages.voix.ecouter') }}</button>
        </div>
        <p v-if="voixDe(l.code).length === 0 && voixChargees" class="note">{{ t('reglages.voix.aucune') }}</p>
        <p v-if="enLigne(l.code)" class="note avertissement" data-voix-en-ligne>{{ t('reglages.voix.noteEnLigne') }}</p>
      </div>

      <label class="lib" for="voix-vitesse">{{ t('reglages.voix.vitesse') }}</label>
      <div class="ligne vitesse">
        <span class="borne">{{ t('reglages.voix.plusLente') }}</span>
        <input id="voix-vitesse" v-model.number="preferences.vitesse" type="range" :min="VITESSE_MIN" :max="VITESSE_MAX" step="0.1">
        <span class="borne">{{ t('reglages.voix.plusRapide') }}</span>
        <span class="valeur">{{ t('reglages.voix.pourcent', { n: Math.round(preferences.vitesse * 100) }) }}</span>
      </div>

      <p class="note">{{ t('reglages.voix.astuce') }}</p>
    </template>
    <p v-if="languesMuettes.length" class="note">{{ t('reglages.voix.sansVoix', { langues: languesMuettes.join(', ') }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useLangue } from '../langues/useLangue.ts'
import { CODES, langue as definition, nomDeLangue } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import { traduire } from '../langues/traduire.ts'
import { useTTS, usePreferencesVoix, syntheseDisponible, VITESSE_MIN, VITESSE_MAX } from './useTTS.ts'
import { idVoix, voixDeQualite } from './voix.ts'

const { t, langue } = useLangue()
const { preferences, voixDe, voixUtilisee } = usePreferencesVoix()
const { peutParler, parler, arreter } = useTTS()

// langues que le registre sait lire, et celles qui n'ont pas de voix (nommées dans la langue de l'interface)
const languesParlees = CODES.map(definition).filter(d => d.voix.disponible)
const languesMuettes = computed(() => CODES.filter(c => !definition(c).voix.disponible).map(c => nomDeLangue(c, langue.value)))
// le navigateur a-t-il fourni ses voix ? (Chrome les charge en différé : pas de message « aucune voix » trop tôt)
const voixChargees = computed(() => CODES.some(c => voixDe(c).length > 0))

/** « Automatique (recommandé) : Amélie », avec le nom de la voix que la règle choisirait. */
function libelleAutomatique(code: Langue): string {
  const meilleure = voixDe(code)[0]
  if (!meilleure) return t('reglages.voix.automatiqueSeul')
  return t('reglages.voix.automatique', { nom: meilleure.name })
}

/** « Amélie (fr-FR) — meilleure qualité » */
function libelleVoix(v: SpeechSynthesisVoice): string {
  const base = `${v.name} (${v.lang})`
  if (!voixDeQualite(v)) return base
  return `${base} — ${t('reglages.voix.qualite')}`
}

/** Les voix de la langue en deux groupes : sur l'appareil, puis en ligne (groupes vides omis). */
function groupesDe(code: Langue): { titre: string, voix: SpeechSynthesisVoice[] }[] {
  const toutes = voixDe(code)
  const groupes = [
    { titre: t('reglages.voix.surAppareil'), voix: toutes.filter(v => v.localService) },
    { titre: t('reglages.voix.enLigne'), voix: toutes.filter(v => !v.localService) },
  ]
  return groupes.filter(g => g.voix.length > 0)
}

/** La voix qui lira cette langue est-elle en ligne ? */
function enLigne(code: Langue): boolean {
  const v = voixUtilisee(code)
  return v !== null && !v.localService
}

// « Automatique » (valeur vide) efface le choix : la règle reprend la main
function choisir(code: Langue, id: string): void {
  const voix = { ...preferences.value.voix }
  if (id) voix[code] = id
  else delete voix[code]
  preferences.value.voix = voix
}

// la phrase d'exemple est dite dans la langue de la voix, à la vitesse des consignes
function ecouter(code: Langue): void {
  parler(traduire(code, 'reglages.voix.exemple'), code, { vitesse: 0.85 })
}

onUnmounted(arreter)
</script>

<style scoped>
.langue { margin-bottom: 1rem; }
.lib { display: block; font-weight: 600; margin-bottom: .35rem; }
.ligne { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }
.select { flex: 1 1 16rem; min-width: min(100%, 200px); max-width: 100%; font: inherit; min-height: 44px; padding: .45rem .6rem; border: 2px solid var(--gris-brd); border-radius: 8px; background: white; }
.vitesse input { flex: 1 1 10rem; }
.borne { color: var(--texte-doux); font-size: .85rem; }
.valeur { font-weight: 600; min-width: 3.5rem; text-align: right; }
.note { color: var(--texte-doux); font-size: .85rem; margin-top: .5rem; }
.avertissement { color: var(--texte); background: #fff6e0; border-left: 4px solid #f0b429; padding: .4rem .6rem; border-radius: 4px; }
</style>

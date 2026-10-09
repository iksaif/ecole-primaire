<template>
  <div class="container reglages" data-page="reglages">
    <h1>{{ t('reglages.titre') }}</h1>
    <p class="intro">{{ t('reglages.intro') }}</p>

    <!-- Rubriques en onglets (motif WAI-ARIA tablist / tab / tabpanel, flèches et Début / Fin) ; `?onglet=langues|moi|fiches|appareil` ouvre une rubrique -->
    <div class="onglets" role="tablist" :aria-label="t('reglages.onglets.aria')" @keydown="toucheOnglet">
      <button v-for="o in onglets" :key="o" :id="`reglages-onglet-${o}`" ref="boutons" type="button" role="tab" :aria-selected="ongletCourant === o"
        aria-controls="reglages-panneau" :tabindex="ongletCourant === o ? 0 : -1" :class="{ actif: ongletCourant === o }" @click="choisirOnglet(o)">
        {{ t(`reglages.onglets.${o}`) }}
      </button>
    </div>

    <div id="reglages-panneau" class="panneau" role="tabpanel" :aria-labelledby="`reglages-onglet-${ongletCourant}`">
      <template v-if="ongletCourant === 'langues'">
        <section v-if="langues.length > 1" class="bloc">
          <h2>{{ t('reglages.interface.titre') }}</h2>
          <p class="aide">{{ t('reglages.interface.aide') }}</p>
          <div class="choix">
            <button v-for="l in langues" :key="l.code" class="level-btn" :class="{ active: langue === l.code }" :aria-pressed="langue === l.code" @click="langue = l.code">
              <Drapeau :langue="l.code" /> {{ majuscule(l.nomLocal) }}
            </button>
          </div>
        </section>

        <section v-if="regionale.proposees.length" class="bloc">
          <h2><IconeMatiere matiere="regionale" :langue="regionale.proposees[0]?.code" /> {{ t('reglages.langues.titre') }}</h2>
          <p class="aide">{{ t('reglages.langues.aide') }}</p>
          <OptionsLangue />
        </section>

        <!-- fiabilité des traductions : le niveau minimum des fiches en langue régionale (src/langues/confiance.ts) -->
        <section v-if="regionale.proposees.length" class="bloc" data-section="confiance">
          <h2>{{ t('confiance.titre') }}</h2>
          <p class="aide">{{ t('confiance.aide', { langue: nomRegionale }) }}</p>
          <fieldset class="niveaux">
            <legend>{{ t('confiance.minimum') }}</legend>
            <label v-for="n in niveauxDecroissants" :key="n" class="case">
              <input type="radio" name="confiance" :value="n" :checked="confianceMin === n" @change="choisirConfianceMin(n)">
              <JaugeConfiance class="jauge" :niveau="n" /><span><strong>{{ t(`confiance.niveaux.${NOMS_NIVEAU[n]}.nom`) }}</strong><br><small>{{ t(`confiance.niveaux.${NOMS_NIVEAU[n]}.aide`, { langue: nomRegionale }) }}</small></span>
            </label>
          </fieldset>
        </section>

      </template>

      <template v-else-if="ongletCourant === 'moi'">
        <section class="bloc">
          <h2>🎒 {{ t('reglages.classe.titre') }}</h2>
          <p class="aide">{{ t('reglages.classe.aide') }}</p>
          <CadenasClasse v-if="verrouillee" @ouvert="deverrouillerClasse" />
          <ChoixClasses v-else />
        </section>

        <section class="bloc">
          <h2>👤 {{ t('reglages.profil.titre') }}</h2>
          <OptionsProfil />
        </section>

        <!-- le mode enseignant est caché par défaut : une idée en construction, pas encore validée (src/contexte/enseignant.ts) -->
        <section class="bloc" data-section="enseignant">
          <h2>🚧 {{ t('reglages.enseignant.titre') }}</h2>
          <p class="aide">{{ t('reglages.enseignant.aide') }}</p>
          <label class="case"><input type="checkbox" :checked="modeEnseignantActif" :disabled="SITE.enseignantVisible" @change="basculerEnseignant"> {{ t('reglages.enseignant.case') }}</label>
          <p v-if="SITE.enseignantVisible" class="aide">{{ t('reglages.enseignant.parSite') }}</p>
        </section>

      </template>

      <template v-else-if="ongletCourant === 'fiches'">
        <section class="bloc">
          <h2>✏️ {{ t('reglages.police.titre') }}</h2>
          <p class="aide">{{ t('reglages.police.aide') }}</p>
          <ChoixPolice />
        </section>

        <section class="bloc" data-section="voix">
          <h2>🔊 {{ t('reglages.voix.titre') }}</h2>
          <p class="aide">{{ t('reglages.voix.aide') }}</p>
          <ReglageVoix />
        </section>

      </template>

      <template v-else>
        <section class="bloc">
          <h2>🧭 {{ t('assistant.revoir.titre') }}</h2>
          <p class="aide">{{ t('assistant.revoir.aide') }}</p>
          <button type="button" class="btn btn-ghost" @click="revoirAssistant(router)">{{ t('assistant.revoir.bouton') }}</button>
        </section>

        <section class="bloc">
          <h2>🗑️ {{ t('reglages.remise.titre') }}</h2>
          <p class="aide">{{ t('reglages.remise.aide') }}</p>
          <button class="btn btn-danger" @click="toutReinitialiser">{{ t('reglages.remise.bouton') }}</button>
          <p v-if="message" class="succes" role="status">{{ message }}</p>
        </section>

      </template>
    </div>

    <RouterLink to="/" class="btn btn-ghost retour">{{ t('reglages.retour') }}</RouterLink>
  </div>
</template>

<script setup lang="ts">
// Réglages de l'appareil : langue d'interface, mode de langue, classe(s), profil (tous par le contexte, comme la barre), police,
// voix et vitesse de la lecture à voix haute (ReglageVoix, mémorisés par useTTS).
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import ChoixPolice from '../noyau/ChoixPolice.vue'
import ReglageVoix from '../noyau/ReglageVoix.vue'
import { useLangue } from '../langues/useLangue.ts'
import JaugeConfiance from '../ressources/composants/JaugeConfiance.vue'
import { NIVEAUX_CONFIANCE, NOMS_NIVEAU } from '../langues/confiance.ts'
import { choisirConfianceMin, confianceMin } from '../langues/confianceReglage.ts'
import { nomDeLangue } from '../langues/registre.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import CadenasClasse from '../shell/CadenasClasse.vue'
import ChoixClasses from '../shell/ChoixClasses.vue'
import Drapeau from '../shell/Drapeau.vue'
import IconeMatiere from '../shell/IconeMatiere.vue'
import OptionsLangue from '../shell/OptionsLangue.vue'
import OptionsProfil from '../shell/OptionsProfil.vue'
import { revoirAssistant } from '../shell/assistant.ts'
import { changerModeEnseignant, modeEnseignantActif } from '../contexte/enseignant.ts'
import { SITE } from '../sites.ts'

const { t, langue, langues } = useLangue()
const router = useRouter()
const route = useRoute()

// ── les onglets ──
const ONGLETS = ['langues', 'moi', 'fiches', 'appareil'] as const
type Onglet = (typeof ONGLETS)[number]
const estOnglet = (v: unknown): v is Onglet => ONGLETS.includes(v as Onglet)
/** la rubrique « Langues » n'a rien à montrer si le site ne propose ni autre langue d'interface ni langue régionale */
const onglets = computed<readonly Onglet[]>(() => (langues.length > 1 || regionale.proposees.length ? ONGLETS : ONGLETS.filter(o => o !== 'langues')))
const demande = Array.isArray(route.query.onglet) ? route.query.onglet[0] : route.query.onglet
const ongletCourant = ref<Onglet>(estOnglet(demande) && onglets.value.includes(demande) ? demande : onglets.value[0])
const boutons = ref<HTMLButtonElement[]>([])

/** Ouvre une rubrique et l'écrit dans l'adresse (sans pile d'historique), pour la partager ou la retrouver. */
function choisirOnglet(o: Onglet): void {
  ongletCourant.value = o
  void router.replace({ query: { ...route.query, onglet: o } })
}

/** Flèches, Début et Fin passent d'un onglet à l'autre. */
function toucheOnglet(e: KeyboardEvent): void {
  const liste = onglets.value
  const i = liste.indexOf(ongletCourant.value)
  const cibles: Record<string, number> = { ArrowRight: (i + 1) % liste.length, ArrowLeft: (i + liste.length - 1) % liste.length, Home: 0, End: liste.length - 1 }
  const suivant = cibles[e.key]
  if (suivant === undefined) return
  e.preventDefault()
  choisirOnglet(liste[suivant])
  void nextTick(() => boutons.value[suivant]?.focus())
}
const regionale = useLangueRegionale()
const { verrouillee, deverrouillerClasse } = useContexte()
/** les niveaux du plus sûr au moins sûr, comme on les lit dans la page */
const niveauxDecroissants = [...NIVEAUX_CONFIANCE].reverse()
/** le nom de la langue régionale du site, dans la langue affichée */
const nomRegionale = computed(() => nomDeLangue(regionale.proposees[0].code, langue.value))
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** la case « Afficher le mode enseignant » : le réglage de l'appareil (le même que l'adresse spéciale `?enseignant=oui`) */
function basculerEnseignant(e: Event): void {
  changerModeEnseignant((e.target as HTMLInputElement).checked)
}

const message = ref('')
function toutReinitialiser(): void {
  if (!confirm(t('reglages.remise.confirmer'))) return
  // tout ce que l'app mémorise commence par `ep_` (utils/index.js) ; les préférences en mémoire reprennent leurs valeurs par défaut
  const cles = Object.keys(localStorage).filter(k => k.startsWith('ep_'))
  cles.forEach(k => localStorage.removeItem(k))
  message.value = t('reglages.remise.fait', { n: cles.length })
  setTimeout(() => { location.reload() }, 1200)
}
</script>

<style scoped>
.reglages { max-width: 720px; }
h1 { color: var(--bleu-fort); margin-bottom: .25rem; }
.intro { color: var(--texte-doux); margin-bottom: 1.25rem; }
.onglets { display: flex; flex-wrap: wrap; gap: .25rem; background: var(--gris-bg); border-radius: 12px; padding: 4px; margin-bottom: 1.25rem; width: fit-content; max-width: 100%; }
.onglets button { border: 0; background: transparent; border-radius: 9px; padding: .55rem .9rem; min-height: 2.75rem; font: inherit; font-weight: 600; color: var(--texte-doux); cursor: pointer; }
.onglets button:hover { color: var(--texte); }
.onglets button.actif { background: white; color: var(--texte); box-shadow: 0 1px 4px rgba(0, 0, 0, .12); }
.bloc { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
h2 { font-size: 1.1rem; margin-bottom: .25rem; }
.aide { color: var(--texte-doux); font-size: .9rem; margin-bottom: .75rem; }
.choix { display: flex; gap: .5rem; flex-wrap: wrap; }
label.case { display: flex; align-items: center; gap: .5rem; min-height: 2.75rem; font-weight: 600; }
.niveaux { border: 0; padding: 0; margin: 0; display: grid; gap: .5rem; }
.niveaux legend { font-weight: 700; margin-bottom: .5rem; padding: 0; }
.niveaux label.case { align-items: flex-start; border: 2px solid var(--gris-bg); border-radius: 10px; padding: .55rem .8rem; font-weight: 400; cursor: pointer; }
.niveaux label.case:has(input:checked) { border-color: var(--bleu-fort); background: #f3f7ff; }
.niveaux input { margin-top: .3rem; }
.niveaux .jauge { margin-top: .25rem; height: 1.1rem; }
.niveaux small { color: var(--texte-doux); }
.succes { margin-top: .75rem; font-weight: 600; color: var(--vert-texte); }
.retour { display: inline-block; text-decoration: none; margin-top: .5rem; }
</style>

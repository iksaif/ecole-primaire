<template>
  <!-- Visite guidée de la première arrivée (src/shell/assistant.ts) : une fenêtre modale en quelques étapes. Quand une étape
       parle d'un bouton de la barre du haut, ce bouton est entouré d'un halo et la fenêtre devient une bulle qui pointe dessus. -->
  <Teleport to="body">
    <div v-if="ouvert" class="assistant">
      <!-- voile : bloque les clics sur la page ; sombre quand la fenêtre est centrée (sinon c'est le halo qui assombrit) -->
      <div class="voile" :class="{ sombre: !cadre }" aria-hidden="true" />
      <div v-if="cadre" class="halo" :style="styleHalo" aria-hidden="true" />
      <div ref="fenetre" class="fenetre" :class="bulle ? 'bulle' : 'centree'" :style="styleFenetre" role="dialog" aria-modal="true"
        :aria-labelledby="ID_TITRE" data-assistant @keydown="touche">
        <span v-if="bulle" class="pointe" :style="{ left: `${bulle.pointe}px` }" aria-hidden="true" />
        <div class="defilement">
          <button type="button" class="fermer" :aria-label="t('assistant.fermer')" :title="t('assistant.fermer')" @click="fermer">✕</button>
          <p class="progression">{{ t('assistant.etape', { n: index + 1, total: etapes.length }) }}</p>

          <template v-if="etape.id === 'profil'">
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ t('assistant.profil.titre', { nom: SITE.nom }) }}</h2>
            <p>{{ t('assistant.profil.texte') }}</p>
            <!-- un seul profil possible (mode enseignant caché) : pas de question ni de choix, juste « Suivant » -->
            <div v-if="choixDeProfil" role="group" aria-labelledby="assistant-question">
              <p id="assistant-question" class="question">{{ t('assistant.profil.question') }}</p>
              <button v-for="p in profilsAssistant" :key="p" type="button" class="option" :aria-pressed="contexte.profil === p" @click="choisirProfilEtAvancer(p)">
                <span class="icone" aria-hidden="true">{{ EMOJI_PROFIL[p] }}</span>
                <span><strong>{{ t(`shell.profil.${p}`) }}</strong><small>{{ t(`assistant.profil.${p}Desc`) }}</small></span>
              </button>
            </div>
          </template>

          <template v-else-if="etape.id === 'classes'">
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ enseignant ? t('assistant.classes.titreEnseignant') : t('assistant.classes.titreParent') }}</h2>
            <p>{{ enseignant ? t('assistant.classes.texteEnseignant') : t('assistant.classes.texteParent') }}</p>
            <div class="choix-classes"><ChoixClasses /></div>
          </template>

          <template v-else-if="etape.id === 'enfant'">
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ t('assistant.enfant.titre') }}</h2>
            <p>{{ t('assistant.enfant.texte') }}</p>
            <p>{{ t('assistant.enfant.cadenas') }}</p>
          </template>

          <template v-else-if="etape.id === 'langue'">
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ t('assistant.langue.titre', { langue: nomRegionale }) }}</h2>
            <p>{{ t('assistant.langue.texte', { langue: nomRegionale }) }}</p>
            <OptionsLangue />
          </template>

          <template v-else-if="etape.id === 'programme'">
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ t('assistant.programme.titre') }}</h2>
            <p>{{ t('assistant.programme.texte') }}</p>
          </template>

          <template v-else>
            <h2 :id="ID_TITRE" ref="titre" tabindex="-1">{{ t('assistant.fin.titre') }}</h2>
            <p>{{ t('assistant.fin.texte') }}</p>
            <!-- un raccourci vers la suite logique : le Programme pour l'enseignant·e, le mode enfant pour le parent -->
            <button v-if="enseignant" type="button" class="btn btn-ghost" @click="ouvrirProgramme">{{ t('assistant.fin.programme') }}</button>
            <button v-else type="button" class="btn btn-ghost" @click="passerEnModeEnfant">{{ t('assistant.fin.enfant') }}</button>
          </template>

          <p v-if="repere === 'menu'" class="telephone">{{ t('assistant.menu') }}</p>

          <div class="actions">
            <button v-if="etape.id !== 'fin'" type="button" class="passer" @click="fermer">{{ t('assistant.passer') }}</button>
            <!-- « Précédent » et « Suivant » restent côte à côte (au téléphone, ils passent ensemble à la ligne) -->
            <span class="pas">
              <button v-if="index > 0" type="button" class="btn btn-ghost" @click="aller(index - 1)">{{ t('assistant.precedent') }}</button>
              <button v-if="etape.id === 'fin'" type="button" class="btn btn-primary" @click="fermer">{{ t('assistant.fin.commencer') }}</button>
              <button v-else-if="etape.id !== 'profil'" type="button" class="btn btn-primary" @click="aller(index + 1)">{{ t('communs.suivant') }}</button>
              <button v-else-if="!choixDeProfil" type="button" class="btn btn-primary" @click="choisirProfilEtAvancer(profilsAssistant[0])">{{ t('communs.suivant') }}</button>
            </span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// S'ouvre seul à la toute première visite de l'accueil (rien de mémorisé, adresse sans réglage de contexte), ou à la demande
// (« Revoir la visite guidée » : réglages, À propos). Fenêtre modale : le reste du site est inerte, le focus reste dans la
// fenêtre, Échap, ✕ et « Passer » la ferment à tout moment ; une fois fermée, elle est mémorisée comme vue (`ep_assistant_vu`).
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContexte } from '../contexte/useContexte.ts'
import type { Profil } from '../contexte/types.ts'
import { sansContexte } from '../contexte/url.ts'
import { nomDeLangue } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import { focaliserContenu } from '../router/focus.ts'
import { profilsProposes } from '../contexte/regles.ts'
import { modeEnseignantActif } from '../contexte/enseignant.ts'
import { SITE } from '../sites.ts'
import ChoixClasses from './ChoixClasses.vue'
import OptionsLangue from './OptionsLangue.vue'
import { PROFILS_ASSISTANT, assistantDemande, etapesAssistant, marquerAssistantVu, premiereVisite } from './assistant.ts'
import type { Repere } from './assistant.ts'
import { EMOJI_PROFIL } from './emojis.ts'
import { menuOuvert } from './menus.ts'
import { useRepere } from './useRepere.ts'

const ID_TITRE = 'assistant-titre'
const { t, langueAffichee } = useLangue()
const { contexte, choisirProfil } = useContexte()
const { proposees } = useLangueRegionale()
const route = useRoute()
const router = useRouter()

const ouvert = ref(false)
const index = ref(0)
const fenetre = ref<HTMLElement | null>(null)
const titre = ref<HTMLElement | null>(null)
let focusAvant: HTMLElement | null = null

const enseignant = computed(() => contexte.value.profil === 'enseignant')
// l'assistant ne propose « enseignant » que si le mode est actif (idée en construction : src/contexte/enseignant.ts)
const profilsAssistant = computed(() => PROFILS_ASSISTANT.filter(p => profilsProposes(modeEnseignantActif.value).includes(p)))
/** y a-t-il un vrai choix de profil ? (non : le mode enseignant est caché, il ne reste que le parent) */
const choixDeProfil = computed(() => profilsAssistant.value.length > 1)
const etapes = computed(() => etapesAssistant(contexte.value.profil, proposees.length > 0))
const etape = computed(() => etapes.value[Math.min(index.value, etapes.value.length - 1)] ?? { id: 'fin', reperes: [] })
/** la langue régionale du site, nommée dans la langue de l'interface (« breton », « brezhoneg ») */
const nomRegionale = computed(() => {
  const [premiere] = proposees
  return premiere ? nomDeLangue(premiere.code, langueAffichee.value) : ''
})

// ── halo et bulle ──
const reperes = computed<readonly Repere[]>(() => (ouvert.value ? etape.value.reperes : []))
const { repere, cadre, bulle } = useRepere(reperes)
const AUTOUR = 4
const styleHalo = computed(() => {
  const c = cadre.value
  if (!c) return {}
  return { top: `${c.haut - AUTOUR}px`, left: `${c.gauche - AUTOUR}px`, width: `${c.largeur + 2 * AUTOUR}px`, height: `${c.hauteur + 2 * AUTOUR}px` }
})
const styleFenetre = computed(() => {
  const b = bulle.value
  if (!b) return {}
  return { top: `${b.haut}px`, left: `${b.gauche}px`, width: `${b.largeur}px`, maxHeight: `calc(100vh - ${b.haut + 16}px)` }
})

// ── ouvrir, fermer ──
/** Le reste du site (#app) devient inerte : ni clic, ni focus, ni lecteur d'écran (la fenêtre est hors de #app : Teleport). */
const rendreInerte = (inerte: boolean): void => {
  document.getElementById('app')?.toggleAttribute('inert', inerte)
}
const focaliserTitre = async (): Promise<void> => {
  await nextTick()
  titre.value?.focus({ preventScroll: true })
}
async function ouvrir(): Promise<void> {
  focusAvant = document.activeElement instanceof HTMLElement ? document.activeElement : null
  menuOuvert.value = null
  index.value = 0
  ouvert.value = true
  rendreInerte(true)
  await focaliserTitre()
}
function fermer(): void {
  if (!ouvert.value) return
  ouvert.value = false
  rendreInerte(false)
  marquerAssistantVu()
  const retour = focusAvant && focusAvant !== document.body && document.contains(focusAvant) ? focusAvant : null
  if (retour) retour.focus({ preventScroll: true })
  else focaliserContenu()
}
async function aller(i: number): Promise<void> {
  index.value = Math.max(0, Math.min(i, etapes.value.length - 1))
  await focaliserTitre()
}

// ── actions des étapes ──
async function choisirProfilEtAvancer(p: Profil): Promise<void> {
  choisirProfil(p)
  await aller(1)
}
function passerEnModeEnfant(): void {
  choisirProfil('enfant')
  fermer()
}
async function ouvrirProgramme(): Promise<void> {
  fermer()
  await router.push('/programme')
}

// ── clavier : Échap ferme, Tab tourne dans la fenêtre ──
const FOCALISABLES = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
/** Tab sur le dernier élément revient au premier, Maj+Tab sur le premier va au dernier. */
function garderLeFocus(e: KeyboardEvent): void {
  const elements = [...(fenetre.value?.querySelectorAll<HTMLElement>(FOCALISABLES) ?? [])]
  const premier = elements[0]
  const dernier = elements[elements.length - 1]
  if (!premier || !dernier) return
  const actif = document.activeElement
  const horsDesBouts = actif === titre.value || !fenetre.value?.contains(actif)
  if (e.shiftKey && (actif === premier || horsDesBouts)) { e.preventDefault(); dernier.focus() }
  else if (!e.shiftKey && actif === dernier) { e.preventDefault(); premier.focus() }
}
function touche(e: KeyboardEvent): void {
  // les raccourcis du site (recherche : « / », Ctrl+K) ne doivent pas agir derrière la fenêtre
  e.stopPropagation()
  if (e.key === 'Escape') { e.preventDefault(); fermer() }
  else if (e.key === 'Tab') garderLeFocus(e)
}

// ── quand s'ouvrir ──
function ouvrirSiBesoin(): void {
  const demande = assistantDemande.value
  assistantDemande.value = false
  if (demande || (premiereVisite() && sansContexte(route.query))) void ouvrir()
}
onMounted(ouvrirSiBesoin)
// « Revoir » depuis l'accueil lui-même (pas de nouveau montage)
watch(assistantDemande, demande => { if (demande) ouvrirSiBesoin() })
onUnmounted(() => { if (ouvert.value) rendreInerte(false) })
</script>

<style scoped>
.voile { position: fixed; inset: 0; z-index: 950; }
.voile.sombre { background: rgba(15, 23, 42, .55); }
/* halo : un anneau autour du repère, et une ombre immense qui assombrit tout le reste */
.halo {
  position: fixed; z-index: 951; border-radius: 24px; pointer-events: none;
  box-shadow: 0 0 0 3px white, 0 0 0 7px var(--orange), 0 0 0 100vmax rgba(15, 23, 42, .55);
}
.halo::after { content: ''; position: absolute; inset: -7px; border-radius: 28px; border: 3px solid var(--orange); animation: pulsation 1.6s ease-out 3; }
@keyframes pulsation { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.25); } }
@media (prefers-reduced-motion: reduce) { .halo::after { animation: none; opacity: 0; } }

.fenetre { position: fixed; z-index: 952; background: white; border-radius: var(--radius); box-shadow: 0 10px 40px rgba(0,0,0,.3); color: var(--texte); }
.fenetre.centree { top: 50%; left: 50%; transform: translate(-50%, -50%); width: min(500px, calc(100vw - 32px)); max-height: calc(100vh - 32px); }
.fenetre.bulle { border: 3px solid var(--orange); }
/* le contenu défile dans la fenêtre (téléphone en paysage) ; la pointe, elle, reste dehors */
.defilement { position: relative; max-height: inherit; overflow-y: auto; padding: 1.25rem 1.4rem 1.1rem; border-radius: inherit; }
/* la pointe : un carré tourné, collé au bord haut de la bulle, sous le repère */
.pointe {
  position: absolute; top: -11px; width: 18px; height: 18px; margin-left: -9px; background: white; transform: rotate(45deg);
  border-top: 3px solid var(--orange); border-left: 3px solid var(--orange);
}
.fermer {
  position: absolute; top: .4rem; right: .4rem; min-width: 44px; min-height: 44px; border: none; background: none; border-radius: 50%;
  font: inherit; font-size: 1.1rem; color: var(--texte-doux); cursor: pointer;
}
.fermer:hover { background: var(--gris-bg); }
.progression { font-size: .75rem; font-weight: 800; text-transform: uppercase; letter-spacing: .05em; color: var(--texte-doux); margin: 0 2.5rem .3rem 0; }
h2 { font-size: 1.25rem; margin: 0 2.5rem .6rem 0; color: var(--bleu-fort); }
h2:focus { outline: none; }
p { line-height: 1.5; margin: 0 0 .6rem; }
.question { font-weight: 800; margin-top: .9rem; }
.telephone { font-size: .88rem; color: var(--texte-doux); background: var(--gris-bg); border-radius: 8px; padding: .4rem .6rem; }
.choix-classes { margin-top: .3rem; }
.actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; justify-content: flex-end; margin-top: 1rem; }
.pas { display: flex; gap: .5rem; margin-left: auto; }
.btn { min-height: 44px; padding: .5rem 1.1rem; }
@media (max-width: 640px) {
  .defilement { padding: 1rem 1rem .9rem; }
  .btn { padding: .5rem .8rem; }
}
/* « Passer » : discret (un lien), à gauche */
.passer {
  margin-right: auto; min-height: 44px; padding: .3rem .2rem; border: none; background: none; font: inherit; font-size: .92rem;
  color: var(--texte-doux); text-decoration: underline; cursor: pointer;
}
.passer:hover { color: var(--texte); }
</style>

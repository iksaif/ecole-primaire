<template>
  <div class="container">
    <h1 class="section-heading">{{ DEFINITION.emoji }} {{ t('ecriture.titre') }}</h1>
    <p class="intro">{{ t('ecriture.intro') }}</p>

    <CadreExercice fiche-seule :mode="mode" :fiche="fiche" :config="config" :aleatoire="false" :police="false">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('communs.niveau')" />

      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="styles" v-model="config.styles" :titre="t('ecriture.ecritures')"
        :libelle="s => t(`ecriture.style.${s}`)">
        <template #valeur="{ valeur: s, texte }">
          <span class="style-exemple" :style="{ fontFamily: `'${estAttache(s) ? polices.attache : polices.script}'` }" aria-hidden="true">{{ estMajuscule(s) ? 'A' : 'a' }}</span> {{ texte }}
        </template>
      </ChoixReglage>

      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="contenu" v-model="config.contenu" :titre="t('ecriture.contenu')"
        :libelle="c => t(`ecriture.contenus.${c}`)" />

      <!-- lettres : familles de la progression, alphabet de la langue régionale, puis la grille (l'ordre des lettres choisies est gardé) -->
      <div v-if="config.contenu === 'lettres'" class="config-section" role="group" :aria-labelledby="`${id}-lettres`">
        <div :id="`${id}-lettres`" class="config-section-title">{{ t('ecriture.lettres') }}</div>
        <div class="btn-group raccourcis" :aria-label="t('ecriture.familles')">
          <button v-for="f in FAMILLES" :key="f.id" type="button" class="level-btn petit" @click="config.lettres = [...f.lettres]">{{ nomFamille(f.id) }}</button>
          <button v-if="regionale.donnees.value" type="button" class="level-btn petit regional" @click="config.lettres = [...regionale.donnees.value.alphabet]">
            {{ t('ecriture.alphabetRegional', { nom: nomRegional }) }}</button>
        </div>
        <div class="lettres-grille">
          <button v-for="l in lettresProposees" :key="l" type="button" class="lettre-btn" :class="{ active: config.lettres.includes(l) }"
            :aria-pressed="config.lettres.includes(l)" @click="basculerLettre(l)">{{ l }}</button>
        </div>
        <label v-if="config.styles.includes('attache-min')" class="case">
          <input v-model="config.lier" type="checkbox"> {{ t('ecriture.lier') }}
        </label>
      </div>

      <!-- mots : listes toutes prêtes (françaises, puis celles de la langue régionale), et la liste à modifier -->
      <div v-if="config.contenu === 'mots'" class="config-section">
        <label :for="`${id}-mots`" class="config-section-title">{{ t('ecriture.mots') }}</label>
        <div class="btn-group raccourcis" :aria-label="t('ecriture.listes')">
          <button v-for="l in LISTES_MOTS" :key="l.id" type="button" class="level-btn petit" @click="config.mots = l.mots.join('\n')">{{ nomListe(l.id) }}</button>
          <button v-for="l in regionale.donnees.value?.listes ?? []" :key="`r-${l.id}`" type="button" class="level-btn petit regional"
            @click="config.mots = l.mots.join('\n')">{{ l.libelle[langueAffichee] ?? l.libelle.fr }}</button>
        </div>
        <textarea :id="`${id}-mots`" v-model="config.mots" rows="6" class="zone-texte"></textarea>
      </div>

      <div v-if="config.contenu === 'texte'" class="config-section">
        <label :for="`${id}-texte`" class="config-section-title">{{ t('ecriture.texte') }}</label>
        <textarea :id="`${id}-texte`" v-model="config.texte" rows="5" class="zone-texte"></textarea>
      </div>

      <div class="config-section">
        <label :for="`${id}-titre`" class="config-section-title">{{ t('ecriture.titreFiche') }}</label>
        <input :id="`${id}-titre`" v-model="config.titre" type="text" class="zone-texte" :placeholder="t('ecriture.titreAuto')">
      </div>

      <div class="config-grid">
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="interligne" v-model="config.interligne" :titre="t('ecriture.taille')"
          :libelle="mm => t(`ecriture.interligne.i${String(mm).replace('.', '')}` as CleInterligne)" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="sauter" v-model="config.sauter" :titre="t('ecriture.espacement')"
          :libelle="v => (v ? t('ecriture.uneSurDeux') : t('ecriture.chaqueLigne'))" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="repasser" v-model="config.repasser" :titre="t('ecriture.repasser')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="copie" v-model="config.copie" :titre="t('ecriture.copie')" />
        <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="couleur" v-model="config.couleur" :titre="t('ecriture.couleurLignes')"
          :libelle="v => (v ? t('ecriture.couleur') : t('ecriture.gris'))" />
      </div>

      <!-- deux polices : celle du script et celle de l'attaché (seulement celles des écritures choisies) -->
      <div class="config-section" role="group" :aria-labelledby="`${id}-polices`">
        <div :id="`${id}-polices`" class="config-section-title">{{ t('ecriture.polices') }}</div>
        <ChoixPolice v-if="config.styles.some(s => !estAttache(s))" v-model="choixPolices.script" type="script" :libelle="t('ecriture.policeScript')" />
        <ChoixPolice v-if="config.styles.some(s => estAttache(s))" v-model="choixPolices.attache" type="attache" :libelle="t('ecriture.policeAttache')" />
      </div>
    </CadreExercice>
  </div>
</template>

<script setup lang="ts">
// Écriture : une fiche seule (pas de partie à l'écran), sans hasard. La vue ne fait que les réglages ; la fiche (lignage Seyès, modèle,
// copies grises) est dans src/exercices/ecriture/ (definition.ts, generateur.ts, fiche.ts). La mesure du texte est celle du navigateur
// (canvas), une fois les polices chargées : la fiche est recalculée quand elles le sont.
import { computed, useId } from 'vue'
import { useLangue } from '../../langues/useLangue.ts'
import { useLangueRegionale } from '../../langues/useLangueRegionale.ts'
import { traducteur } from '../../langues/catalogue.ts'
import CadreExercice from '../../noyau/CadreExercice.vue'
import ChoixReglage from '../../noyau/ChoixReglage.vue'
import ChoixPolice from '../../noyau/ChoixPolice.vue'
import { useReglages } from '../../noyau/useReglages.ts'
import { useFicheExercice } from '../../noyau/useFicheExercice.ts'
import { usePolices } from '../../noyau/polices.ts'
import { mesureNavigateur } from '../../affiches/mesureNavigateur.ts'
import DEFINITION from '../../exercices/ecriture/definition.ts'
import { CONTENU } from '../../exercices/ecriture/textes.ts'
import { questionsFiche } from '../../exercices/ecriture/generateur.ts'
import { fiche as ficheEcriture } from '../../exercices/ecriture/fiche.ts'
import { FAMILLES, LETTRES_REGIONALES, LISTES_MOTS, TOUTES_LETTRES, estAttache, estMajuscule } from '../../exercices/ecriture/donnees.ts'
import type { CleTexte } from '../../langues/traduire.ts'

type CleInterligne = Extract<CleTexte, `ecriture.interligne.${string}`>

const id = useId()
const { t, langueAffichee } = useLangue()
const { config, langueContenu } = useReglages(DEFINITION)
// T : ce que la fiche écrit (titre par défaut, Prénom, Date), dans la langue du contenu
const T = traducteur(CONTENU, () => langueContenu.value)
const regionale = useLangueRegionale()
const nomRegional = computed(() => regionale.def.value?.nom[langueAffichee.value] ?? '')

// les lettres propres aux langues régionales (ch, c'h, ñ) seulement quand la langue active les utilise
const lettresProposees = computed(() => TOUTES_LETTRES.filter(l => !LETTRES_REGIONALES.includes(l) || regionale.donnees.value?.lettresEnPlus.includes(l)))

/** Coche ou décoche une lettre ; une lettre ajoutée prend sa place dans l'ordre de la grille. */
function basculerLettre(l: string): void {
  const choisies = config.value.lettres
  if (choisies.includes(l)) { config.value.lettres = choisies.filter(x => x !== l); return }
  config.value.lettres = [...choisies, l].sort((a, b) => TOUTES_LETTRES.indexOf(a) - TOUTES_LETTRES.indexOf(b))
}

const nomFamille = (famille: string): string => t(`ecriture.famille.${famille}` as Extract<CleTexte, `ecriture.famille.${string}`>)

/** Le nom d'une liste française ; sur une interface dans une autre langue, il dit qu'elle est en français. */
const nomListe = (liste: string): string => {
  const nom = t(`ecriture.liste.${liste}` as Extract<CleTexte, `ecriture.liste.${string}`>)
  return langueAffichee.value === 'fr' ? nom : t('ecriture.listeEnFrancais', { nom })
}

// polices : le choix mémorisé du site (script, attaché) ; la fiche attend qu'elles soient chargées pour mesurer le texte
const { choix: choixPolices, pret } = usePolices()
const polices = computed(() => ({ script: choixPolices.value.script, attache: choixPolices.value.attache }))

const { mode, fiche } = useFicheExercice({
  ficheSeule: true,
  tirer: () => questionsFiche({ niveau: config.value.niveau, reglages: config.value, T } as Parameters<typeof questionsFiche>[0]),
  mettreEnPage: elements => (pret.value
    ? ficheEcriture({ questions: elements, reglages: config.value, T, langue: langueContenu.value, polices: polices.value, mesure: mesureNavigateur })
    : ''),
})
</script>

<style scoped>
.intro { color: var(--texte-doux); margin: -.5rem 0 1.25rem; max-width: 720px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0 1.5rem; }
.style-exemple { font-size: 1.4rem; line-height: 1; font-weight: 400; }
.raccourcis { margin-bottom: .5rem; }
.level-btn.petit { font-size: .78rem; padding: .3rem .7rem; }
.level-btn.regional { border-color: #333; }
.lettres-grille { display: flex; flex-wrap: wrap; gap: .35rem; }
.lettre-btn {
  min-width: 2.4rem; height: 2.4rem; padding: 0 .35rem; border-radius: 8px; border: 2px solid var(--gris-brd); background: white;
  font-size: 1.15rem; font-weight: 700; cursor: pointer; font-family: 'Andika', sans-serif;
}
.lettre-btn.active { background: var(--vert); border-color: var(--vert); color: white; }
.case { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; font-size: .9rem; cursor: pointer; }
.zone-texte { width: 100%; font: inherit; font-size: 1rem; padding: .6rem .75rem; border: 2px solid var(--gris-brd); border-radius: 8px; background: white; }
.zone-texte:focus { outline: none; border-color: var(--bleu); }
</style>

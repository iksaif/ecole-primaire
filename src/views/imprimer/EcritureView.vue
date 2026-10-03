<template>
  <div class="container">
    <h1 class="section-heading">{{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="config-box large">
      <div class="config-section">
        <div class="config-section-title">{{ t('ecriture') }}</div>
        <div class="btn-group">
          <button v-for="s in STYLES" :key="s.id" class="level-btn style-btn"
            :class="{ active: config.styles.includes(s.id) }" @click="basculer(config.styles, s.id)">
            <span :style="{ fontFamily: `'${s.attache ? polices.attache.value : polices.script.value}'` }" class="style-exemple">{{ s.exemple }}</span>
            {{ langue === 'br' ? s.br : s.label }}
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('contenu') }}</div>
        <div class="btn-group">
          <button v-for="c in CONTENUS" :key="c.id" class="level-btn"
            :class="{ active: config.contenu === c.id }" @click="config.contenu = c.id">{{ tr(CONTENUS_TXT[c.id]) ?? c.label }}</button>
        </div>
      </div>

      <div v-if="config.contenu === 'lettres'" class="config-section">
        <div class="config-section-title">{{ t('lettres') }}</div>
        <div class="btn-group" style="margin-bottom:.5rem;">
          <button v-for="p in PRESETS" :key="p.label" class="level-btn petit" @click="config.lettres = [...p.lettres]">{{ libellePreset(p) }}</button>
          <button v-if="regionale" class="level-btn petit regional" @click="config.lettres = [...regionale.alphabet]">
            {{ regionale.drapeau }} {{ t('alphabetRegional', { nom: regionale.nom, nomLocal: regionale.nomLocal }) }}</button>
        </div>
        <div class="lettres-grille">
          <button v-for="l in lettresAffichees" :key="l" class="lettre-btn"
            :class="{ active: config.lettres.includes(l) }" @click="basculer(config.lettres, l, true)">{{ l }}</button>
        </div>
        <label v-if="config.styles.includes('attache-min')" class="case">
          <input type="checkbox" v-model="config.lier"> {{ t('lier') }}
        </label>
      </div>

      <div v-if="config.contenu === 'mots'" class="config-section">
        <div class="config-section-title">{{ t('mots') }}</div>
        <div class="btn-group" style="margin-bottom:.5rem;">
          <button v-for="l in LISTES_MOTS" :key="l.id" class="level-btn petit" @click="choisirListe(l)">{{ libelleListe(l) }}</button>
          <template v-if="regionale">
            <button v-for="l in regionale.listes" :key="l.id" class="level-btn petit regional" @click="choisirListe(l)">
              {{ regionale.drapeau }} {{ langue === 'br' ? l.labelBr ?? l.label : l.label }}</button>
          </template>
        </div>
        <textarea v-model="config.mots" rows="6" class="zone-texte"></textarea>
      </div>

      <div v-if="config.contenu === 'texte'" class="config-section">
        <div class="config-section-title">{{ t('texte') }}</div>
        <textarea v-model="config.texte" rows="5" class="zone-texte"></textarea>
      </div>

      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">{{ t('taille') }}</div>
          <div class="btn-group">
            <button v-for="i in INTERLIGNES" :key="i.mm" class="level-btn"
              :class="{ active: config.interligne === i.mm }" @click="config.interligne = i.mm">{{ tr(INTERLIGNES_TXT[i.mm]) ?? i.label }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('espacement') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.sauter }" @click="config.sauter = true">{{ t('uneSurDeux') }}</button>
            <button class="level-btn" :class="{ active: !config.sauter }" @click="config.sauter = false">{{ t('chaqueLigne') }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('repasser') }}</div>
          <div class="btn-group">
            <button v-for="n in [0,1,2,3]" :key="n" class="level-btn"
              :class="{ active: config.repasser === n }" @click="config.repasser = n">{{ n }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('copie') }}</div>
          <div class="btn-group">
            <button v-for="n in [0,1,2,3]" :key="n" class="level-btn"
              :class="{ active: config.copie === n }" @click="config.copie = n">{{ n }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('couleurLignes') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.couleur }" @click="config.couleur = true">{{ t('couleur') }}</button>
            <button class="level-btn" :class="{ active: !config.couleur }" @click="config.couleur = false">{{ t('gris') }}</button>
          </div>
        </div>

      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('polices') }}</div>
        <ChoixPolice />
      </div>

      <ApercuImpression :reglages="config" :html="html" :nb-pages="nbPages" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ApercuImpression from '../../components/ApercuImpression.vue'
import ChoixPolice from '../../components/ChoixPolice.vue'
import { usePolices } from '../../composables/usePolices'
import { sauvegarder, charger } from '../../utils'
import { useLangueRegionale } from '../../composables/useLangueRegionale'
import { useI18n } from '../../i18n'
import {
  STYLES, CONTENUS, TOUTES_LETTRES, LETTRES_REGIONALES, LISTES_MOTS, PRESETS, INTERLIGNES, DEFAUTS, genererEcriture,
} from '../../impression/ecriture'

const config = ref({ ...DEFAUTS, ...charger('ecriture_config', {}) })
watch(config, v => sauvegarder('ecriture_config', v), { deep: true })

const { t, tr, langue } = useI18n({
  fr: {
    titre: "✏️ Fiches d'écriture",
    intro: 'Lignage Seyès (comme le cahier de classe), modèle en noir au début de chaque ligne, lettres grises à repasser puis lignes pour copier seul.',
    ecriture: 'Écriture (plusieurs choix possibles)',
    contenu: 'Contenu',
    lettres: 'Lettres',
    alphabetRegional: 'Alphabet {nom}',
    lier: 'En attaché minuscule, lier les lettres par trois (aaa)',
    mots: 'Mots (un par ligne : prénom, mots de la semaine…)',
    texte: 'Phrases ou petit texte (un paragraphe par ligne)',
    taille: 'Taille du lignage',
    espacement: 'Espacement',
    uneSurDeux: 'Une ligne sur deux',
    chaqueLigne: 'Chaque ligne',
    repasser: 'Lignes à repasser (gris)',
    copie: 'Lignes à copier seul',
    couleurLignes: 'Couleur des lignes',
    couleur: 'Couleur',
    gris: 'Gris (imprimante N&B)',
    polices: 'Polices',
  },
  br: {
    titre: '✏️ Fichennoù skrivañ',
    // br: à relire (« repasser » = tremen war, « copier seul » = eilskrivañ e-unan)
    intro: "Linennoù Seyès (evel er c'haier klas), ur skouer e du e penn pep linenn, lizherennoù gris da dremen warno ha goude linennoù da eilskrivañ e-unan.",
    ecriture: 'Doare skrivañ (meur a zibab a c\'haller ober)', // br: à relire
    contenu: 'Danvez', // br: à relire
    lettres: 'Lizherennoù',
    alphabetRegional: 'Lizherenneg ar {nomLocal}',
    lier: 'En a-stag lizherennoù bihan, liammañ al lizherennoù a dri e tri (aaa)', // br: à relire
    mots: 'Gerioù (unan dre linenn : anv-bihan, gerioù ar sizhun…)',
    texte: 'Frazennoù pe un destennig (ur rannbennad dre linenn)', // br: à relire
    taille: 'Ment al linennoù',
    espacement: 'Esaouiñ', // br: à relire (espacement)
    uneSurDeux: 'Ul linenn diwar zaou', // br: à relire
    chaqueLigne: 'Pep linenn',
    repasser: 'Linennoù da dremen warno (gris)', // br: à relire
    copie: 'Linennoù da eilskrivañ e-unan', // br: à relire
    couleurLignes: 'Liv al linennoù',
    couleur: 'Liv',
    gris: 'Gris (moullerez du ha gwenn)',
    // br: à relire — « nodrezh » (terme officiel pour police de caractères) plutôt que « font » ou « lizherennaoueg »
    polices: 'Nodrezhoù',
  },
})

// Libellés des choix définis dans src/impression/ecriture.js (français là-bas)
const CONTENUS_TXT = {
  lettres: { fr: '🔤 Lettres et chiffres', br: '🔤 Lizherennoù ha sifroù' },
  mots: { fr: '📝 Mots', br: '📝 Gerioù' },
  texte: { fr: '📄 Phrases', br: '📄 Frazennoù' },
}
const INTERLIGNES_TXT = {
  2: { fr: '2 mm (CE2 et +)', br: "2 mm (CE2 ha muioc'h)" },
  2.5: { fr: '2,5 mm (CE1)', br: '2,5 mm (CE1)' },
  3: { fr: '3 mm (CP)', br: '3 mm (CP)' },
  4: { fr: '4 mm (débutant)', br: '4 mm (evit kregiñ)' }, // br: à relire (débutant)
}
// Familles de lettres (PRESETS), par libellé français
const PRESETS_BR = {
  'Alphabet': 'Lizherenneg',
  'Voyelles': 'Vogalennoù',
  'Rondes (c o a d g q)': 'Lizherennoù ront (c o a d g q)',
  'Boucles (e l b h k f)': 'Lagadennoù (e l b h k f)',
  'Coupes (i u t)': 'Kopoù (i u t)', // br: à relire — « coupe » (trait en creux de l'écriture), traduit littéralement par kop (coupe, gobelet)
  'Ponts (m n v w x y)': 'Pontoù (m n v w x y)',
  'Jambages (j p g q y f z)': 'Lostoù (j p g q y f z)', // br: à relire — « jambage » (trait qui descend sous la ligne), rendu par lost (queue)
  'Particulières (r s z x)': 'Dibar (r s z x)',
  'Accents et œ': 'Lizherennoù gant tired ha œ', // br: à relire — « tired » pour accent, à confirmer (pourrait être « sin »)
  'Chiffres': 'Sifroù',
  'Aucune': 'Hini ebet',
}
const libellePreset = p => (langue.value === 'br' ? PRESETS_BR[p.label] ?? p.label : p.label)
// Listes de mots françaises : en breton, on précise qu'elles sont en français
const LISTES_BR = {
  jours: 'Deizioù ar sizhun', mois: 'Mizioù ar bloaz', 'nombres-10': 'Niveroù 1 → 10', couleurs: 'Livioù', famille: 'Familh',
}
const libelleListe = l => (langue.value === 'br' ? `🇫🇷 ${LISTES_BR[l.id] ?? l.label} e galleg` : l.label)

const polices = usePolices()
const { langue: regionale } = useLangueRegionale()

// ch, c'h, ñ seulement si une langue régionale qui les utilise est activée
const lettresAffichees = computed(() => TOUTES_LETTRES.filter(l =>
  !LETTRES_REGIONALES.includes(l) || regionale.value?.lettresEnPlus.includes(l)))

function choisirListe(l) {
  config.value.mots = l.mots.join('\n')
}

function basculer(liste, v, ordonner = false) {
  const i = liste.indexOf(v)
  if (i >= 0) { if (liste.length > 1 || ordonner) liste.splice(i, 1) }
  else {
    liste.push(v)
    if (ordonner) liste.sort((a, b) => TOUTES_LETTRES.indexOf(a) - TOUTES_LETTRES.indexOf(b))
  }
}

const resultat = computed(() => polices.pret.value
  ? genererEcriture({ ...config.value, langue: langue.value }, { attache: polices.attache.value, script: polices.script.value })
  : { html: '', nbPages: 1 })
const html = computed(() => resultat.value.html)
const nbPages = computed(() => resultat.value.nbPages)
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; max-width: 720px; }
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0 1.5rem; }
.style-btn { display: inline-flex; align-items: center; gap: .5rem; }
.style-exemple { font-size: 1.4rem; line-height: 1; font-weight: 400; }
.level-btn.petit { font-size: .78rem; padding: .3rem .7rem; }
.lettres-grille { display: flex; flex-wrap: wrap; gap: .35rem; }
.lettre-btn {
  min-width: 2.4rem; height: 2.4rem; padding: 0 .35rem; border-radius: 8px; border: 2px solid var(--gris-brd); background: white;
  font-size: 1.15rem; font-weight: 700; cursor: pointer; font-family: 'Andika', sans-serif;
}
.level-btn.regional { border-color: #333; }
.lettre-btn.active { background: var(--vert); border-color: var(--vert); color: white; }
.case { display: flex; align-items: center; gap: .5rem; margin-top: .75rem; font-size: .9rem; cursor: pointer; }
.zone-texte, .select {
  width: 100%; font: inherit; font-size: 1rem; padding: .6rem .75rem;
  border: 2px solid var(--gris-brd); border-radius: 8px; background: white;
}
.zone-texte:focus, .select:focus { outline: none; border-color: var(--bleu); }
</style>

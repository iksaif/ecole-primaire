<template>
  <div class="container">
    <h1 class="section-heading">✏️ Fiches d'écriture</h1>
    <p class="intro">
      Lignage Seyès (comme le cahier de classe), modèle en noir au début de chaque ligne,
      lettres grises à repasser puis lignes pour copier seul.
    </p>

    <div class="config-box large">
      <div class="config-section">
        <div class="config-section-title">Écriture (plusieurs choix possibles)</div>
        <div class="btn-group">
          <button v-for="s in STYLES" :key="s.id" class="level-btn style-btn"
            :class="{ active: config.styles.includes(s.id) }" @click="basculer(config.styles, s.id)">
            <span :style="{ fontFamily: `'${s.attache ? polices.attache.value : polices.script.value}'` }" class="style-exemple">{{ s.exemple }}</span>
            {{ s.label }}
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Contenu</div>
        <div class="btn-group">
          <button v-for="c in CONTENUS" :key="c.id" class="level-btn"
            :class="{ active: config.contenu === c.id }" @click="config.contenu = c.id">{{ c.label }}</button>
        </div>
      </div>

      <div v-if="config.contenu === 'lettres'" class="config-section">
        <div class="config-section-title">Lettres</div>
        <div class="btn-group" style="margin-bottom:.5rem;">
          <button v-for="p in PRESETS" :key="p.label" class="level-btn petit" @click="config.lettres = [...p.lettres]">{{ p.label }}</button>
          <button v-if="regionale" class="level-btn petit regional" @click="config.lettres = [...regionale.alphabet]">
            {{ regionale.drapeau }} Alphabet {{ regionale.nom }}</button>
        </div>
        <div class="lettres-grille">
          <button v-for="l in lettresAffichees" :key="l" class="lettre-btn"
            :class="{ active: config.lettres.includes(l) }" @click="basculer(config.lettres, l, true)">{{ l }}</button>
        </div>
        <label v-if="config.styles.includes('attache-min')" class="case">
          <input type="checkbox" v-model="config.lier"> En attaché minuscule, lier les lettres par trois (aaa)
        </label>
      </div>

      <div v-if="config.contenu === 'mots'" class="config-section">
        <div class="config-section-title">Mots (un par ligne : prénom, mots de la semaine…)</div>
        <div class="btn-group" style="margin-bottom:.5rem;">
          <button v-for="l in LISTES_MOTS" :key="l.id" class="level-btn petit" @click="choisirListe(l)">{{ l.label }}</button>
          <template v-if="regionale">
            <button v-for="l in regionale.listes" :key="l.id" class="level-btn petit regional" @click="choisirListe(l)">
              {{ regionale.drapeau }} {{ l.label }}</button>
          </template>
        </div>
        <textarea v-model="config.mots" rows="6" class="zone-texte"></textarea>
      </div>

      <div v-if="config.contenu === 'texte'" class="config-section">
        <div class="config-section-title">Phrases ou petit texte (un paragraphe par ligne)</div>
        <textarea v-model="config.texte" rows="5" class="zone-texte"></textarea>
      </div>

      <div class="config-grid">
        <div class="config-section">
          <div class="config-section-title">Taille du lignage</div>
          <div class="btn-group">
            <button v-for="i in INTERLIGNES" :key="i.mm" class="level-btn"
              :class="{ active: config.interligne === i.mm }" @click="config.interligne = i.mm">{{ i.label }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Espacement</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.sauter }" @click="config.sauter = true">Une ligne sur deux</button>
            <button class="level-btn" :class="{ active: !config.sauter }" @click="config.sauter = false">Chaque ligne</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Lignes à repasser (gris)</div>
          <div class="btn-group">
            <button v-for="n in [0,1,2,3]" :key="n" class="level-btn"
              :class="{ active: config.repasser === n }" @click="config.repasser = n">{{ n }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Lignes à copier seul</div>
          <div class="btn-group">
            <button v-for="n in [0,1,2,3]" :key="n" class="level-btn"
              :class="{ active: config.copie === n }" @click="config.copie = n">{{ n }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">Couleur des lignes</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.couleur }" @click="config.couleur = true">Couleur</button>
            <button class="level-btn" :class="{ active: !config.couleur }" @click="config.couleur = false">Gris (imprimante N&amp;B)</button>
          </div>
        </div>

      </div>

      <div class="config-section">
        <div class="config-section-title">Polices</div>
        <ChoixPolice />
      </div>

      <ApercuImpression :html="html" :nb-pages="nbPages" />
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
import {
  STYLES, CONTENUS, TOUTES_LETTRES, LETTRES_REGIONALES, LISTES_MOTS, PRESETS, INTERLIGNES, DEFAUTS, genererEcriture,
} from '../../impression/ecriture'

const config = ref({ ...DEFAUTS, ...charger('ecriture_config', {}) })
watch(config, v => sauvegarder('ecriture_config', v), { deep: true })

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
  ? genererEcriture(config.value, { attache: polices.attache.value, script: polices.script.value })
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

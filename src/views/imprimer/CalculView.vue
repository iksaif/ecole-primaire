<template>
  <div class="container">
    <h1 class="section-heading">🧮 {{ t('titre') }}</h1>
    <p class="intro">{{ t('intro') }}</p>

    <div class="config-box large">
      <div class="config-section">
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.mode === 'fiche' }" @click="config.mode = 'fiche'">📝 {{ t('modeFiche') }}</button>
          <button class="level-btn" :class="{ active: config.mode === 'affiche' }" @click="config.mode = 'affiche'">🖼️ {{ t('modeAffiche') }}</button>
        </div>
      </div>

      <template v-if="config.mode === 'fiche'">
        <div class="config-section">
          <div class="config-section-title">{{ t('niveauPreset') }}</div>
          <div class="btn-group">
            <button v-for="n in NIVEAUX" :key="n" class="level-btn"
              :class="{ active: config.niveau === n }" @click="choisirNiveau(n)">{{ n.toUpperCase() }}</button>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">{{ t('calculs') }}</div>
          <div class="btn-group">
            <button v-for="ty in TYPES" :key="ty.id" class="level-btn type-btn"
              :class="{ active: config.types.includes(ty.id), horsniveau: !ty.niveaux.includes(config.niveau) }"
              :title="t('niveaux', { l: ty.niveaux.map(n => n.toUpperCase()).join(', ') })"
              @click="basculerType(ty.id)">{{ lib(ty.label) }}</button>
          </div>
        </div>

        <div v-for="ty in typesChoisis" :key="ty.id" class="params">
          <div class="params-titre">{{ lib(ty.label) }}</div>
          <div v-for="p in ty.params" :key="p.id" class="param">
            <span class="param-lib">{{ lib(p.label) }}</span>
            <div class="btn-group">
              <button v-for="o in p.options" :key="o.v" class="level-btn petit"
                :class="{ active: actif(ty.id, p, o.v) }" @click="choisirParam(ty.id, p, o.v)">{{ lib(o.label) }}</button>
            </div>
          </div>
        </div>

        <div class="config-grid">
          <div class="config-section">
            <div class="config-section-title">{{ t('nbCalculs') }}</div>
            <div class="btn-group">
              <button v-for="n in NB_CALCULS" :key="n" class="level-btn"
                :class="{ active: config.nb === n }" @click="config.nb = n">{{ n }}</button>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">{{ t('colonnes') }}</div>
            <div class="btn-group">
              <button v-for="n in [2, 3]" :key="n" class="level-btn"
                :class="{ active: config.colonnes === n }" @click="config.colonnes = n">{{ n }}</button>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">{{ t('taille') }}</div>
            <div class="btn-group">
              <button v-for="ta in TAILLES" :key="ta.id" class="level-btn"
                :class="{ active: config.taille === ta.id }" @click="config.taille = ta.id">{{ lib(ta.label) }}</button>
            </div>
          </div>
          <div class="config-section">
            <div class="config-section-title">{{ t('reponses') }}</div>
            <div class="btn-group">
              <button class="level-btn" :class="{ active: config.reponse === 'pointilles' }" @click="config.reponse = 'pointilles'">{{ t('pointilles') }}</button>
              <button class="level-btn" :class="{ active: config.reponse === 'cases' }" @click="config.reponse = 'cases'">{{ t('cases') }}</button>
            </div>
          </div>
        </div>

        <div class="config-section">
          <div class="config-section-title">{{ t('options') }}</div>
          <label v-if="config.types.length > 1" class="case"><input type="checkbox" v-model="config.melanger"> {{ t('melanger') }}</label>
          <label class="case"><input type="checkbox" v-model="config.enTete"> {{ t('enTete') }}</label>
          <label class="case"><input type="checkbox" v-model="config.corrige"> {{ t('corrigeSepare') }}</label>
          <label class="case titre">{{ t('titreFiche') }} <input type="text" v-model="config.titre" :placeholder="t('automatique')" maxlength="80"></label>
        </div>

        <div class="config-section nouvelle">
          <button class="btn btn-warning" @click="nouvelleFiche">🎲 {{ t('nouvelle') }}</button>
          <span v-if="resultat.nbCalculs < resultat.demandes" class="alerte">
            {{ t('alerte', { n: resultat.nbCalculs }) }}
          </span>
        </div>
      </template>

      <template v-else>
        <div class="config-section">
          <div class="config-section-title">{{ t('affiche') }}</div>
          <div class="btn-group">
            <button v-for="a in AFFICHES" :key="a.id" class="level-btn"
              :class="{ active: config.affiche === a.id }" @click="config.affiche = a.id">{{ lib(a.label) }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('disposition') }}</div>
          <div class="btn-group">
            <button v-for="d in DISPOSITIONS" :key="d.id" class="level-btn"
              :class="{ active: config.disposition === d.id }" @click="config.disposition = d.id">{{ lib(d.label) }}</button>
          </div>
        </div>
        <div v-if="config.disposition !== 'grille'" class="config-section">
          <div class="config-section-title">{{ t('tables') }}</div>
          <div class="btn-group">
            <button v-for="n in 10" :key="n" class="level-btn"
              :class="{ active: config.tablesAffiche.includes(n) }" @click="basculerTable(n)">{{ n }}</button>
            <button class="level-btn petit" @click="config.tablesAffiche = Array.from({ length: 10 }, (_, k) => k + 1)">{{ t('toutes') }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('format') }}</div>
          <div class="btn-group">
            <button v-for="f in ['A4', 'A3']" :key="f" class="level-btn"
              :class="{ active: config.format === f }" @click="config.format = f">{{ f }}</button>
            <button class="level-btn" :class="{ active: config.orientation === 'portrait' }" @click="config.orientation = 'portrait'">{{ t('portrait') }}</button>
            <button class="level-btn" :class="{ active: config.orientation === 'landscape' }" @click="config.orientation = 'landscape'">{{ t('paysage') }}</button>
          </div>
        </div>
      </template>

      <div class="config-section">
        <div class="config-section-title">{{ t('police') }}</div>
        <ChoixPolice :types="['script']" />
      </div>

      <ApercuImpression :html="resultat.html" :format="resultat.format" :orientation="resultat.orientation" :nb-pages="resultat.nbPages" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ApercuImpression from '../../components/ApercuImpression.vue'
import ChoixPolice from '../../components/ChoixPolice.vue'
import { usePolices } from '../../composables/usePolices'
import { sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import {
  TYPES, NIVEAUX, NB_CALCULS, TAILLES, AFFICHES, DISPOSITIONS, PRESETS_NIVEAU,
  typeParId, normaliserConfig, graineAleatoire, genererCalcul, libelle,
} from '../../impression/calcul'

// Breton : traduction à faire relire par un brittophone
const { t, langue } = useI18n({
  fr: {
    titre: 'Fiches de calcul',
    intro: "Fiches de calcul mental à imprimer (tables, additions, compléments, doubles…) du CP au CM2, avec corrigé, et affiches des tables de multiplication et d'addition.",
    modeFiche: "Fiche d'exercices", modeAffiche: 'Affiche des tables',
    niveauPreset: 'Niveau (présélectionne les calculs du programme)',
    calculs: 'Calculs (plusieurs choix possibles)', niveaux: 'Niveaux : {l}',
    nbCalculs: 'Nombre de calculs', colonnes: 'Colonnes', taille: "Taille d'écriture",
    reponses: 'Réponses', pointilles: 'Pointillés ……', cases: 'Cases ☐', options: 'Options',
    melanger: 'Mélanger les différents calculs (sinon, regroupés par type)',
    enTete: 'En-tête Prénom / Date / Score', corrigeSepare: 'Corrigé sur une page séparée',
    titreFiche: 'Titre', automatique: 'automatique', nouvelle: 'Nouvelle fiche',
    alerte: 'Seulement {n} calculs différents possibles avec ces choix (sans répétition).',
    affiche: 'Affiche', disposition: 'Disposition', tables: 'Tables', toutes: 'Toutes',
    format: 'Format', portrait: 'Portrait', paysage: 'Paysage', police: 'Police',
  },
  br: {
    titre: 'Fichennoù jediñ',
    intro: "Fichennoù jediñ e penn da voullañ (taolennoù, sammadennoù, klokaat, an doubl…) eus ar CP d'ar CM2, gant ar reizhadenn, ha skritelloù an taolennoù liesañ ha sammañ.",
    modeFiche: 'Fichenn boelladennoù', modeAffiche: 'Skritell an taolennoù',
    niveauPreset: 'Live (dibab a ra jedadennoù ar programm)', // br: à relire
    calculs: 'Jedadennoù (meur a zibab posupl)', niveaux: 'Liveoù : {l}',
    nbCalculs: 'Niver a jedadennoù', colonnes: 'Bannoù', taille: 'Ment ar skritur', // br: à relire (colonnes)
    reponses: 'Respontoù', pointilles: 'Pikedennoù ……', cases: 'Boestoù ☐', options: 'Dibarzhioù',
    melanger: "Meskañ an jedadennoù (a-hend-all e vint strollet dre seurt)", // br: à relire
    enTete: 'Talbenn Anv-bihan / Deiziad / Skor', corrigeSepare: "Reizhadenn war ur bajenn a-ziforc'h",
    titreFiche: 'Titl', automatique: 'emgefreek', nouvelle: 'Fichenn nevez',
    alerte: "{n} jedadenn disheñvel hepken a c'haller kaout gant an dibaboù-se (hep adlavar).", // br: à relire
    affiche: 'Skritell', disposition: "Lec'hiadur", tables: 'Taolennoù', toutes: 'An holl',
    format: 'Furmad', portrait: 'A-serzh', paysage: 'A-led', police: 'Nodrezh', // br: à relire (portrait / paysage)
  },
})
const lib = v => libelle(v, langue.value)

const CLE = 'calcul_impression_config'
const config = ref(normaliserConfig(charger(CLE, {}) ?? {}))
// graine fixée dès l'ouverture : l'impression correspond exactement à l'aperçu
if (!config.value.seed) config.value.seed = graineAleatoire()
watch(config, v => sauvegarder(CLE, v), { deep: true })

const typesChoisis = computed(() => config.value.types.map(typeParId))

function choisirNiveau(n) {
  const preset = PRESETS_NIVEAU[n]
  config.value.niveau = n
  config.value.types = [...preset.types]
  for (const [id, p] of Object.entries(preset.params)) {
    config.value.params[id] = { ...config.value.params[id], ...structuredClone(p) }
  }
}

function basculerType(id) {
  const t = config.value.types
  const i = t.indexOf(id)
  if (i >= 0) { if (t.length > 1) t.splice(i, 1) }
  else {
    t.push(id)
    t.sort((a, b) => TYPES.findIndex(x => x.id === a) - TYPES.findIndex(x => x.id === b))
  }
}

const actif = (id, p, v) => p.multi ? config.value.params[id][p.id].includes(v) : config.value.params[id][p.id] === v
function choisirParam(id, p, v) {
  const params = config.value.params[id]
  if (!p.multi) { params[p.id] = v; return }
  const l = params[p.id]
  const i = l.indexOf(v)
  if (i >= 0) { if (l.length > 1) l.splice(i, 1) }
  else {
    l.push(v)
    l.sort((a, b) => p.options.findIndex(o => o.v === a) - p.options.findIndex(o => o.v === b))
  }
}

function basculerTable(n) {
  const l = config.value.tablesAffiche
  const i = l.indexOf(n)
  if (i >= 0) { if (l.length > 1) l.splice(i, 1) }
  else { l.push(n); l.sort((a, b) => a - b) }
}

function nouvelleFiche() {
  config.value.seed = graineAleatoire()
}

const polices = usePolices()
const resultat = computed(() => polices.pret.value
  ? genererCalcul({ ...config.value, langue: langue.value }, { script: polices.script.value })
  : { html: '', nbPages: 1, format: 'A4', orientation: 'portrait', nbCalculs: 0, demandes: 0 })
</script>

<style scoped>
.intro { color: #666; margin: -.5rem 0 1.25rem; }
.config-box.large { max-width: 960px; }
.config-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 0 1.5rem; }
.case { display: flex; align-items: center; gap: .5rem; margin: .35rem 0; font-size: .95rem; cursor: pointer; }
.case.titre input { flex: 1; max-width: 26rem; font: inherit; padding: .3rem .5rem; border: 2px solid var(--gris-brd); border-radius: 6px; }
.level-btn.petit { font-size: .78rem; padding: .3rem .6rem; }
.type-btn.horsniveau:not(.active) { opacity: .55; }
.params { border-left: 4px solid var(--bleu); background: var(--gris-bg); border-radius: 0 8px 8px 0; padding: .6rem .9rem; margin: 0 0 .8rem; }
.params-titre { font-weight: 800; margin-bottom: .35rem; }
.param { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; margin: .3rem 0; }
.param-lib { font-size: .85rem; font-weight: 700; color: #888; min-width: 5.5rem; }
.nouvelle { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.alerte { color: #b45309; font-size: .9rem; }
</style>

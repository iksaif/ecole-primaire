<template>
  <div class="container">
    <h1 class="section-heading">🍕 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in Object.keys(NIVEAUX)" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('exercices') }}</div>
        <div class="btn-group">
          <button v-for="ty in typesNiveau" :key="ty.id"
            class="level-btn" :class="{ active: config.types.includes(ty.id) }"
            @click="toggleType(ty.id)">{{ t(ty.label) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('fractions') }}</div>
        <div class="btn-group">
          <button v-for="(m, id) in MODES" :key="id"
            class="level-btn" :class="{ active: config.mode === id }"
            @click="config.mode = id">{{ t(m) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <template v-if="mode === 'jouer'">
            <button v-for="n in NB_JOUER" :key="n"
              class="level-btn" :class="{ active: config.nbQ === n }"
              @click="config.nbQ = n">{{ n }}</button>
          </template>
          <template v-else>
            <button v-for="n in NB_FICHE" :key="n"
              class="level-btn" :class="{ active: config.nbFiche === n }"
              @click="config.nbFiche = n">{{ n }}</button>
          </template>
        </div>
      </div>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <div class="consigne">
          {{ q.consigne }}
          <span v-if="q.fracConsigne" class="frac frac-moyenne">
            <span>{{ q.fracConsigne.n }}</span><span>{{ q.fracConsigne.d }}</span>
          </span>
          <template v-if="q.consigneFin">{{ q.consigneFin }}</template>
        </div>

        <!-- Forme (affichée ou à colorier) -->
        <div v-if="q.forme" class="visuel">
          <svg :viewBox="q.forme.viewBox" :width="q.forme.largeur" class="forme-svg"
               :class="{ cliquable: q.kind === 'parts' && !verrou }">
            <path v-for="(part, i) in q.forme.parts" :key="i" :d="part"
                  :fill="estColoriee(i) ? COULEUR : '#ffffff'" stroke="#2c3e50" stroke-width="2.5"
                  stroke-linejoin="round" @click="togglepart(i)"/>
          </svg>
          <div v-if="q.kind === 'parts'" class="aide">
            {{ t('aideColorier', { n: coloriees.length, total: q.forme.parts.length }) }}
          </div>
          <svg v-if="q.formeAide" :viewBox="q.formeAide.viewBox" :width="q.formeAide.largeur" class="forme-svg" style="display:block;margin:.5rem auto 0;">
            <path v-for="(part, i) in q.formeAide.parts" :key="i" :d="part" fill="#ffffff" stroke="#2c3e50" stroke-width="2.5"/>
          </svg>
        </div>

        <!-- Droite graduée : lecture (SVG) -->
        <div v-if="q.svg" class="visuel" v-html="q.svg"></div>

        <!-- Droite graduée : placer en touchant une graduation -->
        <div v-if="q.kind === 'placer'" class="visuel">
          <svg :viewBox="`0 0 ${q.droite.largeur} 110`" :width="q.droite.largeur" class="forme-svg">
            <line :x1="q.droite.x0 - 15" :y1="q.droite.y" :x2="q.droite.x0 + q.droite.L + 15" :y2="q.droite.y" stroke="#2c3e50" stroke-width="3"/>
            <g v-for="t in q.droite.ticks" :key="t.i">
              <line :x1="t.x" :y1="q.droite.y - (t.unite ? 16 : 9)" :x2="t.x" :y2="q.droite.y + (t.unite ? 16 : 9)" stroke="#2c3e50" :stroke-width="t.unite ? 3 : 2"/>
              <text v-if="t.label !== null" :x="t.x" :y="q.droite.y + 40" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50">{{ t.label }}</text>
            </g>
            <template v-if="placement !== null">
              <line :x1="q.droite.ticks[placement].x" :y1="q.droite.y - 48" :x2="q.droite.ticks[placement].x" :y2="q.droite.y - 18"
                    :stroke="verrou ? (placement === q.reponse.n ? '#5cb85c' : '#e74c3c') : '#4a90e2'" stroke-width="4"/>
              <polygon :points="`${q.droite.ticks[placement].x - 9},${q.droite.y - 22} ${q.droite.ticks[placement].x + 9},${q.droite.y - 22} ${q.droite.ticks[placement].x},${q.droite.y - 10}`"
                       :fill="verrou ? (placement === q.reponse.n ? '#5cb85c' : '#e74c3c') : '#4a90e2'"/>
            </template>
            <polygon v-if="verrou && placement !== q.reponse.n"
                     :points="`${q.droite.ticks[q.reponse.n].x - 9},${q.droite.y - 22} ${q.droite.ticks[q.reponse.n].x + 9},${q.droite.y - 22} ${q.droite.ticks[q.reponse.n].x},${q.droite.y - 10}`" fill="#5cb85c"/>
            <!-- zones de touche larges autour de chaque graduation (sauf 0, 1, 2 déjà écrits) -->
            <rect v-for="t in q.droite.ticks.filter(t => !t.unite)" :key="'z' + t.i"
                  :x="t.x - q.droite.L / (q.droite.ticks.length - 1) / 2" :y="q.droite.y - 55"
                  :width="q.droite.L / (q.droite.ticks.length - 1)" height="80"
                  fill="transparent" style="cursor:pointer" @click="placer(t.i)"/>
          </svg>
        </div>

        <!-- Jetons pour « la moitié de… » -->
        <div v-if="q.jetons" class="visuel" v-html="q.jetons"></div>

        <div v-if="q.fracAffichee" class="exercise-question">
          <span class="frac frac-grande"><span>{{ q.fracAffichee.n }}</span><span>{{ q.fracAffichee.d }}</span></span>
          <span v-if="q.suffixe" style="margin-left:.75rem;">{{ q.suffixe }}</span>
        </div>
        <div v-if="q.egalite" class="exercise-question">
          <span class="frac frac-grande"><span>{{ q.egalite.gauche.n }}</span><span>{{ q.egalite.gauche.d }}</span></span>
          <span style="margin:0 .75rem;">=</span>
          <span class="frac frac-grande"><span>{{ q.egalite.droite.n }}</span><span>{{ q.egalite.droite.d }}</span></span>
        </div>
        <div v-if="q.texte" class="exercise-question question-texte">{{ q.texte }}</div>

        <!-- Réponse : nombre -->
        <input v-if="q.kind === 'nombre'" ref="inputEl" class="exercise-input" :class="inputClass"
               type="number" inputmode="numeric" placeholder="?"
               v-model="reponse" autocomplete="off" :disabled="verrou" @keydown.enter="valider">

        <!-- Réponse : QCM -->
        <div v-else-if="q.kind === 'choix'" class="choix-grid" :class="{ 'choix-lettres': q.choixEn === 'lettres' }">
          <button v-for="c in q.choix" :key="cle(c)" class="choix-btn"
            :class="{ ok: verrou && cle(c) === cle(q.reponse), erreur: verrou && choixDonne && cle(c) === cle(choixDonne) && cle(c) !== cle(q.reponse) }"
            :disabled="verrou" @click="choisirReponse(c)">
            <span v-if="q.choixEn === 'frac'" class="frac frac-moyenne"><span>{{ c.n }}</span><span>{{ c.d }}</span></span>
            <span v-else-if="q.choixEn === 'signe'" style="font-size:2rem;">{{ c }}</span>
            <span v-else>{{ enLettres(c) }}</span>
          </button>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost" :disabled="verrou" @click="passer">{{ t('passer') }}</button>
          <button v-if="q.kind === 'parts'" class="btn btn-ghost" :disabled="verrou || !coloriees.length" @click="coloriees = []">{{ t('effacer') }}</button>
          <button v-if="q.kind !== 'choix'" class="btn btn-primary" :disabled="verrou" @click="valider">{{ t('valider') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('colQuestion') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('bonneReponse') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>{{ h.libelle }}</td>
            <td>{{ h.donne }}</td>
            <td style="font-weight:800;">{{ h.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useI18n, contenu } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maths/FractionsView.js'
import messagesBr from '../../i18n/br/views/maths/FractionsView.js'
import contenuFr from '../../i18n/fr/contenu/fractions.js'
import contenuBr from '../../i18n/br/contenu/fractions.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
// Langue du contenu généré (fractions en lettres, ordinaux) : celle de l'interface pour les maths
const langueContenu = computed(() => langue.value)
const C = contenu({ fr: contenuFr, br: contenuBr }, () => langueContenu.value)
// accord simple : clé au singulier ou au pluriel (« Pl ») — en breton les deux sont identiques
const tn = (cle, n, params) => t(n > 1 ? cle + 'Pl' : cle, { n, ...params })
// ordinal en chiffres : 1re, 2e… / 1añ, 2vet, 3de…
const ordinal = n => C.t('ordinal', { n })

// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau. CE2 : ajouter des fractions > 1, la comparaison, la droite graduée…
const NIVEAUX = {
  ce1: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    types: ['identifier', 'colorier', 'lettres', 'partDe'],
    modeDefaut: 'unitaires',
    // « la moitié de 8 », « le tiers de 9 », « le quart de 12 » : totaux possibles (nom : catalogue partDe_<d>)
    partDe: {
      2: { max: 20, extra: [30, 40, 50, 60, 80, 100] },
      3: { max: 30, extra: [] },
      4: { max: 40, extra: [100] },
    },
  },
  ce2: {
    denominateurs: [2, 3, 4, 5, 6, 8, 10],
    types: ['identifier', 'colorier', 'lettres', 'partDe', 'unite', 'egales', 'droite', 'placer'],
    modeDefaut: 'toutes',
    droiteUnites: [1, 2],          // droite graduée de 0 à 1 ou de 0 à 2 (fractions > 1)
    partDe: {
      2: { max: 40, extra: [50, 60, 80, 100, 200, 500] },
      3: { max: 30, extra: [36, 45, 60, 90] },
      4: { max: 40, extra: [60, 80, 100] },
      5: { max: 50, extra: [100] },
      10: { max: 100, extra: [] },
    },
  },
}

// label : clé du catalogue d'interface
const TYPES = ['identifier', 'colorier', 'lettres', 'partDe', 'unite', 'egales', 'droite', 'placer']
  .map(id => ({ id, label: `type_${id}` }))

// fractions proposées → clé du libellé dans le catalogue d'interface
const MODES = { unitaires: 'mode_unitaires', toutes: 'mode_toutes' }

const COULEUR = '#f39c12'

// fraction en lettres : « trois quarts », « tri c'hard » (catalogue de contenu)
const enLettres = f => C.t('enLettres', f)
const cle = f => typeof f === 'string' ? f : `${f.n}/${f.d}`
const egales = (a, b) => a.n * b.d === b.n * a.d

function tirerFraction(niv, mode) {
  const d = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
  if (mode === 'unitaires' || d === 2 || Math.random() < 0.35) return { n: 1, d }
  return { n: aleatoire(2, d - 1), d }
}

// ─── Formes découpées en parts égales ───
const r2 = x => Math.round(x * 100) / 100

function formeDisque(d) {
  const cx = 70, cy = 70, r = 62
  const parts = []
  for (let i = 0; i < d; i++) {
    const a0 = -Math.PI / 2 + 2 * Math.PI * i / d, a1 = a0 + 2 * Math.PI / d
    parts.push(`M${cx} ${cy} L${r2(cx + r * Math.cos(a0))} ${r2(cy + r * Math.sin(a0))} A${r} ${r} 0 0 1 ${r2(cx + r * Math.cos(a1))} ${r2(cy + r * Math.sin(a1))} Z`)
  }
  return { type: 'disque', parts, viewBox: '0 0 140 140', largeur: 200 }
}

// Rectangle quadrillé : 2 lignes quand c'est possible (4 = 2×2, 6 = 2×3, 8 = 2×4, 10 = 2×5)
function formeRectangle(d) {
  const lignes = d >= 4 && d % 2 === 0 ? 2 : 1, colonnes = d / lignes
  const W = 220, H = lignes === 2 ? 140 : 110
  const w = W / colonnes, h = H / lignes
  const parts = []
  for (let l = 0; l < lignes; l++) for (let c = 0; c < colonnes; c++) {
    const x = r2(4 + c * w), y = r2(4 + l * h)
    parts.push(`M${x} ${y} h${r2(w)} v${r2(h)} h${r2(-w)} Z`)
  }
  return { type: 'rectangle', parts, viewBox: `0 0 ${W + 8} ${H + 8}`, largeur: 260 }
}

function formeBarre(d) {
  const W = 320, H = 50, w = W / d
  const parts = Array.from({ length: d }, (_, i) => `M${r2(4 + i * w)} 4 h${r2(w)} v${H} h${r2(-w)} Z`)
  return { type: 'barre', parts, viewBox: `0 0 ${W + 8} ${H + 8}`, largeur: 340 }
}

function tirerForme(d) {
  const f = [formeDisque, formeRectangle, formeBarre][aleatoire(0, 2)]
  return f(d)
}

// Quelles parts sont coloriées : souvent à la suite, parfois dispersées
function partsColoriees(n, d) {
  if (Math.random() < 0.6) {
    const debut = aleatoire(0, d - 1)
    return Array.from({ length: n }, (_, i) => (debut + i) % d)
  }
  return melanger(Array.from({ length: d }, (_, i) => i)).slice(0, n)
}

// Distracteurs : erreurs typiques (coloriées / non coloriées, non coloriées / total, inversion)
function distracteursFraction(f, niv, nb = 3) {
  const { n, d } = f
  const candidats = melanger([
    { n, d: d - n },          // parts coloriées sur parts blanches
    { n: d - n, d },          // parts blanches
    { n: d, d: n },           // inversion
  ]).concat(melanger([
    { n, d: d + 1 }, { n, d: d - 1 }, { n: n + 1, d }, { n: n - 1, d }, { n: 1, d: n + d },
  ]))
  const res = []
  for (const c of candidats) {
    if (c.n < 1 || c.n === c.d || c.n > 10 || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || res.some(r => cle(r) === cle(c))) continue
    res.push(c)
    if (res.length === nb) return res
  }
  let essais = 0
  while (res.length < nb && essais++ < 200) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !res.some(r => cle(r) === cle(c))) res.push(c)
  }
  return res
}

function genIdentifier(niv, mode) {
  const f = tirerFraction(niv, mode)
  const forme = tirerForme(f.d)
  const colorees = partsColoriees(f.n, f.d)
  return {
    type: 'identifier', kind: 'choix', choixEn: 'frac', cle: `id${cle(f)}${forme.type}${colorees.join('-')}`,
    consigne: t('cIdentifier'),
    forme, colorees, reponse: f, choix: melanger([f, ...distracteursFraction(f, niv)]),
    libelle: `${t(forme.type)} : ${tn('partsColoriees', f.n, { d: f.d })}`,
    attendu: `${cle(f)} (${enLettres(f)})`,
  }
}

function genColorier(niv, mode) {
  const f = tirerFraction(niv, mode)
  const forme = tirerForme(f.d)
  return {
    type: 'colorier', kind: 'parts', cle: `co${cle(f)}${forme.type}`,
    consigne: t('cColorie'), fracConsigne: f, consigneFin: t('cColorieFin', { l: enLettres(f) }),
    forme, reponse: f,
    libelle: t('libColorier', { f: cle(f) }), attendu: tn('partsSur', f.n, { d: f.d }),
  }
}

function genLettres(niv, mode) {
  const f = tirerFraction(niv, mode)
  // distracteurs : vraies fractions, pour ne pas montrer d'écriture fausse
  const autres = distracteursFraction(f, niv).filter(c => niv.denominateurs.includes(c.d) && c.n <= 9)
  while (autres.length < 3) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !autres.some(r => cle(r) === cle(c))) autres.push(c)
  }
  const choix = melanger([f, ...autres.slice(0, 3)])
  if (Math.random() < 0.5) {
    return {
      type: 'lettres', kind: 'choix', choixEn: 'lettres', cle: `le${cle(f)}`,
      consigne: t('cSeLit'), fracAffichee: f, reponse: f, choix,
      libelle: t('libEnLettres', { f: cle(f) }), attendu: enLettres(f),
    }
  }
  return {
    type: 'lettres', kind: 'choix', choixEn: 'frac', cle: `lc${cle(f)}`,
    consigne: t('cEcrite'), texte: enLettres(f), reponse: f, choix,
    libelle: enLettres(f), attendu: cle(f),
  }
}

// Jetons ronds à partager (aide visuelle)
function svgJetons(total) {
  const parLigne = total <= 12 ? total : Math.ceil(total / 2) <= 12 ? Math.ceil(total / 2) : 10
  const lignes = Math.ceil(total / parLigne)
  const e = 30
  let s = ''
  for (let i = 0; i < total; i++) {
    const x = 18 + (i % parLigne) * e, y = 18 + Math.floor(i / parLigne) * e
    s += `<circle cx="${x}" cy="${y}" r="11" fill="#fde3b8" stroke="#c77c00" stroke-width="2"/>`
  }
  const w = parLigne * e + 6, h = lignes * e + 6
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" style="max-width:100%;height:auto;">${s}</svg>`
}

function genPartDe(niv) {
  const ds = Object.keys(niv.partDe).map(Number)
  const d = ds[aleatoire(0, ds.length - 1)]
  const cfg = niv.partDe[d]
  const possibles = []
  for (let t = 2 * d; t <= cfg.max; t += d) possibles.push(t)
  const totaux = Math.random() < 0.8 || !cfg.extra.length ? possibles : cfg.extra
  const total = totaux[aleatoire(0, totaux.length - 1)]
  const rep = total / d
  const nom = C.t(`partDe_${d}`)
  const texte = t('partDeTexte', { nom, total })
  return {
    type: 'partDe', kind: 'nombre', cle: `pd${d}-${total}`,
    consigne: t('partDeConsigne', { nom, parts: C.t('nbParts', { d }) }),
    texte, jetons: total <= 24 ? svgJetons(total) : null, reponse: rep, d, total,
    libelle: t('partDeLibelle', { nom, total }), attendu: `${rep} (${Array(d).fill(rep).join(' + ')} = ${total})`,
  }
}

// ─── CE2 : comparer à 1 ───
function genUnite(niv) {
  const d = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
  const r = Math.random()
  const n = r < 0.2 ? d : r < 0.55 ? aleatoire(1, d - 1) : aleatoire(d + 1, 2 * d)
  const f = { n, d }
  const reponse = n < d ? '<' : n > d ? '>' : '='
  const explication = n === d ? t('uniteEntiere', { d })
    : n < d ? t(d - n > 1 ? 'ilManquePl' : 'ilManque', { x: d - n, d })
    : t(n - d > 1 ? 'enPlusPl' : 'enPlus', { x: n - d, d })
  return {
    type: 'unite', kind: 'choix', choixEn: 'signe', cle: `un${cle(f)}`,
    consigne: t('cUnite'), fracAffichee: f, suffixe: '…  1',
    reponse, choix: ['<', '=', '>'],
    libelle: `${cle(f)} … 1`, attendu: `${cle(f)} ${reponse} 1 (${explication})`,
  }
}

// ─── CE2 : fractions égales simples (1/2 = 2/4) ───
function genEgales(niv) {
  const bases = []
  for (const d of [2, 3, 4, 5]) for (let n = 1; n < d; n++) for (let m = 2; m * d <= 10; m++) {
    if (niv.denominateurs.includes(m * d)) bases.push([{ n, d }, m])
  }
  const [f, m] = bases[aleatoire(0, bases.length - 1)]
  const g = { n: f.n * m, d: f.d * m }
  const forme = formeBarre(f.d)
  const colorees = Array.from({ length: f.n }, (_, i) => i)
  if (Math.random() < 0.5) {
    return {
      type: 'egales', kind: 'nombre', cle: `egn${cle(f)}-${g.d}`,
      consigne: t('cEgalesNombre'), forme, colorees, formeAide: formeBarre(g.d),
      egalite: { gauche: f, droite: { n: '?', d: g.d } }, reponse: g.n,
      libelle: `${cle(f)} = ?/${g.d}`, attendu: `${cle(f)} = ${cle(g)}`,
    }
  }
  // distracteurs : erreur « additive » (1/2 → 2/3), numérateur seul ou dénominateur seul multiplié
  const candidats = melanger([
    { n: f.n + 1, d: f.d + 1 }, { n: f.n + m, d: f.d + m }, { n: f.n, d: g.d }, { n: g.n, d: g.d + 1 },
    { n: g.n, d: f.d + m }, { n: f.d * m - g.n === g.n ? g.n + 1 : f.d * m - g.n, d: g.d },
  ])
  const choix = [g]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || c.n >= c.d || !niv.denominateurs.includes(c.d)) continue
    if (egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, dd - 1), d: dd }
    if (!egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'egales', kind: 'choix', choixEn: 'frac', cle: `egc${cle(f)}-${g.d}`,
    consigne: t('cEgalesChoix'), fracConsigne: f, consigneFin: ' ?', forme, colorees,
    reponse: g, choix: melanger(choix),
    libelle: t('libEgale', { f: cle(f) }), attendu: `${cle(g)} (${cle(f)} = ${cle(g)})`,
  }
}

// ─── CE2 : droite graduée en fractions ───
function droiteFraction(unites, d) {
  const x0 = 40, L = 520, ecart = L / (unites * d), y = 60
  const ticks = Array.from({ length: unites * d + 1 }, (_, i) => ({
    i, x: Math.round((x0 + i * ecart) * 100) / 100, unite: i % d === 0, label: i % d === 0 ? String(i / d) : null,
  }))
  return { unites, d, ticks, x0, L, y, largeur: x0 * 2 + L }
}

function svgDroiteFraction(dr, fleche = null) {
  const { y } = dr
  let s = `<line x1="${dr.x0 - 15}" y1="${y}" x2="${dr.x0 + dr.L + 15}" y2="${y}" stroke="#2c3e50" stroke-width="3"/>`
  for (const t of dr.ticks) {
    const h = t.unite ? 16 : 9
    s += `<line x1="${t.x}" y1="${y - h}" x2="${t.x}" y2="${y + h}" stroke="#2c3e50" stroke-width="${t.unite ? 3 : 2}"/>`
    if (t.label !== null) s += `<text x="${t.x}" y="${y + 40}" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${t.label}</text>`
  }
  if (fleche !== null) {
    const x = dr.ticks[fleche].x
    s += `<line x1="${x}" y1="${y - 48}" x2="${x}" y2="${y - 18}" stroke="#e74c3c" stroke-width="4"/>`
    s += `<polygon points="${x - 9},${y - 22} ${x + 9},${y - 22} ${x},${y - 10}" fill="#e74c3c"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dr.largeur} 110" width="${dr.largeur}" style="max-width:100%;height:auto;">${s}</svg>`
}

function tirerPointDroite(niv) {
  const unites = (niv.droiteUnites || [1])[aleatoire(0, (niv.droiteUnites || [1]).length - 1)]
  const dens = niv.denominateurs.filter(d => d * unites <= 12)   // graduations assez larges pour un doigt
  const d = dens[aleatoire(0, dens.length - 1)]
  let k
  do { k = aleatoire(1, unites * d - 1) } while (k % d === 0)
  return { dr: droiteFraction(unites, d), f: { n: k, d } }
}

function genDroite(niv) {
  const { dr, f } = tirerPointDroite(niv)
  const candidats = melanger([
    { n: f.n, d: dr.unites * dr.d },  // compte toutes les graduations
    { n: f.n + 1, d: f.d }, { n: f.n - 1, d: f.d }, { n: f.n, d: f.d + 1 }, { n: f.d, d: f.n },
  ])
  const choix = [f]
  for (const c of candidats) {
    if (choix.length === 4) break
    if (c.n < 1 || !niv.denominateurs.includes(c.d) || c.n === c.d || egales(c, f) || choix.some(x => cle(x) === cle(c))) continue
    choix.push(c)
  }
  let essais = 0
  while (choix.length < 4 && essais++ < 200) {
    const dd = Math.random() < 0.6 ? f.d : niv.denominateurs[aleatoire(0, niv.denominateurs.length - 1)]
    const c = { n: aleatoire(1, 2 * dd - 1), d: dd }
    if (c.n !== c.d && !egales(c, f) && !choix.some(x => cle(x) === cle(c))) choix.push(c)
  }
  return {
    type: 'droite', kind: 'choix', choixEn: 'frac', cle: `dr${dr.unites}-${cle(f)}`,
    consigne: t('cDroite', { d: dr.d }),
    svg: svgDroiteFraction(dr, f.n), droite: dr, reponse: f, choix: melanger(choix),
    libelle: t('libDroite', { u: dr.unites }), attendu: cle(f),
  }
}

function genPlacer(niv) {
  const { dr, f } = tirerPointDroite(niv)
  return {
    type: 'placer', kind: 'placer', cle: `pl${dr.unites}-${cle(f)}`,
    consigne: t('cPlacer'), fracConsigne: f, consigneFin: t('cPlacerFin'),
    droite: dr, reponse: f,
    libelle: t('libPlacer', { f: cle(f), u: dr.unites }), attendu: t('graduationApres0', { o: ordinal(f.n) }),
  }
}

const GENERATEURS = {
  identifier: genIdentifier, colorier: genColorier, lettres: genLettres, partDe: genPartDe,
  unite: genUnite, egales: genEgales, droite: genDroite, placer: genPlacer,
}

function genererQuestion(cfg, type) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  return GENERATEURS[type](niv, MODES[cfg.mode] ? cfg.mode : 'toutes')
}

function genererSansRepetition(cfg, nb) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let types = cfg.types.filter(t => GENERATEURS[t] && niv.types.includes(t))
  if (!types.length) types = niv.types
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = melanger(types)
  const ordre = melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const type = echecs > 20 ? types[aleatoire(0, types.length - 1)] : ordre[result.length]
    const qu = genererQuestion(cfg, type)
    if (!vus.has(qu.cle)) { vus.add(qu.cle); result.push(qu); echecs = 0 } else echecs++
  }
  return result
}

// SVG en texte (fiche imprimable)
function formeEnSvg(forme, colorees = []) {
  const paths = forme.parts.map((p, i) =>
    `<path d="${p}" fill="${colorees.includes(i) ? '#bbbbbb' : '#ffffff'}" stroke="#222" stroke-width="2.5" stroke-linejoin="round"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${forme.viewBox}" width="${Math.round(forme.largeur * 0.6)}">${paths}</svg>`
}

// #endregion generation

const config = ref({
  niveau: 'ce1', types: TYPES.map(ty => ty.id), mode: 'unitaires', nbQ: 10, nbFiche: 10,
  ...charger('fractions_config', {}),
})
// ancien réglage « corrigé » : remplacé par les options communes des fiches
delete config.value.corrige
// nombre de questions à l'écran et sur la fiche : réglages séparés, validés au chargement
const NB_JOUER = [5, 10, 15, 20]
const NB_FICHE = [5, 10, 15, 20, 30]
if (!NB_JOUER.includes(config.value.nbQ)) config.value.nbQ = 10
if (!NB_FICHE.includes(config.value.nbFiche)) config.value.nbFiche = 10
watch(config, v => sauvegarder('fractions_config', v), { deep: true })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'
if (!MODES[config.value.mode]) config.value.mode = 'unitaires'

const niveauData = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)
const typesNiveau = computed(() => TYPES.filter(t => niveauData.value.types.includes(t.id)))
watch(() => config.value.niveau, (nv, ancien) => {
  const n = niveauData.value
  if (ancien === undefined) {
    // au chargement : on garde la config enregistrée, débarrassée des exercices d'un autre niveau
    const types = config.value.types.filter(t => n.types.includes(t))
    config.value.types = types.length ? types : [...n.types]
  } else {
    // changement de niveau : tous les exercices du niveau et le mode conseillé
    config.value.types = [...n.types]
    config.value.mode = n.modeDefaut
  }
}, { immediate: true })

function toggleType(id) {
  const t = config.value.types
  if (t.includes(id)) {
    if (t.length === 1) return
    config.value.types = t.filter(x => x !== id)
  } else config.value.types = [...t, id]
}

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const reponse = ref('')
const coloriees = ref([])
const placement = ref(null)
const choixDonne = ref(null)
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const verrou = ref(false)
const inputEl = ref(null)
let timeout = null

const q = computed(() => questions.value[idx.value])

function estColoriee(i) {
  const question = q.value
  if (question.kind === 'parts') return coloriees.value.includes(i)
  return question.colorees?.includes(i)
}

function togglepart(i) {
  if (q.value.kind !== 'parts' || verrou.value) return
  coloriees.value = coloriees.value.includes(i)
    ? coloriees.value.filter(x => x !== i)
    : [...coloriees.value, i]
}

function demarrer() {
  clearTimeout(timeout)
  questions.value = genererSansRepetition(config.value, config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  afficherQuestion()
}

function quitter() {
  clearTimeout(timeout)
  phase.value = 'config'
}

function afficherQuestion() {
  reponse.value = ''; coloriees.value = []; choixDonne.value = null; placement.value = null
  feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  verrou.value = false
  nextTick(() => { if (q.value?.kind === 'nombre') inputEl.value?.focus() })
}

function placer(i) {
  if (verrou.value) return
  placement.value = i
}

function choisirReponse(c) {
  if (verrou.value) return
  choixDonne.value = c
  const question = q.value
  corriger(cle(c) === cle(question.reponse), question.choixEn === 'lettres' ? enLettres(c) : cle(c))
}

function valider() {
  if (verrou.value) return
  const question = q.value
  if (question.kind === 'nombre') {
    const val = String(reponse.value).trim()
    if (val === '') return
    corriger(+val === question.reponse, val)
  } else if (question.kind === 'placer') {
    if (placement.value === null) return
    const k = placement.value
    corriger(k === question.reponse.n, t('graduation', { o: ordinal(k) }))
  } else if (question.kind === 'parts') {
    if (!coloriees.value.length) return
    const n = coloriees.value.length
    corriger(n === question.reponse.n, tn('partsSur', n, { d: question.reponse.d }))
  }
}

function corriger(ok, donne) {
  const question = q.value
  verrou.value = true
  if (ok) {
    inputClass.value = 'ok'
    const bravos = t('bravo')
    feedback.value = bravos[aleatoire(0, bravos.length - 1)]
    feedbackClass.value = 'ok'
    bonnes.value++
  } else {
    inputClass.value = 'erreur'
    feedback.value = t('laBonne', { r: question.attendu })
    feedbackClass.value = 'erreur'
    mauvaises.value++
  }
  historique.value.push({ libelle: question.libelle, donne, attendu: question.attendu, ok })
  timeout = setTimeout(suivant, ok ? 900 : 2200)
}

function passer() {
  if (verrou.value) return
  const question = q.value
  mauvaises.value++
  historique.value.push({ libelle: question.libelle, donne: t('passe'), attendu: question.attendu, ok: false })
  suivant()
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else afficherQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('resultat80') }
  if (pct >= 60)   return t('resultat60')
  if (pct >= 40)   return t('resultat40')
  return t('resultat0')
})

onUnmounted(() => clearTimeout(timeout))

// ─── Fiche imprimable ────────────────────────────────────────────────────────
const fracHtml = f => `<span class="frac"><span>${f.n}</span><span>${f.d}</span></span>`
const fracVide = '<span class="frac-vide"><span class="vide"></span><span class="barre"></span><span class="vide"></span></span>'

function questionPapier(qu, i) {
  const num = `<span class="num">${i + 1}.</span>`
  switch (qu.type) {
    case 'identifier':
      return `<div class="q">${num}<div class="forme">${formeEnSvg(qu.forme, qu.colorees)}</div><div>${t('pIdentifier')} ${fracVide}</div></div>`
    case 'colorier':
      return `<div class="q">${num}<div class="forme">${formeEnSvg(qu.forme)}</div><div>${t('pColorie', { f: fracHtml(qu.reponse) })}</div></div>`
    case 'lettres':
      return qu.choixEn === 'lettres'
        ? `<div class="q">${num}<div>${t('pEnLettres', { f: fracHtml(qu.reponse) })} <span class="ligne longue"></span></div></div>`
        : `<div class="q">${num}<div>${t('pEnChiffres', { f: `<b>${qu.texte}</b>` })} ${fracVide}</div></div>`
    case 'partDe':
      return `<div class="q">${num}<div>${t('pPartDe', { l: qu.libelle })} <span class="ligne"></span></div></div>`
    case 'unite':
      return `<div class="q">${num}<div>${fracHtml(qu.fracAffichee)} <span class="case"></span> 1 &nbsp; <small>(&lt; , = ou &gt;)</small></div></div>`
    case 'egales':
      return qu.kind === 'nombre'
        ? `<div class="q">${num}<div>${t('pComplete')} ${fracHtml(qu.egalite.gauche)} = <span class="frac-vide"><span class="vide"></span><span class="barre"></span><b>${qu.egalite.droite.d}</b></span></div></div>`
        : `<div class="q">${num}<div>${t('pEntoure', { f: fracHtml(qu.fracConsigne) })} &nbsp; ${qu.choix.map(fracHtml).join(' &nbsp;&nbsp; ')}</div></div>`
    case 'droite':
      return `<div class="q">${num}<div style="width:100%">${t('pDroite')}<div>${svgDroiteFraction(qu.droite, qu.reponse.n)}</div>${t('pReponse')} ${fracVide}</div></div>`
    case 'placer':
      return `<div class="q">${num}<div style="width:100%">${t('pPlacer', { f: fracHtml(qu.reponse) })}<div>${svgDroiteFraction(qu.droite)}</div></div></div>`
    default:
      return ''
  }
}

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const qs = genererSansRepetition(config.value, config.value.nbFiche)
  const niv = config.value.niveau.toUpperCase()
  const rows = qs.map(questionPapier).join('')
  const corrige = `<section class="corrige"><h2>${t('corrige')}</h2>
    <ol class="reponses">${qs.map(qu => `<li>${qu.attendu}</li>`).join('')}</ol></section>`

  return `<!DOCTYPE html><html lang="${langueContenu.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niv}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .q { display: flex; align-items: center; gap: 1rem; margin: 1rem 0; font-size: 1.15rem; page-break-inside: avoid; flex-wrap: wrap; }
      .num { min-width: 1.8rem; font-weight: 700; color: #777; }
      .frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; font-weight: 800; margin: 0 .2rem; }
      .frac > span:first-child { border-bottom: 2px solid #222; padding: 0 .3rem; }
      .frac-vide { display: inline-flex; flex-direction: column; align-items: center; gap: 3px; vertical-align: middle; margin: 0 .3rem; }
      .frac-vide .vide { display: block; width: 2rem; height: 1.6rem; border: 1.5px solid #555; border-radius: 3px; }
      .frac-vide .barre { display: block; width: 2.6rem; border-top: 2.5px solid #222; }
      .case { display: inline-block; width: 2.2rem; height: 2rem; border: 2px solid #555; border-radius: 4px; vertical-align: middle; }
      small { color: #777; }
      .ligne { display: inline-block; width: 4rem; border-bottom: 1.5px solid #555; height: 1.3rem; }
      .ligne.longue { width: 14rem; }
      .reponses { columns: 2; column-gap: 2rem; font-size: 1.05rem; line-height: 1.9; }
      .reponses li { break-inside: avoid; font-weight: 700; }
    </style></head><body>
    <h1>${t('titre')} — ${niv}</h1>
    <p class="infos">${t('pNbQuestions', { n: qs.length })}</p>
    ${ligneNomDate(langueContenu.value)}
    ${rows}
    ${corrige}
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
// recalculée quand les réglages changent ou qu'on demande une nouvelle fiche
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})
</script>

<style scoped>
.consigne {
  text-align: center; font-size: 1.2rem; font-weight: 700; color: #555; margin: .5rem 0;
  display: flex; align-items: center; justify-content: center; gap: .35rem; flex-wrap: wrap;
}
.visuel { text-align: center; margin: 1rem 0; }
.forme-svg { max-width: 100%; height: auto; }
.forme-svg.cliquable path { cursor: pointer; }
.forme-svg.cliquable path:hover { opacity: .85; }
.aide { font-size: .9rem; color: #777; margin-top: .3rem; }
.question-texte { font-size: 2rem; letter-spacing: 0; }

.frac {
  display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle;
  font-weight: 900; line-height: 1.1;
}
.frac > span:first-child { border-bottom: 3px solid currentColor; padding: 0 .25em; }
.frac-grande  { font-size: 3rem; }
.frac-moyenne { font-size: 1.5rem; }

.choix-grid { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; margin: 1rem 0; }
.choix-lettres { flex-direction: column; align-items: stretch; max-width: 360px; margin-left: auto; margin-right: auto; }
.choix-btn {
  min-width: 4.5rem; min-height: 4rem; padding: .5rem 1.2rem;
  font-size: 1.3rem; font-weight: 800; background: white; color: var(--texte);
  border: 3px solid var(--gris-brd); border-radius: var(--radius); cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn:disabled { opacity: .45; cursor: default; }
.choix-btn.ok     { border-color: var(--vert); background: #f0faf0; opacity: 1; }
.choix-btn.erreur { border-color: var(--rouge); background: #fef0f0; opacity: 1; }

.btn:disabled { opacity: .45; cursor: default; }
</style>

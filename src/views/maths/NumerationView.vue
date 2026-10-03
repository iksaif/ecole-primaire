<template>
  <div class="container">
    <h1 class="section-heading">🔢 {{ t('titre', { n: fmt(niveauData.plages[niveauData.plages.length - 1]) }) }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche"
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
          <button v-for="ty in TYPES" :key="ty.id"
            class="level-btn" :class="{ active: config.types.includes(ty.id) }"
            @click="toggleType(ty.id)">{{ tr(ty.label) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nombresJusqua') }}</div>
        <div class="btn-group">
          <button v-for="p in niveauData.plages" :key="p"
            class="level-btn" :class="{ active: config.plage === p }"
            @click="config.plage = p">{{ fmt(p) }}</button>
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

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('corrigeFin') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.corrige }" @click="config.corrige = true">{{ t('oui') }}</button>
          <button class="level-btn" :class="{ active: !config.corrige }" @click="config.corrige = false">{{ t('non') }}</button>
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

        <div class="consigne">{{ q.consigne }}</div>

        <div v-if="q.svg" class="visuel" v-html="q.svg"></div>
        <div v-if="q.type === 'representation'" class="legende">
          <template v-if="q.milliers">{{ t('legendeMillier') }} &nbsp;·&nbsp; </template>{{ t('legende') }}
        </div>

        <div v-if="q.texte" class="exercise-question" :class="{ 'question-lettres': q.texteLong }">{{ q.texte }}</div>

        <!-- Réponse : un nombre -->
        <input v-if="q.kind === 'nombre'" ref="inputEl" class="exercise-input" :class="inputClass"
               type="number" inputmode="numeric" placeholder="?"
               v-model="reponse" autocomplete="off" :disabled="verrou" @keydown.enter="valider">

        <!-- Réponse : centaines / dizaines / unités -->
        <div v-else-if="q.kind === 'cdu'" class="cdu-row">
          <label v-for="(champ, ci) in q.champs" :key="champ" class="cdu-champ">
            <input :ref="el => setCduRef(el, ci)" class="cdu-input" :class="cduEtats[champ]"
                   type="text" inputmode="numeric" maxlength="1" autocomplete="off"
                   v-model="cdu[champ]" :disabled="verrou"
                   @input="onCduInput(ci)" @keydown.enter="valider">
            <span class="cdu-label">{{ t(LIBELLES_CDU[champ]) }}</span>
          </label>
        </div>

        <!-- Réponse : choix (QCM, comparaison) -->
        <div v-else-if="q.kind === 'choix'" class="choix-grid" :class="{ 'choix-signes': q.type === 'comparer', 'choix-lettres': q.type === 'chiffresLettres' }">
          <button v-for="c in q.choix" :key="c" class="choix-btn"
            :class="{ ok: verrou && c === q.reponse, erreur: verrou && c === choixDonne && c !== q.reponse }"
            :disabled="verrou" @click="choisir(c)">{{ c }}</button>
        </div>

        <!-- Réponse : ranger dans l'ordre -->
        <div v-else-if="q.kind === 'ordre'">
          <div class="ordre-ligne">
            <span v-for="(_, i) in q.nombres" :key="'s' + i" class="ordre-case"
              :class="verrou ? (ordre[i] === q.reponse[i] ? 'ok' : 'erreur') : ''">
              {{ ordre[i] !== undefined ? fmt(ordre[i]) : '' }}
            </span>
          </div>
          <div class="choix-grid">
            <button v-for="n in q.nombres" :key="n" class="choix-btn"
              :disabled="verrou || ordre.includes(n)" @click="ajouterOrdre(n)">{{ fmt(n) }}</button>
          </div>
          <div style="text-align:center;margin-top:.5rem;">
            <button class="btn btn-ghost" :disabled="verrou || !ordre.length" @click="ordre.pop()">{{ t('annuler') }}</button>
          </div>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost" :disabled="verrou" @click="passer">{{ t('passer') }}</button>
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
import { enLettresFr, enLettresBr, decomposer } from '../../utils/nombres'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, tr, langue } = useI18n({
  fr: {
    titre: "Les nombres jusqu'à {n}",
    nombresJusqua: "Nombres jusqu'à",
    colQuestion: 'Question',
    legendeMillier: '1 gros cube = 1000',
    legende: '1 plaque = 100 · 1 barre = 10 · 1 cube = 1',
    lib_milliers: 'milliers', lib_centaines: 'centaines', lib_dizaines: 'dizaines', lib_unites: 'unités',
    et: 'et',
    cDecomposer: 'Décompose le nombre en {liste}.',
    cEcrisNombre: 'Écris le nombre.',
    cRepresente: 'Quel nombre est représenté ?',
    cEnChiffres: 'Écris ce nombre en chiffres.',
    cEnLettres: "Comment s'écrit ce nombre en lettres ?",
    cSigne: 'Choisis le bon signe : < , = ou >',
    justeApres: 'Le nombre juste après {n}',
    justeAvant: 'Le nombre juste avant {n}',
    cTrouve: 'Trouve le nombre.',
    cCalcule: 'Calcule.',
    cSuite: 'Complète la suite.',
    cDroite: 'Quel nombre montre la flèche ? (on avance de {pas} à chaque graduation)',
    libDroite: 'Droite de {a} à {b}',
    cRanger: 'Clique sur les nombres du plus petit au plus grand.',
    cliqueTous: 'Clique sur tous les nombres 😉',
    laBonne: '❌ La bonne réponse : {r}',
    pRepresente: 'Quel nombre est représenté ?',
    pLegende: '({m}plaque = 100, barre = 10, cube = 1)',
    pLegendeM: 'gros cube = 1000, ',
    pCestLeNombre: "C'est le nombre",
    pEnChiffres: 'en chiffres :',
    pEcrisLettres: 'Écris {n} en lettres :',
    pFlecheQ: 'Quel nombre montre la flèche ?',
    pFlecheAide: '(on avance de {pas} à chaque graduation)',
    pFlecheMontre: 'La flèche montre',
    pRange: 'Range du plus petit au plus grand :',
    pSuite: 'Complète la suite :',
    pNbQuestions: '{n} questions',
    corrigeFin: 'Corrigé (page à part)',
  },
  br: {
    titre: 'An niveroù betek {n}',
    nombresJusqua: 'Niveroù betek',
    colQuestion: 'Goulenn',
    legendeMillier: '1 kub bras = 1000',
    legende: '1 plakenn = 100 · 1 barrenn = 10 · 1 kub = 1',
    lib_milliers: 'miladoù', lib_centaines: 'kantadoù', lib_dizaines: 'degadoù', lib_unites: 'unanennoù',
    et: 'ha',
    cDecomposer: 'Dispenn an niver e {liste}.', // br: à relire (« dispenn » = décomposer)
    cEcrisNombre: 'Skriv an niver.',
    cRepresente: 'Pe niver a welez ?',
    cEnChiffres: 'Skriv an niver-mañ e sifroù.',
    cEnLettres: 'Penaos e skriver an niver-mañ e lizherennoù ?',
    cSigne: 'Dibab an arouez mat : < , = pe >',
    justeApres: 'An niver diouzhtu war-lerc\'h {n}',
    justeAvant: 'An niver diouzhtu a-raok {n}',
    cTrouve: 'Kav an niver.',
    cCalcule: 'Jed.',
    cSuite: 'Kloka an heuliad.', // br: à relire
    cDroite: 'Pe niver a ziskouez ar bir ? (+ {pas} bep derez)', // br: à relire (« derez » = graduation)
    libDroite: 'Linenn eus {a} betek {b}',
    cRanger: "Klik war an niveroù eus ar bihanañ d'ar brasañ.",
    cliqueTous: 'Klik war an holl niveroù 😉',
    laBonne: '❌ Ar respont mat : {r}',
    pRepresente: 'Pe niver a welez ?',
    pLegende: '({m}plakenn = 100, barrenn = 10, kub = 1)',
    pLegendeM: 'kub bras = 1000, ',
    pCestLeNombre: 'An niver eo',
    pEnChiffres: 'e sifroù :',
    pEcrisLettres: 'Skriv {n} e lizherennoù :',
    pFlecheQ: 'Pe niver a ziskouez ar bir ?',
    pFlecheAide: '(+ {pas} bep derez)', // br: à relire
    pFlecheMontre: 'Ar bir a ziskouez',
    pRange: "Renk eus ar bihanañ d'ar brasañ :",
    pSuite: 'Kloka an heuliad :', // br: à relire
    pNbQuestions: '{n} goulenn',
    corrigeFin: 'Reizhadenn (war ur bajenn all)', // br: à relire
  },
})
const enLettres = n => (langue.value === 'br' ? enLettresBr(n) : enLettresFr(n))

// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau : plages proposées, pas des droites graduées et des suites.
const NIVEAUX = {
  ce1: {
    plages: [100, 1000],
    pasDroite: { 100: [1, 10], 1000: [1, 10, 100] },
    pasSuites: { 100: [1, 2, 5, 10], 1000: [1, 10, 100] },
    pasPlusMoins: { 100: [10], 1000: [10, 100] },
    nbRanger: 5,
  },
  ce2: {
    plages: [1000, 10000],
    pasDroite: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasSuites: { 1000: [1, 10, 100], 10000: [10, 100, 1000] },
    pasPlusMoins: { 1000: [10, 100], 10000: [10, 100, 1000] },
    nbRanger: 5,
  },
}

const TYPES = [
  { id: 'decomposer',      label: { fr: '🧱 Décomposer', br: '🧱 Dispenn' } }, // br: à relire
  { id: 'representation',  label: { fr: '🟦 Représentation', br: '🟦 Skeudenn' } }, // br: à relire
  { id: 'lettresChiffres', label: { fr: '✏️ Écrire en chiffres', br: '✏️ Skrivañ e sifroù' } },
  { id: 'chiffresLettres', label: { fr: '🔤 Écrire en lettres', br: '🔤 Skrivañ e lizherennoù' } },
  { id: 'comparer',        label: { fr: '⚖️ Comparer', br: '⚖️ Keñveriañ' } },
  { id: 'suites',          label: { fr: '➡️ Suivant / suites', br: "➡️ Da-heul / heuliadoù" } },
  { id: 'droite',          label: { fr: '📏 Droite graduée', br: '📏 Linenn dereziet' } }, // br: à relire
  { id: 'ranger',          label: { fr: '📶 Ranger', br: '📶 Renkañ' } },
]

// Titres des cases (pluriel) et noms au singulier pour les accords
// (clés de traduction ; en breton le nom reste au singulier après un nombre)
const LIBELLES_CDU = { milliers: 'lib_milliers', centaines: 'lib_centaines', dizaines: 'lib_dizaines', unites: 'lib_unites' }
const SINGULIERS_CDU = { milliers: 'millier', centaines: 'centaine', dizaines: 'dizaine', unites: 'unité' }
const SINGULIERS_CDU_BR = { milliers: 'milad', centaines: 'kantad', dizaines: 'degad', unites: 'unanenn' }
const VALEURS_CDU = { milliers: 1000, centaines: 100, dizaines: 10, unites: 1 }

function pluriel(n, mot) {
  return n >= 2 ? mot + 's' : mot
}
const libCdu = (v, champ) => langue.value === 'br'
  ? `${v} ${SINGULIERS_CDU_BR[champ]}`
  : `${v} ${pluriel(v, SINGULIERS_CDU[champ])}`

// 10 000 s'écrit avec une espace ; en dessous on garde 3 400 sans espace (plus simple à recopier)
const fmt = n => n >= 10000 ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : String(n)

const nbChiffres = max => max <= 100 ? 2 : max <= 1000 ? 3 : 4
const champsPour = max => ['milliers', 'centaines', 'dizaines', 'unites'].slice(4 - nbChiffres(max))
const chiffresDe = n => String(n).split('').map(Number)

// Tire un nombre « intéressant » ayant le nombre de chiffres de la plage,
// avec régulièrement des 0 (305, 340, 4 060) et des dizaines 70/80/90.
function tirerNombre(max, { zeros = true, dizainesDifficiles = 0.2 } = {}) {
  const k = nbChiffres(max)
  const ch = [aleatoire(1, 9), ...Array.from({ length: k - 1 }, () => aleatoire(0, 9))]
  if (Math.random() < dizainesDifficiles) ch[k - 2] = aleatoire(7, 9)
  if (zeros) {
    if (k === 2 && Math.random() < 0.15) ch[1] = 0
    if (k >= 3 && Math.random() < 0.3) ch[aleatoire(1, k - 1)] = 0
    if (k === 4 && Math.random() < 0.15) ch[aleatoire(1, k - 1)] = 0
  }
  return +ch.join('')
}

function genDecomposer(niv, max) {
  const n = tirerNombre(max)
  const dec = decomposer(n)
  const champs = champsPour(max)
  const reponse = Object.fromEntries(champs.map(ch => [ch, dec[ch]]))
  const attendu = champs.map(ch => libCdu(reponse[ch], ch)).join(' ')
  const noms = champs.map(ch => t(LIBELLES_CDU[ch]))
  if (Math.random() < 0.5) {
    return {
      type: 'decomposer', kind: 'cdu', cle: 'dec' + n,
      consigne: t('cDecomposer', { liste: `${noms.slice(0, -1).join(', ')} ${t('et')} ${noms[noms.length - 1]}` }),
      texte: fmt(n), champs, reponse,
      libelle: `${fmt(n)} = ?`, attendu,
    }
  }
  // Recomposer : on omet les termes nuls (piège : 3 centaines + 7 unités = 307)
  let termes = champs.filter(ch => reponse[ch]).map(ch => libCdu(reponse[ch], ch))
  if (termes.length > 1 && Math.random() < 0.3) termes = melanger(termes)
  const texte = termes.join(' + ')
  return {
    type: 'decomposer', kind: 'nombre', cle: 'rec' + texte,
    consigne: t('cEcrisNombre'), texte, texteLong: true, reponse: n,
    libelle: `${texte} = ?`, attendu: fmt(n),
  }
}

// Dessin SVG du matériel base 10 : gros cubes (1000), plaques (100), barres (10), cubes (1)
function svgBase10(m, c, d, u) {
  const s = 8, L = 10 * s, gap = 8
  let x = 4
  const parts = []
  const lignes = (x0, y0, w, h, nx, ny, coul) => {
    let r = ''
    for (let i = 1; i < nx; i++) r += `<line x1="${x0 + i * s}" y1="${y0}" x2="${x0 + i * s}" y2="${y0 + h}" stroke="${coul}" stroke-width="0.7"/>`
    for (let j = 1; j < ny; j++) r += `<line x1="${x0}" y1="${y0 + j * s}" x2="${x0 + w}" y2="${y0 + j * s}" stroke="${coul}" stroke-width="0.7"/>`
    return r
  }
  let hauteur = L
  // Gros cubes (1000) en perspective : face avant quadrillée + dessus + côté
  if (m > 0) {
    const p = 22, C = L - p  // profondeur, côté de la face avant
    for (let i = 0; i < m; i++) {
      const px = x + (i % 5) * (L + gap), py = 4 + Math.floor(i / 5) * (L + gap)
      const fx = px, fy = py + p
      parts.push(`<polygon points="${fx},${fy} ${fx + p},${py} ${fx + p + C},${py} ${fx + C},${fy}" fill="#e6d5f5" stroke="#6c3483" stroke-width="1.5"/>`)
      parts.push(`<polygon points="${fx + C},${fy} ${fx + C + p},${py} ${fx + C + p},${py + C} ${fx + C},${fy + C}" fill="#c9a6e4" stroke="#6c3483" stroke-width="1.5"/>`)
      parts.push(`<rect x="${fx}" y="${fy}" width="${C}" height="${C}" fill="#ddc4f0" stroke="#6c3483" stroke-width="1.5"/>`)
      for (let k = 1; k < 10; k++) {
        parts.push(`<line x1="${fx + k * C / 10}" y1="${fy}" x2="${fx + k * C / 10}" y2="${fy + C}" stroke="#9b6fc0" stroke-width="0.6"/>`)
        parts.push(`<line x1="${fx}" y1="${fy + k * C / 10}" x2="${fx + C}" y2="${fy + k * C / 10}" stroke="#9b6fc0" stroke-width="0.6"/>`)
      }
    }
    hauteur = Math.max(hauteur, Math.ceil(m / 5) * (L + gap) - gap)
    x += Math.min(m, 5) * (L + gap) + 12
  }
  // Plaques : 5 par ligne
  if (c > 0) {
    for (let i = 0; i < c; i++) {
      const px = x + (i % 5) * (L + gap), py = 4 + Math.floor(i / 5) * (L + gap)
      parts.push(`<rect x="${px}" y="${py}" width="${L}" height="${L}" fill="#cfe3fb" stroke="#2f6db3" stroke-width="1.5"/>`)
      parts.push(lignes(px, py, L, L, 10, 10, '#6fa0d8'))
    }
    hauteur = Math.max(hauteur, Math.ceil(c / 5) * (L + gap) - gap)
    x += Math.min(c, 5) * (L + gap) + 12
  }
  // Barres verticales
  if (d > 0) {
    for (let i = 0; i < d; i++) {
      const bx = x + i * (s + 6)
      parts.push(`<rect x="${bx}" y="4" width="${s}" height="${L}" fill="#d4f0d4" stroke="#3d8b3d" stroke-width="1.5"/>`)
      parts.push(lignes(bx, 4, s, L, 1, 10, '#7cc47c'))
    }
    x += d * (s + 6) + 12
  }
  // Cubes : colonnes de 5
  if (u > 0) {
    for (let i = 0; i < u; i++) {
      const cx = x + Math.floor(i / 5) * (s + 6), cy = 4 + (i % 5) * (s + 6)
      parts.push(`<rect x="${cx}" y="${cy}" width="${s}" height="${s}" fill="#fde3b8" stroke="#c77c00" stroke-width="1.5"/>`)
    }
    x += Math.ceil(u / 5) * (s + 6)
  }
  const w = x + 4, h = hauteur + 8
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${Math.min(w * 1.5, 900)}" style="max-width:100%;height:auto;">${parts.join('')}</svg>`
}

function genRepresentation(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0 })
  let { milliers: m, centaines: c, dizaines: d, unites: u } = decomposer(n)
  // Parfois plus de 9 cubes : il faut faire un échange (1 dizaine = 10 unités)
  if (Math.random() < 0.2 && d >= 1 && u <= 4) { d -= 1; u += 10 }
  const morceaux = []
  if (langue.value === 'br') {
    if (m) morceaux.push(`${m} kub bras`)
    if (c) morceaux.push(`${c} plakenn`)
    morceaux.push(`${d} barrenn`, `${u} kub`)
  } else {
    if (m) morceaux.push(`${m} gros cube${m > 1 ? 's' : ''}`)
    if (c) morceaux.push(`${c} plaque${c > 1 ? 's' : ''}`)
    morceaux.push(`${d} barre${d > 1 ? 's' : ''}`, `${u} cube${u > 1 ? 's' : ''}`)
  }
  return {
    type: 'representation', kind: 'nombre', cle: `rep${m}-${c}-${d}-${u}`,
    consigne: t('cRepresente'), texte: '', reponse: n, milliers: m > 0 || max > 1000,
    svg: svgBase10(m, c, d, u), libelle: morceaux.join(', '), attendu: fmt(n),
  }
}

function genLettresChiffres(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0.35 })
  const texte = enLettres(n)
  return {
    type: 'lettresChiffres', kind: 'nombre', cle: 'lc' + n,
    consigne: t('cEnChiffres'), texte, texteLong: true, reponse: n,
    libelle: texte, attendu: fmt(n),
  }
}

// Distracteurs plausibles pour l'écriture en lettres
function distracteurs(n, max, nb = 3) {
  const ch = chiffresDe(n), k = ch.length
  const d = ch[k - 2]
  const ok = v => Number.isInteger(v) && v >= 10 && v <= max && v !== n
  const pieges = []
  if (d === 7 || d === 9) pieges.push(n - 10)          // soixante-quinze / soixante-cinq
  if (d === 6 || d === 8) pieges.push(n + 10)          // soixante-cinq / soixante-quinze
  if (d === 8) pieges.push(n - 60)                     // quatre-vingt-deux / vingt-deux
  if (d === 2) pieges.push(n + 60)
  // 0 mal placé : 2 030 / 2 300 / 2 003
  for (let i = 1; i < k; i++) for (let j = 1; j < k; j++) {
    if (i !== j && ch[i] === 0 && ch[j] !== 0) {
      const tab = [...ch]; [tab[i], tab[j]] = [tab[j], tab[i]]; pieges.push(+tab.join(''))
    }
  }
  // chiffres échangés
  const perms = []
  for (let i = 0; i < k; i++) for (let j = i + 1; j < k; j++) {
    const tab = [...ch]; [tab[i], tab[j]] = [tab[j], tab[i]]
    if (tab[0] !== 0) perms.push(+tab.join(''))
  }
  const voisins = [n + 10, n - 10, n + 1, n - 1]
  if (k >= 3) voisins.push(n + 100, n - 100)
  if (k >= 4) voisins.push(n + 1000, n - 1000)
  const res = []
  for (const v of [...melanger(pieges), ...melanger(perms), ...melanger(voisins)]) {
    if (ok(v) && !res.includes(v)) res.push(v)
    if (res.length === nb) break
  }
  let essais = 0
  while (res.length < nb && essais++ < 100) {
    const v = aleatoire(10, max - 1)
    if (ok(v) && !res.includes(v)) res.push(v)
  }
  return res
}

function genChiffresLettres(niv, max) {
  const n = tirerNombre(max, { dizainesDifficiles: 0.4 })
  const bonne = enLettres(n)
  const choix = melanger([bonne, ...distracteurs(n, max).map(v => enLettres(v))])
  return {
    type: 'chiffresLettres', kind: 'choix', cle: 'cl' + n,
    consigne: t('cEnLettres'), texte: fmt(n), reponse: bonne, choix,
    libelle: fmt(n), attendu: bonne,
  }
}

function genComparer(niv, max) {
  const a = tirerNombre(max, { dizainesDifficiles: 0 })
  const ch = chiffresDe(a), k = ch.length
  let b
  const r = Math.random()
  if (r < 0.1) b = a
  else if (r < 0.35) {                                                   // deux chiffres échangés
    const i = aleatoire(Math.min(1, k - 2), k - 2), t = [...ch];
    [t[i], t[i + 1]] = [t[i + 1], t[i]]; b = +t.join('')
  }
  else if (r < 0.6) b = a - a % 10 + aleatoire(0, 9)                      // même dizaine
  else if (r < 0.75 && k > 2) b = tirerNombre(Math.pow(10, k - 1))        // un chiffre de moins
  else b = a - a % Math.pow(10, k - 1) + aleatoire(0, Math.pow(10, k - 1) - 1)  // même premier chiffre
  if (b < 1 || (b === a && r >= 0.1)) b = a + (Math.random() < 0.5 ? 1 : 10)
  if (b > max) b = a - 1
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a]
  const reponse = x < y ? '<' : x > y ? '>' : '='
  return {
    type: 'comparer', kind: 'choix', cle: `cmp${x}-${y}`,
    consigne: t('cSigne'), texte: `${fmt(x)}  …  ${fmt(y)}`, reponse, choix: ['<', '=', '>'],
    libelle: `${fmt(x)} … ${fmt(y)}`, attendu: `${fmt(x)} ${reponse} ${fmt(y)}`,
  }
}

function genSuites(niv, max) {
  const r = Math.random()
  if (r < 0.2) {
    // juste après / juste avant, souvent sur un passage de dizaine, centaine ou millier
    const apres = Math.random() < 0.5
    let n = tirerNombre(max, { zeros: false, dizainesDifficiles: 0 })
    if (Math.random() < 0.5) n = apres ? n - n % 10 + 9 : n - n % 10
    if (max > 100 && Math.random() < 0.3) n = apres ? n - n % 100 + 99 : n - n % 100
    if (max > 1000 && Math.random() < 0.3) n = apres ? n - n % 1000 + 999 : n - n % 1000
    if (n < 1) n = 10
    const rep = apres ? n + 1 : n - 1
    const texte = t(apres ? 'justeApres' : 'justeAvant', { n: fmt(n) })
    return {
      type: 'suites', kind: 'nombre', cle: 'sv' + texte, consigne: t('cTrouve'),
      texte, texteLong: true, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  if (r < 0.45) {
    // + 10, − 10, + 100, − 100, + 1000… souvent avec un passage (395 + 10, 305 − 10, 3 950 + 100)
    const pasPossibles = niv.pasPlusMoins[max]
    const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
    const plus = Math.random() < 0.5
    const bloc = pas * 10
    const passage = bloc < max && Math.random() < 0.5
    let n
    if (plus) n = passage ? bloc * aleatoire(0, max / bloc - 2) + (bloc - pas) + aleatoire(0, pas - 1) : aleatoire(1, max - pas)
    else n = passage ? bloc * aleatoire(1, max / bloc - 1) + aleatoire(0, pas - 1) : aleatoire(pas, max)
    const rep = plus ? n + pas : n - pas
    const texte = `${fmt(n)} ${plus ? '+' : '−'} ${fmt(pas)} = ?`
    return {
      type: 'suites', kind: 'nombre', cle: 'pm' + texte, consigne: t('cCalcule'),
      texte, reponse: rep, libelle: texte, attendu: fmt(rep),
    }
  }
  // Suite à compléter
  const pasPossibles = niv.pasSuites[max]
  const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
  const nbTermes = 5
  const etendue = pas * (nbTermes - 1)
  let debut
  if (pas >= 10 && pas * 10 >= max) debut = (pas / 10) * aleatoire(0, (max - etendue) / (pas / 10))  // 200, 300… ou 250, 350…
  else if (pas >= 10) {
    // passage : 370, 380, 390, 400… ou 375, 385, 395, 405…
    const bloc = pas * 10
    const cible = bloc * aleatoire(1, max / bloc - 1)
    debut = cible - pas * aleatoire(1, nbTermes - 2) - (Math.random() < 0.4 ? aleatoire(1, 9) * (pas / 10) : 0)
  } else {
    // pas de 1, 2 ou 5 : passage de dizaine (58, 59, 60…) ou de centaine (398, 399, 400…)
    const bloc = max > 100 && Math.random() < 0.4 ? 100 : 10
    const cible = bloc * aleatoire(1, max / bloc - 1)
    debut = cible - pas * aleatoire(1, nbTermes - 2)
  }
  debut = Math.max(0, Math.min(debut, max - etendue))
  let termes = Array.from({ length: nbTermes }, (_, i) => debut + i * pas)
  if (Math.random() < 0.25) termes.reverse()
  const trou = aleatoire(1, nbTermes - 1)
  const rep = termes[trou]
  const texte = termes.map((t, i) => i === trou ? '?' : fmt(t)).join(', ')
  return {
    type: 'suites', kind: 'nombre', cle: 'su' + texte, consigne: t('cSuite'),
    texte, texteLong: true, reponse: rep, termes, trou, libelle: texte, attendu: fmt(rep),
  }
}

// Droite graduée : 11 graduations, extrémités notées, flèche sur une graduation
function svgDroite(debut, pas, k, { fleche = true } = {}) {
  const x0 = 50, ecart = 50, y = 70
  let s = `<line x1="${x0 - 20}" y1="${y}" x2="${x0 + 10 * ecart + 20}" y2="${y}" stroke="#2c3e50" stroke-width="3"/>`
  for (let i = 0; i <= 10; i++) {
    const x = x0 + i * ecart
    const h = i === 0 || i === 10 ? 16 : i === 5 ? 13 : 9
    s += `<line x1="${x}" y1="${y - h}" x2="${x}" y2="${y + h}" stroke="#2c3e50" stroke-width="${i % 5 === 0 ? 3 : 2}"/>`
  }
  s += `<text x="${x0}" y="${y + 44}" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${fmt(debut)}</text>`
  s += `<text x="${x0 + 10 * ecart}" y="${y + 44}" font-size="26" font-weight="700" text-anchor="middle" fill="#2c3e50" font-family="Arial, sans-serif">${fmt(debut + 10 * pas)}</text>`
  if (fleche) {
    const x = x0 + k * ecart
    s += `<line x1="${x}" y1="${y - 48}" x2="${x}" y2="${y - 18}" stroke="#e74c3c" stroke-width="4"/>`
    s += `<polygon points="${x - 9},${y - 22} ${x + 9},${y - 22} ${x},${y - 10}" fill="#e74c3c"/>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 125" width="600" style="max-width:100%;height:auto;">${s}</svg>`
}

function genDroite(niv, max) {
  const pasPossibles = niv.pasDroite[max]
  const pas = pasPossibles[aleatoire(0, pasPossibles.length - 1)]
  const etendue = 10 * pas
  const debut = etendue * aleatoire(0, max / etendue - 1)
  const k = aleatoire(1, 9)
  const rep = debut + k * pas
  return {
    type: 'droite', kind: 'nombre', cle: `dr${debut}-${pas}-${k}`,
    consigne: t('cDroite', { pas: fmt(pas) }),
    texte: '', svg: svgDroite(debut, pas, k), reponse: rep,
    debut, pas, k,
    libelle: t('libDroite', { a: fmt(debut), b: fmt(debut + etendue) }), attendu: fmt(rep),
  }
}

function genRanger(niv, max) {
  const nb = niv.nbRanger
  const vus = new Set()
  const base = tirerNombre(max, { dizainesDifficiles: 0 })
  vus.add(base)
  const ch = chiffresDe(base), k = ch.length
  // deux derniers chiffres inversés (piège classique : 352 / 325)
  const tab = [...ch]; [tab[k - 2], tab[k - 1]] = [tab[k - 1], tab[k - 2]]
  const inv = +tab.join('')
  if (inv >= 10 && inv <= max) vus.add(inv)
  const unite = Math.pow(10, k - 1)          // 10, 100 ou 1000
  const tete = ch[0]
  let essais = 0
  while (vus.size < nb && essais++ < 200) {
    let v
    if (k === 2) v = aleatoire(10, 99)
    else v = (Math.random() < 0.6 ? tete : aleatoire(Math.max(1, tete - 1), Math.min(9, tete + 1))) * unite + aleatoire(0, unite - 1)
    if (v >= 1 && v <= max) vus.add(v)
  }
  const nombres = melanger([...vus])
  const reponse = [...nombres].sort((a, b) => a - b)
  return {
    type: 'ranger', kind: 'ordre', cle: 'rg' + reponse.join('-'),
    consigne: t('cRanger'), texte: '', nombres, reponse,
    libelle: nombres.map(fmt).join(' ; '), attendu: reponse.map(fmt).join(' < '),
  }
}

const GENERATEURS = {
  decomposer: genDecomposer,
  representation: genRepresentation,
  lettresChiffres: genLettresChiffres,
  chiffresLettres: genChiffresLettres,
  comparer: genComparer,
  suites: genSuites,
  droite: genDroite,
  ranger: genRanger,
}

function genererQuestion(cfg) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const max = niv.plages.includes(cfg.plage) ? cfg.plage : niv.plages[niv.plages.length - 1]
  const types = cfg.types.filter(t => GENERATEURS[t])
  const t = types.length ? types[aleatoire(0, types.length - 1)] : 'decomposer'
  return GENERATEURS[t](niv, max)
}

// Répartit les types pour bien mélanger, sans répétition de question
function genererSansRepetition(cfg, nb) {
  const types = cfg.types.filter(t => GENERATEURS[t])
  // types mélangés d'abord : avec moins de questions que de types, pas toujours les mêmes oubliés
  const typesMelanges = melanger(types)
  const ordre = melanger(Array.from({ length: nb }, (_, i) => typesMelanges[i % typesMelanges.length]))
  const vus = new Set()
  const result = []
  let essais = 0, echecs = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    // si un type n'a plus de question neuve (peu de droites possibles…), on en prend un autre
    const type = echecs > 20 ? types[aleatoire(0, types.length - 1)] : ordre[result.length]
    const q = genererQuestion({ ...cfg, types: [type] })
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q); echecs = 0 } else echecs++
  }
  return result
}

// #endregion generation

const config = ref({
  niveau: 'ce1', types: TYPES.map(ty => ty.id), plage: 1000, nbQ: 10, nbFiche: 10, corrige: false,
  ...charger('numeration_config', {}),
})
// nombre de questions à l'écran et sur la fiche : réglages séparés, validés au chargement
const NB_JOUER = [5, 10, 15, 20]
const NB_FICHE = [5, 10, 15, 20, 30]
if (!NB_JOUER.includes(config.value.nbQ)) config.value.nbQ = 10
if (!NB_FICHE.includes(config.value.nbFiche)) config.value.nbFiche = 10
watch(config, v => sauvegarder('numeration_config', v), { deep: true })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'
config.value.types = config.value.types.filter(t => GENERATEURS[t])
if (!config.value.types.length) config.value.types = ['decomposer']

const niveauData = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)
watch(niveauData, n => {
  if (!n.plages.includes(config.value.plage)) config.value.plage = n.plages[n.plages.length - 1]
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
const cdu = ref({ milliers: '', centaines: '', dizaines: '', unites: '' })
const cduEtats = ref({})
const ordre = ref([])
const choixDonne = ref(null)
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const verrou = ref(false)
const inputEl = ref(null)
const cduRefs = []
let timeout = null

const q = computed(() => questions.value[idx.value])

function setCduRef(el, ci) { if (el) cduRefs[ci] = el }

function onCduInput(ci) {
  const champ = q.value.champs[ci]
  const v = String(cdu.value[champ] ?? '').replace(/\D/g, '').slice(-1)
  cdu.value[champ] = v
  if (v && ci + 1 < q.value.champs.length) nextTick(() => cduRefs[ci + 1]?.focus())
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
  reponse.value = ''
  cdu.value = { milliers: '', centaines: '', dizaines: '', unites: '' }
  cduEtats.value = {}
  ordre.value = []
  choixDonne.value = null
  feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  verrou.value = false
  nextTick(() => {
    if (q.value?.kind === 'nombre') inputEl.value?.focus()
    else if (q.value?.kind === 'cdu') cduRefs[0]?.focus()
  })
}

function choisir(c) {
  if (verrou.value) return
  choixDonne.value = c
  corriger(c === q.value.reponse, c)
}

function ajouterOrdre(n) {
  if (verrou.value || ordre.value.includes(n)) return
  ordre.value.push(n)
}

function valider() {
  if (verrou.value) return
  const question = q.value
  if (question.kind === 'nombre') {
    const val = String(reponse.value).trim()
    if (val === '') return
    corriger(+val === question.reponse, val)
  } else if (question.kind === 'cdu') {
    if (question.champs.some(ch => cdu.value[ch] === '')) return
    const etats = {}
    let ok = true
    for (const ch of question.champs) {
      const bon = +cdu.value[ch] === question.reponse[ch]
      etats[ch] = bon ? 'ok' : 'erreur'
      if (!bon) ok = false
    }
    cduEtats.value = etats
    corriger(ok, question.champs.map(ch => libCdu(+cdu.value[ch], ch)).join(' '))
  } else if (question.kind === 'ordre') {
    if (ordre.value.length < question.nombres.length) {
      feedback.value = t('cliqueTous')
      feedbackClass.value = ''
      return
    }
    const ok = ordre.value.every((n, i) => n === question.reponse[i])
    corriger(ok, ordre.value.map(fmt).join(' < '))
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
  historique.value.push({ libelle: question.libelle, donne: String(donne), attendu: question.attendu, ok })
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
function questionPapier(qu, i) {
  const num = `<span class="num">${i + 1}.</span>`
  const ligne = '<span class="case-ligne"></span>'
  switch (qu.type) {
    case 'decomposer':
      if (qu.kind === 'cdu') {
        const champs = qu.champs.map(ch => `<span class="case"></span> ${t(LIBELLES_CDU[ch])}`).join(' &nbsp; ')
        return `<div class="q">${num}<b>${qu.texte}</b> = ${champs}</div>`
      }
      return `<div class="q">${num}<b>${qu.texte}</b> = ${ligne}</div>`
    case 'representation':
      return `<div class="q bloc">${num}${t('pRepresente')} <small>${t('pLegende', { m: qu.milliers ? t('pLegendeM') : '' })}</small><div class="svg">${qu.svg}</div>${t('pCestLeNombre')} ${ligne}</div>`
    case 'lettresChiffres':
      return `<div class="q">${num}<b>${qu.texte}</b> → ${t('pEnChiffres')} ${ligne}</div>`
    case 'chiffresLettres':
      return `<div class="q">${num}${t('pEcrisLettres', { n: `<b>${qu.texte}</b>` })} <span class="case-ligne longue"></span></div>`
    case 'comparer':
      return `<div class="q">${num}<b>${qu.libelle.replace('…', '<span class="case"></span>')}</b> <small>(&lt; , = ou &gt;)</small></div>`
    case 'suites':
      if (qu.texte.endsWith('= ?')) return `<div class="q">${num}<b>${qu.texte.replace('= ?', '=')}</b> ${ligne}</div>`
      return `<div class="q">${num}${qu.texte} : ${ligne}</div>`
    case 'droite':
      return `<div class="q bloc">${num}${t('pFlecheQ')} <small>${t('pFlecheAide', { pas: fmt(qu.pas) })}</small><div class="svg">${qu.svg}</div>${t('pFlecheMontre')} ${ligne}</div>`
    case 'ranger':
      return `<div class="q bloc">${num}${t('pRange')} <b>${qu.nombres.map(fmt).join(' &nbsp; ; &nbsp; ')}</b><div style="margin-top:.6rem;">${qu.nombres.map(() => ligne).join(' &lt; ')}</div></div>`
    default:
      return ''
  }
}

// Les suites à trou sont plus simples à reconstruire proprement
function suitePapier(qu, i) {
  const ligne = '<span class="case-ligne"></span>'
  const termes = qu.termes.map((t, k) => k === qu.trou ? ligne : `<b>${fmt(t)}</b>`).join(', ')
  return `<div class="q"><span class="num">${i + 1}.</span>${t('pSuite')} ${termes}</div>`
}

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const qs = genererSansRepetition(config.value, config.value.nbFiche)
  const niv = config.value.niveau.toUpperCase()
  const rows = qs.map((qu, i) => qu.termes ? suitePapier(qu, i) : questionPapier(qu, i)).join('')

  const titre = t('titre', { n: fmt(config.value.plage) })
  const corrige = config.value.corrige
    ? `<h1 class="saut">${t('corrige')} — ${titre} — ${niv}</h1>
    <ol class="corrige">${qs.map(qu => `<li>${qu.attendu}</li>`).join('')}</ol>`
    : ''
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${titre} — ${niv}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
      .q { margin: 1rem 0; font-size: 1.15rem; line-height: 2; page-break-inside: avoid; }
      .q.bloc { margin: 1.3rem 0; }
      .num { display: inline-block; min-width: 1.8rem; font-weight: 700; color: #777; }
      .case { display: inline-block; width: 2.2rem; height: 2rem; border: 2px solid #555; border-radius: 4px; vertical-align: middle; }
      .case-ligne { display: inline-block; width: 5rem; border-bottom: 1.5px solid #555; height: 1.4rem; vertical-align: bottom; }
      .case-ligne.longue { width: 22rem; }
      .svg { margin: .4rem 0; }
      .svg svg { max-width: 100%; }
      small { color: #777; }
      h1.saut { page-break-before: always; break-before: page; margin-bottom: 1.5rem; }
      .corrige { columns: 2; column-gap: 2rem; font-size: 1.05rem; line-height: 1.9; }
      .corrige li { break-inside: avoid; font-weight: 700; }
    </style></head><body>
    <h1>${titre} — ${niv}</h1>
    <p class="entete">${t('pNbQuestions', { n: qs.length })} &nbsp;&nbsp;&nbsp; ${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
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
  text-align: center; font-size: 1.15rem; font-weight: 700; color: #555; margin: .5rem 0;
}
.visuel { text-align: center; margin: 1rem 0; overflow-x: auto; }
.legende { text-align: center; font-size: .9rem; color: #777; margin-bottom: .5rem; }
.question-lettres { font-size: 1.8rem; letter-spacing: 0; line-height: 1.3; }

.cdu-row { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; }
.cdu-champ { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.cdu-input {
  width: 4rem; height: 4rem; font-size: 2.2rem; font-weight: 800; text-align: center;
  border: 3px solid var(--gris-brd); border-radius: var(--radius); outline: none; background: white;
}
.cdu-input:focus  { border-color: var(--bleu); }
.cdu-input.ok     { border-color: var(--vert); background: #f0faf0; }
.cdu-input.erreur { border-color: var(--rouge); background: #fef0f0; }
.cdu-label { font-weight: 700; color: #666; }

.choix-grid { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; margin: 1rem 0; }
.choix-lettres { flex-direction: column; align-items: stretch; }
.choix-btn {
  min-width: 4.5rem; min-height: 3.5rem; padding: .5rem 1.2rem;
  font-size: 1.5rem; font-weight: 800; background: white; color: var(--texte);
  border: 3px solid var(--gris-brd); border-radius: var(--radius); cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-lettres .choix-btn { font-size: 1.2rem; }
.choix-signes .choix-btn { min-width: 5rem; font-size: 2.2rem; }
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn:disabled { opacity: .45; cursor: default; }
.choix-btn.ok     { border-color: var(--vert); background: #f0faf0; opacity: 1; }
.choix-btn.erreur { border-color: var(--rouge); background: #fef0f0; opacity: 1; }

.ordre-ligne { display: flex; justify-content: center; gap: .5rem; flex-wrap: wrap; margin: 1rem 0; }
.ordre-case {
  min-width: 4.2rem; height: 3.2rem; display: inline-flex; align-items: center; justify-content: center;
  font-size: 1.4rem; font-weight: 800; border: 3px dashed var(--gris-brd); border-radius: 8px;
}
.ordre-case.ok     { border: 3px solid var(--vert); background: #f0faf0; }
.ordre-case.erreur { border: 3px solid var(--rouge); background: #fef0f0; }

.btn:disabled { opacity: .45; cursor: default; }
</style>

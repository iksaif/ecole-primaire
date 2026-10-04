<template>
  <div class="container">
    <h1 class="section-heading">📐 {{ t('titre') }}</h1>

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
          <button v-for="ex in exercicesDispo" :key="ex.id"
            class="level-btn" :class="{ active: config.exercices.includes(ex.id) }"
            @click="toggleExercice(ex.id)">{{ tr(ex.label) }}</button>
        </div>
      </div>

      <div class="config-section" v-if="config.exercices.includes('symetrie')">
        <div class="config-section-title">{{ t('optionsSym') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: !config.axeHorizontal }"
            @click="config.axeHorizontal = false">{{ t('axeV') }}</button>
          <button class="level-btn" :class="{ active: config.axeHorizontal }"
            @click="config.axeHorizontal = true">{{ t('axeH') }}</button>
        </div>
      </div>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [4, 8, 12]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
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

      <div class="exercise-box geo-box">
        <div class="prog-dots">
          <span v-for="(qq, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok === true, erreur: historique[i]?.ok === false }"></span>
        </div>

        <div class="consigne">{{ consigne }}</div>

        <!-- Symétrie -->
        <div v-if="q.type === 'symetrie'" class="grilles">
          <div class="grille" :style="styleGrille(q.cols)">
            <template v-for="r in q.rows" :key="'r' + r">
              <div v-for="c in q.cols" :key="r + '-' + c"
                class="case" :class="classeSymetrie(c - 1, r - 1)"
                @click="clicSymetrie(c - 1, r - 1)"></div>
            </template>
            <div class="axe" :class="q.axe === 'v' ? 'axe-v' : 'axe-h'" :style="styleAxe(q)"></div>
          </div>
        </div>

        <!-- Reproduction -->
        <div v-else-if="q.type === 'reproduction'" class="grilles">
          <div class="grille-titre-wrap">
            <div class="grille-titre">{{ t('modele') }}</div>
            <div class="grille" :style="styleGrille(q.cols)">
              <template v-for="r in q.rows" :key="'m' + r">
                <div v-for="c in q.cols" :key="r + '-' + c" class="case"
                  :class="[modeleSet.has(k(c - 1, r - 1)) ? 'modele' : '', k(c - 1, r - 1) === q.repere ? 'repere' : '']"></div>
              </template>
            </div>
          </div>
          <div class="grille-titre-wrap">
            <div class="grille-titre">{{ t('aToi') }}</div>
            <div class="grille" :style="styleGrille(q.cols)">
              <template v-for="r in q.rows" :key="'a' + r">
                <div v-for="c in q.cols" :key="r + '-' + c" class="case cliquable"
                  :class="[etatCase(k(c - 1, r - 1)), k(c - 1, r - 1) === q.repere ? 'repere' : '']"
                  @click="basculer(k(c - 1, r - 1))"></div>
              </template>
            </div>
          </div>
        </div>

        <!-- Repérage -->
        <div v-else-if="q.type === 'reperage'" class="grilles">
          <div class="grille" :style="styleGrille(q.cols + 1)">
            <div class="case entete"></div>
            <div v-for="c in q.cols" :key="'h' + c" class="case entete">{{ LETTRES[c - 1] }}</div>
            <template v-for="r in q.rows" :key="'l' + r">
              <div class="case entete">{{ r }}</div>
              <div v-for="c in q.cols" :key="r + '-' + c" class="case"
                :class="classeReperage(c - 1, r - 1)"
                @click="clicReperage(c - 1, r - 1)"></div>
            </template>
          </div>
        </div>

        <!-- Figures planes, solides, cercle, patrons -->
        <div v-else-if="dessin" class="dessin" v-html="dessin"></div>

        <div v-if="(q.type === 'figure' && q.sous === 'angle') || q.type === 'angles'" class="astuce">
          💡 {{ t('astuceEquerre') }}
        </div>

        <!-- Angles droits : choix multiple de lettres -->
        <div v-if="q.type === 'angles'" class="choix-group">
          <button v-for="l in [...q.lettres].sort()" :key="l" class="choix-btn" :class="classeLettre(l)"
            :disabled="repondu" @click="basculerLettre(l)">{{ l }}</button>
          <button class="choix-btn" :class="classeLettre('aucun')"
            :disabled="repondu" @click="basculerLettre('aucun')">{{ t('aucunBtn') }}</button>
        </div>

        <!-- Choix -->
        <div v-if="q.choix" class="choix-group">
          <button v-for="ch in q.choix" :key="ch" class="choix-btn"
            :class="{ bon: repondu && ch === q.reponse, faux: repondu && ch === choixDonne && ch !== q.reponse }"
            :disabled="repondu" @click="repondreChoix(ch)">{{ ch }}</button>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <div v-if="corrige && !reussi" class="legende">
          <span><i class="pastille juste"></i> {{ t('legJuste') }}</span>
          <span><i class="pastille manquante"></i> {{ t('legOubliee') }}</span>
          <span><i class="pastille entrop"></i> {{ t('legEnTrop') }}</span>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
            <button v-if="estGrille" class="btn btn-ghost" @click="effacer">{{ t('effacer') }}</button>
            <button v-if="!q.choix" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          </template>
          <button v-else-if="!reussi" class="btn btn-primary" @click="suivant">{{ t('suivant') }}</button>
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
            <td>{{ h.texte }}</td>
            <td>{{ h.donne }}</td>
            <td class="mot-attendu">{{ h.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import messagesFr from '../../i18n/fr/views/maths/GeometrieView.js'
import messagesBr from '../../i18n/br/views/maths/GeometrieView.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, tr, langue } = useI18n({ fr: messagesFr, br: messagesBr })
const enBr = () => langue.value === 'br'
const B = (fr, br) => (enBr() ? br : fr)

// ==== LOGIQUE (testée hors Vue) ====
// Données par niveau : ajouter « ce2: {...} » suffit pour un nouveau niveau.
const NIVEAUX = {
  ce1: {
    exercices: ['symetrie', 'reproduction', 'reperage', 'figures', 'solides'],
    symetrie:     { cols: 10, rows: 8, nbCases: [5, 9], toucheAxe: 0.65 },  // axe vertical : 2 moitiés de 5 × 8
    reproduction: { cols: 6, rows: 6, nbCases: [5, 9] },
    reperage:     { cols: 6, rows: 6 },
    figures: ['carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle', 'losange'],
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave'],   // faces / sommets demandés pour ces solides
  },
  ce2: {
    exercices: ['symetrie', 'reproduction', 'reperage', 'figures', 'solides', 'angles', 'proprietes', 'cercle', 'patrons'],
    symetrie:     { cols: 12, rows: 10, nbCases: [8, 14], toucheAxe: 0.4 },
    reproduction: { cols: 8, rows: 8, nbCases: [8, 13] },
    reperage:     { cols: 8, rows: 8 },
    figures: ['carre', 'rectangle', 'triangle', 'triangle_rectangle', 'cercle', 'losange'],
    solides: ['cube', 'pave', 'pyramide', 'cylindre', 'boule', 'cone'],
    solidesComptage: ['cube', 'pave', 'pyramide'],
    anglesFormes: ['carre', 'rectangle', 'triangle_rectangle', 'triangle', 'trapeze_rectangle', 'un_angle', 'sans_angle'],
    rayons: [2, 9],   // en cm, pour « rayon ↔ diamètre »
  },
}

// br: à relire (solud, patrom, adtresañ…)
const EXERCICES = [
  { id: 'symetrie',     label: { fr: '🦋 Symétrie', br: '🦋 Kemparzhded' } },
  { id: 'reproduction', label: { fr: '✏️ Reproduction', br: '✏️ Adtresañ' } },
  { id: 'reperage',     label: { fr: '📍 Repérage', br: "📍 Lec'hiañ" } },
  { id: 'figures',      label: { fr: '🔷 Figures', br: '🔷 Stummoù' } },
  { id: 'solides',      label: { fr: '🧊 Solides', br: '🧊 Soludoù' } },
  { id: 'angles',       label: { fr: '📐 Angles droits', br: '📐 Kornioù skouer' } },
  { id: 'proprietes',   label: { fr: '📋 Propriétés', br: '📋 Perzhioù' } },
  { id: 'cercle',       label: { fr: '⭕ Cercle', br: "⭕ Kelc'h" } },
  { id: 'patrons',      label: { fr: '🎲 Patrons du cube', br: "🎲 Patromoù ar c'hub" } },
]

const LETTRES = 'ABCDEFGHIJKL'.split('')

const FIGURES = {
  carre:              { nom: 'carré',              br: 'karrez',            cotes: 4, angleDroit: true },
  rectangle:          { nom: 'rectangle',          br: 'hirgarrez',         cotes: 4, angleDroit: true },
  triangle:           { nom: 'triangle',           br: "tric'horn",         cotes: 3, angleDroit: false },
  triangle_rectangle: { nom: 'triangle rectangle', br: "tric'horn skouer",  cotes: 3, angleDroit: true }, // br: à relire
  cercle:             { nom: 'cercle',             br: "kelc'h",            cotes: 0, angleDroit: false },
  losange:            { nom: 'losange',            br: 'lozanj',            cotes: 4, angleDroit: false },
}
const nomFig = id => (enBr() ? FIGURES[id].br : FIGURES[id].nom)
// Noms à ne pas proposer comme « mauvaise » réponse car aussi justes (le carré est un losange et un rectangle…)
const NOMS_CONCURRENTS = {
  carre: ['losange', 'rectangle'],
  triangle_rectangle: ['triangle'],
}
// Triangles quelconques (aucun angle proche de l'angle droit — vérifié par test)
const TRIANGLES = [
  [[-70, 40], [70, 40], [-20, -60]],
  [[-85, 35], [85, 35], [-110, -40]],
  [[-60, 50], [80, 30], [0, -60]],
  [[-75, 45], [85, 45], [-15, -55]],
]
const ROTATIONS = [0, 15, 30, 45, 60, 90, 120, 135, 160, 200, 250, 300, 330]
// Carré : pas de rotation proche de 45° (il ressemblerait à un losange « posé sur la pointe »)
const ROTATIONS_CARRE = ROTATIONS.filter(r => r % 90 <= 20 || r % 90 >= 70)
// Quadrilatères pour « quels angles sont droits ? » (angles non droits à plus de 20° de 90° — vérifié par test)
const FORMES_LIBRES = {
  trapeze_rectangle: [[[-70, -50], [40, -50], [80, 50], [-70, 50]], [[-60, -50], [60, -50], [60, 50], [-20, 50]]],
  un_angle: [[[-60, -60], [60, -60], [20, 20], [-60, 60]], [[-60, -60], [60, -60], [0, 60], [-60, -20]]],
  sans_angle: [[[-70, -40], [50, -40], [80, 40], [-40, 40]], [[-40, -45], [40, -45], [80, 45], [-80, 45]]],
}

const SOLIDES = {
  cube:     { nom: 'cube',      br: 'kub',          faces: 6, sommets: 8, roule: false },
  pave:     { nom: 'pavé droit', br: 'hirgarrezeg', faces: 6, sommets: 8, roule: false }, // br: à relire (pavé droit)
  pyramide: { nom: 'pyramide',  br: 'piramid',      faces: 5, sommets: 5, roule: false },
  cylindre: { nom: 'cylindre',  br: 'silindr',      roule: true },
  boule:    { nom: 'boule',     br: 'boull',        roule: true },
  cone:     { nom: 'cône',      br: 'kon',          roule: true },
}
const nomSol = id => (enBr() ? SOLIDES[id].br : SOLIDES[id].nom)
const OUI = () => t('oui'), NON = () => t('non')

function k(c, r) { return c + ',' + r }
function dek(cle) { return cle.split(',').map(Number) }
function nomCase(c, r) { return LETTRES[c] + (r + 1) }
function hasard(t) { return t[aleatoire(0, t.length - 1)] }

// Figure connexe (cases voisines par un côté) de n cases dans une zone
function figureConnexe(n, dansZone, departs) {
  const set = new Set([hasard(departs)])
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  let essais = 0
  while (set.size < n && essais < 1000) {
    essais++
    const [c, r] = dek(hasard([...set]))
    const [dc, dr] = hasard(dirs)
    if (dansZone(c + dc, r + dr)) set.add(k(c + dc, r + dr))
  }
  return [...set].sort()
}

function genSymetrie(niv, horizontal) {
  const p = niv.symetrie
  const axe = horizontal ? 'h' : 'v'
  // Axe horizontal : on tourne la grille (moitiés de même taille)
  const cols = axe === 'v' ? p.cols : p.rows
  const rows = axe === 'v' ? p.rows : p.cols
  const premier = Math.random() < 0.5   // modèle à gauche / en haut
  const moitie = (axe === 'v' ? cols : rows) / 2
  const dansZone = (c, r) => {
    if (c < 0 || r < 0 || c >= cols || r >= rows) return false
    const pos = axe === 'v' ? c : r
    return premier ? pos < moitie : pos >= moitie
  }
  const bord = premier ? moitie - 1 : moitie
  const departs = []
  const toucheAxe = Math.random() < (p.toucheAxe ?? 0.65)
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    if (!dansZone(c, r)) continue
    if (toucheAxe && (axe === 'v' ? c : r) !== bord) continue
    departs.push(k(c, r))
  }
  const modele = figureConnexe(aleatoire(...p.nbCases), dansZone, departs)
  const attendu = modele.map(cle => {
    const [c, r] = dek(cle)
    return axe === 'v' ? k(cols - 1 - c, r) : k(c, rows - 1 - r)
  }).sort()
  return {
    type: 'symetrie', cle: 'sym-' + axe + '-' + modele.join(';'),
    axe, cols, rows, premier, modele, attendu,
    texte: enBr() ? `Kemparzhded (ahel ${axe === 'v' ? 'a-serzh' : 'a-blaen'})` : `Symétrie (axe ${axe === 'v' ? 'vertical' : 'horizontal'})`,
  }
}

function genReproduction(niv) {
  const p = niv.reproduction
  const dansZone = (c, r) => c >= 0 && r >= 0 && c < p.cols && r < p.rows
  const departs = []
  for (let c = 1; c < p.cols - 1; c++) for (let r = 1; r < p.rows - 1; r++) departs.push(k(c, r))
  const modele = figureConnexe(aleatoire(...p.nbCases), dansZone, departs)
  // Repère : la case la plus en haut, puis la plus à gauche
  const repere = [...modele].sort((a, b) => {
    const [ca, ra] = dek(a), [cb, rb] = dek(b)
    return ra - rb || ca - cb
  })[0]
  return {
    type: 'reproduction', cle: 'rep-' + modele.join(';'),
    cols: p.cols, rows: p.rows, modele, attendu: modele, repere,
    texte: B('Reproduction sur quadrillage', "Adtresañ war ar c'harrezennoù"),
  }
}

function genReperage(niv) {
  const { cols, rows } = niv.reperage
  const c = aleatoire(0, cols - 1), r = aleatoire(0, rows - 1)
  const nom = nomCase(c, r)
  if (Math.random() < 0.5) {
    return {
      type: 'reperage', sous: 'colorie', cle: 'pos-col-' + nom, cols, rows,
      cible: k(c, r), nom, attendu: [k(c, r)], texte: B(`Colorie la case ${nom}`, `Liv ar garrezenn ${nom}`),
    }
  }
  // Pièges : lettre et chiffre inversés, cases voisines
  const pieges = [[r, c], [c + 1, r], [c - 1, r], [c, r + 1], [c, r - 1]]
    .filter(([pc, pr]) => pc >= 0 && pr >= 0 && pc < cols && pr < rows && (pc !== c || pr !== r))
    .map(([pc, pr]) => nomCase(pc, pr))
  const autres = melanger([...new Set(pieges)]).slice(0, 3)
  // Dans un coin il y a moins de pièges : on complète avec d'autres cases
  while (autres.length < 3) {
    const n = nomCase(aleatoire(0, cols - 1), aleatoire(0, rows - 1))
    if (n !== nom && !autres.includes(n)) autres.push(n)
  }
  return {
    type: 'reperage', sous: 'lire', cle: 'pos-lire-' + nom, cols, rows,
    cible: k(c, r), nom, choix: melanger([nom, ...autres]), reponse: nom,
    texte: B('Quelle case est coloriée ?', 'Peseurt karrezenn a zo livet ?'),
  }
}

function angleSommet(pts, i) {
  const n = pts.length
  const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n]
  const u = [A[0] - P[0], A[1] - P[1]], v = [B[0] - P[0], B[1] - P[1]]
  const cos = (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))
  return Math.acos(Math.max(-1, Math.min(1, cos))) * 180 / Math.PI
}

function construireFigure(forme) {
  let pts
  if (forme === 'cercle') return { points: [], rayon: aleatoire(55, 70), anglesDroits: [] }
  if (forme === 'carre') { const s = aleatoire(80, 100) / 2; pts = [[-s, -s], [s, -s], [s, s], [-s, s]] }
  else if (forme === 'rectangle') { const w = aleatoire(120, 145) / 2, h = aleatoire(55, 75) / 2; pts = [[-w, -h], [w, -h], [w, h], [-w, h]] }
  else if (forme === 'losange') { const a = aleatoire(60, 72), b = aleatoire(34, 44); pts = [[0, -a], [b, 0], [0, a], [-b, 0]] }
  else if (forme === 'triangle_rectangle') { const a = aleatoire(90, 130), b = aleatoire(70, 110); pts = [[0, 0], [a, 0], [0, -b]] }
  else if (FORMES_LIBRES[forme]) pts = hasard(FORMES_LIBRES[forme])
  else pts = hasard(TRIANGLES)
  const ang = hasard(forme === 'carre' ? ROTATIONS_CARRE : ROTATIONS) * Math.PI / 180
  pts = pts.map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang), x * Math.sin(ang) + y * Math.cos(ang)])
  // Centrer dans 200 × 200 et réduire si besoin (≤ 160)
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1])
  const larg = Math.max(...xs) - Math.min(...xs), haut = Math.max(...ys) - Math.min(...ys)
  const ech = Math.min(1, 160 / Math.max(larg, haut))
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2
  pts = pts.map(([x, y]) => [100 + (x - cx) * ech, 100 + (y - cy) * ech])
  const anglesDroits = pts.map((_, i) => i).filter(i => Math.abs(angleSommet(pts, i) - 90) < 0.5)
  return { points: pts, rayon: 0, anglesDroits }
}

function genFigure(niv) {
  const forme = hasard(niv.figures)
  const sousDispo = forme === 'cercle' ? ['nom'] : ['nom', 'cotes', 'angle']
  const sous = hasard(sousDispo)
  const f = FIGURES[forme]
  const base = { type: 'figure', sous, forme, cle: `fig-${sous}-${forme}`, ...construireFigure(forme) }
  if (sous === 'nom') {
    const exclus = NOMS_CONCURRENTS[forme] || []
    const autres = melanger(niv.figures.filter(x => x !== forme && !exclus.includes(x))).slice(0, 3)
    return { ...base, choix: melanger([forme, ...autres].map(nomFig)), reponse: nomFig(forme),
      texte: B('Quel est le nom de cette figure ?', 'Petra eo anv ar stumm-mañ ?') }
  }
  if (sous === 'cotes') {
    return { ...base, choix: ['3', '4', '5', '6'], reponse: String(f.cotes),
      texte: B('Combien de côtés a cette figure ?', 'Pet kostez en deus ar stumm-mañ ?') }
  }
  return { ...base, choix: [OUI(), NON()], reponse: f.angleDroit ? OUI() : NON(),
    texte: B('Cette figure a-t-elle au moins un angle droit ?', "Hag-eñ en deus ar stumm-mañ ur c'horn skouer d'an nebeutañ ?") }
}

function genSolide(niv) {
  const solide = hasard(niv.solides)
  const s = SOLIDES[solide]
  const sousDispo = ['nom', 'rouler']
  if (niv.solidesComptage.includes(solide)) sousDispo.push('faces', 'sommets')
  const sous = hasard(sousDispo)
  const base = { type: 'solide', sous, solide, cle: `sol-${sous}-${solide}` }
  if (sous === 'nom') {
    const autres = melanger(niv.solides.filter(x => x !== solide)).slice(0, 3)
    return { ...base, choix: melanger([solide, ...autres].map(nomSol)), reponse: nomSol(solide),
      texte: B('Comment s\'appelle ce solide ?', 'Petra eo anv ar solud-mañ ?') }
  }
  if (sous === 'rouler') {
    return { ...base, choix: [OUI(), NON()], reponse: s.roule ? OUI() : NON(),
      texte: B('Ce solide peut-il rouler ?', "Hag-eñ e c'hall ar solud-mañ ruilhal ?") }
  }
  if (sous === 'faces') {
    return { ...base, choix: ['4', '5', '6', '8'], reponse: String(s.faces),
      texte: B('Combien de faces a ce solide ?', 'Pet tal en deus ar solud-mañ ?') }
  }
  return { ...base, choix: ['4', '5', '6', '8'], reponse: String(s.sommets),
    texte: B('Combien de sommets a ce solide ?', 'Pet beg en deus ar solud-mañ ?') }
}

// ── CE2 : angles droits (lettres aux sommets) ──
function genAngles(niv) {
  const forme = hasard(niv.anglesFormes)
  const fig = construireFigure(forme)
  const n = fig.points.length
  const decal = aleatoire(0, n - 1)
  const lettres = fig.points.map((_, i) => 'ABCD'[(i + decal) % n])
  const droits = fig.anglesDroits.map(i => lettres[i]).sort()
  return { type: 'angles', forme, cle: `ang-${forme}-${decal}`, ...fig, lettres, droits,
    texte: B('Quels angles sont droits ?', 'Peseurt kornioù a zo skouer ?') }
}

// ── CE2 : propriétés des figures ──
const PROPRIETES = [
  { id: 'q-carre', texte: 'Quelle figure a 4 côtés de même longueur et 4 angles droits ?', choix: ['carré', 'rectangle', 'losange', 'triangle rectangle'], reponse: 'carré' },
  { id: 'q-rect', texte: 'Quelle figure a 4 angles droits, mais pas ses 4 côtés de même longueur ?', choix: ['carré', 'rectangle', 'losange', 'triangle rectangle'], reponse: 'rectangle' },
  { id: 'q-trirect', texte: 'Quelle figure a 3 côtés et un angle droit ?', choix: ['carré', 'rectangle', 'losange', 'triangle rectangle'], reponse: 'triangle rectangle' },
  { id: 'q-losange', texte: 'Quelle figure a 4 côtés de même longueur, mais pas d\'angle droit ?', choix: ['carré', 'rectangle', 'losange', 'triangle rectangle'], reponse: 'losange' },
  { id: 'v-carre-ad', texte: 'Vrai ou faux ? Un carré a 4 angles droits.', reponse: 'Vrai' },
  { id: 'v-carre-cotes', texte: 'Vrai ou faux ? Les 4 côtés d\'un carré ont la même longueur.', reponse: 'Vrai' },
  { id: 'v-rect-cotes', texte: 'Vrai ou faux ? Un rectangle a toujours ses 4 côtés de la même longueur.', reponse: 'Faux' },
  { id: 'v-rect-opp', texte: 'Vrai ou faux ? Dans un rectangle, les côtés opposés ont la même longueur.', reponse: 'Vrai' },
  { id: 'v-rect-ad', texte: 'Vrai ou faux ? Un rectangle a 4 angles droits.', reponse: 'Vrai' },
  { id: 'v-trirect-3', texte: 'Vrai ou faux ? Un triangle rectangle a 3 angles droits.', reponse: 'Faux' },
  { id: 'v-trirect-1', texte: 'Vrai ou faux ? Un triangle rectangle a un angle droit.', reponse: 'Vrai' },
  { id: 'v-carre-rect', texte: 'Vrai ou faux ? Un carré est un rectangle particulier.', reponse: 'Vrai' },
  { id: 'v-losange-ad', texte: 'Vrai ou faux ? Un losange a toujours 4 angles droits.', reponse: 'Faux' },
  { id: 'v-tri-cotes', texte: 'Vrai ou faux ? Un triangle a 4 côtés.', reponse: 'Faux' },
]
// br : mêmes questions, même ordre (br: à relire — mutations après les chiffres non faites : « 4 kostez »)
const CHOIX_FIG_BR = ['karrez', 'hirgarrez', 'lozanj', "tric'horn skouer"]
const PROPRIETES_BR = {
  'q-carre': "Peseurt stumm en deus 4 kostez hir kement-ha-kement ha 4 korn skouer ?",
  'q-rect': "Peseurt stumm en deus 4 korn skouer, met n'eo ket hir kement-ha-kement e 4 kostez ?",
  'q-trirect': "Peseurt stumm en deus 3 kostez hag ur c'horn skouer ?",
  'q-losange': 'Peseurt stumm en deus 4 kostez hir kement-ha-kement, met korn skouer ebet ?',
  'v-carre-ad': "Gwir pe gaou ? Ur c'harrez en deus 4 korn skouer.",
  'v-carre-cotes': "Gwir pe gaou ? Hir kement-ha-kement eo 4 kostez ur c'harrez.",
  'v-rect-cotes': 'Gwir pe gaou ? Hir kement-ha-kement eo atav 4 kostez un hirgarrez.',
  'v-rect-opp': "Gwir pe gaou ? En un hirgarrez, ar c'hostezioù a-dal a zo hir kement-ha-kement.",
  'v-rect-ad': 'Gwir pe gaou ? Un hirgarrez en deus 4 korn skouer.',
  'v-trirect-3': "Gwir pe gaou ? Un tric'horn skouer en deus 3 korn skouer.",
  'v-trirect-1': "Gwir pe gaou ? Un tric'horn skouer en deus ur c'horn skouer.",
  'v-carre-rect': "Gwir pe gaou ? Ur c'harrez a zo un hirgarrez dibar.",
  'v-losange-ad': 'Gwir pe gaou ? Ul lozanj en deus atav 4 korn skouer.',
  'v-tri-cotes': "Gwir pe gaou ? Un tric'horn en deus 4 kostez.",
}
const VF = { Vrai: 'Gwir', Faux: 'Gaou' }
// Texte d'une propriété dans la langue courante
function proprieteLocale(p) {
  if (!enBr()) return p
  const i = p.choix ? p.choix.indexOf(p.reponse) : -1
  return { ...p, texte: PROPRIETES_BR[p.id], choix: p.choix ? CHOIX_FIG_BR : undefined,
    reponse: p.choix ? CHOIX_FIG_BR[i] : VF[p.reponse] }
}
function genPropriete() {
  const p = proprieteLocale(hasard(PROPRIETES))
  return { type: 'proprietes', cle: 'prop-' + p.id, texte: p.texte,
    choix: p.choix ? melanger(p.choix) : B(['Vrai', 'Faux'], ['Gwir', 'Gaou']), reponse: p.reponse }
}

// ── CE2 : cercle (centre, rayon, diamètre) ──
const LETTRES_POINTS = 'ABCDEFGHKLMN'.split('')
function genCercle(niv) {
  const sous = hasard(['centre', 'segment', 'segment', 'lequel', 'mesure', 'mesure'])
  const [a, b, c, d, e] = melanger(LETTRES_POINTS).slice(0, 5)
  const base = { type: 'cercle', sous, rot: aleatoire(0, 359), pts: { a, b, c, d, e } }
  if (sous === 'centre') {
    return { ...base, cle: 'cer-centre', choix: melanger(B(['le centre', 'un rayon', 'un diamètre', 'un sommet'], ["ar c'hreiz", 'ur skin', 'un treuzkiz', 'ur beg'])),
      reponse: B('le centre', "ar c'hreiz"), texte: B('Comment s\'appelle le point O pour ce cercle ?', "Petra eo ar poent O evit ar c'helc'h-mañ ?") }
  }
  if (sous === 'segment') {
    const cible = hasard(['rayon', 'diametre'])
    const nom = cible === 'rayon' ? `[O${a}]` : `[${b}${c}]`
    return { ...base, cible, cle: 'cer-seg-' + cible, choix: B(['un rayon', 'un diamètre', 'un côté'], ['ur skin', 'un treuzkiz', "ur c'hostez"]),
      reponse: cible === 'rayon' ? B('un rayon', 'ur skin') : B('un diamètre', 'un treuzkiz'),
      texte: B(`Comment s'appelle le segment rouge ${nom} ?`, `Petra eo ar segment ruz ${nom} ?`) }
  }
  if (sous === 'lequel') {
    const cible = hasard(['rayon', 'diametre'])
    const segs = { rayon: `[O${a}]`, diametre: `[${b}${c}]`, corde: `[${d}${e}]` }
    return { ...base, cible, cle: 'cer-lequel-' + cible, choix: melanger(Object.values(segs)), reponse: segs[cible],
      texte: enBr()
        ? `Peseurt segment a zo ${cible === 'rayon' ? 'ur skin' : 'un treuzkiz'} eus ar c'helc'h ?`
        : `Quel segment est ${cible === 'rayon' ? 'un rayon' : 'un diamètre'} du cercle ?` }
  }
  const r = aleatoire(...niv.rayons)
  const versDiam = Math.random() < 0.5
  const bonne = versDiam ? 2 * r : r
  const cands = versDiam ? [r, r + 1, 3 * r, 4 * r, 2 * r + 2] : [2 * r, 4 * r, r + 1, r + 2, 3 * r]
  const autres = [...new Set(cands.filter(x => x !== bonne))].slice(0, 3)
  return { ...base, r, cle: `cer-mes-${versDiam ? 'd' : 'r'}-${r}`,
    choix: melanger([bonne, ...autres]).map(x => x + ' cm'), reponse: bonne + ' cm',
    texte: enBr()
      ? (versDiam ? `Skin ar c'helc'h-mañ a vuzul ${r} cm. Pegeit eo e dreuzkiz ?`
        : `Treuzkiz ar c'helc'h-mañ a vuzul ${2 * r} cm. Pegeit eo e skin ?`)
      : (versDiam ? `Le rayon de ce cercle mesure ${r} cm. Combien mesure son diamètre ?`
        : `Le diamètre de ce cercle mesure ${2 * r} cm. Combien mesure son rayon ?`) }
}

// ── CE2 : patrons du cube ──
const SYMETRIES = [
  ([c, r]) => [c, r], ([c, r]) => [-r, c], ([c, r]) => [-c, -r], ([c, r]) => [r, -c],
  ([c, r]) => [-c, r], ([c, r]) => [r, c], ([c, r]) => [c, -r], ([c, r]) => [-r, -c],
]
function normaliserCases(cells) {
  const minC = Math.min(...cells.map(p => p[0])), minR = Math.min(...cells.map(p => p[1]))
  return cells.map(([c, r]) => [c - minC, r - minR]).sort((x, y) => x[1] - y[1] || x[0] - y[0])
}
const cleCases = cells => normaliserCases(cells).map(p => p.join(',')).join(';')
const canonique = cells => SYMETRIES.map(f => cleCases(cells.map(f))).sort()[0]
// Les 35 hexaminos (6 carrés accolés par un côté), à une rotation / symétrie près
function hexaminos() {
  let formes = new Map([['0,0', [[0, 0]]]])
  for (let n = 1; n < 6; n++) {
    const suivantes = new Map()
    for (const cells of formes.values()) {
      const occ = new Set(cells.map(p => p.join(',')))
      for (const [c, r] of cells) for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (occ.has((c + dc) + ',' + (r + dr))) continue
        const nc = normaliserCases([...cells, [c + dc, r + dr]])
        const kk = canonique(nc)
        if (!suivantes.has(kk)) suivantes.set(kk, nc)
      }
    }
    formes = suivantes
  }
  return [...formes.values()]
}
// On « fait rouler » un cube sur le patron : c'est un patron si les 6 cases touchent 6 faces différentes.
function estPatronCube(cells) {
  const occ = new Map(cells.map(p => [p.join(','), p]))
  const etat = new Map()
  const depart = cells[0].join(',')
  etat.set(depart, { bas: 0, haut: 1, nord: 2, sud: 3, est: 4, ouest: 5 })
  const file = [depart]
  const rouler = (o, dir) => {
    if (dir === 'est') return { ...o, bas: o.est, est: o.haut, haut: o.ouest, ouest: o.bas }
    if (dir === 'ouest') return { ...o, bas: o.ouest, ouest: o.haut, haut: o.est, est: o.bas }
    if (dir === 'nord') return { ...o, bas: o.nord, nord: o.haut, haut: o.sud, sud: o.bas }
    return { ...o, bas: o.sud, sud: o.haut, haut: o.nord, nord: o.bas }
  }
  while (file.length) {
    const cle = file.shift()
    const [c, r] = occ.get(cle)
    for (const [dc, dr, dir] of [[1, 0, 'est'], [-1, 0, 'ouest'], [0, -1, 'nord'], [0, 1, 'sud']]) {
      const v = (c + dc) + ',' + (r + dr)
      if (occ.has(v) && !etat.has(v)) { etat.set(v, rouler(etat.get(cle), dir)); file.push(v) }
    }
  }
  return new Set([...etat.values()].map(o => o.bas)).size === 6
}
let _hexa = null
function patrons() {
  if (!_hexa) {
    const toutes = hexaminos()
    _hexa = { valides: toutes.filter(estPatronCube), invalides: toutes.filter(h => !estPatronCube(h)) }
  }
  return _hexa
}
function genPatron() {
  const { valides, invalides } = patrons()
  const valide = Math.random() < 0.5
  const liste = valide ? valides : invalides
  const i = aleatoire(0, liste.length - 1)
  const cases = normaliserCases(liste[i].map(hasard(SYMETRIES)))
  return { type: 'patron', cle: `pat-${valide ? 'v' : 'i'}-${i}`, cases, valide,
    choix: [OUI(), NON()], reponse: valide ? OUI() : NON(),
    texte: B('Ce dessin est-il un patron du cube ? (Imagine que tu le plies.)', "Hag-eñ eo an tresadenn-mañ ur patrom eus ar c'hub ? (Soñj e plegez anezhañ.)") }
}

function typesDispo(cfg, niv) {
  const t = cfg.exercices.filter(e => niv.exercices.includes(e))
  return t.length ? t : niv.exercices
}

function genererQuestion(cfg, type) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const t = type || hasard(typesDispo(cfg, niv))
  if (t === 'symetrie') return genSymetrie(niv, cfg.axeHorizontal && Math.random() < 0.5)
  if (t === 'reproduction') return genReproduction(niv)
  if (t === 'reperage') return genReperage(niv)
  if (t === 'figures') return genFigure(niv)
  if (t === 'angles') return genAngles(niv)
  if (t === 'proprietes') return genPropriete()
  if (t === 'cercle') return genCercle(niv)
  if (t === 'patrons') return genPatron()
  return genSolide(niv)
}

function genererSansRepetition(cfg, nb, type) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const q = genererQuestion(cfg, type)
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q) }
  }
  return result
}

// ── Dessins SVG (chaînes, utilisées à l'écran et dans la fiche) ──
const f1 = n => Math.round(n * 10) / 10

function svgFigure(q, marquerAngles = false, taille = 220) {
  let corps = ''
  const lettres = q.lettres || null
  if (q.forme === 'cercle') {
    corps = `<circle cx="100" cy="100" r="${q.rayon}" fill="#ffe08a" stroke="#2c3e50" stroke-width="3"/>`
  } else {
    const pts = q.points
    corps = `<polygon points="${pts.map(p => f1(p[0]) + ',' + f1(p[1])).join(' ')}" fill="#ffe08a" stroke="#2c3e50" stroke-width="3" stroke-linejoin="round"/>`
    if (lettres) {
      const gx = pts.reduce((a, p) => a + p[0], 0) / pts.length, gy = pts.reduce((a, p) => a + p[1], 0) / pts.length
      pts.forEach((P, i) => {
        const dx = P[0] - gx, dy = P[1] - gy, l = Math.hypot(dx, dy) || 1
        corps += `<text x="${f1(P[0] + dx / l * 15)}" y="${f1(P[1] + dy / l * 15)}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="17" font-weight="bold" fill="#1a5fb4">${lettres[i]}</text>`
      })
    }
    if (marquerAngles) {
      const n = pts.length
      for (const i of q.anglesDroits) {
        const P = pts[i], A = pts[(i + n - 1) % n], B = pts[(i + 1) % n]
        const lu = Math.hypot(A[0] - P[0], A[1] - P[1]), lv = Math.hypot(B[0] - P[0], B[1] - P[1])
        const u = [(A[0] - P[0]) / lu * 13, (A[1] - P[1]) / lu * 13]
        const v = [(B[0] - P[0]) / lv * 13, (B[1] - P[1]) / lv * 13]
        corps += `<polyline points="${f1(P[0] + u[0])},${f1(P[1] + u[1])} ${f1(P[0] + u[0] + v[0])},${f1(P[1] + u[1] + v[1])} ${f1(P[0] + v[0])},${f1(P[1] + v[1])}" fill="none" stroke="#e74c3c" stroke-width="2"/>`
      }
    }
  }
  const vb = lettres ? '-15 -15 230 230' : '0 0 200 200'
  return `<svg viewBox="${vb}" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${corps}</svg>`
}

// Cercle de centre O (CE2). Positions de base (degrés) : diamètre 200°/20°, rayon 110°, corde 250°/350°.
function svgCercle(q, taille = 220) {
  const R = 70
  const pt = deg => { const a = (deg + q.rot) * Math.PI / 180; return [f1(100 + R * Math.cos(a)), f1(100 + R * Math.sin(a))] }
  const lab = (deg, l) => { const a = (deg + q.rot) * Math.PI / 180; return `<text x="${f1(100 + (R + 15) * Math.cos(a))}" y="${f1(100 + (R + 15) * Math.sin(a))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#1a5fb4">${l}</text>` }
  const pointSur = (deg, l) => { const [x, y] = pt(deg); return `<circle cx="${x}" cy="${y}" r="3.5" fill="#2c3e50"/>` + lab(deg, l) }
  const seg = (A, B, coul = '#2c3e50') => `<line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${coul}" stroke-width="3" stroke-linecap="round"/>`
  const O = [100, 100], { a, b, c, d, e } = q.pts
  let s = `<circle cx="100" cy="100" r="${R}" fill="#eaf4ff" stroke="#2c3e50" stroke-width="3"/>`
  if (q.sous === 'centre') s += seg(O, pt(110), '#999') + pointSur(110, a)
  if (q.sous === 'segment') {
    if (q.cible === 'rayon') s += seg(O, pt(110), '#e74c3c') + pointSur(110, a)
    else s += seg(pt(200), pt(20), '#e74c3c') + pointSur(200, b) + pointSur(20, c)
  }
  if (q.sous === 'lequel') {
    s += seg(O, pt(110)) + seg(pt(200), pt(20)) + seg(pt(250), pt(350))
      + pointSur(110, a) + pointSur(200, b) + pointSur(20, c) + pointSur(250, d) + pointSur(350, e)
  }
  if (q.sous === 'mesure') s += seg(O, pt(110), '#999')
  // centre O (étiquette décalée pour ne pas chevaucher les segments)
  const ao = (155 + q.rot) * Math.PI / 180
  s += `<circle cx="100" cy="100" r="3.5" fill="#2c3e50"/><text x="${f1(100 + 14 * Math.cos(ao))}" y="${f1(100 + 14 * Math.sin(ao))}" text-anchor="middle" dominant-baseline="central" font-family="Arial" font-size="16" font-weight="bold" fill="#c0392b">O</text>`
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

// Patron : cases en px (écran) ou en cm (impression, unite = 'cm')
function svgPatron(cells, { cote = 36, unite = '' } = {}) {
  const cols = Math.max(...cells.map(p => p[0])) + 1, rows = Math.max(...cells.map(p => p[1])) + 1
  const m = 0.2
  let s = ''
  for (const [c, r] of cells) s += `<rect x="${c + m}" y="${r + m}" width="1" height="1" fill="${unite ? '#fff' : '#cfe2ff'}" stroke="#2c3e50" stroke-width="0.05"/>`
  const W = cols + 2 * m, H = rows + 2 * m
  const dim = unite ? `width="${f1(W * cote)}${unite}" height="${f1(H * cote)}${unite}"` : `width="${f1(W * cote)}" height="${f1(H * cote)}"`
  return `<svg viewBox="0 0 ${W} ${H}" ${dim} xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}

const TRAIT = 'stroke="#2c3e50" stroke-width="2.5" stroke-linejoin="round"'
const CACHE = 'stroke="#2c3e50" stroke-width="2" stroke-dasharray="6 5" fill="none"'

function svgSolide(type, taille = 220) {
  let c = ''
  if (type === 'cube' || type === 'pave') {
    const [x, y, w, h, dx, dy] = type === 'cube' ? [45, 75, 80, 80, 38, -32] : [30, 95, 110, 55, 42, -30]
    const A = [x, y], B = [x + w, y], C = [x + w, y + h], D = [x, y + h]
    const E = [x + dx, y + dy], F = [x + w + dx, y + dy], G = [x + w + dx, y + h + dy], H = [x + dx, y + h + dy]
    const p = (...pts) => pts.map(q => q.join(',')).join(' ')
    c = `<polygon points="${p(A, B, C, D)}" fill="#cfe2ff" ${TRAIT}/>`
      + `<polygon points="${p(A, B, F, E)}" fill="#e8f1ff" ${TRAIT}/>`
      + `<polygon points="${p(B, F, G, C)}" fill="#a9c8f5" ${TRAIT}/>`
      + `<polyline points="${p(D, H, G)}" ${CACHE}/><line x1="${H[0]}" y1="${H[1]}" x2="${E[0]}" y2="${E[1]}" ${CACHE}/>`
  } else if (type === 'pyramide') {
    const A = '35,160', B = '135,160', C = '170,128', D = '70,128', S = '100,32'
    c = `<polygon points="${S} ${A} ${B}" fill="#ffd8a8" ${TRAIT}/>`
      + `<polygon points="${S} ${B} ${C}" fill="#f7b267" ${TRAIT}/>`
      + `<polyline points="${A} ${D} ${C}" ${CACHE}/><line x1="100" y1="32" x2="70" y2="128" ${CACHE}/>`
  } else if (type === 'cylindre') {
    c = `<path d="M45,45 L45,155 A55,16 0 0,0 155,155 L155,45 Z" fill="#b8e0c2" ${TRAIT}/>`
      + `<path d="M45,155 A55,16 0 0,1 155,155" ${CACHE}/>`
      + `<ellipse cx="100" cy="45" rx="55" ry="16" fill="#dff3e4" ${TRAIT}/>`
  } else if (type === 'cone') {
    c = `<path d="M100,30 L42,160 A58,16 0 0,0 158,160 Z" fill="#f5c6e0" ${TRAIT}/>`
      + `<path d="M42,160 A58,16 0 0,1 158,160" ${CACHE}/>`
  } else {
    c = `<defs><radialGradient id="geoBoule" cx="35%" cy="32%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e57373"/></radialGradient></defs>`
      + `<circle cx="100" cy="100" r="68" fill="url(#geoBoule)" ${TRAIT}/>`
      + `<path d="M32,100 A68,18 0 0,0 168,100" fill="none" stroke="#2c3e50" stroke-width="1.2" opacity=".5"/>`
      + `<path d="M32,100 A68,18 0 0,1 168,100" fill="none" stroke="#2c3e50" stroke-width="1.2" stroke-dasharray="5 5" opacity=".4"/>`
  }
  return `<svg viewBox="0 0 200 200" width="${taille}" height="${taille}" xmlns="http://www.w3.org/2000/svg">${c}</svg>`
}

// Quadrillage pour l'impression : 1 unité = 1 cm réel
function svgGrilleCm({ cols, rows, pleines = [], axe = null, repere = null, symboles = {}, entetes = false }) {
  const m = 0.5, off = entetes ? 1 : 0
  const W = cols + off + 2 * m, H = rows + off + 2 * m
  const x0 = m + off, y0 = m + off
  let s = ''
  for (const cle of pleines) {
    const [c, r] = dek(cle)
    s += `<rect x="${x0 + c}" y="${y0 + r}" width="1" height="1" fill="#b5b5b5"/>`
  }
  for (let c = 0; c <= cols; c++) s += `<line x1="${x0 + c}" y1="${y0}" x2="${x0 + c}" y2="${y0 + rows}" stroke="#555" stroke-width="0.02"/>`
  for (let r = 0; r <= rows; r++) s += `<line x1="${x0}" y1="${y0 + r}" x2="${x0 + cols}" y2="${y0 + r}" stroke="#555" stroke-width="0.02"/>`
  if (entetes) {
    for (let c = 0; c < cols; c++) s += `<text x="${x0 + c + 0.5}" y="${y0 - 0.3}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${LETTRES[c]}</text>`
    for (let r = 0; r < rows; r++) s += `<text x="${x0 - 0.5}" y="${y0 + r + 0.7}" font-size="0.55" font-weight="bold" text-anchor="middle" font-family="Arial">${r + 1}</text>`
  }
  if (axe === 'v') s += `<line x1="${x0 + cols / 2}" y1="${y0 - 0.4}" x2="${x0 + cols / 2}" y2="${y0 + rows + 0.4}" stroke="#d00" stroke-width="0.09"/>`
  if (axe === 'h') s += `<line x1="${x0 - 0.4}" y1="${y0 + rows / 2}" x2="${x0 + cols + 0.4}" y2="${y0 + rows / 2}" stroke="#d00" stroke-width="0.09"/>`
  if (repere) { const [c, r] = dek(repere); s += `<circle cx="${x0 + c + 0.5}" cy="${y0 + r + 0.5}" r="0.14" fill="#000"/>` }
  for (const [cle, sym] of Object.entries(symboles)) {
    const [c, r] = dek(cle)
    s += `<text x="${x0 + c + 0.5}" y="${y0 + r + 0.72}" font-size="0.65" text-anchor="middle" font-family="Arial">${sym}</text>`
  }
  return `<svg width="${W}cm" height="${H}cm" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${s}</svg>`
}
// ==== FIN LOGIQUE ====

// ── Configuration ──
const DEFAUT = { niveau: 'ce1', exercices: [...NIVEAUX.ce1.exercices], nbQ: 8, axeHorizontal: false }
const config = ref({ ...DEFAUT, ...charger('geometrie_config', {}) })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'
function nettoyerExercices() {
  const dispo = NIVEAUX[config.value.niveau].exercices
  config.value.exercices = (config.value.exercices || []).filter(id => dispo.includes(id))
  if (!config.value.exercices.length) config.value.exercices = [...dispo]
}
nettoyerExercices()
watch(() => config.value.niveau, nettoyerExercices)
const exercicesDispo = computed(() => EXERCICES.filter(e => (NIVEAUX[config.value.niveau] || NIVEAUX.ce1).exercices.includes(e.id)))
if (![4, 8, 12].includes(config.value.nbQ)) config.value.nbQ = 8
watch(config, v => sauvegarder('geometrie_config', v), { deep: true })

function toggleExercice(id) {
  const ex = config.value.exercices
  if (ex.includes(id)) {
    if (ex.length === 1) return
    config.value.exercices = ex.filter(e => e !== id)
  } else {
    config.value.exercices = [...ex, id]
  }
}

// ── État du jeu ──
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const selection = ref({})
const corrige = ref(false)     // correction case par case affichée
const repondu = ref(false)     // question terminée (bonne ou mauvaise)
const reussi = ref(false)
const choixDonne = ref(null)
const feedback = ref('')
const feedbackClass = ref('')
let minuterie = null

const q = computed(() => questions.value[idx.value])
const estGrille = computed(() => q.value && (q.value.type === 'symetrie' || q.value.type === 'reproduction'
  || (q.value.type === 'reperage' && q.value.sous === 'colorie')))
const modeleSet = computed(() => new Set(q.value?.modele || []))
const dessin = computed(() => {
  const x = q.value
  if (!x) return ''
  if (x.type === 'figure') return svgFigure(x, x.sous === 'nom')
  if (x.type === 'solide') return svgSolide(x.solide)
  if (x.type === 'angles') return svgFigure(x, repondu.value && !reussi.value)
  if (x.type === 'cercle') return svgCercle(x)
  if (x.type === 'patron') return svgPatron(x.cases)
  return ''
})

function classeLettre(l) {
  const sel = !!selection.value[l]
  if (!repondu.value) return sel ? 'actif' : ''
  const att = q.value.droits.length ? q.value.droits.includes(l) : l === 'aucun'
  if (att) return sel ? 'bon' : 'manque'
  return sel ? 'faux' : ''
}
function basculerLettre(l) {
  if (repondu.value) return
  if (l === 'aucun') { selection.value = selection.value.aucun ? {} : { aucun: true }; return }
  const s = { ...selection.value }
  delete s.aucun
  if (s[l]) delete s[l]; else s[l] = true
  selection.value = s
}
const attenduSet = computed(() => new Set(q.value?.attendu || []))

const consigne = computed(() => {
  const x = q.value
  if (!x) return ''
  if (x.type === 'symetrie') return B('Colorie les cases pour compléter la figure : elle doit être symétrique par rapport à l\'axe rouge.',
    "Liv ar c'harrezennoù evit klokaat ar stumm : kemparzhek e rank bezañ e-keñver an ahel ruz.")
  if (x.type === 'reproduction') return B('Reproduis la figure dans la grille de droite, au même endroit. L\'étoile ★ t\'aide à démarrer.',
    "Adtres ar stumm er gael a-zehou, en hevelep lec'h. Ar steredenn ★ a sikour ac'hanout da gregiñ.")
  if (x.type === 'reperage') return x.sous === 'colorie'
    ? B(`Colorie la case ${x.nom} (colonne ${x.nom[0]}, ligne ${x.nom.slice(1)}).`, `Liv ar garrezenn ${x.nom} (kolonenn ${x.nom[0]}, linenn ${x.nom.slice(1)}).`)
    : B('Quelle case est coloriée ? (la lettre de la colonne, puis le numéro de la ligne)', 'Peseurt karrezenn a zo livet ? (lizherenn ar golonenn, ha goude niverenn al linenn)')
  return x.texte
})

function styleGrille(cols) {
  return { gridTemplateColumns: `repeat(${cols}, var(--cell))`, '--cell': `clamp(26px, calc((100vw - 4rem) / ${cols}), 40px)` }
}
function styleAxe(x) {
  const n = (x.axe === 'v' ? x.cols : x.rows) / 2
  const pos = `calc(${n} * (var(--cell) + 1px) - 1.5px)`
  return x.axe === 'v' ? { left: pos } : { top: pos }
}

function etatCase(cle) {
  const sel = !!selection.value[cle]
  if (!corrige.value) return sel ? 'coloriee' : ''
  const att = attenduSet.value.has(cle)
  if (att && sel) return 'juste'
  if (att) return 'manquante'
  if (sel) return 'entrop'
  return ''
}

function cliquableSymetrie(c, r) {
  const x = q.value
  const pos = x.axe === 'v' ? c : r
  const moitie = (x.axe === 'v' ? x.cols : x.rows) / 2
  return x.premier ? pos >= moitie : pos < moitie
}
function classeSymetrie(c, r) {
  const cle = k(c, r)
  if (modeleSet.value.has(cle)) return 'modele'
  if (!cliquableSymetrie(c, r)) return 'inactive'
  return ['cliquable', etatCase(cle)]
}
function clicSymetrie(c, r) {
  if (cliquableSymetrie(c, r)) basculer(k(c, r))
}

function classeReperage(c, r) {
  const x = q.value, cle = k(c, r)
  if (x.sous === 'lire') return cle === x.cible ? 'modele' : ''
  return ['cliquable', etatCase(cle)]
}
function clicReperage(c, r) {
  if (q.value.sous !== 'colorie' || repondu.value) return
  const cle = k(c, r)
  selection.value = selection.value[cle] ? {} : { [cle]: true }
}

function basculer(cle) {
  if (repondu.value) return
  const s = { ...selection.value }
  if (s[cle]) delete s[cle]; else s[cle] = true
  selection.value = s
}

function effacer() {
  if (!repondu.value) selection.value = {}
}

function initQuestion() {
  selection.value = {}
  corrige.value = false; repondu.value = false; reussi.value = false
  choixDonne.value = null
  feedback.value = ''; feedbackClass.value = ''
}

function demarrer() {
  clearTimeout(minuterie)
  questions.value = genererSansRepetition(config.value, config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  initQuestion()
  phase.value = 'jeu'
}


function marquerBon(donne) {
  const x = q.value
  repondu.value = true; reussi.value = true
  feedback.value = hasard(t('bravo')); feedbackClass.value = 'ok'
  bonnes.value++
  historique.value.push({ texte: x.texte, donne, attendu: attenduTexte(x), ok: true })
  minuterie = setTimeout(suivant, 900)
}

function marquerFaux(donne, message) {
  const x = q.value
  repondu.value = true; reussi.value = false
  feedback.value = message; feedbackClass.value = 'erreur'
  mauvaises.value++
  historique.value.push({ texte: x.texte, donne, attendu: attenduTexte(x), ok: false })
}

const AUCUN = () => B('aucun', 'hini ebet')
function attenduTexte(x) {
  if (x.type === 'angles') return x.droits.length ? x.droits.join(', ') : AUCUN()
  if (x.type === 'figure' && x.sous !== 'nom') return `${x.reponse} (${nomFig(x.forme)})`
  if (x.type === 'solide' && x.sous !== 'nom') return `${x.reponse} (${nomSol(x.solide)})`
  if (x.choix) return x.reponse
  if (x.type === 'reperage') return x.nom
  return B(`${x.attendu.length} cases`, `${x.attendu.length} karrezenn`)
}

function valider() {
  const x = q.value
  if (repondu.value || x.choix) return
  const sel = Object.keys(selection.value)
  if (!sel.length) return
  if (x.type === 'angles') {
    const donne = sel.includes('aucun') ? AUCUN() : [...sel].sort().join(', ')
    const attendu = attenduTexte(x)
    if (donne === attendu) marquerBon(donne)
    else marquerFaux(donne, x.droits.length
      ? B(`❌ Les angles droits sont : ${attendu} (marqués en rouge).`, `❌ Ar c'hornioù skouer a zo : ${attendu} (merket e ruz).`)
      : B('❌ Cette figure n\'a aucun angle droit.', "❌ N'en deus ar stumm-mañ korn skouer ebet."))
    return
  }
  corrige.value = true
  if (x.type === 'reperage') {
    const donne = nomCase(...dek(sel[0]))
    if (sel[0] === x.cible) marquerBon(donne)
    else marquerFaux(donne, B(`❌ Tu as colorié ${donne}. La bonne case ${x.nom} est entourée en orange.`,
      `❌ Livet ec'h eus ${donne}. Ar garrezenn vat ${x.nom} a zo kelc'hiet en orañjez.`))
    return
  }
  const justes = sel.filter(c => attenduSet.value.has(c)).length
  const enTrop = sel.length - justes
  const manquantes = x.attendu.length - justes
  const br = enBr()
  let donne = br ? `${justes} / ${x.attendu.length} karrezenn mat` : `${justes} / ${x.attendu.length} cases justes`
  if (enTrop) donne += br ? `, ${enTrop} re` : `, ${enTrop} en trop`
  if (!enTrop && !manquantes) marquerBon(donne)
  else {
    const morceaux = []
    if (br) {
      // br: à relire
      if (manquantes) morceaux.push(`${manquantes} karrezenn ankouaet`)
      if (enTrop) morceaux.push(`${enTrop} karrezenn re`)
      marquerFaux(donne, `Tost ! ${morceaux.join(' ha ')}. Sell ouzh ar reizhadenn.`)
    } else {
      if (manquantes) morceaux.push(`${manquantes} case${manquantes > 1 ? 's' : ''} oubliée${manquantes > 1 ? 's' : ''}`)
      if (enTrop) morceaux.push(`${enTrop} case${enTrop > 1 ? 's' : ''} en trop`)
      marquerFaux(donne, `Presque ! ${morceaux.join(' et ')}. Regarde la correction.`)
    }
  }
}

function repondreChoix(ch) {
  if (repondu.value) return
  choixDonne.value = ch
  if (ch === q.value.reponse) marquerBon(ch)
  else marquerFaux(ch, `❌ ${t('bonneReponse')} : ${q.value.reponse}`)
}

function passer() {
  if (repondu.value) return
  const x = q.value
  mauvaises.value++
  historique.value.push({ texte: x.texte, donne: t('passe'), attendu: attenduTexte(x), ok: false })
  suivant()
}

function quitter() {
  clearTimeout(minuterie)
  phase.value = 'config'
}
onUnmounted(() => clearTimeout(minuterie))

function suivant() {
  clearTimeout(minuterie)
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else initQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('resultat80') }
  if (pct >= 60)   return t('resultat60')
  if (pct >= 40)   return t('resultat40')
  return t('resultat0')
})

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
function htmlFiche() {
  const cfg = config.value
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const ex = cfg.exercices
  let corps = ''

  if (ex.includes('symetrie')) {
    const qs = genererSansRepetition(cfg, 3, 'symetrie')
    corps += `<h2>🦋 ${B('Symétrie', 'Kemparzhded')}</h2><p class="consigne">${B("Colorie les cases pour que la figure soit symétrique par rapport à l'axe rouge.", "Liv ar c'harrezennoù evit ma vo kemparzhek ar stumm e-keñver an ahel ruz.")}</p>`
    corps += qs.map(x => `<div class="bloc">${svgGrilleCm({ cols: x.cols, rows: x.rows, pleines: x.modele, axe: x.axe })}</div>`).join('')
  }
  if (ex.includes('reproduction')) {
    const qs = genererSansRepetition(cfg, 2, 'reproduction')
    corps += `<h2>✏️ ${B('Reproduction', 'Adtresañ')}</h2><p class="consigne">${B("Reproduis la figure dans la grille de droite, au même endroit. Le point t'aide à démarrer.", "Adtres ar stumm er gael a-zehou, en hevelep lec'h. Ar poent a sikour ac'hanout da gregiñ.")}</p>`
    corps += qs.map(x => `<div class="bloc duo">${svgGrilleCm({ cols: x.cols, rows: x.rows, pleines: x.modele, repere: x.repere })}${svgGrilleCm({ cols: x.cols, rows: x.rows, repere: x.repere })}</div>`).join('')
  }
  if (ex.includes('reperage')) {
    const { cols, rows } = niv.reperage
    const cases = melanger(Array.from({ length: cols * rows }, (_, i) => k(i % cols, Math.floor(i / cols)))).slice(0, 8)
    const aColorier = cases.slice(0, 4).map(c => nomCase(...dek(c)))
    const syms = ['★', '●', '▲', '■']
    const symboles = Object.fromEntries(cases.slice(4).map((c, i) => [c, syms[i]]))
    corps += `<h2>📍 ${B('Repérage', "Lec'hiañ")}</h2><div class="bloc duo">
      <div><p class="consigne">${B('Colorie les cases', "Liv ar c'harrezennoù")} : <b>${aColorier.join(', ')}</b></p>${svgGrilleCm({ cols, rows, entetes: true })}</div>
      <div><p class="consigne">${B('Écris le nom de chaque case', 'Skriv anv pep karrezenn')} :</p>${svgGrilleCm({ cols, rows, entetes: true, symboles })}
      <p class="lignes">${syms.map(s => `${s} : ______`).join(' &nbsp; ')}</p></div></div>`
  }
  if (ex.includes('figures')) {
    const formes = melanger(niv.figures)
    corps += `<h2>🔷 ${B('Figures', 'Stummoù')}</h2><p class="consigne">${B('Écris le nom de chaque figure.', 'Skriv anv pep stumm.')}</p><div class="bloc galerie">`
      + formes.map(f => `<div class="item">${svgFigure({ forme: f, ...construireFigure(f) }, true, 110)}<div class="ligne"></div></div>`).join('')
      + `</div>`
  }
  if (ex.includes('solides')) {
    const sol = melanger(niv.solides)
    corps += `<h2>🧊 ${B('Solides', 'Soludoù')}</h2><p class="consigne">${B('Écris le nom de chaque solide.', 'Skriv anv pep solud.')}</p><div class="bloc galerie">`
      + sol.map(s => `<div class="item">${svgSolide(s, 110)}<div class="ligne"></div></div>`).join('')
      + `</div>`
  }
  const dispo = niv.exercices
  if (ex.includes('angles') && dispo.includes('angles')) {
    const qs = genererSansRepetition(cfg, 4, 'angles')
    corps += `<h2>📐 ${B('Angles droits', 'Kornioù skouer')}</h2><p class="consigne">${B('Avec ton équerre, cherche les angles droits. Écris leurs lettres (ou « aucun »).', "Gant da skouer, klask ar c'hornioù skouer. Skriv o lizherennoù (pe « hini ebet »).")}</p><div class="bloc galerie">`
      + qs.map(x => `<div class="item">${svgFigure(x, false, 130)}<div class="ligne"></div></div>`).join('') + `</div>`
  }
  if (ex.includes('proprietes') && dispo.includes('proprietes')) {
    const vf = melanger(PROPRIETES.filter(p => !p.choix)).slice(0, 6).map(proprieteLocale)
    corps += `<h2>📋 ${B('Vrai ou faux ?', 'Gwir pe gaou ?')}</h2><p class="consigne">${B('Entoure la bonne réponse.', "Kelc'hia ar respont mat.")}</p>`
      + vf.map((p, i) => `<p class="lignes">${i + 1}. ${p.texte.replace('Vrai ou faux ? ', '').replace('Gwir pe gaou ? ', '')} &nbsp; <b>${B('Vrai — Faux', 'Gwir — Gaou')}</b></p>`).join('')
  }
  if (ex.includes('cercle') && dispo.includes('cercle')) {
    corps += `<h2>⭕ ${B('Cercle', "Kelc'h")}</h2><div class="bloc duo">
      <div><p class="consigne">${B('Avec ton compas, trace un cercle de centre O et de rayon 3 cm.', "Gant da gelc'hier, tres ur c'helc'h a greiz O hag a skin 3 cm.")}</p>
        <svg width="7cm" height="7cm" viewBox="0 0 7 7" xmlns="http://www.w3.org/2000/svg"><circle cx="3.5" cy="3.5" r="0.07" fill="#000"/><text x="3.65" y="3.35" font-size="0.4" font-family="Arial">O</text></svg></div>
      <div><p class="consigne">${B('Repasse en bleu un rayon et en rouge un diamètre.', 'Adtremen e glas ur skin hag e ruz un treuzkiz.')}</p>${svgCercle({ sous: 'lequel', rot: aleatoire(0, 359), pts: { a: 'A', b: 'B', c: 'C', d: 'D', e: 'E' } }, 190)}</div></div>`
  }
  if (ex.includes('patrons') && dispo.includes('patrons')) {
    const { valides, invalides } = patrons()
    const choisis = melanger([...melanger(valides).slice(0, 3), ...melanger(invalides).slice(0, 3)])
      .map(h => normaliserCases(h.map(hasard(SYMETRIES))))
    corps += `<h2>🎲 ${B('Patrons du cube', "Patromoù ar c'hub")}</h2><p class="consigne">${B('Entoure les dessins qui sont des patrons du cube. Tu peux les découper pour vérifier !', "Kelc'hia an tresadennoù a zo patromoù ar c'hub. Gallout a rez o didroc'hañ evit gwiriañ !")}</p><div class="bloc galerie">`
      + choisis.map(c => `<div class="item libre">${svgPatron(c, { cote: 1, unite: 'cm' })}</div>`).join('') + `</div>`
  }

  const nivTxt = cfg.niveau.toUpperCase()
  const html = `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${nivTxt}</title>
    <style>
      @page { size: A4; margin: 1.2cm; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body { font-family: Arial, sans-serif; color: #222; margin: 0; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin: 0 0 .5rem; }
      h2 { font-size: 1.05rem; margin: .6cm 0 .2cm; break-after: avoid; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .3rem; }
      .avertissement { font-size: .8rem; color: #a00; margin-bottom: .4cm; }
      .consigne { font-size: .95rem; margin: .1cm 0 .2cm; }
      .bloc { break-inside: avoid; margin-bottom: .4cm; }
      .duo { display: flex; gap: .5cm; align-items: flex-start; flex-wrap: wrap; }
      .galerie { display: flex; flex-wrap: wrap; gap: .4cm; }
      .item { width: 5.5cm; text-align: center; }
      .item.libre { width: auto; padding: .2cm; }
      .ligne { border-bottom: 1.5px solid #888; margin: .2cm .4cm 0; height: .8cm; }
      .lignes { font-size: 1rem; margin-top: .2cm; }
      svg { display: block; }
    </style></head><body>
    <h1>${t('titre')} — ${nivTxt}</h1>
    <p class="entete">${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    <p class="avertissement">⚠️ ${B('Imprimer à 100 %, sans ajustement à la page : chaque carreau mesure alors 1 cm.', "Moullañ da 100 %, hep azasaat d'ar bajenn : neuze e vuzul pep karrezenn 1 cm.")}</p>
    ${corps}
  </body></html>`

  return html
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
.geo-box { padding: 1.5rem; }

.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}

.astuce { text-align: center; color: #666; font-size: .95rem; margin-top: .5rem; }

.grilles {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
  margin: .5rem 0;
}
.grille-titre-wrap { display: flex; flex-direction: column; align-items: center; gap: .3rem; }
.grille-titre { font-weight: 800; color: #888; font-size: .9rem; text-transform: uppercase; letter-spacing: .05em; }

.grille {
  display: grid;
  gap: 1px;
  padding: 1px;
  background: #9aa5b1;
  position: relative;
  width: max-content;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.case {
  width: var(--cell);
  height: var(--cell);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1rem;
  transition: background .1s;
}
.case.cliquable { cursor: pointer; }
.case.cliquable:hover { background: #eef5ff; }
.case.inactive { background: #eef0f2; }
.case.modele   { background: var(--bleu); }
.case.coloriee, .case.cliquable.coloriee:hover { background: var(--orange); }
.case.juste    { background: var(--vert); }
.case.manquante { background: #fff3cd; box-shadow: inset 0 0 0 3px var(--orange); }
.case.manquante::after { content: '•'; color: var(--orange); font-size: 1.4rem; }
.case.entrop   { background: var(--rouge); }
.case.entrop::after { content: '✕'; color: white; }
.case.repere::after { content: '★'; color: #c0392b; font-size: .95rem; }
.case.modele.repere::after { color: white; }
.case.entete { background: var(--gris-bg); color: var(--texte); cursor: default; }

.axe { position: absolute; background: var(--rouge); border-radius: 2px; pointer-events: none; }
.axe-v { width: 4px; top: -10px; bottom: -10px; }
.axe-h { height: 4px; left: -10px; right: -10px; }

.dessin { display: flex; justify-content: center; margin: .5rem 0; }
.dessin :deep(svg) { max-width: 100%; height: auto; }

.choix-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: .75rem;
  margin-top: 1rem;
}
.choix-btn {
  min-height: 56px;
  font-size: 1.2rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); color: var(--bleu); }
.choix-btn:disabled { cursor: default; }
.choix-btn.bon  { border-color: var(--vert); background: #f0faf0; color: var(--vert); }
.choix-btn.faux { border-color: var(--rouge); background: #fef0f0; color: var(--rouge); }
.choix-btn.actif { border-color: var(--bleu); background: var(--bleu); color: white; }
.choix-btn.manque { border-color: var(--orange); background: #fff3cd; color: var(--texte); }

.legende { display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; font-size: .9rem; color: #555; }
.pastille { display: inline-block; width: 14px; height: 14px; border-radius: 3px; vertical-align: middle; margin-right: .2rem; }
.pastille.juste { background: var(--vert); }
.pastille.manquante { background: #fff3cd; box-shadow: inset 0 0 0 2px var(--orange); }
.pastille.entrop { background: var(--rouge); }

@media (max-width: 520px) {
  .geo-box { padding: 1rem .5rem; }
  .consigne { font-size: 1.1rem; }
}
</style>

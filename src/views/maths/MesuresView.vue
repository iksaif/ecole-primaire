<template>
  <div class="container">
    <h1 class="section-heading">📏 Mesures</h1>

    <!-- Config -->
    <div v-if="phase === 'config'" class="config-box">
      <div class="config-section">
        <div class="config-section-title">Niveau</div>
        <div class="btn-group">
          <button v-for="niv in niveaux" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Exercices</div>
        <div class="btn-group">
          <button v-for="ex in EXERCICES" :key="ex.id"
            class="level-btn" :class="{ active: config.exercices.includes(ex.id) }"
            :disabled="!exercicesDispos.includes(ex.id)"
            @click="toggleExercice(ex.id)">{{ ex.label }}</button>
        </div>
      </div>

      <div v-if="config.exercices.includes('regle')" class="config-section">
        <div class="config-section-title">Segments sur la règle</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: !config.decale }" @click="config.decale = false">Commencent à 0</button>
          <button class="level-btn" :class="{ active: config.decale }" @click="config.decale = true">Ne commencent pas toujours à 0</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;" @click="demarrer">▶ Commencer</button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche">🖨️ Imprimer une fiche</button>
      </div>
    </div>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" title="Quitter l'exercice">✕ Quitter</button>
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <div class="consigne">{{ q.consigne }}</div>

        <!-- Dessin généré par le programme (règle, balance, broc, bouteilles) -->
        <div v-if="q.svg" class="illus" v-html="q.svg"></div>

        <div v-if="q.affiche" class="affiche">{{ q.affiche }}</div>

        <!-- Saisie d'un nombre -->
        <div v-if="q.mode === 'nombre'" class="saisie">
          <input ref="inputEl" class="exercise-input" :class="inputClass"
                 type="number" inputmode="numeric" placeholder="?"
                 v-model="reponse" autocomplete="off" :disabled="verrou"
                 @keydown.enter="valider">
          <span v-if="q.unite" class="unite-label">{{ q.unite }}</span>
        </div>

        <!-- Choix -->
        <div v-else class="choix-grille" :class="{ petits: q.choix.length > 7 }">
          <button v-for="c in q.choix" :key="c" class="choix-btn"
            :class="{
              ok: verrou && c === q.reponse,
              erreur: verrou && c === reponse && c !== q.reponse,
            }"
            :disabled="verrou" @click="choisir(c)">{{ c }}</button>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
        <div v-if="attente && q.explication" class="explication">💡 {{ q.explication }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!attente">
            <button class="btn btn-ghost" :disabled="verrou" @click="passer">Passer ⏭</button>
            <button v-if="q.mode === 'nombre'" class="btn btn-primary" :disabled="verrou" @click="valider">Valider ✔</button>
          </template>
          <button v-else class="btn btn-primary" @click="suivant">Suivant ➜</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>Question</th><th>Ta réponse</th><th>Bonne réponse</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>{{ h.texte }}</td>
            <td>{{ h.donne }}</td>
            <td><strong>{{ h.attendu }}</strong></td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost" @click="phase = 'config'">⚙️ Paramètres</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'

// ==GEN== (logique pure de génération : testée hors Vue)
const JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août',
  'septembre', 'octobre', 'novembre', 'décembre']

const EXERCICES = [
  { id: 'regle',      label: '📏 Mesurer à la règle' },
  { id: 'unite',      label: '🤔 Unité adaptée' },
  { id: 'conversion', label: '🔁 Conversions' },
  { id: 'comparer',   label: '🟰 Comparer' },
  { id: 'masse',      label: '⚖️ Masses (balance)' },
  { id: 'contenance', label: '🥛 Contenances' },
  { id: 'calendrier', label: '📅 Calendrier' },
]

// Données par niveau. Le CE1 et le CE2 ont la même forme.
// objetsUnite : la phrase se lit « texte valeur … » (« Une pomme pèse 150 … »).
const OBJETS_UNITE_CE1 = [
  { texte: 'Un crayon mesure', valeur: 15, unite: 'cm' },
  { texte: 'Une gomme mesure', valeur: 4, unite: 'cm' },
  { texte: "La largeur d'un cahier est de", valeur: 17, unite: 'cm' },
  { texte: 'Une petite cuillère mesure', valeur: 12, unite: 'cm' },
  { texte: "La hauteur d'une porte est de", valeur: 2, unite: 'm' },
  { texte: "La longueur d'une piscine est de", valeur: 25, unite: 'm' },
  { texte: 'Un grand arbre mesure', valeur: 15, unite: 'm' },
  { texte: "La longueur d'une salle de classe est de", valeur: 8, unite: 'm' },
  { texte: 'La distance entre Paris et Marseille est de', valeur: 775, unite: 'km' },
  { texte: 'En une heure, une voiture roule', valeur: 90, unite: 'km' },
  { texte: 'La distance entre deux villes voisines est de', valeur: 30, unite: 'km' },
  { texte: 'Une pomme pèse', valeur: 150, unite: 'g' },
  { texte: 'Une gomme pèse', valeur: 20, unite: 'g' },
  { texte: 'Un stylo pèse', valeur: 10, unite: 'g' },
  { texte: 'Une tablette de chocolat pèse', valeur: 100, unite: 'g' },
  { texte: 'Un enfant de 7 ans pèse', valeur: 25, unite: 'kg' },
  { texte: 'Un chien pèse', valeur: 15, unite: 'kg' },
  { texte: 'Une pastèque pèse', valeur: 4, unite: 'kg' },
  { texte: 'Une voiture pèse', valeur: 1000, unite: 'kg' },
  { texte: 'Une baignoire contient', valeur: 150, unite: 'L' },
  { texte: 'Un seau contient', valeur: 10, unite: 'L' },
  { texte: 'Un arrosoir contient', valeur: 5, unite: 'L' },
  { texte: 'Un aquarium contient', valeur: 50, unite: 'L' },
]
const OBJETS_CONTENANCE_CE1 = [
  { texte: "Une grande bouteille d'eau contient", valeur: 1, unite: 'L' },
  { texte: 'Un seau contient', valeur: 10, unite: 'L' },
  { texte: 'Une baignoire contient', valeur: 150, unite: 'L' },
  { texte: 'Un arrosoir contient', valeur: 5, unite: 'L' },
  { texte: 'Une brique de lait contient', valeur: 1, unite: 'L' },
  { texte: 'Une piscine gonflable contient', valeur: 500, unite: 'L' },
]

const NIVEAUX = {
  ce1: {
    exercices: ['regle', 'unite', 'conversion', 'comparer', 'masse', 'contenance', 'calendrier'],
    regle: { max: 20, segMin: 2, segMax: 15, px: 32, mm: false },  // en cm entiers
    fiche: { segMin: 3, segMax: 12, mm: false },                   // segments imprimés (tiennent sur A4)
    unites: ['cm', 'm', 'km', 'g', 'kg', 'L'],
    objetsUnite: OBJETS_UNITE_CE1,
    // CE1 : 1 m = 100 cm ; 1 km = 1 000 m et 1 kg = 1 000 g seulement (nombres ≤ 1 000)
    conversions: ['m-cm', 'mcm-cm', 'cm-m', 'km-m', 'm-km', 'kg-g', 'g-kg'],
    kmMax: 1, kgMax: 1,
    comparaisons: ['m-cm', 'mcm-cm', 'km-m', 'kg-g'],
    boiteMasses: [1, 2, 2, 5, 10, 20, 20, 50, 100, 200, 200, 500],   // en g (boîte de masses marquées)
    boiteKg: [1, 1, 2, 5],                                           // en kg
    masses: ['equilibre', 'equilibre', 'equilibreKg', 'boites', 'seuil'],
    seuils: [100, 200, 500, 1000],                                   // en g
    contenances: ['broc', 'bouteilles', 'unite'],
    brocs: [{ max: 5, u: 'L' }, { max: 10, u: 'L' }],
    bouteilles: { max1: 5, max2: 3 },
    objetsContenance: OBJETS_CONTENANCE_CE1,
    unitesContenance: ['L', 'kg', 'm'],
    calendrier: ['demain', 'hier', 'dansN', 'semaine', 'moisApres', 'moisAvant', 'numMois', 'semainesJours', 'moisAnnee'],
    dansN: [2, 5],
  },
  ce2: {
    exercices: ['regle', 'unite', 'conversion', 'comparer', 'masse', 'contenance', 'calendrier'],
    regle: { max: 15, segMin: 2, segMax: 12, px: 44, mm: true },   // mesure en cm et mm
    fiche: { segMin: 3, segMax: 11, mm: true },
    unites: ['mm', 'cm', 'm', 'km', 'g', 'kg', 'L', 'dL', 'cL'],
    objetsUnite: [
      ...OBJETS_UNITE_CE1,
      { texte: 'Une fourmi mesure', valeur: 4, unite: 'mm' },
      { texte: "L'épaisseur d'une pièce de 1 € est de", valeur: 2, unite: 'mm' },
      { texte: "L'épaisseur d'un cahier est de", valeur: 5, unite: 'mm' },
      { texte: 'Une canette de jus de fruits contient', valeur: 33, unite: 'cL' },
      { texte: "Un verre d'eau contient", valeur: 20, unite: 'cL' },
      { texte: 'Un bol contient', valeur: 3, unite: 'dL' },
      { texte: 'Un pot de yaourt contient', valeur: 12, unite: 'cL' },
    ],
    conversions: ['cm-mm', 'cmmm-mm', 'mm-cm', 'm-cm', 'mcm-cm', 'cm-m', 'km-m', 'kmm-m', 'kg-g', 'kgg-g', 'g-kg', 'L-dL', 'L-cL', 'dL-cL'],
    kmMax: 9, kgMax: 9,
    comparaisons: ['cm-mm', 'm-cm', 'mcm-cm', 'km-m', 'kg-g', 'L-cL', 'L-dL'],
    boiteMasses: [1, 2, 2, 5, 10, 20, 20, 50, 100, 200, 200, 500],
    boiteKg: [1, 1, 2, 5],
    masses: ['equilibre', 'equilibreMix', 'equilibreKg', 'boites', 'seuil'],
    seuils: [100, 200, 500, 1000, 2000],
    contenances: ['broc', 'bouteilles', 'verres', 'unite'],
    brocs: [{ max: 10, u: 'dL' }, { max: 5, u: 'L' }, { max: 10, u: 'L' }],
    bouteilles: { max1: 5, max2: 4 },
    objetsContenance: [
      ...OBJETS_CONTENANCE_CE1,
      { texte: "Un verre d'eau contient", valeur: 20, unite: 'cL' },
      { texte: 'Une canette de jus de fruits contient', valeur: 33, unite: 'cL' },
      { texte: 'Un bol contient', valeur: 3, unite: 'dL' },
      { texte: 'Une tasse contient', valeur: 2, unite: 'dL' },
    ],
    unitesContenance: ['L', 'dL', 'cL', 'kg', 'm'],
    calendrier: ['dansN', 'moisApres', 'moisAvant', 'numMois', 'semainesJours', 'joursSemaines', 'joursMois', 'dansJours', 'dateDans'],
    dansN: [3, 10],
  },
}

const JOURS_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
const DE_MOIS = m => (/^[aeiouy]/.test(MOIS[m]) ? "d'" : 'de ') + MOIS[m]   // « d'avril », « de mars »

const hasard = arr => arr[aleatoire(0, arr.length - 1)]
const fmtMasse = g => g >= 1000 ? `${g / 1000} kg` : `${g} g`
const SVG_FONT = 'font-family="Arial, sans-serif"'

// ── Dessins SVG (chaînes, réutilisées à l'écran et sur la fiche) ──

function svgRegle(max, s, e, S = 32) {
  const m = 18, W = max * S + 2 * m, H = 100, yR = 46
  let t = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="Règle graduée">`
  t += `<rect x="2" y="${yR}" width="${W - 4}" height="50" rx="5" fill="#fdf1b8" stroke="#c9a227" stroke-width="1.5"/>`
  for (let mm = 0; mm <= max * 10; mm++) {
    const x = m + mm * S / 10
    const len = mm % 10 === 0 ? 18 : mm % 5 === 0 ? 12 : 7
    const w = mm % 10 === 0 ? 1.6 : 0.7
    t += `<line x1="${x}" y1="${yR}" x2="${x}" y2="${yR + len}" stroke="#5a4a10" stroke-width="${w}"/>`
    if (mm % 10 === 0) {
      t += `<text x="${x}" y="${yR + 35}" font-size="13" font-weight="700" text-anchor="middle" fill="#3a2f05" ${SVG_FONT}>${mm / 10}</text>`
    }
  }
  t += `<text x="${W - 8}" y="${yR + 46}" font-size="10" text-anchor="end" fill="#8a7420" ${SVG_FONT}>cm</text>`
  const x1 = m + s * S, x2 = m + e * S, y = yR - 7
  t += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="#e74c3c" stroke-width="5"/>`
  t += `<line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${yR}" stroke="#c0392b" stroke-width="2"/>`
  t += `<line x1="${x2}" y1="${y - 10}" x2="${x2}" y2="${yR}" stroke="#c0392b" stroke-width="2"/>`
  return t + '</svg>'
}

function dimMasse(g) {
  if (g >= 1000) { const k = g / 1000; const w = k >= 5 ? 46 : k >= 2 ? 42 : 38; return [w, w] }
  if (g >= 100) return [34, 32]
  if (g >= 10) return [28, 26]
  return [24, 22]
}

function largeurItem(it) {
  if (it.kind === 'masse') return dimMasse(it.g)[0]
  if (it.kind === 'boite') return it.w
  return 50
}

function dessinItem(it) {
  if (it.kind === 'masse') {
    const [w, h] = dimMasse(it.g)
    const fs = w >= 34 ? 11 : 9
    return `<rect x="${w / 2 - w * 0.18}" y="${-h - 6}" width="${w * 0.36}" height="7" rx="2" fill="#c0952e" stroke="#8a6a1e"/>`
      + `<rect x="0" y="${-h}" width="${w}" height="${h}" rx="4" fill="#d9ad45" stroke="#8a6a1e" stroke-width="1.5"/>`
      + `<text x="${w / 2}" y="${-h / 2 + fs / 2 - 1}" font-size="${fs}" font-weight="700" text-anchor="middle" fill="#3d2c05" ${SVG_FONT}>${fmtMasse(it.g)}</text>`
  }
  if (it.kind === 'boite') {
    return `<rect x="0" y="${-it.h}" width="${it.w}" height="${it.h}" rx="3" fill="${it.couleur}" stroke="#333" stroke-width="1.5"/>`
      + `<line x1="0" y1="${-it.h * 0.65}" x2="${it.w}" y2="${-it.h * 0.65}" stroke="rgba(0,0,0,.25)" stroke-width="2"/>`
  }
  return `<text x="25" y="-4" font-size="44" text-anchor="middle">${it.e}</text>`
}

// tilt : 0 = équilibre, 1 = plateau gauche en bas, -1 = plateau droit en bas
function svgBalance(tilt, gauche, droite) {
  const W = 380, H = 235, cx = 190, cy = 72, half = 120
  const a = tilt * 0.18
  const gx = cx - half * Math.cos(a), gy = cy + half * Math.sin(a)
  const dx = cx + half * Math.cos(a), dy = cy - half * Math.sin(a)
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="Balance à plateaux">`
  s += `<path d="M ${cx - 62} ${H - 6} L ${cx + 62} ${H - 6} L ${cx + 36} ${H - 26} L ${cx - 36} ${H - 26} Z" fill="#7f8c8d"/>`
  s += `<rect x="${cx - 6}" y="${cy}" width="12" height="${H - 26 - cy}" fill="#95a5a6"/>`
  const plateau = (x, y, items) => {
    const yp = y + 78
    let p = `<line x1="${x}" y1="${y}" x2="${x - 62}" y2="${yp}" stroke="#7f8c8d" stroke-width="1.5"/>`
      + `<line x1="${x}" y1="${y}" x2="${x + 62}" y2="${yp}" stroke="#7f8c8d" stroke-width="1.5"/>`
    const larg = items.map(largeurItem)
    const total = larg.reduce((acc, w) => acc + w, 0) + 4 * (items.length - 1)
    const k = Math.min(1, 124 / total)
    let xi = x - total * k / 2
    items.forEach((it, i) => {
      p += `<g transform="translate(${xi.toFixed(1)} ${yp.toFixed(1)}) scale(${k.toFixed(3)})">${dessinItem(it)}</g>`
      xi += (larg[i] + 4) * k
    })
    p += `<path d="M ${x - 70} ${yp} Q ${x} ${yp + 18} ${x + 70} ${yp} Z" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="1.5"/>`
    return p
  }
  s += plateau(gx, gy, gauche) + plateau(dx, dy, droite)
  s += `<line x1="${gx}" y1="${gy}" x2="${dx}" y2="${dy}" stroke="#566573" stroke-width="7" stroke-linecap="round"/>`
  s += `<circle cx="${cx}" cy="${cy}" r="8" fill="#34495e"/>`
  return s + '</svg>'
}

function svgBroc(max, k, u = 'L') {
  const W = 230, H = 260, xg = 80, xd = 180, yb = 240, yMax = 60
  const yv = v => yb - v * (yb - yMax) / max
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="Broc gradué">`
  s += `<rect x="${xg + 1}" y="${yv(k)}" width="${xd - xg - 2}" height="${yb - yv(k) - 1}" rx="6" fill="#74b9ff" opacity=".85"/>`
  s += `<line x1="${xg + 1}" y1="${yv(k)}" x2="${xd - 1}" y2="${yv(k)}" stroke="#2e86de" stroke-width="2"/>`
  s += `<path d="M ${xd} 80 C ${xd + 42} 80 ${xd + 42} 180 ${xd} 180" fill="none" stroke="#555" stroke-width="7"/>`
  s += `<path d="M ${xg - 12} 22 L ${xg} 34 L ${xg} ${yb - 8} Q ${xg} ${yb} ${xg + 8} ${yb} L ${xd - 8} ${yb} Q ${xd} ${yb} ${xd} ${yb - 8} L ${xd} 26" fill="none" stroke="#555" stroke-width="3"/>`
  for (let v = 1; v <= max; v++) {
    const y = yv(v)
    s += `<line x1="${xg}" y1="${y}" x2="${xg + 18}" y2="${y}" stroke="#222" stroke-width="2"/>`
    s += `<text x="${xg - 6}" y="${y + 4}" font-size="13" font-weight="700" text-anchor="end" fill="#222" ${SVG_FONT}>${v} ${u}</text>`
  }
  return s + '</svg>'
}

function svgBouteilles(n1, n2) {
  const items = [...Array(n2).fill(2), ...Array(n1).fill(1)]
  const gap = 10, yb = 150
  const larg = c => c === 2 ? 42 : 32
  const totalB = items.reduce((acc, c) => acc + larg(c) + gap, 0)
  const W = Math.max(totalB + 130, 260), H = 165
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="Bouteilles et seau">`
  let x = 10
  items.forEach(c => {
    const w = larg(c), h = c === 2 ? 100 : 70
    const top = yb - h
    s += `<rect x="${x + w / 2 - 6}" y="${top - 18}" width="12" height="8" rx="2" fill="#e74c3c"/>`
    s += `<rect x="${x + w / 2 - 5}" y="${top - 11}" width="10" height="14" fill="#cdeeff" stroke="#2980b9" stroke-width="1.5"/>`
    s += `<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="9" fill="#a8e0ff" stroke="#2980b9" stroke-width="2"/>`
    s += `<rect x="${x + 3}" y="${top + h * 0.35}" width="${w - 6}" height="20" fill="white" opacity=".9"/>`
    s += `<text x="${x + w / 2}" y="${top + h * 0.35 + 15}" font-size="13" font-weight="700" text-anchor="middle" fill="#1b4f72" ${SVG_FONT}>${c} L</text>`
    x += w + gap
  })
  // flèche et seau
  s += `<text x="${x + 6}" y="105" font-size="28" fill="#555" ${SVG_FONT}>➜</text>`
  const sx = x + 42
  s += `<path d="M ${sx} 70 L ${sx + 70} 70 L ${sx + 60} ${yb} L ${sx + 10} ${yb} Z" fill="#f5b041" stroke="#935116" stroke-width="2"/>`
  s += `<path d="M ${sx} 70 Q ${sx + 35} 30 ${sx + 70} 70" fill="none" stroke="#935116" stroke-width="2.5"/>`
  s += `<text x="${sx + 35}" y="120" font-size="28" font-weight="700" text-anchor="middle" fill="#6e2c00" ${SVG_FONT}>?</text>`
  return s + '</svg>'
}

// ── Générateurs de questions ──

const cmmm = mm => mm % 10 === 0 ? `${mm / 10} cm` : mm < 10 ? `${mm} mm` : `${Math.floor(mm / 10)} cm ${mm % 10} mm`

function genRegle(niv, cfg) {
  const { max, segMin, segMax, px, mm } = niv.regle
  const decale = cfg.decale && Math.random() < 0.7
  if (mm) {
    // CE2 : longueur en mm (pas un nombre entier de cm 3 fois sur 4), départ sur un trait de cm
    let L = aleatoire(segMin * 10, (decale ? segMax : max - 2) * 10)
    if (Math.random() < 0.25) L = Math.round(L / 10) * 10
    const sCm = decale ? aleatoire(1, Math.floor((max * 10 - L) / 10)) : 0
    const eMm = sCm * 10 + L
    return {
      type: 'regle', cle: `regle-${sCm}-${L}`,
      consigne: 'Combien mesure le segment rouge, en millimètres ?',
      svg: svgRegle(max, sCm, eMm / 10, px),
      mode: 'nombre', unite: 'mm', reponse: L, attendu: `${L} mm (${cmmm(L)})`,
      texte: `Segment de ${sCm} cm à ${cmmm(eMm)} sur la règle`,
      explication: (sCm === 0
        ? `Le segment commence à 0 et finit à ${cmmm(eMm)}.`
        : `Le segment commence à ${sCm} cm et finit à ${cmmm(eMm)} : il mesure ${cmmm(L)}.`)
        + ` 1 cm = 10 mm, donc ${cmmm(L)} = ${L} mm.`,
      s: sCm * 10, e: eMm, max: max * 10,
    }
  }
  // Depuis 0, on peut aller presque jusqu'au bout de la règle (assez de variété pour 15 questions)
  const L = aleatoire(segMin, decale ? segMax : max - 2)
  const s = decale ? aleatoire(1, max - L) : 0
  const e = s + L
  return {
    type: 'regle', cle: `regle-${s}-${L}`,
    consigne: 'Combien mesure le segment rouge ?',
    svg: svgRegle(max, s, e, px),
    mode: 'nombre', unite: 'cm', reponse: L, attendu: `${L} cm`,
    texte: `Segment de ${s} à ${e} sur la règle`,
    explication: s === 0
      ? `Le segment commence à 0 et finit à ${e} : il mesure ${L} cm.`
      : `Le segment commence à ${s} et finit à ${e} : ${e} − ${s} = ${L} cm. On peut aussi compter les centimètres entre ${s} et ${e}.`,
    s, e, max,
  }
}

function questionUnite(type, o, choix) {
  return {
    type, cle: `${type}-u-${o.texte}`,
    consigne: 'Choisis la bonne unité.',
    affiche: `${o.texte} ${o.valeur} …`,
    mode: 'choix', choix, reponse: o.unite, attendu: o.unite,
    texte: `${o.texte} ${o.valeur} …`,
    explication: `${o.texte} ${o.valeur} ${o.unite}.`,
  }
}

function genUnite(niv) {
  return questionUnite('unite', hasard(niv.objetsUnite), niv.unites)
}

function genConversion(niv) {
  const kind = hasard(niv.conversions)
  let affiche, reponse, unite, explication
  if (kind === 'm-cm') {
    const a = aleatoire(1, 9)
    affiche = `${a} m = ? cm`; reponse = a * 100; unite = 'cm'
    explication = `1 m = 100 cm, donc ${a} m = ${a * 100} cm.`
  } else if (kind === 'mcm-cm') {
    const a = aleatoire(1, 5), b = aleatoire(1, 19) * 5
    affiche = `${a} m ${b} cm = ? cm`; reponse = a * 100 + b; unite = 'cm'
    explication = `${a} m = ${a * 100} cm, et ${a * 100} + ${b} = ${reponse} cm.`
  } else if (kind === 'cm-m') {
    const a = aleatoire(1, 9)
    affiche = `${a * 100} cm = ? m`; reponse = a; unite = 'm'
    explication = `100 cm = 1 m, donc ${a * 100} cm = ${a} m.`
  } else if (kind === 'km-m') {
    const a = aleatoire(1, niv.kmMax)
    affiche = `${a} km = ? m`; reponse = a * 1000; unite = 'm'
    explication = a === 1 ? '1 km = 1 000 m.' : `1 km = 1 000 m, donc ${a} km = ${a * 1000} m.`
  } else if (kind === 'm-km') {
    const a = aleatoire(1, niv.kmMax)
    affiche = `${a * 1000} m = ? km`; reponse = a; unite = 'km'
    explication = `1 000 m = 1 km.`
  } else if (kind === 'kmm-m') {
    const a = aleatoire(1, 5), b = aleatoire(1, 9) * 100
    affiche = `${a} km ${b} m = ? m`; reponse = a * 1000 + b; unite = 'm'
    explication = `${a} km = ${a * 1000} m, et ${a * 1000} + ${b} = ${reponse} m.`
  } else if (kind === 'kg-g') {
    const a = aleatoire(1, niv.kgMax)
    affiche = `${a} kg = ? g`; reponse = a * 1000; unite = 'g'
    explication = a === 1 ? '1 kg = 1 000 g.' : `1 kg = 1 000 g, donc ${a} kg = ${a * 1000} g.`
  } else if (kind === 'kgg-g') {
    const a = aleatoire(1, 3), b = aleatoire(1, 9) * 100
    affiche = `${a} kg ${b} g = ? g`; reponse = a * 1000 + b; unite = 'g'
    explication = `${a} kg = ${a * 1000} g, et ${a * 1000} + ${b} = ${reponse} g.`
  } else if (kind === 'g-kg') {
    const a = aleatoire(1, niv.kgMax)
    affiche = `${a * 1000} g = ? kg`; reponse = a; unite = 'kg'
    explication = a === 1 ? '1 000 g = 1 kg.' : `1 000 g = 1 kg, donc ${a * 1000} g = ${a} kg.`
  } else if (kind === 'cm-mm') {
    const a = aleatoire(2, 20)
    affiche = `${a} cm = ? mm`; reponse = a * 10; unite = 'mm'
    explication = `1 cm = 10 mm, donc ${a} cm = ${a * 10} mm.`
  } else if (kind === 'cmmm-mm') {
    const a = aleatoire(1, 15), b = aleatoire(1, 9)
    affiche = `${a} cm ${b} mm = ? mm`; reponse = a * 10 + b; unite = 'mm'
    explication = `${a} cm = ${a * 10} mm, et ${a * 10} + ${b} = ${reponse} mm.`
  } else if (kind === 'mm-cm') {
    const a = aleatoire(2, 20)
    affiche = `${a * 10} mm = ? cm`; reponse = a; unite = 'cm'
    explication = `10 mm = 1 cm, donc ${a * 10} mm = ${a} cm.`
  } else if (kind === 'L-dL') {
    const a = aleatoire(1, 9)
    affiche = `${a} L = ? dL`; reponse = a * 10; unite = 'dL'
    explication = `1 L = 10 dL, donc ${a} L = ${a * 10} dL.`
  } else if (kind === 'L-cL') {
    const a = aleatoire(1, 9)
    affiche = `${a} L = ? cL`; reponse = a * 100; unite = 'cL'
    explication = `1 L = 100 cL, donc ${a} L = ${a * 100} cL.`
  } else {
    const a = aleatoire(1, 9)
    affiche = `${a} dL = ? cL`; reponse = a * 10; unite = 'cL'
    explication = `1 dL = 10 cL, donc ${a} dL = ${a * 10} cL.`
  }
  return {
    type: 'conversion', cle: `conv-${affiche}`,
    consigne: 'Complète.', affiche, mode: 'nombre', unite, reponse,
    attendu: `${reponse} ${unite}`, texte: affiche, explication,
  }
}

function genComparer(niv) {
  const kind = hasard(niv.comparaisons)
  const r = aleatoire(0, 2)   // 0 : égal, 1 : proche, 2 : piège
  const signe = () => (Math.random() < 0.5 ? 1 : -1)
  let A, vA, B, vB, u
  if (kind === 'm-cm') {
    const a = aleatoire(1, 5); u = 'cm'
    A = `${a} m`; vA = a * 100
    vB = r === 0 ? vA : vA + signe() * aleatoire(1, 9) * 10
    B = `${vB} cm`
  } else if (kind === 'mcm-cm') {
    const a = aleatoire(1, 3), c = aleatoire(1, 9) * 10; u = 'cm'
    A = `${a} m ${c} cm`; vA = a * 100 + c
    vB = r === 0 ? vA : r === 1 ? vA + signe() * aleatoire(1, 5) * 10 : a * 100 + c / 10
    if (vB === vA && r !== 0) vB += 10
    B = `${vB} cm`
  } else if (kind === 'km-m' || kind === 'kg-g') {
    const [gros, petit] = kind === 'km-m' ? ['km', 'm'] : ['kg', 'g']
    const a = aleatoire(1, kind === 'km-m' ? Math.min(3, niv.kmMax) : Math.min(3, niv.kgMax)); u = petit
    A = `${a} ${gros}`; vA = a * 1000
    if (r === 0) vB = vA
    // CE1 (1 km, 1 kg) : nombres ≤ 1 000 seulement
    else if (a === 1 && niv.kmMax === 1) vB = aleatoire(1, 9) * 100
    else vB = vA + signe() * aleatoire(1, 9) * 100
    B = `${vB} ${petit}`
  } else if (kind === 'cm-mm') {
    const a = aleatoire(2, 15); u = 'mm'
    A = `${a} cm`; vA = a * 10
    vB = r === 0 ? vA : r === 1 ? vA + signe() * aleatoire(1, 9) : a   // piège : 7 cm … 7 mm
    B = `${vB} mm`
  } else if (kind === 'L-cL') {
    const a = aleatoire(1, 3); u = 'cL'
    A = `${a} L`; vA = a * 100
    vB = r === 0 ? vA : r === 1 ? vA + signe() * aleatoire(1, 9) * 10 : a * 10
    B = `${vB} cL`
  } else {
    const a = aleatoire(1, 5); u = 'dL'
    A = `${a} L`; vA = a * 10
    vB = r === 0 ? vA : vA + signe() * aleatoire(1, 5)
    B = `${vB} dL`
  }
  const swap = Math.random() < 0.5
  const [G, vG, D, vD] = swap ? [B, vB, A, vA] : [A, vA, B, vB]
  const sym = vG < vD ? '<' : vG > vD ? '>' : '='
  const affiche = `${G}  …  ${D}`
  return {
    type: 'comparer', cle: `cmp-${G}-${D}`,
    consigne: 'Compare avec <, = ou >.', affiche,
    mode: 'choix', choix: ['<', '=', '>'], reponse: sym, attendu: `${G} ${sym} ${D}`,
    texte: `${G} … ${D}`,
    explication: `On compare dans la même unité : ${A} = ${vA} ${u}. ${vG} ${u} ${sym} ${vD} ${u}.`,
    vG, vD,
  }
}

// Objets posés sur la balance, choisis selon la masse pour rester vraisemblables
const OBJETS_G = [{ e: '📦', n: 'le paquet' }, { e: '🎁', n: 'le cadeau' }, { e: '🧸', n: "l'ours en peluche" }]   // ≥ 100 g
function objetPourMasse(g) {
  if (g < 10) return { e: '🍬', n: 'le bonbon' }
  if (g < 50) return { e: '🔑', n: 'la clé' }
  if (g < 100) return { e: '🍊', n: 'la clémentine' }
  return hasard(OBJETS_G)
}
const OBJETS_KG = [{ e: '🍉', n: 'la pastèque' }, { e: '🎃', n: 'la citrouille' }]
const BOITES = [
  { couleur: '#e74c3c', n: 'La boîte rouge' },
  { couleur: '#3498db', n: 'La boîte bleue' },
  { couleur: '#2ecc71', n: 'La boîte verte' },
  { couleur: '#f1c40f', n: 'La boîte jaune' },
]

function sousEnsemble(liste, k) {
  return melanger(liste.map((v, i) => i)).slice(0, k).map(i => liste[i]).sort((a, b) => b - a)
}

function genMasse(niv) {
  const sous = hasard(niv.masses)
  if (sous === 'equilibreMix') {
    // CE2 : 1 kg + des masses en g → réponse en g
    const g = sousEnsemble(niv.boiteMasses.filter(m => m >= 50), aleatoire(1, 2))
    const masses = [1000, ...g]
    const total = masses.reduce((a, b) => a + b, 0)
    const obj = hasard(OBJETS_KG)
    const items = masses.map(m => ({ kind: 'masse', g: m }))
    const ecrites = masses.map(fmtMasse).join(' + ')
    return {
      type: 'masse', cle: `masse-mix-${masses.join('+')}`,
      consigne: `La balance est en équilibre. Combien pèse ${obj.n}, en grammes ?`,
      svg: svgBalance(0, [{ kind: 'emoji', e: obj.e }], items),
      mode: 'nombre', unite: 'g', reponse: total, attendu: `${total} g`,
      texte: `Balance : ${obj.e} = ${ecrites}`,
      explication: `1 kg = 1000 g. ${masses.map(m => `${m} g`).join(' + ')} = ${total} g.`,
      masses,
    }
  }
  if (sous === 'equilibre' || sous === 'equilibreKg') {
    const enKg = sous === 'equilibreKg'
    const masses = enKg
      ? sousEnsemble(niv.boiteKg, aleatoire(2, 3))
      : sousEnsemble(niv.boiteMasses, aleatoire(2, 4))
    const total = masses.reduce((a, b) => a + b, 0)
    const u = enKg ? 'kg' : 'g'
    const obj = enKg ? hasard(OBJETS_KG) : objetPourMasse(total)
    const items = masses.map(m => ({ kind: 'masse', g: enKg ? m * 1000 : m }))
    return {
      type: 'masse', cle: `masse-eq-${u}-${masses.join('+')}`,
      consigne: `La balance est en équilibre. Combien pèse ${obj.n} ?`,
      svg: svgBalance(0, [{ kind: 'emoji', e: obj.e }], items),
      mode: 'nombre', unite: u, reponse: total, attendu: `${total} ${u}`,
      texte: `Balance : ${obj.e} = ${masses.map(m => `${m} ${u}`).join(' + ')}`,
      explication: `La balance est en équilibre : ${obj.n} pèse autant que les masses. ${masses.map(m => `${m} ${u}`).join(' + ')} = ${total} ${u}.`,
      masses,
    }
  }
  if (sous === 'boites') {
    const [b1, b2] = melanger(BOITES).slice(0, 2)
    const lourd = aleatoire(0, 1)   // 0 : gauche plus lourde
    const t1 = hasard([40, 55, 70]), t2 = hasard([40, 55, 70])
    const gauche = [{ kind: 'boite', couleur: b1.couleur, w: t1, h: t1 * 0.8 }]
    const droite = [{ kind: 'boite', couleur: b2.couleur, w: t2, h: t2 * 0.8 }]
    const rep = lourd === 0 ? b1.n : b2.n
    return {
      type: 'masse', cle: `masse-boites-${b1.n}-${b2.n}-${lourd}-${t1}-${t2}`,
      consigne: 'Regarde la balance. Quelle boîte est la plus lourde ?',
      svg: svgBalance(lourd === 0 ? 1 : -1, gauche, droite),
      mode: 'choix', choix: [b1.n, b2.n], reponse: rep, attendu: rep,
      texte: `${b1.n} ou ${b2.n.toLowerCase()} ?`,
      explication: 'Le plateau qui descend porte l\'objet le plus lourd (même s\'il est plus petit !).',
      lourd,
    }
  }
  const X = hasard(niv.seuils)
  const plus = Math.random() < 0.5
  const choix = [`Plus de ${fmtMasse(X)}`, `Moins de ${fmtMasse(X)}`]
  const rep = plus ? choix[0] : choix[1]
  return {
    type: 'masse', cle: `masse-seuil-${X}-${plus}`,
    consigne: `Le paquet pèse-t-il plus ou moins de ${fmtMasse(X)} ?`,
    svg: svgBalance(plus ? 1 : -1, [{ kind: 'emoji', e: '📦' }], [{ kind: 'masse', g: X }]),
    mode: 'choix', choix, reponse: rep, attendu: rep,
    texte: `Paquet face à ${fmtMasse(X)}`,
    explication: plus
      ? `Le plateau du paquet descend : le paquet est plus lourd que ${fmtMasse(X)}.`
      : `Le plateau du paquet monte : le paquet est plus léger que ${fmtMasse(X)}.`,
    plus,
  }
}

function genContenance(niv) {
  const sous = hasard(niv.contenances)
  if (sous === 'unite') {
    // Mélange avec d'autres unités (kg, m…) pour obliger à réfléchir
    return questionUnite('contenance', hasard(niv.objetsContenance), niv.unitesContenance)
  }
  if (sous === 'broc') {
    const { max, u } = hasard(niv.brocs)
    const k = aleatoire(1, max)
    return {
      type: 'contenance', cle: `cont-broc-${max}-${u}-${k}`,
      consigne: u === 'L' ? "Combien de litres d'eau y a-t-il dans le broc ?" : "Combien de décilitres d'eau y a-t-il dans le broc ?",
      svg: svgBroc(max, k, u),
      mode: 'nombre', unite: u, reponse: k, attendu: `${k} ${u}`,
      texte: `Broc gradué jusqu'à ${max} ${u}`,
      explication: `L'eau arrive au trait « ${k} ${u} ».` + (u === 'dL' && k === 10 ? ' 10 dL = 1 L.' : ''),
      max, k,
    }
  }
  if (sous === 'verres') {
    const c = hasard([20, 25, 50]), B = hasard([1, 2])
    const n = B * 100 / c
    return {
      type: 'contenance', cle: `cont-verres-${c}-${B}`,
      consigne: `Un verre contient ${c} cL. Combien de verres faut-il pour remplir une bouteille de ${B} L ?`,
      mode: 'nombre', unite: 'verres', reponse: n, attendu: `${n} verres`,
      texte: `Verres de ${c} cL pour ${B} L`,
      explication: `${B} L = ${B * 100} cL. ${Array(n).fill(c).join(' + ')} = ${B * 100} cL : il faut ${n} verres.`,
      c, B,
    }
  }
  const { max1, max2 } = niv.bouteilles
  const n2 = aleatoire(0, max2)
  const n1 = aleatoire(n2 === 0 ? 2 : n2 === 1 ? 1 : 0, max1)
  const total = n1 + 2 * n2
  const parts = []
  if (n2) parts.push(`${n2} bouteille${n2 > 1 ? 's' : ''} de 2 L = ${2 * n2} L`)
  if (n1) parts.push(`${n1} bouteille${n1 > 1 ? 's' : ''} de 1 L = ${n1} L`)
  return {
    type: 'contenance', cle: `cont-bout-${n1}-${n2}`,
    consigne: 'On vide toutes ces bouteilles dans le seau : il est plein ! Combien de litres contient le seau ?',
    svg: svgBouteilles(n1, n2),
    mode: 'nombre', unite: 'L', reponse: total, attendu: `${total} L`,
    texte: `${n2} bouteille(s) de 2 L et ${n1} de 1 L`,
    explication: parts.length === 2 ? `${parts.join(' ; ')}. ${2 * n2} + ${n1} = ${total} L.` : `${parts[0]}.`,
    n1, n2,
  }
}

function genCalendrier(niv) {
  const sous = hasard(niv.calendrier)
  const j = aleatoire(0, 6), m = aleatoire(0, 11)
  const base = { type: 'calendrier', mode: 'choix', choix: JOURS }
  if (sous === 'demain' || sous === 'hier') {
    const r = JOURS[(j + (sous === 'demain' ? 1 : 6)) % 7]
    return { ...base, cle: `cal-${sous}-${j}`,
      consigne: sous === 'demain'
        ? `Aujourd'hui, nous sommes ${JOURS[j]}. Quel jour serons-nous demain ?`
        : `Aujourd'hui, nous sommes ${JOURS[j]}. Quel jour étions-nous hier ?`,
      reponse: r, attendu: r, texte: `Aujourd'hui ${JOURS[j]} → ${sous} ?`,
      explication: `Les jours de la semaine : ${JOURS.join(', ')}.` }
  }
  if (sous === 'dansN') {
    const n = aleatoire(...niv.dansN)
    const r = JOURS[(j + n) % 7]
    if (n >= 7) {
      return { ...base, cle: `cal-n-${j}-${n}`,
        consigne: `Aujourd'hui, nous sommes ${JOURS[j]}. Quel jour serons-nous dans ${n} jours ?`,
        reponse: r, attendu: r, texte: `${JOURS[j]} + ${n} jours ?`,
        explication: n === 7
          ? 'Une semaine = 7 jours : on retombe sur le même jour !'
          : `Dans 7 jours (une semaine), on est encore ${JOURS[j]}. Encore ${n - 7} jour${n - 7 > 1 ? 's' : ''} : ${r}.`, j, n }
    }
    const chemin = Array.from({ length: n }, (_, i) => JOURS[(j + i + 1) % 7])
    return { ...base, cle: `cal-n-${j}-${n}`,
      consigne: `Aujourd'hui, nous sommes ${JOURS[j]}. Quel jour serons-nous dans ${n} jours ?`,
      reponse: r, attendu: r, texte: `${JOURS[j]} + ${n} jours ?`,
      explication: `On compte ${n} jours : ${chemin.map((d, i) => `${i + 1}. ${d}`).join(', ')}.`, j, n }
  }
  if (sous === 'semaine') {
    return { ...base, cle: `cal-sem-${j}`,
      consigne: `Aujourd'hui, nous sommes ${JOURS[j]}. Quel jour serons-nous dans une semaine ?`,
      reponse: JOURS[j], attendu: JOURS[j], texte: `${JOURS[j]} + 1 semaine ?`,
      explication: 'Une semaine = 7 jours : on retombe sur le même jour !' }
  }
  if (sous === 'moisApres' || sous === 'moisAvant') {
    const r = MOIS[(m + (sous === 'moisApres' ? 1 : 11)) % 12]
    return { ...base, choix: MOIS, cle: `cal-${sous}-${m}`,
      consigne: `Quel mois vient juste ${sous === 'moisApres' ? 'après' : 'avant'} ${MOIS[m]} ?`,
      reponse: r, attendu: r, texte: `Mois ${sous === 'moisApres' ? 'après' : 'avant'} ${MOIS[m]}`,
      explication: `Les mois de l'année : ${MOIS.join(', ')}.` }
  }
  if (sous === 'numMois') {
    return { type: 'calendrier', mode: 'nombre', unite: '', cle: `cal-num-${m}`,
      consigne: `Janvier est le mois n° 1. Quel est le numéro du mois de ${MOIS[m]} ?`,
      reponse: m + 1, attendu: String(m + 1), texte: `Numéro du mois de ${MOIS[m]}`,
      explication: MOIS.slice(0, m + 1).map((x, i) => `${x} = ${i + 1}`).join(', ') + '.' }
  }
  if (sous === 'semainesJours') {
    const n = aleatoire(1, 4)
    const aff = `${n} semaine${n > 1 ? 's' : ''} = ? jours`
    return { type: 'calendrier', mode: 'nombre', unite: 'jours', cle: `cal-sj-${n}`,
      consigne: 'Complète.', affiche: aff,
      reponse: 7 * n, attendu: `${7 * n} jours`, texte: aff,
      explication: n === 1 ? '1 semaine = 7 jours.' : `1 semaine = 7 jours, donc ${n} semaines = ${Array(n).fill(7).join(' + ')} = ${7 * n} jours.` }
  }
  if (sous === 'joursSemaines') {
    const n = aleatoire(2, 6)
    const aff = `${7 * n} jours = ? semaines`
    return { type: 'calendrier', mode: 'nombre', unite: 'semaines', cle: `cal-js-${n}`,
      consigne: 'Complète.', affiche: aff,
      reponse: n, attendu: `${n} semaines`, texte: aff,
      explication: `1 semaine = 7 jours. ${n} × 7 = ${7 * n}, donc ${7 * n} jours = ${n} semaines.` }
  }
  if (sous === 'joursMois') {
    const r = m === 1 ? '28 ou 29' : String(JOURS_MOIS[m])
    return { type: 'calendrier', mode: 'choix', choix: ['28 ou 29', '30', '31'], cle: `cal-jm-${m}`,
      consigne: `Combien de jours y a-t-il dans le mois ${DE_MOIS(m)} ?`,
      reponse: r, attendu: `${r} jours`, texte: `Jours du mois ${DE_MOIS(m)}`,
      explication: m === 1
        ? 'Février a 28 jours, et 29 jours les années bissextiles (une fois tous les 4 ans).'
        : `${MOIS[m][0].toUpperCase() + MOIS[m].slice(1)} a ${r} jours. Astuce : compte sur les bosses de tes poings !` }
  }
  if (sous === 'dansJours') {
    const mm = m === 1 ? 2 : m
    const d1 = aleatoire(1, 15), d2 = aleatoire(d1 + 3, Math.min(JOURS_MOIS[mm], d1 + 20))
    return { type: 'calendrier', mode: 'nombre', unite: 'jours', cle: `cal-dj-${mm}-${d1}-${d2}`,
      consigne: `Aujourd'hui, nous sommes le ${d1} ${MOIS[mm]}. Dans combien de jours serons-nous le ${d2} ${MOIS[mm]} ?`,
      reponse: d2 - d1, attendu: `${d2 - d1} jours`, texte: `Du ${d1} au ${d2} ${MOIS[mm]}`,
      explication: `${d2} − ${d1} = ${d2 - d1} : il reste ${d2 - d1} jours.`, d1, d2 }
  }
  if (sous === 'dateDans') {
    const mm = m === 1 ? 2 : m
    const n = aleatoire(1, 2), d1 = aleatoire(1, JOURS_MOIS[mm] - 7 * n)
    const d2 = d1 + 7 * n
    return { type: 'calendrier', mode: 'nombre', unite: MOIS[mm], cle: `cal-dd-${mm}-${d1}-${n}`,
      consigne: `Nous sommes le ${d1} ${MOIS[mm]}. Quelle date serons-nous dans ${n === 1 ? 'une semaine' : 'deux semaines'} ? Le …`,
      reponse: d2, attendu: `le ${d2} ${MOIS[mm]}`, texte: `${d1} ${MOIS[mm]} + ${n} semaine${n > 1 ? 's' : ''}`,
      explication: `${n === 1 ? '1 semaine = 7 jours' : '2 semaines = 14 jours'} : ${d1} + ${7 * n} = ${d2}.`, d1, d2, n }
  }
  return { type: 'calendrier', mode: 'nombre', unite: 'mois', cle: 'cal-mois-annee',
    consigne: 'Combien y a-t-il de mois dans une année ?',
    reponse: 12, attendu: '12 mois', texte: 'Mois dans une année',
    explication: `Une année = 12 mois : ${MOIS.join(', ')}.` }
}

const GENERATEURS = {
  regle: genRegle, unite: genUnite, conversion: genConversion, comparer: genComparer,
  masse: genMasse, contenance: genContenance, calendrier: genCalendrier,
}

// Répartit les questions entre les exercices choisis, sans répétition (essais bornés)
function genererSerie(cfg, nb, typesForces) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let types = (typesForces || cfg.exercices).filter(t => niv.exercices.includes(t) && GENERATEURS[t])
  if (!types.length) types = ['regle']
  const ordre = melanger(types)
  const vus = new Set(), res = []
  for (let i = 0; i < nb; i++) {
    const type = ordre[i % ordre.length]
    for (let essai = 0; essai < 80; essai++) {
      const q = GENERATEURS[type](niv, cfg)
      if (!vus.has(q.cle)) { vus.add(q.cle); res.push(q); break }
    }
  }
  return typesForces ? res : melanger(res)
}
// ==/GEN==

// ── État & configuration ──

const niveaux = Object.keys(NIVEAUX)
const DEFAUT = { niveau: 'ce1', exercices: ['regle', 'unite', 'conversion'], nbQ: 10, decale: false }
const charge = { ...DEFAUT, ...charger('mesures_config', {}) }
if (!NIVEAUX[charge.niveau]) charge.niveau = 'ce1'
if (!Array.isArray(charge.exercices) || !charge.exercices.length) charge.exercices = [...DEFAUT.exercices]
const config = ref(charge)
watch(config, v => sauvegarder('mesures_config', v), { deep: true })

const exercicesDispos = computed(() => NIVEAUX[config.value.niveau]?.exercices || [])

watch(() => config.value.niveau, () => {
  const ok = config.value.exercices.filter(e => exercicesDispos.value.includes(e))
  config.value.exercices = ok.length ? ok : [exercicesDispos.value[0]]
})

function toggleExercice(id) {
  const ex = config.value.exercices
  if (ex.includes(id)) {
    if (ex.length === 1) return
    config.value.exercices = ex.filter(e => e !== id)
  } else {
    config.value.exercices = [...ex, id]
  }
}

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const reponse = ref('')
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const verrou = ref(false)
const attente = ref(false)
const inputEl = ref(null)
let timer = null

const q = computed(() => questions.value[idx.value])

function demarrer() {
  clearTimeout(timer)
  questions.value = genererSerie(config.value, config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  afficherQuestion()
}

function quitter() {
  clearTimeout(timer)
  phase.value = 'config'
}

function afficherQuestion() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  verrou.value = false; attente.value = false
  nextTick(() => inputEl.value?.focus())
}

function choisir(c) {
  if (verrou.value) return
  reponse.value = c
  valider()
}

function valider() {
  if (verrou.value) return
  const question = q.value
  let ok, donne
  if (question.mode === 'nombre') {
    const v = String(reponse.value ?? '').trim().replace(',', '.')
    if (v === '') return
    ok = Number(v) === question.reponse
    donne = question.unite ? `${v} ${question.unite}` : v
  } else {
    if (!reponse.value) return
    ok = reponse.value === question.reponse
    donne = reponse.value
  }
  verrou.value = true
  historique.value.push({ texte: question.texte, donne, attendu: question.attendu, ok })
  if (ok) {
    inputClass.value = 'ok'
    feedback.value = ['Bravo ! 🎉', 'Excellent ! ⭐', 'Parfait ! 👏', 'Super ! 🌟'][aleatoire(0, 3)]
    feedbackClass.value = 'ok'
    bonnes.value++
    timer = setTimeout(suivant, 900)
  } else {
    inputClass.value = 'erreur'
    feedback.value = `❌ La bonne réponse : ${question.attendu}`
    feedbackClass.value = 'erreur'
    mauvaises.value++
    attente.value = true
  }
}

function passer() {
  if (verrou.value) return
  const question = q.value
  verrou.value = true
  historique.value.push({ texte: question.texte, donne: '(passé)', attendu: question.attendu, ok: false })
  mauvaises.value++
  feedback.value = `La bonne réponse : ${question.attendu}`
  feedbackClass.value = 'erreur'
  attente.value = true
}

function suivant() {
  clearTimeout(timer)
  if (phase.value !== 'jeu') return
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else afficherQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Très bien ! Continue comme ça 🌟' }
  if (pct >= 60)   return 'Bien ! Tu peux encore progresser 💪'
  if (pct >= 40)   return 'Courage, continue à t\'entraîner ! 🤓'
  return 'N\'abandonne pas, pratique encore ! 📚'
})

onUnmounted(() => clearTimeout(timer))

// ── Fiche imprimable ──

function segmentReel(L) {
  // viewBox en mm : 1 unité = 1 mm, largeur CSS en cm réels
  return `<svg width="${L}cm" height="0.8cm" viewBox="0 0 ${L * 10} 8" style="overflow:visible">`
    + `<line x1="0" y1="4" x2="${L * 10}" y2="4" stroke="#c0392b" stroke-width="0.7"/>`
    + `<line x1="0" y1="1" x2="0" y2="7" stroke="#c0392b" stroke-width="0.4"/>`
    + `<line x1="${L * 10}" y1="1" x2="${L * 10}" y2="7" stroke="#c0392b" stroke-width="0.4"/></svg>`
}

function regleTemoin() {
  let s = '<svg width="10cm" height="1.1cm" viewBox="0 0 100 11" style="overflow:visible">'
  s += '<line x1="0" y1="0.2" x2="100" y2="0.2" stroke="#000" stroke-width="0.4"/>'
  for (let mm = 0; mm <= 100; mm++) {
    const len = mm % 10 === 0 ? 4.5 : mm % 5 === 0 ? 3 : 1.8
    s += `<line x1="${mm}" y1="0" x2="${mm}" y2="${len}" stroke="#000" stroke-width="${mm % 10 === 0 ? 0.35 : 0.15}"/>`
    if (mm % 10 === 0) s += `<text x="${mm}" y="9" font-size="3.5" text-anchor="middle" font-family="Arial">${mm / 10}</text>`
  }
  return s + '</svg>'
}

const TROU = '<span class="trou"></span>'

function questionImprimee(qi) {
  let h = '<div class="q">'
  if (['conversion', 'unite', 'comparer'].includes(qi.type) || (qi.type === 'calendrier' && qi.affiche)) {
    h += `<div class="affiche">${qi.affiche.replace('?', TROU).replace('…', TROU)}</div>`
  } else {
    h += `<div class="consigne">${qi.consigne}</div>`
    if (qi.svg) h += `<div class="illus">${qi.svg}</div>`
    if (qi.affiche) h += `<div class="affiche">${qi.affiche}</div>`
    if (qi.mode === 'nombre') h += `<div class="affiche">Réponse : ${TROU} ${qi.unite || ''}</div>`
    else if (qi.type === 'calendrier' && qi.choix.length > 3) h += `<div class="affiche">Réponse : ${TROU}${TROU}</div>`
    else h += `<div class="choix">Entoure : ${qi.choix.map(c => `<span>${c}</span>`).join('')}</div>`
  }
  return h + '</div>'
}

function imprimerFiche() {
  const cfg = config.value
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const ex = cfg.exercices.filter(e => niv.exercices.includes(e))
  const sections = []

  if (ex.includes('regle') && niv.fiche.mm) {
    // CE2 : longueurs en cm et mm (en mm, entre 3 cm et 12 cm), surtout pas des cm entiers
    const longueurs = []
    for (let L = niv.fiche.segMin * 10; L <= niv.fiche.segMax * 10; L++) if (L % 10 !== 0 || L % 30 === 0) longueurs.push(L)
    const choisis = melanger(longueurs).slice(0, 6)
    const segs = choisis.map((L, i) => `<div class="seg"><span class="lettre">${'ABCDEF'[i]}</span>${segmentReel(L / 10)}<span class="rep">${TROU} cm ${TROU} mm</span></div>`).join('')
    const traces = melanger(longueurs.filter(L => L <= 100 && !choisis.includes(L))).slice(0, 2)
      .map(L => `<div class="trace">Trace un segment de <strong>${cmmm(L)}</strong> : <span class="point">×</span></div>`).join('')
    sections.push(`<h2>📏 Mesure chaque segment avec ta règle (en cm et mm)</h2>${segs}<h2>✏️ Trace avec ta règle</h2>${traces}`)
  } else if (ex.includes('regle')) {
    const longueurs = []
    for (let L = niv.fiche.segMin; L <= niv.fiche.segMax; L++) longueurs.push(L)
    const choisis = melanger(longueurs).slice(0, 6)
    const segs = choisis.map((L, i) => `<div class="seg"><span class="lettre">${'ABCDEF'[i]}</span>${segmentReel(L)}<span class="rep">${TROU} cm</span></div>`).join('')
    const traces = melanger(longueurs.filter(L => L <= 10 && !choisis.includes(L)).concat([5, 8]))
      .filter((v, i, a) => a.indexOf(v) === i).slice(0, 2)
      .map(L => `<div class="trace">Trace un segment de <strong>${L} cm</strong> : <span class="point">×</span></div>`).join('')
    sections.push(`<h2>📏 Mesure chaque segment avec ta règle</h2>${segs}<h2>✏️ Trace avec ta règle</h2>${traces}`)
  }

  const blocs = [
    ['conversion', '🔁 Complète les conversions', 6],
    ['unite', `🤔 Écris la bonne unité : ${niv.unites.slice(0, -1).join(', ')} ou ${niv.unites[niv.unites.length - 1]}`, 6],
    ['comparer', '🟰 Compare avec &lt;, = ou &gt;', 4],
    ['masse', '⚖️ Les masses', 2],
    ['contenance', '🥛 Les contenances', 2],
    ['calendrier', '📅 Le calendrier', 4],
  ]
  blocs.forEach(([type, titre, nb]) => {
    if (!ex.includes(type)) return
    const qs = genererSerie(cfg, nb, [type])
    const grille = ['masse', 'contenance'].includes(type) ? 'grille2' : 'grille'
    sections.push(`<h2>${titre}</h2><div class="${grille}">${qs.map(questionImprimee).join('')}</div>`)
  })

  const html = `<!DOCTYPE html><html lang="fr"><head>
    <meta charset="UTF-8"><title>Mesures — ${cfg.niveau.toUpperCase()}</title>
    <style>
      @page { size: A4; margin: 1.2cm; }
      body { font-family: Arial, sans-serif; max-width: 18cm; margin: 0 auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1.02rem; margin: 1rem 0 .4rem; break-after: avoid; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .6rem; }
      .alerte { border: 2px solid #c0392b; color: #c0392b; font-weight: 700; padding: .35rem .6rem; border-radius: 6px; font-size: .9rem; }
      .temoin { display: flex; align-items: flex-start; gap: .6cm; margin: .5rem 0 .3rem; font-size: .78rem; color: #555; }
      .seg { display: flex; align-items: center; gap: .5cm; margin: .45cm 0; }
      .lettre { font-weight: 800; width: .6cm; }
      .rep { font-size: 1rem; white-space: nowrap; }
      .seg .trou { min-width: 1.4cm; }
      .trou { display: inline-block; min-width: 2.2cm; border-bottom: 1.5px dotted #555; margin: 0 .15cm; }
      .trace { margin: .3cm 0 1.1cm; }
      .point { margin-left: .4cm; font-weight: 700; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: .25cm .8cm; }
      .grille2 { display: grid; grid-template-columns: 1fr 1fr; gap: .4cm .8cm; }
      .q { break-inside: avoid; margin: .2cm 0; }
      .affiche { font-size: 1.05rem; font-weight: 700; margin: .15cm 0; }
      .consigne { font-size: .9rem; margin-bottom: .1cm; }
      .illus svg { width: 6.5cm; height: auto; }
      .choix span { display: inline-block; margin: 0 .3cm; padding: .05cm .2cm; }
    </style></head><body>
    <h1>📏 Mesures — ${cfg.niveau.toUpperCase()}</h1>
    <p class="entete">Nom : ________________________________ &nbsp; Date : ______________</p>
    <p class="alerte">⚠️ Imprimer à 100 % (« taille réelle »), sans ajustement à la page, sinon les segments n'auront pas la bonne longueur.</p>
    ${ex.includes('regle') ? `<div class="temoin">${regleTemoin()}<span>Pour le parent : ce trait gradué doit mesurer exactement 10 cm.</span></div>` : ''}
    ${sections.join('')}
    <script>window.onafterprint = function() { window.close(); }; window.print();<\/script>
  </body></html>`

  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}
</script>

<style scoped>
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.4;
}
.illus {
  display: flex;
  justify-content: center;
  margin: .5rem 0 1rem;
}
.illus :deep(svg) { height: auto; }
.affiche {
  font-size: 2rem;
  font-weight: 900;
  text-align: center;
  margin: .5rem 0 1rem;
  white-space: pre-wrap;
}
.saisie {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .6rem;
}
.saisie .exercise-input {
  width: 9rem;
  display: inline-block;
}
.unite-label {
  font-size: 1.8rem;
  font-weight: 800;
}
.choix-grille {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: .6rem;
}
.choix-btn {
  min-width: 4rem;
  min-height: 3.2rem;
  padding: .5rem 1rem;
  font-size: 1.4rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-grille.petits .choix-btn { font-size: 1.05rem; min-width: 7rem; }
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn:disabled { cursor: default; }
.choix-btn.ok     { border-color: var(--vert); background: #f0faf0; }
.choix-btn.erreur { border-color: var(--rouge); background: #fef0f0; }
.explication {
  background: #fff8e1;
  border-left: 4px solid var(--orange);
  border-radius: 6px;
  padding: .6rem .8rem;
  font-size: 1.05rem;
  margin-top: .5rem;
}
.level-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
@media (max-width: 520px) {
  .consigne { font-size: 1.1rem; }
  .affiche { font-size: 1.5rem; }
  .choix-btn { font-size: 1.15rem; min-width: 3.2rem; }
}
</style>

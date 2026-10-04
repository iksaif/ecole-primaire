<template>
  <div class="container">
    <h1 class="section-heading">🧩 {{ t('titre') }}</h1>

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
        <div class="config-section-title">{{ t('typesProblemes') }}</div>
        <div class="btn-group">
          <button v-for="c in categoriesNiveau" :key="c.id"
            class="level-btn" :class="{ active: config.categories.includes(c.id) }"
            @click="toggleCategorie(c.id)">{{ t(`cat_${c.id}`) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nombres') }}</div>
        <div class="btn-group">
          <button v-for="(p, id) in niveauData.plages" :key="id"
            class="level-btn" :class="{ active: config.plage === id }"
            @click="config.plage = id">{{ t('jusqua', { n: p.max }) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbProblemes') }}</div>
        <div class="btn-group">
          <button v-for="n in [3, 5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('probleme', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <div class="enonce">
          <p>{{ q.enonce }}</p>
          <p class="enonce-question">{{ q.question }}</p>
        </div>

        <!-- pas de voix bretonne dans les navigateurs : bouton masqué en breton -->
        <div v-if="langue !== 'br'" style="text-align:center;margin-bottom:1rem;">
          <button class="btn btn-ghost" @click="lireEnonce">
            {{ enLecture ? t('arreter') : t('lireEnonce') }}
          </button>
        </div>

        <div class="reponse-ligne">
          <input ref="inputEl" class="exercise-input reponse-input" :class="inputClass"
                 type="number" inputmode="numeric" placeholder="?"
                 v-model="reponse" autocomplete="off" :disabled="verrou" @keydown.enter="valider">
          <span class="unite">{{ unite(q, q.reponse) }}</span>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
        <div v-if="verrou && !dernierOk" class="calcul-correction">{{ q.calcul }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost" :disabled="verrou" @click="passer">{{ t('passer') }}</button>
          <button v-if="!verrou" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          <button v-else-if="!dernierOk" class="btn btn-primary" @click="suivant">{{ t('suivant') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('colProbleme') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('colCorrection') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>{{ h.question }}</td>
            <td>{{ h.donne }}</td>
            <td><span style="font-weight:800;">{{ h.calcul }}</span><br>→ {{ h.attendu }}</td>
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
import { aleatoire, melanger, confettis, sauvegarder, chargerReglages } from '../../utils'
import { useTTS } from '../../composables/useTTS'
import { useI18n, contenu } from '../../i18n'
import { regles } from '../../i18n/regles'
import messagesFr from '../../i18n/fr/views/maths/ProblemesView.js'
import messagesBr from '../../i18n/br/views/maths/ProblemesView.js'
import contenuFr from '../../i18n/fr/contenu/problemes.js'
import contenuBr from '../../i18n/br/contenu/problemes.js'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'
import { ligneNomDate } from '../../composables/useOptionsFiche'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
// Maths : le contenu (énoncés, fiche) suit la langue de l'interface
const langueContenu = computed(() => langue.value)
const C = contenu({ fr: contenuFr, br: contenuBr }, () => langueContenu.value)
const R = computed(() => regles(langueContenu.value))

// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau. Un modèle peut être réservé à certains niveaux (champ `niveaux`)
// ou à une plage minimale (champ `min`, ex. prix d'un vélo seulement « jusqu'à 1000 »).
const NIVEAUX = {
  ce1: {
    plages: {
      petits: { max: 20 },
      moyens: { max: 100 },
      grands: { max: 1000 },
    },
    tables: [2, 3, 4, 5, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'],
  },
  ce2: {
    plages: {
      moyens: { max: 100 },
      grands: { max: 1000 },
    },
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'],
  },
}

// libellés : clés `cat_<id>` du catalogue d'interface
const CATEGORIES = ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'].map(id => ({ id }))

// « Un vélo a 2 roues » : k parties par objet ; noms dans le catalogue de contenu (`chosesAParties`),
// un objet absent d'une langue n'y est pas proposé (pas de tricycle en breton)
const CHOSES_A_PARTIES = [
  { id: 'velo', k: 2 }, { id: 'tricycle', k: 3 }, { id: 'voiture', k: 4 },
  { id: 'chien', k: 4 }, { id: 'main', k: 5 }, { id: 'etoile', k: 5 },
]

function choisir(t) { return t[aleatoire(0, t.length - 1)] }
// Données de la langue du contenu
const PRENOMS = () => C.t('prenoms')
const OBJETS = () => C.t('objets')
const U = () => C.t('unites')
function deuxPrenoms() { const [a, b] = melanger(PRENOMS()); return [a, b] }
const prenom = () => choisir(PRENOMS())

// Deux nombres a, b avec a + b ≤ max, ni trop petits ni triviaux
function tirerSomme(max) {
  const lo = max <= 20 ? 2 : max <= 100 ? Math.max(3, Math.round(max / 10)) : 40
  const a = aleatoire(lo, max - lo)
  const b = aleatoire(Math.max(2, Math.round(lo / 2)), max - a)
  return [a, b]
}

// n × k avec k dans les tables du niveau, produit ≤ max
function tirerProduit(niv, max) {
  let n, k
  do { n = aleatoire(2, 10); k = choisir(niv.tables) } while (n * k > Math.max(max, 20))
  return [n, k]
}

function multiplicationDetail(n, k) {
  const r = n * k
  return n <= 5 ? `${Array(n).fill(k).join(' + ')} = ${r}, ${C.t('donc')} ${n} × ${k} = ${r}` : `${n} × ${k} = ${r}`
}

// Problème : énoncé (clé), question (clé), paramètres des textes, puis réponse, unité et calcul
function pb(cle, cleQ, params, reponse, unite, calcul) {
  return { enonce: C.t(cle, params), question: C.t(cleQ, params), reponse, unite, calcul }
}

// Chaque modèle : cat, cap (plus grand nombre réaliste dans ce contexte), gen(niv, max)
// gen renvoie { enonce, question, reponse, unite, calcul } ; textes et données dans les catalogues
// de contenu (src/i18n/<langue>/contenu/problemes.js)
const MODELES = [
  // ─── Ajout / retrait ──────────────────────────────────────────────────────
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état final, ajout
    const p = prenom(), o = choisir(OBJETS().filter(x => x.id !== 'timbre')), [a, b] = tirerSomme(max)
    return pb('ajoutGain', 'ajoutGainQ', { p, o, a, b }, a + b, o, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [a, b] = tirerSomme(max)
    return pb('timbres', 'timbresQ', { p, a, b }, a + b, U().timbre, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'ajoutRetrait', cap: 60, gen(niv, max) {           // état final, retrait
    const [r, b] = tirerSomme(max), a = r + b
    return pb('busRetrait', 'busRetraitQ', { a, b }, r, U().passager, `${a} − ${b} = ${r}`)
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [r, b] = tirerSomme(max), a = r + b
    return pb('livrePages', 'livrePagesQ', { p, a, b }, r, U().page, `${a} − ${b} = ${r}`)
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après un gain)
    const p = prenom(), o = choisir(OBJETS()), [a, b] = tirerSomme(max), c = a + b
    return pb('initialGain', 'initialGainQ', { p, o, b, c }, a, o, `${c} − ${b} = ${a}`)
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après une perte)
    const p = prenom(), [b, c] = tirerSomme(max)
    return pb('initialPerte', 'initialPerteQ', { p, b, c }, b + c, U().bonbon, `${b} + ${c} = ${b + c}`)
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const [b, c] = tirerSomme(max)
    return pb('bibliotheque', 'bibliothequeQ', { b, c }, b + c, U().livre, `${b} + ${c} = ${b + c}`)
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (ajout)
    const [a, b] = tirerSomme(max), c = a + b
    return pb('cour', 'courQ', { a, c }, b, U().enfant, `${c} − ${a} = ${b}`)
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (retrait)
    const p = prenom(), [c, b] = tirerSomme(max), a = b + c
    return pb('tirelire', 'tirelireQ', { p, a, c }, b, U().euro, `${a} − ${c} = ${b}`)
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [a, b] = tirerSomme(max), c = a + b
    return pb('partiePoints', 'partiePointsQ', { p, a, c }, b, U().point, `${c} − ${a} = ${b}`)
  } },

  // ─── Comparaison ──────────────────────────────────────────────────────────
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de plus »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS()), [a, b] = tirerSomme(max)
    return pb('compPlus', 'combienA2', { p1, p2, o, a, b }, a + b, o, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de moins »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS()), [r, b] = tirerSomme(max), a = r + b
    return pb('compMoins', 'combienA2', { p1, p2, o, a, b }, r, o, `${a} − ${b} = ${r}`)
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // écart
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS()), [a, b] = tirerSomme(max), c = a + b
    return pb('compEcart', 'compEcartQ', { p1, p2, o, a, c }, b, o, `${c} − ${a} = ${b}`)
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // comparaison « inversée » (piège)
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS()), [r, b] = tirerSomme(max), a = r + b
    return pb('compInverse', 'combienA2', { p1, p2, o, a, b }, r, o, `${a} − ${b} = ${r}`)
  } },
  { cat: 'comparaison', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return pb('ecoles', 'ecolesQ', { a, b }, a + b, U().eleve, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'comparaison', cap: 1000, min: 1000, gen(niv, max) {
    const r = aleatoire(40, 300), b = aleatoire(20, 400), a = r + b
    return pb('velo', 'veloQ', { a, b }, r, U().euro, `${a} − ${b} = ${r}`)
  } },

  // ─── Parties et tout ──────────────────────────────────────────────────────
  { cat: 'partiesTout', cap: 30, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return pb('classe', 'classeQ', { a, b }, a + b, U().eleve, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'partiesTout', cap: 50, gen(niv, max) {            // partie inconnue
    const [a, b] = tirerSomme(max), c = a + b
    return pb('panier', 'panierQ', { a, c }, b, U().poire, `${c} − ${a} = ${b}`)
  } },
  { cat: 'partiesTout', cap: 100, gen(niv, max) {
    const p = prenom(), o = choisir(OBJETS().filter(x => x.id !== 'timbre')), [a, b] = tirerSomme(max), c = a + b
    return pb('couleurs', 'couleursQ', { p, o, a, c }, b, o, `${c} − ${a} = ${b}`)
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return pb('ferme', 'fermeQ', { a, b }, a + b, U().animal, `${a} + ${b} = ${a + b}`)
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), c = a + b
    return pb('cinema', 'cinemaQ', { a, c }, b, U().enfant, `${c} − ${a} = ${b}`)
  } },

  // ─── Multiplication (tables de 2, 3, 4, 5, 10) ────────────────────────────
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = prenom(), o = choisir(C.t('paquets')), [n, k] = tirerProduit(niv, max)
    return pb('paquetsAchat', 'paquetsAchatQ', { p, o, n, k }, n * k, o, multiplicationDetail(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    return pb('chaises', 'chaisesQ', { n, k }, n * k, U().chaise, multiplicationDetail(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const choses = C.t('chosesAParties')
    const c = choisir(CHOSES_A_PARTIES.filter(x => 2 * x.k <= Math.max(max, 20) && choses[x.id]))
    let n
    do { n = aleatoire(2, 10) } while (n * c.k > Math.max(max, 20))
    const ch = choses[c.id]
    return pb('parties', 'partiesQ', { ch, k: c.k, n }, n * c.k, ch.partie, multiplicationDetail(n, c.k))
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = prenom(), [n, k] = tirerProduit(niv, max)
    return pb('feutres', 'feutresQ', { p, n, k }, n * k, U().euro, multiplicationDetail(n, k))
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    return pb('chocolat', 'chocolatQ', { n, k }, n * k, U().carre, multiplicationDetail(n, k))
  } },

  // ─── Partage équitable / groupements (pas de signe ÷ au CE1) ──────────────
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = prenom(), o = choisir(OBJETS()), [q, k] = tirerProduit(niv, max), t = q * k
    return pb('partageAmis', 'partageAmisQ', { p, o, k, t }, q, o, C.t('partageAmisC', { o, q, k, t }))
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    const fem = Math.random() < 0.5
    return pb('partageGroupes', 'partageGroupesQ', { fem, k, t }, q, U().feutre, C.t('partageGroupesC', { q, k, t }))
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {              // groupement
    const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
    return pb('album', 'albumQ', { p, k, t }, q, U().page, C.t('groupementC', { q, k, t, u: U().page }))
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    return pb('equipes', 'equipesQ', { k, t }, q, U().equipe, C.t('groupementC', { q, k, t, u: U().equipe }))
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
    return pb('livresAchat', 'livresAchatQ', { p, k, t }, q, U().livre, C.t('groupementC', { q, k, t, u: U().livre }))
  } },

  // ─── Deux étapes ──────────────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    // livre de 3 à 25 €, stylo de 1 à 5 €
    const p = prenom(), c = aleatoire(1, 5), b = aleatoire(3, Math.min(25, max - c - 2)), x = b + c
    if (x >= max) return null
    const r = aleatoire(1, Math.min(max - x, 50)), a = r + x
    return pb('achats', 'resteEurosQ', { p, a, b, c }, r, U().euro, `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 60, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    return pb('bus2', 'busMaintenantQ', { a, b, c }, r, U().passager, `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 3) return null
    const d = aleatoire(1, x - 1), r = x - d
    return pb('imagesDon', 'imagesDonQ', { p1, p2, n, k, d }, r, U().image, `${n} × ${k} = ${x} ; ${x} − ${d} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS())
    let a, b
    do { [a, b] = tirerSomme(max) } while (2 * a + b > max)
    const x = a + b, r = a + x
    return pb('total2', 'total2Q', { p1, p2, o, a, b }, r, o, `${a} + ${b} = ${x} ; ${a} + ${x} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    return pb('pommes', 'pommesQ', { a, b, c }, r, U().pomme, `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
  } },

  // ─── Partage avec reste (CE2) ─────────────────────────────────────────────
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const p = prenom(), [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return pb('oeufs', 'oeufsQ', { p, k, t }, q, U().boite, C.t('oeufsC', { q, k, reste }))
  } },
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return pb('sortie', 'sortieQ', { k, t }, q + 1, U().voiture, C.t('sortieC', { q, k, reste }))
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {             // « combien de fois »
    const [q, k] = tirerProduit(niv, max), t = q * k
    return pb('ruban', 'rubanQ', { k, t }, q, U().morceau, C.t('groupementC', { q, k, t, u: U().morceau }))
  } },

  // ─── Multiplication par 10, 100 (CE2) ─────────────────────────────────────
  { cat: 'multiplication', cap: 1000, min: 1000, niveaux: ['ce2'], gen(niv, max) {
    const n = aleatoire(2, 9), k = Math.random() < 0.5 ? 10 : 100
    return pb('feuilles', 'feuillesQ', { n, k }, n * k, U().feuille, `${n} × ${k} = ${n * k}`)
  } },

  // ─── Comparaison multiplicative « fois plus » (CE2) ───────────────────────
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS()), [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    return pb('foisPlus', 'combienA2', { p1, p2, o, a, k }, a * k, o, `${a} × ${k} = ${a * k}`)
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    return pb('manteau', 'manteauQ', { a, k }, a * k, U().euro, `${a} × ${k} = ${a * k}`)
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const p = prenom(), a = aleatoire(7, 10), k = choisir([3, 4])
    const parent = choisir(C.t('parents'))
    return pb('age', 'ageQ', { p, a, k, parent }, a * k, U().an, `${a} × ${k} = ${a * k}`)
  } },

  // ─── Trois étapes (CE2) ───────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const p = prenom(), n = aleatoire(2, 5), k = aleatoire(2, 6), c = aleatoire(3, 9)
    const y = n * k + c
    if (y >= max) return null
    const r = aleatoire(1, Math.min(max - y, 40)), a = y + r
    return pb('achats3', 'resteEurosQ', { p, a, n, k, c }, r, U().euro,
      `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 60, niveaux: ['ce2'], gen(niv, max) {
    const a = aleatoire(10, Math.max(11, max - 25)), b = aleatoire(3, 12), c = aleatoire(2, a + b - 1), d = aleatoire(2, 10)
    const x = a + b, y = x - c, r = y + d
    if (r > max || y < 1) return null
    return pb('bus3', 'busMaintenantQ', { a, b, c, d }, r, U().passager, `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}`)
  } },
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 6) return null
    const b = aleatoire(1, Math.min(9, x - 1)), y = x - b, c = aleatoire(2, 12), r = y + c
    if (r > max) return null
    const fem = Math.random() < 0.5
    return pb('ballons', 'ballonsQ', { fem, n, k, b, c }, r, U().ballon, `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}`)
  } },
]

function genererProbleme(cfg, cat) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const plage = niv.plages[cfg.plage] || Object.values(niv.plages)[1]
  const nivId = NIVEAUX[cfg.niveau] ? cfg.niveau : 'ce1'
  let modeles = MODELES.filter(m => m.cat === cat && (!m.niveaux || m.niveaux.includes(nivId)) && (m.min ?? 0) <= plage.max)
  if (!modeles.length) return null
  // En « grands nombres », on privilégie les contextes où ces nombres sont réalistes
  const grands = modeles.filter(m => m.cap >= plage.max)
  if (grands.length && plage.max > 100 && Math.random() < 0.75) modeles = grands
  for (let essai = 0; essai < 20; essai++) {
    const m = choisir(modeles)
    // la plage de la série, bornée par le réalisme du contexte (pas 900 passagers dans un bus)
    const max = Math.max(10, Math.min(plage.max, m.cap))
    const p = m.gen(niv, max)
    // la question garde la langue de sa génération (unité, correction)
    if (p && p.reponse > 0) return { ...p, cat, cle: p.enonce + p.question, langue: langueContenu.value }
  }
  return null
}

function genererSansRepetition(cfg, nb) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let cats = cfg.categories.filter(c => niv.categories.includes(c))
  if (!cats.length) cats = niv.categories
  // catégories mélangées d'abord : quand il y a moins de problèmes que de catégories,
  // ce ne sont pas toujours les dernières de la liste qui sont oubliées
  const melangees = melanger(cats)
  const ordre = melanger(Array.from({ length: nb }, (_, i) => melangees[i % melangees.length]))
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const p = genererProbleme(cfg, ordre[result.length])
    if (p && !vus.has(p.cle)) { vus.add(p.cle); result.push(p) }
  }
  return result
}

// #endregion generation

// unité d'une réponse, accordée dans la langue de la question : « bille(s) », « bilhenn »
const unite = (q, n) => regles(q.langue).pluriel(n, q.unite)
const avecUnite = (q, n) => regles(q.langue).nombre(n, q.unite)

const config = ref(chargerReglages('problemes_config', {
  niveau: 'ce1', categories: CATEGORIES.map(c => c.id), plage: 'moyens', nbQ: 5,
}))
watch(config, v => sauvegarder('problemes_config', v), { deep: true })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'

const niveauData = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)
const categoriesNiveau = computed(() => CATEGORIES.filter(c => niveauData.value.categories.includes(c.id)))
watch(niveauData, n => {
  const cats = config.value.categories.filter(c => n.categories.includes(c))
  config.value.categories = cats.length ? cats : [...n.categories]
  if (!n.plages[config.value.plage]) config.value.plage = Object.keys(n.plages)[Object.keys(n.plages).length - 1]
}, { immediate: true })

function toggleCategorie(id) {
  const c = config.value.categories
  if (c.includes(id)) {
    if (c.length === 1) return
    config.value.categories = c.filter(x => x !== id)
  } else config.value.categories = [...c, id]
}

const { enLecture, lire, arreter } = useTTS()

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
const dernierOk = ref(false)
const inputEl = ref(null)
let timeout = null

const q = computed(() => questions.value[idx.value])

function lireEnonce() {
  if (enLecture.value) { arreter(); return }
  lire(`${q.value.enonce} ${q.value.question}`)
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
  arreter()
  phase.value = 'config'
}

function afficherQuestion() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  verrou.value = false; dernierOk.value = false
  nextTick(() => inputEl.value?.focus())
}

function valider() {
  if (verrou.value) return
  const val = String(reponse.value).trim()
  if (val === '') return
  const p = q.value
  const ok = +val === p.reponse
  verrou.value = true
  dernierOk.value = ok
  if (ok) {
    inputClass.value = 'ok'
    const bravos = t('bravo')
    feedback.value = bravos[aleatoire(0, bravos.length - 1)]
    feedbackClass.value = 'ok'
    bonnes.value++
    timeout = setTimeout(suivant, 1200)
  } else {
    inputClass.value = 'erreur'
    feedback.value = '❌ ' + t('laBonneReponse', { r: avecUnite(p, p.reponse) })
    feedbackClass.value = 'erreur'
    mauvaises.value++
    // pas d'enchaînement automatique : l'enfant prend le temps de lire la correction
  }
  historique.value.push({ question: p.question, donne: avecUnite(p, +val), attendu: avecUnite(p, p.reponse), calcul: p.calcul, ok })
}

function passer() {
  if (verrou.value) return
  const p = q.value
  mauvaises.value++
  historique.value.push({ question: p.question, donne: t('passe'), attendu: avecUnite(p, p.reponse), calcul: p.calcul, ok: false })
  suivant()
}

function suivant() {
  clearTimeout(timeout)
  arreter()
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

onUnmounted(() => { clearTimeout(timeout); arreter() })

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const qs = genererSansRepetition(config.value, config.value.nbQ)
  const niv = config.value.niveau.toUpperCase()
  const blocs = qs.map((p, i) => `
    <div class="pb">
      <div class="enonce"><span class="num">${i + 1}.</span> ${p.enonce} <b>${p.question}</b></div>
      <div class="calcul">${t('pCalcul')}</div>
      <div class="reponse">${t('pReponse')} <span class="ligne"></span> ${unite(p, p.reponse)}</div>
    </div>`).join('')

  const corrige = `<section class="corrige"><h2>${t('corrige')}</h2>
    <ol class="reponses">${qs.map(p => `<li><b>${p.calcul}</b> → ${avecUnite(p, p.reponse)}</li>`).join('')}</ol></section>`

  return `<!DOCTYPE html><html lang="${langueContenu.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niv}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .infos { font-size: .85rem; color: #666; margin: 0 0 .3rem; }
      .pb { margin: 0 0 1.4rem; page-break-inside: avoid; }
      .enonce { font-size: 1.15rem; line-height: 1.6; }
      .num { font-weight: 700; color: #777; }
      .calcul { border: 1.5px solid #999; border-radius: 6px; height: 4.5rem; margin: .5rem 0; padding: .3rem .5rem; color: #777; font-size: .9rem; }
      .reponse { font-size: 1.05rem; }
      .ligne { display: inline-block; width: 5rem; border-bottom: 1.5px solid #555; }
      .reponses { font-size: 1.1rem; line-height: 2; }
    </style></head><body>
    <h1>${t('titre')} — ${niv}</h1>
    <p class="infos">${t('pNbProblemes', { n: qs.length })}</p>
    ${ligneNomDate(langueContenu.value)}
    ${blocs}
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
.enonce {
  font-size: 1.35rem; line-height: 1.6; background: var(--gris-bg);
  border-left: 5px solid var(--orange); border-radius: 8px; padding: 1rem 1.25rem; margin: .5rem 0 1rem;
}
.enonce p + p { margin-top: .5rem; }
.enonce-question { font-weight: 800; }
.reponse-ligne { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.reponse-input { max-width: 10rem; }
.unite { font-size: 1.5rem; font-weight: 700; }
.calcul-correction {
  text-align: center; font-size: 1.3rem; font-weight: 800; color: var(--bleu); margin: .25rem 0 .5rem;
}
.btn:disabled { opacity: .45; cursor: default; }
@media (max-width: 520px) {
  .enonce { font-size: 1.15rem; }
}
</style>

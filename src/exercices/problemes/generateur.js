// Problèmes — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   problèmes de l'exercice à l'écran, sans répétition
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (les mêmes problèmes)
//   verifier(q, rep)                              rep : { texte } (nombre saisi)
//   bonneReponse(q)                               une réponse juste (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js ; T(cle, params) : textes de l'exercice dans la langue du contenu (textes.js, énoncés et
// données dans src/i18n/<langue>/contenu/problemes.js). L'ordre des tirages est celui de l'ancienne vue.
import DEFINITION from './definition.js'
import { regles } from '../../i18n/regles.js'

// Plus grand nombre des données, par plage (réglage `plage`)
export const PLAGES = { petits: 20, moyens: 100, grands: 1000, tresGrands: 10000 }
// Tables de multiplication utilisées par niveau (programme : tables de 2, 3, 4, 5 et 10 au CE1)
const TABLES = { ce1: [2, 3, 4, 5, 10], ce2: [2, 3, 4, 5, 6, 7, 8, 9, 10] }

// unité d'une réponse, accordée dans la langue du contenu de la question : « bille(s) », « bilhenn »
export const unite = (q, n) => regles(q.langue).pluriel(n, q.unite)
export const avecUnite = (q, n) => regles(q.langue).nombre(n, q.unite)

/** Les modèles de problèmes d'une partie : fermés sur le rng et les textes. */
function creer(rng, T) {
  const choisir = liste => rng.choisir(liste)
  // « Un vélo a 2 roues » : k parties par objet ; noms dans le catalogue de contenu (`chosesAParties`),
  // un objet absent d'une langue n'y est pas proposé (pas de tricycle en breton)
  const CHOSES_A_PARTIES = [
    { id: 'velo', k: 2 }, { id: 'tricycle', k: 3 }, { id: 'voiture', k: 4 },
    { id: 'chien', k: 4 }, { id: 'main', k: 5 }, { id: 'etoile', k: 5 },
  ]

  // Données de la langue du contenu
  const PRENOMS = () => T('prenoms')
  const OBJETS = () => T('objets')
  const U = () => T('unites')
  function deuxPrenoms() { const [a, b] = rng.melanger(PRENOMS()); return [a, b] }
  const prenom = () => choisir(PRENOMS())

  // Deux nombres a, b avec a + b ≤ max, ni trop petits ni triviaux
  function tirerSomme(max) {
    const lo = max <= 20 ? 2 : max <= 100 ? Math.max(3, Math.round(max / 10)) : 40
    const a = rng.entier(lo, max - lo)
    const b = rng.entier(Math.max(2, Math.round(lo / 2)), max - a)
    return [a, b]
  }

  // n × k avec k dans les tables du niveau, produit ≤ max
  function tirerProduit(niv, max) {
    let n, k
    do { n = rng.entier(2, 10); k = choisir(niv.tables) } while (n * k > Math.max(max, 20))
    return [n, k]
  }

  function multiplicationDetail(n, k) {
    const r = n * k
    return n <= 5 ? `${Array(n).fill(k).join(' + ')} = ${r}, ${T('donc')} ${n} × ${k} = ${r}` : `${n} × ${k} = ${r}`
  }

  // Problème : énoncé (clé), question (clé), paramètres des textes, puis réponse, unité et calcul
  function pb(cle, cleQ, params, reponse, unite, calcul) {
    return { enonce: T(cle, params), question: T(cleQ, params), reponse, unite, calcul }
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
    { cat: 'ajoutRetrait', cap: 10000, gen(niv, max) {
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
    { cat: 'ajoutRetrait', cap: 10000, gen(niv, max) {
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
    { cat: 'comparaison', cap: 10000, gen(niv, max) {
      const [a, b] = tirerSomme(max)
      return pb('ecoles', 'ecolesQ', { a, b }, a + b, U().eleve, `${a} + ${b} = ${a + b}`)
    } },
    { cat: 'comparaison', cap: 1000, min: 1000, gen() {
      const r = rng.entier(40, 300), b = rng.entier(20, 400), a = r + b
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
      const p = prenom(), o = choisir(T('paquets')), [n, k] = tirerProduit(niv, max)
      return pb('paquetsAchat', 'paquetsAchatQ', { p, o, n, k }, n * k, o, multiplicationDetail(n, k))
    } },
    { cat: 'multiplication', cap: 1000, gen(niv, max) {
      const [n, k] = tirerProduit(niv, max)
      return pb('chaises', 'chaisesQ', { n, k }, n * k, U().chaise, multiplicationDetail(n, k))
    } },
    { cat: 'multiplication', cap: 1000, gen(niv, max) {
      const choses = T('chosesAParties')
      const c = choisir(CHOSES_A_PARTIES.filter(x => 2 * x.k <= Math.max(max, 20) && choses[x.id]))
      let n
      do { n = rng.entier(2, 10) } while (n * c.k > Math.max(max, 20))
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
      return pb('partageAmis', 'partageAmisQ', { p, o, k, t }, q, o, T('partageAmisC', { o, q, k, t }))
    } },
    { cat: 'partage', cap: 1000, gen(niv, max) {
      const [q, k] = tirerProduit(niv, max), t = q * k
      const fem = rng.vrai(0.5)
      return pb('partageGroupes', 'partageGroupesQ', { fem, k, t }, q, U().feutre, T('partageGroupesC', { q, k, t }))
    } },
    { cat: 'partage', cap: 1000, gen(niv, max) {              // groupement
      const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
      return pb('album', 'albumQ', { p, k, t }, q, U().page, T('groupementC', { q, k, t, u: U().page }))
    } },
    { cat: 'partage', cap: 1000, gen(niv, max) {
      const [q, k] = tirerProduit(niv, max), t = q * k
      return pb('equipes', 'equipesQ', { k, t }, q, U().equipe, T('groupementC', { q, k, t, u: U().equipe }))
    } },
    { cat: 'partage', cap: 1000, gen(niv, max) {
      const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
      return pb('livresAchat', 'livresAchatQ', { p, k, t }, q, U().livre, T('groupementC', { q, k, t, u: U().livre }))
    } },

    // ─── Deux étapes ──────────────────────────────────────────────────────────
    { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
      // livre de 3 à 25 €, stylo de 1 à 5 €
      const p = prenom(), c = rng.entier(1, 5), b = rng.entier(3, Math.min(25, max - c - 2)), x = b + c
      if (x >= max) return null
      const r = rng.entier(1, Math.min(max - x, 50)), a = r + x
      return pb('achats', 'resteEurosQ', { p, a, b, c }, r, U().euro, `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}`)
    } },
    { cat: 'deuxEtapes', cap: 60, gen(niv, max) {
      const [a, b] = tirerSomme(max), x = a + b, c = rng.entier(1, x - 1), r = x - c
      return pb('bus2', 'busMaintenantQ', { a, b, c }, r, U().passager, `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
    } },
    { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
      const [p1, p2] = deuxPrenoms(), [n, k] = tirerProduit(niv, max), x = n * k
      if (x < 3) return null
      const d = rng.entier(1, x - 1), r = x - d
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
      const [a, b] = tirerSomme(max), x = a + b, c = rng.entier(1, x - 1), r = x - c
      return pb('pommes', 'pommesQ', { a, b, c }, r, U().pomme, `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}`)
    } },

    // ─── Partage avec reste (CE2) ─────────────────────────────────────────────
    { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
      const p = prenom(), [q, k] = tirerProduit(niv, max), reste = rng.entier(1, k - 1)
      if (k < 3) return null
      const t = q * k + reste
      if (t > max) return null
      return pb('oeufs', 'oeufsQ', { p, k, t }, q, U().boite, T('oeufsC', { q, k, reste }))
    } },
    { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
      const [q, k] = tirerProduit(niv, max), reste = rng.entier(1, k - 1)
      if (k < 3) return null
      const t = q * k + reste
      if (t > max) return null
      return pb('sortie', 'sortieQ', { k, t }, q + 1, U().voiture, T('sortieC', { q, k, reste }))
    } },
    { cat: 'partage', cap: 1000, gen(niv, max) {             // « combien de fois »
      const [q, k] = tirerProduit(niv, max), t = q * k
      return pb('ruban', 'rubanQ', { k, t }, q, U().morceau, T('groupementC', { q, k, t, u: U().morceau }))
    } },

    // ─── Multiplication par 10, 100 (CE2) ─────────────────────────────────────
    { cat: 'multiplication', cap: 1000, min: 1000, niveaux: ['ce2'], gen() {
      const n = rng.entier(2, 9), k = rng.vrai(0.5) ? 10 : 100
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
    { cat: 'foisPlus', cap: 1000, gen() {
      const p = prenom(), a = rng.entier(7, 10), k = choisir([3, 4])
      const parent = choisir(T('parents'))
      return pb('age', 'ageQ', { p, a, k, parent }, a * k, U().an, `${a} × ${k} = ${a * k}`)
    } },

    // ─── Trois étapes (CE2) ───────────────────────────────────────────────────
    { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
      const p = prenom(), n = rng.entier(2, 5), k = rng.entier(2, 6), c = rng.entier(3, 9)
      const y = n * k + c
      if (y >= max) return null
      const r = rng.entier(1, Math.min(max - y, 40)), a = y + r
      return pb('achats3', 'resteEurosQ', { p, a, n, k, c }, r, U().euro,
        `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}`)
    } },
    { cat: 'deuxEtapes', cap: 60, niveaux: ['ce2'], gen(niv, max) {
      const a = rng.entier(10, Math.max(11, max - 25)), b = rng.entier(3, 12), c = rng.entier(2, a + b - 1), d = rng.entier(2, 10)
      const x = a + b, y = x - c, r = y + d
      if (r > max || y < 1) return null
      return pb('bus3', 'busMaintenantQ', { a, b, c, d }, r, U().passager, `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}`)
    } },
    { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
      const [n, k] = tirerProduit(niv, max), x = n * k
      if (x < 6) return null
      const b = rng.entier(1, Math.min(9, x - 1)), y = x - b, c = rng.entier(2, 12), r = y + c
      if (r > max) return null
      const fem = rng.vrai(0.5)
      return pb('ballons', 'ballonsQ', { fem, n, k, b, c }, r, U().ballon, `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}`)
    } },
  ]


  function genererProbleme(niveau, plageMax, cat) {
    const niv = { tables: TABLES[niveau] }
    let modeles = MODELES.filter(m => m.cat === cat && (!m.niveaux || m.niveaux.includes(niveau)) && (m.min ?? 0) <= plageMax)
    if (!modeles.length) return null
    // En « grands nombres », on privilégie les contextes où ces nombres sont réalistes
    const grands = modeles.filter(m => m.cap >= plageMax)
    if (grands.length && plageMax > 100 && rng.vrai(0.75)) modeles = grands
    for (let essai = 0; essai < 20; essai++) {
      const m = choisir(modeles)
      // la plage de la série, bornée par le réalisme du contexte (pas 900 passagers dans un bus)
      const max = Math.max(10, Math.min(plageMax, m.cap))
      const p = m.gen(niv, max)
      // la question garde la langue de sa génération (unité, correction)
      if (p && p.reponse > 0) return { ...p, cat, cle: p.enonce + p.question, texte: p.question, langue: T('langue') }
    }
    return null
  }
  return genererProbleme
}

export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ }) {
  const genererProbleme = creer(rng, T)
  const offertes = DEFINITION.niveaux[niveau].options.categories
  let cats = reglages.categories.filter(c => offertes.includes(c))
  if (!cats.length) cats = offertes
  const plageMax = PLAGES[reglages.plage] ?? PLAGES.grands
  // catégories mélangées d'abord : quand il y a moins de problèmes que de catégories,
  // ce ne sont pas toujours les dernières de la liste qui sont oubliées
  const melangees = rng.melanger(cats)
  const ordre = rng.melanger(Array.from({ length: nb }, (_, i) => melangees[i % melangees.length]))
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const p = genererProbleme(niveau, plageMax, ordre[result.length])
    if (p && !vus.has(p.cle)) { vus.add(p.cle); result.push(p) }
  }
  return result
}

export const questionsFiche = ({ niveau, reglages, rng, T }) => questions({ niveau, reglages, rng, T })

export const verifier = (q, rep) => {
  const val = String(rep.texte ?? '').trim()
  return val !== '' && +val === q.reponse
}
export const bonneReponse = q => ({ texte: String(q.reponse) })

// Nombres écrits dans l'énoncé et le calcul : au plus le champ numérique du niveau ; produits dans les tables du niveau
export function ecartsAuProgramme(qs, contraintes) {
  const ecarts = []
  for (const q of qs) {
    const nombres = `${q.enonce} ${q.question} ${q.calcul}`.replace(/(\d) (?=\d{3}\b)/g, '$1').match(/\d+/g) ?? []
    const max = Math.max(0, ...nombres.map(Number))
    if (max > contraintes.nombreMax) ecarts.push(`${max} > ${contraintes.nombreMax} (nombreMax) : ${q.question}`)
  }
  return ecarts
}

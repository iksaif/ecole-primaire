import { aleatoire, melanger } from '/Users/corentin.chary/dev/ecole-primaire/src/utils/index.js'
import { enLettresFr, decomposer } from '/Users/corentin.chary/dev/ecole-primaire/src/utils/nombres.js'
// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau. Un modèle peut être réservé à certains niveaux (champ `niveaux`)
// ou à une plage minimale (champ `min`, ex. prix d'un vélo seulement « jusqu'à 1000 »).
const NIVEAUX = {
  ce1: {
    plages: {
      petits: { label: 'Jusqu\'à 20', max: 20 },
      moyens: { label: 'Jusqu\'à 100', max: 100 },
      grands: { label: 'Jusqu\'à 1000', max: 1000 },
    },
    tables: [2, 3, 4, 5, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'],
  },
  ce2: {
    plages: {
      moyens: { label: 'Jusqu\'à 100', max: 100 },
      grands: { label: 'Jusqu\'à 1000', max: 1000 },
    },
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'],
  },
}

const CATEGORIES = [
  { id: 'ajoutRetrait', label: '➕➖ Ajout / retrait' },
  { id: 'comparaison',  label: '⚖️ Comparaison' },
  { id: 'partiesTout',  label: '🧺 Parties et tout' },
  { id: 'multiplication', label: '✖️ Multiplication' },
  { id: 'partage',      label: '🍰 Partage / groupements' },
  { id: 'foisPlus',     label: '🔁 « Fois plus »' },
  { id: 'deuxEtapes',   label: '🪜 Plusieurs étapes' },
]

const PRENOMS = [
  { nom: 'Léo', g: 'm' }, { nom: 'Emma', g: 'f' }, { nom: 'Inès', g: 'f' }, { nom: 'Noah', g: 'm' },
  { nom: 'Jade', g: 'f' }, { nom: 'Adam', g: 'm' }, { nom: 'Lina', g: 'f' }, { nom: 'Hugo', g: 'm' },
  { nom: 'Chloé', g: 'f' }, { nom: 'Yanis', g: 'm' }, { nom: 'Mila', g: 'f' }, { nom: 'Sacha', g: 'm' },
  { nom: 'Zoé', g: 'f' }, { nom: 'Malo', g: 'm' }, { nom: 'Aya', g: 'f' }, { nom: 'Nathan', g: 'm' },
  { nom: 'Louise', g: 'f' }, { nom: 'Gabriel', g: 'm' }, { nom: 'Rose', g: 'f' }, { nom: 'Mohamed', g: 'm' },
  { nom: 'Ambre', g: 'f' }, { nom: 'Timéo', g: 'm' }, { nom: 'Lou', g: 'f' }, { nom: 'Éliott', g: 'm' },
]

// Objets que l'on collectionne / échange
const OBJETS = [
  { s: 'bille', p: 'billes', g: 'f' }, { s: 'carte', p: 'cartes', g: 'f' },
  { s: 'image', p: 'images', g: 'f' }, { s: 'perle', p: 'perles', g: 'f' },
  { s: 'autocollant', p: 'autocollants', g: 'm' }, { s: 'coquillage', p: 'coquillages', g: 'm' },
  { s: 'bonbon', p: 'bonbons', g: 'm' }, { s: 'timbre', p: 'timbres', g: 'm' },
]
const PAQUETS = [
  { s: 'gâteau', p: 'gâteaux', g: 'm' }, { s: 'image', p: 'images', g: 'f' },
  { s: 'carte', p: 'cartes', g: 'f' }, { s: 'biscuit', p: 'biscuits', g: 'm' },
  { s: 'crayon', p: 'crayons', g: 'm' }, { s: 'bonbon', p: 'bonbons', g: 'm' },
]
// « Un vélo a 2 roues »
const CHOSES_A_PARTIES = [
  { s: 'vélo', p: 'vélos', g: 'm', k: 2, partie: { s: 'roue', p: 'roues' } },
  { s: 'tricycle', p: 'tricycles', g: 'm', k: 3, partie: { s: 'roue', p: 'roues' } },
  { s: 'voiture', p: 'voitures', g: 'f', k: 4, partie: { s: 'roue', p: 'roues' } },
  { s: 'chien', p: 'chiens', g: 'm', k: 4, partie: { s: 'patte', p: 'pattes' } },
  { s: 'main', p: 'mains', g: 'f', k: 5, partie: { s: 'doigt', p: 'doigts' } },
  { s: 'étoile de mer', p: 'étoiles de mer', g: 'f', k: 5, partie: { s: 'bras', p: 'bras' } },
]

const U = (s, p) => ({ s, p: p ?? s + 's' })
const EUROS = U('euro')

function choisir(t) { return t[aleatoire(0, t.length - 1)] }
function deuxPrenoms() { const [a, b] = melanger(PRENOMS); return [a, b] }
const commenceParVoyelle = s => /^[aeiouyhéèêàâîïôûœAEIOUYHÉÈÊÀÂÎÔŒ]/.test(s)
const de = mot => commenceParVoyelle(mot) ? `d'${mot}` : `de ${mot}`
const que = p => commenceParVoyelle(p.nom) ? `qu'${p.nom}` : `que ${p.nom}`
const il = p => p.g === 'f' ? 'elle' : 'il'
const Il = p => p.g === 'f' ? 'Elle' : 'Il'
const ils = (p1, p2) => p1.g === 'f' && p2.g === 'f' ? 'elles' : 'ils'
const accord = (n, u) => `${n} ${n >= 2 ? u.p : u.s}`

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
  return n <= 5 ? `${Array(n).fill(k).join(' + ')} = ${r}, donc ${n} × ${k} = ${r}` : `${n} × ${k} = ${r}`
}

// Chaque modèle : cat, cap (plus grand nombre réaliste dans ce contexte), gen(niv, max)
// gen renvoie { enonce, question, reponse, unite, calcul }
const MODELES = [
  // ─── Ajout / retrait ──────────────────────────────────────────────────────
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état final, ajout
    const p = choisir(PRENOMS), o = choisir(OBJETS.filter(x => x.s !== 'timbre')), [a, b] = tirerSomme(max)
    return { enonce: `${p.nom} a ${a} ${o.p}. À la récréation, ${il(p)} en gagne ${b}.`,
      question: `Combien ${de(o.p)} a-t-${il(p)} maintenant ?`, reponse: a + b, unite: o, calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), [a, b] = tirerSomme(max)
    return { enonce: `${p.nom} a ${a} timbres dans sa collection. Pour son anniversaire, on lui offre ${b} timbres.`,
      question: `Combien de timbres a-t-${il(p)} maintenant ?`, reponse: a + b, unite: U('timbre'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'ajoutRetrait', cap: 60, gen(niv, max) {           // état final, retrait
    const [r, b] = tirerSomme(max), a = r + b
    return { enonce: `Dans le bus, il y a ${a} passagers. À l'arrêt, ${b} ${b >= 2 ? 'passagers descendent' : 'passager descend'}.`,
      question: 'Combien de passagers reste-t-il dans le bus ?', reponse: r, unite: U('passager'), calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), [r, b] = tirerSomme(max), a = r + b
    return { enonce: `Un livre a ${a} pages. ${p.nom} en a déjà lu ${b}.`,
      question: 'Combien de pages lui reste-t-il à lire ?', reponse: r, unite: U('page'), calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après un gain)
    const p = choisir(PRENOMS), o = choisir(OBJETS), [a, b] = tirerSomme(max), c = a + b
    return { enonce: `${p.nom} avait des ${o.p}. ${Il(p)} en a gagné ${b}. Maintenant, ${il(p)} en a ${c}.`,
      question: `Combien ${de(o.p)} avait-${il(p)} au début ?`, reponse: a, unite: o, calcul: `${c} − ${b} = ${a}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après une perte)
    const p = choisir(PRENOMS), [b, c] = tirerSomme(max)
    return { enonce: `${p.nom} a mangé ${b} bonbons. Il lui en reste ${c}.`,
      question: `Combien de bonbons avait-${il(p)} au début ?`, reponse: b + c, unite: U('bonbon'), calcul: `${b} + ${c} = ${b + c}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const [b, c] = tirerSomme(max)
    return { enonce: `Ce mois-ci, la bibliothèque de l'école a prêté ${b} livres. Il reste ${c} livres sur les étagères.`,
      question: 'Combien de livres y avait-il sur les étagères au début du mois ?', reponse: b + c, unite: U('livre'), calcul: `${b} + ${c} = ${b + c}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (ajout)
    const [a, b] = tirerSomme(max), c = a + b
    return { enonce: `Au début de la récréation, il y a ${a} enfants dans la cour. D'autres enfants arrivent. Maintenant, il y a ${c} enfants dans la cour.`,
      question: 'Combien d\'enfants sont arrivés ?', reponse: b, unite: U('enfant'), calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (retrait)
    const p = choisir(PRENOMS), [c, b] = tirerSomme(max), a = b + c
    return { enonce: `${p.nom} avait ${a} euros dans sa tirelire. ${Il(p)} a acheté un jeu. Maintenant, il lui reste ${c} euros.`,
      question: 'Combien a coûté le jeu ?', reponse: b, unite: EUROS, calcul: `${a} − ${c} = ${b}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), [a, b] = tirerSomme(max), c = a + b
    return { enonce: `Au début de la partie, ${p.nom} a ${a} points. À la fin de la partie, ${il(p)} a ${c} points.`,
      question: `Combien de points a-t-${il(p)} gagnés pendant la partie ?`, reponse: b, unite: U('point'), calcul: `${c} − ${a} = ${b}` }
  } },

  // ─── Comparaison ──────────────────────────────────────────────────────────
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de plus »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, b] = tirerSomme(max)
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${accord(b, o)} de plus ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: a + b, unite: o, calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de moins »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [r, b] = tirerSomme(max), a = r + b
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${accord(b, o)} de moins ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: r, unite: o, calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // écart
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, b] = tirerSomme(max), c = a + b
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${c}.`,
      question: `Combien ${de(o.p)} ${p2.nom} a-t-${il(p2)} de plus ${que(p1)} ?`, reponse: b, unite: o, calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // comparaison « inversée » (piège)
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [r, b] = tirerSomme(max), a = r + b
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${Il(p1)} a ${accord(b, o)} de plus ${que(p2)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: r, unite: o, calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'comparaison', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return { enonce: `L'école des Tilleuls a ${a} élèves. L'école des Lilas a ${accord(b, U('élève'))} de plus.`,
      question: 'Combien d\'élèves y a-t-il à l\'école des Lilas ?', reponse: a + b, unite: U('élève'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'comparaison', cap: 1000, min: 1000, gen(niv, max) {
    const r = aleatoire(40, 300), b = aleatoire(20, 400), a = r + b
    return { enonce: `Un vélo coûte ${a} euros. Une trottinette coûte ${accord(b, EUROS)} de moins que le vélo.`,
      question: 'Combien coûte la trottinette ?', reponse: r, unite: EUROS, calcul: `${a} − ${b} = ${r}` }
  } },

  // ─── Parties et tout ──────────────────────────────────────────────────────
  { cat: 'partiesTout', cap: 30, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return { enonce: `Dans la classe, il y a ${accord(a, U('fille'))} et ${accord(b, U('garçon'))}.`,
      question: 'Combien d\'élèves y a-t-il dans la classe ?', reponse: a + b, unite: U('élève'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'partiesTout', cap: 50, gen(niv, max) {            // partie inconnue
    const [a, b] = tirerSomme(max), c = a + b
    return { enonce: `Dans un panier, il y a ${c} fruits : des pommes et des poires. Il y a ${accord(a, U('pomme'))}.`,
      question: 'Combien y a-t-il de poires ?', reponse: b, unite: U('poire'), calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'partiesTout', cap: 100, gen(niv, max) {
    const p = choisir(PRENOMS), o = choisir(OBJETS.filter(x => x.s !== 'timbre')), [a, b] = tirerSomme(max), c = a + b
    const bleu = o.g === 'f' ? 'bleues' : 'bleus'
    return { enonce: `${p.nom} a ${c} ${o.p}. Parmi ces ${o.p}, ${a} ${a >= 2 ? 'sont rouges' : 'est rouge'} et les autres sont ${bleu}.`,
      question: `Combien ${de(o.p)} ${bleu} ${p.nom} a-t-${il(p)} ?`, reponse: b, unite: o, calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    return { enonce: `Dans sa ferme, un fermier a ${accord(a, U('poule'))} et ${accord(b, U('canard'))}.`,
      question: 'Combien d\'animaux a-t-il en tout ?', reponse: a + b, unite: U('animal', 'animaux'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), c = a + b
    return { enonce: `Au cinéma, il y a ${c} spectateurs : des adultes et des enfants. Il y a ${accord(a, U('adulte'))}.`,
      question: 'Combien d\'enfants y a-t-il ?', reponse: b, unite: U('enfant'), calcul: `${c} − ${a} = ${b}` }
  } },

  // ─── Multiplication (tables de 2, 3, 4, 5, 10) ────────────────────────────
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), o = choisir(PAQUETS), [n, k] = tirerProduit(niv, max)
    return { enonce: `${p.nom} achète ${n} paquets de ${k} ${o.p}.`,
      question: `Combien ${de(o.p)} a-t-${il(p)} en tout ?`, reponse: n * k, unite: o, calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    return { enonce: `Pour le spectacle, on installe ${n} rangées de ${k} chaises.`,
      question: 'Combien de chaises y a-t-il en tout ?', reponse: n * k, unite: U('chaise'), calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const ch = choisir(CHOSES_A_PARTIES.filter(c => 2 * c.k <= Math.max(max, 20)))
    let n
    do { n = aleatoire(2, 10) } while (n * ch.k > Math.max(max, 20))
    const un = ch.g === 'f' ? 'Une' : 'Un'
    return { enonce: `${un} ${ch.s} a ${ch.k} ${ch.partie.p}.`,
      question: `Combien ${de(ch.partie.p)} ont ${n} ${ch.p} ?`, reponse: n * ch.k, unite: ch.partie, calcul: multiplicationDetail(n, ch.k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), [n, k] = tirerProduit(niv, max)
    return { enonce: `Une boîte de feutres coûte ${k} euros. ${p.nom} achète ${n} boîtes de feutres.`,
      question: `Combien d'euros ${p.nom} doit-${il(p)} payer ?`, reponse: n * k, unite: EUROS, calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    return { enonce: `Une tablette de chocolat a ${n} rangées de ${k} carrés.`,
      question: 'Combien de carrés de chocolat y a-t-il dans la tablette ?', reponse: n * k, unite: U('carré'), calcul: multiplicationDetail(n, k) }
  } },

  // ─── Partage équitable / groupements (pas de signe ÷ au CE1) ──────────────
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), o = choisir(OBJETS), [q, k] = tirerProduit(niv, max), t = q * k
    return { enonce: `${p.nom} a ${t} ${o.p}. ${Il(p)} les partage entre ses ${k} amis. Chaque ami reçoit le même nombre ${de(o.p)}.`,
      question: `Combien ${de(o.p)} reçoit chaque ami ?`, reponse: q, unite: o,
      calcul: `${k} × ${q} = ${t}, donc chaque ami reçoit ${accord(q, o)}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    const maitre = Math.random() < 0.5 ? 'La maîtresse' : 'Le maître'
    return { enonce: `${maitre} distribue ${t} feutres à ${k} groupes. Chaque groupe reçoit le même nombre de feutres.`,
      question: 'Combien de feutres reçoit chaque groupe ?', reponse: q, unite: U('feutre'),
      calcul: `${k} × ${q} = ${t}, donc chaque groupe reçoit ${accord(q, U('feutre'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {              // groupement
    const p = choisir(PRENOMS), [q, k] = tirerProduit(niv, max), t = q * k
    return { enonce: `${p.nom} colle ${t} photos dans un album. ${Il(p)} met ${k} photos sur chaque page.`,
      question: `Combien de pages ${p.nom} remplit-${il(p)} ?`, reponse: q, unite: U('page'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('page'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    return { enonce: `Pour un jeu, ${t} enfants forment des équipes de ${k} enfants.`,
      question: 'Combien d\'équipes y a-t-il ?', reponse: q, unite: U('équipe'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('équipe'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), [q, k] = tirerProduit(niv, max), t = q * k
    return { enonce: `${p.nom} a ${t} euros. Un livre coûte ${k} euros. ${Il(p)} dépense tout son argent en livres.`,
      question: `Combien de livres ${p.nom} achète-t-${il(p)} ?`, reponse: q, unite: U('livre'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('livre'))}` }
  } },

  // ─── Deux étapes ──────────────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    // livre de 3 à 25 €, stylo de 1 à 5 €
    const p = choisir(PRENOMS), c = aleatoire(1, 5), b = aleatoire(3, Math.min(25, max - c - 2)), x = b + c
    if (x >= max) return null
    const r = aleatoire(1, Math.min(max - x, 50)), a = r + x
    return { enonce: `${p.nom} a ${a} euros. ${Il(p)} achète un livre à ${b} ${b >= 2 ? 'euros' : 'euro'} et un stylo à ${c} ${c >= 2 ? 'euros' : 'euro'}.`,
      question: 'Combien d\'euros lui reste-t-il ?', reponse: r, unite: EUROS, calcul: `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 60, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    return { enonce: `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} ${b >= 2 ? 'passagers montent' : 'passager monte'}. Au deuxième arrêt, ${c} ${c >= 2 ? 'passagers descendent' : 'passager descend'}.`,
      question: 'Combien de passagers y a-t-il maintenant dans le bus ?', reponse: r, unite: U('passager'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 3) return null
    const d = aleatoire(1, x - 1), r = x - d
    return { enonce: `${p1.nom} achète ${n} paquets de ${k} images. ${Il(p1)} en donne ${d} à ${p2.nom}.`,
      question: `Combien d'images reste-t-il à ${p1.nom} ?`, reponse: r, unite: U('image'),
      calcul: `${n} × ${k} = ${x} ; ${x} − ${d} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS)
    let a, b
    do { [a, b] = tirerSomme(max) } while (2 * a + b > max)
    const x = a + b, r = a + x, eux = ils(p1, p2) === 'elles' ? 'elles' : 'eux'
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${b} de plus ${que(p1)}.`,
      question: `Combien ${de(o.p)} ont-${ils(p1, p2)} à ${eux} deux ?`, reponse: r, unite: o,
      calcul: `${a} + ${b} = ${x} ; ${a} + ${x} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    return { enonce: `Un fermier ramasse ${a} pommes lundi et ${b} pommes mardi. Mercredi, il en vend ${c}.`,
      question: 'Combien de pommes lui reste-t-il ?', reponse: r, unite: U('pomme'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
  } },

  // ─── Partage avec reste (CE2) ─────────────────────────────────────────────
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const p = choisir(PRENOMS), [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return { enonce: `${p.nom} a ${t} œufs. ${Il(p)} les range dans des boîtes de ${k} œufs.`,
      question: `Combien de boîtes ${p.nom} peut-${il(p)} remplir complètement ?`, reponse: q, unite: U('boîte'),
      calcul: `${q} × ${k} = ${q * k} ; il reste ${t - q * k} œuf${reste > 1 ? 's' : ''}, pas assez pour une boîte de plus` }
  } },
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    return { enonce: `${t} enfants partent en sortie. Chaque voiture peut transporter ${k} enfants.`,
      question: 'Combien de voitures faut-il pour emmener tous les enfants ?', reponse: q + 1, unite: U('voiture'),
      calcul: `${q} × ${k} = ${q * k} ; il reste ${reste} enfant${reste > 1 ? 's' : ''}, il faut une voiture de plus : ${q} + 1 = ${q + 1}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {             // « combien de fois »
    const [q, k] = tirerProduit(niv, max), t = q * k
    return { enonce: `Un ruban mesure ${t} cm. On le coupe en morceaux de ${k} cm.`,
      question: 'Combien de morceaux obtient-on ?', reponse: q, unite: U('morceau', 'morceaux'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('morceau', 'morceaux'))}` }
  } },

  // ─── Multiplication par 10, 100 (CE2) ─────────────────────────────────────
  { cat: 'multiplication', cap: 1000, min: 1000, niveaux: ['ce2'], gen(niv, max) {
    const n = aleatoire(2, 9), k = Math.random() < 0.5 ? 10 : 100
    return { enonce: `Un paquet contient ${k} feuilles.`,
      question: `Combien de feuilles y a-t-il dans ${n} paquets ?`, reponse: n * k, unite: U('feuille'), calcul: `${n} × ${k} = ${n * k}` }
  } },

  // ─── Comparaison multiplicative « fois plus » (CE2) ───────────────────────
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${k} fois plus ${de(o.p)} ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: a * k, unite: o, calcul: `${a} × ${k} = ${a * k}` }
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    return { enonce: `Un tee-shirt coûte ${a} euros. Un manteau coûte ${k} fois plus cher que le tee-shirt.`,
      question: 'Combien coûte le manteau ?', reponse: a * k, unite: EUROS, calcul: `${a} × ${k} = ${a * k}` }
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const p = choisir(PRENOMS), a = aleatoire(7, 10), k = choisir([3, 4])
    const parent = choisir([
      { sujet: 'Sa maman', nom: 'la maman', e: 'e' }, { sujet: 'Son papa', nom: 'le papa', e: '' },
      { sujet: 'Sa tante', nom: 'la tante', e: 'e' }, { sujet: 'Son oncle', nom: "l'oncle", e: '' },
    ])
    return { enonce: `${p.nom} a ${a} ans. ${parent.sujet} est ${k} fois plus âgé${parent.e} ${p.g === 'f' ? "qu'elle" : 'que lui'}.`,
      question: `Quel âge a ${parent.nom} ${de(p.nom)} ?`,
      reponse: a * k, unite: U('an'), calcul: `${a} × ${k} = ${a * k}` }
  } },

  // ─── Trois étapes (CE2) ───────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const p = choisir(PRENOMS), n = aleatoire(2, 5), k = aleatoire(2, 6), c = aleatoire(3, 9)
    const y = n * k + c
    if (y >= max) return null
    const r = aleatoire(1, Math.min(max - y, 40)), a = y + r
    return { enonce: `${p.nom} a ${a} euros. ${Il(p)} achète ${n} cahiers à ${k} euros chacun et une trousse à ${c} euros.`,
      question: 'Combien d\'euros lui reste-t-il ?', reponse: r, unite: EUROS,
      calcul: `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 60, niveaux: ['ce2'], gen(niv, max) {
    const a = aleatoire(10, Math.max(11, max - 25)), b = aleatoire(3, 12), c = aleatoire(2, a + b - 1), d = aleatoire(2, 10)
    const x = a + b, y = x - c, r = y + d
    if (r > max || y < 1) return null
    return { enonce: `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} passagers montent. Au deuxième arrêt, ${accord(c, U('passager'))} ${c >= 2 ? 'descendent' : 'descend'}. Au troisième arrêt, ${d} passagers montent.`,
      question: 'Combien de passagers y a-t-il maintenant dans le bus ?', reponse: r, unite: U('passager'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 6) return null
    const b = aleatoire(1, Math.min(9, x - 1)), y = x - b, c = aleatoire(2, 12), r = y + c
    if (r > max) return null
    const maitre = Math.random() < 0.5 ? 'La maîtresse' : 'Le maître'
    return { enonce: `Pour la fête, ${maitre.toLowerCase()} achète ${n} paquets de ${k} ballons. ${accord(b, U('ballon'))} ${b >= 2 ? 'éclatent' : 'éclate'}. Ensuite, ${maitre.startsWith('La') ? 'elle' : 'il'} en achète ${c} autres.`,
      question: 'Combien de ballons y a-t-il maintenant ?', reponse: r, unite: U('ballon'),
      calcul: `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}` }
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
    if (p && p.reponse > 0) return { ...p, cat, cle: p.enonce + p.question }
  }
  return null
}

function genererSansRepetition(cfg, nb) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let cats = cfg.categories.filter(c => niv.categories.includes(c))
  if (!cats.length) cats = niv.categories
  const ordre = melanger(Array.from({ length: nb }, (_, i) => cats[i % cats.length]))
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
export { NIVEAUX, CATEGORIES, MODELES, genererSansRepetition, genererProbleme }
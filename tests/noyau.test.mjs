// La couche LOGIQUE du noyau, sans Chrome : réglages (chargement, changement de niveau, réglages corrompus), boucle de jeu
// (bonne et mauvaise réponse, partie vide), hasard, graine des fiches. Les composables Vue (useReglages, useJeu) tournent dans
// node avec un localStorage factice : ce qu'ils font de la logique est donc testé ici, ce qu'ils affichent dans
// tests/jeu-dev.test.mjs (Chrome). Chaque vérification a été confrontée à une mutation (voir tests/README ou le rapport du plan 11) :
// verifier toujours vrai, reglagesDuNiveau qui n'écarte plus les options invalides, reglagesApresNiveau qui garde tout.
//   node tests/noyau.test.mjs
import { verifier, nbEchecs } from './outils.mjs'

// useJeu s'accroche à un composant (onUnmounted) : hors composant, Vue le signale ; ici c'est voulu
const avertir = console.warn
console.warn = (...a) => { if (!String(a[0]).includes('onUnmounted')) avertir(...a) }

// localStorage factice, posé AVANT les imports qui le lisent à leur chargement (langues/etat.ts)
const stockage = new Map()
globalThis.localStorage = {
  getItem: k => (stockage.has(k) ? stockage.get(k) : null), setItem: (k, v) => { stockage.set(k, String(v)) },
  removeItem: k => { stockage.delete(k) }, clear: () => stockage.clear(),
}
const memorise = (cle, valeur) => stockage.set(`ep_${cle}`, typeof valeur === 'string' && valeur.startsWith('{') ? valeur : JSON.stringify(valeur))

const { definir, choix, cases } = await import('../src/noyau/definir.ts')
const { K, D } = await import('../src/noyau/ids.ts')
const { reglagesDuNiveau, reglagesApresNiveau, reglagesDeTousNiveaux, toutAuProgramme, jeuxDeReglages, lireVerdict } = await import('../src/noyau/reglages.ts')
const { useReglages } = await import('../src/noyau/useReglages.ts')
const { useJeu, cleFinDe } = await import('../src/noyau/useJeu.ts')
const { lireGraine } = await import('../src/noyau/useGraine.ts')
const { creerRng } = await import('../src/utils/hasard.ts')
const { default: exemple } = await import('../src/exercices/exemple/definition.ts')
const generateurExemple = await import('../src/exercices/exemple/generateur.ts')
const generateurCorpus = await import('../src/exercices/exemple-corpus/generateur.ts')
const { default: corpus } = await import('../src/exercices/exemple-corpus/definition.ts')
const { traducteur } = await import('../src/langues/catalogue.ts')
const { CONTENU } = await import('../src/exercices/exemple/textes.ts')

const T = traducteur(CONTENU, 'fr')
const json = x => JSON.stringify(x)

// Un exercice à réglages propres à un niveau NON par défaut (cp par défaut, `extra` n'existe qu'au CE2)
const base = { id: 'essai', route: '/dev/essai', domaine: D.exemple, competences: [K.exempleCompter, K.exempleRegle] }
const essai = definir({
  ...base,
  reglages: { nbQ: choix([5, 10], { defaut: 10 }) },
  niveaux: {
    cp: { reglages: { sens: cases(['monte', 'descend']) } },
    ce2: { reglages: { sens: cases(['monte', 'descend'], { defaut: ['monte'] }), extra: choix(['p', 'q', 'r'], { defaut: 'q' }), fixe: 3 } },
  },
})

console.log('Réglages : chargement (B2)')
verifier(json(Object.keys(reglagesDeTousNiveaux(essai)).sort()) === '["extra","fixe","nbQ","niveau","sens"]', 'les clés de tous les niveaux sont lues')
stockage.clear(); memorise('essai_config', { niveau: 'ce2', extra: 'r', nbQ: 5 })
let c = useReglages(essai).config.value
verifier(c.niveau === 'ce2' && c.extra === 'r' && c.nbQ === 5, 'réglage propre à un niveau non par défaut : gardé au rechargement (extra = r)')
stockage.clear(); memorise('essai_config', { niveau: 'cp', extra: 'r' })
c = useReglages(essai).config.value
verifier(!('extra' in c) && c.niveau === 'cp', 'une clé d\'un autre niveau n\'est pas dans la config du niveau lu')
stockage.clear()
c = useReglages(essai).config.value
verifier(c.niveau === 'cp' && c.nbQ === 10 && json(c.sens) === '["monte","descend"]', 'rien de mémorisé : les défauts du niveau par défaut')
// sauvegarde : la config est réécrite sous la clé du noyau
const r = useReglages(essai)
r.config.value.nbQ = 5
await Promise.resolve(); await Promise.resolve()
verifier(JSON.parse(stockage.get('ep_essai_config')).nbQ === 5, 'une modification est mémorisée (ep_essai_config)')

console.log('Réglages : valeurs invalides (reglagesDuNiveau)')
// (7 est un nombre de questions libre valide, de 1 à 50 : NB_LIBRE ; 77 ne l'est pas)
verifier(reglagesDuNiveau(exemple, { niveau: 'ce1', nbQ: 77 }).nbQ === 10, 'une valeur non proposée (choix unique) reprend le défaut')
verifier(json(reglagesDuNiveau(exemple, { niveau: 'ce1', pas: [7, 5] }).pas) === '[5]', 'une valeur non proposée est retirée d\'une liste')
verifier(json(reglagesDuNiveau(exemple, { niveau: 'ce1', pas: [7] }).pas) === '[2,5,10,100]', 'une liste vidée reprend le défaut')
verifier(reglagesDuNiveau(exemple, { niveau: 'cm2' }).niveau === 'cp', 'un niveau inconnu : le niveau par défaut')
verifier(reglagesDuNiveau(exemple, { niveau: 'ce1', typo: 1 }).typo === undefined, 'une clé inconnue est retirée')

console.log('Réglages : réglages mémorisés corrompus')
for (const [nom, brut] of [['pas du JSON', '{pas du json'], ['un nombre', '42'], ['null', 'null'], ['un tableau', '[1,2]'], ['mauvais types', '{"niveau":3,"nbQ":"dix","pas":"x","exercices":null}']]) {
  stockage.clear(); stockage.set('ep_exemple_config', brut)
  let ok = true, cfg
  try { cfg = useReglages(exemple).config.value } catch { ok = false }
  verifier(ok && cfg.niveau === 'cp' && cfg.nbQ === 10 && Array.isArray(cfg.pas) && cfg.pas.length > 0, `${nom} : la config est réparée (défauts)`)
}

console.log('Changement de niveau (C5)')
const apres = reglagesApresNiveau(essai, { niveau: 'ce2', extra: 'r', nbQ: 5, sens: ['descend'], fixe: 3 }, 'cp')
verifier(!('extra' in apres) && !('fixe' in apres), 'une clé absente du nouveau niveau ne reste pas')
verifier(apres.nbQ === 5, 'un réglage commun (nbQ) est gardé')
verifier(json(apres.sens) === '["monte","descend"]', 'un choix multiple reprend les défauts du nouveau niveau')
const hors = reglagesApresNiveau(exemple, { niveau: 'cp', pas: [1, 5, 100], sens: ['monte', 'descend'], exercices: ['complete', 'regle'], nbQ: 15 }, 'ce1')
verifier(json(hors.pas) === '[2,5,10,100]' && json(hors.sens) === '["monte","descend"]', 'bonus et hors programme du CP ne passent pas au CE1 (défauts du CE1)')
verifier(hors.nbQ === 15 && hors.niveau === 'ce1', 'nbQ gardé, niveau changé')
const choixUnique = definir({ ...base, niveaux: { cp: { reglages: { mode: choix(['a', 'b'], { bonus: ['z'] }) } }, ce1: { reglages: { mode: choix(['a', 'b', 'c']) } } } })
verifier(reglagesApresNiveau(choixUnique, { niveau: 'ce1', mode: 'c' }, 'cp').mode === 'a', 'choix unique non proposé au nouveau niveau : défaut')
verifier(reglagesApresNiveau(choixUnique, { niveau: 'cp', mode: 'z' }, 'ce1').mode === 'a', 'bonus (z) jamais reporté d\'un niveau à l\'autre')
verifier(reglagesApresNiveau(choixUnique, { niveau: 'cp', mode: 'b' }, 'ce1').mode === 'b', 'choix unique valable aux deux niveaux : gardé')
let leve = false
try { reglagesApresNiveau(essai, {}, 'cm2') } catch (e) { leve = /cm2/.test(e.message) }
verifier(leve, 'un niveau absent de l\'exercice lève une erreur claire (pas d\'ignorance silencieuse)')

console.log('Jeux de réglages et programme')
for (const n of Object.keys(exemple.niveaux)) {
  const jeux = jeuxDeReglages(exemple, n)
  verifier(Object.keys(jeux).includes('defauts') && Object.keys(jeux).includes('tout'), `${n} : jeux « defauts » et « tout »`)
}
verifier(!toutAuProgramme(exemple, 'cp').pas.includes(5) && !toutAuProgramme(exemple, 'cp').pas.includes(100), 'tout au programme : ni bonus (5) ni hors programme (100)')

console.log('Réponses : juste et fausse (verifier)')
for (const [nom, g, def] of [['exemple', generateurExemple, exemple], ['exemple-corpus', generateurCorpus, corpus]]) {
  const T2 = nom === 'exemple' ? T : traducteur(CONTENU, 'fr')
  for (const niveau of Object.keys(def.niveaux)) {
    const reglages = reglagesDuNiveau(def, { niveau })
    const qs = g.questions({ niveau, reglages, rng: creerRng(7), T: T2, nb: 12 })
    const bonnes = qs.every(q => lireVerdict(g.verifier(q, g.bonneReponse(q))).ok)
    const fausses = qs.every(q => !lireVerdict(g.verifier(q, g.mauvaiseReponse(q))).ok)
    verifier(bonnes, `${nom} ${niveau} : la bonne réponse est acceptée`)
    verifier(fausses, `${nom} ${niveau} : la mauvaise réponse est refusée`)
  }
}
verifier(lireVerdict(true).ok && !lireVerdict(false).ok && lireVerdict({ ok: false, nuance: 'x' }).nuance === 'x' && !lireVerdict(undefined).ok, 'lireVerdict : booléen, { ok, nuance }, rien')

console.log('Boucle de jeu (useJeu)')
const jeuDe = (options = {}) => {
  const qs = generateurExemple.questions({ niveau: 'ce1', reglages: reglagesDuNiveau(exemple, { niveau: 'ce1' }), rng: creerRng(3), T, nb: 4 })
  return useJeu({ generer: () => qs, verifier: generateurExemple.verifier, delai: null, ...options })
}
let jeu = jeuDe()
jeu.demarrer()
verifier(jeu.phase.value === 'jeu' && jeu.questions.value.length === 4 && jeu.index.value === 0, 'demarrer : phase jeu, 4 questions')
let q = jeu.q.value
verifier(jeu.repondre(generateurExemple.bonneReponse(q)) === true && jeu.bonnes.value === 1 && jeu.mauvaises.value === 0 && jeu.retour.value.ok, 'bonne réponse : compte une bonne, retour ok')
verifier(jeu.repondre(generateurExemple.bonneReponse(q)) === false && jeu.bonnes.value === 1, 'une question déjà répondue ne compte pas deux fois')
jeu.suivante()
q = jeu.q.value
verifier(jeu.repondre(generateurExemple.mauvaiseReponse(q)) === false && jeu.mauvaises.value === 1 && jeu.bonnes.value === 1 && !jeu.retour.value.ok && jeu.etat.value === 'erreur', 'mauvaise réponse : compte une mauvaise, état « erreur »')
jeu.suivante()
jeu.passer()
verifier(jeu.mauvaises.value === 2 && jeu.historique.value.at(-1).rep === null, 'passer : compte une mauvaise, réponse null dans l\'historique')
jeu.suivante()
verifier(jeu.phase.value === 'jeu', 'pas de résultats avant la dernière question')
jeu.repondre(generateurExemple.bonneReponse(jeu.q.value))
jeu.suivante()
verifier(jeu.phase.value === 'resultats' && jeu.historique.value.length === 4 && jeu.bonnes.value === 2, 'après la dernière question : résultats')
verifier(cleFinDe(1, 4) === 'resultat0' && cleFinDe(4, 4) === 'resultat100' && cleFinDe(3, 4) === 'resultat60' && cleFinDe(0, 0) === 'resultat0', 'cleFinDe : paliers du message de fin')
// la nuance : presque juste = ni ok, mais état « presque »
jeu = jeuDe({ messageNuance: () => 'presque' })
jeu.demarrer()
q = jeu.q.value
if (q.type === 'complete') {
  jeu.repondre({ nombre: q.attendu + q.pas })
  verifier(!jeu.retour.value.ok && jeu.retour.value.nuance === 'un-pas' && jeu.etat.value === 'presque' && jeu.retour.value.message === 'presque', 'nuance : pas ok, état « presque », message de la nuance')
}
verifier(jeu.recommencer() === undefined && jeu.phase.value === 'jeu' && jeu.bonnes.value === 0 && jeu.historique.value.length === 0, 'recommencer : partie remise à zéro')
jeu.quitter()
verifier(jeu.phase.value === 'config', 'quitter : retour aux réglages')

console.log('Exercice « fiche seule » (jeu: false : écriture, calcul en mode fiche)')
// pas de questions ni de verifier ; des niveaux, un texte libre, une liste de mots, un format figé, des choix : le même modèle
const ecriture = definir({
  ...base, id: 'ecriture-essai', route: '/dev/ecriture-essai', jeu: false,
  reglages: { texte: '', mots: ['papa', 'maman'], format: 'A4-portrait', interligne: choix(['2', '3', '4']) },
  niveaux: { cp: {}, ce1: { reglages: { interligne: choix(['2', '3']) } } },
})
verifier(ecriture.jeu === false && exemple.jeu === true, 'definir : jeu: false (fiche seule), vrai par défaut')
const re = reglagesDuNiveau(ecriture, { niveau: 'ce1', texte: 'Bonjour', mots: ['a', 'b', 'c'], interligne: '4', format: 'A3' })
verifier(re.texte === 'Bonjour' && json(re.mots) === '["a","b","c"]', 'texte libre et liste de mots : gardés tels quels')
verifier(re.interligne === '2', 'un choix de la fiche reste validé par les options du niveau')
verifier(useReglages(ecriture).config.value.niveau === 'cp', 'useReglages marche sans jeu')
const { aUnJeu } = await import('../src/noyau/reglages.ts')
verifier(!aUnJeu(ecriture) && aUnJeu(exemple) && aUnJeu({}), 'aUnJeu : faux seulement pour jeu: false (l\'ancien format n\'a pas le champ : vrai)')
const generateurFiche = { questionsFiche: ({ rng }) => ({ lignes: rng.entier(5, 9) }), ecartsAuProgramme: () => [] }
verifier(!('questions' in generateurFiche) && generateurFiche.questionsFiche({ rng: creerRng(2) }).lignes >= 5, 'un générateur de fiche seule n\'a que questionsFiche')

console.log('Partie vide (I1) et hasard')
const vide = useJeu({ generer: () => [], verifier: () => true, delai: null })
let message = ''
try { vide.demarrer() } catch (e) { message = e.message }
verifier(/aucune question/.test(message) && vide.phase.value === 'config', 'generer rend [] : erreur claire, la page reste sur les réglages (pas d\'écran blanc)')
let choisirVide = ''
try { creerRng(1).choisir([]) } catch (e) { choisirVide = e.message }
verifier(/liste vide/.test(choisirVide), 'rng.choisir([]) lève une erreur claire')
verifier(creerRng(5).choisir(['x']) === 'x', 'rng.choisir d\'une liste d\'un élément')
let sansValeur = ''
try { generateurExemple.questions({ niveau: 'ce1', reglages: { ...reglagesDuNiveau(exemple, { niveau: 'ce1' }), pas: [] }, rng: creerRng(1), T, nb: 3 }) } catch (e) { sansValeur = e.message }
verifier(/liste vide/.test(sansValeur), 'un générateur à qui l\'on retire toutes les valeurs d\'un réglage échoue clairement')

console.log('Graine des fiches (I2)')
verifier(lireGraine('12') === 12 && lireGraine(['7', '8']) === 7 && lireGraine(12) === 12, 'lireGraine : texte, liste, nombre')
verifier(lireGraine('0') === null && lireGraine('-3') === null && lireGraine('1.5') === null && lireGraine('abc') === null && lireGraine('') === null && lireGraine(undefined) === null, 'lireGraine : refuse 0, négatif, décimal, texte, vide, absent')
const tirer = graine => generateurExemple.questionsFiche({ niveau: 'ce1', reglages: reglagesDuNiveau(exemple, { niveau: 'ce1' }), rng: creerRng(graine), T })
verifier(json(tirer(9)) === json(tirer(9)), 'même graine et mêmes réglages : même tirage (fonction de la graine, pas un flux)')
verifier(json(tirer(9)) !== json(tirer(10)), 'une autre graine : un autre tirage')

process.exit(nbEchecs() ? 1 : 0)

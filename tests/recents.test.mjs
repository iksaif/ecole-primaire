// « Reprendre » (node, sans Chrome) : liste des derniers exercices ouverts, ancienneté, adresses du registre ; puis les fonctions
// pures des pages (pli des domaines, matières, présentation des ressources).
import { LIMITE_RECENTS, ajouterRecent, anciennete, idsParRoute, lireRecents, retenirExistants } from '../src/ressources/recents.ts'
import { avecPli, estOuvert, lirePlis } from '../src/ressources/composants/pli.ts'
import { cyclesDuDomaine, genreDe, lienImprimer, majuscule, nomDomaine } from '../src/ressources/composants/presentation.ts'
import { MATIERES_PAGE, cheminFiches, cheminMatiere, matiereDeLaRoute } from '../src/pages/matieres.ts'
import { REGIONALES } from '../src/langues/registre.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Récents : ajout, déduplication, limite')
let l = ajouterRecent([], 'exercice:a', 1)
l = ajouterRecent(l, 'exercice:b', 2)
verifier(l.map(r => r.id).join() === 'exercice:b,exercice:a', 'le plus récent en tête')
l = ajouterRecent(l, 'exercice:a', 3)
verifier(l.map(r => r.id).join() === 'exercice:a,exercice:b' && l[0].ouvert === 3, 'rouvrir un exercice le remonte, sans doublon, avec la nouvelle date')
let longue = []
for (let i = 0; i < LIMITE_RECENTS + 4; i++) longue = ajouterRecent(longue, `exercice:${i}`, i)
verifier(longue.length === LIMITE_RECENTS && longue[0].id === `exercice:${LIMITE_RECENTS + 3}`, 'la liste est bornée, les plus anciens tombent')
verifier(ajouterRecent(longue, 'x', 1, 2).length === 2, 'limite explicite')
const avant = [{ id: 'exercice:a', ouvert: 1 }]
ajouterRecent(avant, 'exercice:b', 2)
verifier(avant.length === 1, 'la liste d’entrée n’est pas modifiée')

console.log('Récents : lecture du réglage, exercices disparus')
verifier(lireRecents(null).length === 0 && lireRecents('x').length === 0 && lireRecents({}).length === 0, 'réglage absent ou corrompu : liste vide')
const lus = lireRecents([{ id: 'exercice:a', ouvert: 5 }, { id: 3, ouvert: 1 }, { id: '', ouvert: 1 }, { id: 'b', ouvert: 'hier' }, null, { id: 'c', ouvert: NaN }, 7])
verifier(lus.length === 1 && lus[0].id === 'exercice:a', 'les entrées invalides sont écartées')
verifier(lireRecents(longue.concat(longue)).length === LIMITE_RECENTS, 'une liste trop longue est bornée à la lecture')
const existants = new Set(['exercice:a'])
verifier(retenirExistants([{ id: 'exercice:a', ouvert: 1 }, { id: 'exercice:disparu', ouvert: 2 }], id => existants.has(id)).map(r => r.id).join() === 'exercice:a', 'un exercice qui n’existe plus est ignoré')

console.log('Récents : ancienneté')
const midi = (j, h = 12) => new Date(2026, 9, j, h).getTime()
verifier(anciennete(midi(6, 8), midi(6, 20)).cle === 'aujourdhui', 'même jour : aujourd’hui')
verifier(anciennete(midi(5, 23), midi(6, 1)).cle === 'hier', 'la veille, même à une heure de distance : hier (jours calendaires)')
const trois = anciennete(midi(3), midi(6))
verifier(trois.cle === 'jours' && trois.n === 3, 'il y a 3 jours')
verifier(anciennete(midi(7), midi(6)).cle === 'aujourdhui', 'une date future (horloge réglée) n’est pas négative')

console.log('Récents : adresse → exercice du registre')
const ids = idsParRoute([{ definition: { id: 'heure', route: '/maths/heure' } }, { definition: { id: 'exemple', route: '/dev/exemple' }, exemple: true }])
verifier(ids.get('/maths/heure') === 'exercice:heure' && !ids.has('/dev/exemple'), 'les exemples ne sont pas mémorisés')

console.log('Pli des domaines')
verifier(Object.keys(lirePlis(null)).length === 0 && Object.keys(lirePlis([1])).length === 0 && Object.keys(lirePlis('x')).length === 0, 'état absent ou corrompu : vide')
verifier(JSON.stringify(lirePlis({ lecture: true, oral: 'oui', histoire: false })) === '{"lecture":true,"histoire":false}', 'seuls les booléens sont gardés')
verifier(estOuvert('lecture', true, {}) === false && estOuvert('lecture', false, {}) === true, 'sans choix : replié quand il n’y a rien pour les classes')
verifier(estOuvert('lecture', true, { lecture: true }) === true && estOuvert('lecture', false, { lecture: false }) === false, 'le choix du lecteur l’emporte')
verifier(estOuvert('oral', true, avecPli({ lecture: true }, 'oral', true)) === true && avecPli({}, 'oral', false).oral === false, 'avecPli écrit sans modifier')

console.log('Matières et présentation')
verifier(MATIERES_PAGE.join() === 'maths,francais,monde', 'matières à page /<matière>')
verifier(matiereDeLaRoute('/maths') === 'maths' && matiereDeLaRoute('/monde') === 'monde' && matiereDeLaRoute('/brezhoneg') === null && matiereDeLaRoute('/maths/fiches') === null, 'matière lue de la route')
verifier(cheminMatiere('francais') === '/francais' && cheminFiches('monde') === '/monde/fiches', 'adresses de la matière et de ses fiches prêtes')
verifier(majuscule('brezhoneg') === 'Brezhoneg', 'majuscule')
verifier(nomDomaine('nombres-calcul', 'fr') === 'Nombres et calcul' && nomDomaine('nombres-calcul', REGIONALES[0]) !== '' , 'nom de domaine (catalogue de la langue)')
verifier(cyclesDuDomaine('nombres-calcul', ['ce1']).join() === '2' && cyclesDuDomaine('nombres-calcul', []).length >= 3, 'cycles du domaine pour les classes choisies')
const base = { badges: { jeu: true, imprimable: true }, route: '/maths/heure' }
verifier(genreDe({ ...base, type: 'exercice' }) === 'exercice' && genreDe({ ...base, type: 'exercice', badges: { jeu: false, imprimable: true } }) === 'generateur' && genreDe({ ...base, type: 'affiche' }) === 'affiche' && genreDe({ ...base, type: 'fiche' }) === 'fiche', 'genre : exercice, générateur, affiche, fiche')
verifier(lienImprimer({ ...base, type: 'exercice' })?.query?.mode === 'imprimer' && lienImprimer({ ...base, type: 'affiche' }) === null && lienImprimer({ ...base, type: 'exercice', badges: { jeu: true, imprimable: false } }) === null, 'adresse « Imprimer » : onglet d’impression d’un exercice seulement')

process.exit(nbEchecs() ? 1 : 0)

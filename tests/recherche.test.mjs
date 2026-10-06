// Index et moteur de recherche (node, sans Chrome) : normalisation, accents, breton, classes, groupes, classement.
import { construireIndexRecherche, chercher, normaliser } from '../src/recherche/index.ts'
import { ressourcesCompetences } from '../src/ressources/catalogue.ts'
import { catalogueDeTest } from './donnees-ressources.mjs'
import { pagesDuSite } from '../src/recherche/pages.ts'
import { estZoneDeSaisie, ouvreLaRecherche, deplacer } from '../src/recherche/clavier.ts'
import { aplatir, groupesAffiches, LIGNES_PAR_GROUPE } from '../src/recherche/resultats.ts'
import { decouper } from '../src/recherche/surlignage.ts'
import { verifier, nbEchecs } from './outils.mjs'

const page = (id, titre, extra = {}) => ({ id: `page:${id}`, type: 'page', titre: { texte: titre }, description: null, emoji: '📄', classes: [], competences: [], langues: ['fr'], route: `/${id}`, exemple: false, ...extra })
const fiche = (slug, titre, classes, description = null) => ({ id: `fiche:${slug}`, type: 'fiche', slug, parent: null, titre: { texte: { fr: titre } }, description: description && { texte: { fr: description } }, emoji: '📄', matiere: 'maths', domaine: 'nombres-calcul', badges: { jeu: false, imprimable: true }, usage: 'sentrainer', classes, competences: [], langues: ['fr'], route: `/telechargements/${slug}/`, exemple: false })
const idsDe = r => r.groupes.flatMap(g => g.resultats.map(e => e.id))

console.log('normaliser')
verifier(normaliser('Écriture') === 'ecriture' && normaliser('ÉCRITURE') === 'ecriture', 'minuscules, sans accents')
verifier(normaliser('Œuf – Cœur') === 'oeuf coeur' && normaliser('Æ') === 'ae', 'ligatures, tirets')
verifier(normaliser('l’eau') === 'l eau' && normaliser('l\'eau') === 'l eau' && normaliser('l‘eau') === 'l eau', 'apostrophes unifiées')
verifier(normaliser('porte-monnaie ‑ un—deux') === 'porte monnaie un deux', 'tirets droit, insécable, long unifiés')
verifier(normaliser('c’hwec’h') === 'chwech' && normaliser('C\'HWEC\'H') === 'chwech' && normaliser('chwech') === 'chwech', 'breton : « c’h » = « ch »')
verifier(normaliser('Piñata ñ Ñ') === 'pinata n n' && normaliser('  a   b  ') === 'a b' && normaliser('') === '', 'ñ, espaces')
verifier(normaliser('Kalon-Digor, ha: hag?') === 'kalon digor ha hag', 'ponctuation')

console.log('Index')
const C = catalogueDeTest()
const competences = ressourcesCompetences(true)
const pages = [page('programme', { fr: 'Le programme', br: 'Ar programm' }), page('parametres', { fr: 'Réglages' }), page('hwec', { fr: 'Nombres', br: 'C’hwec’h niver' }), page('pinata', { fr: 'La piñata' })]
const I = construireIndexRecherche(C, competences, pages, 'fr')
verifier(I.length === C.length + competences.length + pages.length, 'une entrée par ressource, compétence et page')
verifier(new Set(I.map(e => e.id)).size === I.length, 'ids uniques')
verifier(I.every(e => e.titre && e.titreNormalise === normaliser(e.titre) && e.texteNormalise.includes(e.titreNormalise)), 'titre, titre normalisé, texte normalisé')
const ex = I.find(e => e.id === 'exercice:exemple')
verifier(ex.titre === 'Suites de nombres' && ex.route === '/dev/exemple' && ex.classes.join() === 'cp,ce1,ce2', 'entrée d’exercice : titre, route, classes')
verifier(I.find(e => e.id === 'affiche:exemple').titre === 'La bande numérique', 'entrée d’affiche')
const IBr = construireIndexRecherche(C, competences, pages, 'br')
verifier(IBr.find(e => e.id === 'exercice:exemple').titre === 'Heuliadoù niveroù', 'titre dans la langue de l’index')
verifier(IBr.find(e => e.id === 'exercice:exemple').texteNormalise.includes('suites de nombres'), 'le français reste cherchable en breton')

console.log('Recherche')
const tout = { classes: [], toutesLesClasses: true }
verifier(chercher(I, '', tout).groupes.length === 0 && chercher(I, '   ', tout).masques === 0 && chercher(I, '—', tout).groupes.length === 0, 'requête vide : rien')
verifier(idsDe(chercher(I, 'suites', tout)).includes('exercice:exemple') && idsDe(chercher(I, 'SUÎTES', tout)).includes('exercice:exemple'), 'tolérant aux accents et à la casse')
verifier(idsDe(chercher(I, 'reglages', tout)).join() === 'page:parametres' && idsDe(chercher(I, 'Réglages', tout)).join() === 'page:parametres', 'accents dans les deux sens')
verifier(idsDe(chercher(I, 'pinata', tout)).join() === 'page:pinata' && idsDe(chercher(I, 'PIÑATA', tout)).join() === 'page:pinata', 'ñ')
verifier(idsDe(chercher(IBr, 'chwech', tout)).includes('page:hwec') && idsDe(chercher(IBr, 'c’hwec’h', tout)).includes('page:hwec') && idsDe(chercher(IBr, 'C\'HWEC\'H', tout)).includes('page:hwec'), 'breton : « c’h » trouvé avec ou sans apostrophe')
verifier(idsDe(chercher(IBr, 'ar programm', tout)).includes('page:programme') && idsDe(chercher(I, 'le programme', tout)).includes('page:programme'), 'titre de la page dans la langue de l’index')
verifier(idsDe(chercher(I, 'suites nombres', tout)).includes('exercice:exemple') && idsDe(chercher(I, 'suites zebre', tout)).length === 0, 'tous les mots doivent être trouvés')
verifier(idsDe(chercher(I, 'l eau', tout)).length === idsDe(chercher(I, 'l’eau', tout)).length, 'apostrophe de la requête')
const parDomaine = chercher(I, 'nombres et calcul', tout)
verifier(idsDe(parDomaine).includes('fiche:numeration-cp'), 'on trouve par le nom du domaine')
verifier(chercher(I, 'cp', tout).groupes.some(g => g.type === 'exercice') && idsDe(chercher(I, 'ce2', tout)).includes('exercice:exemple'), 'on trouve par la classe')

const mot = normaliser(competences[0].titre.texte.fr).split(' ').sort((a, b) => b.length - a.length)[0]
verifier(chercher(I, mot, tout).groupes.some(g => g.type === 'competence' && g.resultats.some(e => e.id === competences[0].id)), 'on trouve une compétence par son libellé officiel')

console.log('Groupes et ordre')
const R = chercher(I, 'exemple', tout)
const types = R.groupes.map(g => g.type)
verifier(types.join() === ['exercice', 'affiche', 'fiche', 'competence', 'page'].filter(t => types.includes(t)).join() && new Set(types).size === types.length, 'groupes dans l’ordre exercices, affiches, fiches, compétences, pages ; un par type')
verifier(R.groupes.every(g => g.resultats.every(e => e.type === g.type) && g.resultats.length > 0), 'chaque groupe ne contient que son type, jamais vide')
// classement : mot entier, début de mot, sous-chaîne ; titre avant description ; alphabétique à égalité
const cat = [
  fiche('a', 'Les unités de calcul', ['cp']), fiche('b', 'Calcul mental', ['cp']), fiche('c', 'Calculer vite', ['cp']),
  fiche('d', 'Incalculable', ['cp']), fiche('e', 'Autre chose', ['cp'], 'on y fait du calcul'), fiche('f', 'Calcul écrit', ['cp']),
]
const J = construireIndexRecherche(cat, [], [], 'fr')
verifier(idsDe(chercher(J, 'calcul', tout)).join() === 'fiche:f,fiche:b,fiche:a,fiche:c,fiche:d,fiche:e', 'mot entier (alphabétique), puis début de mot, puis sous-chaîne, puis hors titre')
verifier(idsDe(chercher(J, 'CALCUL', tout)).join() === idsDe(chercher(J, 'calcul', tout)).join(), 'même classement quelle que soit la casse')
verifier(JSON.stringify(chercher(J, 'calcul', tout)) === JSON.stringify(chercher(J, 'calcul', tout)), 'déterministe')
verifier(idsDe(chercher(J, 'calc', tout)).join() === 'fiche:f,fiche:b,fiche:c,fiche:a,fiche:d,fiche:e', 'début de mot : alphabétique, puis sous-chaîne, puis hors titre')
const egal = construireIndexRecherche([fiche('x1', 'Même titre', ['cp']), fiche('x2', 'Même titre', ['cp'])], [], [], 'fr')
verifier(idsDe(chercher(egal, 'titre', tout)).join() === 'fiche:x1,fiche:x2', 'à égalité complète : ordre de l’index')

console.log('Classes')
const K = [fiche('cp1', 'Compter cp', ['cp']), fiche('ce1', 'Compter ce1', ['ce1']), fiche('ce2', 'Compter ce2 et cp', ['ce2', 'cp']), fiche('cm', 'Compter cm2', ['cm2'])]
const L = construireIndexRecherche(K, [], [page('compter', { fr: 'Compter les pages' })], 'fr')
const cp = chercher(L, 'compter', { classes: ['cp'], toutesLesClasses: false })
verifier(idsDe(cp).sort().join() === 'fiche:ce2,fiche:cp1,page:compter', 'filtré par la classe (multi-classes comprises ; une page est de toutes les classes)')
verifier(cp.masques === 2 && cp.groupes.find(g => g.type === 'fiche').masques === 2, '« + 2 dans les autres classes » : décompte global et par groupe')
const deux = chercher(L, 'compter', { classes: ['cp', 'cm2'], toutesLesClasses: false })
verifier(idsDe(deux).sort().join() === 'fiche:ce2,fiche:cm,fiche:cp1,page:compter' && deux.masques === 1, 'plusieurs classes : union')
const toutes = chercher(L, 'compter', { classes: ['cp'], toutesLesClasses: true })
verifier(idsDe(toutes).length === 5 && toutes.masques === 0, 'toutes les classes : rien de masqué')
const sansClasse = chercher(L, 'compter', { classes: [], toutesLesClasses: false })
verifier(idsDe(sansClasse).length === 5 && sansClasse.masques === 0, 'aucune classe choisie : pas de filtre')
const rien = chercher(L, 'compter', { classes: ['ps'], toutesLesClasses: false })
verifier(idsDe(rien).join() === 'page:compter' && rien.masques === 4, 'classe sans résultat : les masqués sont comptés')
const absent = chercher(L, 'zzz', { classes: ['cp'], toutesLesClasses: false })
verifier(absent.groupes.length === 0 && absent.masques === 0, 'aucun résultat : aucun masqué')

console.log('Entrées : icône et sous-titre')
const avecDescription = construireIndexRecherche([fiche('d1', 'Avec phrase', ['cp'], 'Une phrase.'), fiche('d2', 'Sans phrase', ['cp'])], [], [], 'fr')
verifier(avecDescription[0].sousTitre === 'Une phrase.' && avecDescription[1].sousTitre === '' && avecDescription.every(e => e.emoji === '📄'), 'sous-titre = description (vide sans), emoji de la ressource')

console.log('Pages du site (table des routes)')
const route = (path, meta = {}, redirect) => ({ path, meta, redirect })
const PP = pagesDuSite([
  route('/', { titre: 'routeur.titre.accueil' }), route('/maths', { titre: 'routeur.titre.maths' }),
  route('/brezhoneg', { titreLibre: 'Brezhoneg' }), route('/maths/heure', { titre: 'routeur.titre.exercice' }),
  route('/competence/:id', { titre: 'routeur.titre.competence' }), route('/telechargements/:slug', { titre: 'routeur.titre.fiche' }),
  route('/dev', { titre: 'nav.dev' }), route('/dev/exemple', { titre: 'nav.dev' }), route('/langue-regionale', {}, () => '/'),
  route('/:chemin(.*)*', { titre: 'routeur.titre.introuvable' }), route('/sans-titre'),
])
verifier(PP.map(p => p.route).join() === '/,/maths,/brezhoneg', 'accueil, matières, langue régionale ; ni paramètres, ni /dev, ni exercices, ni redirections, ni sans titre')
verifier(PP.every(p => p.type === 'page' && p.classes.length === 0 && p.id === `page:${p.route}`), 'type page, toutes les classes, id stable')
const IP = construireIndexRecherche([], [], PP, 'fr')
verifier(IP.map(e => e.titre).join() === 'Exercices et fiches à imprimer,Mathématiques,Brezhoneg', 'titres lus dans le catalogue (clé) ou libres')
verifier(construireIndexRecherche([], [], PP, 'br')[1].titre === 'Jedoniezh', 'titre de page en breton')

console.log('Clavier : ouverture')
const frappe = (key, extra = {}, cible = { tagName: 'BODY' }) => ({ key, ctrlKey: false, metaKey: false, altKey: false, target: cible, ...extra })
verifier(ouvreLaRecherche(frappe('k', { ctrlKey: true })) && ouvreLaRecherche(frappe('K', { metaKey: true })), 'Ctrl+K et ⌘K')
verifier(ouvreLaRecherche(frappe('k', { ctrlKey: true }, { tagName: 'INPUT' })), 'Ctrl+K ouvre même dans un champ')
verifier(!ouvreLaRecherche(frappe('k')) && !ouvreLaRecherche(frappe('j', { ctrlKey: true })) && !ouvreLaRecherche(frappe('k', { ctrlKey: true, altKey: true })), 'K seul, Ctrl+J, Ctrl+Alt+K : non')
verifier(ouvreLaRecherche(frappe('/')) && ouvreLaRecherche(frappe('/', {}, null)), '« / » hors champ')
verifier(!ouvreLaRecherche(frappe('/', {}, { tagName: 'INPUT' })) && !ouvreLaRecherche(frappe('/', {}, { tagName: 'textarea' })) && !ouvreLaRecherche(frappe('/', {}, { tagName: 'SELECT' })) && !ouvreLaRecherche(frappe('/', {}, { tagName: 'DIV', isContentEditable: true })), '« / » jamais dans un champ de saisie')
verifier(!ouvreLaRecherche(frappe('/', { ctrlKey: true })) && !ouvreLaRecherche(frappe('/', { altKey: true })), '« / » avec Ctrl ou Alt : non')
verifier(estZoneDeSaisie({ tagName: 'input' }) && !estZoneDeSaisie({ tagName: 'BUTTON' }) && !estZoneDeSaisie(null), 'zone de saisie')

console.log('Clavier : déplacement')
verifier(deplacer(0, 3, 1) === 1 && deplacer(2, 3, 1) === 0 && deplacer(0, 3, -1) === 2 && deplacer(1, 3, -1) === 0, 'suivant, précédent, en bouclant')
verifier(deplacer(0, 0, 1) === 0 && deplacer(0, 0, -1) === 0 && deplacer(0, 1, 1) === 0, 'liste vide ou d’un élément')

console.log('Résultats affichés')
const gros = Array.from({ length: 8 }, (_, i) => fiche(`g${i}`, `Gros ${i}`, ['cp']))
const G = chercher(construireIndexRecherche([...gros, ...K], [], [page('gros', { fr: 'Gros' })], 'fr'), 'gros', tout)
const A = groupesAffiches(G.groupes)
verifier(A[0].lignes.length === LIGNES_PAR_GROUPE && A[0].restants === 8 - LIGNES_PAR_GROUPE && A[1].lignes.length === 1 && A[1].restants === 0, 'au plus quelques lignes par type, le reste est compté')
verifier(aplatir(A).map(l => l.position).join() === Array.from({ length: LIGNES_PAR_GROUPE + 1 }, (_, i) => i).join(), 'positions continues de haut en bas, d’un groupe à l’autre')
verifier(groupesAffiches([]).length === 0 && aplatir([]).length === 0, 'rien : rien')

console.log('Surlignage')
const surligne = (texte, requete) => decouper(texte, requete).map(m => (m.trouve ? `[${m.texte}]` : m.texte)).join('')
verifier(surligne('Les fractions', 'fraction') === 'Les [fraction]s', 'le mot trouvé est entouré, le reste intact')
verifier(surligne('Écriture des Nombres', 'ecriture nombre') === '[Écriture] des [Nombre]s', 'sans accents ni casse, plusieurs mots : la casse et les accents d’origine sont gardés')
verifier(surligne('Les chwec’h jours', 'chwech') === 'Les [chwec’h] jours', 'breton : « c’h » trouvé par « ch », l’apostrophe est dans le surlignage')
verifier(surligne('Le Cœur', 'coeur') === 'Le [Cœur]', 'ligature : le surlignage couvre la ligature entière')
verifier(surligne('a b a', 'a') === '[a] b [a]' && surligne('abab', 'ab a') === '[abab]', 'plusieurs occurrences, plages qui se touchent fusionnées')
verifier(surligne('Rien', 'zzz') === 'Rien' && decouper('Rien', 'zzz').length === 1 && decouper('Rien', '  ').length === 1 && decouper('', 'a').length === 1, 'rien de trouvé ou requête vide : un seul morceau non marqué')
verifier(decouper('<b>x</b> & y', 'x').map(m => m.texte).join('') === '<b>x</b> & y', 'le texte est restitué à l’identique (jamais de HTML produit)')
verifier(surligne('Un 😀 emoji', 'emoji') === 'Un 😀 [emoji]', 'caractères hors plan de base : positions justes')

process.exit(nbEchecs() ? 1 : 0)

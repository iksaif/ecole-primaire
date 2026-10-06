// Index et moteur de recherche (node, sans Chrome) : normalisation, accents, breton, classes, groupes, classement.
import { construireIndexRecherche, chercher, normaliser } from '../src/recherche/index.ts'
import { ressourcesCompetences } from '../src/ressources/catalogue.ts'
import { catalogueDeTest } from './donnees-ressources.mjs'
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

process.exit(nbEchecs() ? 1 : 0)

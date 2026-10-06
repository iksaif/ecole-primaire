// Regroupement des polices d'une fiche (src/noyau/groupesPolices.ts, pur) : favorites, installées, ajoutées, manquantes ;
// retombée sur Andika ; validation des noms mémorisés ; l'aide ne parle que de ce qui manque.
//   node tests/polices.test.mjs
import { regrouper, selectionnables, choixValide, assainirNoms, nomPoliceValide, familleDe, estEmbarquee } from '../src/noyau/groupesPolices.ts'
import { verifier, nbEchecs } from './outils.mjs'

// utils/impression.js charge des fichiers de police (Vite) : illisible par node, on reprend ici la forme de ses listes
const ATTACHE = ['BelleAllure CM', 'BelleAllure CE', 'Belle Allure CM', 'Ecolier', 'Ecolier_court', 'Cursif', 'Cursive standard']
const incluses = [{ id: 'Andika', label: 'Andika' }, { id: 'Luciole', label: 'Luciole' }]
const connues = (...installees) => ATTACHE.map(nom => ({ nom, installee: installees.includes(nom) }))
const base = { incluses, connues: connues(), systeme: [], ajoutees: [] }

console.log('Familles')
verifier(familleDe('BelleAllure CM') === 'Belle Allure' && familleDe('Belle Allure Script') === 'Belle Allure' && familleDe('Ecolier_court') === 'Écolier'
  && familleDe('Cursive standard') === 'Cursif' && familleDe('Script Ecole 2') === 'Cursif', 'le nom d\'une variante donne sa famille suggérée')

console.log('Rien d\'installé')
let g = regrouper(base)
verifier(g.favorites.slice(0, 2).map(e => e.id).join() === 'Andika,Luciole' && g.favorites.slice(0, 2).every(e => e.etat === 'incluse'), 'les polices incluses sont en tête des favorites')
verifier(g.manquantes.join() === 'Belle Allure,Écolier,Cursif', 'les trois familles suggérées sont visibles même non installées')
verifier(g.favorites.filter(e => e.etat === 'manquante').length === 3 && !g.installees.length && !g.ajoutees.length, 'grisées dans les favorites, aucun autre groupe')
verifier(selectionnables(g).map(e => e.id).join() === 'Andika,Luciole', 'une police manquante n\'est pas sélectionnable')

console.log('Une famille installée')
g = regrouper({ ...base, connues: connues('BelleAllure CM', 'BelleAllure CE') })
verifier(g.favorites.filter(e => e.etat === 'installee').map(e => e.id).join() === 'BelleAllure CM,BelleAllure CE', 'les variantes installées sont sélectionnables')
verifier(g.manquantes.join() === 'Écolier,Cursif' && !g.favorites.some(e => e.id === 'manquante:Belle Allure'), 'Belle Allure n\'est plus manquante : l\'aide ne la cite plus')
verifier(regrouper({ ...base, connues: connues(...ATTACHE) }).manquantes.length === 0, 'tout installé : plus rien à obtenir (l\'aide disparaît)')

console.log('Polices de l\'ordinateur et ajoutées')
g = regrouper({ ...base, systeme: ['Verdana', 'Arial', 'andika', 'BelleAllure CM', 'Arial'], ajoutees: [{ id: 'Ma police', label: 'Ma police' }] })
verifier(g.installees.map(e => e.id).join() === 'Arial,Verdana', 'installées : triées, sans doublon, sans ce qui est déjà proposé ailleurs')
verifier(g.ajoutees.map(e => e.id).join() === 'Ma police' && g.ajoutees[0].etat === 'ajoutee', 'ajoutées depuis un fichier : leur groupe')
verifier(selectionnables(g).some(e => e.id === 'Verdana') && selectionnables(g).some(e => e.id === 'Ma police'), 'toutes sont sélectionnables')
verifier(estEmbarquee(g.favorites[0]) && estEmbarquee(g.ajoutees[0]) && !estEmbarquee(g.installees[0]), 'seule une police du système n\'est pas embarquée dans la fiche')

console.log('Choix mémorisé')
verifier(choixValide('Verdana', g) === 'Verdana' && choixValide('Luciole', g) === 'Luciole', 'un choix encore disponible est gardé')
verifier(choixValide('Helvetica', g) === 'Andika' && choixValide('manquante:Cursif', g) === 'Andika', 'une police disparue ou manquante retombe sur Andika')
verifier(choixValide(undefined, g) === 'Andika' && choixValide(42, g) === 'Andika' && choixValide(null, g) === 'Andika', 'une valeur abîmée aussi, sans erreur')

console.log('Noms mémorisés')
verifier(assainirNoms(['Verdana', 'verdana', 'Arial', 3, null, "Evil'; x", 'a\\b', '', ' Espace', 'x'.repeat(200)]).join() === 'Verdana,Arial', 'noms valides seulement, sans doublon')
verifier(assainirNoms(undefined).length === 0 && assainirNoms('Arial').length === 0 && assainirNoms({}).length === 0, 'une valeur qui n\'est pas une liste : ignorée')
verifier(nomPoliceValide('Times New Roman') && nomPoliceValide('Écolier CP') && !nomPoliceValide("a'b") && !nomPoliceValide('</style>') && !nomPoliceValide(5), 'un nom doit pouvoir entrer dans du CSS entre apostrophes')

process.exit(nbEchecs() ? 1 : 0)

// Se repérer dans le programme depuis une compétence (node, sans Chrome) : classe lue, rang dans le domaine, autres classes, texte officiel.
import { COMPETENCES, COMPETENCES_EXEMPLE, SOURCES, competenceDe, competencesDu } from '../src/data/programme.ts'
import { NIVEAUX } from '../src/data/classes.ts'
import { classeDeLecture, dansLesAutresClasses, nombreDeRessources, placeDansLeTexte, positionDansLeDomaine, textesOfficiels } from '../src/programme/navigation.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Navigation dans le programme')
const k = competenceDe('royaume-de-france')

verifier(classeDeLecture(k, []) === 'ce2' && classeDeLecture(k, ['cp', 'ce2']) === 'ce2' && classeDeLecture(k, ['cp']) === k.niveaux[0], 'classe lue : la première demandée où la compétence existe, sinon son année d’introduction')

// rang, précédente et suivante : dans l'ordre du programme, pour une classe
const p = positionDansLeDomaine(k, 'ce2')
const attendues = competencesDu(k.domaine, 'ce2')
verifier(p.domaine.length === attendues.length && p.domaine[p.rang - 1].id === k.id, 'rang : la compétence est à sa place dans son domaine, pour sa classe')
verifier(p.precedente?.id === attendues[p.rang - 2]?.id && p.suivante?.id === attendues[p.rang]?.id, 'précédente et suivante : les voisines de la liste')
const premiere = positionDansLeDomaine(attendues[0], 'ce2'), derniere = positionDansLeDomaine(attendues.at(-1), 'ce2')
verifier(premiere.precedente === null && premiere.rang === 1 && derniere.suivante === null && derniere.rang === attendues.length, 'première et dernière : pas de précédente, pas de suivante')

// autres classes : ce que le domaine INTRODUIT avant et après, sans reprise
const a = dansLesAutresClasses(k.domaine, 'ce2')
verifier(a.avant !== null && NIVEAUX.indexOf(a.avant.classe) < NIVEAUX.indexOf('ce2') && a.avant.competences.every(c => c.niveaux[0] === a.avant.classe && c.domaine === k.domaine), 'avant : la classe la plus proche, des compétences qu’elle introduit')
verifier(a.apres !== null && NIVEAUX.indexOf(a.apres.classe) > NIVEAUX.indexOf('ce2') && a.apres.competences.every(c => c.niveaux[0] === a.apres.classe), 'après : idem')
const dernierDomaine = dansLesAutresClasses(k.domaine, 'cm2')
verifier(dernierDomaine.apres === null, 'après la dernière classe : rien')

// texte officiel : même source, ordre des pages
const t = placeDansLeTexte(k)
verifier(t.source === k.source.texte && t.page === k.source.page && t.surLaPage.every(c => c.source.texte === t.source && c.source.page === t.page && c.id !== k.id), 'même page : les autres compétences de la page du PDF')
verifier(t.precedente === null || (t.precedente.source.texte === t.source && t.precedente.source.page <= t.page), 'précédente dans le texte : même texte, page avant ou égale')
verifier(t.suivante === null || (t.suivante.source.texte === t.source && t.suivante.source.page >= t.page), 'suivante dans le texte : même texte, page après ou égale')

// tous les textes : chaque compétence y est une fois, pages croissantes
const textes = textesOfficiels()
const nbCompetences = COMPETENCES.length + COMPETENCES_EXEMPLE.length   // les exemples (développement seulement) comptent quand ils sont chargés
const vues = textes.flatMap(x => x.pages.flatMap(pg => pg.competences.map(c => c.id)))
verifier(vues.length === nbCompetences && new Set(vues).size === nbCompetences, `parcourir le programme officiel : chaque compétence une seule fois (${vues.length})`)
verifier(textes.every(x => x.pages.every((pg, i) => i === 0 || pg.page > x.pages[i - 1].page)), 'pages en ordre croissant, sans doublon')
verifier(textes.every(x => x.pages.every(pg => pg.url.startsWith('https://') && pg.competences.every(c => c.source.url === pg.url))) && textes.every(x => x.source in SOURCES), 'chaque page a son lien PDF, les sources existent')

// ressources par compétence
const n = nombreDeRessources([{ competences: ['a', 'b'] }, { competences: ['a'] }])
verifier(n.get('a') === 2 && n.get('b') === 1 && n.get('c') === undefined, 'nombre de ressources par compétence')

process.exit(nbEchecs() ? 1 : 0)

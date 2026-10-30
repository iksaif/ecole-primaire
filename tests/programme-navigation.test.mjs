// Se repérer dans le programme depuis une compétence (node, sans Chrome) : classe lue, rang dans le domaine, autres classes, texte officiel.
import { COMPETENCES, COMPETENCES_EXEMPLE, SOURCES, competenceDe, competencesDu } from '../src/data/programme.ts'
import { NIVEAUX } from '../src/data/classes.ts'
import { classeDeLecture, dansLesAutresClasses, nombreDeRessources, placeDansLeTexte, positionDansLeDomaine, textesOfficiels } from '../src/programme/navigation.ts'
import { existsSync, readFileSync } from 'node:fs'
import { ANCRES } from '../src/programme/ancres.ts'
import { decouper, normaliser, surligner, trouverPassage } from '../src/programme/lecteur.ts'
import { adresseDeLaPage, lectureDisponible } from '../src/programme/officiel.ts'
import { estIndexable } from '../src/router/canonique.ts'
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

// ── Lire un passage dans l'app ──
console.log('Lecteur de texte officiel')
verifier(normaliser('Hugues,') === 'hugues' && normaliser('Éléments') === 'elements' && normaliser('- ') === '' && normaliser('J.-C.') === 'jc', 'normaliser : sans casse, accents ni ponctuation')
const d = decouper('Un  texte,\n- avec des mots.')
verifier(d.morceaux.map(m => m.texte).join('') === 'Un  texte,\n- avec des mots.' && d.mots.join(' ') === 'un texte avec des mots', 'découper : le texte se retrouve bout à bout, les mots sont normalisés')
const passage = trouverPassage(d.mots, { debut: 'TEXTE avec', fin: 'des mots' })
verifier(passage?.debut === 1 && passage?.fin === 4, 'passage : du début de la première ancre à la fin de la seconde')
verifier(trouverPassage(d.mots, { debut: 'absent', fin: 'mots' }) === null && trouverPassage(d.mots, { debut: 'mots', fin: 'un texte' }) === null, 'passage : une ancre absente ou une fin avant le début → aucun passage')
const tranches = surligner(d.morceaux, passage)
verifier(tranches.map(t => t.texte).join('') === 'Un  texte,\n- avec des mots.' && tranches.filter(t => t.surligne).map(t => t.texte).join('|') === 'texte,\n- avec des mots.' && surligner(d.morceaux, null).length === 1, 'surligner : le texte entier est gardé, le passage (espaces compris) est surligné')

// chaque ancre retrouve son passage dans le texte de sa page ; le texte des pages est publié
const sansAncre = COMPETENCES.filter(c => !ANCRES[c.id]).map(c => c.id)
verifier(sansAncre.length === 0, `ancres : chaque compétence en a une (sans : ${sansAncre.join(', ') || 'aucune'})`)
const perdues = [], absentes = []
for (const c of COMPETENCES) {
  const fichier = `public/programmes/${c.source.texte}/${c.source.page}.txt`
  // un texte dont la reprise n'est pas confirmée n'a pas de page publiée
  if (!lectureDisponible(c.source.texte)) { if (existsSync(fichier)) absentes.push(`${fichier} (ne doit pas être publié)`); continue }
  if (!existsSync(fichier)) { absentes.push(fichier); continue }
  if (ANCRES[c.id] && !trouverPassage(decouper(readFileSync(fichier, 'utf8')).mots, ANCRES[c.id])) perdues.push(c.id)
}
verifier(absentes.length === 0, `chaque page lisible a son texte dans public/programmes/, aucune page d'un texte à confirmer (${absentes[0] ?? 'oui'} : node scripts/generer/programmes.ts)`)
verifier(!lectureDisponible('bretonA1') && !lectureDisponible('c1consolide') && lectureDisponible('bo41') && lectureDisponible('lvc2'), 'lecture désactivée pour le breton de l’académie et le texte consolidé d’Éduscol, active pour les BO')
verifier(perdues.length === 0, `chaque ancre se retrouve dans sa page (perdues : ${perdues.join(', ') || 'aucune'})`)

// adresses
verifier(adresseDeLaPage('c2histgeo', 5, 'royaume-de-france') === '/programme/officiel/c2histgeo/5?competence=royaume-de-france' && adresseDeLaPage('bo41', 26) === '/programme/officiel/bo41/26', 'adresse d’une page lue')
verifier(estIndexable('/programme/officiel') && !estIndexable('/programme/officiel/c2histgeo/5') && estIndexable('/programme'), 'la page des textes s’indexe, la lecture d’une page non')

process.exit(nbEchecs() ? 1 : 0)

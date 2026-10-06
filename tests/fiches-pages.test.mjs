// Logique pure des pages de fiches prêtes (node, sans Chrome) : filtres, langues proposées, entrées sœurs, formats, pages, voisines.
import { orientationsDe, proposeUnChoixDeSens, filtrerFiches, languesProposees, domainesProposes, entreesSoeurs, memeFiche, slugDeBase, formatsDe, pdfDe, proposeUnChoixDeFormat,
  pageVoisine, voisinesDeFiche, jeuDeLaFiche, grouperParMatiere, parTitre, matiereDe, dansLeMode, CRITERES_PAGE_VIDES, LANGUE_BILINGUE, cheminFiches } from '../src/telechargements/pages.ts'
import { verifier, nbEchecs } from './outils.mjs'

const e = (slug, o = {}) => ({ slug, titre: { fr: slug }, niveaux: ['ce1'], domaine: 'nombres-calcul', usage: 'sentrainer', langues: ['fr'], parent: null, recherche: slug.replace(/-/g, ' '), ...o })
const index = {
  filtres: { domaines: [{ id: 'nombres-calcul', matiere: 'maths' }, { id: 'lecture', matiere: 'francais' }] },
  entrees: [
    e('tables', { titre: { fr: 'Tables', br: 'Taolennoù' }, niveaux: ['ce1', 'ce2'] }),
    e('tables-br', { langues: ['br'], niveaux: ['ce1', 'ce2'] }),
    e('tables-fr-br', { langues: ['fr', 'br'], niveaux: ['ce1', 'ce2'] }),
    e('frise', { niveaux: ['cp'], usage: 'apprendre' }),
    e('lire', { domaine: 'lecture', niveaux: ['cp'] }),
    e('enfant', { parent: 'tables' }),
    e('culture', { domaine: null }),
  ],
}
const ctx = (mode = 'fr', regionale = null) => ({ mode, regionale })
const slugs = l => l.map(x => x.slug).join()

console.log('Filtres')
verifier(slugs(filtrerFiches(index, 'maths', CRITERES_PAGE_VIDES, ctx())) === 'tables,tables-fr-br,frise', 'mode français : fiches qui ont du français (pas le breton seul), pas les fiches par compétence')
verifier(slugs(filtrerFiches(index, 'maths', CRITERES_PAGE_VIDES, ctx('bilingue', 'br'))) === 'tables,tables-br,tables-fr-br,frise', 'mode bilingue : les trois langues')
verifier(slugs(filtrerFiches(index, 'maths', CRITERES_PAGE_VIDES, ctx('regionale', 'br'))) === 'tables-br,tables-fr-br', 'mode régional seul : fiches qui ont du breton')
verifier(slugs(filtrerFiches(index, 'maths', { ...CRITERES_PAGE_VIDES, classes: ['cp'] }, ctx())) === 'frise', 'classe')
verifier(slugs(filtrerFiches(index, 'maths', { ...CRITERES_PAGE_VIDES, classes: ['cp', 'ce2'] }, ctx())) === 'tables,tables-fr-br,frise', 'plusieurs classes : union')
verifier(slugs(filtrerFiches(index, null, { ...CRITERES_PAGE_VIDES, usage: 'apprendre' }, ctx())) === 'frise', 'usage, toutes matières')
verifier(slugs(filtrerFiches(index, 'francais', CRITERES_PAGE_VIDES, ctx())) === 'lire', 'autre matière')
verifier(slugs(filtrerFiches(index, null, { ...CRITERES_PAGE_VIDES, domaine: 'hors-programme' }, ctx())) === 'culture', 'hors programme')
verifier(slugs(filtrerFiches(index, 'maths', { ...CRITERES_PAGE_VIDES, texte: 'TÁBLES' }, ctx())) === 'tables,tables-fr-br', 'recherche sans accent ni casse')
verifier(slugs(filtrerFiches(index, 'maths', { ...CRITERES_PAGE_VIDES, langue: 'br' }, ctx('bilingue', 'br'))) === 'tables-br', 'langue br : fiches en breton seul')
verifier(slugs(filtrerFiches(index, 'maths', { ...CRITERES_PAGE_VIDES, langue: LANGUE_BILINGUE }, ctx('bilingue', 'br'))) === 'tables-fr-br', 'langue bilingue : plusieurs langues')
verifier(matiereDe({ domaine: null }, index) === 'monde' && matiereDe({ domaine: 'lecture' }, index) === 'francais', 'matière d’une entrée')
verifier(!dansLeMode(e('x', { langues: ['br'] }), 'fr', 'br') && dansLeMode(e('x', { langues: ['br'] }), 'fr', null) === false, 'une fiche bretonne n’est pas du mode français')

console.log('Langues et domaines proposés')
const montrables = filtrerFiches(index, 'maths', CRITERES_PAGE_VIDES, ctx('bilingue', 'br'))
verifier(languesProposees(montrables, 'bilingue').join() === `fr,br,${LANGUE_BILINGUE}`, 'bilingue : fr, br, bilingue')
verifier(languesProposees(montrables, 'fr').length === 0 && languesProposees(montrables, 'regionale').length === 0, 'pas de filtre de langue hors mode bilingue')
verifier(languesProposees([e('a')], 'bilingue').length === 0, 'un seul choix : pas de filtre')
verifier(domainesProposes(index, 'maths', index.entrees).map(d => d.id).join() === 'nombres-calcul', 'domaines de la matière qui ont des fiches')

console.log('Entrées sœurs')
verifier(slugDeBase(e('tables-br', { langues: ['br'] })) === 'tables' && slugDeBase(e('tables-fr-br', { langues: ['fr', 'br'] })) === 'tables' && slugDeBase(e('tables')) === 'tables', 'slug de base')
verifier(slugs(entreesSoeurs(index.entrees[0], index.entrees)) === 'tables-br,tables-fr-br', 'sœurs du français : une langue puis bilingue')
verifier(slugs(memeFiche(index.entrees[1], index.entrees)) === 'tables,tables-br,tables-fr-br', 'même fiche : française d’abord, la fiche comprise')
verifier(memeFiche(index.entrees[3], index.entrees).length === 0, 'aucune sœur : pas de « Même fiche »')

console.log('Formats et pages')
const v1 = { pdfs: [{ format: 'A4', orientation: 'portrait', chemin: 'a' }, { format: 'A3', orientation: 'portrait', chemin: 'b' }] }
verifier(formatsDe(v1).join() === 'A4,A3' && proposeUnChoixDeFormat(v1) && !proposeUnChoixDeFormat({ pdfs: [v1.pdfs[0]] }), 'choix de format seulement s’il y en a plusieurs')
const v2 = { pdfs: [['A4', 'landscape'], ['A4', 'portrait'], ['A3', 'landscape'], ['A3', 'portrait']].map(([format, orientation]) => ({ format, orientation, chemin: `${format}-${orientation}` })) }
verifier(formatsDe(v2).join() === 'A4,A3' && orientationsDe(v2).join() === 'landscape,portrait' && proposeUnChoixDeSens(v2) && !proposeUnChoixDeSens(v1), 'format et sens sans doublon ; sens proposé seulement s’il y en a plusieurs')
verifier(pdfDe(v2, 'A3', 'portrait').chemin === 'A3-portrait' && pdfDe(v2, 'A3', null).chemin === 'A3-landscape' && pdfDe(v2, null, 'portrait').chemin === 'A4-portrait', 'PDF par format et par sens, repli sur ce qui existe')
verifier(pdfDe(v1, 'A3').chemin === 'b' && pdfDe(v1, null).chemin === 'a' && pdfDe(v1, 'A5').chemin === 'a', 'PDF par format, repli sur le premier')
verifier(pageVoisine(0, -1, 3) === 0 && pageVoisine(2, 1, 3) === 2 && pageVoisine(0, 1, 3) === 1 && pageVoisine(0, 1, 0) === 0, 'page voisine bornée')

console.log('Voisines, jeu lié')
const f = (slug, o) => ({ id: `fiche:${slug}`, type: 'fiche', slug, domaine: 'nombres-calcul', competences: [], langues: ['fr'], badges: { jeu: false, imprimable: true }, route: '', ...o })
const cat = [
  f('a', { competences: ['c1', 'c2'] }), f('b', { competences: ['c2'], classes: ['cm2'] }), f('c', { competences: [] }), f('d', { competences: ['c9'], domaine: 'lecture' }),
  f('a-br', { competences: ['c1', 'c2'], langues: ['br'] }),
  { id: 'exercice:x', type: 'exercice', route: '/maths/x', badges: { jeu: true, imprimable: true }, competences: [], domaine: 'nombres-calcul', langues: ['fr'] },
]
const v = voisinesDeFiche({ slug: 'a', langues: ['fr'] }, cat)
verifier(slugs(v.competence) === 'b' && slugs(v.domaine) === 'c', 'même compétence, puis même domaine ; ni la classe, ni la même fiche dans une autre langue')
verifier(voisinesDeFiche({ slug: 'inconnue', langues: ['fr'] }, cat).competence.length === 0, 'fiche hors catalogue : aucune voisine')
verifier(jeuDeLaFiche({ personnaliser: { route: '/maths/x', requete: {} } }, cat)?.id === 'exercice:x' && !jeuDeLaFiche({ personnaliser: null }, cat), 'exercice en ligne lié par la route')

console.log('Index A→Z')
verifier(parTitre([{ titre: { fr: 'Éléphant' } }, { titre: { fr: 'Zèbre' } }, { titre: { fr: 'abeille' } }], 'fr').map(x => x.titre.fr).join() === 'abeille,Éléphant,Zèbre', 'tri sans casse ni accent')
const g = grouperParMatiere(index, index.entrees.filter(x => !x.parent), ['maths', 'francais', 'monde', 'regionale'], 'fr')
verifier(g.map(x => x.matiere).join() === 'maths,francais,monde', 'groupes par matière, matières vides omises')
verifier(cheminFiches('maths') === '/maths/fiches' && cheminFiches('regionale') === null, 'adresses des fiches')

process.exit(nbEchecs() ? 1 : 0)

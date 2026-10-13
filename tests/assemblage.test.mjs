// Assemblage de fiches (node) : le contrat de fragment, et une feuille faite de fiches de plusieurs exercices du registre (une ligne Prénom / Date, un corrigé, du CSS limité à chaque bloc).
import { REGISTRE } from '../src/exercices/index.ts'
import { estAssemblable, fragmentDeExercice } from '../src/exercices/fragment.ts'
import { fragmentDe } from '../src/impression/fragment.ts'
import { documentFiche } from '../src/impression/document.ts'
import { assemblerFiches, separer, cssDuBloc } from '../src/impression/assemblage.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Contrat de fragment')
const doc = () => documentFiche({ titre: 'T', langue: 'fr', corps: '<p class="entete">x</p><b>corps</b>', css: '.a { color: red }' })
const f = fragmentDe(doc)
verifier(f.titre === 'T' && f.css === '.a { color: red }' && f.corps.includes('<b>corps</b>') && !f.corps.includes('<html'), 'fragmentDe : le titre, le CSS propre et le corps, sans le document')
verifier(doc().startsWith('<!DOCTYPE html>'), 'hors de fragmentDe : la fiche rend son document comme avant (le collecteur est libéré)')
let refus = ''
try { fragmentDe(() => { doc(); doc() }) } catch (e) { refus = String(e.message) }
verifier(/exactement un document/.test(refus), 'deux documents : refusé')
try { fragmentDe(() => 'rien') ; refus = '' } catch (e) { refus = String(e.message) }
verifier(/exactement un document/.test(refus), 'aucun document : refusé')
try { fragmentDe(() => fragmentDe(doc)); refus = '' } catch (e) { refus = String(e.message) }
verifier(/ne s’imbrique pas/.test(refus) && doc().startsWith('<!DOCTYPE html>'), 'imbriqué : refusé, et le collecteur est libéré malgré l’erreur')

console.log('Morceaux d’un fragment')
const sep = separer('<p class="entete">Prénom</p><div>q1</div><section class="corrige"><h2>Corrigé</h2><p>r1</p></section><section class="corrige"><h2>Autre</h2>r2</section>')
verifier(sep.sans === '<div>q1</div>' && sep.corriges.join('|') === '<p>r1</p>|r2', 'séparer : sans entête ni corrigé, et les corrigés sans leur titre')
const css = cssDuBloc('@page { size: A4; margin: 1cm; }\nbody { font-size: 12px }\n.ligne { color: red }', 2)
verifier(css.startsWith('.bloc-2 {') && !css.includes('@page') && css.includes('& { font-size') && css.includes('.ligne { color: red }'), 'cssDuBloc : limité au bloc, sans @page, body → le bloc')

console.log('Une feuille de plusieurs exercices')
const NIVEAU = 'ce1'
const modules = REGISTRE.filter(m => estAssemblable(m) && m.definition.niveaux[NIVEAU] && m.definition.jeu !== false).slice(0, 4)
verifier(modules.length >= 3, `au moins trois exercices assemblables en ${NIVEAU} (${modules.map(m => m.definition.id).join(', ')})`)
for (const langue of ['fr', 'br']) {
  const blocs = modules.map(m => ({ fragment: fragmentDeExercice(m, { niveau: NIVEAU, graine: 1, langue }) }))
  const html = assemblerFiches({ titre: 'Ma feuille', langue, blocs, corrige: 'Corrigé' })
  const nbEntetes = (html.match(/class="entete"/g) ?? []).length
  const nbCorriges = (html.match(/<section class="corrige"/g) ?? []).length
  const avecCorrige = blocs.filter(b => /class="corrige"/.test(b.fragment.corps)).length
  verifier(nbEntetes === 1 && nbCorriges === 1, `${langue} : une seule ligne Prénom / Date (${nbEntetes}) et un seul corrigé (${nbCorriges})`)
  verifier((html.match(/class="corrige-bloc"/g) ?? []).length === avecCorrige, `${langue} : un sous-corrigé par fiche qui en a un (${avecCorrige})`)
  verifier(!html.includes('@page') && modules.every((_, i) => html.includes(`.bloc-${i} {`) && html.includes(`class="bloc bloc-${i}"`)), `${langue} : un bloc et son CSS limité pour chaque fiche, aucun @page`)
  verifier(html.startsWith('<!DOCTYPE html>') && html.includes('<title>Ma feuille</title>'), `${langue} : un document complet`)
}
{
  const m = modules[0]
  const un = fragmentDeExercice(m, { niveau: NIVEAU, graine: 3, langue: 'fr' })
  const deux = fragmentDeExercice(m, { niveau: NIVEAU, graine: 3, langue: 'fr' })
  const autre = fragmentDeExercice(m, { niveau: NIVEAU, graine: 4, langue: 'fr' })
  verifier(un.corps === deux.corps && (un.corps !== autre.corps || modules.length > 0), 'même graine, même fragment')
  const page = assemblerFiches({ titre: 'x', langue: 'fr', blocs: [{ titre: 'Mon titre', fragment: un }, { fragment: deux }], corrige: 'Corrigé', pageParBloc: true, entete: false })
  verifier(page.includes('Mon titre') && !page.includes('class="entete"') && (page.match(/bloc-page/g) ?? []).length >= 2, 'titre du bloc donné, sans entête, une page par bloc')
}

console.log('En-tête, pied, bloc sans titre, tirage ajusté')
{
  const m = modules[0]
  const fragment = fragmentDeExercice(m, { niveau: NIVEAU, graine: 3, langue: 'fr' })
  const html = assemblerFiches({ titre: 'x', langue: 'fr', blocs: [{ sansTitre: true, fragment }], corrige: 'Corrigé', avant: '<div id="avant">A</div>', apres: '<div id="apres">B</div>', css: '#avant { color: red }' })
  const iAvant = html.indexOf('id="avant"'), iBloc = html.indexOf('class="bloc bloc-0"'), iApres = html.indexOf('id="apres"'), iCorrige = html.indexOf('<section class="corrige"')
  verifier(iAvant > 0 && iAvant < iBloc && iBloc < iApres && (iCorrige < 0 || iApres < iCorrige), 'avant, bloc, apres, puis le corrigé, dans cet ordre')
  verifier(!html.includes('<h2 class="titre-bloc">') && !html.includes('<h3 class="titre-corrige">') && html.includes('#avant { color: red }'), 'sansTitre : ni titre de bloc ni titre de corrigé ; le CSS en plus est repris')
  // ajuster : la fiche n'a que le début du tirage
  const complet = fragmentDeExercice(m, { niveau: NIVEAU, graine: 3, langue: 'fr' })
  const coupe = fragmentDeExercice(m, { niveau: NIVEAU, graine: 3, langue: 'fr', ajuster: t => (Array.isArray(t) ? t.slice(0, 3) : { ...t, questions: t.questions.slice(0, 3) }) })
  const nbQuestions = f => (f.corps.match(/class="num"/g) ?? []).length
  verifier(nbQuestions(coupe) === 3 && nbQuestions(complet) > 3 && coupe.corps !== complet.corps, `ajuster : ${nbQuestions(coupe)} questions au lieu de ${nbQuestions(complet)}`)
}

process.exit(nbEchecs() ? 1 : 0)

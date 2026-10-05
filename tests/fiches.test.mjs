// Fiches PDF toutes prêtes (plan 11), test node sans Chrome : le schéma, le build (registres → rendu simulé → assemblage →
// écriture → relecture), la recherche, le chargement (faux fetch) et le composable de la page.
//   node tests/fiches.test.mjs
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { nextTick } from 'vue'
import { NIVEAUX } from '../src/data/classes.ts'
import { assembler } from '../scripts/fiches/assembler.ts'
import { ecrireFiches, validerTout } from '../scripts/fiches/ecrire.ts'
import { produire } from '../scripts/fiches/produire.ts'
import { fichesDesRegistres } from '../scripts/fiches/registres.ts'
import { dimensionsJpeg, nbPagesPdf } from '../scripts/fiches/rendu.ts'
import { installerPolices } from '../scripts/fiches/polices.ts'
import { chargerEntree, chargerIndex, urlFiches } from '../src/telechargements/chargement.ts'
import { CRITERES_VIDES, etiquetteClasses, filtrer, normaliser, parDomaine } from '../src/telechargements/recherche.ts'
import { USAGES, VERSION_SCHEMA, usageDe } from '../src/telechargements/types.ts'
import { ErreurSchema, lireEntree, lireIndex, problemesIndex } from '../src/telechargements/valider.ts'
import { oublierIndex, useFiche, useFiches } from '../src/telechargements/useFiches.ts'
import { verifier, nbEchecs } from './outils.mjs'

installerPolices()
const tmp = mkdtempSync(join(tmpdir(), 'fiches-'))
const racine = join(import.meta.dirname, '..')

// ── Rendu simulé : même contrat que scripts/fiches/rendu.ts, sans navigateur ──
// (un vrai JPEG minimal : en-tête SOI + SOF0 de 794 × 1123, ce que lit dimensionsJpeg)
const jpeg = (l, h) => Uint8Array.from([0xff, 0xd8, 0xff, 0xc0, 0, 17, 8, h >> 8, h & 255, l >> 8, l & 255, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1, 0xff, 0xd9])
const faussePage = { octets: jpeg(794, 1123), largeur: 794, hauteur: 1123 }
const rendu = {
  async rendre(doc) {
    return { pdfs: doc.formats.map(f => ({ format: f.format, octets: new TextEncoder().encode(`%PDF ${f.html.length}`), nbPages: 1 })), pages: [faussePage] }
  },
  async reduire(octets) { return octets },
  async fermer() {},
}

console.log('Registres → fiches')
const sans = await fichesDesRegistres()
verifier(sans.every(f => !f.meta.exemple), `sans --avec-exemples : aucune entrée d'exemple (${sans.length} fiche(s))`)
const fiches = await fichesDesRegistres({ avecExemples: true })
const slugs = fiches.map(f => f.meta.slug)
verifier(fiches.length > 0 && new Set(slugs).size === slugs.length, `${fiches.length} fiches d'exemple, slugs uniques`)
verifier(fiches.every(f => f.meta.exemple), 'les entrées d\'exemple sont marquées `exemple`')
verifier(fiches.every(f => f.meta.niveaux.every(n => NIVEAUX.includes(n))), 'niveaux = classes valides')
verifier(fiches.some(f => f.meta.genre === 'affiche') && fiches.some(f => f.meta.genre === 'exercice'), 'une affiche et un exercice au moins')
verifier(fiches.some(f => f.meta.parent) && fiches.filter(f => f.meta.parent).every(f => slugs.includes(f.meta.parent)), 'une fiche par compétence a son bilan pour parent')
const ex = fiches.find(f => f.documents.length > 1)
verifier(ex && new Set(ex.documents.map(d => d.graine)).size === ex.documents.length, 'les fiches d\'un exercice ont des graines différentes')
const encore = await fichesDesRegistres({ avecExemples: true })
verifier(JSON.stringify(encore.map(f => f.documents.map(d => d.formats))) === JSON.stringify(fiches.map(f => f.documents.map(d => d.formats))), 'HTML identique d\'un appel à l\'autre (graines fixes)')
verifier((await fichesDesRegistres({ avecExemples: true, prefixe: 'affiche-' })).every(f => f.meta.slug.startsWith('affiche-')), '--prefixe filtre par slug')
verifier(fiches.filter(f => f.meta.genre === 'exercice').every(f => f.documents.every(d => d.formats[0].html.includes('class="corrige sur-page"'))), 'les fiches d\'exercice ont le corrigé sur une autre page')

console.log('Assemblage et écriture')
const rendues = await produire(fiches, rendu)
const { index, entrees } = assembler(rendues, { site: 'test', genereLe: '2026-10-05T12:00:00.000Z' })
verifier(problemesIndex(index).length === 0, 'index valide')
verifier(index.version === VERSION_SCHEMA && index.entrees.length === fiches.length && entrees.length === fiches.length, 'une entrée par fiche')
verifier(index.entrees.every(e => e.usage === usageDe(e.genre)), 'usage dérivé du genre')
const rangs = index.entrees.map(e => [index.filtres.domaines.findIndex(d => d.id === e.domaine), USAGES.indexOf(e.usage)])
verifier(rangs.every((r, i) => i === 0 || r[0] > rangs[i - 1][0] || (r[0] === rangs[i - 1][0] && r[1] >= rangs[i - 1][1])), 'entrées triées par domaine puis usage')
verifier(index.filtres.classes.every(c => NIVEAUX.includes(c)) && index.filtres.langues[0] === 'fr', 'filtres : classes valides, français d\'abord')
verifier(index.entrees.every(e => !('competences' in e) && !('variantes' in e)), 'l\'index ne contient pas le détail des entrées')
verifier(entrees.every(e => e.voisines.every(s => slugs.includes(s) && s !== e.slug)), 'voisines : des slugs connus, jamais soi-même')
const bilan = entrees.find(e => e.slug === 'exercices-exemple-ce1')
verifier(bilan.voisines.length > 0 && !bilan.voisines.some(s => entrees.find(x => x.slug === s).parent), 'les voisines d\'un bilan sont des fiches autonomes')

const dossier = ecrireFiches(tmp, index, entrees, rendues)
verifier(existsSync(join(dossier, 'index.json')) && entrees.every(e => existsSync(join(dossier, `${e.slug}.json`))), 'fiches/index.json et fiches/<slug>.json écrits')
verifier(entrees.every(e => e.variantes.every(v => v.pdfs.every(p => existsSync(join(dossier, p.chemin))) && v.pages.every(i => existsSync(join(dossier, i.chemin))))), 'chaque PDF et chaque aperçu cité existe')
verifier(entrees.every(e => existsSync(join(dossier, e.miniature.chemin))), 'chaque miniature existe')
const lu = JSON.parse(readFileSync(join(dossier, 'index.json'), 'utf8'))
verifier(lireIndex(lu).entrees.length === index.entrees.length, 'index.json se relit (lireIndex)')
verifier(entrees.every(e => lireEntree(JSON.parse(readFileSync(join(dossier, `${e.slug}.json`), 'utf8'))).slug === e.slug), 'chaque <slug>.json se relit (lireEntree)')
verifier(JSON.stringify(JSON.parse(JSON.stringify(entrees))) === JSON.stringify(entrees), 'données pures : le JSON redonne les mêmes données')
const affiche = entrees.find(e => e.genre === 'affiche')
verifier(affiche.variantes[0].pdfs.length === 2 && affiche.variantes[0].pdfs.map(p => p.format).join() === 'A4,A3', 'une affiche : un PDF par format (A4, A3)')
verifier(!affiche.variantes[0].pdfs.some(p => p.chemin.startsWith('/') || p.chemin.includes('..')), 'chemins relatifs à fiches/')

console.log('Refus des données incohérentes')
const copie = () => structuredClone({ index, entrees })
const refuse = (modifier, motif) => {
  const c = copie(); modifier(c)
  try { validerTout(c.index, c.entrees); verifier(false, `refusé : ${motif}`) } catch (e) { verifier(e instanceof ErreurSchema, `refusé : ${motif}`) }
}
refuse(c => { c.index.entrees[1].slug = c.index.entrees[0].slug }, 'slug en double')
refuse(c => { c.index.entrees[0].niveaux = ['cp2'] }, 'niveau qui n\'est pas une classe')
refuse(c => { c.index.entrees[0].niveaux = [] }, 'aucun niveau')
refuse(c => { c.index.entrees[0].usage = c.index.entrees[0].usage === 'apprendre' ? 'sentrainer' : 'apprendre' }, 'usage différent de celui du genre')
refuse(c => { c.index.entrees.find(e => e.parent).parent = 'inconnu' }, 'parent absent')
refuse(c => { c.index.version = 99 }, 'autre version')
refuse(c => { c.index.entrees[0].titre = { br: 'sans français' } }, 'titre sans français')
refuse(c => { c.index.entrees[0].miniature.chemin = '/absolu.jpg' }, 'chemin absolu')
refuse(c => { c.entrees[0].voisines = ['n-existe-pas'] }, 'voisine inconnue')
refuse(c => { c.entrees[0].variantes = [] }, 'aucune variante')
try { lireIndex({ version: 2 }); verifier(false, 'lireIndex refuse une autre version') } catch (e) { verifier(e instanceof ErreurSchema && /version/.test(e.message), 'lireIndex refuse une autre version') }

console.log('Outils du rendu')
verifier(dimensionsJpeg(jpeg(794, 1123)).largeur === 794 && dimensionsJpeg(jpeg(794, 1123)).hauteur === 1123, 'dimensionsJpeg lit l\'en-tête')
verifier(nbPagesPdf(new TextEncoder().encode('<< /Type /Pages >> << /Type /Page >> << /Type /Page >>')) === 2, 'nbPagesPdf compte /Page, pas /Pages')

console.log('Recherche et filtres')
verifier(normaliser('Écriture Œuf') === 'ecriture oeuf', 'normaliser : accents et ligatures')
verifier(etiquetteClasses(['gs', 'cp'], NIVEAUX) === 'GS · CP' && etiquetteClasses(['ce1', 'ce2', 'cm1'], NIVEAUX) === 'CE1 → CM1' && etiquetteClasses(['cp'], NIVEAUX) === 'CP', 'etiquetteClasses')
const toutes = index.entrees
const racines = toutes.filter(e => e.parent === null)
verifier(filtrer(toutes, CRITERES_VIDES).length === racines.length, 'sans critère : les fiches par compétence sont sur la page de leur bilan')
verifier(filtrer(toutes, { ...CRITERES_VIDES, avecCompetences: true }).length === toutes.length, 'avecCompetences : toutes les entrées')
verifier(filtrer(toutes, { ...CRITERES_VIDES, classe: 'ms' }).every(e => e.niveaux.includes('ms')) && filtrer(toutes, { ...CRITERES_VIDES, classe: 'ms' }).length > 0, 'filtre par classe')
verifier(filtrer(toutes, { ...CRITERES_VIDES, usage: 'apprendre' }).every(e => e.genre === 'affiche'), 'filtre par usage')
verifier(filtrer(toutes, { ...CRITERES_VIDES, langue: 'br' }).every(e => e.langues.includes('br')), 'filtre par langue')
verifier(filtrer(toutes, { ...CRITERES_VIDES, texte: 'BANDE numerique' }).length > 0 && filtrer(toutes, { ...CRITERES_VIDES, texte: 'bande zzz' }).length === 0, 'recherche : sans accents ni casse, tous les mots')
verifier(filtrer(toutes, { ...CRITERES_VIDES, texte: 'dizaines', avecCompetences: true }).some(e => e.parent), 'la recherche trouve une fiche par compétence (libellé du programme)')
verifier(parDomaine(index, racines).every(g => g.entrees.every(e => e.domaine === g.domaine.id)), 'parDomaine range par domaine')

console.log('Chargement (faux fetch)')
const reponse = (corps, { status = 200, type = 'application/json' } = {}) => async () => ({
  ok: status >= 200 && status < 300, status, headers: new Headers({ 'content-type': type }), json: async () => JSON.parse(corps),
})
const etat = async f => (await chargerIndex(f, '/b/')).etat
verifier(await etat(reponse(JSON.stringify(index))) === 'pret', 'index lu')
verifier(await etat(reponse('', { status: 404 })) === 'absent', '404 : index absent')
verifier(await etat(reponse('<html>', { type: 'text/html' })) === 'absent', 'réponse HTML (serveur de développement) : index absent')
verifier(await etat(reponse('pas du json')) === 'erreur', 'JSON illisible : erreur')
verifier(await etat(reponse(JSON.stringify({ ...index, version: 99 }))) === 'erreur', 'autre version : erreur')
verifier(await etat(reponse('', { status: 500 })) === 'erreur', 'HTTP 500 : erreur')
verifier(await etat(async () => { throw new Error('réseau') }) === 'erreur', 'réseau en panne : erreur')
verifier(urlFiches('a/b.pdf', '/ecole-primaire/') === '/ecole-primaire/fiches/a/b.pdf', 'urlFiches ajoute la base')
const e1 = await chargerEntree('exercices-exemple-ce1', reponse(JSON.stringify(bilan)), '/b/')
verifier(e1.etat === 'pret' && e1.donnees.slug === 'exercices-exemple-ce1', 'entrée lue')
let demandee = ''
await chargerEntree('a b', async u => { demandee = u; return reponse('', { status: 404 })() }, '/b/')
verifier(demandee === '/b/fiches/a%20b.json', 'le slug est encodé dans l\'adresse')

console.log('Composable de la page')
const attendre = async cond => { for (let i = 0; i < 50 && !cond(); i++) await new Promise(r => setTimeout(r, 5)); await nextTick() }
{
  oublierIndex()
  const f = useFiches({ chercher: reponse(JSON.stringify(index)) })
  verifier(f.etat.value.etat === 'chargement', 'chargement au départ')
  await attendre(() => f.etat.value.etat !== 'chargement')
  verifier(f.etat.value.etat === 'pret' && f.index.value.entrees.length === toutes.length && !f.vide.value, 'index prêt')
  verifier(f.resultats.value.length === racines.length, 'résultats = fiches autonomes et bilans')
  f.criteres.classe = 'ms'
  verifier(f.filtre.value && f.resultats.value.every(e => e.niveaux.includes('ms')), 'un critère filtre et `filtre` le dit')
  f.criteres.texte = 'zzzz'
  verifier(f.resultats.value.length === 0 && f.groupes.value.length === 0, 'aucun résultat : liste vide')
  f.effacer()
  verifier(!f.filtre.value && f.resultats.value.length === racines.length, 'effacer remet tout')
  verifier(f.entreeDe('exercices-exemple-ce1')?.slug === 'exercices-exemple-ce1' && f.entreeDe('nope') === undefined, 'entreeDe')
}
{
  const f = useFiches({ chercher: reponse(JSON.stringify(index)), visible: e => !e.langues.includes('br') })
  await attendre(() => f.etat.value.etat === 'pret')
  verifier(f.resultats.value.every(e => !e.langues.includes('br')) && f.nbMasquees.value > 0, 'visible cache les fiches (ex. langue régionale inactive) et les compte')
}
{
  const f = useFiches({ chercher: reponse(JSON.stringify({ ...index, entrees: [], filtres: { classes: [], langues: [], usages: [], domaines: [] } })) })
  await attendre(() => f.etat.value.etat === 'pret')
  verifier(f.vide.value && f.resultats.value.length === 0, 'site sans entrée : « vide », pas une erreur')
}
{
  const f = useFiches({ chercher: reponse('', { status: 404 }) })
  await attendre(() => f.etat.value.etat !== 'chargement')
  verifier(f.etat.value.etat === 'absent' && f.index.value === null, 'index absent : état « absent »')
}
{
  const fiche = useFiche(() => 'exercices-exemple-ce1', { chercher: reponse(JSON.stringify(bilan)) })
  await attendre(() => fiche.etat.value.etat !== 'chargement')
  verifier(fiche.entree.value?.slug === 'exercices-exemple-ce1', 'useFiche charge l\'entrée')
}

console.log('Jamais d\'exemples en production')
const commande = spawnSync(process.execPath, ['scripts/fiches/commande.ts', '--avec-exemples', '--outDir', join(tmp, 'prod')], { cwd: racine, encoding: 'utf8' })
verifier(commande.status !== 0 && /production/.test(commande.stderr), 'la commande refuse --avec-exemples sans mode de développement')

rmSync(tmp, { recursive: true, force: true })
process.exit(nbEchecs() ? 1 : 0)

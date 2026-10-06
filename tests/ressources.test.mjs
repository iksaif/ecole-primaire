// Catalogue de ressources, filtres et chargement (node, sans Chrome) : sources = les exemples + un index de fiches factices.
import { spawnSync } from 'node:child_process'
import { construireCatalogue, ressourcesCompetences, domaineDes } from '../src/ressources/catalogue.ts'
import { filtrerParClasses, filtrerParMode, languesUtilisables, grouperParDomaine, domainesDe, voisines, ressourcesDeCompetence, competencesVoisines } from '../src/ressources/filtres.ts'
import { texteDe } from '../src/ressources/textes.ts'
import { creerRessources } from '../src/ressources/useRessources.ts'
import { EMOJI_DOMAINE } from '../src/ressources/emojis.ts'
import { COMPETENCES, DOMAINES, MATIERES, competenceDe } from '../src/data/programme.ts'
import { NIVEAUX, CYCLE_DE } from '../src/data/classes.ts'
import { catalogueDeTest, sources, FICHES, SITE_FR, SITE_BR } from './donnees-ressources.mjs'
import { REGISTRE as EXERCICES } from '../src/exercices/index.ts'
import { verifier, nbEchecs } from './outils.mjs'

const ids = c => c.map(r => r.id)
const sansDoublon = l => new Set(l).size === l.length
const parId = (c, id) => c.find(r => r.id === id)

console.log('Catalogue')
const C = catalogueDeTest()
verifier(sansDoublon(ids(C)), 'aucun doublon d’id')
verifier(C.every(r => r.id.startsWith(`${r.type}:`)), 'id = <type>:<identifiant>')
verifier(['exercice', 'affiche', 'fiche'].every(t => C.some(r => r.type === t)), 'exercices, affiches et fiches prêtes')
const ex = parId(C, 'exercice:exemple'), exc = parId(C, 'exercice:exemple-corpus')
verifier(ex && exc, 'les exercices d’exemple sont au catalogue (développement)')
verifier(ex.badges.jeu && ex.badges.imprimable, 'un exercice et son générateur de fiche : UNE ressource à deux badges')
verifier(ex.classes.join() === 'cp,ce1,ce2' && exc.classes.join() === 'ce1,ce2,cm1', 'classes = niveaux de l’exercice, dans l’ordre de l’école')
verifier(ex.competences.join() === 'exemple-compter,exemple-regle' && ex.matiere === 'maths' && ex.domaine === 'exemple', 'compétences en union ; matière et domaine dérivés du programme')
verifier(ex.usage === 'sentrainer' && exc.langues.join() === 'fr' && ex.langues.join() === 'fr,br', 'usage ; exercice de français : français seul ; sinon langues des textes')
verifier(ex.route === '/dev/exemple' && ex.exemple === true, 'route de la définition ; marqué exemple')
const af = parId(C, 'affiche:exemple')
verifier(af && af.badges.jeu === false && af.badges.imprimable && af.usage === 'apprendre' && af.classes.join() === 'ms,gs', 'affiche : classes des variantes en union, à apprendre, imprimable')
verifier(af.route === '/dev/affiches?affiche=exemple' && af.langues.join() === 'fr,br', 'affiche : route du formulaire, langues')

console.log('Registre réel : calcul mental')
{
  const reel = construireCatalogue({ exercices: EXERCICES, affiches: [], fiches: null, site: SITE_BR, enDeveloppement: false })
  const calcul = parId(reel, 'exercice:calcul-mental')
  verifier(calcul && calcul.matiere === 'maths' && calcul.domaine === 'nombres-calcul' && calcul.exemple === false, 'calcul mental : au catalogue de /maths, domaine nombres-calcul, pas un exemple')
  verifier(calcul.badges.jeu && calcul.badges.imprimable && calcul.classes.join() === 'cp,ce1,ce2,cm1,cm2' && calcul.route === '/maths/calcul-mental', 'calcul mental : badges en ligne et imprimable, cinq classes, route')
  verifier(texteDe(calcul.titre, 'fr') === 'Calcul mental' && texteDe(calcul.titre, 'br') === 'Jediñ e penn', 'calcul mental : titre dans chaque langue')
  verifier(!reel.some(r => r.exemple), 'en production : aucun exemple au catalogue')
}

console.log('Textes (clés, pas de texte en dur)')
verifier(C.filter(r => r.type === 'exercice').every(r => 'cle' in r.titre), 'titre d’un exercice : clé de l’interface')
verifier(texteDe(ex.titre, 'fr') === 'Suites de nombres' && texteDe(ex.titre, 'br') === 'Heuliadoù niveroù', 'titre d’exercice dans chaque langue')
verifier(texteDe(af.titre, 'fr') === 'La bande numérique' && texteDe(af.titre, 'br') === 'Ar vandenn niveroù', 'titre d’affiche dans chaque langue')
verifier(ex.description === null && af.description === null, 'pas de description inventée')
const f1 = parId(C, 'fiche:numeration-cp')
verifier(texteDe(f1.titre, 'br') === 'Fichenn numeration-cp' && texteDe(f1.description, 'br') === 'Description de numeration-cp', 'fiche : titre de l’index (repli sur le français)')
verifier(C.every(r => r.emoji === EMOJI_DOMAINE[r.domaine]), 'emoji du domaine')
let erreurDeclaration = ''
try { construireCatalogue(sources({ exercices: [{ ...ex0(), definition: { ...ex0().definition, id: 'sans-texte' } }] })) } catch (e) { erreurDeclaration = String(e.message) }
function ex0() { return sources().exercices.find(e => e.definition.id === 'exemple') }
verifier(erreurDeclaration.includes('sansTexte.titre'), 'une section de textes manquante est une erreur de déclaration claire')

console.log('Fiches prêtes')
verifier(!!parId(C, 'fiche:exercices-exemple-ce1') && !!parId(C, 'fiche:exercices-exemple-ce1-regle'), 'bilan et fiche de compétence')
verifier(parId(C, 'fiche:exercices-exemple-ce1-regle').parent === 'exercices-exemple-ce1' && parId(C, 'fiche:exercices-exemple-ce1').parent === null, 'parent conservé')
verifier(parId(C, 'fiche:exercices-exemple-ce1-regle').competences.join() === 'exemple-regle', 'compétence d’une fiche retrouvée par le slug')
verifier(parId(C, 'fiche:exercices-exemple-ce1').competences.join() === 'exemple-compter,exemple-regle', 'compétences du bilan = celles du niveau')
verifier(parId(C, 'fiche:exercices-exemple-ce1-br').competences.join() === 'exemple-compter,exemple-regle', 'suffixe de langue (-br) ignoré')
verifier(parId(C, 'fiche:affiche-exemple-jusqua6-fr-br').competences.join() === 'exemple-lire', 'suffixe -fr-br : compétences de l’affiche')
verifier(parId(C, 'fiche:numeration-cp').competences.length === 0 && parId(C, 'fiche:numeration-cp').domaine === 'nombres-calcul', 'fiche inconnue des registres : sans compétence, domaine de l’index')
verifier(parId(C, 'fiche:numeration-cp').route === '/telechargements/numeration-cp/', 'route /telechargements/<slug>/')
verifier(!parId(C, 'fiche:culture-generale'), 'fiche hors programme (domaine null) : pas au catalogue')
verifier(!parId(C, 'fiche:langue-inconnue'), 'fiche dans une langue absente du site : écartée')
verifier(parId(C, 'fiche:numeration-cp').matiere === 'maths' && parId(C, 'fiche:lecture-gs').matiere === 'francais' && parId(C, 'fiche:vivant-ps').matiere === 'monde', 'matière du domaine (maths, français, monde)')

console.log('Filtrage par site, développement, doublons')
const sansIndex = construireCatalogue(sources({ fiches: null }))
verifier(sansIndex.length > 0 && sansIndex.every(r => r.type !== 'fiche'), 'index absent : exercices et affiches seulement')
const prod = construireCatalogue(sources({ enDeveloppement: false }))
verifier(prod.every(r => !r.exemple) && !prod.some(r => r.domaine === 'exemple'), 'hors développement : aucun exemple (entrée marquée ou domaine fictif)')
verifier(prod.some(r => r.id === 'fiche:numeration-cp') && !prod.some(r => r.id === 'fiche:exemple-declare'), 'hors développement : les fiches réelles restent, la fiche marquée exemple part')
const siteFr = construireCatalogue(sources({ site: SITE_FR }))
verifier(siteFr.every(r => r.langues.join() === 'fr') && !siteFr.some(r => r.id === 'fiche:lecture-gs'), 'site français seul : langues restreintes, fiches en breton écartées')
verifier(!siteFr.some(r => r.id === 'fiche:affiche-exemple-jusqua6-fr-br'), 'fiche bilingue écartée si une de ses langues n’est pas au site')
const double = construireCatalogue(sources({ exercices: [...sources().exercices, ...sources().exercices], affiches: [...sources().affiches, ...sources().affiches] }))
verifier(double.length === C.length, 'dédoublonnage : une ressource une fois')
// production réelle : un autre processus avec EP_PROD=1 (les exemples ne sont pas chargés), même avec un index d’exemples
const sonde = `
import { REGISTRE as exercices } from './src/exercices/index.ts'
import { REGISTRE as affiches } from './src/affiches/index.ts'
import { construireCatalogue, ressourcesCompetences } from './src/ressources/catalogue.ts'
import { SITES } from './src/sites.ts'
const fiches = { version: 1, genereLe: '', site: 'x', filtres: {}, entrees: [{ slug: 'x', titre: { fr: 'x' }, description: { fr: 'x' }, niveaux: ['cp'], domaine: 'exemple', usage: 'sentrainer', langues: ['fr'], parent: null, exemple: true }] }
const c = construireCatalogue({ exercices, affiches, fiches, site: SITES.ecoleprimaire, enDeveloppement: false })
console.log(JSON.stringify({ n: c.length, exemples: c.filter(r => r.exemple).length, competencesExemple: ressourcesCompetences(false).filter(r => r.exemple).length }))`
const r = spawnSync(process.execPath, ['--input-type=module', '-e', sonde], { env: { ...process.env, EP_PROD: '1' }, encoding: 'utf8' })
let prodReel = null
try { prodReel = JSON.parse(r.stdout) } catch { console.log(r.stderr) }
verifier(prodReel && prodReel.exemples === 0 && prodReel.competencesExemple === 0, 'EP_PROD=1 : aucun exemple en production (exercices, affiches, fiches, compétences)')

console.log('Compétences')
const comp = ressourcesCompetences(false), compDev = ressourcesCompetences(true)
verifier(comp.length === COMPETENCES.length && comp.every(r => !r.exemple) && sansDoublon(ids(comp)), 'une ressource par compétence du programme, sans exemple hors développement')
verifier(compDev.length > comp.length && compDev.some(r => r.exemple), 'les compétences fictives seulement en développement')
const k0 = comp[0]
verifier(k0.route === `/competence/${COMPETENCES[0].id}` && k0.classes.join() === NIVEAUX.filter(n => COMPETENCES[0].niveaux.includes(n)).join() && texteDe(k0.titre, 'br') === COMPETENCES[0].libelle, 'compétence : route, classes dans l’ordre, libellé officiel (français)')
verifier(comp.every(r => r.matiere === DOMAINES.find(d => d.id === r.domaine).matiere), 'matière dérivée du domaine')
verifier(domaineDes(['exemple-compter'], null) === 'exemple' && domaineDes([], 'lecture') === 'lecture' && domaineDes([], null) === null, 'domaineDes : compétences, sinon domaine déclaré')
verifier(domaineDes(['denombrer-6', COMPETENCES.find(k => k.domaine === 'lecture').id], 'lecture') === 'lecture' && domaineDes([COMPETENCES.find(k => k.domaine === 'lecture').id, 'denombrer-6'], null) === 'lecture', 'domaines mêlés : le déclaré, sinon celui de la première compétence')

console.log('Filtres : classes et mode')
const dedans = filtrerParClasses(C, ['cp', 'ce1'])
verifier(dedans.every(r => r.classes.some(c => ['cp', 'ce1'].includes(c))) && sansDoublon(ids(dedans)), 'union des classes, une ressource multi-classes une seule fois')
verifier(C.filter(r => r.classes.some(c => ['cp', 'ce1'].includes(c))).length === dedans.length, 'aucune ressource oubliée')
verifier(filtrerParClasses(C, []).length === C.length && filtrerParClasses(C, NIVEAUX).length === C.length, 'aucune classe : toutes')
verifier(filtrerParClasses(C, ['cm2']).length === 0, 'une classe sans ressource : vide')
verifier(languesUtilisables('fr', 'br').join() === 'fr' && languesUtilisables('bilingue', 'br').join() === 'fr,br' && languesUtilisables('regionale', 'br').join() === 'br' && languesUtilisables('regionale', null).join() === 'fr', 'langues utilisables par mode')
verifier(filtrerParMode(C, 'fr', 'br').every(r => r.langues.includes('fr')), 'mode fr : ressources utilisables en français')
verifier(filtrerParMode(C, 'regionale', 'br').every(r => r.langues.includes('br')) && !filtrerParMode(C, 'regionale', 'br').includes(exc), 'mode régional : en breton seulement (un exercice de français n’y est pas)')
verifier(filtrerParMode(C, 'bilingue', 'br').length === C.length, 'mode bilingue : tout ce qui est en français ou en breton')
verifier(filtrerParMode(C, 'bilingue', null).length === filtrerParMode(C, 'fr', null).length, 'sans langue régionale : comme le français')

console.log('Groupes par domaine')
const sousEnsembles = [[], ['ps'], ['gs'], ['cp'], ['ce1', 'ce2'], ['cm1'], ['cm2'], ['ms', 'cp'], [...NIVEAUX]]
const rangs = new Map(DOMAINES.map((d, i) => [d.id, i]))
let propsOk = true, ordreOk = true, cycleOk = true, couvert = true, sommeOk = true, replieOk = true
const raison = []
for (const matiere of MATIERES) {
  for (const classes of sousEnsembles) {
    const G = grouperParDomaine(C, { matiere, classes })
    const attendus = DOMAINES.filter(d => d.matiere === matiere && (!classes.length || d.cycles.some(c => classes.some(n => CYCLE_DE[n] === c)))).map(d => d.id)
    const reels = G.map(g => g.domaine).filter(d => d !== 'exemple')
    if (reels.join() !== attendus.join()) { cycleOk = false; raison.push(`${matiere}/${classes}: ${reels} ≠ ${attendus}`) }
    if (G.map(g => rangs.get(g.domaine) ?? 999).some((x, i, l) => i && x < l[i - 1])) ordreOk = false
    const dansLaMatiere = C.filter(r => r.matiere === matiere && G.some(g => g.domaine === r.domaine))
    const vus = G.flatMap(g => g.ressources)
    if (!sansDoublon(ids(vus))) propsOk = false
    if (G.reduce((n, g) => n + g.ressources.length + g.horsClasse, 0) !== dansLaMatiere.length) sommeOk = false
    for (const g of G) {
      if (g.apprendre.length + g.sentrainer.length !== g.ressources.length) propsOk = false
      if (g.replie !== (g.ressources.length === 0)) replieOk = false
      if (!g.ressources.every(r => r.domaine === g.domaine && r.matiere === matiere)) propsOk = false
    }
    // toute ressource de la matière qui concerne les classes choisies est dans un groupe (le programme ne la perd pas)
    const attenduesVisibles = filtrerParClasses(C.filter(r => r.matiere === matiere), classes)
    if (attenduesVisibles.length !== vus.length) { couvert = false; raison.push(`${matiere}/${classes}: ${attenduesVisibles.length} ≠ ${vus.length}`) }
    if (JSON.stringify(G) !== JSON.stringify(grouperParDomaine(C, { matiere, classes }))) propsOk = false
  }
}
if (raison.length) console.log(raison.join('\n'))
verifier(cycleOk, 'domaines dérivés du programme par matière et par cycle (rien d’inventé, rien d’oublié)')
verifier(ordreOk, 'ordre du programme')
verifier(sommeOk, 'ressources de la classe + hors classe = total du domaine, pour chaque matière et chaque choix de classes')
verifier(couvert, 'toute ressource des classes choisies est dans un groupe')
verifier(propsOk, 'pas de doublon, apprendre + s’entraîner = ressources, résultat stable')
verifier(replieOk, 'replié = aucune ressource pour les classes (le domaine n’est jamais masqué)')
const fr1 = grouperParDomaine(C, { matiere: 'francais', classes: ['ps'] }).map(g => g.domaine)
verifier(!fr1.includes('vocabulaire') && !fr1.includes('grammaire') && fr1.includes('lecture'), 'cycle 1 : le français n’a ni Vocabulaire ni Grammaire')
verifier(!grouperParDomaine(C, { matiere: 'maths', classes: ['cp'] }).some(g => g.domaine === 'pensee-informatique') && grouperParDomaine(C, { matiere: 'maths', classes: ['cm1'] }).some(g => g.domaine === 'pensee-informatique'), 'maths : pensée informatique au cycle 3 seulement')
const m = grouperParDomaine(C, { matiere: 'maths', classes: ['cp'] }).find(g => g.domaine === 'nombres-calcul')
verifier(m.ressources.length === 2 && m.horsClasse === 2 && !m.replie, 'maths CP : deux ressources (une fiche, une fiche marquée exemple), deux hors classe annoncées')
const mCm = grouperParDomaine(C, { matiere: 'maths', classes: ['cm2'] }).find(g => g.domaine === 'nombres-calcul')
verifier(mCm.ressources.length === 0 && mCm.horsClasse === 4 && mCm.replie, 'maths CM2 : domaine replié, 4 hors classe (pas masqué)')
verifier(grouperParDomaine(C, { matiere: 'regionale', classes: [] }).length === 0 && domainesDe('monde', ['ps']).some(d => d.id === 'vivant'), 'matière régionale : aucun domaine au programme ; le monde au cycle 1')
const avant = JSON.stringify(C); grouperParDomaine(C, { matiere: 'maths', classes: ['cp'] }); filtrerParClasses(C, ['cp'])
verifier(JSON.stringify(C) === avant, 'les arguments ne sont pas modifiés')

console.log('Voisines')
const vEx = voisines(ex, C)
verifier(!vEx.includes(ex) && sansDoublon(ids(vEx)), 'sans elle-même ni doublon')
const iAvecComp = vEx.findIndex(r => r.competences.some(k => ex.competences.includes(k))), iSansComp = vEx.findIndex(r => !r.competences.some(k => ex.competences.includes(k)))
verifier(vEx.length > 0 && iAvecComp === 0 && vEx.slice(0, vEx.filter(r => r.competences.some(k => ex.competences.includes(k))).length).every(r => r.competences.some(k => ex.competences.includes(k))), 'même compétence d’abord')
verifier(iSansComp === -1 || vEx.slice(iSansComp).every(r => r.domaine === ex.domaine && !r.competences.some(k => ex.competences.includes(k))), 'puis le même domaine')
verifier(voisines(ex, C, 2).length === 2 && voisines(ex, C, 2).join() === vEx.slice(0, 2).join(), 'limite')
const n1 = parId(C, 'fiche:numeration-cp')
verifier(voisines(n1, C).some(r => !r.classes.includes('cp')), 'la classe n’entre pas en compte')
verifier(voisines(n1, C).map(r => r.id).join() === 'fiche:numeration-ce1-ce2,fiche:fractions-cm1,fiche:exemple-declare', 'sans compétence : le même domaine, ordre du catalogue')
verifier(ressourcesDeCompetence(C, 'exemple-regle').every(r => r.competences.includes('exemple-regle')) && ressourcesDeCompetence(C, 'exemple-regle').length >= 2, 'ressourcesDeCompetence')
const kv = competencesVoisines(COMPETENCES[0].id)
verifier(kv.length > 0 && !kv.includes(COMPETENCES[0].id) && kv.every(k => competenceDe(k).domaine === COMPETENCES[0].domaine) && competencesVoisines('inconnue').length === 0, 'competencesVoisines : même domaine, sans elle-même')

console.log('useRessources (faux fetch)')
const attendre = async cond => { for (let i = 0; i < 100 && !cond(); i++) await new Promise(ok => setTimeout(ok, 5)) }
const reponse = (corps, { status = 200, type = 'application/json' } = {}) => async () => ({ ok: status < 400, status, headers: { get: () => type }, json: async () => corps })
const registres = { exercices: sources().exercices, affiches: sources().affiches }
const avecIndex = creerRessources({ chercher: reponse(FICHES), registres, site: sources().site, enDeveloppement: true })
await attendre(() => avecIndex.fiches.value.etat === 'pret' && avecIndex.pret.value)
verifier(avecIndex.pret.value && avecIndex.catalogue.value.length === C.length, 'index présent : catalogue complet')
const absent = creerRessources({ chercher: reponse({}, { status: 404 }), registres, site: sources().site, enDeveloppement: true })
await attendre(() => absent.fiches.value.etat !== 'chargement' && absent.pret.value)
verifier(absent.fiches.value.etat === 'absent' && absent.catalogue.value.length === sansIndex.length, 'index absent (404) : état « absent », catalogue des exercices et affiches')
const html = creerRessources({ chercher: reponse({}, { type: 'text/html' }), registres, site: sources().site, enDeveloppement: true })
await attendre(() => html.fiches.value.etat !== 'chargement')
verifier(html.fiches.value.etat === 'absent', 'réponse HTML d’un serveur de développement : absent')
const casse = creerRessources({ chercher: reponse({ version: 99 }), registres, site: sources().site, enDeveloppement: true })
await attendre(() => casse.fiches.value.etat !== 'chargement' && casse.pret.value)
verifier(casse.fiches.value.etat === 'erreur' && casse.catalogue.value.length === sansIndex.length, 'index illisible : état « erreur », le catalogue reste')
const panne = creerRessources({ chercher: async () => { throw new Error('réseau') }, registres, site: sources().site, enDeveloppement: true })
await attendre(() => panne.fiches.value.etat !== 'chargement' && panne.pret.value)
verifier(panne.fiches.value.etat === 'erreur' && panne.catalogue.value.length === sansIndex.length, 'réseau en panne : état « erreur », le catalogue reste')
const vide = creerRessources({ chercher: reponse(FICHES), registres: { exercices: [], affiches: [] }, site: sources().site, enDeveloppement: false })
await attendre(() => vide.fiches.value.etat === 'pret' && vide.pret.value)
verifier(vide.catalogue.value.every(r => r.type === 'fiche' && !r.exemple), 'registres vides (production sans exercice reporté) : les fiches seules')

process.exit(nbEchecs() ? 1 : 0)

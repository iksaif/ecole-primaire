// Contexte (node, sans Chrome) : adresses (lecture, écriture, aller-retour), liens à partager, règles de profil, défauts par
// site, migration des anciens réglages, état partagé (routeur en mémoire), routes (titres, exercices) et redirection `#/…`.
//   node tests/contexte.test.mjs
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { NIVEAUX } from '../src/data/classes.ts'
import { SITES } from '../src/sites.ts'
import { lireContexteDeLAdresse, ecrireContexteDansLAdresse, fusionnerParamsContexte, extraireParamsContexte, sansContexte, chaineDeQuery } from '../src/contexte/url.ts'
import { defautsContexte, classesPourProfil, classesMigrees, modeMigre, modeDuSite, profilsProposes, profilEffectif } from '../src/contexte/regles.ts'
import { demandeDeLAdresse, changerModeEnseignant } from '../src/contexte/enseignant.ts'
import { lienPourLesFamilles, lienDuTableau } from '../src/contexte/partage.ts'
import { verifier, nbEchecs } from './outils.mjs'

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b)
const E = SITES.ecoleprimaire, S = SITES.skoolik
const DE = defautsContexte(E), DS = defautsContexte(S)
// un site fictif avec deux langues régionales (le code ne doit pas supposer le breton seul)
const DEUX = { ...DE, languesRegionales: ['br', 'fr'], regionale: 'br' }

console.log('Défauts par site')
verifier(DE.mode === 'fr' && DE.regionale === null && egal(DE.classes, ['ce1']), 'ecoleprimaire : français seul, classe de départ ce1')
verifier(DS.mode === 'bilingue' && DS.regionale === 'br', 'skoolik : bilingue, breton')
verifier(modeDuSite(E) === 'fr' && modeDuSite(S) === 'bilingue', 'modeDuSite')
verifier(egal(defautsContexte(E, { classes: ['cm1'], mode: null, regionale: null, vue: 'liste', refs: true }).classes, ['cm1']) && defautsContexte(E, { classes: null, mode: 'bilingue', regionale: null, vue: null, refs: null }).mode === 'bilingue', 'un réglage mémorisé passe devant le défaut du site')
verifier(defautsContexte({ ...E, languesRegionales: [], langueRegionale: '' }, { classes: null, mode: 'regionale', regionale: null, vue: null, refs: null }).mode === 'fr', 'un site sans langue régionale reste en français seul')

console.log('Adresse : lecture')
const lire = (q, d = DE) => lireContexteDeLAdresse(q, d)
verifier(egal(lire({}), { classes: ['ce1'], mode: 'fr', regionale: null, vue: 'cartes', refs: false }), 'adresse vide : défauts')
verifier(egal(lire({ classes: 'ce2,ce1,ce2' }).classes, ['ce1', 'ce2']), 'classes triées de PS à CM2, sans doublon')
verifier(egal(lire({ classes: 'CM2,ps' }).classes, ['ps', 'cm2']), 'classes : majuscules acceptées')
verifier(egal(lire({ classes: 'x,,6e' }).classes, ['ce1']) && egal(lire({ classes: '' }).classes, ['ce1']), 'classes invalides : défaut')
verifier(egal(lire({ classes: 'x,cp' }).classes, ['cp']), 'une classe invalide est ignorée, les autres restent')
verifier(lire({ mode: 'bi' }).mode === 'bilingue' && lire({ mode: 'bi' }).regionale === 'br', 'mode=bi : bilingue, breton (première langue proposée)')
verifier(lire({ mode: 'reg' }).mode === 'regionale' && lire({ mode: 'fr' }, DS).regionale === null, 'mode=reg ; mode=fr : pas de langue régionale')
verifier(lire({ mode: 'zz' }).mode === 'fr' && lire({ mode: 'imprimer' }, DS).mode === 'bilingue', 'mode invalide (ou ?mode=imprimer d’un exercice) : défaut')
verifier(lire({ mode: 'bi', reg: 'fr' }, DEUX).regionale === 'fr' && lire({ mode: 'bi', reg: 'xx' }, DEUX).regionale === 'br', 'reg : accepté si le site la propose, sinon défaut')
verifier(lire({ vue: 'liste' }).vue === 'liste' && lire({ vue: 'x' }).vue === 'cartes', 'vue')
verifier(lire({ refs: '1' }).refs === true && lire({ refs: '0' }, { ...DE, refs: true }).refs === false && lire({ refs: 'oui' }).refs === false, 'refs')
verifier(egal(lire({ classes: ['ce2', 'cp'] }).classes, ['ce2']) && egal(lire({ classes: null }).classes, ['ce1']), 'valeur multiple ou vide d’un paramètre : sans exception')
verifier(egal(lire({ classes: 'cm1' }, defautsContexte(E, { classes: ['cp'], mode: null, regionale: null, vue: null, refs: null })).classes, ['cm1']), 'l’adresse passe devant le réglage mémorisé')

console.log('Adresse : écriture')
const ecrire = (c, d = DE) => ecrireContexteDansLAdresse(c, d)
verifier(egal(ecrire(lire({})), {}), 'tout par défaut : aucune paramètre')
verifier(egal(ecrire({ ...lire({}), classes: ['ce2', 'ce1'] }), { classes: 'ce1,ce2' }), 'classes écrites triées')
verifier(egal(ecrire(lire({ mode: 'bi' })), { mode: 'bi' }) && egal(ecrire(lire({ mode: 'fr' }, DS), DS), { mode: 'fr' }), 'mode : écrit seulement s’il diffère du défaut du site')
verifier(!('reg' in ecrire(lire({ mode: 'bi' }))), 'reg : pas écrit quand le site n’a qu’une langue régionale')
verifier(egal(ecrire(lire({ mode: 'bi', reg: 'fr' }, DEUX), DEUX), { mode: 'bi', reg: 'fr' }) && !('reg' in ecrire(lire({ mode: 'bi' }, DEUX), DEUX)), 'reg : écrit seulement s’il y a plusieurs langues et qu’elle diffère')
verifier(egal(ecrire({ ...lire({}), vue: 'liste', refs: true }), { vue: 'liste', refs: '1' }), 'vue et refs')

console.log('Adresse : propriétés')
{
  // toutes les parties non vides de NIVEAUX × modes × vues × refs, sur plusieurs défauts : lire(écrire(x)) = x
  const parties = []
  for (let m = 1; m < 1 << NIVEAUX.length; m++) parties.push(NIVEAUX.filter((_, i) => m >> i & 1))
  const defauts = [DE, DS, DEUX, { ...DEUX, mode: 'regionale', regionale: 'fr' }, { ...DE, classes: ['cp', 'ce1'], vue: 'liste', refs: true }, { ...DE, classes: [] }]
  let n = 0, ko = 0
  for (const d of defauts) for (const classes of parties) for (const mode of ['fr', 'bilingue', 'regionale']) for (const vue of ['cartes', 'liste']) for (const refs of [false, true]) for (const regionale of mode === 'fr' ? [null] : d.languesRegionales) {
    const x = { classes, mode, regionale, vue, refs }
    n++
    if (!egal(lire(ecrire(x, d), d), x)) ko++
  }
  verifier(ko === 0, `lire(écrire(x)) = x sur ${n} contextes`)
  // écrire(lire(q)) normalise : lire(écrire(lire(q))) = lire(q), et la sortie est minimale (idempotente)
  const graines = [{}, { classes: 'cm2,ce1,ce1', mode: 'bi', vue: 'liste', refs: '1' }, { classes: 'zz', mode: 'x', reg: 'br', vue: 'y', refs: '2' }, { classes: 'CP , ce2', mode: 'reg' }, { mode: 'fr', reg: 'fr' }]
  let ko2 = 0
  for (const d of [DE, DS, DEUX]) for (const q of graines) {
    const a = lire(q, d), w = ecrire(a, d)
    if (!egal(lire(w, d), a) || !egal(ecrire(lire(w, d), d), w)) ko2++
  }
  verifier(ko2 === 0, 'écrire(lire(q)) normalise (idempotent) pour des adresses fantaisistes')
  // aucune exception, même avec n'importe quoi
  let leve = false
  try { for (const v of [undefined, null, '', 'a,b', ['x'], [null], '%', '__proto__', 'constructor']) lire({ classes: v, mode: v, reg: v, vue: v, refs: v, __proto__: v }) } catch { leve = true }
  verifier(!leve, 'valeurs absurdes : jamais d’exception')
}

console.log('Adresse : fusion avec les autres paramètres')
verifier(egal(fusionnerParamsContexte({ graine: '4', classes: 'cp', vue: 'liste' }, { classes: 'ce2' }), { graine: '4', classes: 'ce2' }), 'remplace les paramètres de contexte, garde les autres')
verifier(egal(fusionnerParamsContexte({ mode: 'imprimer' }, { mode: 'bi' }), { mode: 'imprimer' }), '?mode=imprimer (exercice) n’est pas écrasé par le mode de langue')
verifier(egal(extraireParamsContexte({ mode: 'imprimer', classes: 'cp', graine: '1' }), { classes: 'cp' }) && sansContexte({ mode: 'imprimer', graine: '1' }) && !sansContexte({ vue: 'liste' }), 'extraire / sansContexte')
verifier(chaineDeQuery({ classes: 'ce1,ce2', a: 'x y', b: null, c: ['1', '2'] }) === '?classes=ce1,ce2&a=x%20y&b&c=1&c=2' && chaineDeQuery({}) === '', 'chaîne de requête lisible (virgule gardée)')

console.log('Liens à partager')
const racine = 'https://ecoleprimaire.app/'
const ctx = (extra = {}) => ({ ...lire({}), ...extra })
verifier(lienPourLesFamilles({ path: '/maths' }, ctx(), { racine }) === 'https://ecoleprimaire.app/maths?classes=ce1', 'familles : la classe est toujours écrite')
verifier(lienPourLesFamilles({ path: '/' }, ctx({ classes: ['ce1', 'ce2'], mode: 'bilingue', regionale: 'br', vue: 'liste', refs: true }), { racine }) === 'https://ecoleprimaire.app/?classes=ce1,ce2&mode=bi', 'familles : classes et mode, sans les préférences d’affichage')
verifier(lienPourLesFamilles({ path: '/maths', query: { graine: '7' } }, ctx(), { racine: 'https://iksaif.github.io/ecole-primaire' }) === 'https://iksaif.github.io/ecole-primaire/maths?graine=7&classes=ce1', 'familles : paramètres de la page conservés, racine sans barre finale acceptée')
verifier(lienPourLesFamilles({ path: '/maths' }, lire({ mode: 'fr' }, DS), { racine: 'https://skoolik.app/', site: S }) === 'https://skoolik.app/maths?classes=ce1&mode=fr', 'familles : le mode est comparé aux défauts du SITE (skoolik : fr s’écrit)')
verifier(lienDuTableau({ path: '/programme', query: { domaine: 'nombres' } }, ctx({ classes: ['cp'], vue: 'liste', refs: true }), { racine }) === 'https://ecoleprimaire.app/programme?domaine=nombres&classes=cp&vue=liste&refs=1', 'tableau : tout le contexte et l’état du tableau')

console.log('Règles de profil')
verifier(egal(classesPourProfil('enseignant', ['cm1', 'ce1', 'cm1']), ['ce1', 'cm1']), 'enseignant : plusieurs classes, triées, sans doublon')
verifier(egal(classesPourProfil('parent', ['cm1', 'ce1', 'cm1']), ['ce1', 'cm1']) && egal(classesPourProfil('enfant', ['cm1', 'ce1']), ['ce1']), 'parent : plusieurs classes (plusieurs enfants) ; enfant : une seule (la dernière citée)')
verifier(egal(classesPourProfil('parent', ['zz']), []) && egal(classesPourProfil('enseignant', []), []), 'aucune classe valide : vide')

console.log('Migration des anciens réglages')
verifier(egal(classesMigrees(undefined, 'cp'), ['cp']) && egal(classesMigrees(['cm1', 'ce1'], 'cp'), ['ce1', 'cm1']) && egal(classesMigrees(undefined, ''), []) && egal(classesMigrees('x', 7), []), 'classe → classes')
verifier(modeMigre('') === 'fr' && modeMigre('br') === 'bilingue' && modeMigre(null) === null && modeMigre(undefined) === null, 'langue_regionale → mode')

// ── état partagé : routeur en mémoire, stockage simulé ──
console.log('État partagé (useContexte)')
const stock = new Map()
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
  getItem: k => stock.get(k) ?? null, setItem: (k, v) => { stock.set(k, String(v)) }, removeItem: k => { stock.delete(k) },
} })
const { createRouter, createMemoryHistory } = await import('vue-router')
const { installerContexte, useContexte } = await import('../src/contexte/useContexte.ts')
const { langueImposee } = await import('../src/langues/etat.ts')
const stocke = k => JSON.parse(stock.get(`ep_${k}`) ?? 'null')
async function demarrer(adresse = '/', site = E, memoire = {}) {
  stock.clear()
  for (const [k, v] of Object.entries(memoire)) stock.set(`ep_${k}`, JSON.stringify(v))
  const routeur = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:p(.*)*', component: { render: () => null } }] })
  installerContexte(routeur, site)
  await routeur.push(adresse)
  return { routeur, c: useContexte() }
}
{
  const { routeur, c } = await demarrer()
  verifier(egal(c.contexte.value.classes, ['ce1']) && c.contexte.value.profil === 'parent' && c.contexte.value.mode === 'fr', 'appareil neuf : ce1, parent, français')
  verifier(await c.choisirClasses(['cm2']) && egal(c.contexte.value.classes, ['cm2']) && stocke('classes')[0] === 'cm2' && stocke('classe') === 'cm2', 'choisir une classe : mémorisée (ancienne clé comprise)')
  verifier(routeur.currentRoute.value.fullPath === '/', 'la classe choisie vaut le défaut mémorisé : adresse propre (aucun paramètre)')
  await routeur.push('/maths?classes=cp,ce2')
  verifier(egal(c.contexte.value.classes, ['cp', 'ce2']) && egal(stocke('classes'), ['cm2']), 'une adresse à plusieurs classes s’affiche sans toucher au réglage mémorisé')
  verifier(await c.choisirClasses(['cp', 'cm1']) && egal(c.contexte.value.classes, ['cp', 'cm1']), 'parent : plusieurs classes')
  verifier(await c.ajouterClasse('ce2') && egal(c.contexte.value.classes, ['cp', 'cm1', 'ce2'].sort((a, b) => ['cp','ce1','ce2','cm1','cm2'].indexOf(a) - ['cp','ce1','ce2','cm1','cm2'].indexOf(b))) && await c.retirerClasse('ce2'), 'parent : ajouter et retirer une classe')
  await routeur.push('/maths?classes=cp&vue=liste')
  await c.choisirMode('bilingue')
  verifier(routeur.currentRoute.value.query.classes === 'cp' && routeur.currentRoute.value.query.vue === 'liste' && c.contexte.value.mode === 'bilingue' && stocke('mode') === 'bilingue', 'changer le mode garde les écarts de l’adresse (classes, vue) et mémorise le mode')
  verifier(!('mode' in routeur.currentRoute.value.query), 'le mode choisi devient le défaut : plus dans l’adresse')
  verifier(stocke('vue') === null, 'la vue venue de l’adresse n’est pas mémorisée')
  await c.choisirVue('liste')
  verifier(stocke('vue') === 'liste' && !('vue' in routeur.currentRoute.value.query), 'choisir la vue : mémorisée, adresse propre')
  await c.basculerRefs()
  verifier(c.contexte.value.refs === true && stocke('refs') === true, 'basculer les références')
}
{
  // le mode enseignant est caché par défaut : « enseignant » n'est pas choisissable, et un profil mémorisé retombe sur le défaut
  verifier(egal(profilsProposes(false), ['enfant', 'parent']) && egal(profilsProposes(true), ['enfant', 'parent', 'enseignant']), 'profilsProposes : enseignant seulement si le mode est actif')
  verifier(profilEffectif('enseignant', false) === 'parent' && profilEffectif('enseignant', true) === 'enseignant' && profilEffectif('enfant', false) === 'enfant', 'profilEffectif : enseignant retombe sur parent tant que le mode est caché')
  verifier(demandeDeLAdresse({ enseignant: 'oui' }) === true && demandeDeLAdresse({ enseignant: 'non' }) === false && demandeDeLAdresse({ enseignant: '1' }) === null && demandeDeLAdresse({}) === null, 'demandeDeLAdresse : oui, non, ou rien')
  const cache = await demarrer('/programme')
  cache.c.choisirProfil('enseignant')
  verifier(cache.c.contexte.value.profil === 'parent' && stocke('profil') === null, 'mode caché : choisir « enseignant » est refusé')
  changerModeEnseignant(true)
}
{
  const { routeur, c } = await demarrer('/programme')
  c.choisirProfil('enseignant')
  verifier(c.plusieursClasses.value && stocke('profil') === 'enseignant', 'profil enseignant mémorisé (réglage d’appareil, jamais dans l’adresse)')
  await c.choisirClasses(['ce2', 'cp'])
  verifier(egal(c.contexte.value.classes, ['cp', 'ce2']) && routeur.currentRoute.value.fullPath === '/programme', 'enseignant : plusieurs classes ; adresse propre car mémorisées')
  await c.ajouterClasse('cm1'); await c.retirerClasse('cp')
  verifier(egal(c.contexte.value.classes, ['ce2', 'cm1']), 'ajouter / retirer')
  verifier(!(await c.retirerClasse('ce2').then(() => c.retirerClasse('cm1'))) && egal(c.contexte.value.classes, ['cm1']), 'on ne retire pas la dernière classe')
  await c.choisirClasses(['cp', 'ce1'])
  c.choisirProfil('parent')
  verifier(egal(stocke('classes'), ['cp', 'ce1']) && egal(c.contexte.value.classes, ['cp', 'ce1']), 'passer à parent : les classes sont gardées (plusieurs enfants)')
  c.choisirProfil('enfant')
  verifier(egal(stocke('classes'), ['cp']) && egal(c.contexte.value.classes, ['cp']), 'passer à enfant : une seule classe mémorisée')
  verifier(c.verrouillee.value && !(await c.choisirClasses(['cm2'])) && egal(c.contexte.value.classes, ['cp']), 'enfant : classe verrouillée')
  c.deverrouillerClasse()
  verifier(!c.verrouillee.value && await c.choisirClasses(['cm2']), 'déverrouillée : on peut choisir')
  c.choisirProfil('enfant')
  verifier(c.verrouillee.value, 'changer de profil referme le verrou')
}
{
  let { c } = await demarrer('/', S)
  verifier(c.contexte.value.mode === 'bilingue' && c.contexte.value.regionale === 'br' && !c.modeRegionalSeul.value && langueImposee.value === null, 'skoolik : bilingue d’office, interface non imposée')
  await c.choisirMode('regionale')
  verifier(c.modeRegionalSeul.value && langueImposee.value === 'br' && stocke('langue_interface') === null, 'langue régionale seule : interface imposée dans la langue régionale, sans toucher au réglage')
  await c.choisirMode('fr')
  verifier(c.contexte.value.regionale === null && langueImposee.value === null, 'retour au français : interface rendue')
}
{
  let { c } = await demarrer('/?mode=reg')
  verifier(c.contexte.value.mode === 'regionale' && stocke('mode') === null, 'adresse ?mode=reg : mode actif, réglage mémorisé intact')
  verifier(langueImposee.value === 'br' && stocke('langue_interface') === null, 'ecoleprimaire propose le breton comme interface : imposé par le mode, sans mémorisation')
  const hors = c.contexteDeLAdresse({ query: { classes: 'ps,cm2', mode: 'bi' } })
  verifier(egal(hors.classes, ['ps', 'cm2']) && hors.mode === 'bilingue' && hors.profil === 'parent', 'contexteDeLAdresse(route)')
  verifier(c.lienFamilles().startsWith('https://ecoleprimaire.app/') || c.lienFamilles().includes('classes=ce1'), 'lienFamilles : adresse absolue avec la classe')
  langueImposee.value = null
}
{
  // migration : anciennes clés
  let { c } = await demarrer('/', E, { classe: 'cm1', langue_regionale: 'br' })
  verifier(egal(c.contexte.value.classes, ['cm1']) && c.contexte.value.mode === 'bilingue', 'migration : classe et langue_regionale existantes lues')
  langueImposee.value = null
  ;({ c } = await demarrer('/', S, { langue_regionale: '' }))
  verifier(c.contexte.value.mode === 'fr', 'migration : « aucune langue régionale » choisie sur skoolik = français seul')
  ;({ c } = await demarrer('/', E, { classes: ['zz'], classe: 'ce2', mode: 'nimporte', profil: 'roi', vue: 3, refs: 'oui' }))
  verifier(egal(c.contexte.value.classes, ['ce2']) && c.contexte.value.mode === 'fr' && c.contexte.value.profil === 'parent' && c.contexte.value.vue === 'cartes' && c.contexte.value.refs === false, 'réglages mémorisés corrompus : défauts, sans exception')
}

console.log('Routes')
const { routesDeBase, routesDesExercices } = await import('../src/router/routes.ts')
const { cheminRegional } = await import('../src/router/chemins.ts')
const { titreDeDocument } = await import('../src/router/titres.ts')
{
  const base = routesDeBase(['br'])
  const chemins = base.map(r => r.path)
  verifier(cheminRegional('br') === '/brezhoneg' && chemins.includes('/brezhoneg') && chemins.includes('/maths/fiches') && chemins.includes('/competence/:id'), 'routes de base : matières, langue régionale (chemin lu dans le registre), fiches, compétence')
  verifier(new Set(chemins).size === chemins.length, 'aucune adresse en double')
  verifier(!routesDeBase([]).some(r => r.path === '/brezhoneg'), 'pas de page de langue régionale sur un site qui n’en propose pas')
  const sansTitre = base.filter(r => !r.redirect && !r.meta?.titre && !r.meta?.titreLibre).map(r => r.path)
  verifier(sansTitre.length === 0, `une clé de titre par route${sansTitre.length ? ` (manque : ${sansTitre})` : ''}`)
  const ex = routesDesExercices([{ definition: { route: '/maths/heure' } }, { definition: { route: '/dev/exemple' }, exemple: true }], base)
  verifier(ex.length === 1 && ex[0].path === '/maths/heure' && ex[0].meta?.titre === 'routeur.titre.exercice', 'une route par exercice (les exemples ont leurs routes /dev)')
  let leve = 0
  for (const entrees of [[{ definition: { route: '/maths' } }], [{ definition: { route: '/a' } }, { definition: { route: '/a' } }]]) try { routesDesExercices(entrees, base) } catch { leve++ }
  verifier(leve === 2, 'une adresse d’exercice déjà prise est refusée')
  verifier(titreDeDocument({ titre: 'routeur.titre.maths' }, 'fr', E) === 'Mathématiques — École Primaire', 'titre : « page — site »')
  verifier(titreDeDocument({ titre: 'routeur.titre.maths' }, 'br', S).endsWith(' — Skoolik') && titreDeDocument({ titre: 'routeur.titre.maths' }, 'br', S).startsWith('Jedoniezh'), 'titre en breton selon la langue de l’interface')
  verifier(titreDeDocument({ titreLibre: 'Brezhoneg' }, 'fr', E) === 'Brezhoneg — École Primaire' && titreDeDocument({}, 'fr', E) === E.titre, 'titre libre ; sans titre : celui du site')
}

console.log('Redirection #/…')
{
  // le script d'index.html, exécuté tel quel contre un faux navigateur
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1]
  const aller = (hash, base, search = '') => {
    let url = null
    runInNewContext(script.replace('%BASE_URL%', base), { location: { hash, search }, history: { replaceState: (_e, _t, u) => { url = u } } })
    return url
  }
  verifier(aller('#/maths/heure?mode=imprimer', '/') === '/maths/heure?mode=imprimer', '#/chemin?x → /chemin?x')
  verifier(aller('#/telechargements/une-fiche/', '/') === '/telechargements/une-fiche/', 'ancienne adresse d’une fiche : conservée avec sa barre finale')
  verifier(aller('#/', '/ecole-primaire/') === '/ecole-primaire/', '#/ → racine (base GitHub Pages)')
  verifier(aller('#/maths', '/ecole-primaire/') === '/ecole-primaire/maths', 'base GitHub Pages respectée')
  verifier(aller('#/', '/', '?generation=1') === '/?generation=1' && aller('#/maths/heure?mode=imprimer', '/', '?graine=3') === '/maths/heure?graine=3&mode=imprimer', 'les paramètres d’avant le # sont gardés (génération des fiches)')
  verifier(aller('', '/') === null && aller('#ancre', '/') === null, 'sans ancien chemin : rien ne change')
}

process.exit(nbEchecs() ? 1 : 0)

// Tests de logique pure (node) : nombres en lettres, catalogue des fiches
import { enLettresFr, enLettresBr } from '../src/utils/nombres.js'
import { TELECHARGEMENTS } from '../src/impression/catalogue.js'
import { verifier } from './outils.mjs'

console.log('Nombres en lettres')
const FR = { 0: 'zéro', 21: 'vingt-et-un', 71: 'soixante-et-onze', 80: 'quatre-vingts', 81: 'quatre-vingt-un', 91: 'quatre-vingt-onze',
  200: 'deux-cents', 201: 'deux-cent-un', 280: 'deux-cent-quatre-vingts', 1000: 'mille', 80000: 'quatre-vingt-mille' }
for (const [n, attendu] of Object.entries(FR)) verifier(enLettresFr(+n) === attendu, `${n} → ${attendu}`)
verifier(enLettresFr(71, { rectifiee: false }) === 'soixante et onze', '71 (traditionnelle) → soixante et onze')
verifier(enLettresFr(201, { rectifiee: false }) === 'deux cent un', '201 (traditionnelle) → deux cent un')
// Breton : vérifiés dans le Wiktionnaire et le Meurgorf
const BR = { 21: 'unan warn-ugent', 31: 'unan ha tregont', 42: 'daou ha daou-ugent', 51: 'unan hag hanter-kant', 70: 'dek ha tri-ugent',
  75: 'pemzek ha tri-ugent', 80: 'pevar-ugent', 99: 'naontek ha pevar-ugent', 101: 'kant unan', 125: 'kant pemp warn-ugent',
  200: "daou c'hant", 2000: 'daou vil' }
for (const [n, attendu] of Object.entries(BR)) verifier(enLettresBr(+n) === attendu, `${n} → ${attendu}`)

console.log('Règles de langue')
const { regles } = await import('../src/i18n/regles.js')
const F = regles('fr'), B = regles('br')
const exemples = [
  [F.nombre(1, 'bille'), '1 bille'], [F.nombre(3, 'bille'), '3 billes'], [F.nombre(2, { s: 'cheval', p: 'chevaux' }), '2 chevaux'],
  [F.que('Emma'), "qu'Emma"], [F.que('Léo'), 'que Léo'], [F.de('euros'), "d'euros"],
  [B.nombre(3, 'bilhenn'), '3 bilhenn'], [B.et('aval'), 'hag'], [B.et('bara'), 'ha'],
  [B.le('ki'), "ar c'hi"], [B.le('kador', 'f'), 'ar gador'], [B.le('taol', 'f'), 'an daol'], [B.le('mamm', 'f'), 'ar vamm'],
  [B.le('aval'), 'an aval'], [B.le('loar', 'f'), 'al loar'], [B.le('bara'), 'ar bara'],
]
for (const [obtenu, attendu] of exemples) verifier(obtenu === attendu, `${attendu}${obtenu !== attendu ? ` (obtenu : ${obtenu})` : ''}`)

console.log('Catalogue des fiches')
const slugs = TELECHARGEMENTS.map(t => t.slug)
verifier(new Set(slugs).size === slugs.length, `${slugs.length} fiches, slugs uniques`)
verifier(TELECHARGEMENTS.every(t => t.langues?.length), 'chaque fiche a ses langues')

console.log('Affiches du programme')
const { conjuguer, VERBES } = await import('../src/data/conjugaison.js')
const CONJ = [
  ['etre', 'present', 3, 'nous sommes'], ['etre', 'imparfait', 0, "j'étais"], ['etre', 'futur', 5, 'ils / elles seront'], ['etre', 'passe-simple', 2, 'il / elle / on fut'],
  ['avoir', 'present', 0, "j'ai"], ['avoir', 'passe-compose', 1, 'tu as eu'], ['avoir', 'plus-que-parfait', 0, "j'avais eu"],
  ['chanter', 'present', 3, 'nous chantons'], ['chanter', 'passe-simple', 5, 'ils / elles chantèrent'], ['finir', 'present', 5, 'ils / elles finissent'], ['finir', 'imparfait', 3, 'nous finissions'],
  ['aller', 'present', 0, 'je vais'], ['aller', 'futur', 0, "j'irai"], ['aller', 'passe-compose', 3, 'nous sommes allé(e)s'], ['aller', 'plus-que-parfait', 2, 'il / elle / on était allé(e)'],
  ['faire', 'present', 4, 'vous faites'], ['dire', 'present', 4, 'vous dites'], ['venir', 'futur', 2, 'il / elle / on viendra'], ['venir', 'passe-simple', 5, 'ils / elles vinrent'],
  ['pouvoir', 'present', 0, 'je peux'], ['pouvoir', 'futur', 0, 'je pourrai'], ['voir', 'futur', 3, 'nous verrons'], ['voir', 'imparfait', 3, 'nous voyions'] ,
  ['vouloir', 'present', 2, 'il / elle / on veut'], ['vouloir', 'futur', 0, 'je voudrai'], ['prendre', 'present', 5, 'ils / elles prennent'], ['prendre', 'passe-simple', 0, 'je pris'],
]
for (const [v, t, i, attendu] of CONJ) {
  const obtenu = conjuguer(v, t)[i]
  verifier(obtenu === attendu, `${v} ${t} → ${attendu}${obtenu !== attendu ? ` (obtenu : ${obtenu})` : ''}`)
}
verifier(Object.keys(VERBES).length === 12, 'les 12 verbes du programme (être, avoir, 1er et 2e groupes, 8 irréguliers)')
verifier(TELECHARGEMENTS.filter(t => t.type === 'nombres').every(t => t.lien === `/imprimer/nombres?mise=${t.config.miseEnPage}&preset=${t.slug}`), 'nombres : le lien garde la mise en page (affiches / fiche) et règle la fiche (preset)')
verifier(TELECHARGEMENTS.filter(t => t.categorie !== 'affiches').every(t => new URLSearchParams(t.lien.split('?')[1]).get('preset') === t.slug), 'fiches et affiches du catalogue : « Personnaliser » ouvre le générateur réglé sur la fiche (?preset=<slug>)')

console.log('Pluriels (Intl.PluralRules)')
const { choisirPluriel } = await import('../src/i18n/pluriel.js')
const pages = { fr: { one: '{n} page', other: '{n} pages' }, br: { one: 'bajenn', two: 'bajenn', few: 'fajenn', many: 'a bajennoù', other: 'pajenn' } }
verifier(choisirPluriel(pages.fr, { n: 1 }, 'fr') === '{n} page' && choisirPluriel(pages.fr, { n: 3 }, 'fr') === '{n} pages', 'français : 1 page / 3 pages')
verifier(choisirPluriel(pages.br, { n: 3 }, 'br') === 'fajenn' && choisirPluriel(pages.br, { n: 5 }, 'br') === 'pajenn' && choisirPluriel(pages.br, { n: 2 }, 'br') === 'bajenn',
  'breton : 2 → « two », 3 → « few », 5 → « other »')
verifier(choisirPluriel('texte simple', { n: 3 }, 'br') === 'texte simple', 'message sans pluriel inchangé')

console.log('Activités de maths et programme (activites.js / programme.js)')
{
  const { ACTIVITES } = await import('../src/data/activites.js')
  const { CYCLE_DE, competencesDu, contraintesDe } = await import('../src/data/programme.js')
  for (const a of ACTIVITES.filter(x => x.matiere === 'maths')) {
    const d = a.domaine
    const vides = a.niveaux.filter(n => !competencesDu(d, n).length)
    const cycle = a.to.startsWith('/maternelle/') ? [1] : [2, 3]
    const horsCycle = a.niveaux.filter(n => !cycle.includes(CYCLE_DE[n]))
    verifier(d && !vides.length && !horsCycle.length,
      `${a.to} (${a.niveaux.join(', ')})${!d ? ` — domaine inconnu « ${a.domaine} »` : ''}${vides.length ? ` — aucune compétence du domaine en ${vides.join(', ')}` : ''}${horsCycle.length ? ` — hors cycle : ${horsCycle.join(', ')}` : ''}`)
  }
  const pose = ACTIVITES.find(a => a.to === '/maths/calcul-pose')
  verifier(pose.niveaux.every(n => contraintesDe(n).operationsPosees?.length), 'calcul posé : seulement les niveaux où des opérations posées sont au programme')
}

console.log('Affiches : domaines et niveaux du programme (src/data/programme.js)')
{
  const { DOMAINES, CONTRAINTES } = await import('../src/data/programme.js')
  const { DOMAINES_AFFICHES, AFFICHES_PROGRAMME, NUMERATION, LOTS_FORMES } = await import('../src/impression/affiches/catalogue.js')
  const pretes = TELECHARGEMENTS.filter(t => t.type === 'affiche')
  const domaines = new Set(DOMAINES.map(d => d.id))
  // les affiches des tables (calcul.js, pas importable avec node) prennent leur domaine dans DOMAINES_AFFICHES
  const inconnus = Object.entries(DOMAINES_AFFICHES).filter(([, d]) => !domaines.has(d))
  verifier(!inconnus.length, `chaque famille d'affiches a un domaine de programme.js${inconnus.length ? ` (inconnus : ${inconnus.map(x => x.join(' → ')).join(', ')})` : ''}`)
  const affiches = TELECHARGEMENTS.filter(t => ['alphabet', 'nombres', 'affiches'].includes(t.categorie))
  const sansDomaine = affiches.filter(t => t.genre !== 'affiche' || !domaines.has(t.domaine))
  verifier(!sansDomaine.length, `${affiches.length} affiches du catalogue : genre « affiche » et domaine connu${sansDomaine.length ? ` (${sansDomaine.slice(0, 3).map(t => t.slug).join(', ')})` : ''}`)
  const slugs = TELECHARGEMENTS.map(t => t.slug)
  verifier(new Set(slugs).size === slugs.length, 'catalogue : slugs uniques')

  // niveaux « CE1 · CE2 » → contraintes de chaque niveau
  const contraintes = t => t.niveaux.split(' · ').map(n => CONTRAINTES.find(c => c.niveau === n.toLowerCase()))
  const PRECISION = ['entiere', 'quart', 'minute', 'seconde']
  const ID_PROGRAMME = { isocele: 'triangle-isocele', equilateral: 'triangle-equilateral', prisme: 'prisme-droit' }
  const groupeDe = v => ({ etre: 'etre-avoir', avoir: 'etre-avoir', chanter: '1er-groupe', finir: '2e-groupe' }[v])
  const variante = (affiche, id) => AFFICHES_PROGRAMME.find(a => a.id === affiche).variantes?.find(v => v.id === id)
  const respecte = (t, c) => {
    const { affiche, variante: v, verbe, temps } = t.config
    if (affiche === 'droite') return +v <= c.nombreMax
    if (affiche === 'numeration') {
      const def = NUMERATION[v]
      return def.decimales <= c.decimalesMax && def.classes.flatMap(k => k.rangs).length <= c.nombreChiffresMax
    }
    if (affiche === 'horloge') return PRECISION.indexOf(variante('horloge', v).precision) <= PRECISION.indexOf(c.heure)
    if (affiche === 'monnaie') return v === 'euros' ? c.monnaie.eurosMax === null || c.monnaie.eurosMax >= 100 : c.monnaie.centimes
    if (affiche === 'conjugaison') {
      const k = c.conjugaison
      return !!k && (temps ?? ['present', 'imparfait', 'futur', 'passe-compose']).every(x => k.temps.includes(x))
        && (groupeDe(verbe) ? k.groupes.includes(groupeDe(verbe)) : k.irreguliers.includes(verbe))
    }
    // « ce que je sais faire » : une phrase par compétence du niveau (vérifié plus bas, sur savoirs.js)
    if (affiche === 'resume') return t.config.niveau === c.niveau
    if (affiche === 'formes') {
      const lot = LOTS_FORMES[v]
      return lot.liste.every(id => c[lot.type].includes(ID_PROGRAMME[id] ?? id))
    }
    return false
  }
  const horsProgramme = pretes.flatMap(t => contraintes(t).filter(c => !c || !respecte(t, c)).map(c => `${t.slug} (${c?.niveau ?? t.niveaux})`))
  verifier(!horsProgramme.length, `affiches du programme : contenu permis à chaque niveau indiqué${horsProgramme.length ? ` (${horsProgramme.slice(0, 4).join(', ')})` : ''}`)
  // la page /imprimer/affiches affiche les mêmes niveaux que le catalogue
  const ecarts = pretes.filter(t => t.config.variante && variante(t.config.affiche, t.config.variante).niveaux !== t.niveaux)
  verifier(!ecarts.length, `niveaux des variantes = niveaux du catalogue${ecarts.length ? ` (${ecarts.map(t => t.slug).join(', ')})` : ''}`)

  // nombres en lettres : le plus grand nombre de l'affiche ne dépasse pas l'écriture en lettres attendue
  const MAX_SECTION = { unites: 9, onze: 20, dizaines: 100, centaines: 1000, milliers: 9000, cent: 100, ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => [`d${d}`, d * 10 + 10])) }
  const nombresHors = TELECHARGEMENTS.filter(t => t.categorie === 'nombres').flatMap(t => {
    const max = Math.max(...t.config.sections.map(s => MAX_SECTION[s]))
    return contraintes(t).filter(c => (c.nombresEnLettresMax ?? c.nombreMax) < max).map(c => `${t.slug} (${c.niveau})`)
  })
  verifier(!nombresHors.length, `affiches des nombres : nombres en lettres permis à chaque niveau${nombresHors.length ? ` (${nombresHors.slice(0, 4).join(', ')})` : ''}`)
}

console.log('Ce que je sais faire (src/data/savoirs.js)')
{
  const { COMPETENCES } = await import('../src/data/programme.js')
  const { SAVOIRS } = await import('../src/data/savoirs.js')
  const ids = new Set(COMPETENCES.map(k => k.id))
  const inconnues = Object.keys(SAVOIRS).filter(id => !ids.has(id))
  verifier(!inconnues.length, `chaque phrase correspond à une compétence de programme.js${inconnues.length ? ` (${inconnues.join(', ')})` : ''}`)
  const manquantes = COMPETENCES.flatMap(k => k.niveaux.filter(n => !SAVOIRS[k.id]?.[n]).map(n => `${k.id} ${n}`))
  verifier(!manquantes.length, `une phrase par compétence et par niveau où elle est travaillée${manquantes.length ? ` (manque : ${manquantes.slice(0, 5).join(', ')})` : ''}`)
  const horsNiveau = COMPETENCES.flatMap(k => Object.keys(SAVOIRS[k.id] ?? {}).filter(n => !k.niveaux.includes(n)).map(n => `${k.id} ${n}`))
  verifier(!horsNiveau.length, `aucune phrase à un niveau où la compétence n'est pas au programme${horsNiveau.length ? ` (${horsNiveau.slice(0, 5).join(', ')})` : ''}`)
}

console.log('Fiches par compétence : compétence au programme de chaque classe (exercices.js)')
{
  const { COMPETENCES } = await import('../src/data/programme.js')
  const { EXERCICES, classesDe, fichesDe } = await import('../src/impression/exercices.js')
  const hors = EXERCICES.flatMap(ex => ex.classes.flatMap(c => fichesDe(ex, c.classe).flatMap(f => {
    const k = COMPETENCES.find(x => x.id === f.competence)
    return classesDe(c.classe).filter(n => !k?.niveaux.includes(n)).map(n => `${ex.id} ${n} ${f.id} (${f.competence})`)
  })))
  verifier(!hors.length, `chaque option d'exercice correspond à une compétence au programme de la classe${hors.length ? ` (${hors.slice(0, 4).join(', ')})` : ''}`)
}

console.log('Couverture : une compétence n\'est déclarée qu\'aux classes où elle est au programme')
{
  const { COMPETENCES, NIVEAUX } = await import('../src/data/programme.js')
  const { ACTIVITES } = await import('../src/data/activites.js')
  const niveauxDe = id => COMPETENCES.find(k => k.id === id)?.niveaux ?? []
  const parClasse = a => a.niveaux.flatMap(c => (Array.isArray(a.competences) ? [] : (a.competences?.[c] ?? []).filter(id => !niveauxDe(id).includes(c)).map(id => `${a.to} ${c} ${id}`)))
  const fautesActivites = ACTIVITES.flatMap(parClasse)
  verifier(!fautesActivites.length, `activités : compétences déclarées par classe au programme de cette classe${fautesActivites.length ? ` (${fautesActivites.slice(0, 4).join(', ')})` : ''}`)
  // fiches et affiches toutes prêtes : chaque compétence au programme d'au moins une de leurs classes
  const classes = s => (s || '').toLowerCase().split(/[·,\s]+/).filter(x => NIVEAUX.includes(x))
  const fautesFiches = TELECHARGEMENTS.flatMap(t => (t.competences ?? []).filter(id => !classes(t.niveaux).some(c => niveauxDe(id).includes(c))).map(id => `${t.slug} ${id}`))
  verifier(!fautesFiches.length, `fiches toutes prêtes : chaque compétence au programme d'une de leurs classes${fautesFiches.length ? ` (${fautesFiches.slice(0, 4).join(', ')})` : ''}`)
}

console.log('Catalogue unique : domaine et genre de chaque entrée (plan 09)')
{
  const { DOMAINES } = await import('../src/data/programme.js')
  const { EXERCICES } = await import('../src/impression/exercices.js')
  const { ACTIVITES } = await import('../src/data/activites.js')
  const domaines = new Set(DOMAINES.map(d => d.id))
  const GENRES = ['affiche', 'fiche', 'exercice']
  // fiches d'écriture, alphabet, nombres et affiches du programme (catalogue.js) ; les fiches de calcul (calcul.js,
  // pas importable avec node) sont vérifiées dans tests/statiques.test.mjs, sur fiches.json du build
  const entrees = TELECHARGEMENTS
  const fautives = entrees.filter(t => !domaines.has(t.domaine) || !GENRES.includes(t.genre) || t.genre === 'exercice')
  verifier(!fautives.length, `${entrees.length} entrées du catalogue : domaine de programme.js, genre « affiche » ou « fiche »${fautives.length ? ` (${fautives.slice(0, 4).map(t => `${t.slug} : ${t.domaine}/${t.genre}`).join(', ')})` : ''}`)
  verifier(TELECHARGEMENTS.filter(t => t.categorie === 'ecriture').every(t => t.genre === 'fiche' && t.domaine === 'ecriture'), 'fiches d\'écriture : genre « fiche », domaine « ecriture »')
  // exercices : domaine de l'activité de même route ; hors programme seulement pour la culture générale
  const exFautifs = EXERCICES.filter(e => {
    const a = ACTIVITES.find(x => x.to === e.route)
    if (!a || e.genre !== 'exercice') return true
    return a.matiere === 'autres' ? e.domaine !== null : !domaines.has(e.domaine)
  })
  verifier(!exFautifs.length, `${EXERCICES.length} exercices prégénérés : genre « exercice », domaine connu (sauf culture générale)${exFautifs.length ? ` (${exFautifs.map(e => `${e.id} : ${e.domaine}`).join(', ')})` : ''}`)
  // activités : toute activité hors culture générale a un domaine ; les cartes « À imprimer » ont un genre
  const actFautives = ACTIVITES.filter(a => (a.matiere !== 'autres' && !domaines.has(a.domaine))
    || (a.matiere === 'imprimer' && !['affiche', 'fiche'].includes(a.genre)))
  verifier(!actFautives.length, `activités : domaine de programme.js et genre des cartes « À imprimer »${actFautives.length ? ` (${actFautives.map(a => a.to).join(', ')})` : ''}`)
}

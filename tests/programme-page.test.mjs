// Page « Programme » et page « Compétence » (node, sans Chrome) : état ↔ adresse, lignes du tableau, références officielles,
// adresses des cases, lien à partager, refs par profil.
//   node tests/programme-page.test.mjs
import { COMPETENCES, DOMAINES, SOURCES } from '../src/data/programme.ts'
import { NIVEAUX } from '../src/data/classes.ts'
import { SITES } from '../src/sites.ts'
import { defautsContexte } from '../src/contexte/regles.ts'
import { lireContexteDeLAdresse } from '../src/contexte/url.ts'
import { AFFICHAGES, MATIERES_PROGRAMME, affichageEffectif, domainesProposes, ecrireEtatProgramme, lireEtatProgramme } from '../src/programme/etat.ts'
import { adresseCompetence, adresseProgramme, completerLien } from '../src/programme/adresse.ts'
import { competencesDuDomaine, lignesDuProgramme } from '../src/programme/tableau.ts'
import { etiquetteDeReference, interpretationDe, nomDeSource, referenceDe } from '../src/programme/references.ts'
import { nomDuDomaine } from '../src/programme/noms.ts'
import { catalogueDeTest } from './donnees-ressources.mjs'
import { verifier, nbEchecs } from './outils.mjs'

const egal = (a, b) => JSON.stringify(a) === JSON.stringify(b)

console.log('État de la page ↔ adresse')
{
  const defaut = lireEtatProgramme({}, ['ce1'])
  verifier(defaut.matiere === 'maths' && defaut.domaine === 'nombres-calcul' && defaut.affichage === null, 'adresse vide : maths, premier domaine, présentation non précisée')
  const etat = lireEtatProgramme({ matiere: 'francais', domaine: 'grammaire', affichage: 'liste' }, ['ce1'])
  verifier(egal(etat, { matiere: 'francais', domaine: 'grammaire', affichage: 'liste' }), 'matière, domaine et présentation lus')
  verifier(egal(lireEtatProgramme(ecrireEtatProgramme(etat), ['ce1']), etat), 'état → adresse → état')
  let tous = true
  for (const matiere of MATIERES_PROGRAMME) for (const classe of NIVEAUX) for (const domaine of domainesProposes(matiere, [classe])) for (const affichage of [null, ...AFFICHAGES]) {
    const e = { matiere, domaine, affichage }
    if (!egal(lireEtatProgramme(ecrireEtatProgramme(e), [classe]), e)) tous = false
  }
  verifier(tous, 'aller-retour sur toutes les matières, classes, domaines et présentations')
  verifier(lireEtatProgramme({ matiere: 'regionale' }, ['ce1']).matiere === 'maths', 'une matière inconnue (ou régionale, sans domaine) : maths')
  verifier(lireEtatProgramme({ matiere: 'francais', domaine: 'nombres-calcul' }, ['ce1']).domaine === 'lecture', 'un domaine d’une autre matière : le premier de la matière')
  verifier(lireEtatProgramme({ domaine: 'donnees' }, ['ps']).domaine === 'nombres-calcul', 'un domaine absent des cycles de la classe : le premier')
  verifier(lireEtatProgramme({ affichage: 'x', matiere: ['monde', 'maths'] }, ['cm1']).affichage === null && lireEtatProgramme({ matiere: ['monde', 'maths'] }, ['cm1']).matiere === 'monde', 'valeurs invalides ou multiples : sans exception')
  verifier(affichageEffectif(defaut) === 'liste' && affichageEffectif({ ...defaut, affichage: 'tableau' }) === 'tableau', 'présentation par défaut : la liste (comme la maquette) ; l’adresse l’emporte')
  verifier(ecrireEtatProgramme({ matiere: 'monde', domaine: null, affichage: null }).domaine === undefined, 'domaine absent : non écrit')
}

console.log('Domaines proposés (jamais inventés)')
{
  const noms = (m, c) => domainesProposes(m, c)
  verifier(!noms('francais', ['ps']).includes('vocabulaire') && noms('francais', ['ce1']).includes('vocabulaire'), 'le français du cycle 1 n’a pas de vocabulaire')
  verifier(noms('maths', ['ce1', 'cm2']).includes('donnees') && !noms('maths', ['gs']).includes('donnees'), 'domaines par cycle : union des classes choisies')
  verifier(noms('monde', ['ce1']).length > 0 && MATIERES_PROGRAMME.every(m => noms(m, ['cp']).every(d => DOMAINES.some(x => x.id === d) || d === 'exemple')), 'Le monde a ses domaines ; tous viennent de programme.ts')
}

console.log('Lignes du tableau')
{
  const C = catalogueDeTest()
  const lignes = lignesDuProgramme('nombres-calcul', ['ce1'], C)
  const attendues = COMPETENCES.filter(k => k.domaine === 'nombres-calcul')
  verifier(lignes.length === attendues.length && lignes.every(l => attendues.some(k => k.id === l.competence.id)), 'une ligne par compétence du domaine, sans invention')
  verifier(lignes.every(l => l.cellules.length === NIVEAUX.length && l.cellules.every((c, i) => c.classe === NIVEAUX[i])), 'une cellule par classe, de PS à CM2')
  verifier(lignes.every(l => l.cellules.every(c => c.concernee === l.competence.niveaux.includes(c.classe))), 'cellule concernée = la compétence est au programme de la classe')
  verifier(lignes.every(l => l.cellules.every(c => c.choisie === (c.classe === 'ce1'))), 'cellule choisie = classe choisie')
  verifier(lignes.every(l => l.choisie === l.competence.niveaux.includes('ce1')), 'ligne choisie : une classe choisie la travaille')
  const intro = lignes.map(l => Math.min(...l.competence.niveaux.map(n => NIVEAUX.indexOf(n))))
  verifier(intro.every((n, i) => i === 0 || intro[i - 1] <= n), 'ordre : classe d’introduction croissante')
  verifier(egal(competencesDuDomaine('nombres-calcul').map(k => k.id), competencesDuDomaine('nombres-calcul').map(k => k.id)), 'tri stable (deux appels, même ordre)')
  const ids = lignes.map(l => l.competence.id)
  verifier(ids.indexOf('denombrer-3') < ids.indexOf('denombrer-6'), 'PS d’abord : denombrer-3 (PS) passe devant denombrer-6 (MS) malgré l’ordre du programme')
  const multi = lignesDuProgramme('nombres-calcul', ['ps', 'cm2'], C)
  verifier(multi.every(l => l.choisie === l.competence.niveaux.some(n => n === 'ps' || n === 'cm2')), 'union des classes choisies')
  const avecRessources = lignesDuProgramme('exemple', ['cp'], C)
  const k = avecRessources.find(l => l.competence.id === 'exemple-compter')
  verifier(k && k.ressources.length > 0 && k.ressources.every(r => r.competences.includes('exemple-compter')), 'ressources liées = celles du catalogue qui travaillent la compétence')
  verifier(k.pourLesClasses.every(r => r.classes.includes('cp')) && k.pourLesClasses.length <= k.ressources.length, 'ressources des classes choisies seulement')
  verifier(lignesDuProgramme('nombres-calcul', ['ce1'], []).every(l => l.ressources.length === 0), 'catalogue vide (production) : lignes sans ressource, jamais d’erreur')
  verifier(lignesDuProgramme('inconnu', ['ce1'], C).length === 0, 'domaine inconnu : aucune ligne')
}

console.log('Références officielles')
{
  const k = COMPETENCES.find(c => c.id === 'denombrer-6')
  const ref = referenceDe(k.source)
  verifier(ref.source === 'bo41' && ref.page === 62 && ref.url.endsWith('#page=62') && ref.extrait === k.source.extrait, 'référence = source de la compétence (page du PDF, adresse #page=)')
  verifier(etiquetteDeReference('fr', ref) === 'BO 41 · p. PDF 62', 'étiquette : « BO 41 · p. PDF 62 »')
  verifier(etiquetteDeReference('br', ref).startsWith('BO 41 · '), 'étiquette en breton')
  verifier(Object.keys(SOURCES).every(s => nomDeSource('fr', s) && !nomDeSource('fr', s).startsWith('programme.source')), 'chaque texte officiel a un nom court')
  verifier(COMPETENCES.every(c => referenceDe(c.source).url.includes('#page=')), 'chaque compétence mène à une page précise')
  const monde = COMPETENCES.find(c => c.interpretation)
  verifier(!!monde && interpretationDe(monde) === monde.interpretation && interpretationDe(k) === null, 'interprétation : celle de la compétence, sinon rien')
}

console.log('Adresses')
{
  verifier(adresseCompetence('denombrer-6', 'ms') === '/competence/denombrer-6?classes=ms', 'case du tableau : /competence/<id>?classes=<classe>')
  verifier(adresseCompetence('x', null, { mode: 'bi', refs: '1' }) === '/competence/x?mode=bi&refs=1', 'sans classe : les paramètres de contexte sont reportés')
  const etat = { matiere: 'francais', domaine: 'lecture', affichage: 'tableau' }
  const a = adresseProgramme(etat, ['ce1', 'ce2'], { mode: 'bi' })
  verifier(a === '/programme?mode=bi&classes=ce1,ce2&matiere=francais&domaine=lecture&affichage=tableau', `adresse du programme : ${a}`)
  const q = Object.fromEntries(new URLSearchParams(a.split('?')[1]))
  verifier(egal(lireEtatProgramme(q, ['ce1', 'ce2']), etat) && egal(lireContexteDeLAdresse(q, defautsContexte(SITES.ecoleprimaire)).classes, ['ce1', 'ce2']), 'adresse ouverte à froid = même vue')
  verifier(completerLien('https://x.app/programme?classes=ce1', { refs: '0', matiere: 'maths' }) === 'https://x.app/programme?classes=ce1&refs=0&matiere=maths', 'lien à partager : paramètres explicites ajoutés')
  verifier(completerLien('https://x.app/programme?classes=ce1&refs=1', { refs: '0' }) === 'https://x.app/programme?classes=ce1&refs=1' && completerLien('https://x.app/p', { a: '1' }) === 'https://x.app/p?a=1', 'un paramètre déjà présent n’est pas écrasé')
}

console.log('Références par profil')
{
  const E = SITES.ecoleprimaire
  verifier(defautsContexte(E, undefined, 'enseignant').refs === true && defautsContexte(E, undefined, 'parent').refs === false && defautsContexte(E, undefined, 'enfant').refs === false && defautsContexte(E).refs === false, 'références : activées d’office pour l’enseignant seulement')
  const memo = { classes: null, mode: null, regionale: null, vue: null, refs: false }
  verifier(defautsContexte(E, memo, 'enseignant').refs === false, 'un choix mémorisé passe devant le profil')
  verifier(lireContexteDeLAdresse({}, defautsContexte(E, undefined, 'enseignant')).refs === true && lireContexteDeLAdresse({ refs: '0' }, defautsContexte(E, undefined, 'enseignant')).refs === false, 'l’adresse passe devant le défaut du profil')
}

console.log('Noms')
verifier(nomDuDomaine('nombres-calcul', 'fr') === 'Nombres et calcul' && nomDuDomaine('nombres-calcul', 'br') !== '' && nomDuDomaine('inconnu', 'fr') === 'inconnu', 'nom d’un domaine (langue, repli)')

process.exit(nbEchecs() ? 1 : 0)

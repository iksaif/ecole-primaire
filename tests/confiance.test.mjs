// Confiance dans les traductions (node) : l'échelle, la table du breton (clés connues, notes, relecteurs), le filtre des fiches.
import { NIVEAUX_CONFIANCE, NOMS_NIVEAU, NIVEAU_PAR_DEFAUT, assezSure, problemesTable, estNiveauConfiance, niveauDe, niveauDeFiche, fichesInconnues } from '../src/langues/confiance.ts'
import { LANGUES, confianceDe, confianceFiche } from '../src/langues/registre.ts'
import { traductionAssezSure, traductionMontree } from '../src/ressources/filtres.ts'
import { filtrerFiches, CRITERES_PAGE_VIDES } from '../src/telechargements/pages.ts'
import { clesConnues, ressourcesTraduites } from '../scripts/verifier/confiance/ressources.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Échelle')
verifier(NIVEAUX_CONFIANCE.join() === '0,1,2,3,4' && Object.keys(NOMS_NIVEAU).length === 5, 'cinq niveaux, de 0 à 4')
verifier(NIVEAU_PAR_DEFAUT === 2, 'défaut : mots vérifiés')
verifier(estNiveauConfiance(0) && estNiveauConfiance(4) && !estNiveauConfiance(5) && !estNiveauConfiance('2') && !estNiveauConfiance(1.5), 'estNiveauConfiance')
verifier(assezSure(1, 1) && !assezSure(0, 1) && assezSure(null, 4) && assezSure(0, undefined), 'assezSure : seuil, langue source (null), pas de seuil')

console.log('Table du breton')
const table = LANGUES.br.confiance
verifier(problemesTable(table, clesConnues()).length === 0, `la table du breton est valide ${problemesTable(table, clesConnues()).join(' ; ')}`)
const ok = { niveau: 2, le: '2026-10-09', par: 'assistant', note: 'x' }
verifier(problemesTable({ 'exercice:nexistepas': ok }, clesConnues()).length === 1, 'clé inconnue refusée')
verifier(problemesTable({ 'affiche:jours': { ...ok, note: ' ' } }, clesConnues()).length === 1, 'note vide refusée')
verifier(problemesTable({ 'affiche:jours': { ...ok, niveau: 3 } }, clesConnues()).length >= 1, 'niveau 3 sans relecteur refusé')
verifier(problemesTable({ 'affiche:jours': { ...ok, niveau: 4, par: 'relecteur', relecteur: 'brittophone' } }, clesConnues()).length === 1, 'niveau 4 relu par un·e non-enseignant·e refusé')
verifier(problemesTable({ 'affiche:jours': { ...ok, niveau: 4, par: 'relecteur', relecteur: 'enseignant' } }, clesConnues()).length === 0, 'niveau 4 relu par un·e enseignant·e accepté')
verifier(problemesTable({ 'affiche:jours': { ...ok, relecteur: 'enseignant' } }, clesConnues()).length === 1, 'relecteur sur un niveau < 3 refusé')
verifier(niveauDe({}, 'affiche:jours') === 0, 'ressource jamais évaluée : 0')
verifier(confianceDe('fr', 'affiche', 'jours') === null && confianceDe('br', 'affiche', 'jours') === 2, 'français : null ; jours en breton : 2')
verifier(confianceFiche(['fr'], 'affiche', 'jours') === null && confianceFiche(['fr', 'br'], 'affiche', 'jours') === 2, 'fiche : null en français seul, niveau du breton sinon')
verifier(ressourcesTraduites('br').length > 0, 'des ressources ont du texte en breton')
verifier(ressourcesTraduites('br').every(l => !l.evaluation || l.evaluation.niveau === niveauDe(table, l.cle)), 'cohérence ressources / table')

console.log('Exceptions par fiche')
const avecException = { 'affiche:mois': { ...ok, niveau: 1 }, 'fiche:affiche-mois-gs-br': { ...ok, niveau: 2 } }
verifier(niveauDeFiche(avecException, 'affiche:mois', 'affiche-mois-gs-br') === 2, 'l’exception de la fiche l’emporte sur sa ressource')
verifier(niveauDeFiche(avecException, 'affiche:mois', 'affiche-mois-cp-br') === 1 && niveauDeFiche({}, 'affiche:mois', 'x') === 0, 'sans exception : la ressource, sinon 0')
verifier(confianceDe('br', 'affiche', 'mois', 'slug-inconnu') === confianceDe('br', 'affiche', 'mois'), 'slug sans exception : niveau de la ressource')
verifier(problemesTable(avecException, clesConnues()).length === 0 && problemesTable({ 'fiche:': ok }, clesConnues()).length === 1, 'exception de fiche : forme vérifiée')
verifier(fichesInconnues(avecException, new Set(['affiche-mois-gs-br'])).length === 0 && fichesInconnues(avecException, new Set()).join() === 'fiche:affiche-mois-gs-br', 'exception vers une fiche absente : signalée (le build s’arrête)')

console.log('Filtre des fiches')
const entree = (slug, confiance) => ({ slug, parent: null, matieres: ['maths'], domaine: null, niveaux: ['CP'], usage: 'sentrainer', langues: confiance === null ? ['fr'] : ['br'], recherche: slug, confiance })
const index = { entrees: [entree('a', null), entree('b', 0), entree('c', 1), entree('d', 3)], filtres: { domaines: [] } }
const contexte = { mode: 'bilingue', regionale: 'br' }
const slugs = seuil => filtrerFiches(index, null, { ...CRITERES_PAGE_VIDES, confianceMin: seuil }, contexte).map(e => e.slug).join()
verifier(slugs(undefined) === 'a,b,c,d', 'sans seuil : tout')
verifier(slugs(1) === 'a,c,d', 'seuil 1 : cache le niveau 0, garde le français seul')
verifier(slugs(3) === 'a,d', 'seuil 3 : relues seulement')

console.log('Règle générique « peut-on afficher ? »')
const exo = { langues: ['fr', 'br'], confiance: 0 }
verifier(traductionAssezSure(exo, 'fr', 'br', 2), 'français seul : une ressource traduite reste affichée (sa traduction n’est pas lue)')
verifier(!traductionAssezSure(exo, 'bilingue', 'br', 2) && !traductionAssezSure(exo, 'regionale', 'br', 2), 'bilingue ou breton seul : cachée sous le seuil')
verifier(traductionAssezSure(exo, 'bilingue', 'br', 0) && traductionAssezSure(exo, 'bilingue', 'br', undefined), 'au seuil ou sans seuil : affichée')
verifier(traductionAssezSure({ langues: ['fr'], confiance: null }, 'bilingue', 'br', 4), 'français seul : toujours affichée')
verifier(traductionAssezSure(exo, 'bilingue', null, 4), 'sans langue régionale active : affichée')
verifier(traductionMontree(exo, 'bilingue', 'br') && !traductionMontree(exo, 'fr', 'br'), 'traductionMontree : selon le mode')

process.exit(nbEchecs() ? 1 : 0)

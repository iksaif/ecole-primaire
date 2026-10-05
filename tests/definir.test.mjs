// definir() (src/noyau/definir.ts) : le format normalisé qu'il rend, les compétences dérivées du programme, l'héritage de
// niveaux, et surtout les messages d'erreur d'une mauvaise déclaration (fail-fast). Node, sans Chrome.
//   node tests/definir.test.mjs
import { definir, choix, cases, herite } from '../src/noyau/definir.ts'
import { K, D } from '../src/noyau/ids.ts'
import { COMPETENCES, COMPETENCES_EXEMPLE, DOMAINES, DOMAINES_EXEMPLE } from '../src/data/programme.ts'
import exemple from '../src/exercices/exemple/definition.ts'
import { verifier, nbEchecs } from './outils.mjs'

const base = { id: 't', route: '/dev/t', domaine: D.exemple, competences: [K.exempleCompter, K.exempleRegle] }
// la déclaration doit échouer avec un message qui contient `attendu`
const echoue = (nom, spec, attendu) => {
  try { definir(spec); verifier(false, `${nom} : aurait dû échouer`) } catch (e) { verifier(e.message.includes(attendu), `${nom} : « ${e.message} » doit contenir « ${attendu} »`) }
}

console.log('Format normalisé')
const d = definir({ ...base, reglages: { nbQ: choix([5, 10], { defaut: 10 }), aide: true }, niveaux: {
  cp: { reglages: { pas: choix([1, 2], { bonus: [5], horsProgramme: [{ option: 100, raison: 'r' }] }), sens: cases(['a', 'b'], { defaut: ['a'] }) } },
  ce1: herite('cp', { reglages: { pas: choix([2, 10]) } }),
} })
verifier(JSON.stringify(d.reglages) === '{"nbQ":10,"aide":true}', 'réglages communs : défauts')
verifier(JSON.stringify(d.options) === '{"nbQ":[5,10]}', 'options communes')
verifier(JSON.stringify(d.niveaux.cp.options.pas) === '[1,2,5,100]' && d.niveaux.cp.reglages.pas === 1, 'options du niveau : valeurs, bonus, hors programme ; défaut = première valeur')
verifier(JSON.stringify(d.niveaux.cp.bonus) === '{"pas":[5]}', 'bonus')
verifier(JSON.stringify(d.niveaux.cp.horsProgramme) === '[{"reglage":"pas","option":100,"raison":"r"}]', 'horsProgramme avec sa raison')
verifier(JSON.stringify(d.niveaux.ce1.reglages) === '{"pas":2,"sens":["a"]}', 'héritage : sens repris du CP, pas redit')
verifier(d.niveauDefaut === 'cp' && d.contenu === 'interface', 'défauts : premier niveau, contenu = interface')

console.log('Compétences dérivées du programme')
verifier(JSON.stringify(d.niveaux.cp.competences) === JSON.stringify([K.exempleCompter]), 'CP : seulement les compétences au programme du CP')
verifier(d.niveaux.ce1.competences.length === 2, 'CE1 : les deux')
const sauf = definir({ ...base, niveaux: { ce1: { sauf: [K.exempleRegle] } } })
verifier(sauf.niveaux.ce1.competences.length === 1, 'sauf écarte une compétence')

console.log('Erreurs de déclaration')
echoue('compétence inconnue', { ...base, competences: ['n-importe-quoi'], niveaux: { cp: {} } }, 'compétence « n-importe-quoi » inconnue')
echoue('niveau inconnu', { ...base, niveaux: { cm3: {} } }, 'niveau « cm3 » inconnu')
echoue('niveau sans compétence', { ...base, competences: [K.exempleRegle], niveaux: { cp: {} } }, 'aucune compétence de l\'exercice n\'est au programme de cp')
echoue('défaut hors des valeurs', { ...base, niveaux: { cp: { reglages: { pas: choix([1, 2], { defaut: 3 }) } } } }, 'le défaut « 3 »')
echoue('bonus par défaut', { ...base, niveaux: { cp: { reglages: { pas: choix([1, 2], { bonus: [1] }) } } } }, 'proposé deux fois')
echoue('bonus commun', { ...base, reglages: { pas: choix([1], { bonus: [5] }) }, niveaux: { cp: {} } }, 'se déclarent dans un niveau')
echoue('horsProgramme sans raison', { ...base, niveaux: { cp: { reglages: { pas: choix([1], { horsProgramme: [{ option: 9, raison: '' }] }) } } } }, 'sans raison')
echoue('héritage circulaire', { ...base, niveaux: { cp: herite('ce1', {}), ce1: herite('cp', {}) } }, 'héritage circulaire')
echoue('héritage d\'un niveau absent', { ...base, niveaux: { ce1: herite('cp', {}) } }, 'hérité mais pas déclaré')
echoue('sauf étranger', { ...base, niveaux: { ce1: { sauf: [K.exempleLire] } } }, 'n\'est pas une compétence de l\'exercice')
echoue('fiche : niveau absent', { ...base, niveaux: { cp: {} }, fiches: [{ id: 'f', competence: K.exempleCompter, niveau: 'ce1', reglages: {} }] }, 'niveau absent')
echoue('fiche : compétence du niveau', { ...base, niveaux: { cp: {}, ce1: {} }, fiches: [{ id: 'f', competence: K.exempleRegle, niveau: 'cp', reglages: {} }] }, 'n\'est pas une compétence de cp')
echoue('fiche : réglage non proposé', { ...base, niveaux: { cp: { reglages: { pas: choix([1, 2]) } } }, fiches: [{ id: 'f', competence: K.exempleCompter, niveau: 'cp', reglages: { pas: 7 } }] }, '« 7 » n\'est pas proposé')
try { K.inconnue; verifier(false, 'K.inconnue devrait lever une erreur') } catch (e) { verifier(e.message.includes('K.inconnue'), 'K.inconnue : erreur claire') }

console.log('Constantes K et D')
const ids = [...COMPETENCES, ...COMPETENCES_EXEMPLE].map(c => c.id).sort()
verifier(JSON.stringify(Object.values(K).sort()) === JSON.stringify(ids), 'K contient toutes les compétences du programme (node scripts/ids.mjs sinon)')
verifier(JSON.stringify(Object.values(D).sort()) === JSON.stringify([...DOMAINES, ...DOMAINES_EXEMPLE].map(x => x.id).sort()), 'D contient tous les domaines du programme')
verifier(exemple.id === 'exemple', 'la définition de l\'exemple se charge')

process.exit(nbEchecs() ? 1 : 0)

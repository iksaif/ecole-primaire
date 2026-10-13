// Ceintures de compétences (node) : palettes, dessin (couleur et noir et blanc), réglages communs lus avec méfiance, seuil d'un brevet.
import { PALETTES, IDS_PALETTES, couleursDe } from '../src/ceintures/palettes.ts'
import { ceintureSvg } from '../src/ceintures/dessin.ts'
import { DEFAUT_CEINTURES, BORNES, STYLES_CEINTURE, assainirCeintures, brevetReussi } from '../src/ceintures/reglages.ts'
import { demandeDeLAdresse, extensionActive, extensionActivePour } from '../src/extensions/activation.ts'
import { SITES } from '../src/sites.ts'
import { module as activite } from '../src/exercices/ceintures/index.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { SUPPORTS } from '../src/exercices/ceintures/donnees.ts'
import { CHOIX_PISTE, objectifsDe } from '../src/ceintures/pistes.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { brevetDe, tablesDuBrevet, PISTES_AVEC_BREVET, NB_CEINTURES_BREVET } from '../src/ceintures/brevets.ts'
import { module as brevet } from '../src/exercices/ceintures-brevet/index.ts'
import { PISTES, IDS_PISTES, pisteDeExercice, ceintureDisponible, EXERCICES_AVEC_BREVET as EXERCICES_PISTES } from '../src/ceintures/pistes.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { REGISTRE } from '../src/exercices/index.ts'
import { LANGUES } from '../src/langues/registre.ts'
import { verifier, nbEchecs } from './outils.mjs'

console.log('Palettes')
verifier(IDS_PALETTES.length === 4, 'quatre palettes')
for (const id of IDS_PALETTES) {
  const { couleurs } = PALETTES[id]
  verifier(couleurs.length >= BORNES.nbCeintures.min && couleurs.length <= BORNES.nbCeintures.max, `${id} : ${couleurs.length} couleurs, dans les bornes`)
  verifier(new Set(couleurs.map(c => c.id)).size === couleurs.length, `${id} : des identifiants distincts`)
  verifier(couleurs.every(c => /^#[0-9a-f]{6}$/.test(c.hex)), `${id} : des teintes valides`)
}
// une ceinture se reconnaît sans couleur : dans une même palette, jamais deux ceintures au même motif
for (const id of IDS_PALETTES) {
  const motifs = PALETTES[id].couleurs.map(c => c.motif)
  verifier(new Set(motifs).size === motifs.length, `${id} : deux ceintures ne partagent jamais leur motif (${motifs.join(', ')})`)
}
verifier(couleursDe('judo', 4).map(c => c.id).join() === 'blanche,jaune,orange,verte', 'couleursDe : les premières de la palette')
verifier(couleursDe('paliers', 8).length === 5 && couleursDe('judo', 0).length === 1, 'couleursDe : borné par la palette, au moins une')

console.log('Noms des couleurs (fr et br)')
const toutes = new Set(IDS_PALETTES.flatMap(id => PALETTES[id].couleurs.map(c => c.id)))
for (const code of ['fr', 'br']) {
  const noms = LANGUES[code].textes.ceintures.ceinture
  const manquants = [...toutes].filter(id => !noms[id])
  verifier(!manquants.length, `${code} : un nom pour chaque couleur ${manquants.join(', ')}`)
  const palettes = LANGUES[code].textes.ceintures.palette
  verifier(IDS_PALETTES.every(id => palettes[id]), `${code} : un nom pour chaque palette`)
  verifier(STYLES_CEINTURE.every(s => LANGUES[code].textes.ceintures.style[s]), `${code} : un nom pour chaque style`)
}

console.log('Dessin')
const jaune = PALETTES.judo.couleurs[1]
for (const style of STYLES_CEINTURE) {
  const svg = ceintureSvg({ couleur: jaune, style, noirEtBlanc: false, largeur: '30mm' })
  verifier(svg.startsWith('<svg') && svg.endsWith('</svg>') && svg.includes(jaune.hex) && !svg.includes('<pattern'), `${style} : couleur, sans motif`)
  const nb = ceintureSvg({ couleur: jaune, style, noirEtBlanc: true, largeur: '30mm' })
  verifier(nb.includes(`url(#ceint-${jaune.motif})`) && nb.includes('<pattern') && !nb.includes(jaune.hex), `${style} : noir et blanc, le motif remplace la teinte`)
}
verifier(ceintureSvg({ couleur: jaune, style: 'ruban', noirEtBlanc: false, largeur: '30mm' }) === ceintureSvg({ couleur: jaune, style: 'ruban', noirEtBlanc: false, largeur: '30mm' }), 'déterministe')

console.log('Réglages communs')
verifier(JSON.stringify(assainirCeintures(undefined)) === JSON.stringify(DEFAUT_CEINTURES), 'rien de mémorisé : le défaut')
for (const abime of [null, 42, 'x', [], [[1]], {}, { palette: 3, style: {}, noirEtBlanc: 'oui', nbCeintures: 'beaucoup', seuil: NaN, questions: Infinity, chronometre: 7 }]) {
  verifier(JSON.stringify(assainirCeintures(abime)) === JSON.stringify(DEFAUT_CEINTURES), `valeur abîmée ${JSON.stringify(abime)} : le défaut`)
}
const hors = assainirCeintures({ nbCeintures: 99, seuil: 10, questions: -4 })
verifier(hors.nbCeintures === 7 && hors.seuil === 50 && hors.questions === 5, `hors bornes : ramené aux bornes (${JSON.stringify(hors)})`)
verifier(assainirCeintures({ palette: 'paliers', nbCeintures: 8 }).nbCeintures === 5, 'le nombre de ceintures ne dépasse pas la palette')
const bon = assainirCeintures({ palette: 'rose-violet', style: 'rond', noirEtBlanc: true, nbCeintures: 4, seuil: 80, questions: 20, chronometre: 'doux' })
verifier(bon.palette === 'rose-violet' && bon.style === 'rond' && bon.noirEtBlanc && bon.nbCeintures === 4 && bon.seuil === 80 && bon.questions === 20 && bon.chronometre === 'doux', 'des valeurs valides sont gardées')

console.log('Brevet')
verifier(brevetReussi(9, 10, 90) && !brevetReussi(8, 10, 90) && brevetReussi(10, 10, 100) && !brevetReussi(9, 10, 100), 'seuil 90 et 100 %')
verifier(brevetReussi(18, 20, 90) && !brevetReussi(17, 20, 90), 'le seuil suit le nombre de questions')
verifier(!brevetReussi(0, 0, 50), 'aucune question : jamais réussi')

console.log('Activité : chaque support, chaque piste, fr et br')
const base = { niveau: 'ce1', support: 'livret', piste: 'tables', intitule: '', objectifs: 'Un\nDeux\nTrois', copies: 2, ceinture: 3, prenom: '' }
for (const langue of ['fr', 'br']) {
  const T = traducteur(activite.textes, langue)
  for (const support of SUPPORTS) for (const piste of CHOIX_PISTE) {
    const reglages = { ...base, support, piste }
    const x = activite.generateur.questionsFiche({ niveau: 'ce1', reglages, T, rng: creerRng(7) })
    const html = activite.fiche.fiche({ questions: x, reglages, T, langue })
    const manque = html.match(/\b(piste|couleur|support|ceinture)\.[a-z-]+/)
    verifier(x.objectifs.length >= 3 && html.includes('<svg') && html.includes('class="entete"') && !manque, `${langue} ${support} / ${piste} : ${x.objectifs.length} ceintures, aucune clé de texte brute${manque ? ' (' + manque[0] + ')' : ''}`)
  }
}
{
  const T = traducteur(activite.textes, 'fr')
  const reglages = { ...base, support: 'bandes' }
  const x = activite.generateur.questionsFiche({ niveau: 'ce1', reglages, T, rng: creerRng(7) })
  const nb = activite.fiche.fiche({ questions: x, reglages, T, langue: 'fr', extensions: { ceintures: { ...DEFAUT_CEINTURES, noirEtBlanc: true } } })
  verifier(nb.includes('<pattern') && !nb.includes('#3aa655'), 'noir et blanc : des motifs, aucune teinte')
  const libre = activite.generateur.questionsFiche({ niveau: 'ce1', reglages: { ...base, piste: 'libre', intitule: ' Mon titre ', objectifs: 'a\n\n b |c' }, T, rng: creerRng(7) })
  verifier(libre.titreLibre === 'Mon titre' && libre.objectifs.join() === 'a,b,c', 'piste libre : titre et objectifs nettoyés')
  verifier(objectifsDe(Array.from({ length: 20 }, (_, i) => i).join('\n')).length === 8, 'au plus huit objectifs')
}

console.log('Brevets')
const REGLAGES_BREVET = { niveau: 'ce2', piste: 'tables', ceinture: 1, tablesPerso: false, tables: [2, 5, 10], divisions: 'auto', jusqu: 10, prenom: '' }
const tablesDe = lignes => [...new Set(lignes.map(l => Number(l.enonce.split(/ [×÷] /)[0])))]
for (const [indice, attendues] of [[0, [2, 5, 10]], [1, [3, 4]], [2, [6, 7]], [3, [8, 9]]]) {
  const lignes = brevetDe('tables', indice, creerRng(3))
  const ok = lignes.length === Math.min(30, attendues.length * 10) && lignes.every(l => /^\d+ × \d+ =$/.test(l.enonce) && Number(l.enonce.split(' × ')[0]) * Number(l.enonce.split(' × ')[1].replace(' =', '')) === Number(l.reponse))
  verifier(ok && tablesDe(lignes).every(t => attendues.includes(t)) && attendues.every(t => tablesDe(lignes).includes(t)), `tables, ceinture ${indice + 1} : ${attendues.join(', ')} seulement, réponses justes, tous les calculs de ces tables (au plus 30)`)
}
const dernieres = brevetDe('tables', 5, creerRng(3))
verifier(dernieres.some(l => l.enonce.includes('÷')) && dernieres.every(l => (l.enonce.includes('÷') ? Number(l.enonce.split(' ÷ ')[0].replace(' =', '')) / Number(l.enonce.split(' ÷ ')[1].replace(' =', '')) : Number(l.enonce.split(' × ')[0]) * Number(l.enonce.split(' × ')[1].replace(' =', ''))) === Number(l.reponse)), 'tables, dernière ceinture : des divisions, réponses justes')
verifier(JSON.stringify(brevetDe('tables', 2, creerRng(9))) === JSON.stringify(brevetDe('tables', 2, creerRng(9))) && JSON.stringify(brevetDe('tables', 2, creerRng(9))) !== JSON.stringify(brevetDe('tables', 2, creerRng(10))), 'brevet : la même graine, le même brevet ; une autre, un autre')
verifier(PISTES_AVEC_BREVET.every(p => NB_CEINTURES_BREVET[p] >= 3), 'chaque piste avec brevet a ses ceintures')
{
  // options de la piste tables : ses propres tables, sans ou avec divisions, jusqu'à 12
  const tirer = options => brevet.generateur.questionsFiche({ niveau: 'ce2', reglages: { ...REGLAGES_BREVET, ceinture: 2, ...options }, rng: creerRng(4) })
  const perso = tirer({ tablesPerso: true, tables: [7, 11] })
  verifier(perso.tables.join() === '7,11' && perso.questions.every(q => /^(7|11) × /.test(q.enonce)), 'tables choisies : seulement 7 et 11, au lieu de celles de la ceinture')
  verifier(tirer({ tablesPerso: false, tables: [7] }).tables.join() === '3,4', 'sans « je choisis » : les tables de la ceinture')
  verifier(tirer({ divisions: 'oui' }).questions.some(q => q.enonce.includes('÷')) && !tirer({ divisions: 'non', ceinture: 6 }).questions.some(q => q.enonce.includes('÷')), 'divisions : oui en ajoute, non n’en met jamais (même à la dernière ceinture)')
  const douze = tirer({ jusqu: 12, tablesPerso: true, tables: [12] })
  verifier(douze.questions.length === 12 && douze.questions.some(q => q.enonce === '12 × 12 =' && q.reponse === '144'), 'jusqu’à 12 : 12 × 12 = 144')
  verifier(tablesDuBrevet(0, { tables: [], divisions: 'auto', jusqu: 10 }).join() === '2,5,10', 'aucune table choisie : celles de la ceinture')
}
for (const langue of ['fr', 'br']) {
  const T = traducteur(brevet.textes, langue)
  const reglages = { ...REGLAGES_BREVET, ceinture: 4 }
  const x = brevet.generateur.questionsFiche({ niveau: 'ce2', reglages, rng: creerRng(5) })
  const html = brevet.fiche.fiche({ questions: x, reglages, T, langue, extensions: { ceintures: { ...DEFAUT_CEINTURES, questions: 10, seuil: 90 } } })
  const manque = html.match(/\b(ceintures|ceinture|tables)\.[a-z-]+/)
  verifier(x.indice === 3 && (html.match(/class="q"/g) ?? []).length === 10 && html.includes('class="corrige"') && html.includes('class="entete"') && !manque, `${langue} brevet papier : 10 questions, corrigé, aucune clé brute${manque ? ' (' + manque[0] + ')' : ''}`)
  if (langue === 'fr') {
    verifier(html.includes('9 bonnes réponses sur 10') && html.includes('Ceinture verte'), 'brevet papier : 9 bonnes réponses sur 10, ceinture verte')
    const html20 = brevet.fiche.fiche({ questions: x, reglages, T, langue, extensions: { ceintures: { ...DEFAUT_CEINTURES, questions: 20, seuil: 80 } } })
    verifier(html20.includes('16 bonnes réponses sur 20'), 'brevet papier : 80 % de 20 = 16')
  }
}
{
  const hors = brevet.generateur.questionsFiche({ niveau: 'ce2', reglages: { ...REGLAGES_BREVET, ceinture: 6 }, rng: creerRng(5) })
  verifier(hors.indice === NB_CEINTURES_BREVET.tables - 1, 'numéro de ceinture au-delà de la piste : ramené à la dernière')
}

console.log('Brevets du calcul mental')
// la réponse attendue d'une question, recalculée d'après son énoncé : « 14 + 10 = », « 20 − 2 = », « 7 × 2 = », « 18 ÷ 2 = », « 35 + … = 100 »
function attendu(enonce) {
  let m = enonce.match(/^(\d+) ([+−×÷]) (\d+) =$/)
  if (m) { const [a, b] = [Number(m[1]), Number(m[3])]; return { '+': a + b, '−': a - b, '×': a * b, '÷': a / b }[m[2]] }
  m = enonce.match(/^(\d+) \+ … = (\d+)$/)
  return m ? Number(m[2]) - Number(m[1]) : NaN
}
const FAMILLES = [/^\d+ [+−] (1|2|10) =$/, /^\d+ [×÷] 2 =$/, /^\d+ \+ … = (10|100)$/, /^\d+ [+−] \d+ =$/, /^\d+ × (10|100) =$/]
for (let indice = 0; indice < NB_CEINTURES_BREVET['calcul-mental']; indice++) {
  const lignes = brevetDe('calcul-mental', indice, creerRng(8 + indice))
  const justes = lignes.every(l => attendu(l.enonce) === Number(l.reponse) && Number(l.reponse) >= 0 && Number.isInteger(Number(l.reponse)))
  const dansLaFamille = indice === 5 || lignes.every(l => FAMILLES[indice].test(l.enonce))
  verifier(lignes.length >= 20 && lignes.length <= 30 && justes && dansLaFamille && new Set(lignes.map(l => l.enonce)).size === lignes.length, `calcul mental, ceinture ${indice + 1} : ${lignes.length} questions justes, sans doublon, de la bonne famille`)
}
verifier(new Set(brevetDe('calcul-mental', 5, creerRng(2)).map(l => FAMILLES.findIndex(f => f.test(l.enonce)))).size >= 4, 'calcul mental, dernière ceinture : plusieurs familles mêlées')
verifier(JSON.stringify(brevetDe('calcul-mental', 1, creerRng(5))) === JSON.stringify(brevetDe('calcul-mental', 1, creerRng(5))), 'calcul mental : même graine, même brevet')
{
  const T = traducteur(brevet.textes, 'fr')
  const reglages = { ...REGLAGES_BREVET, piste: 'calcul-mental', ceinture: 3 }
  const x = brevet.generateur.questionsFiche({ niveau: 'ce2', reglages, rng: creerRng(5) })
  const html = brevet.fiche.fiche({ questions: x, reglages, T, langue: 'fr' })
  verifier(x.tables.length === 0 && html.includes('Calcul mental') && !html.includes('tables :') && html.includes('Ceinture orange') && html.includes('class="corrige"'), 'brevet papier du calcul mental : titre de l’exercice, sans tables, ceinture orange, corrigé')
}

console.log('Pistes : ceintures, réglages et exercices')
for (const langue of ['fr', 'br']) {
  const Tc = traducteur(activite.textes, langue)
  for (const id of IDS_PISTES) {
    const nbObjectifs = objectifsDe(Tc(`piste.${id}.objectifs`)).length
    verifier(PISTES[id].ceintures.length === nbObjectifs, `${langue} ${id} : autant de ceintures (${PISTES[id].ceintures.length}) que d’objectifs écrits (${nbObjectifs})`)
  }
}
verifier(pisteDeExercice('tables')?.id === 'tables' && pisteDeExercice('calcul-mental')?.id === 'calcul-mental' && !pisteDeExercice('heure') && EXERCICES_PISTES.join() === 'tables,calcul-mental', 'pisteDeExercice : les tables et le calcul mental')
for (const piste of Object.values(PISTES).filter(p => p.exercice)) {
  const module = REGISTRE.find(m => m.definition.id === piste.exercice)
  const classes = Object.keys(module.definition.niveaux)
  verifier(piste.ceintures.length >= 3 && piste.ceintures.length <= 8 && piste.ceintures.every(c => c.reglages), `${piste.id} : de 3 à 8 ceintures, chacune avec ses réglages`)
  for (const niveau of classes) for (const [indice, c] of piste.ceintures.entries()) {
    if (!ceintureDisponible(piste, indice, niveau, classes)) continue
    const demande = c.reglages(niveau)
    const obtenu = reglagesDuNiveau(module.definition, { ...demande, niveau })
    const problemes = []
    for (const [cle, voulu] of Object.entries(demande)) {
      const recu = obtenu[cle]
      if (Array.isArray(voulu)) {
        // une liste : l'exercice garde celles qu'il offre dans ce niveau ; au moins une, et jamais une que l'on n'a pas demandée (pas de repli silencieux sur le défaut)
        if (!recu.length || !recu.every(v => voulu.includes(v))) problemes.push(`${cle} : ${JSON.stringify(voulu)} → ${JSON.stringify(recu)}`)
        if (piste.id === 'tables' && recu.join() !== voulu.join()) problemes.push(`${cle} : tables changées ${JSON.stringify(recu)}`)
      } else if (recu !== voulu) problemes.push(`${cle} : ${voulu} → ${recu}`)
    }
    verifier(!problemes.length, `${piste.id}, ceinture ${indice + 1}, ${niveau} : l’exercice accepte les réglages ${problemes.join(' ; ')}`)
  }
}
{
  const cm = PISTES['calcul-mental']
  const classes = ['cp', 'ce1', 'ce2', 'cm1', 'cm2']
  verifier(!ceintureDisponible(cm, 4, 'cp', classes) && ceintureDisponible(cm, 4, 'ce1', classes) && ceintureDisponible(cm, 0, 'cp', classes) && !ceintureDisponible(cm, 6, 'ce1', classes) && !ceintureDisponible(cm, 0, 'ps', classes), '« × 10 et tables » n’existe pas au CP ; les autres, si ; une ceinture hors piste ou une classe hors exercice : non')
}

console.log('Option (cachée par défaut)')
verifier(demandeDeLAdresse({ ceintures: 'oui' }, 'ceintures') === true && demandeDeLAdresse({ ceintures: 'non' }, 'ceintures') === false && demandeDeLAdresse({ ceintures: '1' }, 'ceintures') === null && demandeDeLAdresse({}, 'ceintures') === null, 'demandeDeLAdresse : oui, non, ou rien')
verifier(demandeDeLAdresse({ ceintures: ['oui', 'non'] }, 'ceintures') === true, 'demandeDeLAdresse : le premier de plusieurs paramètres')
verifier(Object.values(SITES).every(s => s.extensionsVisibles.length === 0), 'aucun site ne propose d’extension d’office')
verifier(!extensionActive('ceintures') && Object.values(SITES).every(s => !extensionActivePour('ceintures', s)), 'sans réglage d’appareil : les ceintures sont cachées')

process.exit(nbEchecs() ? 1 : 0)

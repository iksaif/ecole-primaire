// Ceintures de compétences (node) : palettes, dessin (couleur et noir et blanc), réglages communs lus avec méfiance, seuil d'un brevet.
import { PALETTES, IDS_PALETTES, couleursDe } from '../src/ceintures/palettes.ts'
import { ceintureSvg } from '../src/ceintures/dessin.ts'
import { nbCeinturesDe } from '../src/ceintures/reglages.ts'
import { DEFAUT_CEINTURES, BORNES, STYLES_CEINTURE, assainirCeintures, brevetReussi } from '../src/ceintures/reglages.ts'
import { demandeDeLAdresse, extensionActive, extensionActivePour } from '../src/extensions/activation.ts'
import { SITES } from '../src/sites.ts'
import { module as activite } from '../src/exercices/ceintures/index.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { SUPPORTS } from '../src/exercices/ceintures/donnees.ts'
import { CHOIX_PISTE, objectifsDe } from '../src/ceintures/pistes.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { PISTES, IDS_PISTES, pisteDeExercice, ceintureDisponible, blocsDe, EXERCICES_AVEC_BREVET as EXERCICES_PISTES } from '../src/ceintures/pistes.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { REGISTRE } from '../src/exercices/index.ts'
import { brevetPapier, tirageDuBrevet, partsEgales, brevetPossible } from '../src/ceintures/brevet.ts'
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

console.log('Pistes : ceintures, réglages et exercices')
for (const langue of ['fr', 'br']) {
  const Tc = traducteur(activite.textes, langue)
  for (const id of IDS_PISTES) {
    const nbObjectifs = objectifsDe(Tc(`piste.${id}.objectifs`)).length
    verifier(PISTES[id].ceintures.length === nbObjectifs, `${langue} ${id} : autant de ceintures (${PISTES[id].ceintures.length}) que d’objectifs écrits (${nbObjectifs})`)
  }
}
verifier(pisteDeExercice('tables')?.id === 'tables' && pisteDeExercice('calcul-mental')?.id === 'calcul-mental' && !pisteDeExercice('heure') && EXERCICES_PISTES.join() === 'tables,calcul-mental', 'pisteDeExercice : les tables et le calcul mental')
const moduleDe = id => REGISTRE.find(m => m.definition.id === id)
const classesDe = id => Object.keys(moduleDe(id).definition.niveaux)
for (const piste of Object.values(PISTES).filter(p => p.exercice)) {
  verifier(piste.ceintures.length >= 3 && piste.ceintures.length <= 8 && piste.ceintures.every((_, k) => blocsDe(piste, k).length > 0), `${piste.id} : de 3 à 8 ceintures, chacune avec au moins un bloc`)
  for (const niveau of classesDe(piste.exercice)) for (const [indice] of piste.ceintures.entries()) {
    if (!ceintureDisponible(piste, indice, niveau, classesDe)) continue
    // chaque bloc : l'exercice accepte ses réglages tels quels
    for (const bloc of blocsDe(piste, indice)) {
      const module = moduleDe(bloc.exercice)
      const demande = bloc.reglages?.(niveau) ?? {}
      const obtenu = reglagesDuNiveau(module.definition, { ...demande, niveau })
      const problemes = []
      for (const [cle, voulu] of Object.entries(demande)) {
        const recu = obtenu[cle]
        if (Array.isArray(voulu)) {
          // une liste : l'exercice garde celles qu'il offre dans ce niveau ; au moins une, et jamais une que l'on n'a pas demandée (pas de repli silencieux sur le défaut)
          if (!recu.length || !recu.every(v => voulu.includes(v))) problemes.push(`${cle} : ${JSON.stringify(voulu)} → ${JSON.stringify(recu)}`)
          if (bloc.exercice === 'tables' && recu.join() !== voulu.join()) problemes.push(`${cle} : tables changées ${JSON.stringify(recu)}`)
        } else if (recu !== voulu) problemes.push(`${cle} : ${voulu} → ${recu}`)
      }
      verifier(!problemes.length, `${piste.id}, ceinture ${indice + 1}, ${niveau}, ${bloc.exercice} : l’exercice accepte les réglages ${problemes.join(' ; ')}`)
    }
  }
}
{
  const cm = PISTES['calcul-mental']
  verifier(!ceintureDisponible(cm, 4, 'cp', classesDe) && ceintureDisponible(cm, 4, 'ce1', classesDe) && ceintureDisponible(cm, 0, 'cp', classesDe) && !ceintureDisponible(cm, 6, 'ce1', classesDe) && !ceintureDisponible(cm, 0, 'ps', classesDe), '« × 10 et tables » n’existe pas au CP ; les autres, si ; une ceinture hors piste ou une classe hors exercice : non')
  verifier(blocsDe(cm, 5).map(b => b.exercice).join() === 'calcul-mental,tables' && blocsDe(cm, 0).map(b => b.exercice).join() === 'calcul-mental' && blocsDe(PISTES.lettres, 0).length === 0, 'blocs : la dernière ceinture du calcul mental mêle deux exercices, les autres un seul, les lettres aucun')
  verifier(!ceintureDisponible(cm, 5, 'cp', classesDe) && ceintureDisponible(cm, 5, 'ce2', classesDe), 'ceinture mêlant deux exercices : classes communes aux deux (et ses propres classes)')
}

console.log('Brevet papier : un assemblage de la fiche de l’exercice')
const brevetDe2 = (piste, indice, niveau, extra = {}) => {
  const p = PISTES[piste]
  return { modules: REGISTRE, piste: p, indice, niveau, graine: 5, langue: 'fr', ceintures: DEFAUT_CEINTURES, ...extra }
}
for (const piste of Object.values(PISTES).filter(p => p.exercice)) {
  for (const niveau of classesDe(piste.exercice)) for (const indice of piste.ceintures.keys()) {
    if (!ceintureDisponible(piste, indice, niveau, classesDe)) continue
    const nom = `${piste.id}, ceinture ${indice + 1}, ${niveau}`
    const d = brevetDe2(piste.id, indice, niveau)
    const t = tirageDuBrevet(d)
    const voulues = piste.ceintures[indice].questions ?? DEFAUT_CEINTURES.questions
    const html = brevetPapier(d)
    const manque = html.match(/\b(ceintures|ceinture|brevet|communs)\.[a-z-]+/)
    verifier(t.nbQuestions > 0 && t.nbQuestions <= voulues && t.bonnes === Math.ceil(t.nbQuestions * 0.9)
      && (html.match(/class="entete"/g) ?? []).length === 1 && (html.match(/<section class="corrige"/g) ?? []).length === 1
      && html.includes(`${t.bonnes} bonnes réponses sur ${t.nbQuestions}`) && html.includes('<svg') && !manque,
    `${nom} : ${t.nbQuestions} questions (au plus ${voulues}), ${t.bonnes} bonnes réponses, un entête, un corrigé${manque ? ` — clé brute ${manque[0]}` : ''}`)
    if (piste.id === 'tables') {
      const operandes = [...t.blocs[0].fragment.corps.matchAll(/(\d+) × (\d+) =/g)].map(m => Number(m[1]))
      const tables = blocsDe(piste, indice)[0].reglages(niveau).tables
      verifier(operandes.length > 0 && operandes.every(a => tables.includes(a)), `${nom} : seulement les tables ${tables.join(', ')}`)
    }
  }
}
{
  const dernier = tirageDuBrevet(brevetDe2('tables', 5, 'cm1'))
  verifier(dernier.nbQuestions === 30 && brevetPapier(brevetDe2('tables', 5, 'cm1')).includes('en 3 minutes'), 'tables, dernière ceinture : 30 questions en 3 minutes (réglage de la ceinture, pas du réglage commun)')
  const reduit = tirageDuBrevet(brevetDe2('tables', 0, 'ce2', { ceintures: { ...DEFAUT_CEINTURES, questions: 5, seuil: 80 } }))
  verifier(reduit.nbQuestions === 5 && reduit.bonnes === 4, 'réglage commun : 5 questions, 80 % → 4 bonnes réponses')
  const vingt = tirageDuBrevet(brevetDe2('calcul-mental', 0, 'ce2', { ceintures: { ...DEFAUT_CEINTURES, questions: 20, seuil: 80 } }))
  verifier(vingt.nbQuestions === 20 && vingt.bonnes === 16 && vingt.blocs[0].config.nbFiche >= 20, 'calcul mental : 20 questions (le nombre de calculs de la fiche suit), 16 bonnes réponses sur 20')
  const perso = tirageDuBrevet(brevetDe2('tables', 0, 'ce2', { reglages: { tables: [7, 11], jusqu: 12 } }))
  verifier(perso.blocs[0].config.tables.join() === '7,11' && perso.blocs[0].config.jusqu === 12, 'tables choisies et « jusqu’à 12 » : elles l’emportent sur la ceinture')
  verifier(brevetPapier(brevetDe2('tables', 1, 'ce1')) === brevetPapier(brevetDe2('tables', 1, 'ce1')) && brevetPapier(brevetDe2('tables', 1, 'ce1')) !== brevetPapier(brevetDe2('tables', 1, 'ce1', { graine: 6 })), 'même graine, même brevet ; une autre, un autre')
  let refus = ''
  try { brevetPapier(brevetDe2('calcul-mental', 4, 'cp')) } catch (e) { refus = String(e.message) }
  verifier(/n’existe pas en cp/.test(refus), '« × 10 et tables » au CP : refusé, pas de repli silencieux')
  const br = brevetPapier(brevetDe2('calcul-mental', 2, 'ce1', { langue: 'br' }))
  verifier(br.includes('lang="br"') && !/\b(ceintures|ceinture|brevet)\.[a-z-]+/.test(br), 'en breton : un document complet sans clé brute')
}

console.log('Brevet de plusieurs exercices')
{
  // la dernière ceinture du calcul mental : calcul mental + tables, le total des questions partagé
  const t = tirageDuBrevet(brevetDe2('calcul-mental', 5, 'ce2'))
  verifier(t.blocs.map(b => b.exercice).join() === 'calcul-mental,tables' && t.blocs.map(b => b.nbQuestions).join() === '5,5' && t.nbQuestions === 10, 'deux blocs, 10 questions partagées (5 + 5)')
  const html = brevetPapier(brevetDe2('calcul-mental', 5, 'ce2'))
  verifier((html.match(/<h2 class="titre-bloc">/g) ?? []).length === 2 && html.includes('<h2 class="titre-bloc">Calcul mental</h2>') && html.includes('<h2 class="titre-bloc">Tables de multiplication</h2>'), 'un titre par exercice')
  verifier((html.match(/<section class="corrige"/g) ?? []).length === 1 && (html.match(/class="corrige-bloc"/g) ?? []).length === 2 && (html.match(/class="entete"/g) ?? []).length === 1 && html.includes('9 bonnes réponses sur 10'), 'un seul corrigé (deux sous-corrigés), une ligne Prénom / Date, le total des questions pour le seuil')
  const impair = tirageDuBrevet(brevetDe2('calcul-mental', 5, 'ce2', { ceintures: { ...DEFAUT_CEINTURES, questions: 11 } }))
  verifier(impair.blocs.map(b => b.nbQuestions).join() === '6,5' && partsEgales(11, 2).join() === '6,5' && partsEgales(10, 3).join() === '4,3,3' && partsEgales(2, 3).join() === '1,1,0', 'le total se partage : les premiers blocs prennent le reste')
  // un brevet sur mesure : une piste construite à la main, avec ses blocs
  const capables = REGISTRE.filter(m => brevetPossible(m, 'ce1')).map(m => m.definition.id)
  verifier(capables.includes('tables') && capables.includes('calcul-mental') && !capables.includes('monnaie') && !capables.includes('ecriture'), `exercices capables de faire un bloc de brevet en CE1 : ${capables.join(', ')} (pas la monnaie, en deux parties, ni l’écriture)`)
  verifier(!brevetPossible(REGISTRE.find(m => m.definition.id === 'lettres'), 'ce2') && !brevetPossible(REGISTRE.find(m => m.definition.id === 'tables'), 'cp'), 'un exercice sans cette classe : non')
  // un brevet sur mesure : une piste construite à la main, avec ses blocs (le premier avec son nombre de questions)
  const surMesure = { id: 'sur-mesure', titre: 'Mes exercices', ceintures: [{ blocs: [{ exercice: 'calcul-mental', questions: 4 }, { exercice: 'tables' }] }] }
  const m = tirageDuBrevet({ modules: REGISTRE, piste: surMesure, indice: 0, niveau: 'ce1', graine: 3, langue: 'fr', ceintures: DEFAUT_CEINTURES })
  verifier(m.blocs.map(b => b.exercice).join() === 'calcul-mental,tables' && m.blocs[0].nbQuestions === 4 && m.blocs[1].nbQuestions === 5 && brevetPapier({ modules: REGISTRE, piste: surMesure, indice: 0, niveau: 'ce1', graine: 3, langue: 'fr', ceintures: DEFAUT_CEINTURES }).includes('Mes exercices'), 'piste sur mesure : ses blocs (4 questions pour le premier, sa part égale du total pour l’autre), son titre')
  let refus = ''
  try { tirageDuBrevet({ modules: REGISTRE, piste: { id: 'sur-mesure', ceintures: [{ blocs: [{ exercice: 'nexistepas' }] }] }, indice: 0, niveau: 'ce1', graine: 1, langue: 'fr', ceintures: DEFAUT_CEINTURES }) } catch (e) { refus = String(e.message) }
  verifier(/n’existe pas en ce1|pas au registre/.test(refus), 'un exercice inconnu : refusé')
}

console.log('Nombre de ceintures montrées')
verifier(nbCeinturesDe(DEFAUT_CEINTURES, 6) === 6 && nbCeinturesDe(DEFAUT_CEINTURES, 5) === 5 && nbCeinturesDe(DEFAUT_CEINTURES, 8) === 6, 'palette judo (7), 6 choisies : la piste, au plus 6')
verifier(nbCeinturesDe({ ...DEFAUT_CEINTURES, palette: 'paliers', nbCeintures: 6 }, 6) === 5, 'palette sans couleur (5 niveaux) : 5 ceintures, même si on en a choisi 6')
verifier(nbCeinturesDe({ ...DEFAUT_CEINTURES, nbCeintures: 4 }, 6) === 4 && nbCeinturesDe({ ...DEFAUT_CEINTURES, nbCeintures: 3 }, 2) === 2 && nbCeinturesDe(DEFAUT_CEINTURES, 0) === 1, 'le nombre choisi limite ; une piste plus courte aussi ; au moins une')
verifier(nbCeinturesDe({ ...DEFAUT_CEINTURES, palette: 'judo-rouge', nbCeintures: 8 }, 8) === 8, 'palette à 8 couleurs : jusqu’à 8')
{
  const piste = PISTES.tables
  const demande = (ceintures, indice) => ({ modules: REGISTRE, piste, indice, niveau: 'ce2', graine: 5, langue: 'fr', ceintures })
  const refus = (ceintures, indice) => { try { brevetPapier(demande(ceintures, indice)); return '' } catch (e) { return String(e.message) } }
  const paliers = { ...DEFAUT_CEINTURES, palette: 'paliers', nbCeintures: 5 }
  verifier(!refus(paliers, 4) && /n’existe pas avec cette palette/.test(refus(paliers, 5)), 'palette à 5 niveaux : le brevet de la 5e ceinture existe, celui de la 6e est refusé')
  verifier(/n’existe pas avec cette palette \(4 ceintures\)/.test(refus({ ...DEFAUT_CEINTURES, nbCeintures: 4 }, 4)), 'quatre ceintures choisies : la 5e est refusée')
  const html = brevetPapier(demande(paliers, 4))
  verifier(html.includes('Niveau 5') && !html.includes('Ceinture marron'), 'palette sans couleur : l’en-tête dit « Niveau 5 », pas une ceinture marron')
}

console.log('Option (cachée par défaut)')
verifier(demandeDeLAdresse({ ceintures: 'oui' }, 'ceintures') === true && demandeDeLAdresse({ ceintures: 'non' }, 'ceintures') === false && demandeDeLAdresse({ ceintures: '1' }, 'ceintures') === null && demandeDeLAdresse({}, 'ceintures') === null, 'demandeDeLAdresse : oui, non, ou rien')
verifier(demandeDeLAdresse({ ceintures: ['oui', 'non'] }, 'ceintures') === true, 'demandeDeLAdresse : le premier de plusieurs paramètres')
verifier(Object.values(SITES).every(s => s.extensionsVisibles.length === 0), 'aucun site ne propose d’extension d’office')
verifier(!extensionActive('ceintures') && Object.values(SITES).every(s => !extensionActivePour('ceintures', s)), 'sans réglage d’appareil : les ceintures sont cachées')

process.exit(nbEchecs() ? 1 : 0)

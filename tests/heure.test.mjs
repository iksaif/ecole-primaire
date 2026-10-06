// Lire l'heure (exercice reporté dans la base) : l'heure dite en lettres, les listes du catalogue, le CP sans minutes, les réponses.
//   node tests/heure.test.mjs
import { module as heure } from '../src/exercices/heure/index.ts'
import { oral12, oralJournee, ecrit, hm, ecritDuree, questions, questionsFiche, verifier, bonneReponse, mauvaiseReponse, aideMinutesPossible, minutesDisponibles } from '../src/exercices/heure/generateur.ts'
import { svgHorloge } from '../src/exercices/heure/horloge.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { CODES } from '../src/langues/registre.ts'
import { slugBilan, slugFiche } from '../src/noyau/slugs.ts'
import { verifier as ok, nbEchecs } from './outils.mjs'

const { definition, textes } = heure
const T = l => traducteur(textes, l)
const reglages = (niveau, extra = {}) => reglagesDuNiveau(definition, { niveau, ...extra })

console.log('Les adresses publiées ne changent pas')
const slugs = [...['cp', 'ce1', 'ce2'].map(n => slugBilan('heure', n)), ...definition.fiches.map(f => slugFiche('heure', f))]
ok(slugs.join() === 'exercices-heure-cp,exercices-heure-ce1,exercices-heure-ce2,exercices-heure-ce1-lire,exercices-heure-ce2-lire,exercices-heure-ce1-durees,exercices-heure-ce2-durees', 'bilans du CP, du CE1 et du CE2, fiches « lire » et « durées »')
ok(definition.route === '/maths/heure' && Object.keys(definition.niveaux).join() === 'cp,ce1,ce2' && definition.emoji === '🕐', 'route, niveaux et emoji')

console.log("Les listes du catalogue (séparées par « | ») ont la même taille dans chaque langue")
for (const l of CODES) {
  const t = T(l)
  ok(t('mots.heures12').split('|').length === 13 && t('mots.heures12').startsWith('|'), `${l} : 13 heures (indice 0 vide)`)
  ok(t('mots.heures24').split('|').length === 24, `${l} : 24 heures`)
  ok(t('mots.minutes').split('|').length === 60 && t('mots.minutes').startsWith('|'), `${l} : 60 minutes (indice 0 vide)`)
}

console.log("L'heure dite en lettres")
const fr = T('fr')
const dit = (h, m) => oral12(fr, h, m)
ok(dit(3, 0) === 'trois heures' && dit(1, 0) === 'une heure' && dit(12, 0) === 'midi', 'heures pile, une heure, midi')
ok(dit(3, 15) === 'trois heures et quart' && dit(3, 30) === 'trois heures et demie' && dit(12, 30) === 'midi et demi', 'et quart, et demie, midi et demi')
ok(dit(3, 45) === 'quatre heures moins le quart' && dit(11, 45) === 'midi moins le quart', 'moins le quart')
ok(dit(3, 5) === 'trois heures cinq' && dit(3, 21) === 'trois heures vingt et une' && dit(3, 47) === 'trois heures quarante-sept', 'minutes en lettres')
ok(dit(3, 40) === 'quatre heures moins vingt' && dit(3, 55) === 'quatre heures moins cinq', 'moins vingt, moins cinq')
const br = T('br')
ok(oral12(br, 3, 0) === 'teir eur' && oral12(br, 3, 15) === 'teir eur ha kard' && oral12(br, 3, 30) === 'teir eur hanter', 'breton : heure, et quart, et demie')
ok(oral12(br, 3, 45) === 'peder eur nemet kard' && oral12(br, 3, 47) === 'teir eur ha 47 munut' && oral12(br, 3, 40) === 'peder eur nemet 20 munut', 'breton : moins le quart, minutes en chiffres')
ok(oral12(br, 12, 0) === 'kreisteiz', 'breton : midi')
ok(oralJournee(fr, 15, 30, 'trois heures et demie de l’après-midi') === 'quinze heures trente, ou trois heures et demie de l’après-midi' && oralJournee(fr, 0, 0, 'x') === 'minuit, ou x', 'matin / après-midi : l’heure sur 24 h en lettres')
ok(oralJournee(br, 15, 30, 'teir eur hanter') === 'teir eur hanter', 'breton : seulement l’oral du cadran')
ok(ecrit(3, 5) === '3 h 05' && ecrit(15, 0) === '15 h' && hm(8 * 60 + 30) === '8 h 30' && ecritDuree(90) === '1 h 30 min' && ecritDuree(45) === '45 min', 'écriture des heures et des durées')

console.log('Le CP ne lit que les heures entières : pas de minutes, ni dans le jeu ni sur la fiche')
ok(!aideMinutesPossible('cp') && aideMinutesPossible('ce1') && aideMinutesPossible('ce2'), 'les minutes autour du cadran : pas au CP')
ok(minutesDisponibles(['heure']).join() === '0', 'heures pile : minute 0 seulement')
const cp = reglages('cp', { exercices: ['lire', 'placer'] })
for (const langue of CODES) for (const graine of [1, 2, 3, 4, 5]) {
  const t = T(langue)
  const qs = questions({ niveau: 'cp', reglages: cp, rng: creerRng(graine), T: t, nb: 10 })
  ok(qs.every(q => q.m === 0), `CP, ${langue}, graine ${graine} : toutes les heures sont pile`)
  ok(qs.filter(q => q.type === 'placer').every(q => q.sansMinutes && q.depart.m === 0 && !(q.depart.h === q.h % 12)), 'placer : la grande aiguille part du 12, la petite ailleurs')
  const html = heure.fiche.fiche({ questions: questionsFiche({ niveau: 'cp', reglages: { ...cp, aideMinutes: true }, rng: creerRng(graine), T: t }), reglages: { ...cp, aideMinutes: true }, T: t, langue })
  ok(!heure.generateur.ecartsFiche(html, { heure: 'entiere' }).length, `CP, ${langue}, graine ${graine} : la fiche n'a ni case de minutes ni minutes autour du cadran`)
}
ok(svgHorloge(3, 0, { aideMinutes: true }).includes('font-size="11"') && !svgHorloge(3, 0).includes('font-size="11"'), 'l’horloge écrit les minutes seulement si on le lui demande')
const ce1 = reglages('ce1')
const htmlCe1 = heure.fiche.fiche({ questions: questionsFiche({ niveau: 'ce1', reglages: ce1, rng: creerRng(1), T: T('fr') }), reglages: ce1, T: T('fr'), langue: 'fr' })
ok(ce1.aideMinutes && htmlCe1.includes('font-size="11"'), 'CE1 : les minutes autour du cadran restent proposées')

console.log('Les réponses')
for (const niveau of ['cp', 'ce1', 'ce2']) for (const graine of [1, 2, 3]) {
  const tout = reglages(niveau, { exercices: definition.options?.exercices ?? definition.niveaux[niveau].options.exercices, saisie: graine % 2 ? 'clavier' : 'choix' })
  for (const q of questions({ niveau, reglages: tout, rng: creerRng(graine), T: fr, nb: 15 })) {
    ok(verifier(q, bonneReponse(q)) === true, `${niveau} ${q.cle} : la bonne réponse est acceptée`)
    ok(verifier(q, mauvaiseReponse(q)) === false, `${niveau} ${q.cle} : une mauvaise réponse est refusée`)
  }
}
const q = questions({ niveau: 'ce1', reglages: reglages('ce1', { saisie: 'clavier' }), rng: creerRng(3), T: fr, nb: 1 })[0]
ok(verifier(q, { h: String(q.h + 12 > 23 ? q.h : q.h + 12), m: String(q.m) }) === true && verifier(q, { h: '', m: '' }) === false, 'lire : 3 h 15 ou 15 h 15 ; cases vides refusées')

process.exit(nbEchecs() ? 1 : 0)

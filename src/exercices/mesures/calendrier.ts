// Les mesures — questions sur le calendrier (jours, mois). Hors programme de mathématiques (voir definition.ts).
// Contexte et forme des questions : voir longueurs.ts et types.ts. Les jours, les mois et leurs formes (« d'avril ») sont des listes
// de textes séparées par « | » dans le catalogue de contenu.
import { JOURS_MOIS } from './donnees.ts'
import type { Contexte, Question } from './types.ts'

const majuscule = (mot: string): string => mot[0].toUpperCase() + mot.slice(1)

export function genCalendrier({ rng, T, niv }: Contexte): Question {
  const sous = rng.choisir(niv.calendrier)
  const j = rng.entier(0, 6), m = rng.entier(0, 11)
  const JOURS = T('jours').split('|'), MOIS = T('mois').split('|'), MOIS_DE = T('moisDe').split('|')
  const base = { type: 'calendrier', mode: 'choix', choix: JOURS } as const
  const auj = T('aujourdhui', { jour: JOURS[j] })
  const jours = (n: number): string => T('nJours', { n })
  const date = (d: number, mm: number): string => T('date', { d, mois: MOIS[mm] })
  const memeJour = T('memeJour')
  // le mois, et sa forme après « de » (« de mars », « d'avril »)
  const nomMois = (i: number): { mois: string, moisDe: string } => ({ mois: MOIS[i], moisDe: MOIS_DE[i] })
  if (sous === 'demain' || sous === 'hier') {
    const r = JOURS[(j + (sous === 'demain' ? 1 : 6)) % 7]
    return { ...base, choix: [...JOURS], cle: `cal-${sous}-${j}`,
      consigne: T(sous === 'demain' ? 'demainQ' : 'hierQ', { auj }),
      reponse: r, attendu: r,
      texte: T(sous === 'demain' ? 'demainTexte' : 'hierTexte', { jour: JOURS[j] }),
      explication: T('joursSemaineExpl', { liste: JOURS.join(', ') }) }
  }
  if (sous === 'dansN') {
    const n = rng.entier(...niv.dansN)
    const r = JOURS[(j + n) % 7]
    const consigne = T('dansNQ', { auj, n })
    const texte = `${JOURS[j]} + ${jours(n)} ?`
    if (n >= 7) {
      return { ...base, choix: [...JOURS], cle: `cal-n-${j}-${n}`, consigne,
        reponse: r, attendu: r, texte,
        explication: n === 7 ? memeJour : T('dansNExplSemaine', { jour: JOURS[j], reste: jours(n - 7), r }) }
    }
    const chemin = Array.from({ length: n }, (_, i) => JOURS[(j + i + 1) % 7])
    return { ...base, choix: [...JOURS], cle: `cal-n-${j}-${n}`, consigne,
      reponse: r, attendu: r, texte,
      explication: T('dansNExpl', { n, chemin: chemin.map((d, i) => `${i + 1}. ${d}`).join(', ') }) }
  }
  if (sous === 'semaine') {
    return { ...base, choix: [...JOURS], cle: `cal-sem-${j}`,
      consigne: T('semaineQ', { auj }),
      reponse: JOURS[j], attendu: JOURS[j], texte: T('semaineTexte', { jour: JOURS[j] }),
      explication: memeJour }
  }
  if (sous === 'moisApres' || sous === 'moisAvant') {
    const r = MOIS[(m + (sous === 'moisApres' ? 1 : 11)) % 12]
    return { ...base, choix: [...MOIS], cle: `cal-${sous}-${m}`,
      consigne: T(`${sous}Q`, { mois: MOIS[m] }),
      reponse: r, attendu: r,
      texte: T(`${sous}Texte`, { mois: MOIS[m] }),
      explication: T('moisAnneeListe', { liste: MOIS.join(', ') }) }
  }
  if (sous === 'numMois') {
    return { type: 'calendrier', mode: 'nombre', unite: '', cle: `cal-num-${m}`,
      consigne: T('numMoisQ', nomMois(m)),
      reponse: m + 1, attendu: String(m + 1), texte: T('numMoisTexte', nomMois(m)),
      explication: MOIS.slice(0, m + 1).map((x, i) => `${x} = ${i + 1}`).join(', ') + '.' }
  }
  if (sous === 'semainesJours') {
    const n = rng.entier(1, 4)
    const aff = T('semainesJoursAff', { n })
    return { type: 'calendrier', mode: 'nombre', unite: T('uniteJours'), cle: `cal-sj-${n}`,
      consigne: T('completeQ'), affiche: aff,
      reponse: 7 * n, attendu: jours(7 * n), texte: aff,
      explication: T('semainesJoursExpl', { n, somme: Array.from({ length: n }, () => 7).join(' + '), total: 7 * n }) }
  }
  if (sous === 'joursSemaines') {
    const n = rng.entier(2, 6)
    const aff = T('joursSemainesAff', { j: 7 * n })
    return { type: 'calendrier', mode: 'nombre', unite: T('uniteSemaines'), cle: `cal-js-${n}`,
      consigne: T('completeQ'), affiche: aff,
      reponse: n, attendu: T('nSemaines', { n }), texte: aff,
      explication: T('joursSemainesExpl', { n, j: 7 * n }) }
  }
  if (sous === 'joursMois') {
    const fev = T('fevrier')
    const r = m === 1 ? fev : String(JOURS_MOIS[m])
    return { type: 'calendrier', mode: 'choix', choix: [fev, '30', '31'], cle: `cal-jm-${m}`,
      consigne: T('joursMoisQ', nomMois(m)),
      reponse: r, attendu: T('joursMoisAttendu', { r }), texte: T('joursMoisTexte', nomMois(m)),
      explication: m === 1 ? T('joursMoisExplFevrier') : T('joursMoisExpl', { ...nomMois(m), Mois: majuscule(MOIS[m]), r }) }
  }
  if (sous === 'dansJours') {
    const mm = m === 1 ? 2 : m
    const d1 = rng.entier(1, 15), d2 = rng.entier(d1 + 3, Math.min(JOURS_MOIS[mm], d1 + 20))
    return { type: 'calendrier', mode: 'nombre', unite: T('uniteJours'), cle: `cal-dj-${mm}-${d1}-${d2}`,
      consigne: T('dansJoursQ', { date1: date(d1, mm), date2: date(d2, mm) }),
      reponse: d2 - d1, attendu: jours(d2 - d1), texte: T('dansJoursTexte', { d1, d2, mois: MOIS[mm] }),
      explication: T('dansJoursExpl', { d1, d2, n: d2 - d1 }) }
  }
  if (sous === 'dateDans') {
    const mm = m === 1 ? 2 : m
    const n = rng.entier(1, 2), d1 = rng.entier(1, JOURS_MOIS[mm] - 7 * n)
    const d2 = d1 + 7 * n
    return { type: 'calendrier', mode: 'nombre', unite: T('dateDansUnite', { mois: MOIS[mm] }), cle: `cal-dd-${mm}-${d1}-${n}`,
      consigne: T('dateDansQ', { date: date(d1, mm), n }),
      reponse: d2, attendu: date(d2, mm), texte: T('dateDansTexte', { d1, mois: MOIS[mm], n }),
      explication: T('dateDansExpl', { n, d1, d2, s: 7 * n }) }
  }
  return { type: 'calendrier', mode: 'nombre', unite: T('uniteMois'), cle: 'cal-mois-annee',
    consigne: T('moisAnneeQ'),
    reponse: 12, attendu: T('moisAnneeAttendu'), texte: T('moisAnneeTexte'),
    explication: T('moisAnneeExpl', { liste: MOIS.join(', ') }) }
}

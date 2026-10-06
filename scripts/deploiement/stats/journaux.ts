// Lire les journaux d'un site : ce qu'en dit le serveur (nginx), sans adresse IP ni cookie (src/utils/journal.js, deploy/setup-nginx.sh).
//   <domaine>.journal.log*  un signal par ligne, JSON { t: date ISO, q: requête } : `e=vue` (page vue : r route, m mode, l langue
//                           d'interface, g langue régionale) ou `e=imprimer` (r route ou /telechargements/<slug>, d réglages)
//   <domaine>.access.log*   le journal d'accès habituel (format « combined ») : les téléchargements de PDF
import type { ConfigDeploiement } from '../config.ts'

/** Des décomptes : clé → nombre. */
export type Decompte = Map<string, number>
const compter = (m: Decompte, cle: string, n = 1): void => { m.set(cle, (m.get(cle) ?? 0) + n) }

export interface Statistiques {
  vues: Decompte
  imprimes: Decompte
  /** « route  réglages » : les réglages les plus imprimés, à pré-générer */
  reglages: Decompte
  langues: Decompte
  pdfs: Decompte
  /** signaux par jour (AAAA-MM-JJ) */
  parJour: Decompte
}

/** Lit les journaux de `domaine` depuis `depuis` (millisecondes). `zcat -f` lit aussi bien les fichiers tournés (.gz) que le courant. */
export function lireStatistiques(serveur: Pick<ConfigDeploiement, 'ssh'>, domaine: string, depuis: number): Statistiques {
  const s: Statistiques = { vues: new Map(), imprimes: new Map(), reglages: new Map(), langues: new Map(), pdfs: new Map(), parJour: new Map() }

  const journal = serveur.ssh(`zcat -f /var/log/nginx/${domaine}.journal.log* 2>/dev/null || true`)
  for (const ligne of journal.split('\n')) {
    if (!ligne.trim()) continue
    let e: { t: string, q: string }
    try { e = JSON.parse(ligne) } catch { continue }
    if (Date.parse(e.t) < depuis) continue
    const q = new URLSearchParams(e.q)
    compter(s.parJour, e.t.slice(0, 10))
    if (q.get('e') === 'vue') {
      compter(s.vues, `${q.get('r')}${q.get('m') ? ` (${q.get('m')})` : ''}`)
      compter(s.langues, `interface ${q.get('l') || '?'} · régionale ${q.get('g') || 'aucune'}`)
    } else if (q.get('e') === 'imprimer') {
      compter(s.imprimes, String(q.get('r')))
      compter(s.reglages, `${q.get('r')}  ${q.get('d') || ''}`)
    }
  }

  const acces = serveur.ssh(`zcat -f /var/log/nginx/${domaine}.access.log* 2>/dev/null | grep -E '"GET [^ ]+\\.pdf ' || true`)
  for (const ligne of acces.split('\n')) {
    const m = ligne.match(/\[(\d+)\/(\w+)\/(\d+):[^\]]+\] "GET ([^ ]+\.pdf) [^"]*" (\d+)/)
    if (!m || (m[5] !== '200' && m[5] !== '206')) continue
    if (Date.parse(`${m[1]} ${m[2]} ${m[3]}`) < depuis) continue
    compter(s.pdfs, m[4].replace(/^\/telechargements\//, ''))
  }
  return s
}

/** Les `n` plus fréquents, du plus au moins fréquent. */
export const plusFrequents = (m: Decompte, n = 15): [string, number][] => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)

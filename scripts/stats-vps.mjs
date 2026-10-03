// Statistiques d'usage à partir des journaux du VPS (sans IP, sans cookie — voir src/utils/journal.js).
//   node scripts/stats-vps.mjs [jours]      (défaut : 30 derniers jours)
// Lit, par SSH (hôte de .deploy.env), /var/log/nginx/<domaine>.journal.log* et les téléchargements de PDF
// dans <domaine>.access.log*, puis affiche : pages les plus vues, fiches imprimées (avec leurs réglages
// les plus fréquents, pour savoir quoi pré-générer), PDF les plus téléchargés.
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const jours = Number(process.argv[2] || 30)
const depuis = Date.now() - jours * 864e5
const conf = Object.fromEntries(readFileSync(new URL('../.deploy.env', import.meta.url), 'utf8')
  .split('\n').filter(l => /^\w+=/.test(l)).map(l => { const [k, ...v] = l.split('='); return [k, v.join('=').replace(/^"|"$/g, '')] }))
const domaines = (conf.DEPLOY_SITES || 'ecoleprimaire skoolik').split(/\s+/).map(s => conf[`DOMAINE_${s}`] || `${s}.app`)
const ssh = cmd => execFileSync('ssh', [...(conf.DEPLOY_SSH_OPTS ? conf.DEPLOY_SSH_OPTS.split(' ') : []), conf.DEPLOY_HOST, cmd],
  { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 })

const compter = (m, k, n = 1) => m.set(k, (m.get(k) || 0) + n)
const top = (m, n = 15) => [...m].sort((a, b) => b[1] - a[1]).slice(0, n)
const afficher = (titre, m, n) => {
  console.log(`\n${titre}`)
  const t = top(m, n)
  if (!t.length) console.log('  (rien)')
  for (const [k, v] of t) console.log(`  ${String(v).padStart(6)}  ${k}`)
}

for (const d of domaines) {
  const vues = new Map(), imprimes = new Map(), reglages = new Map(), langues = new Map(), pdfs = new Map(), parJour = new Map()
  const journal = ssh(`zcat -f /var/log/nginx/${d}.journal.log* 2>/dev/null || true`)
  for (const ligne of journal.split('\n')) {
    if (!ligne.trim()) continue
    let e
    try { e = JSON.parse(ligne) } catch { continue }
    if (Date.parse(e.t) < depuis) continue
    const q = new URLSearchParams(e.q)
    compter(parJour, e.t.slice(0, 10))
    if (q.get('e') === 'vue') {
      compter(vues, `${q.get('r')}${q.get('m') ? ` (${q.get('m')})` : ''}`)
      compter(langues, `interface ${q.get('l') || '?'} · régionale ${q.get('g') || 'aucune'}`)
    } else if (q.get('e') === 'imprimer') {
      compter(imprimes, q.get('r'))
      compter(reglages, `${q.get('r')}  ${q.get('d') || ''}`)
    }
  }
  // PDF téléchargés : format « combined » de nginx (le journal d'accès habituel)
  const acces = ssh(`zcat -f /var/log/nginx/${d}.access.log* 2>/dev/null | grep -E '"GET [^ ]+\\.pdf ' || true`)
  for (const ligne of acces.split('\n')) {
    const m = ligne.match(/\[(\d+)\/(\w+)\/(\d+):[^\]]+\] "GET ([^ ]+\.pdf) [^"]*" (\d+)/)
    if (!m || m[5] !== '200' && m[5] !== '206') continue
    if (Date.parse(`${m[1]} ${m[2]} ${m[3]}`) < depuis) continue
    compter(pdfs, m[4].replace(/^\/telechargements\//, ''))
  }
  console.log(`\n══════ ${d} — ${jours} derniers jours ══════`)
  afficher('Pages vues', vues, 20)
  afficher('Fiches imprimées (page)', imprimes, 15)
  afficher('Réglages les plus imprimés (à pré-générer ?)', reglages, 15)
  afficher('PDF tout prêts téléchargés', pdfs, 20)
  afficher('Langues', langues, 6)
  console.log(`\nActivité par jour : ${top(parJour, 999).sort().map(([j, n]) => `${j.slice(5)}:${n}`).join('  ') || '(rien)'}`)
}

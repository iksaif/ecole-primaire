// Ajoute un enregistrement TXT de vérification (Google Search Console, Bing…) à un domaine, via l'API Gandi,
// sans retirer les valeurs TXT existantes (SPF, etc.).
//   node scripts/dns-verification.mjs ecoleprimaire.app "google-site-verification=XXXX"
//   node scripts/dns-verification.mjs skoolik.app "google-site-verification=YYYY" --dry-run
// Jeton Gandi (Personal Access Token) : fichier ~/gandi, ou variable GANDI_TOKEN. Il n'est jamais affiché.
import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const [domaine, valeur] = process.argv.slice(2).filter(a => !a.startsWith('--'))
const essai = process.argv.includes('--dry-run')
if (!domaine || !valeur) {
  console.error('Usage : node scripts/dns-verification.mjs <domaine> "<valeur TXT>" [--dry-run]')
  process.exit(1)
}
const jeton = (process.env.GANDI_TOKEN || readFileSync(join(homedir(), 'gandi'), 'utf8')).trim()
const api = (chemin, options = {}) => fetch(`https://api.gandi.net/v5/livedns/domains/${domaine}/records/${chemin}`, {
  ...options, headers: { Authorization: `Bearer ${jeton}`, 'Content-Type': 'application/json', ...options.headers },
})

const r = await api('@/TXT')
const actuelles = r.ok ? (await r.json()).rrset_values ?? [] : []
const guillemets = v => (v.startsWith('"') ? v : `"${v}"`)
if (actuelles.includes(guillemets(valeur))) {
  console.log(`✓ ${domaine} : la valeur est déjà présente`)
  process.exit(0)
}
const nouvelles = [...actuelles, guillemets(valeur)]
console.log(`${domaine} @ TXT :\n  avant : ${actuelles.join(' | ') || '(aucune)'}\n  après : ${nouvelles.join(' | ')}`)
if (essai) process.exit(0)
const res = await api('@/TXT', { method: 'PUT', body: JSON.stringify({ rrset_values: nouvelles, rrset_ttl: 10800 }) })
console.log(res.ok ? `✓ ${(await res.json()).message}` : `✗ ${res.status} ${await res.text()}`)

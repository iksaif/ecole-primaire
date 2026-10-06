// Statistiques d'usage à partir des journaux du VPS : pages les plus vues, fiches imprimées (avec leurs réglages les plus
// fréquents, pour savoir quoi pré-générer), PDF les plus téléchargés. Anonymes : pas d'IP, pas de cookie (src/utils/journal.js).
//   node scripts/deploiement/stats-vps.ts [jours]      (défaut : 30 derniers jours ; `--help` : cet en-tête)
// Lit les journaux par SSH (hôte de .deploy.env). Format des journaux et de leurs signaux : stats/journaux.ts.
import { lireConfigDeploiement } from './config.ts'
import { lireStatistiques, plusFrequents } from './stats/journaux.ts'
import type { Decompte } from './stats/journaux.ts'

const [argument] = process.argv.slice(2)
if (argument === '--help' || argument === '-h') {
  console.log('Usage : node scripts/deploiement/stats-vps.ts [jours]   (défaut : 30 ; demande .deploy.env et un accès SSH au serveur)')
  process.exit(0)
}
const jours = Number(argument || 30)
const depuis = Date.now() - jours * 864e5
const config = lireConfigDeploiement()

function afficher(titre: string, decompte: Decompte, n: number): void {
  console.log(`\n${titre}`)
  const lignes = plusFrequents(decompte, n)
  if (!lignes.length) console.log('  (rien)')
  for (const [cle, valeur] of lignes) console.log(`  ${String(valeur).padStart(6)}  ${cle}`)
}

for (const site of config.sites) {
  const domaine = config.domaine(site)
  const s = lireStatistiques(config, domaine, depuis)
  console.log(`\n══════ ${domaine} — ${jours} derniers jours ══════`)
  afficher('Pages vues', s.vues, 20)
  afficher('Fiches imprimées (page)', s.imprimes, 15)
  afficher('Réglages les plus imprimés (à pré-générer ?)', s.reglages, 15)
  afficher('PDF tout prêts téléchargés', s.pdfs, 20)
  afficher('Langues', s.langues, 6)
  console.log(`\nActivité par jour : ${plusFrequents(s.parJour, 999).sort().map(([j, n]) => `${j.slice(5)}:${n}`).join('  ') || '(rien)'}`)
}

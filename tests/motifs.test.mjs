// Les motifs (node, sans Chrome) : chaque frise se devine. On voit au moins deux périodes (l'évolutif : A B AA BB AAA) ; le trou n'est
// jamais à la fin (au moins deux éléments après lui) ; sur la fiche, les cases à continuer finissent la période ou le groupe (après
// A B AA BB AAA : les trois B), au moins deux.
import { TYPES_DU_NIVEAU, casesAContinuer, questionMotif, suite } from '../src/exercices/motifs/motifs.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

const problemes = []
for (const niveau of ['ps', 'ms', 'gs']) {
  for (const mode of ['apres', 'trou']) {
    for (let graine = 0; graine < 300; graine++) {
      const q = questionMotif(niveau, mode, creerRng(graine))
      const nom = `${niveau} ${mode} ${q.type} (graine ${graine})`
      const periode = q.type === 'evolutif' ? 9 : q.type.length
      if (q.motif.length < 2 * periode && q.type !== 'evolutif') problemes.push(`${nom} : moins de deux périodes visibles`)
      if (mode === 'trou' && q.place > q.motif.length - 2) problemes.push(`${nom} : le trou est trop près de la fin`)
      if (q.attendu !== suite(q.type, q.place + 1)[q.place]) problemes.push(`${nom} : l'élément attendu n'est pas celui du motif`)
    }
  }
}
verifier(problemes.length === 0, `chaque frise se devine (${problemes.slice(0, 3).join(' ; ') || 'aucun problème'})`)

// les cases à continuer : la période ou le groupe en entier
verifier(casesAContinuer('evolutif', 9) === 3, 'après A B AA BB AAA, trois cases (les trois B)')
for (const type of TYPES_DU_NIVEAU.gs.filter(t => t !== 'evolutif')) {
  for (let visibles = 6; visibles <= 12; visibles++) {
    const n = casesAContinuer(type, visibles)
    verifier(n >= 2 && (visibles + n) % type.length === 0 || n === 2, `${type}, ${visibles} visibles : ${n} cases finissent la période (au moins deux)`)
  }
}

process.exit(nbEchecs() ? 1 : 0)

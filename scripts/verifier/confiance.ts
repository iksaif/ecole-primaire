// `npm run confiance` : le niveau de confiance de chaque exercice et de chaque affiche en breton, et ce qui reste à évaluer.
// Méthode et prompt de (re)tagage : docs/confiance-breton/. Code de sortie 0 : c'est un tableau, pas un test (tests/confiance.test.mjs vérifie la table).
import { NOMS_NIVEAU } from '../../src/langues/confiance.ts'
import { ressourcesTraduites, LANGUES_EVALUEES } from './confiance/ressources.ts'

for (const langue of LANGUES_EVALUEES) {
  const lignes = ressourcesTraduites(langue)
  console.log(`\n${langue} : ${lignes.length} ressources avec du texte traduit\n`)
  for (const l of lignes) {
    const e = l.evaluation
    const niveau = e ? `${e.niveau}/4 ${NOMS_NIVEAU[e.niveau].padEnd(12)} ${e.le} (${e.par})` : '— jamais évaluée (compte pour 0)'
    console.log(`  ${l.cle.padEnd(32)} ${niveau}`)
  }
  const nonEvaluees = lignes.filter(l => !l.evaluation).length
  console.log(`\n  ${lignes.length - nonEvaluees} évaluées, ${nonEvaluees} à évaluer`)
}

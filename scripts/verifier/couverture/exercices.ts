// « Par exercice » : pour chaque exercice du registre qui publie des fiches, à chaque classe, ses fiches et leurs compétences — ✓ au
// programme de la classe, ⚠ pas au programme — puis les compétences du niveau sans fiche dédiée (—). Le contenu des fiches est
// vérifié par les tests.
import { echapper } from '../../../src/utils/html.js'
import { REGISTRE } from '../../../src/exercices/index.ts'
import { competencesDeFiche } from '../../../src/noyau/definir.ts'
import type { Programme } from './modeles.ts'

export function sectionsExercices({ COMPETENCES }: Programme): string {
  const competence = (id: string) => COMPETENCES.find(x => x.id === id)
  return REGISTRE.filter(e => !e.exemple && e.definition.fiches.length).map(({ definition: d }) => {
    const lignes = Object.entries(d.niveaux).map(([n, niv]) => {
      const fiches = d.fiches.filter(f => (f.classes ?? [f.niveau]).includes(n as never))
      if (!fiches.length) return ''
      const travaillees = new Set(fiches.flatMap(f => competencesDeFiche(d, f)))
      const options = fiches.map(f => {
        const k = competence(f.competence)
        const ok = k?.niveaux.includes(n)
        return `<span class="${ok ? 'ok' : 'alerte'}">${ok ? '✓' : '⚠'} ${echapper(f.id)} <small>(${echapper(k?.libelle ?? f.competence)})</small></span>`
      })
      const sansFiche = (niv?.competences ?? []).filter(id => !travaillees.has(id)).map(competence)
        .map(k => `<span class="non">— ${echapper(k?.libelle ?? '')}</span>`)
      const alerte = options.some(o => o.includes('class="alerte"'))
      return `<tr><th>${n.toUpperCase()}</th><td class="${alerte ? 'rien' : sansFiche.length ? 'peu' : 'bien'}">${fiches.length} fiche${fiches.length > 1 ? 's' : ''}</td>
<td class="liste">${options.join('')}${sansFiche.join('')}</td></tr>`
    }).join('')
    return `<details><summary>${echapper(d.id)} <small>${Object.keys(d.niveaux).map(n => n.toUpperCase()).join(', ')}</small></summary>
<table class="exercice">${lignes}</table></details>`
  }).join('\n')
}

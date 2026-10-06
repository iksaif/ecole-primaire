// « Par exercice » : à chaque classe, les options de l'exercice (une fiche par compétence, `fiches` de sa définition) et leur
// compétence — ✓ au programme de la classe, ⚠ pas au programme de cette classe — puis les compétences de l'exercice
// (activites.js) au programme de la classe sans option dédiée (—). Le contenu des fiches est vérifié par les tests.
import { echapper } from '../../../src/utils/html.js'
import type { Activite, Couverture, Exercices, Programme } from './modeles.ts'

export function sectionsExercices({ COMPETENCES }: Programme, { EXERCICES, classesDe, fichesDe }: Exercices, activites: Activite[], { competencesActivite }: Couverture): string {
  const competence = (id: string) => COMPETENCES.find(x => x.id === id)
  return EXERCICES.filter(ex => ex.fiches?.length).map(ex => {
    const activite = activites.find(a => a.to === ex.route)
    const lignes = ex.classes.flatMap(c => {
      const fiches = fichesDe(ex, c.classe)
      if (!fiches.length) return []
      return classesDe(c.classe).map(n => {
        const options = fiches.map(f => {
          const k = competence(f.competence)
          const ok = k?.niveaux.includes(n)
          return `<span class="${ok ? 'ok' : 'alerte'}">${ok ? '✓' : '⚠'} ${echapper(f.titre)} <small>(${echapper(k?.libelle ?? f.competence)})</small></span>`
        })
        const sansOption = (activite ? competencesActivite(activite, n) : []).map(competence)
          .filter(k => k?.niveaux.includes(n) && !fiches.some(f => f.competence === k.id))
          .map(k => `<span class="non">— ${echapper(k?.libelle ?? '')}</span>`)
        const alerte = options.some(o => o.includes('class="alerte"'))
        return `<tr><th>${n.toUpperCase()}</th><td class="${alerte ? 'rien' : sansOption.length ? 'peu' : 'bien'}">${fiches.length} option${fiches.length > 1 ? 's' : ''}</td>
<td class="liste">${options.join('')}${sansOption.join('')}</td></tr>`
      })
    }).join('')
    return `<details><summary>${echapper(ex.titre.fr)} <small>${ex.classes.map(c => c.classe.toUpperCase()).join(', ')}</small></summary>
<table class="exercice">${lignes}</table></details>`
  }).join('\n')
}

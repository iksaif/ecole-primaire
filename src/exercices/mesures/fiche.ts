// Les mesures — fiche imprimable : la mise en page du tirage de `questionsFiche`. Pure (lisible par node).
// Les segments sont dessinés à la taille réelle (1 cm = 1 cm à 100 %) : la fiche demande d'imprimer sans ajustement.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { segmentReel, regleTemoin } from './dessins.ts'
import { cmmm } from './longueurs.ts'
import type { Tirage } from './generateur.ts'
import type { Question, Reglages, TypeQuestion } from './types.ts'
import type { CONTENU } from './textes.ts'

type Cle = CleContenu<typeof CONTENU>

const CSS = `
      @page { size: A4; margin: 1.2cm; }
      h2 { font-size: 1.02rem; margin: 1rem 0 .4rem; break-after: avoid; }
      .temoin { display: flex; align-items: flex-start; gap: .6cm; margin: .5rem 0 .3rem; font-size: .78rem; color: #555; }
      .seg { display: flex; align-items: center; gap: .5cm; margin: .45cm 0; }
      .lettre { font-weight: 800; width: .6cm; }
      .rep { font-size: 1rem; white-space: nowrap; }
      .seg .trou { min-width: 1.4cm; }
      .trou { display: inline-block; min-width: 2.2cm; border-bottom: 1.5px dotted #555; margin: 0 .15cm; }
      .trace { margin: .3cm 0 1.1cm; }
      .point { margin-left: .4cm; font-weight: 700; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: .25cm .8cm; }
      .grille2 { display: grid; grid-template-columns: 1fr 1fr; gap: .4cm .8cm; }
      .q { break-inside: avoid; margin: .2cm 0; }
      .affiche { font-size: 1.05rem; font-weight: 700; margin: .15cm 0; }
      .consigne { font-size: .9rem; margin-bottom: .1cm; }
      .illus svg { width: 6.5cm; height: auto; }
      .choix span { display: inline-block; margin: 0 .3cm; padding: .05cm .2cm; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }`

const TROU = '<span class="trou"></span>'
const LETTRES = 'ABCDEFGH'

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<Reglages, Tirage, Cle>): string {
  const sections: string[] = []
  // corrigé : une ligne par partie, réponses dans l'ordre de la fiche
  const corrige: string[] = []
  const ligneCorrige = (titre: string, rep: string): void => { corrige.push(`<p><b>${titre} :</b> ${rep}</p>`) }
  const numeros = (l: readonly string[]): string => l.map((r, i) => `${i + 1}. ${r}`).join(' — ')
  const lettres = (l: readonly string[]): string => l.map((r, i) => `${LETTRES[i]} : ${r}`).join(' — ')

  const questionImprimee = (qi: Question): string => {
    let h = '<div class="q">'
    if (['conversion', 'unite', 'comparer'].includes(qi.type) || (qi.type === 'calendrier' && qi.affiche)) {
      h += `<div class="affiche">${(qi.affiche ?? '').replace('?', TROU).replace('…', TROU)}</div>`
    } else {
      h += `<div class="consigne">${qi.consigne}</div>`
      if (qi.svg) h += `<div class="illus">${qi.svg}</div>`
      if (qi.affiche) h += `<div class="affiche">${qi.affiche}</div>`
      if (qi.mode === 'nombre') h += `<div class="affiche">${T('ficheReponse')} : ${TROU} ${qi.unite || ''}</div>`
      else if (qi.type === 'calendrier' && (qi.choix?.length ?? 0) > 3) h += `<div class="affiche">${T('ficheReponse')} : ${TROU}${TROU}</div>`
      else h += `<div class="choix">${T('ficheEntoure')} ${(qi.choix ?? []).map(c => `<span>${c}</span>`).join('')}</div>`
    }
    return h + '</div>'
  }

  if (x.regle?.mm) {
    const { choisis, aTracer } = x.regle
    const segs = choisis.map((L, i) => `<div class="seg"><span class="lettre">${LETTRES[i]}</span>${segmentReel(L / 10)}<span class="rep">${TROU} cm ${TROU} mm</span></div>`).join('')
    const traces = aTracer
      .map(L => `<div class="trace">${T('ficheTrace')} <strong>${cmmm(L)}</strong> : <span class="point">×</span></div>`).join('')
    sections.push(`<h2>📏 ${T('ficheMesureMm')}</h2>${segs}<h2>✏️ ${T('ficheTraceTitre')}</h2>${traces}`)
    ligneCorrige(T('ficheMesureMm'), lettres(choisis.map(L => `${Math.floor(L / 10)} cm ${L % 10} mm`)))
    ligneCorrige(T('ficheTraceTitre'), T('corrigeTrace', { liste: numeros(aTracer.map(cmmm)) }))
  } else if (x.regle) {
    const { choisis, aTracer } = x.regle
    const segs = choisis.map((L, i) => `<div class="seg"><span class="lettre">${LETTRES[i]}</span>${segmentReel(L)}<span class="rep">${TROU} cm</span></div>`).join('')
    const traces = aTracer
      .map(L => `<div class="trace">${T('ficheTrace')} <strong>${L} cm</strong> : <span class="point">×</span></div>`).join('')
    sections.push(`<h2>📏 ${T('ficheMesure')}</h2>${segs}<h2>✏️ ${T('ficheTraceTitre')}</h2>${traces}`)
    ligneCorrige(T('ficheMesure'), lettres(choisis.map(L => `${L} cm`)))
    ligneCorrige(T('ficheTraceTitre'), T('corrigeTrace', { liste: numeros(aTracer.map(L => `${L} cm`)) }))
  }

  // titre sur la fiche, puis titre court dans le corrigé (par défaut le même)
  const TITRES: Readonly<Partial<Record<TypeQuestion, readonly [string] | readonly [string, string]>>> = {
    conversion: [T('ficheConversion')],
    unite: [`🤔 ${T('ficheUnite')} : ${x.unites.slice(0, -1).join(', ')} ${T('ou')} ${x.unites[x.unites.length - 1]}`, `🤔 ${T('ficheUnite')}`],
    comparer: [T('ficheComparer')],
    masse: [T('ficheMasse')],
    contenance: [T('ficheContenance')],
    calendrier: [T('ficheCalendrier')],
  }
  for (const { type, questions } of x.blocs) {
    const [titre, titreCorrige = titre] = TITRES[type] ?? ['']
    const grille = ['masse', 'contenance'].includes(type) ? 'grille2' : 'grille'
    sections.push(`<h2>${titre}</h2><div class="${grille}">${questions.map(questionImprimee).join('')}</div>`)
    ligneCorrige(titreCorrige, numeros(questions.map(q => q.attendu)))
  }

  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, h1: `📏 ${titre}`, css: CSS, largeur: '18cm', marge: '1cm',
    corps: `${ligneNomDate(langue)}
    ${x.regle ? `<div class="temoin">${regleTemoin()}<span>${T('ficheTemoin')}</span></div>` : ''}
    ${sections.join('')}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige.join('')}</section>`,
  })
}

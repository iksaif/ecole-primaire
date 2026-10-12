// Les lettres — fiche imprimable : la mise en page du tirage de questionsFiche(). Pure (lisible par node). Relier chaque majuscule à sa
// minuscule, par blocs de 6 lettres, et le corrigé.
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import { echapper as e } from '../../utils/html.js'
import type { ParamsFiche } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import { couple, ecrire } from './generateur.ts'
import type { Ecriture, TirageFiche } from './generateur.ts'
import { consignesDe } from '../../images/consignes.ts'

type Cle = CleContenu<typeof CONTENU>

// Même police que POLICE_SCRIPT de src/utils/impression.js (module qui lit le navigateur : pas ici)
const SCRIPT = 'Andika'
// Même police que POLICE_ATTACHE : celle de l'écriture attachée, quand la vue n'en fournit pas d'autre (`polices.attache`)
const ATTACHE = 'Playwrite FR Trad'

const CSS = (attache: string): string => `
      .consigne { font-weight: 700; font-size: 1.1rem; margin: .4rem 0 1rem; }
      .blocs { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem 2.5rem; }
      .bloc { display: flex; justify-content: space-between; border: 2px solid #ccc; border-radius: 14px; padding: .6rem 1rem; page-break-inside: avoid; }
      .col { display: flex; flex-direction: column; gap: .35rem; }
      .l { display: flex; align-items: center; gap: .7rem; font-family: '${SCRIPT}', Arial, sans-serif; font-size: 2rem; font-weight: 700; line-height: 1.25; height: 3.8rem; }
      .l span { min-width: 1.6em; text-align: center; }
      .cursive { font-family: '${attache}', 'Andika', cursive; font-weight: 400; font-size: 1.7rem; line-height: 1.2; }
      .corr .cursive { line-height: 1.6; }
      .l i { width: .5rem; height: .5rem; border-radius: 50%; background: #333; display: inline-block; }
      .corr { font-size: 1.15rem; line-height: 2.2; }`

export function fiche({ questions: x, reglages, T, langue, police, cssPolices, polices, images: preference, pictogrammes }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  // les pictogrammes des consignes, selon « Sur la fiche » (aucun dans les PDF publiés : src/images/consignes.ts)
  const consigne = consignesDe({ reglages, images: preference, pictogrammes })
  // les deux colonnes sont dans les écritures du réglage : capitale et script (A, a), ou script et attaché (a, a)
  const [gauche, droiteEcr] = couple(reglages.ecritures)
  const lettre = (l: string, ecriture: Ecriture): string => `<span class="${ecriture}">${e(ecrire(l, ecriture))}</span>`
  const html = x.blocs.map(({ lettres, droite }) => `<div class="bloc">
      <div class="col">${lettres.map(l => `<div class="l">${lettre(l, gauche)}<i></i></div>`).join('')}</div>
      <div class="col min">${droite.map(l => `<div class="l"><i></i>${lettre(l, droiteEcr)}</div>`).join('')}</div>
    </div>`).join('')
  // corrigé : un bloc par ligne, dans l'ordre de la fiche, chaque lettre avec son autre écriture
  const corrige = x.blocs.map(({ lettres }) => `<div>${lettres.map(l => `${lettre(l, gauche)} – ${lettre(l, droiteEcr)}`).join(' &nbsp;·&nbsp; ')}</div>`).join('')
  const titre = T('titre')
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS(polices?.attache ?? ATTACHE), largeur: '700px', marge: '1.2cm',
    corps: `${ligneNomDate(langue)}
    <p class="consigne">${consigne(['relie'], T(droiteEcr === 'cursive' ? 'consigneCursive' : 'consigne'))}</p>
    <div class="blocs">${html}</div>
    <section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2>
      <div class="corr">${corrige}</div></section>`,
  })
}

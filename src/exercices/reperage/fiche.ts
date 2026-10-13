// Le repérage — fiche imprimable : la légende des instructions, puis « suivre » (le programme est écrit sous le quadrillage) et « coder »
// (des cases vides où l'élève dessine les flèches). Un centimètre par case. Pure (lisible par node).
import { documentFiche, ligneNomDate } from '../../impression/document.ts'
import type { ParamsFiche, Traducteur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import type DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'
import type { Instruction, QCoder, QSuivre, TirageFiche } from './generateur.ts'
import { enInstructions, executer } from './generateur.ts'
import { caseColoriee, caseInstruction, chemin, etoile, numerosDuChemin, plan, robot, rocher, CASE } from './dessin.ts'

type Cle = CleContenu<typeof CONTENU>
const TAILLE_INSTRUCTION = 10  // mm : une case d'instruction (un enfant y dessine une flèche)

const CSS = `
      @page { size: A4; margin: 1.2cm; }
      h2 { font-size: 1.05rem; margin: .45cm 0 .15cm; break-after: avoid; }
      .consigne { font-size: .95rem; margin: .1cm 0 .25cm; }
      .legende { display: flex; flex-wrap: wrap; gap: .25cm .6cm; align-items: center; font-size: .85rem; margin-bottom: .2cm; }
      .legende span { display: inline-flex; align-items: center; gap: .15cm; }
      .rangee { display: flex; gap: .5cm; break-inside: avoid; margin-bottom: .4cm; }
      .exercice { width: 9cm; }
      .programme { display: flex; flex-wrap: wrap; gap: .08cm; margin-top: .15cm; }
      .corrige .rangee { gap: .3cm; margin-bottom: .2cm; }
      .corrige .exercice { width: auto; }
      .bloc-corrige { break-inside: avoid; }
      .avec-titre { break-inside: avoid; }
      .decouper { break-before: page; break-inside: avoid; }
      .etiquettes { display: flex; flex-wrap: wrap; border-top: 1.5px dashed #777; padding-top: .2cm; }
      .etiquette { border: 1px dashed #999; padding: .08cm; }
      .etiquette svg { display: block; }
      .solutions { display: flex; flex-wrap: wrap; gap: .2cm .8cm; }
      .solution { display: flex; align-items: center; gap: .15cm; }
      .solution .programme { margin: 0; }
      svg { display: block; }`

/** Des rangées de deux exercices ; `entete` (titre et consigne) reste sur la même page que la première rangée. */
function rangeesDeDeux(contenus: readonly string[], entete = ''): string {
  const rangees: string[] = []
  for (let i = 0; i < contenus.length; i += 2) {
    rangees.push(`<div class="rangee">${contenus.slice(i, i + 2).map(c => `<div class="exercice">${c}</div>`).join('')}</div>`)
  }
  const [premiere = '', ...suite] = rangees
  return `<div class="avec-titre">${entete}${premiere}</div>${suite.join('')}`
}

/** La légende : les trois instructions (et « avancer de » au CE1). */
function legende(avancerDe: boolean, T: Traducteur<Cle>): string {
  const ligne = (i: Instruction, n: number, texte: string): string => `<span>${caseInstruction(i, n, 7)} ${texte}</span>`
  const plusieurs = avancerDe ? ligne('avancer', 3, T('legendeAvancerDe')) : ''
  return `<div class="legende"><b>${T('legende')} :</b>${ligne('avancer', 1, T('instruction.avancer'))}${plusieurs}`
    + `${ligne('droite', 1, T('instruction.droite'))}${ligne('gauche', 1, T('instruction.gauche'))}</div>`
    // au CE1, le robot regarde dans tous les sens : se mettre à sa place
    + (avancerDe ? `<p class="consigne"><i>${T('tourneTaFeuille')}</i></p>` : '')
}

/** Un programme écrit case par case (`taille` : une case, en mm). */
const programmeEnCases = (programme: readonly Instruction[], avancerDe: boolean, taille: number): string =>
  `<div class="programme">${enInstructions(programme, avancerDe).map(({ instruction, n }) => caseInstruction(instruction, n, taille)).join('')}</div>`

/** Le programme d'un « suivre ». */
const programmeEcrit = (q: QSuivre): string => programmeEnCases(q.programme, q.avancerDe, TAILLE_INSTRUCTION)

/** Des cases vides pour écrire un programme : autant que la limite du niveau (dix au CP, quinze au CE1, c2maths p. 33 et 35). */
const casesVides = (q: QCoder): string =>
  `<div class="programme">${Array.from({ length: q.avancerDe ? 15 : 10 }, () => caseInstruction(null, 1, TAILLE_INSTRUCTION)).join('')}</div>`

/**
 * Des étiquettes-flèches à découper et à coller dans les cases du programme (dessiner une flèche coudée dans 1 cm est difficile à 6 ans), sur
 * une page à part (découper ne doit pas abîmer les exercices au dos). Leur nombre : celles des programmes du corrigé, et deux de plus de
 * chaque sorte ; au CE1, les « avancer de n » ont leur nombre déjà écrit.
 */
function etiquettesADecouper(qs: readonly QCoder[], avancerDe: boolean, T: Traducteur<Cle>): string {
  const besoin = new Map<string, { instruction: Instruction, n: number, combien: number }>()
  for (const q of qs) {
    for (const { instruction, n } of enInstructions(q.solution, avancerDe)) {
      const cle = `${instruction}${n}`
      const deja = besoin.get(cle)
      if (deja) deja.combien++
      else besoin.set(cle, { instruction, n, combien: 1 })
    }
  }
  for (const i of ['avancer', 'droite', 'gauche'] as const) if (!besoin.has(`${i}1`)) besoin.set(`${i}1`, { instruction: i, n: 1, combien: 0 })
  const etiquettes = [...besoin.values()].flatMap(({ instruction, n, combien }) => Array<string>(combien + 2).fill(caseInstruction(instruction, n, TAILLE_INSTRUCTION)))
  return `<div class="decouper"><p class="consigne">✂ ${T(avancerDe ? 'ficheDecouperCE1' : 'ficheDecouper')}</p>`
    + `<div class="etiquettes">${etiquettes.map(e => `<span class="etiquette">${e}</span>`).join('')}</div></div>`
}

const LARGEUR_PLAN = (colonnes: number): number => colonnes * CASE * 0.9

export function fiche({ questions: x, T, langue, police, cssPolices }: ParamsFiche<ReglagesDeDefinition<typeof DEFINITION>, TirageFiche, Cle>): string {
  let corps = legende(x.avancerDe, T)
  const corrige: string[] = []
  if (x.suivre) {
    const entete = `<h2>${T('ficheSuivre')}</h2><p class="consigne">${T('ficheSuivreConsigne')}</p>`
    corps += rangeesDeDeux(x.suivre.map(q => `${plan(q.colonnes, q.lignes, robot(q.depart), LARGEUR_PLAN(q.colonnes))}${programmeEcrit(q)}`), entete)
    const reponses = x.suivre.map(q => {
      const trajet = executer(q.depart, q.programme, q.colonnes, q.lignes).chemin
      return plan(q.colonnes, q.lignes, `${caseColoriee(q.arrivee, '#b2f2bb')}${chemin(trajet)}${numerosDuChemin(trajet)}${robot(q.depart)}`, 40)
    })
    corrige.push(`<p><b>${T('ficheSuivre')} :</b></p><div class="rangee">${reponses.map(r => `<div class="exercice">${r}</div>`).join('')}</div>`)
  }
  if (x.coder) {
    const avecRochers = x.coder.some(q => q.obstacles.length)
    const entete = `<h2>${T('ficheCoder')}</h2><p class="consigne">${T(avecRochers ? 'ficheCoderConsigne' : 'ficheCoderConsigneSansRochers')}</p>`
    corps += rangeesDeDeux(x.coder.map(q => `${plan(q.colonnes, q.lignes, `${q.obstacles.map(rocher).join('')}${etoile(q.cible)}${robot(q.depart)}`, LARGEUR_PLAN(q.colonnes))}${casesVides(q)}`), entete)
    // les programmes du corrigé avec les mêmes flèches que la fiche (les caractères ↱ ↰ manquent à certaines polices)
    const solutions = x.coder.map((q, i) => `<div class="solution"><b>${i + 1}.</b> ${programmeEnCases(q.solution, q.avancerDe, 5)}</div>`)
    corps += etiquettesADecouper(x.coder, x.avancerDe, T)
    corrige.push(`<p><b>${T('ficheCoder')} :</b> ${T('corrigeCoder')}</p><div class="solutions">${solutions.join('')}</div>`)
  }
  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, police, cssPolices, css: CSS, largeur: 'none', marge: '0',
    corps: `${ligneNomDate(langue)}
    ${corps}
    <section class="corrige"><h2>${T('corrige')}</h2>${corrige.map(c => `<div class="bloc-corrige">${c}</div>`).join('')}</section>`,
  })
}

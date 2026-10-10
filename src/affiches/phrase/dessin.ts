// Le dessin de « La phrase » : quatre bandes, du haut vers le bas.
//   1. la règle : une phrase commence par une majuscule et finit par un point (dans l'exemple, la majuscule et le point sont entourés) ;
//   2. les trois types, chacun avec son signe en grand dans un rond de couleur, à quoi il sert et un exemple ;
//   3. les deux formes (négative : « ne … pas » en couleur ; exclamative : le point d'exclamation) ;
//   4. (réglage) les groupes : la phrase d'exemple découpée en groupe sujet, verbe, complément, chaque groupe souligné de sa couleur.
// Pur : la mesure du texte vient du contexte.
import { echapper } from '../../utils/html.js'
import { tailleQuiTient } from '../listeMots.ts'
import type { ContexteDessin, Rendu } from '../types.ts'
import GRAMMAIRE from '../../langues/fr/textes/grammaire.ts'
import type { Reglages } from './definition.ts'

const BLEU = '#1d4e9e', ORANGE = '#d9480f', VERT = '#2b8a3e', VIOLET = '#862e9c', ROUGE = '#c2255c'

/**
 * Une carte : son signe (dans un rond de couleur : `point` est un vrai point, plein, au milieu du rond, pas un caractère qui se perd en bas),
 * son nom, à quoi elle sert, son exemple (HTML déjà échappé).
 */
interface Carte { signe: readonly ('point' | '?' | '!' | 'ne pas')[], couleur: string, nom: string, role: string, exemple: string }

/** Une rangée de cartes de même largeur, dans une bande de hauteur `h`. */
function rangee(cartes: readonly Carte[], W: number, h: number, ctx: ContexteDessin): string {
  const ecart = 4
  const l = (W - (cartes.length - 1) * ecart) / cartes.length
  const police = ctx.nomPolice()
  // carte étroite (portrait) : le rond au-dessus du nom, qui a alors toute la largeur
  const tNom = tailleQuiTient(cartes.map(c => c.nom), police, l * (l < 75 ? 0.9 : 0.6), h * 0.15, ctx)
  const tRole = tailleQuiTient(cartes.map(c => c.role), police, l * 0.9, h * 0.11, ctx)
  const tExemple = tailleQuiTient(cartes.map(c => c.exemple.replace(/<[^>]+>/g, '')), police, l * 0.9, h * 0.14, ctx)
  const rond = Math.min(h * 0.3, l * 0.3)
  // le contenu du rond : les signes côte à côte (« . ! » pour l'impérative), « ne pas » en plus petit
  const signes = (c: Carte): string => c.signe.map(s => {
    if (s === 'point') return `<span class="point" style="width:${rond * 0.2}mm;height:${rond * 0.2}mm"></span>`
    if (s === 'ne pas') return `<span style="font-size:${rond * 0.3}mm">ne pas</span>`
    return `<span>${s}</span>`
  }).join('')
  return `<div class="rangee-phrase" style="height:${h}mm;gap:${ecart}mm">${cartes.map(c => `
    <div class="carte-phrase" style="width:${l}mm;border-color:${c.couleur}">
      <div class="tete-phrase" style="flex-direction:${l < 75 ? 'column' : 'row'}"><span class="rond" style="width:${rond}mm;height:${rond}mm;background:${c.couleur};font-size:${rond * 0.65}mm">${signes(c)}</span>
        <b style="font-size:${tNom}mm;color:${c.couleur}">${echapper(c.nom)}</b></div>
      <span class="role" style="font-size:${tRole}mm">${echapper(c.role)}</span>
      <span class="exemple" style="font-size:${tExemple}mm">${c.exemple}</span>
    </div>`).join('')}</div>`
}

/** Un titre de bande. */
const titre = (texte: string, taille: number): string => `<h2 class="titre-bande" style="font-size:${taille}mm">${echapper(texte)}</h2>`

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  const police = ctx.nomPolice()
  const tTitre = Math.min(6.5, H * 0.03)
  const hTitre = tTitre * 1.7
  // les hauteurs des bandes : la règle, les types (la plus grande), les formes, les groupes (réglage)
  const parts = r.groupes ? [0.17, 0.33, 0.27, 0.23] : [0.2, 0.42, 0.38, 0]
  const libre = H - hTitre * (r.groupes ? 3 : 2)
  const [hRegle, hTypes, hFormes, hGroupes] = parts.map(p => p * libre)

  // 1. la règle, avec la majuscule et le point entourés dans l'exemple
  const exemple = T('regle.exemple')
  const marque = (s: string): string => `<span class="marque">${echapper(s)}</span>`
  const exempleHtml = `${marque(exemple[0])}${echapper(exemple.slice(1, -1))}${marque(exemple.slice(-1))}`
  const tRegle = tailleQuiTient([`${T('regle.titre')} ${T('regle.texte')}`], police, W * 0.95, hRegle * 0.22, ctx)
  const tExRegle = tailleQuiTient([exemple], police, W * 0.6, hRegle * 0.4, ctx)
  const regle = `<div class="regle" style="height:${hRegle}mm"><p style="font-size:${tRegle}mm"><b>${echapper(T('regle.titre'))}</b> ${echapper(T('regle.texte'))}</p>
    <p class="exemple-regle" style="font-size:${tExRegle}mm">${exempleHtml}</p></div>`

  // 2. les trois types de phrases
  const types: Carte[] = [
    { signe: ['point'], couleur: BLEU, nom: GRAMMAIRE.choix_declarative, role: T('type.declarative.role'), exemple: echapper(T('type.declarative.exemple')) },
    { signe: ['?'], couleur: ORANGE, nom: GRAMMAIRE.choix_interrogative, role: T('type.interrogative.role'), exemple: echapper(T('type.interrogative.exemple')) },
    // l'impérative finit par un point, ou par un point d'exclamation quand on insiste
    { signe: ['point', '!'], couleur: VERT, nom: GRAMMAIRE.choix_imperative, role: T('type.imperative.role'), exemple: echapper(T('type.imperative.exemple')) },
  ]
  // 3. les deux formes : « ne … pas » en couleur dans l'exemple
  const negative = echapper(T('forme.negative.exemple')).replace(/\bne\b(.*?)\bpas\b/, '<b class="negation">ne</b>$1<b class="negation">pas</b>')
  const formes: Carte[] = [
    { signe: ['ne pas'], couleur: VIOLET, nom: GRAMMAIRE.choix_negative, role: T('forme.negative.role'), exemple: negative },
    { signe: ['!'], couleur: ROUGE, nom: T('forme.exclamative'), role: T('forme.exclamative.role'), exemple: echapper(T('forme.exclamative.exemple')) },
  ]

  // 4. les groupes de la phrase : chaque groupe souligné de sa couleur, son nom dessous
  const groupesHtml = (): string => {
    const g = [['sujet', BLEU], ['verbe', ORANGE], ['complement', VERT]] as const
    const t = tailleQuiTient([g.map(([id]) => T(`groupe.exemple.${id}`)).join('  ')], police, W * 0.85, hGroupes * 0.32, ctx)
    const tNom = Math.min(t * 0.55, hGroupes * 0.16)
    return `<div class="groupes" style="height:${hGroupes}mm">${g.map(([id, couleur]) => `<span class="groupe" style="border-color:${couleur}">
      <span style="font-size:${t}mm">${echapper(T(`groupe.exemple.${id}`))}</span><small style="font-size:${tNom}mm;color:${couleur}">${echapper(id === 'verbe' ? GRAMMAIRE.choix_verbe : T(`groupe.${id}`))}</small></span>`).join('')}</div>`
  }

  const corps = `${regle}
    ${titre(T('types.titre'), tTitre)}${rangee(types, W, hTypes, ctx)}
    ${titre(T('formes.titre'), tTitre)}${rangee(formes, W, hFormes, ctx)}
    ${r.groupes ? `${titre(T('groupes.titre'), tTitre)}${groupesHtml()}` : ''}`
  return [`<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${corps}</div>`]
}

export const css = `
  .phrase { display: flex; flex-direction: column; }
  .titre-bande { margin: 0; color: #444; font-weight: 700; line-height: 1.7; flex: none; }
  .regle { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2mm; flex: none; text-align: center; }
  .regle p { margin: 0; }
  .exemple-regle { font-weight: 600; }
  .marque { display: inline-block; border: .6mm solid ${ROUGE}; border-radius: 50%; padding: 0 1mm; line-height: 1.1; color: ${ROUGE}; }
  .rangee-phrase { display: flex; flex: none; }
  .carte-phrase { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1.5mm; border: .5mm solid; border-radius: 3mm; box-sizing: border-box; text-align: center; padding: 1mm; }
  .tete-phrase { display: flex; align-items: center; gap: 2mm; }
  .rond { display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; color: #fff; font-weight: 700; line-height: 1; white-space: nowrap; }
  .role { color: #555; }
  .exemple { font-weight: 600; }
  .negation { color: ${VIOLET}; }
  .point { display: inline-block; border-radius: 50%; background: #fff; }
  .rond { gap: .6mm; }
  .groupes { display: flex; justify-content: center; align-items: center; gap: 3mm; flex: none; }
  .groupe { display: inline-flex; flex-direction: column; align-items: center; border-bottom: 1.2mm solid; padding: 0 1mm 1mm; line-height: 1.2; }
  .groupe small { font-weight: 700; }`

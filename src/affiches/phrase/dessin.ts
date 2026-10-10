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

/**
 * « Qu'est-ce qu'une phrase ? » (sans les types) : l'exemple en grand, la majuscule, le verbe et le point repérés dessous ; les cinq règles
 * (une coche verte chacune) ; trois exemples de ce qui n'est pas une phrase, barrés en rouge, avec la raison.
 */
function dessinDefinition({ W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
  const police = ctx.nomPolice()
  const hExemple = H * 0.22, hRegles = H * 0.44, hPas = H * 0.3
  // 1. l'exemple : chaque mot dans sa boîte ; la majuscule, le verbe et le point repérés de leur couleur, leur nom dessous
  const exemple = T('def.exemple')
  const mots = exemple.slice(0, -1).split(' ')
  const tEx = tailleQuiTient([exemple], police, W * 0.8, hExemple * 0.42, ctx)
  const tRep = Math.min(tEx * 0.42, 6)
  const motHtml = (m: string, i: number): string => {
    if (i === 0) return `<span class="mot-def"><span><span class="marque">${echapper(m[0])}</span>${echapper(m.slice(1))}</span><small style="color:${ROUGE};font-size:${tRep}mm">${echapper(T('def.majuscule'))}</small></span>`
    if (i === 2) return `<span class="mot-def"><span style="color:${ORANGE};border-bottom:1mm solid ${ORANGE}">${echapper(m)}</span><small style="color:${ORANGE};font-size:${tRep}mm">${echapper(T('def.verbe'))}</small></span>`
    return `<span class="mot-def"><span>${echapper(m)}</span><small style="font-size:${tRep}mm">&nbsp;</small></span>`
  }
  // le point, collé au dernier mot (sans espace), son nom dessous
  const point = `<span class="mot-def point-def"><span class="marque">.</span><small style="color:${ROUGE};font-size:${tRep}mm">${echapper(T('def.point'))}</small></span>`
  const exempleHtml = `<div class="exemple-def" style="height:${hExemple}mm;font-size:${tEx}mm">${mots.map(motHtml).join('<span class="espace"> </span>')}${point}</div>`
  // 2. les règles
  const regles = ['majuscule', 'point', 'ordre', 'sens', 'verbe'].map(id => T(`def.regle.${id}`))
  const tRegle = tailleQuiTient(regles, police, W * 0.82, (hRegles / regles.length) * 0.5, ctx)
  const reglesHtml = `<ul class="regles-def" style="height:${hRegles}mm;font-size:${tRegle}mm">${regles.map(r => `<li><span class="coche">✓</span>${echapper(r)}</li>`).join('')}</ul>`
  // 3. ce qui n'est pas une phrase
  const pas = ['ordre', 'verbe', 'sens'].map(id => ({ texte: T(`def.pas.${id}`), raison: T(`def.pas.${id}.raison`) }))
  const tPas = tailleQuiTient(pas.map(p => p.texte), police, W * 0.5, (hPas / 4) * 0.5, ctx)
  const tRaison = tailleQuiTient(pas.map(p => p.raison), police, W * 0.4, (hPas / 4) * 0.42, ctx)
  const pasHtml = `<div class="pas-def" style="height:${hPas}mm"><h2 class="titre-bande" style="font-size:${tPas}mm;color:${ROUGE}">${echapper(T('def.pas.titre'))}</h2>${pas.map(p => `
    <div class="ligne-pas"><span class="croix">✗</span><s style="font-size:${tPas}mm">${echapper(p.texte)}</s><span class="raison" style="font-size:${tRaison}mm">→ ${echapper(p.raison)}</span></div>`).join('')}</div>`
  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${exempleHtml}${reglesHtml}${pasHtml}</div>`
}

/**
 * « La phrase » expliquée (CE1, sans types ni formes), en cinq bandes : la définition et son exemple ; les trois vérifications (majuscule,
 * point, sens), chacune dans un rond de couleur ; deux suites de mots qui ne sont pas des phrases, vérifiées pas à pas (✓ ✓ ✗) ; « de qui on
 * parle / ce qu'on en dit » sur deux exemples (le groupe sujet en bleu, le reste en vert) ; une phrase peut être courte ou longue.
 */
function dessinExplication({ W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
  const police = ctx.nomPolice()
  const taille = (textes: readonly string[], largeur: number, plafond: number): number => tailleQuiTient(textes, police, largeur, plafond, ctx)

  // 1. la définition et l'exemple
  const definition = (w: number, h: number): string => `<div class="bande-exp" style="width:${w}mm;height:${h}mm">
    <p style="font-size:${taille([T('exp.definition')], w * 0.95, h * 0.3)}mm"><b>${echapper(T('exp.definition'))}</b></p>
    <p class="exemple" style="font-size:${taille([T('exp.exemple')], w * 0.75, h * 0.38)}mm">${echapper(T('exp.exemple'))}</p></div>`

  // 2. les trois vérifications, chacune dans un rond de couleur
  const verifs = [
    { couleur: ROUGE, nom: T('exp.v.majuscule'), detail: '' },
    { couleur: BLEU, nom: T('exp.v.point'), detail: T('exp.v.point.detail') },
    { couleur: VERT, nom: T('exp.v.sens'), detail: T('exp.v.sens.detail') },
  ]
  const verifier = (w: number, h: number): string => {
    const lV = (w - 8) / 3
    const tNom = taille(verifs.map(v => v.nom), lV * 0.9, h * 0.15)
    const tDetail = taille(verifs.map(v => v.detail).filter(Boolean), lV * 0.92, h * 0.12)
    const rond = Math.min(h * 0.3, lV * 0.3)
    return `<div class="bande-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.verifier')], w * 0.9, h * 0.13)}mm">${echapper(T('exp.verifier'))}</p>
    <div class="verifs">${verifs.map((v, i) => `<div class="verif" style="width:${lV}mm;border-color:${v.couleur}">
      <span class="rond" style="width:${rond}mm;height:${rond}mm;background:${v.couleur};font-size:${rond * 0.6}mm">${i + 1}</span>
      <b style="font-size:${tNom}mm;color:${v.couleur}">${echapper(v.nom)}</b>${v.detail ? `<span style="font-size:${tDetail}mm">${echapper(v.detail)}</span>` : ''}</div>`).join('')}</div></div>`
  }

  // 3. deux suites de mots qui ne sont pas des phrases, vérifiées : ✓ ou ✗ pour chacune des trois vérifications
  const pas = [
    { texte: T('exp.pas.1'), coches: [true, true, false], raison: T('exp.pas.1.raison') },
    { texte: T('exp.pas.2'), coches: [false, false, false], raison: T('exp.pas.2.raison') },
  ]
  const coche = (ok: boolean, i: number): string => `<span class="coche-exp" style="color:${ok ? VERT : ROUGE}">${i + 1} ${ok ? '✓' : '✗'}</span>`
  const contreExemples = (w: number, h: number): string => {
    const tPas = taille(pas.map(p => p.texte), w * 0.55, h * 0.13)
    const tRaison = taille(pas.map(p => p.raison), w * 0.9, h * 0.09)
    return `<div class="bande-exp pas-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.pas.titre')], w * 0.9, h * 0.12)}mm;color:${ROUGE}">${echapper(T('exp.pas.titre'))}</p>
    ${pas.map(p => `<div class="ligne-exp"><s style="font-size:${tPas}mm">${echapper(p.texte)}</s><span class="coches" style="font-size:${tPas * 0.8}mm">${p.coches.map(coche).join('')}</span></div>
      <p class="raison" style="font-size:${tRaison}mm">→ ${echapper(p.raison)}</p>`).join('')}</div>`
  }

  // 4. de qui on parle, ce qu'on en dit : le groupe sujet en bleu, le reste en vert
  const exemples = [1, 2].map(n => ({ sujet: T(`exp.qui.${n}.sujet`), reste: T(`exp.qui.${n}.reste`) }))
  const quiOnParle = (w: number, h: number): string => {
    const tQui = taille(exemples.map(e => `${e.sujet} ${e.reste}`), w * 0.8, h * 0.18)
    const tEtiq = Math.min(tQui * 0.45, 5.5)
    const groupe = (texte: string, couleur: string, etiquette: string): string =>
      `<span class="groupe-exp" style="border-color:${couleur}"><span>${echapper(texte)}</span><small style="color:${couleur};font-size:${tEtiq}mm">${echapper(etiquette)}</small></span>`
    return `<div class="bande-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.qui.titre')], w * 0.95, h * 0.12)}mm">${echapper(T('exp.qui.titre'))}</p>
    ${exemples.map(e => `<p class="phrase-exp" style="font-size:${tQui}mm">${groupe(e.sujet, BLEU, T('exp.qui.sujet'))}${groupe(e.reste, VERT, T('exp.qui.reste'))}</p>`).join('')}</div>`
  }

  // 5. courte ou longue
  const longueur = (w: number, h: number): string => `<div class="bande-exp" style="width:${w}mm;height:${h}mm">
    <p class="longueur-exp" style="font-size:${taille([T('exp.longueur')], w * 0.95, h * 0.32)}mm">${echapper(T('exp.longueur'))}</p></div>`

  const contenu = (html: string): string => `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${html}</div>`
  // portrait : les cinq bandes l'une sous l'autre ; paysage : deux colonnes (ce qu'est une phrase / ce qui n'en est pas une, et ses groupes)
  if (H >= W) return contenu(definition(W, H * 0.16) + verifier(W, H * 0.24) + contreExemples(W, H * 0.24) + quiOnParle(W, H * 0.26) + longueur(W, H * 0.1))
  const l = (W - 6) / 2
  const gauche = `<div class="colonne-exp">${definition(l, H * 0.34)}${verifier(l, H * 0.46)}${longueur(l, H * 0.2)}</div>`
  const droite = `<div class="colonne-exp">${contreExemples(l, H * 0.48)}${quiOnParle(l, H * 0.52)}</div>`
  return contenu(`<div class="colonnes-exp">${gauche}${droite}</div>`)
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  if (r.variante === 'explication') return [{ corps: dessinExplication({ W, H }, T, ctx), titre: r.titre || GRAMMAIRE.groupe_phrase }]
  if (r.variante === 'definition') return [{ corps: dessinDefinition({ W, H }, T, ctx), titre: r.titre || T('variante.definition.court') }]
  return [{ corps: dessinTypes(r, { W, H }, T, ctx), titre: r.titre || T('titre.ce1') }]
}

/** La phrase au CE1 : la règle, les trois types, les deux formes, les groupes (réglage). */
function dessinTypes(r: Reglages, { W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
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
  const tRegle = tailleQuiTient([`${T('regle.titre')} ${T('regle.texte')}`], police, W * 0.98, hRegle * 0.3, ctx)
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
    ${titre(T('formes.titre'), tTitre)}${rangee(formes, W, hFormes * 0.82, ctx)}<p class="lien-formes" style="font-size:${Math.min(tTitre * 0.75, hFormes * 0.08)}mm">${echapper(T('formes.lien'))}</p>
    ${r.groupes ? `${titre(T('groupes.titre'), tTitre)}${groupesHtml()}` : ''}`
  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${corps}</div>`
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
  .groupe small { font-weight: 700; }
  .colonnes-exp { display: flex; gap: 6mm; }
  .colonne-exp { display: flex; flex-direction: column; }
  .bande-exp { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1.5mm; flex: none; text-align: center; }
  .bande-exp p { margin: 0; }
  .titre-exp { font-weight: 700; color: #444; }
  .verifs { display: flex; gap: 4mm; }
  .verif { display: flex; flex-direction: column; align-items: center; gap: 1mm; border: .5mm solid; border-radius: 3mm; padding: 2mm 1mm; box-sizing: border-box; }
  .pas-exp { border: .5mm dashed ${ROUGE}; border-radius: 3mm; box-sizing: border-box; }
  .ligne-exp { display: flex; align-items: baseline; gap: 5mm; }
  .ligne-exp s { text-decoration-color: ${ROUGE}; text-decoration-thickness: .5mm; }
  .coches { display: inline-flex; gap: 3mm; font-weight: 700; }
  .phrase-exp { display: flex; gap: 2mm; justify-content: center; }
  .groupe-exp { display: inline-flex; flex-direction: column; align-items: center; border-bottom: 1.2mm solid; padding: 0 1mm .5mm; line-height: 1.2; }
  .groupe-exp small { font-weight: 700; white-space: nowrap; }
  .longueur-exp { color: #444; font-style: italic; }
  .lien-formes { margin: 1mm 0 0; color: #444; text-align: center; font-style: italic; flex: none; }
  .exemple-def { display: flex; align-items: center; justify-content: center; font-weight: 700; flex: none; padding-bottom: 6mm; box-sizing: border-box; }
  .espace { width: .3em; }
  .point-def { margin-left: .05em; }
  /* le nom (majuscule, verbe, point) sous le mot, sans élargir le mot : les espaces restent ceux de la phrase */
  .mot-def { position: relative; display: inline-block; line-height: 1.15; }
  .mot-def small { position: absolute; top: 128%; left: 50%; transform: translateX(-50%); font-weight: 700; white-space: nowrap; }
  .regles-def { list-style: none; margin: 0; padding: 0 4mm; display: flex; flex-direction: column; justify-content: space-around; flex: none; }
  .regles-def li { display: flex; align-items: center; gap: 3mm; }
  .coche { color: ${VERT}; font-weight: 700; }
  .pas-def { display: flex; flex-direction: column; justify-content: space-around; padding: 0 4mm; border: .5mm dashed ${ROUGE}; border-radius: 3mm; flex: none; box-sizing: border-box; }
  .ligne-pas { display: flex; align-items: baseline; gap: 3mm; flex-wrap: wrap; }
  .croix { color: ${ROUGE}; font-weight: 700; font-size: 1.4em; }
  .ligne-pas s { text-decoration-color: ${ROUGE}; text-decoration-thickness: .5mm; }
  .raison { color: #555; }`

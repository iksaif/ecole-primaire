// Le dessin des quatre affiches « La phrase » (definition.ts) : une fonction par variante, des bandes du haut vers le bas, en portrait.
// Pur : la mesure du texte vient du contexte. Les noms des types et des formes sont ceux de l'exercice (src/langues/fr/textes/grammaire.ts).
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
  const tRole = tailleQuiTient(cartes.map(c => c.role), police, l * 0.92, h * 0.14, ctx)
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
    return `<span class="mot-def"><span>${echapper(m)}</span><small style="font-size:${tRep}mm">&nbsp;</small></span>`
  }
  // le point, collé au dernier mot (sans espace), son nom dessous
  const point = `<span class="mot-def point-def"><span class="marque">.</span><small style="color:${ROUGE};font-size:${tRep}mm">${echapper(T('def.point'))}</small></span>`
  const exempleHtml = `<div class="exemple-def" style="height:${hExemple}mm;font-size:${tEx}mm">${mots.map(motHtml).join('<span class="espace"> </span>')}${point}</div>`
  // 2. les règles
  const regles = ['majuscule', 'point', 'ordre', 'sens'].map(id => T(`def.regle.${id}`))
  const tRegle = tailleQuiTient(regles, police, W * 0.82, (hRegles / regles.length) * 0.5, ctx)
  const reglesHtml = `<ul class="regles-def" style="height:${hRegles}mm;font-size:${tRegle}mm">${regles.map(r => `<li><span class="coche">✓</span>${echapper(r)}</li>`).join('')}</ul>`
  // 3. ce qui n'est pas une phrase
  // une seule faute par exemple : l'ordre, la majuscule et le point, le sens
  const pas = ['ordre', 'majuscule', 'sens'].map(id => ({ texte: T(`def.pas.${id}`), raison: T(`def.pas.${id}.raison`) }))
  const tPas = tailleQuiTient(pas.map(p => p.texte), police, W * 0.5, (hPas / 4) * 0.5, ctx)
  const tRaison = tailleQuiTient(pas.map(p => p.raison), police, W * 0.4, (hPas / 4) * 0.42, ctx)
  const pasHtml = `<div class="pas-def" style="height:${hPas}mm"><h2 class="titre-bande" style="font-size:${tPas}mm;color:${ROUGE}">${echapper(T('def.pas.titre'))}</h2>${pas.map(p => `
    <div class="ligne-pas"><span class="croix">✗</span><span class="faux" style="font-size:${tPas}mm">${echapper(p.texte)}</span><span class="raison" style="font-size:${tRaison}mm">→ ${echapper(p.raison)}</span></div>`).join('')}</div>`
  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${exempleHtml}${reglesHtml}${pasHtml}</div>`
}

/**
 * « La phrase » expliquée (CE1, sans types ni formes), en quatre bandes : la définition et son exemple ; les trois vérifications (majuscule,
 * point, sens), chacune dans un rond de couleur ; une suite de mots qui n'est pas une phrase, vérifiée pas à pas (✓ ✓ ✗) ; « de qui on
 * parle / ce qu'on en dit » sur un exemple (le groupe sujet en bleu, le reste en vert). Peu de texte, en grand : c'est une affiche.
 */
/** Un exemple dont la majuscule et le point sont entourés (les vérifications 1 et 2). */
const exempleEntoure = (s: string): string => `<span class="marque">${echapper(s[0])}</span>${echapper(s.slice(1, -1))}<span class="marque">${echapper(s.slice(-1))}</span>`

function dessinExplication({ W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
  const police = ctx.nomPolice()
  const taille = (textes: readonly string[], largeur: number, plafond: number): number => tailleQuiTient(textes, police, largeur, plafond, ctx)

  // 1. la définition et l'exemple
  const definition = (w: number, h: number): string => `<div class="bande-exp" style="width:${w}mm;height:${h}mm">
    <p style="font-size:${taille([T('exp.definition')], w * 0.95, h * 0.3)}mm"><b>${echapper(T('exp.definition'))}</b></p>
    <p class="exemple" style="font-size:${taille([T('exp.exemple')], w * 0.75, h * 0.38)}mm">${exempleEntoure(T('exp.exemple'))}</p></div>`

  // 2. les trois vérifications, chacune dans un rond de couleur
  const verifs = [
    // la carte 1 montre la majuscule de l'exemple, entourée comme dans l'exemple
    { couleur: ROUGE, nom: T('exp.v.majuscule'), detail: T('exp.exemple')[0] },
    { couleur: BLEU, nom: T('exp.v.point'), detail: T('exp.v.point.detail') },
    { couleur: VERT, nom: T('exp.v.sens'), detail: T('exp.v.sens.detail') },
  ]
  const verifier = (w: number, h: number): string => {
    const lV = (w - 8) / 3
    const tNom = taille(verifs.map(v => v.nom), lV * 0.92, h * 0.2)
    const tDetail = Math.min(tNom * 0.85, taille(verifs.map(v => v.detail).filter(Boolean), lV * 0.92, h * 0.13))
    const rond = Math.min(h * 0.3, lV * 0.3)
    return `<div class="bande-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.verifier')], w * 0.9, h * 0.13)}mm">${echapper(T('exp.verifier'))}</p>
    <div class="verifs">${verifs.map((v, i) => `<div class="verif" style="width:${lV}mm;border-color:${v.couleur}">
      <span class="rond" style="width:${rond}mm;height:${rond}mm;background:${v.couleur};font-size:${rond * 0.6}mm">${i + 1}</span>
      <b style="font-size:${tNom}mm;color:${v.couleur}">${echapper(v.nom)}</b>${v.detail ? `<span style="font-size:${i === 0 ? tDetail * 1.6 : tDetail}mm">${i === 0 ? `<span class="marque">${echapper(v.detail)}</span>` : echapper(v.detail)}</span>` : ''}</div>`).join('')}</div></div>`
  }

  // 3. une suite de mots qui n'est pas une phrase, vérifiée : ✓ ou ✗ pour chacune des trois vérifications
  const pas = [
    { texte: T('exp.pas.1'), coches: [true, true, false], raison: T('exp.pas.1.raison') },
  ]
  const coche = (ok: boolean, i: number): string => `<span class="coche-exp" style="color:${ok ? VERT : ROUGE}">${i + 1} ${ok ? '✓' : '✗'}</span>`
  const contreExemples = (w: number, h: number): string => {
    const tPas = taille(pas.map(p => p.texte), w * 0.6, h * 0.2)
    const tRaison = taille(pas.map(p => p.raison), w * 0.92, h * 0.14)
    return `<div class="bande-exp pas-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.pas.titre')], w * 0.9, h * 0.12)}mm;color:${ROUGE}">${echapper(T('exp.pas.titre'))}</p>
    ${pas.map(p => `<div class="ligne-exp"><span class="faux" style="font-size:${tPas}mm">${echapper(p.texte)}</span><span class="coches" style="font-size:${tPas * 0.8}mm">${p.coches.map(coche).join('')}</span></div>
      <p class="raison" style="font-size:${tRaison}mm">→ ${echapper(p.raison)}</p>`).join('')}</div>`
  }

  // 4. les groupes de la phrase de l'exemple : le groupe sujet (de qui, de quoi on parle), le verbe, le complément ; chacun souligné de sa couleur
  const groupes = [
    { texte: T('exp.qui.1.sujet'), couleur: BLEU, nom: T('groupe.sujet'), question: T('exp.qui.sujet') },
    { texte: T('exp.qui.1.verbe'), couleur: ORANGE, nom: GRAMMAIRE.choix_verbe, question: T('exp.qui.verbe') },
    { texte: T('exp.qui.1.complement'), couleur: VERT, nom: T('groupe.complement'), question: T('exp.qui.complement') },
  ]
  const lesGroupes = (w: number, h: number): string => {
    const tPhrase = taille([groupes.map(g => g.texte).join(' ')], w * 0.85, h * 0.3)
    const tNom = Math.min(tPhrase * 0.5, 7)
    const tQuestion = Math.min(tNom * 0.85, taille(groupes.map(g => g.question), (w * 0.85) / 3, h * 0.1))
    return `<div class="bande-exp" style="width:${w}mm;height:${h}mm"><p class="titre-exp" style="font-size:${taille([T('exp.qui.titre')], w * 0.9, h * 0.12)}mm">${echapper(T('exp.qui.titre'))}</p>
    <p class="phrase-exp" style="font-size:${tPhrase}mm">${groupes.map(g => `<span class="groupe-exp" style="border-color:${g.couleur}"><span>${echapper(g.texte)}</span>
      <small style="color:${g.couleur};font-size:${tNom}mm">${echapper(g.nom)}</small><em style="font-size:${tQuestion}mm">${echapper(g.question)}</em></span>`).join('')}</p></div>`
  }

  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${definition(W, H * 0.2) + verifier(W, H * 0.28) + contreExemples(W, H * 0.22) + lesGroupes(W, H * 0.3)}</div>`
}

/** CP : les trois types de phrases, reconnus par leur signe de fin ; ce que fait chaque phrase en grand (je dis, je demande, je donne un ordre). */
function dessinTypesCP({ W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
  const police = ctx.nomPolice()
  const hIntro = H * 0.1
  const tIntro = tailleQuiTient([T('cp.intro')], police, W * 0.92, hIntro * 0.45, ctx)
  // les cartes : le rôle de la phrase prend la place du nom (le mot « déclarative » ne se lit pas au CP)
  const cartes: Carte[] = [
    { signe: ['point'], couleur: BLEU, nom: T('cp.declarative.role'), role: GRAMMAIRE.choix_declarative, exemple: echapper(T('type.declarative.exemple')) },
    { signe: ['?'], couleur: ORANGE, nom: T('cp.interrogative.role'), role: GRAMMAIRE.choix_interrogative, exemple: echapper(T('type.interrogative.exemple')) },
    { signe: ['point'], couleur: VERT, nom: T('cp.imperative.role'), role: GRAMMAIRE.choix_imperative, exemple: echapper(T('type.imperative.exemple')) },
  ]
  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}"><p class="intro-cp" style="height:${hIntro}mm;font-size:${tIntro}mm">${echapper(T('cp.intro'))}</p>
    ${pile(cartes, W, H - hIntro, ctx)}</div>`
}

/** Les cartes l'une sous l'autre (CP) : le signe en grand à gauche, ce que fait la phrase et l'exemple à droite, le nom du type en petit. */
function pile(cartes: readonly Carte[], W: number, H: number, ctx: ContexteDessin): string {
  const ecart = 4
  const h = (H - (cartes.length - 1) * ecart) / cartes.length
  const police = ctx.nomPolice()
  const rond = h * 0.62
  const lTexte = W - rond - 16
  const tNom = tailleQuiTient(cartes.map(c => c.nom), police, lTexte, h * 0.26, ctx)
  const tExemple = tailleQuiTient(cartes.map(c => c.exemple.replace(/<[^>]+>/g, '')), police, lTexte, h * 0.2, ctx)
  const tRole = Math.min(tExemple * 0.6, 5)
  const signes = (c: Carte): string => c.signe.map(s => (s === 'point' ? `<span class="point" style="width:${rond * 0.22}mm;height:${rond * 0.22}mm"></span>` : `<span>${s}</span>`)).join('')
  return `<div class="pile-cp" style="gap:${ecart}mm">${cartes.map(c => `<div class="carte-cp" style="height:${h}mm;border-color:${c.couleur}">
    <span class="rond" style="width:${rond}mm;height:${rond}mm;background:${c.couleur};font-size:${rond * 0.68}mm">${signes(c)}</span>
    <div class="textes-cp"><b style="font-size:${tNom}mm;color:${c.couleur}">${echapper(c.nom)}</b><span class="exemple" style="font-size:${tExemple}mm">${c.exemple}</span>
    <small style="font-size:${tRole}mm">${echapper(c.role)}</small></div></div>`).join('')}</div>`
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  if (r.variante === 'explication') return [{ corps: dessinExplication({ W, H }, T, ctx), titre: r.titre || T('titre.explication') }]
  if (r.variante === 'types-cp') return [{ corps: dessinTypesCP({ W, H }, T, ctx), titre: r.titre || T('titre.types-cp') }]
  if (r.variante === 'definition') return [{ corps: dessinDefinition({ W, H }, T, ctx), titre: r.titre || T('variante.definition.court') }]
  return [{ corps: dessinTypes({ W, H }, T, ctx), titre: r.titre || T('titre.ce1') }]
}

/** CE1 : la règle, les trois types, les deux formes (les groupes sont sur « Reconnaître une phrase »). */
function dessinTypes({ W, H }: { W: number, H: number }, T: (cle: string) => string, ctx: ContexteDessin): string {
  const police = ctx.nomPolice()
  const tTitre = Math.min(6.5, H * 0.03)
  const hTitre = tTitre * 1.7
  // les hauteurs des bandes : la règle, les types (la plus grande), les formes
  const libre = H - hTitre * 2
  const [hRegle, hTypes, hFormes] = [0.2, 0.42, 0.38].map(p => p * libre)

  // 1. la règle, avec la majuscule et le point entourés dans l'exemple
  const exemple = T('regle.exemple')
  const marque = (s: string): string => `<span class="marque">${echapper(s)}</span>`
  const exempleHtml = `${marque(exemple[0])}${echapper(exemple.slice(1, -1))}${marque(exemple.slice(-1))}`
  const tRegle = tailleQuiTient([`${T('regle.titre')} ${T('regle.texte')}`], police, W * 0.9, hRegle * 0.34, ctx)
  const tExRegle = tailleQuiTient([exemple], police, W * 0.6, hRegle * 0.4, ctx)
  const regle = `<div class="regle" style="height:${hRegle}mm"><p style="font-size:${tRegle}mm"><b>${echapper(T('regle.titre'))}</b> ${echapper(T('regle.texte'))}</p>
    <p class="regle-exemple" style="font-size:${tExRegle}mm">${exempleHtml}</p></div>`

  // 2. les trois types de phrases
  const types: Carte[] = [
    { signe: ['point'], couleur: BLEU, nom: GRAMMAIRE.choix_declarative, role: T('type.declarative.role'), exemple: echapper(T('type.declarative.exemple')) },
    { signe: ['?'], couleur: ORANGE, nom: GRAMMAIRE.choix_interrogative, role: T('type.interrogative.role'), exemple: echapper(T('type.interrogative.exemple')) },
    // l'impérative au point seul sur l'affiche : le « ! » est celui de l'exclamative (deux sens pour un signe embrouillent au CE1)
    { signe: ['point'], couleur: VERT, nom: GRAMMAIRE.choix_imperative, role: T('type.imperative.role'), exemple: echapper(T('type.imperative.exemple')) },
  ]
  // 3. les deux formes : « ne … pas » en couleur dans l'exemple
  const negative = echapper(T('forme.negative.exemple')).replace(/\bne\b(.*?)\bpas\b/, '<b class="negation">ne</b>$1<b class="negation">pas</b>')
  const formes: Carte[] = [
    { signe: ['ne pas'], couleur: VIOLET, nom: GRAMMAIRE.choix_negative, role: T('forme.negative.role'), exemple: negative },
    { signe: ['!'], couleur: ROUGE, nom: T('forme.exclamative'), role: T('forme.exclamative.role'), exemple: echapper(T('forme.exclamative.exemple')) },
  ]

  const corps = `${regle}
    ${titre(T('types.titre'), tTitre)}${rangee(types, W, hTypes, ctx)}
    ${titre(T('formes.titre'), tTitre)}${rangee(formes, W, hFormes * 0.82, ctx)}<p class="lien-formes" style="font-size:${Math.min(tTitre * 0.75, hFormes * 0.08)}mm">${echapper(T('formes.lien'))}</p>`
  return `<div class="phrase" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${corps}</div>`
}

export const css = `
  .phrase { display: flex; flex-direction: column; }
  .titre-bande { margin: 0; color: #444; font-weight: 700; line-height: 1.7; flex: none; }
  .regle { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 2mm; flex: none; text-align: center; }
  .regle p { margin: 0; }
  .regle-exemple { font-weight: 600; }
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
  .colonnes-exp { display: flex; gap: 6mm; }
  .colonne-exp { display: flex; flex-direction: column; }
  .bande-exp { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 1.5mm; flex: none; text-align: center; }
  .bande-exp p { margin: 0; }
  .titre-exp { font-weight: 700; color: #444; }
  .verifs { display: flex; gap: 4mm; }
  .verif { display: flex; flex-direction: column; align-items: center; gap: 1mm; border: .5mm solid; border-radius: 3mm; padding: 2mm 1mm; box-sizing: border-box; }
  .pas-exp { border: .5mm dashed ${ROUGE}; border-radius: 3mm; box-sizing: border-box; }
  .ligne-exp { display: flex; align-items: baseline; gap: 5mm; }
  .faux { color: #333; }
  .coches { display: inline-flex; gap: 3mm; font-weight: 700; }
  .phrase-exp { display: flex; gap: 2mm; justify-content: center; }
  .groupe-exp { display: inline-flex; flex-direction: column; align-items: center; border-bottom: 1.2mm solid; padding: 0 1mm .5mm; line-height: 1.2; }
  .groupe-exp small { font-weight: 700; white-space: nowrap; }
  .groupe-exp em { color: #555; white-space: nowrap; }
  .intro-cp { display: flex; align-items: center; justify-content: center; margin: 0; text-align: center; font-weight: 700; color: #444; }
  .pile-cp { display: flex; flex-direction: column; }
  .carte-cp { display: flex; align-items: center; gap: 6mm; padding: 0 5mm; border: .6mm solid; border-radius: 4mm; box-sizing: border-box; }
  .textes-cp { display: flex; flex-direction: column; gap: 1.5mm; line-height: 1.15; }
  .textes-cp small { color: #666; }
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

  .raison { color: #555; }`

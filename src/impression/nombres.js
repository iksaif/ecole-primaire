// Génération des affiches / fiches de nombres en lettres (français, breton) — partagée par l'app et le build des PDF.
import { enLettresFr } from '../utils/nombres'
import { langueRegionale } from '../data/languesRegionales'
import { largeurTexte, dimensionsPage, documentImpression, echapper } from '../utils/impression'

// Deux réglages de langue distincts :
//   config.langues : langues dans lesquelles les nombres sont écrits, ex. ['fr'], ['br'], ['fr', 'br']
//                    (codes de src/data/languesRegionales.js pour les langues régionales) ;
//   config.langue  : langue du document (titres, légende), comme pour les autres fiches.
// Choix proposés selon la langue régionale active (libellés : catalogue d'interface de NombresView).
export function languesDisponibles(regionale) {
  const r = langueRegionale(regionale)
  if (!r) return [{ id: 'fr', langues: ['fr'] }]
  return [
    { id: 'bilingue', langues: ['fr', r.id] },
    { id: 'fr', langues: ['fr'] },
    { id: 'br', langues: [r.id] },
  ]
}

// Anciens réglages (langue: 'bilingue' | 'fr' | 'br', regionale, langueTextes) → nouveaux
export function normaliserLangues(config) {
  if (Array.isArray(config.langues) && config.langues.length) return { langues: config.langues, langue: config.langue === 'br' ? 'br' : 'fr' }
  const r = config.regionale ?? 'br'
  const langues = { fr: ['fr'], br: [r], bilingue: ['fr', r] }[config.langue] ?? ['fr', r]
  return { langues, langue: config.langueTextes ?? (config.langue === 'br' ? 'br' : 'fr') }
}
export const plage = (de, a, pas = 1) => Array.from({ length: Math.floor((a - de) / pas) + 1 }, (_, k) => de + k * pas)
export const SECTIONS = [
  { id: 'unites',    label: 'Unités (0 → 9)',          titre: 'Les unités', br: 'Unanennoù', labelBr: 'Unanennoù (0 → 9)', nombres: plage(0, 9), repr: 'unites' },
  { id: 'onze',      label: '10 → 20',                  titre: 'De 10 à 20', br: 'Eus 10 da 20', nombres: plage(10, 20) },
  { id: 'dizaines',  label: 'Dizaines (10 → 100)',      titre: 'Les dizaines', br: 'Degadoù', labelBr: 'Degadoù (10 → 100)', nombres: plage(10, 100, 10), repr: 'dizaines' },
  { id: 'centaines', label: 'Centaines (100 → 1000)',   titre: 'Les centaines', br: 'Kantadoù', labelBr: 'Kantadoù (100 → 1000)', nombres: plage(100, 1000, 100), repr: 'centaines' },
  { id: 'milliers',  label: 'Milliers (1000 → 9000)',   titre: 'Les milliers', br: 'Miliadoù', labelBr: 'Miliadoù (1000 → 9000)', nombres: plage(1000, 9000, 1000) },
  { id: 'cent',      label: 'Tableau de 0 à 100',       titre: 'Les nombres de 0 à 100', br: 'An niveroù eus 0 da 100', labelBr: 'Taolenn eus 0 da 100', nombres: plage(0, 100) },
  { id: 'perso',     label: 'Personnalisé…',            titre: null },
  // une affiche par dizaine : 20 → 30, 30 → 40… (en breton chaque dizaine a sa logique)
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => ({
    id: `d${d}`, dizaine: true, label: `${d * 10} → ${d * 10 + 10}`,
    titre: `De ${d * 10} à ${d * 10 + 10}`, br: `Eus ${d * 10} da ${d * 10 + 10}`, nombres: plage(d * 10, d * 10 + 10),
  })),
]
export const SECTIONS_PRINCIPALES = SECTIONS.filter(s => !s.dizaine)
export const SECTIONS_DIZAINES = SECTIONS.filter(s => s.dizaine)

export const DEFAUTS = {
  langues: ['fr', 'br'], sections: ['unites', 'onze', 'dizaines', 'centaines'], de: 20, a: 29, pas: 1,
  miseEnPage: 'affiches', format: 'A4', orientation: 'portrait', representation: true, rectifiee: true,
}

export function nombresPersonnalises(config) {
  const de = Math.max(0, Math.min(9999, +config.de || 0))
  const a = Math.max(de, Math.min(9999, +config.a || 0))
  const pas = Math.max(1, +config.pas || 1)
  return plage(de, a, pas).slice(0, 200)
}

// ── Représentations (SVG en mm, hauteur h) ──
function representation(type, n, h, maxW) {
  const r = representationBrute(type, n, h)
  if (!r.svg || r.w <= maxW) return r.svg
  // trop large : on réduit tout le dessin proportionnellement
  const k = maxW / r.w
  return r.svg.replace(/width="[^"]+mm" height="[^"]+mm"/, `width="${maxW}mm" height="${h * k}mm"`)
}

function representationBrute(type, n, h) {
  const coul = '#e07a1f'
  if (type === 'unites') {
    if (n === 0) return { w: h * 0.6, svg: '' }
    // points rangés par 5 (comme sur la boîte de Picbille / les cartes à points)
    const r = h / 7, pas = h / 3.2
    const pts = Array.from({ length: n }, (_, k) => `<circle cx="${pas / 2 + (k % 5) * pas}" cy="${h / 2 + (k < 5 ? -pas / 2 : pas / 2) * (n > 5 ? 1 : 0)}" r="${r}" fill="${coul}"/>`)
    const w = 5 * pas
    return { w, svg: `<svg width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">${pts.join('')}</svg>` }
  }
  if (type === 'dizaines') {
    const nb = n / 10, bw = h / 6, ecart = bw * 0.5
    let s = ''
    for (let k = 0; k < nb; k++) {
      const x = k * (bw + ecart)
      s += `<rect x="${x}" y="0" width="${bw}" height="${h}" fill="#4a90e2" stroke="#1d4e9e" stroke-width="${bw * 0.08}"/>`
      for (let j = 1; j < 10; j++) s += `<line x1="${x}" x2="${x + bw}" y1="${j * h / 10}" y2="${j * h / 10}" stroke="#1d4e9e" stroke-width="${bw * 0.05}"/>`
    }
    const w = nb * (bw + ecart)
    return { w, svg: `<svg width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">${s}</svg>` }
  }
  // centaines : plaques de 10 × 10 rangées par 5, sans chevauchement pour pouvoir les compter
  const nb = n / 100, parRang = Math.min(nb, 5), rangs = Math.ceil(nb / 5)
  const ecart = h * 0.06
  const c = (h - (rangs - 1) * ecart) / rangs
  let s = ''
  for (let k = 0; k < nb; k++) {
    const x = (k % 5) * (c + ecart), y = Math.floor(k / 5) * (c + ecart)
    s += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="#5cb85c" stroke="#2d7a2d" stroke-width="${c * 0.03}"/>`
    for (let j = 1; j < 10; j++) {
      s += `<line x1="${x}" x2="${x + c}" y1="${y + j * c / 10}" y2="${y + j * c / 10}" stroke="#2d7a2d" stroke-width="${c * 0.012}"/>`
      s += `<line y1="${y}" y2="${y + c}" x1="${x + j * c / 10}" x2="${x + j * c / 10}" stroke="#2d7a2d" stroke-width="${c * 0.012}"/>`
    }
  }
  const w = parRang * (c + ecart) - ecart
  return { w, svg: `<svg width="${w}mm" height="${h}mm" viewBox="0 0 ${w} ${h}">${s}</svg>` }
}

// polices = { script } : famille à utiliser (déjà chargée)
export function genererNombres(config, polices) {
  const police = polices.script
  const { langues, langue: langueDoc } = normaliserLangues(config)
  // langue régionale éventuelle (la première trouvée dans les langues demandées)
  const reg = langues.map(langueRegionale).find(Boolean) ?? null
  const avecFr = langues.includes('fr') || !reg
  const bilingue = avecFr && !!reg
  const textesBr = langueDoc === 'br'
  function ecritures(n) {
    const { rectifiee } = config
    return {
      fr: avecFr ? enLettresFr(n, { rectifiee }) : null,
      br: reg ? reg.enLettres(n) : null,
    }
  }

  // Choisit le nombre de colonnes qui donne le plus grand texte lisible
  function disposer(entrees, wDispo, hDispo, avecRepr) {
    const ecartCol = 6
    // largeur nécessaire d'une ligne pour une police de 1 mm
    const largeurs = entrees.map(e => {
      if (e.titre) return largeurTexte(e.titre, police, true) * 1.15
      const { fr, br } = ecritures(e.n)
      const chiffres = largeurTexte(String(e.n), police, true) * 1.5
      const textes = Math.max(fr ? largeurTexte(fr, police) : 0, br ? largeurTexte(br, police) : 0)
      // colonne des chiffres : 2,6 em à 1,5× la taille du texte (cf. .chiffres)
      return Math.max(chiffres, 1.5 * 2.6) + textes + 4
    })
    const hauteurLigne = bilingue ? 2.6 : 1.6
    let meilleur = null
    for (let cols = 1; cols <= 4; cols++) {
      const parCol = Math.ceil(entrees.length / cols)
      const colW = (wDispo - (cols - 1) * ecartCol) / cols
      const reprW = avecRepr ? colW * 0.3 : 0
      const tailleH = hDispo / (parCol * hauteurLigne)
      const tailleW = Math.min(...largeurs.map(l => (colW - reprW) / l))
      const taille = Math.min(tailleH, tailleW, 14)
      if (!meilleur || taille > meilleur.taille + 0.05) meilleur = { cols, parCol, colW, reprW, taille }
    }
    return meilleur
  }

  function pageHtml(titre, entrees, w, h, avecRepr) {
    const marge = 10
    const titreH = titre ? (config.format === 'A3' ? 20 : 14) : 0
    const enTeteH = 8
    const wDispo = w - 2 * marge, hDispo = h - 2 * marge - titreH - enTeteH
    const d = disposer(entrees, wDispo, hDispo, avecRepr)
    const t = d.taille
    const colonnes = []
    for (let c = 0; c < d.cols; c++) colonnes.push(entrees.slice(c * d.parCol, (c + 1) * d.parCol))

    const hLigne = hDispo / d.parCol
    const ligne = e => {
      if (e.titre) return `<div class="sous-titre" style="height:${hLigne}mm;font-size:${t * 1.05}mm">${echapper(e.titre)}</div>`
      const { fr, br } = ecritures(e.n)
      const repr = avecRepr && e.repr ? representation(e.repr, e.n, hLigne * 0.72, d.reprW * 0.92) : null
      return `<div class="ligne" style="height:${hLigne}mm">
  <span class="chiffres" style="font-size:${t * 1.5}mm;width:${t * 1.5 * 2.6}mm">${e.n}</span>
  ${avecRepr ? `<span class="repr" style="width:${d.reprW}mm">${repr ?? ''}</span>` : ''}
  <span class="mots" style="font-size:${t}mm">${fr ? `<span class="fr">${echapper(fr)}</span>` : ''}${br ? `<span class="br">${echapper(br)}</span>` : ''}</span></div>`
    }
    const legende = bilingue
      ? `<span class="fr">■ ${textesBr ? 'galleg' : 'français'}</span> <span class="br">■ ${reg.nomLocal}</span>` : ''
    return `<div class="contenu" style="inset:${marge}mm">
  ${titre ? `<h1 style="height:${titreH}mm;font-size:${titreH * 0.6}mm">${echapper(titre)}</h1>` : ''}
  <div class="legende" style="height:${enTeteH}mm">${legende}</div>
  <div class="colonnes" style="gap:6mm">${colonnes.map(col => `<div class="col" style="width:${d.colW}mm">${col.map(ligne).join('')}</div>`).join('')}</div>
  </div>`
  }


    const perso = nombresPersonnalises(config)
    const { w, h } = dimensionsPage(config.format, config.orientation)
    const choisies = SECTIONS.filter(s => config.sections.includes(s.id)).map(s =>
      s.id === 'perso'
        ? { ...s, titre: `De ${perso[0]} à ${perso.at(-1)}`, br: `Eus ${perso[0]} da ${perso.at(-1)}`, nombres: perso }
        : s).map(s => (textesBr && s.br ? { ...s, titre: s.br } : s))
    const avecRepr = s => config.representation && !!s.repr
    let pages
    if (config.miseEnPage === 'affiches') {
      pages = choisies.map(s => pageHtml(s.titre, s.nombres.map(n => ({ n, repr: s.repr })), w, h, avecRepr(s)))
    } else {
      const entrees = choisies.flatMap(s => [{ titre: s.titre }, ...s.nombres.map(n => ({ n, repr: s.repr }))])
      pages = [pageHtml(textesBr ? 'An niveroù' : 'Les nombres', entrees, w, h, choisies.some(avecRepr))]
    }
    const html = documentImpression({
      titre: config.titre || (textesBr ? 'An niveroù e lizherennoù' : 'Les nombres en lettres'), format: config.format, orientation: config.orientation, pages,
      css: `body { font-family: '${police}', Arial, sans-serif; }
  .contenu { position: absolute; display: flex; flex-direction: column; }
  h1 { text-align: center; font-weight: 700; line-height: 1; flex: none; }
  .legende { text-align: center; font-size: 4mm; flex: none; }
  .colonnes { display: flex; justify-content: center; }
  .ligne { display: flex; align-items: center; gap: 2mm; border-bottom: 0.25mm solid #e1e4ea; }
  .chiffres { font-weight: 700; text-align: right; flex: none; color: #222; }
  .repr { flex: none; display: flex; align-items: center; justify-content: center; }
  .repr svg { display: block; }
  .mots { display: flex; flex-direction: column; line-height: 1.15; min-width: 0; }
  .fr { color: #1d4e9e; }
  .br { color: #111; font-style: italic; }
  .mots .fr + .br { font-size: .92em; }
  .sous-titre { display: flex; align-items: flex-end; font-weight: 700; color: #e07a1f; border-bottom: 0.4mm solid #e07a1f; }`,
    })
    return { html, nbPages: pages.length, format: config.format, orientation: config.orientation }
}

// Dictée — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche() : la liste des mots à
// apprendre (script, attaché, je recopie), puis la page de dictée (lignes numérotées) et son corrigé.
//   fiche({ questions, T, langue, police, cssPolices }) → document HTML complet (documentFiche, ligneNomDate,
//   section.corrige) ; T et langue : toujours le français (exercice de français) ; police : usePoliceFiche() dans l'app,
//   dont les @font-face de l'écriture script et de l'attachée (cssPolices)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { echapper as e } from '../../utils/html.js'
import { phraseDe } from './generateur.js'

// Mêmes polices que POLICE_SCRIPT et POLICE_ATTACHE de src/utils/impression.js (module qui lit le navigateur : pas ici)
const SCRIPT = 'Andika'
const ATTACHE = 'Playwrite FR Trad'

const css = phrases => `
      section + section:not(.corrige) { page-break-before: always; break-before: page; }
      h2 { font-size: .95rem; margin: 1rem 0 .2rem; background: #f0f3f7; padding: .25rem .6rem; border-radius: 6px; }
      .consigne { font-weight: 700; margin: .6rem 0 1rem; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      th { font-size: .75rem; color: #777; text-align: left; font-weight: 600; }
      td { padding: .35rem .3rem; vertical-align: bottom; page-break-inside: avoid; }
      .script { font-family: '${SCRIPT}', Arial, sans-serif; font-size: 1.35rem; }
      .attache { font-family: '${ATTACHE}', cursive; font-size: 1.15rem; }
      .recopie { border-bottom: 1.5px solid #999; }
      .lignes-mots { columns: 2; column-gap: 2.5rem; }
      .ligne { display: flex; align-items: flex-end; gap: .5rem; height: 2.6rem; break-inside: avoid; }
      .lignes-phrases .ligne { height: 3.6rem; }
      .num { font-weight: 700; color: #777; min-width: 1.8rem; }
      .trait { flex: 1; border-bottom: 1.5px solid #999; }
      section.corrige h2 { background: none; padding: 0; }
      .a-dicter { columns: ${phrases ? 1 : 3}; font-size: 1.05rem; line-height: 1.9; font-family: '${SCRIPT}', Arial, sans-serif; }`

// Nom d'une catégorie : clé du catalogue dérivée du nom français (« Corps humain » → cat_corps_humain), le nom français
// s'affiche si la clé manque
const cleCat = cat => 'cat_' + cat.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
export const nomCat = (T, cat) => { const k = cleCat(cat), v = T(k); return v === k ? cat : v }

export function fiche({ questions: x, T, langue, police, cssPolices }) {
  const { niveau, mots, parCat, phrases } = x
  // CM1 et CM2 ont le même corpus : « CM » (fiche publiée exercices-dictee-cm1-cm2)
  const titre = `${T('titre')} — ${niveau.startsWith('cm') ? 'CM' : niveau.toUpperCase()}`
  const entete = `<h1>${e(titre)}</h1>
    ${ligneNomDate(langue)}`

  // Page 1 : mots à apprendre, regroupés par catégorie
  const vus = new Set()
  const liste = parCat.map(g => {
    const ms = g.mots.filter(m => !vus.has(m) && vus.add(m))
    if (!ms.length) return ''
    return `<h2>${e(nomCat(T, g.cat))}</h2>
      <table><tbody>${ms.map(m => `<tr><td class="script">${e(m)}</td><td class="attache">${e(m)}</td><td class="recopie"></td></tr>`).join('')}</tbody></table>`
  }).join('')
  const pageListe = `<section>${entete}
    <p class="consigne">${T('fConsigneListe')}</p>
    <table class="cols"><thead><tr><th>${T('fScript')}</th><th>${T('fAttache')}</th><th>${T('fRecopie')}</th></tr></thead></table>
    ${liste}</section>`

  // Page 2 : lignes numérotées, l'adulte dicte
  const lignes = mots.map((_, i) => `<div class="ligne"><span class="num">${i + 1}.</span><span class="trait"></span></div>`).join('')
  const pageDictee = `<section>${entete}
    <p class="consigne">${T(phrases ? 'fConsignePhrases' : 'fConsigneMots')}</p>
    <div class="${phrases ? 'lignes-phrases' : 'lignes-mots'}">${lignes}</div></section>`

  // Corrigé : ce que l'adulte dicte
  const corrige = `<section class="corrige"><h2>${T('corrige')} — ${e(titre)}</h2>
    <p class="consigne">${T('fADicter')}</p>
    <ol class="a-dicter">${mots.map(m => `<li>${phrases ? e(phraseDe(m)).replace(e(m), `<b>${e(m)}</b>`) : `<b>${e(m)}</b>`}</li>`).join('')}</ol></section>`

  const pages = [x.liste && pageListe, x.dictee && pageDictee, x.dictee && corrige].filter(Boolean)
  return documentFiche({ titre, langue, police, cssPolices, css: css(phrases), h1: null, largeur: '700px', corps: pages.join('\n') })
}

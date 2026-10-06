// La planche à découper de l'affiche « Pièces et billets » : la DISPOSITION (src/affiches/monnaie/planche.ts, pure), vérifiée en node
// pour chaque variante, chaque taille (100, 75, 50 %), chaque format (A4, A3) et chaque sens. Pour un massicot : des bandes de
// hauteur unique, des cases de largeur unique dans une bande, les pièces en grille régulière (mêmes x pour une colonne), rien
// qui se chevauche, tout dans la zone, les traits de coupe jamais sur une pièce ni sur un billet. La taille réelle dans Chrome :
// tests/affiches-monnaie.test.mjs.
import { ECHELLES, ECART, H_CONSIGNE, LOTS, MARQUE, disposerPlanche } from '../src/affiches/monnaie/planche.ts'
import { mesuresAffiche } from '../src/impression/affiches/cadre.ts'
import { tailleReelle } from '../src/dessins/argent.ts'
import { verifier, nbEchecs } from './outils.mjs'

const EPS = 0.01
const egal = (a, b) => Math.abs(a - b) < EPS
// deux rectangles se chevauchent (intérieurs communs)
const chevauche = (a, b) => a.x < b.x + b.w - EPS && b.x < a.x + a.w - EPS && a.y < b.y + b.h - EPS && b.y < a.y + a.h - EPS

let nbCas = 0
const problemes = []
const note = (cas, msg) => problemes.push(`${cas} : ${msg}`)

for (const centimes of [false, true]) {
  for (const echelle of ECHELLES) {
    for (const format of ['A4', 'A3']) {
      for (const orientation of ['landscape', 'portrait']) {
        const cas = `${centimes ? 'centimes' : 'euros'} ${echelle} % ${format} ${orientation}`
        nbCas++
        const m = mesuresAffiche({ format, orientation })
        const W = m.W
        const H = m.H - H_CONSIGNE
        const pages = disposerPlanche({ centimes, echelle, W, H })
        if (!pages.length) { note(cas, 'aucune page'); continue }
        const k = echelle / 100
        const lot = LOTS[centimes ? 'centimes' : 'euros']
        // tout y est : une bande par valeur (pièces puis billets), dans l'ordre
        const valeurs = pages.flatMap(p => p.bandes.map(b => b.v))
        if (valeurs.join() !== [...lot.pieces, ...lot.billets].join()) note(cas, `bandes ${valeurs} ≠ valeurs du lot`)
        for (const [i, page] of pages.entries()) {
          const dans = (b, x0, y0, x1, y1) => b.x >= x0 - EPS && b.y >= y0 - EPS && b.x + b.w <= x1 + EPS && b.y + b.h <= y1 + EPS
          // les bandes se touchent (coupe bord à bord) et chacune a une hauteur unique
          page.bandes.forEach((b, j) => {
            if (j > 0 && !egal(b.y, page.bandes[j - 1].y + page.bandes[j - 1].h)) note(cas, `page ${i + 1} : les bandes ${j - 1} et ${j} ne se touchent pas`)
            const poses = page.poses.filter(p => p.bande === j)
            if (poses.length !== b.n) note(cas, `page ${i + 1} bande ${j} : ${poses.length} cases au lieu de ${b.n}`)
            if (poses.some(p => !egal(p.case.y, b.y) || !egal(p.case.h, b.h))) note(cas, `page ${i + 1} bande ${j} : y ou hauteur de case différents dans la bande`)
            poses.forEach((p, c) => {
              if (p.colonne !== c || !egal(p.case.x, b.x0 + c * b.largeurCase) || !egal(p.case.w, b.largeurCase)) note(cas, `page ${i + 1} bande ${j} : case ${c} hors du pas régulier`)
              // l'argent est à sa taille (réelle × échelle) et centré dans sa case, marge d'au moins ECART / 2
              const r = tailleReelle(p.v)
              if (!egal(p.boite.w, r.w * k) || !egal(p.boite.h, r.h * k)) note(cas, `${p.v} : ${p.boite.w} × ${p.boite.h} mm au lieu de ${(r.w * k).toFixed(2)} × ${(r.h * k).toFixed(2)}`)
              if (!egal(p.boite.x - p.case.x, p.case.x + p.case.w - p.boite.x - p.boite.w) || !egal(p.boite.y - p.case.y, p.case.y + p.case.h - p.boite.y - p.boite.h)) note(cas, `${p.v} : pas centré dans sa case`)
              if (p.boite.x - p.case.x < ECART / 2 - EPS || p.boite.y - p.case.y < ECART / 2 - EPS) note(cas, `${p.v} : marge inférieure à ${ECART / 2} mm`)
              if (p.genre === 'piece' && !egal(p.case.w, p.case.h)) note(cas, `pièce ${p.v} : case non carrée`)
            })
            // la bande est remplie : il ne reste pas la place d'une case de plus (pas d'espace perdu)
            if ((W - 2 * MARQUE) - b.n * b.largeurCase >= b.largeurCase - EPS) note(cas, `page ${i + 1} bande ${j} : la place d'une case de plus`)
            // bande centrée dans la largeur utile
            if (!egal(b.x0 - MARQUE, W - MARQUE - b.x1)) note(cas, `page ${i + 1} bande ${j} : pas centrée`)
          })
          // les pièces : une grille régulière (mêmes cases, mêmes x pour une même colonne sur toute la page)
          const pieces = page.poses.filter(p => p.genre === 'piece')
          for (const p of pieces) {
            const meme = pieces.find(q => q.colonne === p.colonne)
            if (!egal(p.case.x, meme.case.x) || !egal(p.case.w, meme.case.w) || !egal(p.case.h, meme.case.h)) note(cas, `pièces : colonne ${p.colonne} non alignée`)
          }
          // tout dans la zone et dans la bordure libre ; ni cases ni argent ne se chevauchent
          for (const p of page.poses) {
            if (!dans(p.case, MARQUE, MARQUE, W - MARQUE, H - MARQUE)) note(cas, `page ${i + 1} : case ${p.v} hors de la zone utile`)
          }
          for (let a = 0; a < page.poses.length; a++) for (let b = a + 1; b < page.poses.length; b++) {
            if (chevauche(page.poses[a].case, page.poses[b].case)) note(cas, `page ${i + 1} : cases ${a} et ${b} se chevauchent`)
            if (chevauche(page.poses[a].boite, page.poses[b].boite)) note(cas, `page ${i + 1} : argent ${a} et ${b} se chevauche`)
          }
          // les traits de coupe : horizontaux au bord des bandes, verticaux au bord des cases ; jamais sur un billet ni une pièce
          for (const b of page.bandes) {
            for (const y of [b.y, b.y + b.h]) {
              const sur = page.poses.find(p => p.boite.y < y - EPS && y + EPS < p.boite.y + p.boite.h)
              if (sur) note(cas, `page ${i + 1} : un trait horizontal (y = ${y}) traverse ${sur.v}`)
            }
            for (let c = 0; c <= b.n; c++) {
              const x = b.x0 + c * b.largeurCase
              const sur = page.poses.find(p => p.bande === page.bandes.indexOf(b) && p.boite.x < x - EPS && x + EPS < p.boite.x + p.boite.w)
              if (sur) note(cas, `page ${i + 1} : un trait vertical (x = ${x}) traverse ${sur.v}`)
            }
          }
        }
      }
    }
  }
}
const manquants = [...new Set(problemes)]
verifier(!manquants.length, `${nbCas} dispositions (variante × taille × format × sens) alignées pour un massicot${manquants.length ? ` — ${manquants.slice(0, 3).join(' ; ')}${manquants.length > 3 ? ` (+${manquants.length - 3})` : ''}` : ''}`)

// plus la taille est petite, plus il y a de pièces et de billets par page (et jamais plus de pages)
for (const centimes of [false, true]) {
  const m = mesuresAffiche({ format: 'A4', orientation: 'landscape' })
  const decompte = echelle => { const p = disposerPlanche({ centimes, echelle, W: m.W, H: m.H - H_CONSIGNE }); return { pages: p.length, articles: p.reduce((t, x) => t + x.poses.length, 0) } }
  const [a, b, c] = ECHELLES.map(decompte)
  verifier(a.articles < b.articles && b.articles < c.articles && a.pages >= b.pages && b.pages >= c.pages,
    `${centimes ? 'euros et centimes' : 'euros'} (A4 paysage) : ${a.articles} → ${b.articles} → ${c.articles} pièces et billets, ${a.pages} → ${b.pages} → ${c.pages} pages (100, 75, 50 %)`)
}
process.exit(nbEchecs() ? 1 : 0)

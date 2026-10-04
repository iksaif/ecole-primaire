// Couverture du programme : pour chaque domaine de src/data/programme.js, chaque compétence et chaque classe où elle
// est travaillée, ce qui la couvre sur le site — exercice de l'app, fiche toute prête (générateur ou fiche par
// compétence), affiche. Écrit couverture.html (non versionné) et un résumé par domaine dans le terminal.
//   node scripts/couverture.mjs        (npm run couverture)
// Les ressources et leurs compétences : src/impression/couverture.js (partagé avec la page « Le programme »).
import { createServer } from 'vite'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
// calcul.js importe des modules sans extension : on passe par Vite (rendu côté serveur, sans navigateur)
const vite = await createServer({ root: racine, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
const charger = chemin => vite.ssrLoadModule(chemin)
const { COMPETENCES, DOMAINES, NIVEAUX } = await charger('/src/data/programme.js')
const { ACTIVITES } = await charger('/src/data/activites.js')
const { EXERCICES, classesDe, fichesDe } = await charger('/src/impression/exercices.js')
const { ressourcesDe, competencesActivite } = await charger('/src/impression/couverture.js')
await vite.close()

// une case = (compétence, classe où elle est travaillée) ; ce qui la couvre, par sorte
const SORTES = { exercice: '🎯', fiche: '📄', affiche: '📘' }
const couverture = (k, n) => ressourcesDe(k.id, n)

const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const lignesTerminal = []
const sections = DOMAINES.map(d => {
  const comps = COMPETENCES.filter(k => k.domaine === d.id)
  if (!comps.length) return ''
  let cases = 0, avecExercice = 0, avecRien = 0
  const lignes = comps.map(k => {
    const cellules = NIVEAUX.map(n => {
      if (!k.niveaux.includes(n)) return '<td class="hors"></td>'
      cases++
      const par = couverture(k, n)
      const sortes = Object.keys(SORTES).filter(s => par[s].length)
      if (par.exercice.length) avecExercice++
      if (!sortes.length) { avecRien++; return '<td class="rien" title="rien">—</td>' }
      const titre = sortes.map(s => `${SORTES[s]} ${par[s].map(r => r.titre).join(', ')}`).join('\n')
      return `<td class="${sortes.length >= 2 ? 'bien' : 'peu'}" title="${echapper(titre)}">${sortes.map(s => SORTES[s]).join('')}</td>`
    }).join('')
    return `<tr><th title="${echapper(k.id)}">${echapper(k.libelle)}</th>${cellules}</tr>`
  }).join('\n')
  const pct = x => (cases ? Math.round(100 * x / cases) : 0)
  lignesTerminal.push(`${d.court.padEnd(28)} ${String(cases).padStart(3)} cases · exercice ${String(pct(avecExercice)).padStart(3)} % · rien ${String(pct(avecRien)).padStart(3)} %`)
  return `<section><h2>${echapper(d.court)} <small>${cases} cases · ${pct(avecExercice)} % avec un exercice · ${avecRien} sans rien</small></h2>
<table><tr><th></th>${NIVEAUX.map(n => `<th>${n.toUpperCase()}</th>`).join('')}</tr>
${lignes}</table></section>`
}).join('\n')

// Par exercice : à chaque classe, les options (fiches par compétence, exercices.js) et leur compétence — ✓ au
// programme de la classe, ⚠ pas au programme de cette classe — puis les compétences de l'exercice (activites.js) au
// programme de la classe sans option dédiée (—). Le contenu des fiches est vérifié par tests/programme-*.test.mjs.
const parExercice = EXERCICES.filter(ex => ex.fiches?.length).map(ex => {
  const activite = ACTIVITES.find(a => a.to === ex.route)
  const lignes = ex.classes.flatMap(c => {
    const fiches = fichesDe(ex, c.classe)
    if (!fiches.length) return []
    return classesDe(c.classe).map(n => {
      const options = fiches.map(f => {
        const k = COMPETENCES.find(x => x.id === f.competence)
        const ok = k?.niveaux.includes(n)
        return `<span class="${ok ? 'ok' : 'alerte'}">${ok ? '✓' : '⚠'} ${echapper(f.titre)} <small>(${echapper(k?.libelle ?? f.competence)})</small></span>`
      })
      const sansOption = (activite ? competencesActivite(activite, n) : []).map(id => COMPETENCES.find(x => x.id === id))
        .filter(k => k?.niveaux.includes(n) && !fiches.some(f => f.competence === k.id))
        .map(k => `<span class="non">— ${echapper(k.libelle)}</span>`)
      const alerte = options.some(o => o.includes('class="alerte"'))
      return `<tr><th>${n.toUpperCase()}</th><td class="${alerte ? 'rien' : sansOption.length ? 'peu' : 'bien'}">${fiches.length} option${fiches.length > 1 ? 's' : ''}</td>
<td class="liste">${options.join('')}${sansOption.join('')}</td></tr>`
    })
  }).join('')
  return `<details><summary>${echapper(ex.titre.fr)} <small>${ex.classes.map(c => c.classe.toUpperCase()).join(', ')}</small></summary>
<table class="exercice">${lignes}</table></details>`
}).join('\n')

writeFileSync(join(racine, 'couverture.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8">
<title>Couverture du programme</title>
<style>
  body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; background: #f8f9fa; }
  h1 { margin: 0 0 .25rem; } .legende { color: #555; margin-bottom: 1.5rem; }
  section { background: white; border-radius: 10px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  h2 { font-size: 1.15rem; margin: 0 0 .75rem; } h2 small { font-weight: 400; color: #777; font-size: .85rem; margin-left: .5rem; }
  table { border-collapse: collapse; width: 100%; font-size: .85rem; }
  th, td { border: 1px solid #e3e6ea; padding: .3rem .4rem; }
  tr > th:first-child { text-align: left; font-weight: 500; width: 45%; }
  td { text-align: center; white-space: nowrap; cursor: default; }
  td.hors { background: #f3f4f6; } td.rien { background: #fde2e1; color: #b42318; font-weight: 700; }
  td.peu { background: #fff4d6; } td.bien { background: #ddf3e4; }
  details { background: white; border-radius: 10px; padding: .6rem 1rem; margin-bottom: .5rem; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  summary { cursor: pointer; font-weight: 700; } summary small { font-weight: 400; color: #777; margin-left: .5rem; }
  table.exercice { margin-top: .6rem; } table.exercice th { width: 4rem; text-align: center; } table.exercice td:nth-child(2) { width: 5rem; }
  td.liste { text-align: left; white-space: normal; } td.liste span { display: block; } td.liste small { color: #888; } .ok { color: #1a7f37; } .non { color: #999; } .alerte { color: #b42318; font-weight: 700; }
</style></head><body>
<h1>Couverture du programme</h1>
<p class="legende">Par domaine, chaque compétence de <code>src/data/programme.js</code> aux classes où elle est travaillée :
🎯 exercice dans l'app · 📄 fiche toute prête (ou générateur de fiches) · 📘 affiche. Vert : au moins deux sortes ;
jaune : une seule ; rouge : rien ; gris : pas au programme de cette classe. Survoler une case pour voir les ressources.
Généré le ${new Date().toLocaleDateString('fr-FR')} par <code>npm run couverture</code>.</p>
<h2 style="margin:2rem 0 .75rem">Par domaine</h2>
${sections}
<h2 style="margin:2rem 0 .5rem">Par exercice</h2>
<p class="legende">À chaque classe, les options de l'exercice (une fiche toute prête par compétence) : ✓ compétence au
programme de cette classe, ⚠ compétence qui n'est pas au programme de cette classe ; — compétence de l'exercice au
programme de la classe sans option dédiée. Le contenu des fiches (nombres, heure, unités, temps…) est vérifié par
<code>tests/programme-maths.test.mjs</code> et <code>tests/programme-francais.test.mjs</code>.</p>
${parExercice}
</body></html>`)

console.log(lignesTerminal.join('\n'))
console.log('\n→ couverture.html')

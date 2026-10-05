// Lire l'heure — fiche imprimable (pure : lisible par node). Met en page le tirage de questionsFiche().
//   fiche({ questions, reglages, T, langue }) → document HTML complet (documentFiche, ligneNomDate, section.corrige)
import { documentFiche, ligneNomDate } from '../../impression/document.js'
import { svgHorloge } from './horloge.js'
import { ecrit, ecritDuree, hm } from './generateur.js'

const CSS = `
      h2 { font-size: 1.05rem; margin: 1rem 0 .3rem; }
      .consigne { font-size: .9rem; margin: .2rem 0 .4rem; }
      .grille { display: grid; grid-template-columns: repeat(4, 1fr); gap: .3cm .2cm; }
      .cell { text-align: center; page-break-inside: avoid; position: relative; }
      .num { position: absolute; left: 0; top: 0; font-weight: 700; color: #777; }
      .rep { margin-top: .15cm; font-size: .95rem; font-weight: 700; }
      .rep.cible { font-size: .9rem; min-height: 2.4em; }
      .ligne { margin: .5cm 0; font-size: 1rem; }
      .deux-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1cm; }
      table.emploi { border-collapse: collapse; margin: .3cm 0; }
      table.emploi td, table.emploi th { border: 1px solid #555; padding: .15cm .4cm; text-align: left; }`

export function fiche({ questions: x, reglages, T, langue }) {
  const opt = { aideMinutes: reglages.aideMinutes, taille: '3.8cm', impression: true, libelle: T('horloge') }
  const cellLire = x.aLire.map((t, i) => `<div class="cell">
      <div class="num">${i + 1}.</div>${svgHorloge(t.h, t.m, opt)}
      <div class="rep">______ h ______</div></div>`).join('')
  const cellDessin = x.aDessiner.map((t, i) => `<div class="cell">
      <div class="num">${i + 1}.</div>${svgHorloge(0, 0, { ...opt, aiguilles: false })}
      <div class="rep cible">${t.oral ?? ecrit(t.h, t.m)}</div></div>`).join('')

  let extra = ''
  const corrige = x.avecLire
    ? [`<p><b>${T('corrigeLire')} :</b> ${x.aLire.map((t, i) => `${i + 1}. ${ecrit(t.h, t.m)}`).join(' — ')}</p>`]
    : []
  if (x.journee) {
    extra += `<h2>${T('ficheJourneeTitre')}</h2><p class="consigne">${T('ficheJourneeConsigne')}</p>
      ${x.journee.map((l, i) => `<div class="ligne">${i + 1}. ${ecrit(l.h, l.m)} ${T('moments')[l.moment].suffixe} &nbsp;→&nbsp; ________ h ________</div>`).join('')}`
    corrige.push(`<p><b>${T('corrigeJournee')} :</b> ${x.journee.map((l, i) => `${i + 1}. ${ecrit(l.h24, l.m)}`).join(' — ')}</p>`)
  }
  if (x.durees) {
    extra += `<h2>${T('ficheDureesTitre')}</h2>
      ${x.durees.map((d, i) => `<div class="ligne">${i + 1}. ${d.sous === 'apres'
        ? T('ficheDureeApres', { debut: d.ecritDebut, duree: d.ecritDuree })
        : T('ficheDureeCombien', { act: d.act, debut: d.ecritDebut, fin: d.ecritFin })}</div>`).join('')}`
    corrige.push(`<p><b>${T('corrigeDurees')} :</b> ${x.durees.map((d, i) => `${i + 1}. ${d.attendu}`).join(' — ')}</p>`)
  }
  if (x.conversions) {
    extra += `<h2>${T('ficheConversionTitre')}</h2><p class="consigne">${T('rappel')} : 1 h = 60 min</p>
      <div class="deux-col">${x.conversions.map((c, i) => `<div class="ligne">${i + 1}. ${c.texte.replace(/\?/g, '______')}</div>`).join('')}</div>`
    corrige.push(`<p><b>${T('corrigeConversions')} :</b> ${x.conversions.map((c, i) => `${i + 1}. ${c.attendu}`).join(' — ')}</p>`)
  }
  if (x.emploi) {
    const { lignes, debut: a, duree: b, quoi: c } = x.emploi
    extra += `<h2>${T('ficheEmploiTitre')}</h2>
      <table class="emploi"><tr><th>${T('debut')}</th><th>${T('fin')}</th><th>${T('activite')}</th></tr>
      ${lignes.map(l => `<tr><td>${hm(l.debut)}</td><td>${hm(l.fin)}</td><td>${l.nom}</td></tr>`).join('')}</table>
      <div class="ligne">1. ${T('emploiDebutQ', { nom: a.nom })} ________________</div>
      <div class="ligne">2. ${T('emploiDureeQ', { nom: b.nom })} ________________</div>
      <div class="ligne">3. ${T('emploiQuoiQ', { ecrit: hm(c.debut + 10) })} ________________</div>`
    corrige.push(`<p><b>${T('ficheEmploiTitre')} :</b> 1. ${hm(a.debut)} — 2. ${ecritDuree(b.fin - b.debut)} — 3. ${c.nom}</p>`)
  }

  const titre = `${T('titre')} — ${x.niveau.toUpperCase()}`
  return documentFiche({
    titre, langue, h1: `🕐 ${titre}`, css: CSS, largeur: '18cm', marge: '1cm',
    corps: `${ligneNomDate(langue)}
    ${x.avecLire ? `<h2>${T('quelleHeure')}</h2>
    <p class="consigne">${T('ficheLireConsigne')}</p>
    <div class="grille">${cellLire}</div>` : ''}
    ${x.avecPlacer ? `<h2>${T('ficheDessineTitre')}</h2>
    <p class="consigne">${T('ficheDessineConsigne')}</p>
    <div class="grille">${cellDessin}</div>` : ''}
    ${extra}
    <section class="corrige"><h2>${T('ficheCorrige')}</h2>${corrige.join('')}</section>`,
  })
}

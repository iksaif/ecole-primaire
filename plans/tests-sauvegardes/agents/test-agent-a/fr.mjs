import { charger } from './extract.mjs'
const M = await charger('FractionsView.vue', ['NIVEAUX','TYPES','GENERATEURS','genererSansRepetition','enLettres','formeEnSvg','MODES'])
const niv = M.NIVEAUX.ce1
let err = 0
const fail = (m, q) => { err++; if (err < 20) console.log('ERR', m, JSON.stringify(q).slice(0, 400)) }
const eq = (a, b) => a.n * b.d === b.n * a.d
for (const nivId of ['ce1', 'ce2']) for (const mode of ['unitaires', 'toutes']) for (const t of M.NIVEAUX[nivId].types) for (let i = 0; i < 3000; i++) {
  const niv = M.NIVEAUX[nivId]
  const q = M.GENERATEURS[t](niv, mode)
  if (q.forme && t !== 'egales') {
    if (q.forme.parts.length !== q.reponse.d) fail('parts', q)
    if (q.forme.parts.some(p => /NaN|undefined/.test(p))) fail('path', q)
  }
  if (['droite', 'placer'].includes(t)) {
    const f = q.reponse, dr = q.droite
    if (f.d !== dr.d || f.n % f.d === 0 || f.n < 1 || f.n >= dr.unites * dr.d || dr.ticks.length !== dr.unites * dr.d + 1) fail('droite', q)
  } else if (t === 'unite') {
    const f = q.fracAffichee; const r = f.n < f.d ? '<' : f.n > f.d ? '>' : '='
    if (r !== q.reponse) fail('unite', q)
  } else if (t === 'egales') {
    if (q.kind === 'nombre') { if (q.reponse * q.egalite.gauche.d !== q.egalite.gauche.n * q.egalite.droite.d) fail('egn', q) }
    else if (!eq(q.reponse, q.fracConsigne) || q.reponse.d === q.fracConsigne.d) fail('egc', q)
  } else if (q.reponse.n !== undefined) {
    const f = q.reponse
    if (!(f.n >= 1 && f.n < f.d && niv.denominateurs.includes(f.d))) fail('frac', q)
    if (mode === 'unitaires' && f.n !== 1) fail('unit', q)
  }
  if (t === 'identifier') {
    if (new Set(q.colorees).size !== q.reponse.n || q.colorees.some(c => c < 0 || c >= q.reponse.d)) fail('col', q)
  }
  if (q.kind === 'choix') {
    if (q.choix.length !== (q.choixEn === 'signe' ? 3 : 4)) fail('nbchoix', q)
    const bons = q.choixEn === 'signe' ? q.choix.filter(c => c === q.reponse) : q.choix.filter(c => eq(c, q.reponse))
    if (bons.length !== 1) fail('equiv/dup', q)
    if (q.choixEn !== 'signe' && new Set(q.choix.map(c => c.n + '/' + c.d)).size !== 4) fail('dup', q)
    if ((q.choixEn === 'lettres' || t === 'droite') && q.choix.some(c => !niv.denominateurs.includes(c.d))) fail('denom lettres', q)
    if (q.choixEn === 'lettres' && new Set(q.choix.map(M.enLettres)).size !== 4) fail('lettres dup', q)
  }
  if (t === 'partDe') {
    if (q.reponse * q.d !== q.total || q.reponse < 2 || /partager/.test(q.consigne)) fail('partDe', q)
  }
}
for (const niveau of ['ce1','ce2']) for (const nb of [5, 20]) for (const types of [M.TYPES.map(t => t.id), ['colorier'], ['partDe'], ['placer'], ['unite']]) for (const mode of ['unitaires','toutes']) {
  const s = M.genererSansRepetition({ niveau, mode, types }, nb)
  if (niveau === 'ce1' && s.some(q => !M.NIVEAUX.ce1.types.includes(q.type))) console.log('type ce2 en ce1')
  if (s.length !== nb) console.log('serie courte', niveau, types, mode, nb, s.length)
}
console.log('erreurs', err)
for (const f of [{n:1,d:2},{n:2,d:3},{n:3,d:4},{n:1,d:5},{n:5,d:6},{n:3,d:8},{n:7,d:10}]) console.log(f.n + '/' + f.d, M.enLettres(f))
for (let i = 0; i < 6; i++) { const q = M.GENERATEURS.identifier(niv, 'toutes'); console.log(q.libelle, '| choix', q.choix.map(c => c.n + '/' + c.d).join(' ')) }
for (let i = 0; i < 4; i++) { const q = M.GENERATEURS.partDe(niv); console.log(q.texte, '=>', q.attendu) }

for (const t of ['unite','egales','droite','placer']) for (let i = 0; i < 3; i++) { const q = M.GENERATEURS[t](M.NIVEAUX.ce2, 'toutes'); console.log(t, '|', q.consigne, '|', q.libelle, '|', (q.choix||[]).map(c => typeof c === 'string' ? c : c.n + '/' + c.d).join(' '), '=>', q.attendu) }
for (let i = 0; i < 4; i++) { const q = M.GENERATEURS.partDe(M.NIVEAUX.ce2); console.log(q.consigne, q.texte, '=>', q.attendu) }

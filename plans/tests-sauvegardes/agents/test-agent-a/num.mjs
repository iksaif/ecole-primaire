import { charger } from './extract.mjs'
const M = await charger('NumerationView.vue', ['NIVEAUX','TYPES','GENERATEURS','genererSansRepetition','svgBase10','fmt'])
const { enLettresFr } = await import('/Users/corentin.chary/dev/ecole-primaire/src/utils/nombres.js')
let err = 0
const S = v => String(v).replace(/\u202f/g, '')
const S2 = v => String(v).replace(/(\d)\u202f(\d)/g, '$1$2')
const fail = (m, q) => { err++; if (err < 30) console.log('ERR', m, JSON.stringify(q).slice(0, 300)) }
for (const [nivId, plage] of [['ce1',100],['ce1',1000],['ce2',1000],['ce2',10000]]) for (const type of M.TYPES.map(t => t.id)) {
  const NIV = M.NIVEAUX[nivId]
  for (let it = 0; it < 3000; it++) {
    const q = M.GENERATEURS[type](NIV, plage)
    if (!q.cle || !q.libelle || q.attendu === undefined) fail('champs', q)
    switch (type) {
      case 'decomposer':
        if (q.kind === 'cdu') { const n = +S(q.texte); const r = q.reponse; if (((r.milliers||0)*1000 + (r.centaines||0)*100 + r.dizaines*10 + r.unites) !== n || n > plage || n < 1 || String(n).length !== q.champs.length) fail('dec', q)
          if (/\b[01] \w+s\b/.test(q.attendu) || /\b[2-9] (millier|centaine|dizaine|unité)\b(?!s)/.test(q.attendu)) fail('pluriel attendu', q) }
        else { const n = q.texte.split(' + ').reduce((s, t) => { const [v, w] = t.split(' '); return s + v * (w.startsWith('millier') ? 1000 : w.startsWith('centaine') ? 100 : w.startsWith('dizaine') ? 10 : 1) }, 0); if (n !== q.reponse) fail('rec', q)
          if (/\b1 \w+s\b/.test(q.texte) || /\b[2-9] (centaine|dizaine|unité)\b(?!s)/.test(q.texte)) fail('pluriel', q) }
        break
      case 'representation': {
        const m = q.cle.match(/rep(\d+)-(\d+)-(\d+)-(\d+)/); if (+m[1]*1000 + +m[2]*100 + +m[3]*10 + +m[4] !== q.reponse || q.reponse > plage) fail('rep', q); break }
      case 'lettresChiffres': if (enLettresFr(q.reponse) !== q.texte || q.reponse > plage) fail('lc', q); break
      case 'chiffresLettres':
        if (q.choix.length !== 4 || new Set(q.choix).size !== 4 || !q.choix.includes(q.reponse) || enLettresFr(+S(q.texte)) !== q.reponse) fail('cl', q); break
      case 'comparer': {
        const [x, y] = q.libelle.split(' … ').map(v => +S(v))
        const r = x < y ? '<' : x > y ? '>' : '='
        if (r !== q.reponse || x < 1 || y < 1 || x > plage || y > plage || isNaN(x+y)) fail('cmp', q); break }
      case 'suites': {
        if (q.termes) {
          const p = q.termes[1] - q.termes[0]
          if (!q.termes.every((t, i) => i === 0 || t - q.termes[i-1] === p) || q.termes.some(t => t < 0 || t > plage) || q.termes[q.trou] !== q.reponse) fail('suite', q)
        } else if (q.texte.endsWith('= ?')) {
          const [a, op, b] = S2(q.texte).split(' '); const r = op === '+' ? +a + +b : a - b
          if (r !== q.reponse || r < 0 || r > plage || +a < 1) fail('pm', q)
        } else { const n = +S(q.texte.split(' ').pop()); if (q.reponse !== (q.texte.includes('après') ? n + 1 : n - 1) || q.reponse > plage || q.reponse < 0) fail('sv', q) }
        break }
      case 'droite': if (q.debut + q.k * q.pas !== q.reponse || q.debut + 10 * q.pas > plage || q.k < 1 || q.k > 9) fail('dr', q); break
      case 'ranger': if (q.nombres.length !== 5 || new Set(q.nombres).size !== 5 || q.nombres.some(n => n > plage || n < 1) || q.reponse.join() !== [...q.nombres].sort((a,b)=>a-b).join()) fail('rg', q); break
    }
  }
}
// séries
for (const [nivId, plage] of [['ce1',100],['ce1',1000],['ce2',1000],['ce2',10000]]) for (const nb of [5, 10, 20]) {
  for (const types of [M.TYPES.map(t => t.id), ['droite'], ['comparer', 'ranger']]) {
    const s = M.genererSansRepetition({ niveau: nivId, plage, types }, nb)
    if (s.length !== nb && !(types.length === 1 && types[0] === 'droite')) fail('serie ' + plage + types + s.length, {})
    if (new Set(s.map(q => q.cle)).size !== s.length) fail('doublon', {})
    if (types[0] === 'droite') console.log('droites seules', plage, nb, '->', s.length)
  }
}
console.log('erreurs:', err)
// échantillons
for (const t of M.TYPES.map(t => t.id)) for (let i = 0; i < 3; i++) { const q = M.GENERATEURS[t](M.NIVEAUX.ce2, 10000); console.log(t, '|', q.consigne, '|', q.texte, '|', q.choix ? q.choix.join(' / ') : '', '=>', q.attendu) }
for (let i = 0; i < 4; i++) { const q = M.GENERATEURS.suites(M.NIVEAUX.ce1, 100); console.log('suites100 |', q.texte, '=>', q.attendu) }

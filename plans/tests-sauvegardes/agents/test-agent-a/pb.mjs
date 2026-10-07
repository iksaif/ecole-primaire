import { charger } from './extract.mjs'
const M = await charger('ProblemesView.vue', ['NIVEAUX','CATEGORIES','MODELES','genererSansRepetition','genererProbleme'])
let err = 0
const fail = (m, p) => { err++; if (err < 30) console.log('ERR', m, JSON.stringify(p)) }
const evalCalc = c => {
  // vérifie chaque égalité "a op b ... = r" du calcul
  for (const part of c.split(/ ; |, donc /)) {
    const m = part.match(/^([\d +−×]+) = (\d+)$/); if (!m) continue
    const expr = m[1].replace(/−/g, '-').replace(/×/g, '*')
    if (eval(expr) !== +m[2]) return false
  }
  return true
}
for (const [niveau, plage] of [['ce1','petits'],['ce1','moyens'],['ce1','grands'],['ce2','moyens'],['ce2','grands']]) {
  const maxP = M.NIVEAUX[niveau].plages[plage].max
  for (const cat of M.NIVEAUX[niveau].categories) for (let i = 0; i < 4000; i++) {
    const p = M.genererProbleme({ niveau, plage }, cat)
    if (!p) { fail('null', { cat, plage }); continue }
    const nums = (p.enonce + ' ' + p.question).match(/\d+/g).map(Number)
    if (!Number.isInteger(p.reponse) || p.reponse < 1) fail('rep', p)
    if (nums.some(n => n < 1 || n > maxP) || p.reponse > maxP) fail('borne', p)
    if (!evalCalc(p.calcul)) fail('calc', p)
    // la réponse doit apparaître dans le calcul
    if (!p.calcul.match(new RegExp('\\b' + p.reponse + '\\b'))) fail('rep absente calcul', p)
    // grammaire : pas de "de " devant voyelle, pas de "1 xxxs", pas de "N passager " singulier
    const txt = p.enonce + ' ' + p.question
    if (/\b(de|que) [aeiouyéèœh]/i.test(txt)) fail('elision', p)
    if (/vélo coûte \d /.test(txt) || /stylo à ([6-9]|\d\d)/.test(txt) || /gagne \d+\b.*timbre|timbres\. À la récré/.test(txt)) fail('plausible', p)
    if (niveau === 'ce1' && /fois plus|œufs|voiture peut/.test(txt)) fail('ce2 en ce1', p)
    if (/\b1 (billes|cartes|images|perles|autocollants|coquillages|bonbons|timbres|euros|élèves|filles|garçons|pommes|poules|canards|adultes|passagers)\b/.test(txt)) fail('pluriel', p)
    if (/\b([2-9]|\d\d+) (bille|carte|image|perle|autocollant|coquillage|bonbon|timbre|euro|élève|fille|garçon|pomme|poule|canard|adulte|passager)\b(?!s)/.test(txt)) fail('singulier', p)
    if (/ - /.test(txt) || /undefined|NaN|null/.test(txt + p.calcul)) fail('texte', p)
  }
}
for (const [niveau, plage] of [['ce1','petits'],['ce1','moyens'],['ce1','grands'],['ce2','moyens'],['ce2','grands']]) for (const nb of [3, 15]) {
  const s = M.genererSansRepetition({ niveau, plage, categories: M.CATEGORIES.map(c => c.id) }, nb)
  if (s.length !== nb) fail('serie', { plage, nb, l: s.length })
}
console.log('erreurs', err)
for (const cat of M.NIVEAUX.ce2.categories) for (let i = 0; i < 3; i++) {
  const p = M.genererProbleme({ niveau: 'ce2', plage: i === 2 ? 'grands' : 'moyens' }, cat)
  console.log(`[${cat}] ${p.enonce} ${p.question} → ${p.reponse} ${p.unite.p} | ${p.calcul}`)
}

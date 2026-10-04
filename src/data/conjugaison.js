// Conjugaison des verbes des programmes (cycles 2 et 3) : être, avoir, 1er et 2e groupes, irréguliers du 3e groupe.
// Données pures (aucune dépendance) : utilisées par l'affiche de conjugaison et testées avec node.
// Programmes : BO n° 41 du 31 octobre 2024 (cycle 2) et BO n° 16 du 17 avril 2025 (cycle 3).

export const PRONOMS = ['je', 'tu', 'il / elle / on', 'nous', 'vous', 'ils / elles']
const FIN_IMP = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient']
const FIN_FUT = ['ai', 'as', 'a', 'ons', 'ez', 'ont']
const AVOIR_PRES = ['ai', 'as', 'a', 'avons', 'avez', 'ont'], ETRE_PRES = ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']
const AVOIR_IMP = ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'], ETRE_IMP = ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient']
// verbes du programme : être, avoir, 1er groupe, 2e groupe et irréguliers du 3e groupe (cycles 2 et 3)
// pres / ps : { r, f } (radical + terminaisons à colorer) ou formes entières ; imp / fut : radical (terminaisons communes)
export const VERBES = {
  etre:     { inf: 'être',     groupe: 'auxiliaire', aux: 'avoir', pp: 'été',    pres: ETRE_PRES, imp: 'ét', fut: 'ser', ps: ['fus', 'fus', 'fut', 'fûmes', 'fûtes', 'furent'] },
  avoir:    { inf: 'avoir',    groupe: 'auxiliaire', aux: 'avoir', pp: 'eu',     pres: AVOIR_PRES, imp: 'av', fut: 'aur', ps: ['eus', 'eus', 'eut', 'eûmes', 'eûtes', 'eurent'] },
  chanter:  { inf: 'chanter',  groupe: '1er groupe', aux: 'avoir', pp: 'chanté', pres: { r: 'chant', f: ['e', 'es', 'e', 'ons', 'ez', 'ent'] }, imp: 'chant', fut: 'chanter', ps: { r: 'chant', f: ['ai', 'as', 'a', 'âmes', 'âtes', 'èrent'] } },
  finir:    { inf: 'finir',    groupe: '2e groupe',  aux: 'avoir', pp: 'fini',   pres: { r: 'fin', f: ['is', 'is', 'it', 'issons', 'issez', 'issent'] }, imp: 'finiss', fut: 'finir', ps: { r: 'fin', f: ['is', 'is', 'it', 'îmes', 'îtes', 'irent'] } },
  aller:    { inf: 'aller',    groupe: '3e groupe',  aux: 'être',  pp: 'allé',   pres: ['vais', 'vas', 'va', 'allons', 'allez', 'vont'], imp: 'all', fut: 'ir', ps: ['allai', 'allas', 'alla', 'allâmes', 'allâtes', 'allèrent'] },
  faire:    { inf: 'faire',    groupe: '3e groupe',  aux: 'avoir', pp: 'fait',   pres: ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'], imp: 'fais', fut: 'fer', ps: ['fis', 'fis', 'fit', 'fîmes', 'fîtes', 'firent'] },
  dire:     { inf: 'dire',     groupe: '3e groupe',  aux: 'avoir', pp: 'dit',    pres: ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'], imp: 'dis', fut: 'dir', ps: ['dis', 'dis', 'dit', 'dîmes', 'dîtes', 'dirent'] },
  venir:    { inf: 'venir',    groupe: '3e groupe',  aux: 'être',  pp: 'venu',   pres: ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'], imp: 'ven', fut: 'viendr', ps: ['vins', 'vins', 'vint', 'vînmes', 'vîntes', 'vinrent'] },
  pouvoir:  { inf: 'pouvoir',  groupe: '3e groupe',  aux: 'avoir', pp: 'pu',     pres: ['peux', 'peux', 'peut', 'pouvons', 'pouvez', 'peuvent'], imp: 'pouv', fut: 'pourr', ps: ['pus', 'pus', 'put', 'pûmes', 'pûtes', 'purent'] },
  voir:     { inf: 'voir',     groupe: '3e groupe',  aux: 'avoir', pp: 'vu',     pres: ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'], imp: 'voy', fut: 'verr', ps: ['vis', 'vis', 'vit', 'vîmes', 'vîtes', 'virent'] },
  vouloir:  { inf: 'vouloir',  groupe: '3e groupe',  aux: 'avoir', pp: 'voulu',  pres: ['veux', 'veux', 'veut', 'voulons', 'voulez', 'veulent'], imp: 'voul', fut: 'voudr', ps: ['voulus', 'voulus', 'voulut', 'voulûmes', 'voulûtes', 'voulurent'] },
  prendre:  { inf: 'prendre',  groupe: '3e groupe',  aux: 'avoir', pp: 'pris',   pres: ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'], imp: 'pren', fut: 'prendr', ps: ['pris', 'pris', 'prit', 'prîmes', 'prîtes', 'prirent'] },
}
export const TITRES_TEMPS = { present: 'Présent', imparfait: 'Imparfait', futur: 'Futur', 'passe-compose': 'Passé composé', 'passe-simple': 'Passé simple', 'plus-que-parfait': 'Plus-que-parfait' }
export const TEMPS_CYCLE = ['present', 'imparfait', 'futur', 'passe-compose']
export const TEMPS_CM2 = ['passe-simple', 'plus-que-parfait']

// Une forme = liste de segments [classe, texte] : « rad » radical, « ter » terminaison, « aux » auxiliaire, « pp » participe, « » texte simple
// Formes entières (verbes irréguliers) : on colore la terminaison quand elle est régulière (je vai·s, nous all·ons,
// ils v·ont) ; les vraies exceptions restent sans couleur (j'ai, vous êtes, vous faites). La plus longue d'abord.
const TERMINAISONS = {
  pres: [['s', 'x'], ['s', 'x'], ['t', 'd'], ['ons'], ['ez'], ['ent', 'ont']],
  ps: [['ai', 's'], ['as', 's'], ['a', 't'], ['âmes', 'îmes', 'ûmes', 'mes'], ['âtes', 'îtes', 'ûtes', 'tes'], ['èrent', 'irent', 'urent', 'rent']],
}
function decouper(forme, fins) {
  const f = fins.find(t => forme.endsWith(t) && forme.length > t.length)
    ?? fins.find(t => forme === t)    // « ils ont » : la forme entière est la terminaison
  return f ? [['rad', forme.slice(0, -f.length)], ['ter', f]].filter(([, t]) => t) : [['rad', forme]]
}
const segmentsForme = (def, i, temps) => (Array.isArray(def) ? decouper(def[i], TERMINAISONS[temps][i]) : [['rad', def.r], ['ter', def.f[i]]])
const voyelle = f => /^[aeiouyàâéèêëîïôöûüh]/i.test(f)

// Les six lignes d'un temps : [[classe, texte], …] pour chaque personne, pronom compris (« j' » devant une voyelle)
export function formesTemps(verbe, temps) {
  const v = VERBES[verbe]
  const auxP = v.aux === 'être' ? ETRE_PRES : AVOIR_PRES, auxI = v.aux === 'être' ? ETRE_IMP : AVOIR_IMP
  const compose = (aux, i) => [['aux', aux[i]], ['', ' '], ['pp', v.pp + (v.aux === 'être' ? (i >= 3 ? '(e)s' : '(e)') : '')]]
  return PRONOMS.map((pronom, i) => {
    const segs = temps === 'present' ? segmentsForme(v.pres, i, 'pres')
      : temps === 'imparfait' ? [['rad', v.imp], ['ter', FIN_IMP[i]]]
      : temps === 'futur' ? [['rad', v.fut], ['ter', FIN_FUT[i]]]
      : temps === 'passe-compose' ? compose(auxP, i)
      : temps === 'passe-simple' ? segmentsForme(v.ps, i, 'ps')
      : compose(auxI, i)    // plus-que-parfait
    const debut = segs[0][1]
    return i === 0 && voyelle(debut) ? [['', "j'"], ...segs] : [['', `${pronom} `], ...segs]
  })
}

// formes en texte brut, ex. conjuguer('aller', 'futur')[0] → « j'irai »
export const conjuguer = (verbe, temps) => formesTemps(verbe, temps).map(l => l.map(([, t]) => t).join(''))

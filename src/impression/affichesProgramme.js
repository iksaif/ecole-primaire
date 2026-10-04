// Affiches en lien avec les programmes officiels (cycles 1 à 3) — partagées par l'app et le build des PDF :
// droite numérique, tableau de numération, horloge, pièces et billets, conjugaison, figures et solides.
// Sources : BO n° 41 du 31 octobre 2024 (cycles 1 et 2) et BO n° 16 du 17 avril 2025 (cycle 3).
// Les textes sont en français ; une version bretonne attend un relecteur brittophone (voir README).
// Un module par famille dans affiches/ ; variantes, niveaux et affiches toutes prêtes dans affiches/catalogue.js.
import { VERBES } from '../data/conjugaison.js'
import { cadreAffiche, mesuresAffiche } from './affiches/cadre.js'
import { AFFICHES_PROGRAMME, RESUMES } from './affiches/catalogue.js'
import * as droite from './affiches/droite.js'
import * as numeration from './affiches/numeration.js'
import * as horloge from './affiches/horloge.js'
import * as monnaie from './affiches/monnaie.js'
import * as conjugaison from './affiches/conjugaison.js'
import * as formes from './affiches/formes.js'
import * as resume from './affiches/resume.js'
export { VERBES, TEMPS_CM2, conjuguer } from '../data/conjugaison.js'
export { AFFICHES_PROGRAMME, RESUMES, TEMPS_PRESENT, TEMPS_DU_CHOIX, choixTemps } from './affiches/catalogue.js'

const FAMILLES = { droite, numeration, horloge, monnaie, conjugaison, formes, resume }
const ORIENTATION = Object.fromEntries(AFFICHES_PROGRAMME.map(a => [a.id, a.orientation]))

// Commun aux affiches du programme : titre en bleu, dessins SVG dans la police du texte, légende sous le titre
const CSS = `h1 { color: #1d4e9e; }
  svg { display: block; flex: none; } svg text { font-family: inherit; }
  .legende { text-align: center; color: #555; margin-bottom: 3mm; flex: none; }`

export const DEFAUTS = { affiche: 'droite', variante: '100', verbe: 'etre', temps: null, domaine: 'nombres-calcul', niveau: 'ce1', format: 'A4', orientation: null, titre: '' }

export function normaliserConfig(config = {}) {
  const c = { ...DEFAUTS, ...config }
  if (!FAMILLES[c.affiche]) c.affiche = DEFAUTS.affiche
  const def = AFFICHES_PROGRAMME.find(a => a.id === c.affiche)
  if (def.variantes && !def.variantes.some(v => v.id === c.variante)) c.variante = def.variantes[0].id
  if (c.affiche === 'conjugaison' && !VERBES[c.verbe]) c.verbe = 'etre'
  // résumé : un couple domaine × niveau qui existe (sinon le premier niveau du domaine, ou le défaut)
  if (c.affiche === 'resume' && !RESUMES.some(r => r.domaine === c.domaine && r.niveau === c.niveau)) {
    const r = RESUMES.find(x => x.domaine === c.domaine) ?? RESUMES.find(x => x.domaine === DEFAUTS.domaine && x.niveau === DEFAUTS.niveau)
    Object.assign(c, { domaine: r.domaine, niveau: r.niveau })
  }
  if (c.format !== 'A3') c.format = 'A4'
  c.orientation = c.orientation === 'portrait' || c.orientation === 'landscape' ? c.orientation : ORIENTATION[c.affiche]
  return c
}

// polices = { script } : famille à utiliser (déjà chargée)
export function genererAffichesProgramme(config, polices) {
  const c = normaliserConfig(config)
  const famille = FAMILLES[c.affiche]
  const m = mesuresAffiche({ format: c.format, orientation: c.orientation, marge: 10, hTitre: 16 })
  return cadreAffiche({
    ...m, format: c.format, orientation: c.orientation, polices,
    titre: c.titre || famille.titre(c), corps: famille.dessin(c, m.W, m.H, polices), css: CSS + famille.css,
  })
}

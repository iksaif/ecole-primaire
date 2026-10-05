// Comparer les quantités — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T, nb })   questions de l'exercice à l'écran (l'égalité est possible hors PS)
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (jamais d'égalité sur papier)
//   verifier(q, rep)                              rep : { choix: 'gauche' | 'droite' | 'egal' }
//   bonneReponse(q)                               une réponse juste, dans la forme attendue par verifier (tests)
//   ecartsAuProgramme(questions, contraintes)     ce qui sort du programme du niveau (tests)
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

export const EMOJIS = ['🍎', '⭐', '🐱', '🌸', '🚗', '🦋', '🍓', '🐸', '🐠', '🌙', '🍪', '🎈']

// Plus grand groupe : MS jusqu'à 5 (programme : 6), GS jusqu'à 10 ; PS : 10 aussi (rapport d'au moins 2)
export const NOMBRE_MAX = { ps: 10, ms: 5, gs: 10 }

// PS : comparer « à vue » deux collections dont l'une a au moins deux fois plus d'objets, jusqu'à 10, sans égalité
// (programme.js, contraintes PS : comparaisonGlobale)
function questionPS(rng) {
  const petit = rng.entier(1, 4)
  const grand = rng.entier(Math.max(2 * petit, petit + 2), 10)
  const plusAGauche = rng.vrai(0.5)
  const emoji = EMOJIS[rng.entier(0, EMOJIS.length - 1)]
  return { gauche: plusAGauche ? grand : petit, droite: plusAGauche ? petit : grand, emoji, reponse: plusAGauche ? 'gauche' : 'droite' }
}

export function question({ niveau, rng }) {
  const q = niveau === 'ps' ? questionPS(rng) : questionAutre(niveau, rng)
  return { cle: `${q.gauche}-${q.droite}`, ...q }
}

function questionAutre(niveau, rng) {
  const max = NOMBRE_MAX[niveau]
  const gauche = rng.entier(1, max)
  const forceEgal = rng.vrai(0.2) // 20 % de chance d'être égal
  const droite = forceEgal ? gauche : rng.entier(1, max)
  const emoji = EMOJIS[rng.entier(0, EMOJIS.length - 1)]
  const reponse = gauche > droite ? 'gauche' : droite > gauche ? 'droite' : 'egal'
  return { gauche, droite, emoji, reponse }
}

export const questions = ({ niveau, reglages, rng, nb = reglages.nbQ }) => Array.from({ length: nb }, () => question({ niveau, rng }))

// Fiche : on entoure le groupe qui a le plus, donc pas d'égalité (on retire jusqu'à en avoir une autre)
export function questionsFiche({ niveau, reglages, rng }) {
  return Array.from({ length: reglages.nbQ }, () => {
    let q
    do { q = question({ niveau, rng }) } while (q.reponse === 'egal')
    return q
  })
}

export const verifier = (q, rep) => rep.choix === q.reponse

export const bonneReponse = q => ({ choix: q.reponse })

export function ecartsAuProgramme(questions, contraintes) {
  const ecarts = []
  for (const q of questions) {
    const [petit, grand] = [q.gauche, q.droite].sort((a, b) => a - b)
    if (contraintes.comparaisonGlobale) {
      const { rapportMin, max } = contraintes.comparaisonGlobale
      if (grand < rapportMin * petit || grand > max) ecarts.push(`${q.gauche} · ${q.droite} : rapport < ${rapportMin} ou > ${max}`)
    } else if (grand > contraintes.nombreMax) ecarts.push(`nombre ${grand} > ${contraintes.nombreMax} (nombreMax)`)
  }
  return ecarts
}

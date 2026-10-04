export function aleatoire(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function melanger(tableau) {
  const t = [...tableau]
  for (let i = t.length - 1; i > 0; i--) {
    const j = aleatoire(0, i);
    [t[i], t[j]] = [t[j], t[i]]
  }
  return t
}

export function sauvegarder(cle, valeur) {
  try { localStorage.setItem('ep_' + cle, JSON.stringify(valeur)) } catch {}
}

export function charger(cle, defaut = null) {
  try {
    const v = localStorage.getItem('ep_' + cle)
    return v !== null ? JSON.parse(v) : defaut
  } catch { return defaut }
}

// Même nature de valeur : tableau, objet, nombre, texte, booléen (null accepte tout)
export function memeType(valeur, modele) {
  if (modele === null) return true
  if (Array.isArray(modele)) return Array.isArray(valeur)
  if (typeof modele === 'object') return valeur !== null && typeof valeur === 'object' && !Array.isArray(valeur)
  return typeof valeur === typeof modele && !Number.isNaN(valeur)
}

// Réglages mémorisés d'une vue, fusionnés avec les valeurs par défaut : une sauvegarde ancienne,
// incomplète ou abîmée ne doit jamais bloquer la page. Les clés inconnues sont ignorées, une valeur
// d'un autre type que celle du défaut est remplacée par le défaut, une sauvegarde qui n'est pas un
// objet est ignorée. Les tableaux du défaut sont copiés (le défaut n'est jamais modifié).
export function chargerReglages(cle, defaut) {
  const lu = charger(cle, null)
  const ok = lu !== null && typeof lu === 'object' && !Array.isArray(lu)
  const reglages = {}
  for (const [k, d] of Object.entries(defaut)) {
    reglages[k] = ok && Object.hasOwn(lu, k) && memeType(lu[k], d) ? lu[k] : (Array.isArray(d) ? [...d] : d)
  }
  return reglages
}

// Valeur mémorisée simple (texte, nombre, liste…) : le défaut si elle manque ou n'a pas le bon type
export function chargerValeur(cle, defaut) {
  const lu = charger(cle, defaut)
  return memeType(lu, defaut) ? lu : defaut
}

export function confettis(nb = 30) {
  const couleurs = ['#4a90e2', '#5cb85c', '#f39c12', '#e74c3c', '#9b59b6', '#f1c40f']
  for (let i = 0; i < nb; i++) {
    const el = document.createElement('div')
    el.style.cssText = `
      position:fixed; top:-10px; pointer-events:none; z-index:9999;
      width:10px; height:10px; border-radius:50%;
      background:${couleurs[aleatoire(0, couleurs.length - 1)]};
      left:${aleatoire(10, 90)}vw;
      animation: tomber ${aleatoire(1, 3)}s linear forwards;
      animation-delay:${aleatoire(0, 800)}ms;
    `
    document.body.appendChild(el)
    el.addEventListener('animationend', () => el.remove())
  }
}

export function normaliser(s) {
  return s.trim().toLowerCase()
    .replace(/[''']/g, "'")
    .replace(/\s+/g, ' ')
}


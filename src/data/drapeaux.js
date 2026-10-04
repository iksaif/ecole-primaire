// Drapeaux des langues (SVG), partagés par l'app (Drapeau.vue) et les pages statiques (scripts/telechargements.mjs).
// Le Gwenn-ha-du n'existe pas en emoji : il est dessiné ici (9 bandes, canton d'hermines simplifié).
const h = 12 / 9
const hermines = [[1.3, .9], [3.9, .9], [6.5, .9], [2.6, 3], [5.2, 3], [1.3, 5], [3.9, 5], [6.5, 5]]

export const DRAPEAUX = {
  fr: { nom: 'Français', svg: '<svg class="drapeau" viewBox="0 0 3 2" role="img" aria-label="Drapeau français"><rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>' },
  br: {
    nom: 'Brezhoneg',
    svg: `<svg class="drapeau" viewBox="0 0 18 12" role="img" aria-label="Drapeau breton"><rect width="18" height="12" fill="#fff"/>${
      [0, 1, 2, 3, 4].map(k => `<rect y="${(k * 2 * h).toFixed(3)}" width="18" height="${h.toFixed(3)}" fill="#000"/>`).join('')
    }<rect width="8" height="${(5 * h).toFixed(3)}" fill="#fff"/><g fill="#000">${
      hermines.map(([x, y]) => `<path d="M${x} ${y}l.45 1.3h-.9z"/>`).join('')}</g></svg>`,
  },
}

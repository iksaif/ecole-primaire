// Noms courts des domaines du programme (français) : ceux de src/data/programme.js, qui fait foi.
// Clés partagées avec src/i18n/br/domaines.js (vérifier avec `npm run i18n`).
import { DOMAINES } from '../../data/programme.js'

export default Object.fromEntries(DOMAINES.map(d => [d.id, d.court]))

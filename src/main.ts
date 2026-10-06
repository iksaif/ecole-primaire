import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.ts'
import { installerContexte } from './contexte/useContexte.ts'
import { installerTitres } from './router/titres.ts'
import { installerFocus } from './router/focus.ts'

// Après un déploiement, un onglet resté ouvert réclame d'anciens fichiers (assets/…-hash.js) qui n'existent plus :
// on recharge la page (index.html à jour) au lieu d'une page blanche. Une seule fois par minute et par onglet
// (garde dans sessionStorage), pour ne pas boucler si le fichier manque vraiment. Renvoie false si on n'a pas rechargé.
const CLE_RECHARGEMENT = 'ep_rechargement_chunk'
function rechargerUneFois(adresse?: string): boolean {
  let dernier = 0
  try { dernier = Number(sessionStorage.getItem(CLE_RECHARGEMENT)) || 0 } catch {}
  if (Date.now() - dernier < 60000) return false
  try { sessionStorage.setItem(CLE_RECHARGEMENT, String(Date.now())) } catch { return false }
  if (adresse) history.replaceState(null, '', `${import.meta.env.BASE_URL}${adresse.replace(/^\//, '')}`)
  location.reload()
  return true
}
// dépendances préchargées d'un import() (CSS, sous-modules) : Vite émet cet évènement
window.addEventListener('vite:preloadError', e => { if (rechargerUneFois()) e.preventDefault() })

// chunk d'une vue qui ne se charge pas : on recharge sur la route demandée
const ERREUR_CHUNK = /dynamically imported module|Importing a module script failed|error loading dynamically imported|Unable to preload/i
router.onError((err, to) => {
  if (ERREUR_CHUNK.test(String(err?.message ?? err)) && rechargerUneFois(to?.fullPath)) return
  console.error(err)
})

const app = createApp(App)
// Erreurs des composants : seulement dans la console (vie privée : rien n'est envoyé)
app.config.errorHandler = (err, _instance, info) => console.error(`[ecole-primaire] ${info} :`, err)
installerContexte(router)
installerTitres(router)
installerFocus(router)
app.use(router).mount('#app')

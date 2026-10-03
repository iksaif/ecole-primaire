<template>
  <button class="loupe" :title="t('ouvrir')" :aria-label="t('ouvrir')" @click="ouvrir">🔍<kbd>{{ raccourci }}</kbd></button>

  <div v-if="ouvert" class="fond" @click.self="fermer">
    <div class="boite" role="dialog" aria-modal="true" :aria-label="t('titre')">
      <input ref="champ" v-model="q" type="search" class="champ" :placeholder="t('placeholder')" autocomplete="off"
        @keydown.down.prevent="deplacer(1)" @keydown.up.prevent="deplacer(-1)" @keydown.enter.prevent="choisir(resultats[actif])"
        @keydown.esc="fermer">
      <ul v-if="resultats.length" class="resultats">
        <li v-for="(r, i) in resultats" :key="r.cle">
          <a :href="r.href" :class="{ actif: i === actif }" @mouseenter="actif = i" @click.prevent="choisir(r)">
            <span class="icone">{{ r.icone }}</span>
            <span class="texte"><b>{{ r.titre }}</b><small>{{ r.sous }}</small></span>
            <span class="type">{{ t(r.type) }}</span>
          </a>
        </li>
      </ul>
      <p v-else class="vide">{{ q ? t('aucun') : t('aide') }}</p>
      <p class="pied">{{ t('clavier') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ACTIVITES, etiquetteNiveaux } from '../data/activites'
import { useI18n } from '../i18n'
import { useLangueRegionale } from '../composables/useLangueRegionale'

const { t, langue } = useI18n({
  fr: {
    ouvrir: 'Rechercher (/)', titre: 'Recherche', placeholder: 'Rechercher un exercice ou une fiche… (heure, tables, alphabet, CE1…)',
    aide: 'Tape un mot : heure, multiplication, alphabet, dictée, CE1…', aucun: 'Rien trouvé. Essaie un autre mot.',
    clavier: '↑ ↓ pour choisir · Entrée pour ouvrir · Échap pour fermer',
    exercice: 'Exercice', imprimer: 'À imprimer', pdf: 'Fiche PDF',
  },
  br: {
    ouvrir: 'Klask (/)', titre: 'Klask', placeholder: 'Klask ur boelladenn pe ur fichenn… (eur, taolennoù, lizherenneg, CE1…)',
    aide: 'Skriv ur ger : eur, liesadenn, lizherenneg, skrivadeg, CE1…', aucun: "N'eus bet kavet netra. Klask ur ger all.",
    clavier: '↑ ↓ evit dibab · Enter evit digeriñ · Esc evit serriñ', // br: à relire
    exercice: 'Poelladenn', imprimer: 'Da voullañ', pdf: 'Fichenn PDF',
  },
})
const { code: regionale } = useLangueRegionale()
const router = useRouter()

const ouvert = ref(false)
const q = ref('')
const actif = ref(0)
const champ = ref(null)
const fiches = ref([])
const raccourci = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'

const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// fiches toutes prêtes : liste générée au build (scripts/telechargements.mjs), chargée à la première recherche
let charge = false
async function chargerFiches() {
  if (charge) return
  charge = true
  try {
    const r = await fetch(`${import.meta.env.BASE_URL}telechargements/fiches.json`)
    if (r.ok) fiches.value = await r.json()
  } catch { /* hors ligne ou en dev sans build : on cherche seulement dans les activités */ }
}

const entrees = computed(() => {
  const br = langue.value === 'br'
  const activites = ACTIVITES.map(a => ({
    cle: a.to, type: a.matiere === 'imprimer' ? 'imprimer' : 'exercice', icone: a.icon,
    titre: br && a.br ? a.br.titre : a.titre, sous: `${etiquetteNiveaux(a.niveaux)} · ${br && a.br ? a.br.desc : a.desc}`,
    route: a.to, texte: norm([a.titre, a.br?.titre, a.desc, a.br?.desc, a.domaine, a.niveaux.join(' ')].join(' ')),
  }))
  const pdfs = fiches.value
    .filter(f => regionale.value || f.langues.includes('fr'))
    .map(f => ({
      cle: f.slug, type: 'pdf', icone: f.usage === 'apprendre' ? '📘' : '✏️',
      titre: br ? f.br : f.fr, sous: f.niveaux,
      href: `${import.meta.env.BASE_URL}telechargements/${f.slug}/`,
      texte: norm([f.fr, f.br, f.titre, f.niveaux, f.slug.replace(/-/g, ' ')].join(' ')),
    }))
  return [...activites, ...pdfs]
})

const resultats = computed(() => {
  const mots = norm(q.value).split(/\s+/).filter(Boolean)
  if (!mots.length) return []
  return entrees.value.filter(e => mots.every(m => e.texte.includes(m))).slice(0, 12)
})
watch(q, () => { actif.value = 0 })

async function ouvrir() {
  ouvert.value = true
  chargerFiches()
  await nextTick()
  champ.value?.focus()
}
function fermer() {
  ouvert.value = false
  q.value = ''
}
function deplacer(d) {
  const n = resultats.value.length
  if (n) actif.value = (actif.value + d + n) % n
}
function choisir(r) {
  if (!r) return
  fermer()
  if (r.route) router.push(r.route)
  else window.location.href = r.href
}

function raccourcis(e) {
  const champTexte = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable
  if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); ouvert.value ? fermer() : ouvrir() }
  else if (e.key === '/' && !champTexte && !ouvert.value) { e.preventDefault(); ouvrir() }
}
onMounted(() => document.addEventListener('keydown', raccourcis))
onUnmounted(() => document.removeEventListener('keydown', raccourcis))
</script>

<style scoped>
.loupe {
  border: none; background: var(--gris-bg); border-radius: 20px; padding: .3rem .6rem; cursor: pointer;
  font-size: .95rem; display: inline-flex; align-items: center; gap: .35rem; white-space: nowrap;
}
.loupe:hover { background: #eef1f4; }
.loupe kbd { font: inherit; font-size: .7rem; color: #888; border: 1px solid var(--gris-brd); border-radius: 5px; padding: 0 .3rem; background: white; }
@media (max-width: 900px) { .loupe kbd { display: none; } }
.fond { position: fixed; inset: 0; background: rgba(0,0,0,.35); z-index: 900; display: flex; justify-content: center; align-items: flex-start; padding: 10vh 1rem 1rem; }
.boite { background: white; border-radius: var(--radius); box-shadow: 0 12px 40px rgba(0,0,0,.25); width: 100%; max-width: 620px; overflow: hidden; }
.champ { width: 100%; border: none; border-bottom: 2px solid var(--gris-brd); padding: 1rem 1.25rem; font: inherit; font-size: 1.1rem; outline: none; }
.resultats { list-style: none; max-height: 55vh; overflow-y: auto; padding: .4rem; }
.resultats a { display: flex; align-items: center; gap: .75rem; padding: .55rem .75rem; border-radius: 8px; text-decoration: none; color: var(--texte); }
.resultats a.actif { background: #eaf2fc; }
.icone { font-size: 1.4rem; width: 1.8rem; text-align: center; flex: none; }
.texte { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.texte b { font-size: .95rem; }
.texte small { color: #888; font-size: .78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.type { font-size: .72rem; font-weight: 800; color: #888; text-transform: uppercase; flex: none; }
.vide { padding: 1.25rem; color: #888; }
.pied { font-size: .75rem; color: #aaa; padding: .5rem 1.25rem .75rem; border-top: 1px solid var(--gris-bg); }
</style>

<template>
  <div class="choix-police">
    <div v-for="t in types" :key="t" class="ligne">
      <label class="lib">{{ t === 'attache' ? 'Attaché' : 'Script' }}</label>
      <select v-model="choix[t]" class="select">
        <option v-for="p in disponibles[t]" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
      <span class="exemple" :style="{ fontFamily: `'${choix[t]}'` }">{{ t === 'attache' ? 'belle école' : 'a b g école' }}</span>
      <button v-if="estPerso(t)" class="btn-suppr" title="Retirer cette police" @click="supprimer(t)">🗑</button>
    </div>

    <details class="aide">
      <summary>➕ Utiliser Belle Allure, Écolier ou une autre police…</summary>
      <p>
        Ces polices scolaires sont gratuites pour la classe et la maison, mais leur licence ne permet pas de les
        livrer avec le site. Deux solutions : les <strong>installer</strong> sur l'ordinateur (elles apparaîtront dans la liste
        après rechargement de la page), ou <strong>ajouter le fichier</strong> ici (il reste mémorisé dans ce navigateur).
      </p>
      <ul>
        <li v-for="l in LIENS_POLICES" :key="l.nom"><a :href="l.url" target="_blank" rel="noopener">{{ l.nom }}</a> — {{ l.note }}</li>
      </ul>
      <div class="ajout">
        <label class="btn btn-ghost">📂 Ajouter une police attachée
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'attache')">
        </label>
        <label class="btn btn-ghost">📂 Ajouter une police script
          <input type="file" accept=".ttf,.otf,.woff,.woff2" hidden @change="ajouter($event, 'script')">
        </label>
      </div>
      <p class="note">Astuce Belle Allure : choisis le fichier sans lignes (pas « Ductus » ni « Lignes ») ; la taille est ajustée automatiquement au lignage Seyès.</p>
      <p v-if="erreur" class="erreur">{{ erreur }}</p>
    </details>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { usePolices } from '../composables/usePolices'
import { LIENS_POLICES, ajouterPolicePerso, supprimerPolicePerso, policesPerso } from '../utils/impression'

defineProps({ types: { type: Array, default: () => ['attache', 'script'] } })
const { choix, disponibles } = usePolices()
const erreur = ref('')

const estPerso = t => policesPerso.value.some(p => p.id === choix.value[t])

async function ajouter(e, type) {
  const f = e.target.files?.[0]
  e.target.value = ''
  if (!f) return
  erreur.value = ''
  try {
    choix.value[type] = await ajouterPolicePerso(f, type)
  } catch (err) {
    erreur.value = err.message || String(err)
  }
}

function supprimer(t) {
  supprimerPolicePerso(choix.value[t])
}
</script>

<style scoped>
.ligne { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; margin-bottom: .5rem; }
.lib { font-weight: 700; min-width: 4.5rem; }
.select {
  flex: 1; min-width: 200px; font: inherit; padding: .45rem .6rem;
  border: 2px solid var(--gris-brd); border-radius: 8px; background: white;
}
.exemple { font-size: 1.6rem; min-width: 9rem; line-height: 1.6; }
.btn-suppr { border: none; background: none; cursor: pointer; font-size: 1.1rem; }
.aide { margin-top: .5rem; font-size: .9rem; color: #555; }
.aide summary { cursor: pointer; font-weight: 700; color: var(--bleu); }
.aide p, .aide ul { margin: .5rem 0; }
.aide ul { padding-left: 1.25rem; }
.ajout { display: flex; gap: .5rem; flex-wrap: wrap; margin: .75rem 0; }
.ajout .btn { font-size: .9rem; padding: .5rem 1rem; }
.note { font-size: .8rem; color: #888; }
.erreur { color: var(--rouge); font-weight: 700; }
</style>

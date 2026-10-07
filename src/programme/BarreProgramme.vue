<template>
  <div class="barre-programme">
    <div class="groupe" role="group" :aria-label="t('programme.matiere.legende')">
      <button v-for="m in matieres" :key="m" type="button" class="choix" :aria-pressed="etat.matiere === m" @click="emit('matiere', m)">
        <IconeMatiere v-if="m === 'regionale'" matiere="regionale" />
        <span v-else aria-hidden="true">{{ EMOJI_MATIERE[m] }}</span> {{ nomMatiere(m) }}
      </button>
    </div>
    <ChoixClassesProgramme />
    <div v-if="domaines.length" class="groupe" role="group" :aria-label="t('programme.domaine.legende')">
      <button v-for="d in domaines" :key="d" type="button" class="choix" :aria-pressed="etat.domaine === d" @click="emit('domaine', d)">
        <span aria-hidden="true">{{ EMOJI_DOMAINE[d as DomaineId] }}</span> {{ nomDuDomaine(d, langueAffichee) }}
      </button>
    </div>
    <p v-else class="vide">{{ t('programme.domaine.aucun') }}</p>
    <div class="groupe outils">
      <div class="groupe" role="group" :aria-label="t('programme.affichage.legende')">
        <button v-for="a in AFFICHAGES" :key="a" type="button" class="choix" :aria-pressed="affichage === a" @click="emit('affichage', a)">
          <span aria-hidden="true">{{ a === 'tableau' ? '▦' : '☰' }}</span> {{ t(`programme.affichage.${a}`) }}
        </button>
      </div>
      <button type="button" class="choix" :aria-pressed="contexte.refs" @click="basculerRefs()">
        <span aria-hidden="true">{{ EMOJI.references }}</span> {{ t('programme.refs') }}
      </button>
      <button type="button" class="btn btn-ghost copier" @click="copier">
        <span aria-hidden="true">{{ EMOJI.lien }}</span> {{ t('programme.lien.copier') }}
      </button>
    </div>
    <p class="statut" role="status" aria-live="polite">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
// Barre de la page « Programme » : matière, classes, domaine, présentation (tableau / liste), références officielles, lien à copier.
// Les choix de matière, de domaine et de présentation remontent à la page (adresse) ; classes et références passent par le contexte.
import { ref } from 'vue'
import { useContexte } from '../contexte/useContexte.ts'
import type { DomaineId } from '../data/programme.ts'
import { useLangue } from '../langues/useLangue.ts'
import { EMOJI_DOMAINE } from '../ressources/emojis.ts'
import ChoixClassesProgramme from './ChoixClassesProgramme.vue'
import { EMOJI, EMOJI_MATIERE } from './emojis.ts'
import { AFFICHAGES, MATIERES_PROGRAMME } from './etat.ts'
import type { Affichage, EtatProgramme, MatiereProgramme } from './etat.ts'
import { nomDuDomaine } from './noms.ts'
import IconeMatiere from '../shell/IconeMatiere.vue'
import { SITE } from '../sites.ts'
import { LANGUES } from '../langues/registre.ts'
import { majuscule } from '../ressources/composants/presentation.ts'

const props = defineProps<{ etat: EtatProgramme, affichage: Affichage, domaines: readonly string[], lien: () => string }>()
// la langue régionale seulement sur un site qui en a une ; elle porte le nom de la langue (« Brezhoneg »)
const regionale = SITE.languesRegionales[0]
const matieres = MATIERES_PROGRAMME.filter(m => m !== 'regionale' || regionale)
const nomMatiere = (m: MatiereProgramme): string => (m === 'regionale' && regionale ? majuscule(LANGUES[regionale].nomLocal) : t(`programme.matiere.${m}`))
const emit = defineEmits<{ matiere: [MatiereProgramme], domaine: [string], affichage: [Affichage] }>()
const { t, langueAffichee } = useLangue()
const { contexte, basculerRefs } = useContexte()

const message = ref('')
async function copier(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.lien())
    message.value = t('programme.lien.copie')
  } catch {
    message.value = t('programme.lien.echec')
  }
}
</script>

<style scoped>
.barre-programme { display: grid; gap: .7rem; margin: .8rem 0 1.2rem; }
.groupe { display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; }
.outils { justify-content: space-between; }
.choix { min-height: 2.75rem; padding: .4rem .9rem; border-radius: 999px; border: 2px solid var(--gris-brd); background: #fff; font-weight: 700; font-size: .92rem; cursor: pointer; color: var(--texte); }
.choix:hover { border-color: var(--bleu); color: var(--bleu-fort); }
.choix[aria-pressed='true'] { background: var(--bleu-fort); border-color: var(--bleu-fort); color: #fff; }
.copier { min-height: 2.75rem; }
.statut { min-height: 1.3rem; font-size: .9rem; color: var(--vert-texte); }
.vide { color: var(--texte-doux); }
</style>

<template>
  <div class="container">
    <h1 class="section-heading">💶 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche" police
      @commencer="jeu.demarrer" @regenerer="nouvelle">
      <ChoixReglage :definition="DEFINITION" cle="niveau" v-model="config.niveau" :titre="t('niveau')" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="exercices" v-model="config.exercices"
        :titre="t('exercices')" :libelle="e => t(`type_${e}`)" />
      <ChoixReglage :definition="DEFINITION" :niveau="config.niveau" cle="centimes" v-model="config.centimes"
        :titre="t('options')" :libelle="c => t(c ? 'avecCentimes' : 'eurosEntiers')">
        <div v-if="mode === 'jouer'" class="btn-group" style="margin-top:.5rem;">
          <button class="level-btn" :class="{ active: config.aideTotal }" @click="config.aideTotal = !config.aideTotal">
            {{ config.aideTotal ? '✔' : '✖' }} {{ t('afficherTotal') }}
          </button>
        </div>
      </ChoixReglage>
      <ChoixReglage v-if="mode === 'jouer'" :definition="DEFINITION" cle="nbQ" v-model="config.nbQ" :titre="t('nbQuestions')" />

      <div class="apercu">
        <span v-for="v in pieces" :key="v" class="argent" v-html="argent(v, 0.7)"></span>
      </div>

      <div v-if="mode === 'imprimer'" class="aide-config">{{ t('aideFiche') }}</div>
    </ConfigExercice>

    <!-- Exercice -->
    <QuestionJeu v-if="phase === 'jeu' && q" :jeu="jeu">
      <!-- Compter -->
      <template v-if="q.type === 'compter'">
        <div class="consigne">{{ t('combienArgent') }}</div>
        <div class="tas">
          <span v-for="(v, i) in q.items" :key="i" class="argent" v-html="argent(v)"></span>
        </div>
        <template v-if="q.avecCentimes && decimal">
          <div class="saisie-somme">
            <SaisieReponse v-model="saisieT" type="decimal" class="exercise-input saisie-large" :etat="etat"
              :placeholder="t('exemple')" :disabled="repondu" focus @entree="entree" />
          </div>
          <div class="astuce" style="text-align:center;">{{ t('tuPeuxEcrire') }}</div>
        </template>
        <div v-else class="saisie-somme">
          <SaisieReponse v-model="saisieE" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" placeholder="?"
            :disabled="repondu" focus @entree="entree" />
          <span class="unite">€</span>
          <template v-if="q.avecCentimes">
            <SaisieReponse v-model="saisieC" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" max="99"
              placeholder="?" :disabled="repondu" @entree="entree" />
            <span class="unite">c</span>
          </template>
        </div>
      </template>

      <!-- Composer / le moins possible / rendre -->
      <template v-if="['composer', 'moins', 'rendre'].includes(q.type)">
        <div v-if="q.type === 'composer'" class="consigne">
          {{ t('composer1') }} <strong class="somme">{{ f(q.cible) }}</strong>
        </div>
        <div v-else-if="q.type === 'moins'" class="consigne">
          {{ t('moins1') }} <strong class="somme">{{ f(q.cible) }}</strong>
          {{ t('moins2') }} <strong>{{ t('moins3') }}</strong> {{ t('moins4') }}
        </div>
        <template v-else>
          <div class="consigne">
            <span class="objet">{{ q.objet.e }}</span>
            {{ t('tuAchetes') }} {{ q.objet.nom }} {{ T('coute', q.objet) }} <strong class="somme">{{ f(q.prix) }}</strong>.
          </div>
          <div class="consigne petite">
            {{ t('tuDonnes') }}
            <span class="argent" v-html="argent(q.paye, 0.8)"></span>
          </div>
          <div class="consigne petite">{{ t('combienRendre') }}</div>
        </template>

        <div class="plateau" :class="etat">
          <span v-if="!selection.length" class="plateau-vide">{{ t('plateauVide') }}</span>
          <button v-for="(v, i) in selection" :key="i" class="btn-argent dans-plateau"
                  :disabled="repondu" :title="t('enlever') + ' : ' + nomArgent(v)"
                  @click="enlever(i)">
            <span class="argent" v-html="argent(v, 0.8)"></span>
          </button>
        </div>
        <div class="plateau-actions">
          <span v-if="config.aideTotal" class="total-aide">{{ t('total') }} : <strong>{{ f(totalDe(selection)) }}</strong></span>
          <span v-else></span>
          <span class="btn-group">
            <button class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="selection.pop()">{{ t('annuler') }}</button>
            <button class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="selection = []">{{ t('toutEnlever') }}</button>
          </span>
        </div>

        <div class="palette">
          <button v-for="v in pieces" :key="v" class="btn-argent" :disabled="repondu"
                  :title="t('ajouter') + ' : ' + nomArgent(v)" @click="ajouter(v)">
            <span class="argent" v-html="argent(v)"></span>
          </button>
        </div>
      </template>

      <!-- Convertir (CE2) -->
      <template v-if="q.type === 'convertir'">
        <div class="consigne">{{ t('rappel') }} : <strong>1 € = 100 c</strong></div>
        <div class="consigne conversion">{{ q.texte.replace(/ = \?.*$/, ' =') }}</div>
        <div class="saisie-somme">
          <template v-if="q.sous === 'c2ec'">
            <SaisieReponse v-model="saisieE" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" placeholder="?"
              :disabled="repondu" focus @entree="entree" />
            <span class="unite">€</span>
            <SaisieReponse v-model="saisieC" type="nombre" class="exercise-input saisie-petite" :etat="etat" min="0" max="99"
              placeholder="?" :disabled="repondu" @entree="entree" />
            <span class="unite">c</span>
          </template>
          <template v-else>
            <SaisieReponse v-model="saisieT" type="decimal" class="exercise-input saisie-large" :etat="etat"
              :inputmode="q.sous === 'ec2dec' ? 'decimal' : 'numeric'" :placeholder="q.sous === 'ec2dec' ? '?,??' : '?'"
              :disabled="repondu" focus @entree="entree" />
            <span class="unite">{{ q.sous === 'ec2dec' ? '€' : 'c' }}</span>
          </template>
        </div>
      </template>

      <!-- Comparer -->
      <template v-if="q.type === 'comparer'">
        <div class="consigne">{{ t('quiPlus') }}</div>
        <div class="porte-monnaies">
          <div v-for="cote in ['A', 'B']" :key="cote" class="porte-monnaie"
               :class="{ gagnant: repondu && (q.bonne === cote || q.bonne === 'egal') }">
            <div class="porte-nom">👛 {{ cote === 'A' ? q.nomA : q.nomB }}</div>
            <div class="tas">
              <span v-for="(v, i) in (cote === 'A' ? q.itemsA : q.itemsB)" :key="i"
                    class="argent" v-html="argent(v, 0.75)"></span>
            </div>
            <div v-if="repondu" class="porte-total">{{ f(cote === 'A' ? q.totalA : q.totalB) }}</div>
          </div>
        </div>
        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('A')">{{ q.nomA }}</button>
          <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('B')">{{ q.nomB }}</button>
          <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('egal')">{{ t('autantDeux') }}</button>
        </div>
      </template>

      <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

      <!-- Correction visuelle -->
      <div v-if="repondu && !dernierOk" class="correction">
        <template v-if="q.type === 'compter'">
          {{ t('ilYa1') }}<strong>{{ q.attendu }}</strong>{{ t('ilYa2') }}
          <div class="astuce">{{ t('astuceCompter') }}<span v-if="config.niveau === 'ce2'"> {{ t('noublie') }} : 100 c = 1 €.</span></div>
        </template>
        <template v-else-if="q.type === 'convertir'">
          {{ q.texte.replace(/ = \?.*$/, '') }} = <strong>{{ q.attendu }}</strong>
          <div class="astuce">{{ t('astuceConvertir') }}</div>
        </template>
        <template v-else-if="q.type === 'comparer'">
          {{ q.nomA }}{{ t('aSomme') }} <strong>{{ f(q.totalA) }}</strong>,
          {{ q.nomB }}{{ t('aSomme') }} <strong>{{ f(q.totalB) }}</strong>.
          <div class="astuce">{{ t('astuceComparer') }}</div>
        </template>
        <template v-else>
          <div>{{ q.type === 'moins' ? t('avecMoins') : t('uneBonne') }}</div>
          <div class="tas">
            <span v-for="(v, i) in q.solution" :key="i" class="argent" v-html="argent(v, 0.75)"></span>
          </div>
          <div v-if="q.type === 'rendre'" class="astuce">
            {{ t('astuceRendre', { prix: f(q.prix), paye: f(q.paye), cible: f(q.cible) }) }}
          </div>
          <div v-else-if="q.type === 'moins'" class="astuce">{{ t('astuceMoins') }}</div>
        </template>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1rem;">
        <template v-if="!repondu">
          <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
          <button v-if="q.type !== 'comparer'" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
        </template>
        <button v-else-if="!dernierOk" class="btn btn-primary" @click="jeu.suivante">{{ t('suivant') }}</button>
      </div>
    </QuestionJeu>

    <!-- Résultats -->
    <ResultatsJeu v-if="phase === 'resultats'" :bonnes="bonnes" :total="questions.length" :cle-fin="cleFin"
      @rejouer="jeu.recommencer" @reglages="jeu.quitter">
      <TableauCorrection :historique="historique" />
    </ResultatsJeu>
  </div>
</template>

<script setup>
// La monnaie : la vue ne fait que les réglages et le rendu d'une question. Niveaux, générateur et fiche :
// src/exercices/monnaie/ (definition.js, generateur.js, fiche.js, argent.js). Sommes en centimes.
import { ref, computed } from 'vue'
import { useI18n, contenu } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import ChoixReglage from '../../components/ChoixReglage.vue'
import QuestionJeu from '../../components/QuestionJeu.vue'
import ResultatsJeu from '../../components/ResultatsJeu.vue'
import SaisieReponse from '../../components/SaisieReponse.vue'
import TableauCorrection from '../../components/TableauCorrection.vue'
import { useReglages } from '../../composables/useReglages'
import { useFicheExercice } from '../../composables/useFicheExercice'
import { useJeu } from '../../composables/useJeu'
import DEFINITION from '../../exercices/monnaie/definition'
import { INTERFACE, TEXTES } from '../../exercices/monnaie/textes'
import { questions as genererQuestions, questionsFiche, verifier, sommeDonnee, donnees, palette, fmt, formatSomme, totalDe, trierDesc }
  from '../../exercices/monnaie/generateur'
import { fiche as ficheMonnaie } from '../../exercices/monnaie/fiche'
import { svgArgent } from '../../exercices/monnaie/argent'

const { t } = useI18n(INTERFACE)
// Réglages mémorisés, ajustés au changement de niveau (politique commune : src/composables/useReglages.js) ; maths :
// le contenu (énoncés, fiche) suit la langue de l'interface
const { config, langueContenu } = useReglages(DEFINITION, 'monnaie_config')
const T = contenu(TEXTES, () => langueContenu.value).t

const decimal = computed(() => donnees(config.value.niveau).saisieDecimale)
const pieces = computed(() => palette(config.value.niveau, config.value.centimes))
const f = c => fmt(c, config.value.niveau)
// « billet de 5 € », « pièce de 2 centimes » : lecteurs d'écran et infobulles
const nomArgent = v => T('nomArgent', { v })
const argent = (v, echelle = 1) => svgArgent(v, echelle, nomArgent(v))

// ── Jeu ──
const saisieE = ref('')
const saisieC = ref('')
const saisieT = ref('')
const selection = ref([])
const avis = ref('')          // somme illisible : message, sans compter de réponse

// message après une erreur, selon le type de question (rep : la réponse donnée ; null si passée)
function messageErreur(q, rep) {
  if (!rep) return ''
  if (q.type === 'comparer') return `❌ ${q.bonne === 'egal' ? t('autantArgent', { s: f(q.totalA) }) : t('lePlus', { nom: q.attendu })}`
  if (q.type === 'compter' || q.type === 'convertir') return `❌ ${t('pasTout')}`
  const tot = totalDe(rep.selection)
  if (q.type === 'moins') return `❌ ${tot !== q.cible ? t('auLieuDe', { t: f(tot), c: f(q.cible) }) : t('tropDePieces', { t: f(tot), n: q.solution.length })}`
  return `❌ ${tot < q.cible ? t('ilManque', { t: f(tot), m: f(q.cible - tot) }) : t('deTrop', { t: f(tot), m: f(tot - q.cible) })}`
}

const jeu = useJeu({
  generer: rng => genererQuestions({ niveau: config.value.niveau, reglages: config.value, rng, T, nb: config.value.nbQ }),
  verifier,
  messageErreur,
  delai: 900,
  // champs vidés ; le focus : SaisieReponse (attribut focus)
  surQuestion: () => { saisieE.value = ''; saisieC.value = ''; saisieT.value = ''; selection.value = []; avis.value = '' },
})
const { phase, questions, q, bonnes, historique, retour, repondu, etat, cleFin } = jeu

const dernierOk = computed(() => !!retour.value?.ok)
const feedback = computed(() => retour.value?.message ?? avis.value)
const feedbackClass = computed(() => etat.value || (avis.value ? 'erreur' : ''))

function ajouter(v) { if (!repondu.value && selection.value.length < 30) selection.value.push(v) }
function enlever(i) { if (!repondu.value) selection.value.splice(i, 1) }

function entree() {
  if (!repondu.value) valider()
  else if (!dernierOk.value) jeu.suivante()
}

function valider() {
  if (repondu.value) return
  const qu = q.value
  if (qu.type === 'convertir') {
    const deux = qu.sous === 'c2ec'
    if (deux ? saisieE.value === '' && saisieC.value === '' : !String(saisieT.value).trim()) return
    const donne = deux ? `${saisieE.value || 0} € ${saisieC.value || 0} c` : `${String(saisieT.value).trim()}${qu.sous === 'ec2dec' ? '' : ' c'}`
    jeu.repondre({ e: saisieE.value, c: saisieC.value, texte: saisieT.value }, { donne })
    return
  }
  if (qu.type === 'compter') {
    const enTexte = qu.avecCentimes && decimal.value
    if (enTexte ? !String(saisieT.value).trim() : saisieE.value === '' && saisieC.value === '') return
    const rep = enTexte ? { texte: saisieT.value } : { e: saisieE.value, c: saisieC.value }
    const val = sommeDonnee(qu, rep)
    if (val === null) { if (enTexte) avis.value = t('ecrisSomme'); return }
    jeu.repondre(rep, { donne: f(val) })
    return
  }
  if (!selection.value.length) return
  const sel = [...selection.value]
  const donne = qu.type === 'moins' ? `${sel.length} : ${trierDesc(sel).map(formatSomme).join(' + ')}` : f(totalDe(sel))
  jeu.repondre({ selection: sel }, { donne })
}

function choisirComparer(choix) {
  const qu = q.value
  jeu.repondre({ choix }, { donne: choix === 'A' ? qu.nomA : choix === 'B' ? qu.nomB : t('autant') })
}

// passer : la question compte comme une erreur, et on enchaîne aussitôt
function passer() {
  if (repondu.value) return
  jeu.passer({ donne: t('passe') })
  jeu.suivante()
}

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) : graine du lien, sinon tirée ──
const { mode, fiche, nouvelle } = useFicheExercice({
  tirer: rng => questionsFiche({ niveau: config.value.niveau, reglages: config.value, rng, T }),
  mettreEnPage: (questions, police) => ficheMonnaie({ questions, reglages: config.value, T, langue: langueContenu.value, ...police }),
})
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #888; margin-top: .4rem; }
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .75rem 0;
  line-height: 1.5;
}
.consigne.petite { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: .5rem; flex-wrap: wrap; }
.somme { color: var(--bleu); white-space: nowrap; font-size: 1.5rem; }
.objet { font-size: 2rem; vertical-align: middle; }

.apercu {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 6px; margin-top: 1rem; padding: .75rem; background: var(--gris-bg); border-radius: 8px;
}

.tas {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px; margin: 1rem 0;
}
.argent { display: inline-flex; line-height: 0; }
.argent :deep(svg) { display: block; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }

.saisie-somme {
  display: flex; align-items: center; justify-content: center; gap: .5rem; margin-top: .5rem;
}
.saisie-petite { width: 7rem; display: inline-block; }
.saisie-large { width: 12rem; display: inline-block; }
.consigne.conversion { font-size: 1.8rem; font-weight: 900; }
.unite { font-size: 1.8rem; font-weight: 800; }

.plateau {
  min-height: 90px;
  border: 3px dashed var(--gris-brd);
  border-radius: var(--radius);
  padding: .5rem;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px;
  margin-top: .75rem;
  background: #fffdf5;
}
.plateau.ok     { border-color: var(--vert); background: #f0faf0; }
.plateau.erreur { border-color: var(--rouge); background: #fef0f0; }
.plateau-vide { color: #aaa; font-style: italic; }

.plateau-actions {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
  gap: .5rem; margin: .5rem 0 1rem;
}
.total-aide { font-size: 1.1rem; }
.btn.petit { padding: .45rem .9rem; font-size: .9rem; min-height: 44px; }
.btn:disabled { opacity: .45; cursor: not-allowed; }

.palette {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;
  padding: .75rem; background: var(--gris-bg); border-radius: var(--radius);
}
.btn-argent {
  min-width: 48px; min-height: 48px;
  display: inline-flex; align-items: center; justify-content: center;
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: 4px; cursor: pointer; transition: transform .1s, border-color .15s;
  touch-action: manipulation;
}
.btn-argent:hover:not(:disabled)  { border-color: var(--bleu); }
.btn-argent:active:not(:disabled) { transform: scale(.94); }
.btn-argent:disabled { cursor: default; opacity: .8; }
.btn-argent.dans-plateau { background: transparent; border-color: transparent; }

.porte-monnaies {
  display: grid; grid-template-columns: 1fr 1fr; gap: .75rem;
}
.porte-monnaie {
  border: 3px solid var(--gris-brd); border-radius: var(--radius); padding: .5rem;
  background: #fffdf5;
}
.porte-monnaie.gagnant { border-color: var(--vert); background: #f0faf0; }
.porte-nom { font-weight: 800; text-align: center; font-size: 1.15rem; }
.porte-monnaie .tas { margin: .5rem 0; gap: 4px; }
.porte-total { text-align: center; font-weight: 800; font-size: 1.2rem; color: var(--bleu); }
.choix { min-height: 48px; font-size: 1.05rem; }

.correction {
  border: 2px solid var(--orange); background: #fff8ec; border-radius: var(--radius);
  padding: .75rem 1rem; text-align: center; font-size: 1.05rem;
}
.correction .tas { margin: .5rem 0; }
.astuce { font-size: .95rem; color: #666; margin-top: .4rem; }

@media (max-width: 520px) {
  .porte-monnaies { grid-template-columns: 1fr; }
  .container :deep(.exercise-box) { padding: 1.25rem .75rem; }
}
</style>

<template>
  <div v-if="valide" class="container" data-page="texte-officiel">
    <BandeauConstruction />
    <FilAriane :maillons="maillons" :etiquette="t('competence.fil')" />
    <h1 class="section-heading" :lang="LANGUE_SOURCE"><span aria-hidden="true"><Icone nom="programme" /></span> {{ t('competence.lecteur.titre', { page: t('programme.reference.page', { page }) }) }}</h1>
    <p class="source" :lang="LANGUE_SOURCE">{{ SOURCES[source].titre }}</p>

    <section v-if="competence" class="passage" aria-labelledby="h-passage">
      <h2 id="h-passage">{{ t('competence.lecteur.passage') }}</h2>
      <p class="libelle" :lang="LANGUE_SOURCE"><RouterLink :to="versCompetence(competence.id)">{{ competence.libelle }}</RouterLink></p>
      <p v-if="etat === 'pret' && !passage" class="aide">{{ t('competence.lecteur.sansPassage') }}</p>
    </section>

    <p class="avertissement">{{ t('competence.lecteur.avertissement') }}</p>
    <p class="actions">
      <a :href="urlPdf" target="_blank" rel="noopener noreferrer">{{ t('competence.lecteur.ouvrirPdf') }}<span class="sr-only"> ({{ t('competence.officiel.ouvre') }})</span> ↗</a>
      <RouterLink v-if="competence" :to="versCompetence(competence.id)">{{ t('competence.lecteur.retour') }}</RouterLink>
    </p>

    <section aria-labelledby="h-texte">
      <h2 id="h-texte" class="sr-only">{{ t('competence.lecteur.texteDeLaPage') }}</h2>
      <p v-if="etat === 'chargement'" class="aide" role="status">{{ t('competence.lecteur.chargement') }}</p>
      <p v-else-if="etat === 'indisponible'" class="aide">{{ t('competence.lecteur.indisponible') }}</p>
      <pre v-else class="texte" :lang="LANGUE_SOURCE"><template v-for="(tr, i) in tranches" :key="i"><mark v-if="tr.surligne" :ref="marquer">{{ tr.texte }}</mark><template v-else>{{ tr.texte }}</template></template></pre>
    </section>

    <p class="credit">{{ t('competence.lecteur.sourceTexte', { texte: nomDeSource(langueAffichee, source) }) }}</p>

    <nav v-if="precedente || suivante" class="pas" :aria-label="t('competence.position.nav')">
      <RouterLink v-if="precedente" class="pas-lien" :to="versPage(precedente)" rel="prev"><span class="sens"><span aria-hidden="true">←</span> {{ t('competence.lecteur.precedente') }}</span><span>{{ t('programme.reference.page', { page: precedente }) }}</span></RouterLink>
      <RouterLink v-if="suivante" class="pas-lien suivante" :to="versPage(suivante)" rel="next"><span class="sens">{{ t('competence.lecteur.suivante') }} <span aria-hidden="true">→</span></span><span>{{ t('programme.reference.page', { page: suivante }) }}</span></RouterLink>
    </nav>

    <section v-if="autres.length" aria-labelledby="h-autres" class="autres">
      <h2 id="h-autres">{{ t('competence.lecteur.autres') }}</h2>
      <ul>
        <li v-for="k in autres" :key="k.id"><RouterLink :to="versPage(page, k.id)" :lang="LANGUE_SOURCE">{{ k.libelle }}</RouterLink></li>
      </ul>
    </section>
  </div>
  <div v-else class="container" data-page="texte-officiel">
    <h1 class="section-heading">{{ t('competence.inconnue.titre') }}</h1>
    <p><RouterLink to="/programme/officiel">{{ t('competence.inconnue.retour') }}</RouterLink></p>
  </div>
</template>

<script setup lang="ts">
import Icone from '../images/Icone.vue'
// Un passage d'un texte officiel, lu dans l'app (/programme/officiel/<texte>/<page>?competence=<id>) : le texte de la page du PDF
// (public/programmes/, extrait sans retouche), le passage de la compétence surligné (src/programme/ancres.ts), la page citée d'avant et
// d'après, les autres compétences de la page, le lien vers le PDF. Aucune requête hors du site. Non indexée (src/router/canonique.ts) : c'est le texte du PDF.
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { extraireParamsContexte } from '../contexte/url.ts'
import { SOURCES, competenceDe } from '../data/programme.ts'
import type { SourceId } from '../data/programme.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import BandeauConstruction from '../shell/BandeauConstruction.vue'
import FilAriane from '../shell/FilAriane.vue'
import type { Maillon } from '../shell/FilAriane.vue'
import { useTitreDePage } from '../router/titres.ts'
import { adresseCompetence } from '../programme/adresse.ts'
import { ANCRES } from '../programme/ancres.ts'
import { decouper, surligner, trouverPassage } from '../programme/lecteur.ts'
import { textesOfficiels } from '../programme/navigation.ts'
import { adresseDeLaPage, adresseDuTexteOfficiel, lectureDisponible } from '../programme/officiel.ts'
import { nomDeSource } from '../programme/references.ts'

const { t, langueAffichee } = useLangue()
const route = useRoute()

const source = computed(() => String(route.params.source) as SourceId)
const page = computed(() => Number(route.params.page))
const texte = computed(() => textesOfficiels().find(x => x.source === source.value) ?? null)
const pageCitee = computed(() => texte.value?.pages.find(p => p.page === page.value) ?? null)
const valide = computed(() => pageCitee.value !== null && lectureDisponible(source.value))
useTitreDePage(() => (valide.value ? t('competence.lecteur.titre', { page: t('programme.reference.page', { page: page.value }) }) : t('competence.inconnue.titre')))

const reportes = computed(() => extraireParamsContexte(route.query))
const competence = computed(() => competenceDe(String(route.query.competence ?? '')))
const versCompetence = (id: string): string => adresseCompetence(id, null, reportes.value)
const versPage = (p: number, idCompetence?: string): string => adresseDeLaPage(source.value, p, idCompetence)

// ── Le texte de la page, lu une fois sur le site ──
type Etat = 'chargement' | 'pret' | 'indisponible'
const etat = ref<Etat>('chargement')
const brut = ref('')

/** Le texte d'une page du PDF (public/programmes/<texte>/<page>.txt) ; un fichier absent répond par la page d'accueil du site : on le reconnaît. */
async function charger(): Promise<void> {
  etat.value = 'chargement'
  if (!valide.value) return
  try {
    const reponse = await fetch(`${import.meta.env.BASE_URL}programmes/${source.value}/${page.value}.txt`)
    const type = reponse.headers.get('content-type') ?? ''
    if (!reponse.ok || type.includes('html')) throw new Error('page absente')
    brut.value = await reponse.text()
    etat.value = 'pret'
  } catch {
    etat.value = 'indisponible'
  }
}
watch(() => `${source.value}/${page.value}`, charger, { immediate: true })

const decoupe = computed(() => decouper(brut.value))
const passage = computed(() => {
  const ancre = competence.value ? ANCRES[competence.value.id] : undefined
  return ancre ? trouverPassage(decoupe.value.mots, ancre) : null
})
const tranches = computed(() => surligner(decoupe.value.morceaux, passage.value))

// la page se pose sur le passage : on défile jusqu'au premier morceau surligné
const surligne: { premier: Element | null } = { premier: null }
const marquer = (el: unknown): void => { if (el instanceof Element && !surligne.premier) surligne.premier = el }
/** le premier morceau surligné rendu (lu après le rendu : le type ne peut pas le deviner) */
const premierMarque = (): Element | null => surligne.premier
watch(tranches, async () => {
  surligne.premier = null
  await nextTick()
  premierMarque()?.scrollIntoView({ block: 'center' })
})

// ── Autour de la page ──
const pages = computed(() => (texte.value?.pages ?? []).map(p => p.page))
const precedente = computed(() => pages.value[pages.value.indexOf(page.value) - 1] ?? null)
const suivante = computed(() => pages.value[pages.value.indexOf(page.value) + 1] ?? null)
const autres = computed(() => (pageCitee.value?.competences ?? []).filter(k => k.id !== competence.value?.id))
const urlPdf = computed(() => pageCitee.value?.url ?? '')

const maillons = computed((): Maillon[] => [
  { texte: t('competence.accueil'), vers: '/', icone: 'accueil' },
  { texte: t('competence.programme'), vers: '/programme', icone: 'programme' },
  { texte: t('competence.parcours.titre'), vers: `${adresseDuTexteOfficiel(source.value)}`, icone: 'programme' },
  { texte: t('programme.reference.page', { page: page.value }) },
])
</script>

<style scoped>
.container :deep(a:not(.classe):not(.case)) { color: var(--bleu-fort); }
.source { color: var(--texte-doux); margin: -.5rem 0 1rem; }
.passage { background: #fffbe0; border-left: 4px solid #e0b800; border-radius: 6px; padding: .6rem .8rem; margin-bottom: 1rem; }
.passage h2 { font-size: 1rem; margin-bottom: .2rem; }
.libelle { font-weight: 700; }
.aide { color: var(--texte-doux); }
.avertissement { font-size: .9rem; color: #555; background: #f3f3f3; border-radius: 6px; padding: .5rem .7rem; margin-bottom: .6rem; }
.actions { display: flex; flex-wrap: wrap; gap: .3rem 1.2rem; margin-bottom: 1rem; }
.actions a { display: inline-flex; align-items: center; min-height: 44px; font-weight: 700; }
.texte { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; line-height: 1.55; background: #fff; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1rem 1.1rem; max-width: 52rem; }
mark { background: #ffe066; color: inherit; border-radius: 3px; padding: .05em 0; }
.credit { margin-top: .8rem; font-size: .85rem; color: var(--texte-doux); }
.pas { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: .6rem; margin-top: 1rem; }
.pas-lien { display: grid; gap: .15rem; min-height: 44px; padding: .55rem .8rem; background: #fff; border-radius: 10px; box-shadow: var(--shadow); text-decoration: none; font-weight: 700; color: var(--bleu-fort); }
.pas-lien.suivante { text-align: right; }
.sens { font-size: .8rem; text-transform: uppercase; letter-spacing: .03em; color: var(--texte-doux); }
.autres { margin-top: 1.2rem; }
.autres h2 { font-size: 1.05rem; margin-bottom: .4rem; }
.autres ul { list-style: none; display: grid; gap: .25rem; }
.autres a { display: inline-flex; align-items: center; min-height: 44px; font-weight: 600; }
</style>

<template>
  <div class="container">
    <div class="legal-box">
      <h1 class="section-heading">{{ t('titre') }}</h1>

      <h2>{{ t('editeur') }}</h2>
      <p>{{ t('editeurTexte') }} Corentin Chary — ✉️ <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a></p>

      <h2>{{ t('hebergeur') }}</h2>
      <p>OVH SAS, 2 rue Kellermann, 59100 Roubaix, France — <a href="https://www.ovhcloud.com" target="_blank" rel="noopener">ovhcloud.com</a></p>

      <h2>{{ t('donnees') }}</h2>
      <ul>
        <li>{{ t('donnees1') }}</li>
        <li>{{ t('donnees2') }}</li>
        <li>{{ t('donnees3') }}</li>
        <li>{{ t('donnees4') }}</li>
        <li>{{ t('donnees5') }}</li>
      </ul>

      <h2>{{ t('contenus') }}</h2>
      <p>{{ t('contenusTexte') }}</p>
      <p>{{ t('polices') }} Playwrite FR Trad, Andika, OpenDyslexic (SIL Open Font License) ;
        Luciole © Laurent Bourcellier &amp; Jonathan Perez (CC BY 4.0).</p>

      <h2>{{ t('responsabilite') }}</h2>
      <p>{{ t('responsabiliteTexte') }}</p>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../i18n'
import { CONTACT } from '../site'

const { t } = useI18n({
  fr: {
    titre: '⚖️ Mentions légales et confidentialité',
    editeur: 'Éditeur', editeurTexte: 'Site personnel et non commercial, édité par',
    hebergeur: 'Hébergeur',
    donnees: 'Données personnelles et cookies',
    donnees1: 'Aucun compte, aucune publicité, aucun cookie, aucun service tiers.',
    donnees2: "La langue, les réglages des exercices et les scores sont enregistrés uniquement dans votre navigateur (stockage local, « localStorage ») ; ils ne sont jamais envoyés. Ce sont des préférences que vous choisissez vous-même : elles ne nécessitent pas de consentement (recommandations de la CNIL). Vous pouvez les effacer dans les Paramètres.",
    donnees3: "Si vous saisissez une clé API Mistral (facultatif), les demandes de génération de phrases sont envoyées directement de votre navigateur à Mistral AI.",
    donnees4: "Comme tout serveur web, l'hébergeur conserve des journaux techniques (adresse IP, page demandée) pendant une durée limitée, pour la sécurité du service.",
    donnees5: "Pour savoir quelles pages et quelles fiches sont utiles, le site envoie à notre serveur un signal anonyme : page visitée, fiche imprimée et ses réglages, langue. Ce signal n'est associé à aucun cookie, aucun identifiant ni adresse IP, et n'est pas envoyé si votre navigateur demande à ne pas être suivi (« Do Not Track »). Ces statistiques sont exemptées de consentement (recommandations de la CNIL).",
    contenus: 'Contenus',
    contenusTexte: "Les exercices et fiches sont gratuits pour un usage personnel et en classe. Le code source est disponible sur GitHub (github.com/iksaif/ecole-primaire).",
    polices: 'Polices :',
    responsabilite: 'Responsabilité',
    responsabiliteTexte: "Le site est réalisé par des parents, pas par des enseignants. Malgré le soin apporté, des erreurs peuvent subsister : signalez-les à l'adresse ci-dessus.",
  },
  // br: à relire par un brittophone
  br: {
    titre: '⚖️ Notennoù lezennel ha prevezded',
    editeur: 'Embanner', editeurTexte: "Lec'hienn bersonel ha n'eo ket kenwerzhel, embannet gant",
    hebergeur: 'Herberc\'hier',
    donnees: 'Roadennoù personel ha toupinoù',
    donnees1: 'Kont ebet, bruderezh ebet, toupin ebet, servij diavaez ebet.',
    donnees2: "Ar yezh, arventennoù ar poelladennoù hag ar skorioù a vez enrollet en ho merdeer hepken (« localStorage ») ; ne vezont morse kaset. Dibaboù a rit hoc'h-unan int : n'eus ket ezhomm a aotre. Gallout a rit o diverkañ en Arventennoù.",
    donnees3: "Ma lakait un alc'hwez API Mistral (dre zibab), e vez kaset ar goulennoù war-eeun eus ho merdeer da Mistral AI.",
    donnees4: "Evel pep servijer web, an herberc'hier a vir kazetennoù teknikel (chomlec'h IP, pajenn goulennet) e-pad ur mare bevennet, evit surentez ar servij.",
    donnees5: "Evit gouzout peseurt pajennoù ha fichennoù a zo talvoudus, al lec'hienn a gas d'hor servijer ur sinal dizanv : pajenn gweladennet, fichenn moullet hag he arventennoù, yezh. N'eo liammet ouzh toupin, anaouder pe chomlec'h IP ebet, ha ne vez ket kaset ma c'houlenn ho merdeer chom hep bezañ heuliet (« Do Not Track »).", // br: à relire
    contenus: 'Danvez',
    contenusTexte: "Digoust eo ar poelladennoù hag ar fichennoù evit un implij personel pe er c'hlas. Ar c'hod mammenn a zo war GitHub (github.com/iksaif/ecole-primaire).",
    polices: 'Nodrezhoù :',
    responsabilite: 'Atebegezh',
    responsabiliteTexte: "Graet eo bet al lec'hienn gant tadoù ha mammoù, ha n'eo ket gant kelennerien. Fazioù a c'hall chom : kemennit anezho d'ar chomlec'h a-us.",
  },
})
</script>

<style scoped>
.legal-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; max-width: 780px; margin: 0 auto; }
h2 { font-size: 1.1rem; margin: 1.5rem 0 .5rem; }
p, li { color: #444; line-height: 1.6; }
ul { padding-left: 1.25rem; }
</style>

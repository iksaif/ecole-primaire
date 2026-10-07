# Plan 03 — Surveillance : disponibilité, certificats, domaines

> **2026-10-04 : remplacé par Datadog**, configuré par l'utilisateur dans un autre agent. Ce plan ne sert plus
> que de liste de ce qu'il faut couvrir (disponibilité, certificats, expiration des domaines, erreurs 5xx,
> journaux nginx).

**But** : être prévenu avant une panne visible, un certificat expiré ou un domaine qui expire. Le
renouvellement automatique des domaines est **désactivé**, et pixelette.net / pixelette.art expirent le
30/11/2026.

## Étapes

1. **Disponibilité**, au choix :
   - **UptimeRobot** (gratuit, externe, le plus simple) : une sonde HTTPS toutes les 5 min sur
     `https://ecoleprimaire.app/`, `https://skoolik.app/` et `https://ecoleprimaire.app/telechargements/`, avec
     un mot-clé attendu dans la page (« École Primaire », « Skoolik ») et des alertes par mail
     (corentin.chary@gmail.com) ;
   - ou **Uptime Kuma** auto-hébergé, mais sur le même VPS il ne verrait pas une panne du VPS. À ne retenir
     que s'il tourne ailleurs (machine à la maison « rennes » ?).
   - **Recommandation** : UptimeRobot.
2. **Certificats** : certbot renouvelle tout seul (`certbot.timer`). UptimeRobot et les sondes SSL préviennent
   avant l'expiration. Ajouter un *hook* certbot `deploy` qui recharge nginx (vérifier
   `/etc/letsencrypt/renewal-hooks/deploy/`, vide aujourd'hui, alors que certbot en mode webroot ne recharge
   pas nginx tout seul).
3. **Domaines**, avec le script `scripts/expirations-domaines.mjs` :
   - il lit le jeton Gandi (`~/gandi`, sans jamais l'afficher) et appelle `GET /v5/domain/domains` ;
   - il signale les domaines qui expirent dans moins de 60 jours et ceux dont le renouvellement automatique
     est désactivé ;
   - il est lancé chaque semaine par cron sur ta machine, ou par une GitHub Action programmée, avec le jeton
     en secret, ce qui demande de l'y copier : à décider ;
   - il envoie un mail via le relais SMTP de Gandi ou une notification.
4. **Journaux nginx** : vérifier que logrotate couvre `/var/log/nginx/*.journal.log` (motif par défaut
   `/var/log/nginx/*.log`, à confirmer) et la durée de conservation (14 jours par défaut ; passer à 90 jours
   pour les statistiques ?).
5. **Alerte d'erreurs** : une fois par jour, `scripts/stats-vps.mjs` ou un petit script compte les codes 5xx
   dans `<domaine>.access.log` et prévient s'il y en a.

## Décisions à prendre

- UptimeRobot ou Uptime Kuma ?
- Où tourne le contrôle des domaines : ta machine (cron) ou GitHub (secret Gandi) ?
- Combien de temps garder le journal des statistiques ?

## Effort

1 à 2 heures.

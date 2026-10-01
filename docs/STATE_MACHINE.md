# 🚍 TRANSIGO — MACHINE D’ÉTATS OFFICIELLE & RÈGLES D'EXPIRATION GPS

## Source Unique de Vérité pour les Véhicules, Services, GPS et Disponibilité

Ce document spécifie la machine d’états officielle et centralisée de TRANSIGO. Aucun composant ni backend ne doit inventer ses propres statuts.

---

### 1. Les Dimensions d'États

| Dimension | Type | Description |
|---|---|---|
| `vehicleStatus` | `REGISTERED` \| `ACTIVE` \| `INACTIVE` \| `MAINTENANCE` \| `SUSPENDED` \| `RETIRED` | État administratif et technique du véhicule. |
| `serviceStatus` | `NOT_STARTED` \| `STARTING` \| `ACTIVE` \| `PAUSED` \| `ENDING` \| `COMPLETED` \| `CANCELLED` | État d'exploitation en cours par le chauffeur. |
| `gpsStatus` | `NO_DATA` \| `PERMISSION_REQUIRED` \| `LIVE` \| `RECENT` \| `STALE` \| `OFFLINE` \| `INVALID` | Fraîcheur et validité de la position GPS reçue. |
| `trackingStatus` | `TRACKABLE` \| `TEMPORARILY_UNTRACKABLE` \| `NOT_TRACKABLE` | Capacité réelle à suivre le véhicule sur la carte. |
| `availabilityStatus` | `AVAILABLE` \| `LIMITED` \| `UNAVAILABLE` \| `UNKNOWN` | Disponibilité pour la recherche de trajets passagers. |
| `effectiveStatus` | Code unique calculé | Identifiant d'état combiné officiel. |
| `displayStatus` | Chaîne affichée | Libellé utilisateur officiel et normalisé. |

---

### 2. Table de Décision Officielle

| vehicleStatus | serviceStatus | gpsStatus | trackingStatus | availabilityStatus | effectiveStatus | displayStatus |
|---|---|---|---|---|---|---|
| `ACTIVE` | `ACTIVE` | `LIVE` | `TRACKABLE` | `AVAILABLE` | `IN_SERVICE_LIVE` | 🟢 En service — GPS en direct |
| `ACTIVE` | `ACTIVE` | `RECENT` | `TRACKABLE` | `AVAILABLE` | `IN_SERVICE_RECENT` | 🟢 En service — position récente |
| `ACTIVE` | `ACTIVE` | `STALE` | `TEMPORARILY_UNTRACKABLE` | `LIMITED` | `IN_SERVICE_STALE` | 🟡 En service — dernière position connue |
| `ACTIVE` | `ACTIVE` | `OFFLINE` | `NOT_TRACKABLE` | `LIMITED` | `IN_SERVICE_NO_GPS` | ⚠️ En service — GPS indisponible |
| `ACTIVE` | `NOT_STARTED` | `LIVE` | `NOT_TRACKABLE` | `UNKNOWN` | `READY_NOT_STARTED` | ⚪ Service non démarré |
| `ACTIVE` | `STARTING` | `LIVE` | `TRACKABLE` | `LIMITED` | `SERVICE_STARTING` | 🟡 Démarrage du service |
| `ACTIVE` | `PAUSED` | `LIVE` | `TRACKABLE` | `LIMITED` | `SERVICE_PAUSED` | 🟡 Service en pause |
| `ACTIVE` | `ENDING` | `LIVE` | `TRACKABLE` | `LIMITED` | `SERVICE_ENDING` | 🟡 Fin du service |
| `ACTIVE` | `COMPLETED` | `LIVE` | `NOT_TRACKABLE` | `UNAVAILABLE` | `SERVICE_COMPLETED` | ⚪ Service terminé |
| `ACTIVE` | `CANCELLED` | `LIVE` | `NOT_TRACKABLE` | `UNAVAILABLE` | `SERVICE_CANCELLED` | ⛔ Service annulé |
| `MAINTENANCE` | ANY | ANY | `NOT_TRACKABLE` | `UNAVAILABLE` | `MAINTENANCE` | ⚙️ En maintenance |
| `SUSPENDED` | ANY | ANY | `NOT_TRACKABLE` | `UNAVAILABLE` | `SUSPENDED` | ⛔ Suspendu |
| `INACTIVE` | ANY | ANY | `NOT_TRACKABLE` | `UNAVAILABLE` | `INACTIVE` | ⚪ Inactif |
| `RETIRED` | ANY | ANY | `NOT_TRACKABLE` | `UNAVAILABLE` | `RETIRED` | ⚪ Retiré du service |

---

### 3. Règles d'Expiration GPS (Seuils Configurables)

* **LIVE (0 à 15s) :** `lastGpsUpdate <= 15s` → ETA garantie, suivi temps réel actif.
* **RECENT (15 à 60s) :** `15s < lastGpsUpdate <= 60s` → ETA calculable avec prudence, libellé *« Position récente »* (jamais *« GPS en direct »*).
* **STALE (60s à 5 min) :** `60s < lastGpsUpdate <= 300s` → ETA masquée ou non garantie, marqueur jaune d'avertissement.
* **OFFLINE (> 5 min) :** `lastGpsUpdate > 300s` → Marqueur grisé, suivi désactivé.

---

### 4. Règle Fondamentale de Priorité

> **Le GPS ne peut jamais rendre disponible un véhicule qui ne l'est pas administrativement ou opérationnellement.**

1. `AUTHORIZATION`
2. `vehicleStatus`
3. `serviceStatus`
4. `GPS VALIDITY`
5. `GPS FRESHNESS`
6. `trackingStatus`
7. `availabilityStatus`
8. `effectiveStatus`
9. `displayStatus`
10. `canCalculateEta`

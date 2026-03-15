---
name: atyspro-context
description: >
  Contexte complet du projet AtysPro — SaaS B2B mobile/web pour artisans indépendants (cible initiale : électriciens).
  Charge automatiquement l'architecture technique, les règles métier, le schéma Supabase, les conventions de code,
  et les prochaines étapes. À utiliser SYSTÉMATIQUEMENT dès qu'une session concerne AtysPro, le backend Next.js,
  l'app Expo/React Native, les webhooks Twilio, les leads, le scoring, ou toute tâche de développement sur ce projet.
  Ne jamais démarrer une session AtysPro sans avoir chargé ce skill.
---

# AtysPro — Contexte IA Complet

> Injecter ce fichier au début de chaque session. Contient tout ce qu'il faut pour être immédiatement opérationnel sans ré-explication.

---

## 1. Vision produit

**AtysPro** est "le téléphone intelligent des indépendants" — un assistant de gestion de leads pour artisans français. Cible initiale : électriciens. Extension prévue : plombiers, menuisiers, et autres corps de métier.

**Proposition de valeur** : zéro lead perdu quand l'artisan est en intervention. Priorisation automatique par urgence et valeur estimée du chantier.

**Flux complet (appel manqué → lead scoré) :**
1. Client appelle → artisan ne décroche pas
2. AtysPro joue un message vocal TwiML demandant une réponse par SMS
3. SMS de qualification automatique envoyé au client
4. Réponse parsée : type de prestation, délai, adresse, nom
5. Score de priorité calculé (0-100) + estimation de valeur
6. Lead créé/mis à jour en base Supabase
7. Si réponse inexploitable → relance de correction (max 2)
8. L'artisan consulte ses leads triés par score depuis l'app mobile

**Modèle de pricing** :
- Abonnement mensuel par artisan (individuel)
- Remise si paiement annuel ou engagement 12 mois
- Plan premium prévu (fonctionnalités avancées — à définir)
- Phase actuelle : beta testeurs en cours de recrutement (pas encore lancé)

**Roadmap produit connue** : relances automatisées temporisées, onboarding mobile, numéro Twilio FR par account, agenda, facturation, dashboard web avancé, support multi-métiers, plan premium.

---

## 2. Stack technique

### Backend (`atyspro-backend/`)
| Technologie | Version |
|---|---|
| Next.js (App Router) | 16.1.6 |
| React | 19.2.3 |
| TypeScript | ^5 |
| Tailwind CSS | ^4.2.0 |
| @supabase/supabase-js | ^2.93.3 |
| twilio SDK | ^5.12.2 |
| ESLint | ^9 |

**Déployé sur** : Vercel → `https://atyspro-backend.vercel.app`

### Mobile (`atyspro-mobile/`)
| Technologie | Version |
|---|---|
| Expo | ~54.0.33 |
| React Native | 0.81.5 |
| expo-router | ~6.0.23 |
| TypeScript | ~5.9.2 |
| expo-secure-store | ~15.0.8 |
| react-native-reanimated | ~4.1.1 |
| @react-navigation/bottom-tabs | ^7.4.0 |

---

## 3. Architecture backend

```
atyspro-backend/src/
├── app/api/
│   ├── auth/         login, signup, logout, me, onboarding, callback, forgot-password
│   ├── leads/        GET liste paginée, GET/PATCH [id]
│   ├── webhooks/twilio/
│   │   ├── sms/      POST — webhook SMS Twilio
│   │   └── voice/    POST — webhook Voix Twilio
│   └── dev/          seed, simulate/sms (dev uniquement)
├── modules/          Logique métier par domaine
│   ├── leads/        leads.service.ts + leads.types.ts
│   ├── twilio/       twilio.service.ts + twilio.types.ts
│   ├── dev/          dev.service.ts
│   └── health/       health.service.ts
├── lib/
│   ├── supabase.ts         3 clients (voir §Clients Supabase)
│   ├── auth.ts             getAuthUser, requireAuth
│   ├── leadParsing.ts      parseSms, normalizeBody
│   ├── leadScoring.ts      computeScore
│   ├── twilioClient.ts     sendSMS, validateTwilioSignature
│   ├── smsTemplates.ts     QUALIFICATION_SMS, RELANCE_*_SMS
│   └── utils.ts            ApiError, isValidUuid
└── types/
    ├── lead.ts             Lead interface, formatType, formatDelay
    └── global.types.ts     ApiError interface, ApiSuccess<T>
```

### Pattern routes API
Les routes `app/api/` sont **fines** : validation entrées → appel service → `NextResponse.json()`.
La logique métier est **exclusivement dans `src/modules/<domain>/<domain>.service.ts`**.

**Format de réponse unifié :**
```json
{ "success": true, "data": ..., "message": "..." }   // Succès
{ "success": false, "error": "message lisible" }       // Erreur
{ "ok": true/false, ... }                              // Webhooks Twilio uniquement
```

### Clients Supabase (3 instances — ne pas mélanger)
```typescript
supabase                    // anon key — rétrocompat uniquement
supabaseAdmin               // service_role — bypass RLS — webhooks + admin
createSupabaseClient(token) // anon key + JWT user — RLS enforced par utilisateur
```
- **Endpoints API authentifiés** → `createSupabaseClient(token)` obligatoire
- **Webhooks Twilio** → `supabaseAdmin` (pas de JWT utilisateur)
- **Seed / health** → `supabaseAdmin`

### Authentification backend
```typescript
getAuthUser(req)  // → AuthContext | null
requireAuth(req)  // → AuthContext  (throw ApiError 401 si non auth)

interface AuthContext {
  user: { id: string; email: string }
  account_id: string
  token: string  // JWT brut pour createSupabaseClient
}
```
JWT lu depuis : `Authorization: Bearer <token>` (mobile) ou cookie `sb-access-token` (web).

---

## 4. Architecture mobile

```
atyspro-mobile/
├── app/                   Expo Router — wrappers purs uniquement (max 10 lignes)
│   ├── (tabs)/            index→Leads, dialer→Dialer, settings→Settings
│   ├── lead/[id].tsx      → LeadDetailScreen
│   ├── login.tsx / signup.tsx
│   └── _layout.tsx        → RootNavigator
└── src/
    ├── navigation/        RootNavigator, MainTabNavigator
    ├── screens/           Auth/, Leads/, Dialer/, Settings/
    ├── contexts/          AuthContext, BusinessContext
    ├── services/          api.ts, auth.service.ts, leads.service.ts
    ├── components/        common/, dialer/, layout/, leads/
    ├── constants/         colors.ts, theme.ts
    └── utils/             format.ts
```

**Flux auth mobile :**
1. Startup → `getStoredToken()` → `fetchMe(token)` → si valide, `isAuthenticated = true`
2. Login → token stocké dans `expo-secure-store` clé `sb-access-token`
3. Toutes les requêtes → `api.ts` injecte `Authorization: Bearer` automatiquement

---

## 5. Règles métier

### Codes de qualification SMS

| `type_code` | Libellé | Points | `value_estimate` |
|---|---|---|---|
| 1 | Dépannage | 25 | medium |
| 2 | Installation | 20 | medium |
| 3 | Devis | 15 | high |
| 4 | Autre | 10 | low |
| null | Non renseigné | 0 | null |

| `delay_code` | Libellé | Points |
|---|---|---|
| 1 | Aujourd'hui (urgent) | 50 |
| 2 | 48h | 35 |
| 3 | Cette semaine | 20 |
| 4 | Pas pressé / flexible | 10 |
| null | Non renseigné | 0 |

### Formule de scoring
```
priority_score = min(delayPoints + typePoints, 100)
```
Exemples : Dépannage urgent (1/1) → **75** | Devis 48h (3/2) → **50** | Tout inconnu → **0**

### Statuts de lead
| Statut | Condition |
|---|---|
| `complete` | type_code + delay_code + address présents |
| `incomplete` | type_code OU delay_code présent, adresse manquante |
| `needs_review` | Aucune info exploitable OU 2 relances épuisées |

### Parsing SMS
Format attendu (séparateurs `/`, `;`, ou `|`) :
```
<type_code> / <delay_code> / <adresse> / <nom prénom> / <description>
```
- `parseSms()` détecte le séparateur, extrait les champs, corrige inversions nom↔adresse
- `isReponseExploitable()` → `type_code != null || delay_code != null || has_separator`

### Flux SMS webhook (règles critiques)
1. Valider signature Twilio (prod uniquement)
2. Résoudre `account_id` via `phone_numbers.e164 = To`
3. Parser → scorer → upsert lead si exploitable
4. Si inexploitable ET `relance_count < 2` → envoyer `RELANCE_CORRECTION_SMS` + incrémenter
5. Si inexploitable ET `relance_count >= 2` → `status = "needs_review"`, plus de relance

### SMS Templates — NE PAS MODIFIER sans validation produit
- `QUALIFICATION_SMS` — après chaque appel manqué
- `RELANCE_CORRECTION_SMS` — si réponse inexploitable (max 2)
- `RELANCE_1_SMS` — 10-15 min sans réponse (**TODO: pas encore automatique**)
- `RELANCE_2_SMS` — 3h sans réponse (**TODO: pas encore implémenté**)

---

## 6. Schéma Supabase

### Tables principales
- **`accounts`** : id, user_id, name, email, owner_phone, city, specialty, onboarding_completed
- **`phone_numbers`** : id, account_id, e164 (UNIQUE), active
- **`leads`** : id, account_id, status, client_phone, full_name, type_code, delay_code, priority_score, value_estimate, address, description, raw_message, relance_count, last_inbound_sms_at
  - ⚠️ Champs legacy encore présents : `contact_name`, `phone`, `score`, `urgency` → toujours lire `full_name || contact_name`, `client_phone || phone`, `priority_score || score`
- **`calls`** : id, account_id, twilio_call_sid (UNIQUE), direction, from_number, to_number, status, started_at, ended_at
- **`sms_messages`** : id, account_id, from_number, to_number, direction, body, twilio_message_sid

### RLS
RLS actif sur toutes les tables. `supabaseAdmin` bypass tout. `createSupabaseClient(token)` applique les policies par `auth.uid()`.

### Migrations (appliquer dans l'ordre)
1. `src/db/migrations/001_auth.sql` — user_id + RLS
2. `src/db/migrations/002_onboarding.sql` — owner_phone, city, specialty, onboarding_completed

---

## 7. Variables d'environnement

### Backend (`atyspro-backend/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WEBHOOK_BASE_URL        # URL publique backend (validation signature Twilio)
NODE_ENV                       # 'development' désactive validation Twilio
```

### Mobile (`atyspro-mobile/.env`)
```
EXPO_PUBLIC_BACKEND_URL        # http://192.168.x.x:3000 (local) ou https://atyspro-backend.vercel.app
```

---

## 8. Design system

```typescript
// src/constants/colors.ts
atysBlue:    '#2563eb'   // CTA principal
atysViolet:  '#7c3aed'   // gradient secondaire
atysYellow:  '#fbbf24'   // accent
atysSuccess: '#10b981'   // bouton "Appeler"
atysDanger:  '#ef4444'   // urgent / erreur

// src/constants/theme.ts
spacing:      { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }
borderRadius: { sm: 8, md: 12, lg: 16, xl: 24 }
touchTargets: { android: 48, ios: 44 }  // minHeight obligatoire
```

---

## 9. Conventions de code

### Règles absolues backend
- Routes API fines : validation → service → réponse. **Zéro logique métier dans les routes.**
- Erreurs via `throw new ApiError(message, status)` dans les services.
- Pattern catch uniforme :
  ```typescript
  if (error instanceof ApiError) return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Erreur inconnue" }, { status: 500 });
  ```
- Alias `@/` = `src/` (tsconfig paths).
- JSDoc en français sur les fonctions publiques.

### Règles absolues mobile
- Fichiers `app/` = wrappers purs max 10 lignes, importent depuis `src/screens/`
- Toutes les requêtes HTTP via `src/services/api.ts` — jamais de `fetch()` direct
- Styles via `StyleSheet.create()` uniquement — pas de styles inline
- Couleurs depuis `colors.ts`, spacing depuis `theme.ts` — jamais de valeurs en dur
- `Pressable` préféré à `TouchableOpacity` + toujours `accessibilityLabel` + `accessibilityRole`
- Noms fichiers : `PascalCaseScreen.tsx` (screens) / `PascalCase.tsx` (composants)

### Règles communes
- **TypeScript strict — pas de `any`**
- Pas de magic strings pour les statuts → utiliser types `LeadStatus`
- UUIDs validés via `isValidUuid()` avant toute requête DB
- Langue du code : anglais. UI et commentaires : français.

---

## 10. Ce qu'il ne faut JAMAIS faire

1. **Ne jamais utiliser `supabaseAdmin` dans les endpoints API authentifiés** → utiliser `createSupabaseClient(token)`
2. **Ne jamais bypasser la validation de signature Twilio en production** (désactivée uniquement en `development`)
3. **Ne jamais modifier les SMS templates** sans validation produit — specs figées
4. **Ne jamais faire de `fetch()` direct dans les screens mobile** — passer par `api.ts`
5. **Ne jamais mettre de logique métier dans `app/api/`** — tout dans `modules/<domain>/<domain>.service.ts`
6. **Ne jamais ignorer `relance_count`** — plafond à 2 relances, règle anti-spam critique
7. **Ne jamais laisser `supabaseAdmin` null silencieusement** — toujours vérifier et retourner 500 explicite
8. **Ne pas créer de fichiers `app/` avec de la logique** — wrappers purs uniquement
9. **Ne jamais stocker le JWT autrement que via `expo-secure-store`** sur mobile
10. **Ne jamais mélanger les champs legacy et nouveaux** sans lire les deux (`full_name || contact_name`, etc.)

---

## 11. Prochaines étapes connues

1. **Relances automatiques temporisées** — templates `RELANCE_1_SMS` (10-15 min) et `RELANCE_2_SMS` (3h) existent mais non déclenchés automatiquement → implémentation recommandée : **Supabase Edge Functions + pg_cron** (gratuit dans le plan actuel, pas d'infra supplémentaire)
2. **Onboarding mobile** — endpoint `PATCH /api/auth/onboarding` existe, écran mobile manquant
3. **`BusinessContext` dynamique** — `businessType` hardcodé `'electrician'` → lire depuis `account.specialty`
4. **Numéro Twilio FR** — compte Twilio actif mais pas encore de numéro français acheté → à acquérir. Ensuite, l'assigner à l'account via onboarding plutôt qu'en dur dans le seed
5. **Pagination mobile** — `fetchLeads()` récupère tout → implémenter `page`/`limit`
6. **Dashboard web** — pages `src/app/dashboard/` basiques → à développer
7. **Gestion multi-comptes** — architecture prête (account_id + RLS) mais UI admin absente
8. **Support multi-métiers** — `specialty` en base prêt → UI à construire

---

## 12. Contexte équipe & workflow

**Équipe** : Mathieu (dev solo pour l'instant) + 1 co-fondateur (missions non-dev : démarche beta testeurs, CGU/CGV, pricing, communication).

**Git workflow recommandé** : une branche par feature (`feature/twilio-real`, `feature/relances-auto`, etc.), merge sur `main` quand stable. Éviter de pusher directement sur `main` dès qu'il y a des utilisateurs en prod.

**Tests** : pas encore de tests automatisés (unit/e2e). À prévoir avant la mise en prod avec de vrais clients pour éviter les régressions sur le parsing SMS et le scoring.

**Déploiement** : Backend auto-déployé sur Vercel à chaque push sur `main`. Tester sur une branche preview Vercel avant de merger.

```bash
# Backend
cd atyspro-backend
npm run dev          # http://localhost:3000
npm run build        # Build prod + check TypeScript
npm run lint

# Mobile
cd atyspro-mobile
npm start            # Expo dev server
npm run android      # Émulateur Android
npm run ios          # Simulator iOS

# Tests webhooks en local (ngrok)
ngrok http 3000
# Configurer Twilio → https://<ngrok-id>.ngrok.io/api/webhooks/twilio/sms

# Simulation SMS (dev)
curl -X POST http://localhost:3000/api/dev/simulate/sms \
  -H "Content-Type: application/json" \
  -d '{"to": "+33612345678", "from": "+33698765432", "body": "1 / 2 / 15 rue de la Paix 75002 / Jean Dupont"}'

# Seed données de test
curl -X POST http://localhost:3000/api/dev/seed
```

---

## 13. Points d'intégration critiques

### Twilio ↔ Backend
- **Voice webhook** : `https://atyspro-backend.vercel.app/api/webhooks/twilio/voice`
- **SMS webhook** : `https://atyspro-backend.vercel.app/api/webhooks/twilio/sms`
- Twilio envoie du `multipart/form-data` → toujours lire via `req.formData()` (pas `req.json()`)
- Déduplication SMS : fenêtre 5 minutes pour éviter double-envoi

### Mobile ↔ Backend
- Auth : `Authorization: Bearer <jwt>` sur chaque requête
- JWT valide 7 jours — pas de refresh token côté mobile → si expiré, logout + redirect login

### Déploiement
- Backend : git push sur `main` → deploy Vercel automatique
- Variables d'env à configurer dans dashboard Vercel (jamais dans le repo)

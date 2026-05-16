# AtysPro Mobile — Contexte Claude Code

> Fichier lu par Claude Code à l'ouverture de ce repo. Pour le contexte global, voir `../CLAUDE.md`.

## 🎯 Rôle du mobile

App PWA (Expo + React Native) destinée aux **artisans** pour consulter leurs leads et gérer leurs interventions.

- **Strategy** : PWA-first pour la bêta (zéro friction, pas d'approbation store)
- **Native build** : reporté jusqu'au product-market fit
- **Hosting** : Vercel (build via `npx expo export --platform web`)

## 🏗️ Stack

| Composant | Tech | Version |
|---|---|---|
| Framework | Expo SDK | ~54 |
| React Native | core | 0.81 |
| Router | expo-router | latest |
| Language | TypeScript strict | — |
| Fonts | `@expo-google-fonts/plus-jakarta-sans` | latest |
| State | React Context + hooks (no Redux) | — |
| API client | `src/services/api.ts` wrapper | — |
| Auth storage | `expo-secure-store` | — |

## 🗺️ Navigation (expo-router)

```
Root (auth gate)
├── (unauthenticated) → /auth/login ou /auth/signup
└── (authenticated)
    ├── (tabs)
    │   ├── index (Accueil)        — Home avec KPIs
    │   ├── demandes (Demandes)    — Liste leads
    │   └── appels (Appels)        — Clavier + historique
    └── Stack
        ├── /lead/[id]             — Détail demande
        ├── /account               — Mon compte
        └── /notifications         — Notifications
```

**BottomNav** : fond navy `#0D1B38`, 3 onglets, icône + label.
- Actif : fill `rgba(26,86,219,0.15)` + texte primary
- Inactif : `rgba(255,255,255,0.45)`

**Header** : navy sur tab pages, blanc avec flèche retour sur stack pages.

## 🔐 Auth flow

```
1. App boot → AuthContext check expo-secure-store
2. Token valide → GET /api/me → fetch user + account
3. Pas de token → /auth/login
4. Login → POST /api/auth/login → store token → fetch /me
5. Logout → clear token + state → /auth/login
```

**Token** : stocké dans `expo-secure-store` (encrypté natif, fallback localStorage en PWA).
**Header** : `Authorization: Bearer <token>` injecté par `src/services/api.ts`.

⚠️ **Règle critique** : JAMAIS de `fetch()` brut dans les screens. Toujours via `src/services/api.ts`.

## 🗄️ Lead Status (strict post-migration 014)

`lead_status` est un ENUM Postgres avec EXACTEMENT 3 valeurs :

```typescript
type LeadStatus = 'a_traiter' | 'incomplet' | 'traite';

const STATUS_LABELS: Record<LeadStatus, string> = {
  a_traiter: 'À traiter',
  incomplet: 'Incomplet',
  traite: 'Traité',
};

const STATUS_COLORS: Record<LeadStatus, string> = {
  a_traiter: '#D97706',   // orange / warning
  incomplet: '#FDE68A',   // yellow border
  traite: '#16A34A',      // green / success
};
```

**JAMAIS de `nouveau`** stocké en DB. Le badge "Nouveau" est calculé UI depuis `created_at < now - 24h`.

PATCH `/api/leads/[id]` accepte UNIQUEMENT 3 champs (`ALLOWED_FIELDS` strict sprint 0.6) :
- `status`
- `full_name`
- `address`

Tout autre champ envoyé est silencieusement ignoré.

## 📋 Lead fields (post-migration 014)

```typescript
interface Lead {
  id: string;
  created_at: string;
  account_id: string;
  status: LeadStatus;
  client_phone: string;
  full_name: string | null;
  type_code: 1 | 2 | 3 | 4 | 5 | null;
  delay_code: 1 | 2 | 3 | 4 | null;
  priority_score: number;             // 0-100
  value_estimate: string | null;
  address: string | null;
  description: string | null;
  raw_message: string | null;
  relance_count: number;
  twilio_call_sid: string | null;
  danger_level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  scope: 'small' | 'medium' | 'large';
  availability_notes: string | null;   // sprint 1.D — callback_window de Maya
  parsing_confidence: number | null;
  reminder_sent_at: string | null;
  source: 'voice' | 'sms';
  call_transcript: string | null;      // sprint 2 (pending) — transcript complet
}
```

### ⛔ Champs legacy à NE PAS utiliser (supprimés migration 014)

```
contact_name   → utilise full_name
phone          → utilise client_phone
score          → utilise priority_score
request_text   → utilise description
job_type       → utilise type_code
urgency        → utilise delay_code
is_dangerous   → utilise danger_level
estimated_scope → utilise scope
logement_type  → supprimé entièrement
callback_delay → seulement sur accounts, plus sur leads
```

## 🎨 Score Display

`priority_score` (0-100) affiché en cercle coloré :

| Seuil | Couleur | Taille |
|---|---|---|
| ≥ 70 | Rouge `#DC2626` | 64px (détail), 40px (liste) |
| 40-69 | Orange `#D97706` | Idem |
| < 40 | Gris `#9CA3AF` | Idem |

⚠️ Lire `priority_score`, pas `score` (legacy supprimé).

## 📱 Screens (post-sprints 0-1)

### HomeScreen (`app/(tabs)/index.tsx`)
- Greeting "Bonjour, [first_name]"
- 3 KPI cards (border top colorée)
- Mini bar chart : demandes par jour 7 derniers jours

### LeadsScreen (`app/(tabs)/demandes.tsx`)
- Search bar (debounce 300ms)
- Filter chips : Tous / À traiter / Traité / Incomplet
- Sort : Score ↑↓ / Date ↑↓
- `SwipeableLeadCard` : swipe gauche → PATCH `status='traite'` (optimistic UI)
- Pagination : 10/page, infinite scroll

### CallsScreen (`app/(tabs)/appels.tsx`)
- Segmented Clavier / Historique
- Clavier : keypad 3×4 + bouton Appeler gradient vert
- Historique : 3 KPI pills + liste cliquable → bottom sheet avec transcription

### LeadDetailScreen (`app/lead/[id].tsx`)
- Header "Détail demande" (PAS "Détail lead")
- **PAS d'ID** sous le nom
- Score cercle 64px coloré
- Téléphone formaté `+33 6 16 38 83 56`
- Adresse éditable (PATCH on blur)
- **Fenêtre de rappel** (sprint 1.D) : si `availability_notes` non vide, affiche-la sous l'adresse
- "Transcription de l'appel" en carte séparée
- Actions : Appeler (gradient vert) / WhatsApp (SOON) / Maps
- Statut : 3 boutons `À traiter / Incomplet / Traité ✓`

### AccountScreen (`app/account.tsx`)
- Onglet **Profil** : `first_name`, `last_name`, `company_name`, email, `city`, `specialty`
- **⚠️ JAMAIS afficher le champ `name`** (legacy)
- Onglet **Paramètres** : `pro_phone`, ID court `#xxxxxxxx`, message accueil Maya, nom assistant, seuil score slider, délai rappel

## 🔤 Fonts (CRITIQUE — pattern RN)

```typescript
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_700Bold,
  // ...
} from '@expo-google-fonts/plus-jakarta-sans';

// ✅ CORRECT — fontFamily uniquement
<Text style={{ fontFamily: 'PlusJakartaSans_700Bold', fontSize: 16 }}>...</Text>

// ❌ FAUX — fontWeight ne se combine pas avec fontFamily en RN
<Text style={{ fontFamily: 'PlusJakartaSans_400Regular', fontWeight: 'bold' }}>...</Text>
```

Chargement dans root `_layout.tsx` avant render. Splash jusqu'à loaded.

## 🎨 Design tokens (depuis ../backend/globals.css)

| Variable | Valeur | Usage |
|---|---|---|
| `--ap-primary` | `#1A56DB` | CTA, links, active |
| `--ap-navy` | `#0D1B38` | BottomNav, header dark |
| `--ap-bg` | `#F0F2F7` | Page bg |
| `--ap-white` | `#FFFFFF` | Cards |
| `--ap-danger` | `#DC2626` | Urgent leads, errors |
| `--ap-success` | `#16A34A` | "Appeler", positives |
| `--ap-warning` | `#D97706` | Status incomplet |

Mirror dans `src/theme/tokens.ts`.

## 🎯 Patterns RN courants

### Optimistic updates (PATCH lead status)

```typescript
const handleMarkTraite = async (leadId: string) => {
  // 1. Update local immédiat
  setLeads(prev => prev.map(l =>
    l.id === leadId ? { ...l, status: 'traite' } : l
  ));

  // 2. API call background
  try {
    await patchLead(leadId, { status: 'traite' });
  } catch (error) {
    // 3. Revert si fail
    setLeads(prev => prev.map(l =>
      l.id === leadId ? { ...l, status: 'a_traiter' } : l
    ));
    showToast("Échec de la mise à jour");
  }
};
```

### Pull-to-refresh

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await fetchLeads();
  setRefreshing(false);
};

<FlatList
  refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1A56DB" />}
/>
```

### Listes longues

- Toujours `FlatList`, jamais `ScrollView` + `.map()` pour > 10 items
- `keyExtractor` returns string (use `id`)
- `ItemSeparatorComponent` pour dividers

### Touch targets

- Min 48×48 Android, 44×44 iOS
- `hitSlop` pour icônes seules plus petites

## 🚫 Anti-patterns mobile-specific

- ❌ `fetch()` brut dans les screens → toujours `src/services/api.ts`
- ❌ `fontWeight` + `fontFamily` combinés → utiliser variant correcte
- ❌ Couleurs hardcodées → `theme/tokens.ts`
- ❌ `ScrollView` + map pour listes longues → `FlatList`
- ❌ `AsyncStorage` pour data sensible → `expo-secure-store`
- ❌ Afficher IDs aux utilisateurs (sauf `pro_phone` + short ID dans Compte → Paramètres)
- ❌ Messages d'erreur en anglais → toujours français
- ❌ Référencer champs legacy (`score`, `contact_name`, etc.)
- ❌ Stocker `nouveau` comme statut → calculé UI depuis `created_at`

## 🚀 Build & deploy

```bash
# Dev
npm start

# Web build (PWA)
npx expo export --platform web
# Output : dist/

# Native (futur)
eas build --platform android
eas build --platform ios
```

Vercel auto-deploy depuis `main` → `dist/`.

## 🌐 Env vars

```
EXPO_PUBLIC_BACKEND_URL    # default: https://atyspro-backend.vercel.app
```

## 📋 Checklist avant push

- [ ] Build web passe (`npx expo export --platform web`)
- [ ] Pas de référence aux champs legacy
- [ ] Pas de `fetch()` brut, tout via `src/services/`
- [ ] Fonts utilisent `fontFamily` (pas `fontWeight`)
- [ ] Touch targets ≥ 48×48
- [ ] UI 100% français
- [ ] TypeScript strict, pas de `any`

## 🔗 Liens utiles

- Repo : `Nayrax99/Atyspro-Mobile`
- Backend API : `https://atyspro-backend.vercel.app`

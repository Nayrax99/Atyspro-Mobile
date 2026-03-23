# Post-Demo Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les bugs de statuts, scoring, UX et données de test identifiés lors de la démo associé.

**Architecture:** Le plan est séquencé par priorité. La migration des statuts (P1) est critique et doit être faite EN PREMIER car tout le reste en dépend. Chaque tâche est indépendante une fois P1 terminé.

**Tech Stack:** Next.js 16 (inline styles), Expo 54 / React Native, Supabase, TypeScript

---

## Contexte important

Le codebase présente un problème majeur : **les statuts sont incohérents entre les couches**.

| Couche | Valeurs actuelles |
|---|---|
| Backend types (`src/types/lead.ts`) | `"new" \| "incomplete" \| "to_process" \| "processed"` |
| `leadParsing.ts` (retour `lead_status`) | `"new" \| "incomplete" \| "to_process"` |
| Mobile `leads.service.ts` | `'complete' \| 'incomplete' \| 'needs_review'` ← **complètement faux** |
| Mobile `LeadDetailScreen` `STATUS_BUTTONS` | `'needs_review', 'incomplete', 'complete'` ← **faux** |
| Mobile `LeadsScreen` `filterByStatus` | mappe `'complete'` → `lead.status === 'complete'` ← **faux** |

**Après migration :** toutes les couches utiliseront `nouveau | a_traiter | incomplet | traite`.

---

## Task 1: Migration SQL (P1 — à faire manuellement dans Supabase SQL Editor)

**Files:**
- Create: `atyspro-backend/src/db/migrations/004_rename_lead_statuses.sql`

> ⚠️ Ce script SQL doit être copié dans le SQL Editor Supabase et exécuté manuellement. Il ne peut pas être exécuté via l'app.

- [ ] **Step 1: Créer le fichier de migration**

Créer `atyspro-backend/src/db/migrations/004_rename_lead_statuses.sql` :

```sql
-- Migration 004: Rename lead statuses to French slugs (no accents)
-- Run manually in Supabase SQL Editor

-- 1. Add new ENUM values (if status column is ENUM type)
-- If it's a TEXT column with CHECK constraint, skip to step 2

-- 2. Rename existing values in the leads table
UPDATE leads SET status = 'nouveau'   WHERE status = 'new';
UPDATE leads SET status = 'a_traiter' WHERE status = 'to_process';
UPDATE leads SET status = 'incomplet' WHERE status = 'incomplete';
UPDATE leads SET status = 'traite'    WHERE status = 'processed';

-- 3. Rename values that the old mobile code may have written
UPDATE leads SET status = 'a_traiter' WHERE status = 'needs_review';
UPDATE leads SET status = 'traite'    WHERE status = 'complete';

-- 4. Verify (should return 0 rows)
SELECT id, status FROM leads
WHERE status NOT IN ('nouveau', 'a_traiter', 'incomplet', 'traite');
```

- [ ] **Step 2: Exécuter dans Supabase SQL Editor**

Copier et exécuter le contenu du fichier dans le Supabase SQL Editor. Vérifier que la requête de vérification retourne 0 lignes.

- [ ] **Step 3: Commit**

```bash
git add atyspro-backend/src/db/migrations/004_rename_lead_statuses.sql
git commit -m "chore: add migration 004 - rename lead statuses to French slugs"
```

---

## Task 2: Mise à jour du backend — types et logique (P1)

**Files:**
- Modify: `atyspro-backend/src/types/lead.ts`
- Modify: `atyspro-backend/src/lib/leadParsing.ts`
- Modify: `atyspro-backend/src/modules/twilio/twilio.service.ts`
- Modify: `atyspro-backend/src/modules/dev/dev.service.ts`
- Modify: `atyspro-backend/src/app/dashboard/page.tsx`
- Modify: `atyspro-backend/src/app/dashboard/leads/[id]/page.tsx`

### 2a — `src/types/lead.ts`

- [ ] **Step 1: Mettre à jour `LeadStatus`**

Dans `atyspro-backend/src/types/lead.ts`, remplacer :

```typescript
export type LeadStatus = "new" | "incomplete" | "to_process" | "processed";
```
par :
```typescript
export type LeadStatus = "nouveau" | "incomplet" | "a_traiter" | "traite";
```

- [ ] **Step 2: Mettre à jour `LEAD_STATUS_LABELS`**

Remplacer :
```typescript
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Nouveau",
  incomplete: "Incomplet",
  to_process: "À traiter",
  processed: "Traité",
};
```
par :
```typescript
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  nouveau:   "Nouveau",
  incomplet: "Incomplet",
  a_traiter: "À traiter",
  traite:    "Traité",
};
```

### 2b — `src/lib/leadParsing.ts`

- [ ] **Step 3: Mettre à jour les types de retour de `parseSms`**

Dans la signature de retour et dans les assignations `lead_status`, remplacer :

```typescript
// Signature de retour :
lead_status: "new" | "incomplete" | "to_process";

// Valeurs assignées :
let lead_status: "new" | "incomplete" | "to_process" = "to_process";
// ...
if (type_code && delay_code && address) {
  lead_status = "new";        // → "nouveau"
} else if (type_code || delay_code) {
  lead_status = "incomplete"; // → "incomplet"
} else {
  lead_status = "to_process"; // → "a_traiter"
}
// ...
lead_status = "incomplete"; // → "incomplet"
// ...
lead_status = "to_process"; // → "a_traiter"
```

Résultat attendu :

```typescript
lead_status: "nouveau" | "incomplet" | "a_traiter";

let lead_status: "nouveau" | "incomplet" | "a_traiter" = "a_traiter";
// CAS 1 (structuré) :
if (type_code && delay_code && address) {
  lead_status = "nouveau";
} else if (type_code || delay_code) {
  lead_status = "incomplet";
} else {
  lead_status = "a_traiter";
}
// CAS 2 (non structuré) :
if (type_code || delay_code) {
  lead_status = "incomplet";
} else {
  lead_status = "a_traiter";
}
```

### 2c — `src/modules/twilio/twilio.service.ts`

- [ ] **Step 4: Remplacer toutes les occurrences de statuts hardcodés**

Chercher et remplacer dans `twilio.service.ts` :
- `status: "to_process"` → `status: "a_traiter"`
- `status: "new"` → `status: "nouveau"`
- `status: "incomplete"` → `status: "incomplet"`
- `status: "processed"` → `status: "traite"`
- `status: "needs_review"` → `status: "a_traiter"`

### 2d — `src/modules/dev/dev.service.ts`

- [ ] **Step 5: Mettre à jour `LEADS_DATA` et `simulateSms`**

Dans `LEADS_DATA`, remplacer :
- `status: "to_process" as const` → `status: "a_traiter" as const`
- `status: "incomplete" as const` → `status: "incomplet" as const`

Dans `simulateSms`, remplacer :
```typescript
status: "to_process" as const,
```
par :
```typescript
status: "a_traiter" as const,
```

### 2e — `src/app/dashboard/page.tsx`

- [ ] **Step 6: Mettre à jour les filtres du dashboard**

Remplacer `STATUS_FILTER_OPTIONS` :
```typescript
const STATUS_FILTER_OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: "active",     label: "Actifs" },
  { value: "",           label: "Tous" },
  { value: "nouveau",    label: "Nouveau" },
  { value: "incomplet",  label: "Incomplet" },
  { value: "a_traiter",  label: "À traiter" },
  { value: "traite",     label: "Traité" },
];
```

Mettre à jour `STATUS_TO_BADGE` :
```typescript
const STATUS_TO_BADGE: Record<LeadStatus, BadgeVariant> = {
  nouveau:   "nouveau",
  incomplet: "incomplet",
  a_traiter: "a-traiter",
  traite:    "traite",
};
```

Mettre à jour `StatsData.month.byStatus` :
```typescript
byStatus: { nouveau: number; a_traiter: number; incomplet: number; traite: number };
```

Chercher toutes les comparaisons comme `lead.status === "active"` — la valeur `"active"` est un filtre UI uniquement (pas en DB), vérifier que le filtre `"active"` côté API correspond bien aux statuts `nouveau` et `a_traiter`.

### 2f — `src/app/dashboard/leads/[id]/page.tsx`

- [ ] **Step 7: Mettre à jour `badgeStatus` et `handleMarkProcessed`**

Remplacer :
```typescript
const [status, setStatus] = useState<LeadStatus>("new");
```
par :
```typescript
const [status, setStatus] = useState<LeadStatus>("nouveau");
```

Remplacer :
```typescript
const badgeStatus = lead.status === "to_process" ? "a-traiter"
  : lead.status === "incomplete" ? "incomplet"
  : lead.status === "processed" ? "traite"
  : "nouveau";
```
par :
```typescript
const badgeStatus = lead.status === "a_traiter" ? "a-traiter"
  : lead.status === "incomplet" ? "incomplet"
  : lead.status === "traite" ? "traite"
  : "nouveau";
```

Remplacer dans `handleMarkProcessed` :
```typescript
const ok = await patchLead({ status: "processed" });
```
par :
```typescript
const ok = await patchLead({ status: "traite" });
```

Mettre à jour le lien "Retour aux leads" :
```typescript
// Retour aux leads → Retour aux demandes (Task 6 aussi)
```

Mettre à jour la condition `lead.status !== "processed"` :
```typescript
{lead.status !== "traite" && (
```

- [ ] **Step 8: Vérifier que le build TypeScript compile sans erreur**

```bash
cd atyspro-backend && npm run build 2>&1 | head -50
```
Attendu : aucune erreur TypeScript liée aux statuts.

- [ ] **Step 9: Commit**

```bash
git add atyspro-backend/src/types/lead.ts atyspro-backend/src/lib/leadParsing.ts
git add atyspro-backend/src/modules/twilio/twilio.service.ts atyspro-backend/src/modules/dev/dev.service.ts
git add atyspro-backend/src/app/dashboard/page.tsx atyspro-backend/src/app/dashboard/leads/[id]/page.tsx
git commit -m "feat: migrate lead statuses to French slugs (backend)"
```

---

## Task 3: Mise à jour du mobile — statuts (P1)

**Files:**
- Modify: `atyspro-mobile/src/services/leads.service.ts`
- Modify: `atyspro-mobile/src/screens/Leads/LeadsScreen.tsx`
- Modify: `atyspro-mobile/src/screens/Leads/LeadDetailScreen.tsx`

### 3a — `src/services/leads.service.ts`

- [ ] **Step 1: Corriger `LeadStatus`**

Remplacer :
```typescript
export type LeadStatus = 'complete' | 'incomplete' | 'needs_review';
```
par :
```typescript
export type LeadStatus = 'nouveau' | 'incomplet' | 'a_traiter' | 'traite';
```

### 3b — `src/screens/Leads/LeadsScreen.tsx`

- [ ] **Step 2: Corriger `LeadStatusFilter` et `STATUS_CHIPS`**

Remplacer :
```typescript
export type LeadStatusFilter = 'all' | 'new' | 'to_process' | 'complete' | 'incomplete';

const STATUS_CHIPS: { value: LeadStatusFilter; label: string }[] = [
  { value: 'all',        label: 'Tous' },
  { value: 'new',        label: 'Nouveau' },
  { value: 'to_process', label: 'À traiter' },
  { value: 'complete',   label: 'Traité' },
  { value: 'incomplete', label: 'Incomplet' },
];
```
par :
```typescript
export type LeadStatusFilter = 'all' | 'nouveau' | 'a_traiter' | 'traite' | 'incomplet';

const STATUS_CHIPS: { value: LeadStatusFilter; label: string }[] = [
  { value: 'all',       label: 'Tous' },
  { value: 'nouveau',   label: 'Nouveau' },
  { value: 'a_traiter', label: 'À traiter' },
  { value: 'traite',    label: 'Traité' },
  { value: 'incomplet', label: 'Incomplet' },
];
```

- [ ] **Step 3: Corriger `filterByStatus`**

Remplacer la fonction entière :
```typescript
function filterByStatus(lead: Lead, status: LeadStatusFilter): boolean {
  if (status === 'all') return true;
  return lead.status === status;
}
```

- [ ] **Step 4: Corriger `useState` initial**

```typescript
const [statusFilter, setStatusFilter] = useState<LeadStatusFilter>('all');
```
(pas de changement de valeur initiale, mais vérifier le type)

### 3c — `src/screens/Leads/LeadDetailScreen.tsx`

- [ ] **Step 5: Corriger `STATUS_BUTTONS`**

Remplacer :
```typescript
const STATUS_BUTTONS: { status: LeadStatus; label: string; variant: BadgeVariant }[] = [
  { status: 'needs_review', label: 'À traiter', variant: 'needs_review' },
  { status: 'incomplete',   label: 'Incomplet', variant: 'incomplete' },
  { status: 'complete',     label: 'Traité ✓',  variant: 'complete' },
];
```
par :
```typescript
const STATUS_BUTTONS: { status: LeadStatus; label: string; variant: BadgeVariant }[] = [
  { status: 'a_traiter', label: 'À traiter', variant: 'a_traiter' },
  { status: 'incomplet', label: 'Incomplet', variant: 'incomplet' },
  { status: 'traite',    label: 'Traité ✓',  variant: 'traite' },
];
```

- [ ] **Step 6: Corriger `variantActiveColors` et tous les `BadgeVariant`**

Remplacer les clés de `variantActiveColors` pour correspondre aux nouvelles variantes :
```typescript
const variantActiveColors: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
  a_traiter: { bg: '#fef3c7', border: colors.atysWarning, text: colors.atysWarning },
  incomplet:  { bg: colors.slate100, border: colors.slate400, text: colors.slate600 },
  traite:     { bg: '#d1fae5', border: '#34d399', text: colors.atysSuccess },
  urgent:     { bg: '#fee2e2', border: colors.atysDanger, text: colors.atysDanger },
  neutral:    { bg: '#eef2ff', border: colors.atysBlue, text: colors.atysBlue },
  nouveau:    { bg: '#eff6ff', border: colors.atysBlue, text: colors.atysBlue },
};
```

> Note : Si `BadgeVariant` est défini ailleurs (ex: `src/components/common/Badge.tsx`), mettre à jour le type là-bas aussi.

- [ ] **Step 7: Vérifier `Badge.tsx` mobile**

Lire `atyspro-mobile/src/components/common/Badge.tsx`, mettre à jour `BadgeVariant` pour inclure `'nouveau' | 'a_traiter' | 'incomplet' | 'traite'` et supprimer `'complete' | 'needs_review'`.

- [ ] **Step 8: Commit**

```bash
cd .. && git add atyspro-mobile/src/services/leads.service.ts
git add atyspro-mobile/src/screens/Leads/LeadsScreen.tsx
git add atyspro-mobile/src/screens/Leads/LeadDetailScreen.tsx
git add atyspro-mobile/src/components/common/Badge.tsx
git commit -m "feat: migrate lead statuses to French slugs (mobile)"
```

---

## Task 4: Audit scoring — bug urgence (P1)

**Files:**
- Read: `atyspro-backend/src/modules/twilio/twilio.service.ts` (complet)
- Possibly modify: `atyspro-backend/src/modules/twilio/twilio.service.ts`

- [ ] **Step 1: Lire le `twilio.service.ts` en entier**

```bash
cat atyspro-backend/src/modules/twilio/twilio.service.ts
```

Chercher l'appel à `computeScore(...)` dans la gestion du SMS entrant. Vérifier que `is_dangerous` et `estimated_scope` sont bien transmis si disponibles.

- [ ] **Step 2: Identifier si `delay_code` est bien passé**

Le bug probable : `parseSms()` retourne `delay_code`, mais `computeScore` est appelé sans passer les champs optionnels `is_dangerous` / `estimated_scope`. Ce n'est pas un bug si ces champs sont null — le score sera bien calculé.

Vérifier que le code ressemble à ceci (correct) :
```typescript
const parsed = parseSms(body);
const { priority_score, value_estimate } = computeScore(
  parsed.type_code,
  parsed.delay_code,
  // is_dangerous et estimated_scope : null si non dispo → OK
);
```

**Si le bug est là** : l'appel à `computeScore` est fait avec `type_code` ou `delay_code` null (avant d'avoir les valeurs parsées). Corriger l'ordre des opérations.

- [ ] **Step 3: Tester avec simulate**

Avec le endpoint `/api/dev/simulate/sms`, simuler un SMS urgent :
```bash
curl -X POST http://localhost:3000/api/dev/simulate/sms \
  -H "Content-Type: application/json" \
  -d '{"to":"+33612345678","from":"+33698765432","body":"1/1/15 rue de la Paix 75002/Marie Dupont"}'
```
Vérifier que le lead créé a `priority_score` = 75 (type 1 = 25pts + delay 1 = 50pts).

- [ ] **Step 4: Commit si modification nécessaire**

```bash
git add atyspro-backend/src/modules/twilio/twilio.service.ts
git commit -m "fix: pass correct delay_code to computeScore in SMS webhook"
```

---

## Task 5: Toggle affichage mot de passe — icône œil (P2)

**Files:**
- Modify: `atyspro-backend/src/app/auth/page.tsx`
- Modify: `atyspro-mobile/src/screens/Auth/LoginScreen.tsx`
- Modify: `atyspro-mobile/src/screens/Auth/SignupScreen.tsx`

### 5a — Dashboard web (`auth/page.tsx`)

- [ ] **Step 1: Ajouter l'import Eye**

```typescript
import { Eye, EyeOff } from "lucide-react";
```

- [ ] **Step 2: Ajouter l'état toggle**

```typescript
const [showPassword, setShowPassword] = useState(false);
const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
```

- [ ] **Step 3: Wrapper le champ password dans un div relatif**

Remplacer le champ mot de passe existant (inline style) par :

```tsx
<div style={{ position: "relative" }}>
  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    style={{ ...INPUT, paddingRight: 40 }}
    placeholder="••••••"
    autoComplete={isSignup ? "new-password" : "current-password"}
  />
  <button
    type="button"
    onClick={() => setShowPassword((v) => !v)}
    style={{
      position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", cursor: "pointer", padding: 0,
      color: "#94A3B8", display: "flex", alignItems: "center",
    }}
    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
  >
    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
  </button>
</div>
```

Faire de même pour le champ "Confirmer le mot de passe" (signup) avec `showPasswordConfirm`.

### 5b — Mobile Login (`LoginScreen.tsx`)

- [ ] **Step 4: Lire `LoginScreen.tsx` pour trouver le champ password**

Ajouter :
```typescript
const [showPassword, setShowPassword] = useState(false);
```

Modifier le `TextInput` password pour ajouter `secureTextEntry={!showPassword}` et un `Pressable` absolu avec l'icône `Eye` / `EyeOff` de `lucide-react-native`.

Pattern React Native :
```tsx
<View style={{ position: 'relative' }}>
  <TextInput
    secureTextEntry={!showPassword}
    // ... autres props
  />
  <Pressable
    onPress={() => setShowPassword(v => !v)}
    style={{ position: 'absolute', right: 14, top: '50%', transform: [{ translateY: -10 }] }}
    accessibilityLabel={showPassword ? "Masquer" : "Afficher"}
  >
    {showPassword
      ? <EyeOff size={18} color={colors.placeholder} />
      : <Eye size={18} color={colors.placeholder} />
    }
  </Pressable>
</View>
```

### 5c — Mobile Signup (`SignupScreen.tsx`)

- [ ] **Step 5: Appliquer le même pattern sur SignupScreen**

Même chose que LoginScreen — un toggle pour le mot de passe, un autre pour "Confirmer le mot de passe" s'il existe.

- [ ] **Step 6: Commit**

```bash
git add atyspro-backend/src/app/auth/page.tsx
git add atyspro-mobile/src/screens/Auth/LoginScreen.tsx
git add atyspro-mobile/src/screens/Auth/SignupScreen.tsx
git commit -m "feat: add password visibility toggle on auth pages"
```

---

## Task 6: Renommer "lead" → "demande" dans l'UI (P2)

> ⚠️ Ne renommer QUE les chaînes UI. Ne pas toucher aux variables, fonctions, props, noms de fichiers.

**Files:**
- Modify: `atyspro-backend/src/app/dashboard/page.tsx`
- Modify: `atyspro-backend/src/app/dashboard/leads/[id]/page.tsx`
- Modify: `atyspro-backend/src/app/dashboard/layout.tsx`
- Modify: `atyspro-mobile/src/navigation/MainTabNavigator.tsx`
- Possibly: `atyspro-mobile/src/screens/Leads/LeadsScreen.tsx`
- Possibly: `atyspro-mobile/src/screens/Home/HomeScreen.tsx`

### Règles de remplacement :

| Texte affiché actuel | Texte affiché cible |
|---|---|
| "Lead" | "Demande" |
| "Leads" | "Demandes" |
| "Nouveau lead" | "Nouvelle demande" |
| "lead" (minuscule, dans phrases UI) | "demande" |
| "leads" (pluriel, dans phrases UI) | "demandes" |
| "Retour aux leads" | "Retour aux demandes" |
| Titre tab "Leads" | "Demandes" |
| `LoadingSpinner text="Chargement du lead…"` | `"Chargement de la demande…"` |

- [ ] **Step 1: Dashboard `page.tsx` — textes UI uniquement**

Chercher les occurrences textuelles de "lead" / "leads" dans les JSX strings. Ne pas toucher aux variables TypeScript, noms de composants, props.

- [ ] **Step 2: Dashboard `leads/[id]/page.tsx`**

- `"Chargement du lead…"` → `"Chargement de la demande…"`
- `"Retour aux leads"` → `"Retour aux demandes"`
- `"Lead non trouvé"` → `"Demande non trouvée"`

- [ ] **Step 3: Dashboard layout — nav sidebar**

Lire `atyspro-backend/src/app/dashboard/layout.tsx` et mettre à jour le libellé du lien "Leads" → "Demandes" dans la navigation.

- [ ] **Step 4: Mobile — tab nav et écrans**

Dans `MainTabNavigator.tsx`, mettre à jour le label du tab "Leads" → "Demandes".

Dans `LeadsScreen.tsx`, mettre à jour tout texte UI contenant "lead/leads" (ex: titres, empty states, messages d'erreur).

- [ ] **Step 5: Commit**

```bash
git add atyspro-backend/src/app/dashboard/page.tsx
git add atyspro-backend/src/app/dashboard/leads/[id]/page.tsx
git add atyspro-backend/src/app/dashboard/layout.tsx
git add atyspro-mobile/src/navigation/MainTabNavigator.tsx
git add atyspro-mobile/src/screens/Leads/LeadsScreen.tsx
git commit -m "feat: rename UI label lead → demande everywhere"
```

---

## Task 7: Badge "Nouveau" sur les demandes récentes (P2)

**Files:**
- Modify: `atyspro-backend/src/app/dashboard/page.tsx` (liste leads)
- Modify: `atyspro-mobile/src/components/leads/LeadCard.tsx`

**Règle :** Afficher un petit badge "NOUVEAU" uniquement si `lead.status === 'nouveau'`. Le badge disparaît dès que le statut change.

**Style dashboard (inline) :**
```tsx
{lead.status === 'nouveau' && (
  <span style={{
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: 'linear-gradient(90deg, #1A56DB, #7c3aed)',
    color: '#fff',
    marginLeft: 8,
  }}>
    Nouveau
  </span>
)}
```

**Style mobile (dans `LeadCard.tsx`) :** Utiliser `LinearGradient` d'expo avec les mêmes couleurs. Placer à côté de la date.

- [ ] **Step 1: Ajouter le badge dans la liste dashboard**

Dans `dashboard/page.tsx`, identifier où la date de création est affichée dans chaque ligne de la liste, et y ajouter le badge conditionnel.

- [ ] **Step 2: Ajouter le badge dans `LeadCard.tsx` mobile**

Lire `atyspro-mobile/src/components/leads/LeadCard.tsx`, identifier la zone date, ajouter le badge.

- [ ] **Step 3: Commit**

```bash
git add atyspro-backend/src/app/dashboard/page.tsx
git add atyspro-mobile/src/components/leads/LeadCard.tsx
git commit -m "feat: add Nouveau badge on new leads"
```

---

## Task 8: Labels fiche lead dashboard (P2)

**Files:**
- Modify: `atyspro-backend/src/app/dashboard/leads/[id]/page.tsx`

- [ ] **Step 1: Renommer "Message" → "Transcription de l'appel"**

Dans `dashboard/leads/[id]/page.tsx`, ligne ~396 :
```tsx
<InfoRow label="Message">
```
→
```tsx
<InfoRow label="Transcription de l'appel">
```

- [ ] **Step 2: Renommer "Messages SMS" → "Récapitulatif envoyé au client"**

Ligne ~409 :
```tsx
<h3 ...>Messages SMS</h3>
```
→
```tsx
<h3 ...>Récapitulatif envoyé au client</h3>
```

Optionnel : ajouter une note explicative sous le titre (ex: texte gris italic `"Message de confirmation envoyé automatiquement à l'issue de l'appel IA."`).

- [ ] **Step 3: Commit**

```bash
git add atyspro-backend/src/app/dashboard/leads/[id]/page.tsx
git commit -m "feat: rename Message and SMS section labels on lead detail"
```

---

## Task 9: IDs courts dans l'UI (P2)

**Files:**
- Modify: `atyspro-backend/src/app/dashboard/page.tsx`
- Modify: `atyspro-backend/src/app/dashboard/leads/[id]/page.tsx`
- Modify: `atyspro-mobile/src/components/leads/LeadCard.tsx`
- Modify: `atyspro-mobile/src/screens/Leads/LeadDetailScreen.tsx`

**Helper (à ajouter là où c'est nécessaire, inline — pas de fichier partagé pour 4 usages) :**
```typescript
function shortId(id: string): string {
  return `#${id.slice(0, 8)}`;
}
```

- [ ] **Step 1: Dashboard — liste et fiche**

Dans `dashboard/page.tsx`, si l'ID complet est affiché dans un lien ou une colonne, le remplacer par `shortId(lead.id)`.

Dans `dashboard/leads/[id]/page.tsx`, afficher le short ID dans le header de la fiche (sous le nom ou en subtitle discret).

- [ ] **Step 2: Mobile — LeadCard et LeadDetailScreen**

Dans `LeadCard.tsx`, afficher `shortId(lead.id)` en bas de la carte.

Dans `LeadDetailScreen.tsx`, afficher `shortId(lead.id)` dans la zone header.

- [ ] **Step 3: Commit**

```bash
git add atyspro-backend/src/app/dashboard/page.tsx
git add atyspro-backend/src/app/dashboard/leads/[id]/page.tsx
git add atyspro-mobile/src/components/leads/LeadCard.tsx
git add atyspro-mobile/src/screens/Leads/LeadDetailScreen.tsx
git commit -m "feat: display short IDs (#xxxxxxxx) in UI"
```

---

## Task 10: Fix 100dvh (P3)

**Files:**
- Modify: `atyspro-backend/src/app/auth/layout.tsx` (si applicable)
- Modify: `atyspro-backend/src/app/layout.tsx`
- Grep pour trouver toutes les occurrences

- [ ] **Step 1: Chercher toutes les occurrences de `100vh`**

```bash
grep -rn "100vh" atyspro-backend/src/ --include="*.tsx" --include="*.ts" --include="*.css"
```

- [ ] **Step 2: Remplacer par `100dvh`**

Pour chaque occurrence trouvée dans les conteneurs principaux (layout, auth pages), remplacer `height: "100vh"` par `height: "100dvh"`.

Note : React Native (mobile) utilise `flex: 1` — pas de `vh`. Ne pas modifier le mobile pour ce fix.

- [ ] **Step 3: Commit**

```bash
git add -p  # Stager seulement les fichiers modifiés
git commit -m "fix: replace 100vh with 100dvh for virtual keyboard support"
```

---

## Task 11: Seed de données réalistes (P4)

**Files:**
- Modify: `atyspro-backend/src/modules/dev/dev.service.ts`

- [ ] **Step 1: Remplacer `LEADS_DATA`**

Remplacer la constante `LEADS_DATA` dans `dev.service.ts` par :

```typescript
const LEADS_DATA: Array<{
  status: "nouveau" | "a_traiter" | "incomplet" | "traite";
  full_name: string;
  client_phone: string;
  address: string;
  description: string;
  type_code: number;
  delay_code: number;
  priority_score: number;
  value_estimate: "low" | "medium" | "high";
  relance_count: number;
}> = [
  {
    status: "nouveau",
    full_name: "Marie Lefebvre",
    client_phone: "+33698765432",
    address: "15 rue de la République, 75011 Paris",
    description: "Prise électrique avec étincelles dans la cuisine. Très inquiète.",
    type_code: 1,
    delay_code: 1,
    priority_score: 75,
    value_estimate: "medium",
    relance_count: 0,
  },
  {
    status: "a_traiter",
    full_name: "Jean-Pierre Martin",
    client_phone: "+33687654321",
    address: "42 avenue Victor Hugo, 69003 Lyon",
    description: "Installation de 5 prises dans le salon rénové, pas urgent.",
    type_code: 2,
    delay_code: 3,
    priority_score: 35,
    value_estimate: "medium",
    relance_count: 0,
  },
  {
    status: "incomplet",
    full_name: null,
    client_phone: "+33676543210",
    address: null,
    description: "Tableau électrique à remplacer. Maison années 70.",
    type_code: 1,
    delay_code: 2,
    priority_score: 60,
    value_estimate: "high",
    relance_count: 1,
  },
  {
    status: "traite",
    full_name: "Sophie Rousseau",
    client_phone: "+33665432109",
    address: "8 impasse des Fleurs, 33000 Bordeaux",
    description: "Devis pour rénovation électrique complète d'un appartement T3.",
    type_code: 3,
    delay_code: 4,
    priority_score: 25,
    value_estimate: "high",
    relance_count: 0,
  },
];
```

Note : supprimer les champs qui n'existent plus dans le schéma (`urgency`, `job_type`, `score`, `contact_name`, `phone`, `request_text`). Utiliser uniquement les champs de la table `leads`.

- [ ] **Step 2: Corriger l'insert dans `seedDev` et `seedHealthDb`**

Les deux fonctions partagent `LEADS_DATA`. Vérifier que le `.insert(leadsData)` passe les bons champs. L'insert doit inclure `full_name`, `client_phone`, `address`, `description`, `type_code`, `delay_code`, `priority_score`, `value_estimate`, `relance_count` en plus de `account_id` et `status`.

- [ ] **Step 3: Tester le seed**

```bash
curl -X POST http://localhost:3000/api/dev/seed
```
Vérifier la réponse JSON — elle doit lister 4 leads avec les bons statuts.

- [ ] **Step 4: Commit**

```bash
git add atyspro-backend/src/modules/dev/dev.service.ts
git commit -m "feat: update dev seed with realistic French leads (one per status)"
```

---

## Ordre d'exécution recommandé

```
Task 1  (SQL)     → Exécuter manuellement dans Supabase d'abord
Task 2  (backend) → Dépend de Task 1
Task 3  (mobile)  → Dépend de Task 1
Task 4  (scoring) → Dépend de Task 2
Tasks 5-11        → Indépendantes, dans n'importe quel ordre
```

## Vérification finale

- [ ] `npm run build` dans `atyspro-backend/` sans erreurs TypeScript
- [ ] `npm run lint` dans les deux projets sans erreurs
- [ ] Tester `/api/dev/seed` → 4 leads créés avec les bons statuts
- [ ] Tester `/api/dev/simulate/sms` avec `body: "1/1/15 rue Test 75002/Marie Test"` → `priority_score: 75`
- [ ] Ouvrir le dashboard : onglet "Traité" non vide, changement de statut fonctionnel
- [ ] Ouvrir le mobile : chips de filtre fonctionnelles, badge "NOUVEAU" visible

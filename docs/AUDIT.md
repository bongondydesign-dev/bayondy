# Audit complet de la plateforme BAYONDY — Phase 1 (Rapport uniquement)

- **Date de l'audit** : 28 novembre 2026
- **Stack auditee** : Next.js `16.4.6` (`Turbopack`, `cacheComponents: true`, `partialPrefetching: true`), React `19.3.0`, Firebase Auth / Firestore / `firebase-admin` `13.6.0`, MonCashConnect (`https://moncashconnect.com/docs`), cible Vercel.
- **Perimetre Phase 1** : Lecture et verification statique/locale uniquement. **Aucune modification** du code source, des regles Firestore, de `next.config.ts`, de `package.json` ou des traductions n'a ete appliquee a ce stade.
- **Regle de preuve** : Toute conclusion cite un fichier et une ligne exacte, une sortie brute Phase 0, `node_modules/next/dist/docs`, ou `https://moncashconnect.com/docs`. Ce qui n'a pas pu etre execute ou prouve est explicitement marque **`NON VÉRIFIÉ`** ou **`NON DOCUMENTÉ`**.

---

## Phase 0 — Etat de depart (sorties brutes et constats)

| Verification | Commande | Statut | Sortie brute / Constat |
| :--- | :--- | :--- | :--- |
| Lint ESLint | `npm run lint` | **EXIT 0** | `> eslint` (0 erreur, 0 avertissement bloquant). |
| Build production | `NODE_ENV=production npm run build` | **EXIT 0** | `Next.js 16.4.6 (Turbopack)`, `Compiled successfully in 2.4s`, TS `6.6s`, `34/34` pages generees, `cacheComponents` & `partialPrefetching` actifs. |
| Regles Firestore | `npm run test:rules` | **NON VÉRIFIÉ (EXIT 1)** | Echec : `Error: Could not spawn java -version` (`JAVA_MISSING` dans le conteneur — JDK requis pour l'emulateur Firestore). |
| Suite unitaire MonCashConnect | `npx tsx --test src/lib/moncash/*.test.ts` | **EXIT 0** | `27/27` tests passes (couverture : signature V1, timestamp skew, `amountsMatch`, `fulfillmentCore`, validation `create`). |
| Audit npm | `npm audit` | **NON VÉRIFIÉ (EXIT 1)** | Echec : `ENOLOCK` — absence de `package-lock.json` a la racine (seul `bun.lock` est present). |
| Git status / fichiers suivis | `git status` / `git ls-files` | **NON VÉRIFIÉ (EXIT 128)** | Echec : `fatal: not a git repository (or any of the parent directories): .git` — l'historique `.git` n'est pas present dans le conteneur d'execution. |

**Note environnement Node** : `package.json:5-7` declare `"engines": { "node": "22.x" }`. Aucun fichier `.nvmrc` n'est present a la racine.

---

## A. Securite

### A.1 Routes `/api/**` (authentification, methodes, taille du corps, validation, listes blanches, erreurs, IDOR)

| Route | Methodes | Auth / Admin en premier | Validation / Liste blanche | Constats & Failles (`fichier:ligne`) |
| :--- | :--- | :--- | :--- | :--- |
| `/api/moncash/create` | `POST` | Bearer token + `verifyIdToken(idToken, true)` (`src/app/api/moncash/create/route.ts:42-63`) | `validateMonCashCreateInput` + doc Firestore | **Critique (SEC-01)** : `courseId` optionnel (`src/lib/moncash/validation.ts:162-174`) et si `courseSnap.data()?.priceHTG` est absent/null/`<=0`, `create/route.ts:141-153` n'exige pas un prix valide et accepte le `amount` du client ! **Elevee (SEC-03)** : `resolveAllowedOrigins` (`create/route.ts:15-38`) fait confiance aux en-tetes client `x-forwarded-host`/`host`/`x-forwarded-proto`. **Moyenne (SEC-10)** : aucune limite explicite de taille JSON. |
| `/api/moncash/verify` | `POST` | Bearer token + `verifyIdToken(idToken, true)` + controle `paymentData.uid !== uid` -> `403` (`verify/route.ts:61-87,184-189`) | `ORDER_ID_REGEX` (`verify/route.ts:105`) | **Elevee (SEC-06)** : expose `upstreamStatus`, `lastUpstreamMessage`, nom de variable `MCC_SECRET_KEY`, `project_lookup_failed` (`verify/route.ts:327,347-350,378-380,394-399,414-420`). **Elevee (SEC-03)** : `resolveMonCashCandidateOrigins` (`verify/route.ts:266-273`, `src/lib/moncash/status.ts:99-129`) inclut `origin`/`host` arbitraires. **Moyenne (SEC-10)** : `await req.text()` non borne (`verify/route.ts:92`). |
| `/api/moncash/webhook` | `GET`, `POST` | Secret `MCC_WEBHOOK_SECRET` + timestamp + HMAC V1 (`webhook/route.ts:27-65`) | `parseMonCashWebhookEvent` (`src/lib/moncash/webhook.ts:103-181`) | **Critique (SEC-02)** : `verifyMonCashWebhookSignature` verifie uniquement `X-MCC-Signature` (`HMAC(rawBody)`), exposant au rejeu par substitution de `X-MCC-Timestamp`. **Moyenne** : `GET /api/moncash/webhook` (`webhook/route.ts:15-20`) inutilement expose ; `await req.text()` sans borne de taille (`webhook/route.ts:24`). |
| `/api/admin/acces` | `POST` | `requireAdmin(req)` en premier (`acces/route.ts:10-11`) | Champs `email`, `courseId`, `action` valides | **Faible/Moyenne** : manque `hasAdminCredentials()` avant `getAdminAuth()` (`acces/route.ts:41`, redondant mais inegal avec autres routes) ; `acces/route.ts:51` reflete l'e-mail brut en 404. `courseId` non valide par regex `isValidCourseDocId`. |
| `/api/admin/courses` | `GET`, `POST` | `requireAdmin(req)` (`courses/route.ts:11,45`) | `validateCourseInput` + liste blanche (`courses/route.ts:103-119`) | **Moyenne (PERF-01)** : `GET` lit toute la collection `courses` sans `.limit()`. `POST` : corps JSON non borne. |
| `/api/admin/courses/[id]` | `GET`, `PATCH`, `DELETE` | `requireAdmin(req)` (`[id]/route.ts:20,93,198`) | `isValidCourseDocId` present sur `DELETE` (`[id]/route.ts:206`), **absent** sur `GET` (`[id]/route.ts:27`) et `PATCH` (`[id]/route.ts:100`) | **Moyenne (SEC-10)** : validation d'ID manquante sur `GET`/`PATCH`. |
| `/api/admin/courses/[id]/lessons` | `POST` | `requireAdmin(req)` (`lessons/route.ts:18`) | `validateLessonInput` + protection SSRF TikTok (`src/lib/video/resolveTikTok.server.ts:39`) | **Moyenne (SEC-10)** : `courseId` issu de `ctx.params` non verifie par `isValidCourseDocId` avant lookup (`lessons/route.ts:25,64`). |
| `/api/admin/lessons/[lessonId]` | `PATCH`, `DELETE` | `requireAdmin(req)` (`[lessonId]/route.ts:18,109`) | `validateLessonInput` + archivage logique | **Moyenne (SEC-10)** : manque `hasAdminCredentials()` et validation de `lessonId` avant `.doc(lessonId)` (`[lessonId]/route.ts:21,42,112,116`). |
| `/api/admin/payments` | `GET`, `DELETE` | `requireAdmin(req)` (`payments/route.ts:9,60`) | `validateClearPaymentsBody` | **Moyenne (SEC-10)** : `parseInt(url.searchParams.get("limit") ?? "50", 10)` sans garde `Number.isFinite` / `>= 1` (`payments/route.ts:18`) -> `?limit=abc` passe `NaN` a Firestore `.limit(NaN)` et provoque HTTP `500` ; `?limit=0` ou `-1` idem. |
| `/api/admin/students` | `GET` | `requireAdmin(req)` (`students/route.ts:7`) | Pagination `startAfter` | **Moyenne (SEC-10)** : meme bug `parseInt` -> `NaN` / `<= 0` (`students/route.ts:12`) et absence de `hasAdminCredentials()` (`students/route.ts:10`). |
| `/api/admin/stats` | `GET` | `requireAdmin(req)` (`stats/route.ts:7`) | Lecture seule | **Elevee (PERF-01)** : lecture integrale de `courses`, `enrollments (active)` et `payments` sans borne (`stats/route.ts:17,32,40`). |
| `/api/admin/covers` | `POST` | `requireAdmin(req)` (`covers/route.ts:9`) | `parseCoverDataUrl` (`cover.ts:101-147`) : MIME, taille <= 750 Ko, magic bytes | **Moyenne** : `await req.json()` (`covers/route.ts:21`) lit un body potentiellement tres lourd avant controle `Content-Length`. |
| `/api/covers/[id]` | `GET` | Route publique volontaire (couvertures publiques) | `isValidCoverId(id)` + whitelist MIME + `X-Content-Type-Options: nosniff` (`[id]/route.ts:28,45,60`) | Saine dans sa conception. Aucune fuite de cours en brouillon si la couverture n'est pas devinable (ID aleatoire Firestore), mais absence de verification qu'elle est liee a un cours publie (risque faible). |

### A.2 Webhook MonCashConnect (`src/app/api/moncash/webhook/route.ts` & `src/lib/moncash/webhook.ts`)

Confrontation directe au guide officiel `https://moncashconnect.com/docs` :
1. **Corps brut** : `const rawBody = await req.text()` (`webhook/route.ts:24`) avant `JSON.parse` (`webhook.ts:108`). Conforme.
2. **Signature V2 vs V1 & Rejeu critique (`SEC-02`)** :
   - Selon `https://moncashconnect.com/docs`, MonCashConnect envoie **`X-MCC-Signature-V2`** qui signe `${timestamp}.${rawBody}` (HMAC-SHA256 avec le secret webhook), en plus de l'en-tete historique `X-MCC-Signature` (HMAC-SHA256 sur `rawBody` seul) et de `X-MCC-Timestamp` (fenetre 300s).
   - **Preuve** : `src/app/api/moncash/webhook/route.ts:39-58` ne lit ni `x-mcc-signature-v2`, et `verifyMonCashWebhookSignature` (`src/lib/moncash/webhook.ts:72-97`) calcule uniquement `HMAC(secret, rawBody)`.
   - **Impact** : si un attaquant intercepte ou rejoue une paire `(rawBody, X-MCC-Signature)` valide du passe, il peut remplacer `X-MCC-Timestamp` par `Math.floor(Date.now()/1000)` pour passer `verifyMonCashWebhookTimestamp` (`webhook.ts:28-55`) et contourner la protection anti-rejeu.
3. **Comparaison en temps constant** : `crypto.timingSafeEqual(providedBuf, expectedBuf)` (`src/lib/moncash/webhook.ts:96`) apres controle de longueur (`ligne 92`). Conforme.
4. **Controle montant / devise / reference (`SEC-02`)** :
   - Reference : recherche `reference === orderId` par docId puis champ `orderId` / `providerReference` (`src/lib/moncash/fulfillment.ts`).
   - **Montant nul** : `amountsMatch` (`src/lib/moncash/status.ts:265-270`) retourne **`true`** lorsque `actualAmount === null || actualAmount === undefined` ! Un webhook ou `/v1/pay-status` omettant `amount` serait accepte sans verification de montant (`NON DOCUMENTÉ` sur `moncashconnect.com/docs` si `amount` peut etre omis sur certaines methodes, mais dangereux en validation aveugle sur `payment.completed`).
   - **Devise** : `parseMonCashWebhookEvent` (`webhook.ts:103-181`) et `parseMonCashPayStatusResponse` (`status.ts:275-375`) ignorent totalement `currency` — aucune verification `currency === "HTG"`.
   - **Mismatch silencieux** : en cas de `outcome === "amount_mismatch"`, `webhook/route.ts:123-131` renvoie `HTTP 200` sans aucun `console.warn` / journal d'alerte (la transaction Firestore bloque bien l'activation via `fulfillmentCore.ts:59-61`, mais l'incident est invisible).
5. **Idempotence & statuts echec/annule/expire** :
   - Transaction atomique `runFulfillPaidOrderTransaction` (`src/lib/moncash/fulfillmentCore.ts:34-114`) : toutes lectures avant ecritures, retourne `already_paid` si deja `paid` tout en reparant l'inscription si manquante.
   - `normalizeMonCashWebhookEvent` (`status.ts:232-259`) gere `payment.completed|succeeded|paid|failed|cancelled|canceled|expired|updated` et renvoie `200` pour les evenements ignores (`webhook/route.ts:87-89`) afin d'eviter les 5 retries MonCashConnect documentes sur `moncashconnect.com/docs`.

### A.3 Creation de paiement (`src/app/api/moncash/create/route.ts`)

1. **Prix pilote par le client & contournement cours sans prix (`SEC-01` — Critique)** :
   - `validateMonCashCreateInput` (`src/lib/moncash/validation.ts:162-174`) rend `courseId` optionnel : un appel API direct peut omettre `courseId` et creer un paiement de `1 HTG`.
   - Meme avec `courseId`, `src/app/api/moncash/create/route.ts:141-153` ne verifie l'egalite `Math.round(serverPriceHTG) !== amount` **que** si `serverPriceHTG > 0`. Pour un cours gratuit, en USD seul, ou sans `priceHTG`, le serveur accepte le `amount` fourni par le client et ecrit le document `payments/{orderId}`. Si ce paiement est paye, `fulfillmentCore.ts:63-105` active `enrollments/{uid}_{courseId}` !
   - De plus, `MAX_MONCASH_AMOUNT_HTG = 1_000_000` (`validation.ts:1`) depasse le plafond officiel `100 000 HTG` de `POST /v1/pay-create` selon `https://moncashconnect.com/docs` (`1..100,000 HTG`).
   - **Correctif attendu** : exiger `courseId`, refuser clairement (`422 COURSE_UNPRICED`) tout cours sans `priceHTG > 0` entier `<= 100_000`, et **calculer `amount` exclusivement cote serveur** depuis `courseSnap.data().priceHTG`.
2. **Double-clic / clics multiples (`SEC-05` — Elevee)** :
   - `EnrollButton.tsx:151` genere un nouvel `orderId` a chaque appel, et `create/route.ts:156-185` cree un nouveau document `payments/{orderId}` et un nouvel appel `/v1/pay-create` sans verifier s'il existe deja un paiement `awaiting_payment` recent (< 15 min, duree de session checkout documentee sur `https://moncashconnect.com/docs`) avec `paymentUrl` valide pour `(uid, courseId)`.

### A.4 Separation des cles MonCashConnect & bundle navigateur

- **Bundle navigateur** : Verification sur `.next/static/chunks/*.js` (40 fichiers, `2,407,134` octets / `2.41 MB`) -> **0 occurrence** de `firebase-admin`, `FIREBASE_ADMIN`, `MCC_SECRET`, `MONCASHCONNECT`, `sk_proj_`, `sk_test_proj_`, `whsec_`, `PRIVATE KEY`. Le secret n'est lu que cote serveur via `resolveMonCashSecretKey` (`src/lib/moncash/status.ts:87-93`).
- **Separation Test / Live manquante (`SEC-04` — Elevee)** : `https://moncashconnect.com/docs` distingue `sk_test_proj_...` (Sandbox) et `sk_proj_...` (Live). Le code actuel (`status.ts:87-93`, `create/route.ts:90`, `verify/route.ts:255`) ne refuse ni `sk_test_proj_` quand `VERCEL_ENV === "production"`, ni `sk_proj_` en sandbox/dev. A noter aussi l'alias non documente dans `.env.example` : `MCC_SECRET` (`status.ts:88`).

### A.5 Secrets dans l'historique Git

- **Statut : `NON VÉRIFIÉ`** — l'execution de `git status` et `git log -p` a echoue (`fatal: not a git repository`, `.git` absent du conteneur).
- Scan du workspace actuel : aucune cle en dur detectee dans `src/` ou `scripts/`. `.env.example` ne contient que des noms de variables vides. `.gitignore` doit etre verifie avec `git ls-files` en local (voir checklist utilisateur).

### A.6 Regles Firestore (`firestore.rules` vs requetes reelles et tests)

Lecture ligne par ligne de `firestore.rules` (167 lignes) et comparaison avec `src/lib/learning/queries.ts`, `src/lib/auth/AuthProvider.tsx` et `tests/firestore.rules.test.ts` :
1. **Regles `lessons/{lessonId}` (`firestore.rules:79-93`) — Faille `SEC-07` (Elevee)** :
   - La regle `allow read` autorise la lecture si `resource.data.isFreePreview == true` ou si l'utilisateur a une inscription `active` sur `resource.data.courseId`, **sans verifier `resource.data.archived != true`**. Or l'admin "supprime" des lecons par archivage logique (`archived: true`, `src/app/api/admin/lessons/[lessonId]/route.ts:126`) et le client filtre ensuite en memoire (`src/lib/learning/queries.ts:173`). Un client appelant directement le SDK Firestore peut donc lire des lecons archivees (y compris un visiteur non connecte si une lecon archivee etait en apercu gratuit).
   - En outre, un eleve ayant une inscription `active` sur un cours passe ensuite en `draft` peut lire directement ses lecons via SDK Firestore car `lessons` ne verifie pas `get(.../courses/...).data.status == 'published'` (attention au cout de lecture +1 `get()` Firestore si ajoute).
2. **Regles `users/{uid}` (`firestore.rules:30-56`) — `SEC-07` (Moyenne)** :
   - Controle correctement l'ownership (`request.auth.uid == uid`), la liste de cles et l'absence de `role` ou de modification de `email`/`createdAt`. En revanche, aucune validation de type ou de longueur maximale sur `displayName` et `photoURL` (un utilisateur peut ecrire un `displayName` de 100 Ko).
3. **Correspondance aux requetes reelles** :
   - `getMyEnrollments(uid)` (`learning/queries.ts:46-50`) : filtre `uid == uid && status == "active"` -> conforme a `firestore.rules:101`.
   - `getCourseLessons(courseId)` (`learning/queries.ts:162-166`) : filtre `courseId == courseId` -> conforme a `firestore.rules:86-87`.
   - `getMyPayments(uid)` (`learning/queries.ts:218-221`) : filtre `uid == uid` -> conforme a `firestore.rules:141`.
   - `saveProgress` (`learning/queries.ts:203-208`) : met a jour uniquement `progress` avec <= 500 IDs et `lastLessonId <= 128` -> conforme a `firestore.rules:106-125`.
4. **Tests manquants dans `tests/firestore.rules.test.ts` + execution** :
   - Execution locale : **`NON VÉRIFIÉ`** (`JAVA_MISSING`).
   - Cas absents de `tests/firestore.rules.test.ts` :
     - Collection `courseCovers/{coverId}` (aucun test de refus lecture/ecriture client ni admin client).
     - Lecture de lecons `archived: true` par visiteur / eleve inscrit.
     - Collection `users/{uid}` : lecture croisee (User B lit User A), creation pour un autre `uid`, suppression interdite.
     - Requete `list` globale sur `payments`, `enrollments`, `lessons` sans filtre `where`.

### A.7 En-tetes HTTP (`next.config.ts:23-35`) & proposition CSP Report-Only

Etat actuel dans `next.config.ts:23-35` : seul `Cross-Origin-Opener-Policy: same-origin-allow-popups` est configure.
**Absents** : `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options` / `frame-ancestors`, et `Content-Security-Policy-Report-Only`.

De plus, `next.config.ts:7-12` autorise **tous les domaines HTTP et HTTPS** dans `images.remotePatterns` (`{ protocol: "https", hostname: "**" }`, `{ protocol: "http", hostname: "**" }`), exposant `/_next/image` a un proxy d'images arbitraires (abus bande passante / SSRF applicatif).

**Proposition CSP en mode `Content-Security-Policy-Report-Only` d'abord** (avant tout blocage) :
```text
default-src 'self';
script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://lh3.googleusercontent.com https://i.ytimg.com https://*.tiktokcdn.com;
font-src 'self';
connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com;
frame-src 'self' https://www.youtube-nocookie.com https://www.tiktok.com https://*.firebaseapp.com;
frame-ancestors 'none';
object-src 'none';
base-uri 'self';
form-action 'self';
```

**Ce qu'une CSP bloquante (`Content-Security-Policy`) casserait si elle etait activee sans precautions** :
1. **`THEME_INIT_SCRIPT` inline (`src/app/layout.tsx:100`) et scripts Next.js d'hydratation / JSON-LD** : bloques si `'unsafe-inline'` (ou un `nonce` dynamique par requete) manque dans `script-src`. Or `cacheComponents: true` rend le `nonce` par requete incompatible avec les pages statiques mises en cache (verifie dans `node_modules/next/dist/docs`).
2. **Lecteur video YouTube & TikTok (`src/lib/video/lessonVideo.ts:268`, `src/components/player/VideoPlayer.tsx`)** : les embeds TikTok (`https://www.tiktok.com/embed/v2/...`) et YouTube (`https://www.youtube-nocookie.com/embed/...`) cassent sans ces domaines exacts dans `frame-src`.
3. **Connexion Google Firebase (`signInWithPopup`)** : casse si `https://apis.google.com` (`script-src`), `https://<project>.firebaseapp.com` (`frame-src`), `identitytoolkit.googleapis.com` et `securetoken.googleapis.com` (`connect-src`) manquent, ou si `COOP` passe a `same-origin`.
4. **Firestore SDK & Auth client** : requetes temps reel/WebChannel bloquees sans `firestore.googleapis.com` / `*.googleapis.com` dans `connect-src`.
5. **Images de couverture externes & avatars Google** : les covers hebergees par l'admin sur des CDN tiers (`course.coverUrl`) ou avatars Google (`lh3.googleusercontent.com`) seront bloquees par une `img-src` trop stricte tant que l'admin n'utilise pas exclusivement `/api/covers/[id]` ou un domaine CDN liste.
6. **Redirection MonCashConnect** : la navigation se fait via `window.location.href = data.paymentUrl` (`EnrollButton.tsx:197`), qui n'est pas soumise a `form-action` ni `connect-src`, donc non bloquee.
7. **Styles inline Next/Image et glows CSS** : `style={{ background: "radial-gradient(...)" }}` utilises dans plusieurs composants (`formations/[slug]/page.tsx:140,179`) requierent `'unsafe-inline'` dans `style-src`.

### A.8 XSS et injection

- **`dangerouslySetInnerHTML`** :
  - `src/app/layout.tsx:100` : `THEME_INIT_SCRIPT` (constante statique sans entree utilisateur -> sur).
  - `src/app/layout.tsx:105` & `src/app/(public)/page.tsx:55` : JSON-LD serialise avec `.replace(/</g, "\\u003c")` -> sur contre la fermeture de balise `</script>`.
- **Liens issus de la base de donnees (`SEC-09` — Elevee)** :
  - `src/components/player/PlayerView.tsx:347` : rend `<a href={res.url} target="_blank" rel="noopener noreferrer">` directement depuis `currentLesson.resources`. Meme si l'API admin valide aujourd'hui `http(s)`, aucun filtre defensif cote client (`/^https?:\/\//i`) ne bloque un lien `javascript:` issu d'une ancienne donnee ou d'une ecriture directe Firestore.
  - `src/lib/admin/cover.ts:15` : autorise `http://` en plus de `https://` pour les couvertures externes (contenu mixte HTTP sur site HTTPS).
- **Redirections (`?redirect=`)** : `getSafeRedirectPath` (`src/lib/auth/redirect.ts`) n'autorise que les chemins internes commencant par `/` (hors `//`). Sur.

### A.9 Authentification

- **Domaine Google autorise** : `signInWithPopup` (`AuthProvider.tsx:142`) repose sur la configuration Firebase Console (`Authorized domains`) — a verifier manuellement par l'utilisateur (`NON VÉRIFIÉ` depuis le code).
- **Reinitialisation de mot de passe** : `AuthForm.tsx` delegue a `sendPasswordResetEmail` ; `resetSuccess` affiche un message neutre cote UI (`t("auth.motDePasseOublieEnvoye")`), sans confirmer si l'e-mail existe en base (`auth/user-not-found` gere).
- **Claim admin & revocation** : Verifie cote serveur via `adminAuth.verifyIdToken(token, true)` (`checkRevoked = true`) dans `src/lib/admin/requireAdmin.ts:81`, `moncash/create/route.ts:63`, `moncash/verify/route.ts:80`. Cote client, `AuthProvider.tsx:75` verifie `tokenResult.claims.admin === true`.
- **Faille fonctionnelle liee aux jetons (`FUNC-01`)** : voir Section B (destruction du prototype `User` lors de `setUser({ ...user, displayName })`).

### A.10 Logs (`console.*` et `adminLogs`)

- **PII / Cles / `youtubeVideoId` / Corps webhook** :
  - `adminLogs` (`src/lib/admin/adminLog.ts`, `courses/[id]/lessons/route.ts:117-122`, `lessons/[lessonId]/route.ts:90-95`) : exclut explicitement `videoId`, `videoUrl`, `youtubeVideoId`. `acces/route.ts:96` enregistre `targetUid` (pas l'email). Conforme.
  - `console.*` serveur :
    - `src/lib/admin/requireAdmin.ts:97` : `console.error("[requireAdmin] verifyIdToken failed:", code, msg)` — `msg` brut peut contenir des metadonnees de jeton si un message d'erreur SDK l'inclut.
    - `src/lib/courses/queries.ts:131` : en mode `development` uniquement, logue `slug` non borne ; `54-56,107-109` mentionne les noms de variables.
    - Aucun `console.log` du corps complet du webhook MonCashConnect, d'e-mail d'eleve ou de `youtubeVideoId` n'a ete trouve dans `src/`.
  - `console.*` client : `AuthProvider.tsx:68` (dev-only) logue `err` brut lors d'echec `users/{uid}` ; `PlayerView.tsx:110` logue uniquement `errorCode` en dev.

### A.11 Dependances

- **`npm audit`** : **`NON VÉRIFIÉ`** (`ENOLOCK` — absence de `package-lock.json`, seul `bun.lock` existe).
- **Versions / utilisation** :
  - Runtime : `next` `16.4.6`, `react`/`react-dom` `19.3.0`, `firebase` `^12.19.0`, `firebase-admin` `13.6.0`, `lucide-react` `^1.82.0`, `motion` `^14.14.0`, `server-only` `0.0.1`. Toutes utilisees.
  - Dev : `@firebase/rules-unit-testing` `5.0.2`, `firebase-tools` `15.36.0`, `jest` `^30.5.2`, `ts-jest` `^29.4.15`, `tsx` `^4.23.15` (utilises par `test:rules` et `set-admin`), `eslint` `^9`, `eslint-config-next` `16.4.6`, `tailwindcss` `4.3.3`, `@tailwindcss/postcss` `4.3.3`, `@tailwindcss/turbopack` `4.3.3`, `typescript` `^5`.
  - Remarque : `package-lock.json` manquant bloque les pipelines `npm ci` / `npm audit` standard si Vercel ou CI utilise `npm`.

### A.12 Limitation de debit (Rate Limiting en Serverless)

- **Etat actuel (`SEC-12` — Elevee)** : **Aucune** limitation de débit sur :
  - `POST /api/moncash/create` (creation de sessions MonCash + ecritures Firestore)
  - `POST /api/moncash/verify` (appels HTTP sortants vers MonCashConnect + lectures Firestore)
  - `POST /api/moncash/webhook` (verification HMAC + transactions Firestore)
  - `POST /api/admin/acces`
  - Flux Auth client (protege uniquement par les quotas natifs Firebase Authentication, environ 100 req/IP/min selon configuration Identity Platform).
- **Pourquoi un compteur en memoire echoue en serverless** : sur Vercel Functions, chaque invocation/region peut tourner dans un isolat distinct et etre recyclee a tout moment — une `Map` en memoire ne partage ni ne persiste les compteurs.
- **Options sans ajout de package `npm` (comparatif)** :
  1. **Vercel Firewall / WAF Rate Limiting (Recommande en priorite)** : regles par IP/chemin directement a la peripherie Vercel avant meme l'execution Node.js (0 lecture Firestore, 0 dependance npm). *Cout & limites* : le plan Hobby gratuit inclut des regles WAF personnalisees limitees (jusqu'a 3 regles sans rate-limiting avance ; le rate-limiting configurable necessite **Vercel Pro $20/mois** + tarification WAF selon volume de requetes autorisees, ou Cloudflare Free en proxy devant Vercel avec **1 regle rate-limiting gratuite** jusqu'a 10s fenetre).
  2. **Compteur Firestore transactionnel/TTL (`rateLimits/{key}`)** : reutilise `firebase-admin` deja present (0 package supplementaire). *Cout & limites* : consomme au minimum **1 lecture + 1 ecriture Firestore par requete** (ou 1 ecriture avec shards/buckets fixes de 60s), ce qui peut vite entamer le quota Spark gratuit (`50 000 lectures/j`, `20 000 ecritures/j`) sous une attaque DDoS non filtree en amont ! A reserver comme garde-fou metier par `uid` (ex: max 5 creations de paiement / 15 min / `uid`) plutot que contre un flood anonyme par IP.
  3. **Firebase App Check (`reCAPTCHA v3` ou `Enterprise`)** : protege directement Firestore SDK client et les routes API sensibles via en-tete `X-Firebase-AppCheck` verifie par `getAdminAppCheck().verifyToken()`. *Cout & limites* : inclus avec Firebase ; `reCAPTCHA v3` gratuit jusqu'a **10 000 evaluations/mois** (via Google Cloud reCAPTCHA — au-dela tarification reCAPTCHA Enterprise). Attention : augmente la latence initiale client et peut bloquer certains navigateurs tres restrictifs/ad-blockers sur mobile si mal calibre.

---

## B. Correction fonctionnelle (parcours de bout en bout)

| Parcours | Etat / Bug identifie (`fichier:ligne`) | Impact utilisateur | Gravite |
| :--- | :--- | :--- | :--- |
| Inscription e-mail + paiement / profil | **`FUNC-01` (`src/lib/auth/AuthProvider.tsx:161,192`)** : `setUser({ ...userCredential.user, displayName })` et `setUser({ ...currentUser, displayName })` copient uniquement les proprietes propres enumerables de l'objet `User` Firebase et **detruisent ses methodes de prototype** (`getIdToken()`, `getIdTokenResult()`). | Juste apres inscription par e-mail ou modification du nom dans `/profil`, tout appel a `user.getIdToken()` dans `EnrollButton.tsx:150`, `MerciStatus`, `mes-formations` ou `admin` leve `TypeError: user.getIdToken is not a function` et bloque le paiement MonCash ! | **Critique** |
| Inscription e-mail (Firestore `users/{uid}`) | **`FUNC-02` (`src/lib/auth/AuthProvider.tsx:113-163`)** : `createUserWithEmailAndPassword` declenche immediatement `onAuthStateChanged`, qui execute `upsertUserDoc` **avant** `updateProfile` (`ligne 157`), creant `users/{uid}` avec `displayName: ""`. `signUpWithEmail` ne met jamais a jour `users/{uid}` ensuite. | Les nouveaux eleves inscrits par e-mail apparaissent sans nom dans l'admin (`/admin/eleves`) jusqu'a leur prochaine connexion. | **Elevee** |
| Acces protege (`/mes-formations/[slug]`, `/profil`) | **`FUNC-03` (`src/lib/auth/useRequireAuth.ts:12-14`)** : redirige vers `router.push("/connexion")` sans conserver `?redirect=<pathname+search>`. | Un eleve non connecte suivant un lien vers une lecon ou `/profil` est renvoye vers l'accueil/dashboard par defaut apres connexion au lieu de sa destination. | **Elevee** |
| Bouton d'inscription (`EnrollButton`) | **`FUNC-04` (`src/components/course/EnrollButton.tsx:33-69`)** : `checkingEnrollment` initialise a l'etat monte ; si `user` se deconnecte/reconnecte ou si `isAdmin` bascule sans demonter le composant, l'etat precedent (`enrolled` / `checkingEnrollment`) peut rester fige. | Risque d'affichage d'un squelette infini ou d'un etat inscrit errone lors d'un changement de session. | **Elevee** |
| Expiration des paiements `pending` a 24h | **`FUNC-05` (`src/app/api/moncash/create/route.ts:166`, `src/app/(student)/mes-formations/page.tsx:103-107`)** : les paiements restent `awaiting_payment` indefiniment (alors qu'une session MonCashConnect expire en **15 min** selon `moncashconnect.com/docs`). `mes-formations` tente de re-verifier ces vieux paiements a chaque visite. | Appels HTTP inutiles vers `/api/moncash/verify` et MonCashConnect ; commandes fantomes bloquees en attente indefiniment dans `/admin/paiements`. Sans Cloud Functions, expiration paresseuse requise cote serveur (`createdAt < now - 24h` -> `expired` lors de `verify`, `create`, ou cron Vercel / lecture admin). | **Elevee** |
| Navigation FAQ & routes liees | **`FUNC-06` (`src/components/layout/NavLinks.tsx:29`, `MobileMenu.tsx:41`)** : le lien pointe vers `/#faq` alors que la classe active teste `/faq` et qu'une page dediee `/faq` existe. | Etat actif du menu inexact sur `/faq` et ancre forcee vers l'accueil. | **Moyenne** |
| Connexion, Deconnexion, Lecteur, Progression, Acces manuel / Retrait | Lus dans `AuthForm.tsx`, `PlayerView.tsx`, `saveProgress`, `api/admin/acces/route.ts` : messages d'erreur clairs sur login/reset/sauvegarde progression (`500` lecons max) et idempotence `grant`/`revoke`. | Parcours globalement sains hors bugs `FUNC-01` a `FUNC-06` ci-dessus. | **Faible / OK** |

---

## C. Performance & Resilience

1. **Isolation client/serveur** : Verifiee — `firebase-admin` est marque dans `serverExternalPackages` (`next.config.ts:6`) et exclu du bundle client (`.next/static` : 0 occurrence). `src/lib/admin/requireAdmin.ts`, `src/lib/courses/queries.ts`, `src/lib/admin/adminLog.ts` importent `"server-only"`.
2. **Taille First Load JS / chunks** : Le build produit **40 fichiers** dans `.next/static/chunks/*.js` pour `2,407,134` octets (`2.41 MB` brut sur disque). Le plus gros chunk fait **`653 Ko`** brut (Firebase SDK + Motion), suivi de `224 Ko`, `161 Ko`, `153 Ko`, `110 Ko`, `93 Ko`. Sur reseau 3G/4G haitien, un chunk principal de `653 Ko` penalise le TTI mobile -> opportunite de lazy-loading (`next/dynamic`) sur `Motion` ou composants lourds non critiques au premier rendu, et d'eviter d'importer Firestore client sur les pages publiques purement statiques.
3. **Quotas Firestore (plan Spark gratuit : `50 000` lectures/j, `20 000` ecritures/j, `20 000` suppressions/j)** :
   - **`PERF-01` (Elevee)** :
     - `src/app/api/admin/stats/route.ts:17,32,40` lit **100% des documents** `courses`, `enrollments (active)` et `payments` a chaque ouverture du tableau de bord admin. Avec 2 000 paiements et 500 inscriptions, **10 visites admin consomment deja 25 000 lectures** (50% du quota journalier Spark) !
     - `src/app/api/admin/courses/route.ts:20` et `src/lib/learning/queries.ts:122` lisent toute la collection `courses` sans pagination.
     - `src/lib/learning/queries.ts:46-50,162-166` n'appliquent pas de `.limit()`.
   - **`PERF-02` (Moyenne)** : `AuthProvider.tsx:75` appelle `user.getIdTokenResult(true)` (force un appel reseau SecureToken API) a **chaque** `onAuthStateChanged`, soit a chaque rechargement de page, ralentissant `loading=false` de 200-600 ms.
4. **Cache Next.js 16.4 (`next.config.ts:13-14`, `node_modules/next/dist/docs`)** :
   - `cacheComponents: true` et `partialPrefetching: true` sont actives.
   - `export const instant = false;` (`src/app/(public)/formations/[slug]/page.tsx:18`, `src/app/admin/layout.tsx:16`, `src/app/(student)/mes-formations/[slug]/page.tsx:4`) est **valide** selon `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md` pour desactiver la validation instant sur les segments dynamiques sous `cacheComponents`.
   - `getPublishedCourses()` et `getPublishedCourseBySlug()` utilisent correctement `"use cache"`, `cacheTag`, `cacheLife({ stale: 60, revalidate: 300, expire: 3600 })` (`src/lib/courses/queries.ts:44-50,92-98`) et `revalidateCoursesCache` cote admin.
5. **Timeouts, AbortController, Retries (`PERF-03` — Moyenne)** :
   - Cote serveur : `AbortSignal.timeout(15000)` sur `pay-create`, `10000` sur `pay-status`, `4000` sur TikTok HEAD -> bien present. En revanche `verify/route.ts:294-367` boucle sequentiellement jusqu'a `(5 origines * 4 URLs) = 20` fetchs de `10s` possibles en pire cas (depassement du timeout serverless Vercel Hobby `10s`/`60s`) !
   - Cote client : aucun `AbortController`/timeout sur `fetch` dans `EnrollButton.tsx:171`, `MerciStatus.tsx`, `mes-formations/page.tsx`, ni `admin/apiClient.ts`. Le polling de `MerciStatus` (2.5s x 5) n'utilise pas de backoff progressif.
6. **Frontieres d'erreur (`PERF-03` — Moyenne)** : Absence totale de `src/app/error.tsx` et `src/app/global-error.tsx` (seul `src/app/not-found.tsx` existe). Une erreur runtime client/serveur non capturee affiche l'ecran generique Next.js non traduit sans bouton de reprise.

---

## D. Hygiene du code & du depot

| Constat (`HYG-*`) | Fichiers / Elements concernes | Impact |
| :--- | :--- | :--- |
| **`HYG-01` (Moyenne)** : 71 fichiers inutilises dans `public/assets/aistudio/` (`11.68 Mo` sur disque) | Un seul fichier est reference dans `src/` : `/assets/aistudio/rs_w_1280_e5a11620.webp`. Les 71 autres (`.png`, `.jpg`, fichiers sans extension `Paste_November_27...`) sont des assets orphelins importes ou de travail. | Alourdit les deploiements Vercel, le depot et le cache statique. |
| **`HYG-02` (Faible)** : Code mort, placeholders & cles i18n orphelines | - `src/lib/auth/requireAuth.ts` : jamais importe (`moncash/create` et `verify` dupliquent `verifyIdToken`).<br>- 11 fichiers `.gitkeep` inutiles dans `src/`.<br>- `scripts/update-messages.js` : script ponctuel de migration.<br>- **36 cles i18n** presentes dans les 3 dictionnaires mais non referencees dans `src/` (liste exacte en Section G). | Confusion de maintenance et poids inutile des dictionnaires JSON. |
| **`HYG-03` (Moyenne)** : Lockfile & Node version | Absence de `package-lock.json` (`npm audit` echoue en `ENOLOCK`) alors que `bun.lock` est present ; absence de `.nvmrc` (Node declare `22.x` dans `package.json:6`). | Echec d'audit automatise `npm audit` / `npm ci`. |

---

## E. Responsive & Accessibilite

Revue basee sur l'inspection des classes Tailwind dans `src/` (le rendu visuel sur terminal physique `320px-430px` / zoom 200% reste `NON VÉRIFIÉ` faute de navigateur headless execute en Phase 1) :
1. **Zoom automatique iOS Safari `< 16px` (`A11Y-01` — Moyenne)** :
   - De nombreux `<input>`, `<select>` et `<textarea>` utilisent `text-sm` (`14px`) ou `text-xs` (`12px`) au lieu de `text-base sm:text-sm` (`16px` sur mobile) : `AuthForm.tsx`, `profil/page.tsx`, `mes-formations/page.tsx:486`, `admin/eleves/page.tsx`, `admin/paiements/page.tsx`, `admin/formations/page.tsx`, `admin/formations/[id]/page.tsx`, `admin/page.tsx:505` (`text-xs`). Sur iOS Safari, tout champ `< 16px` provoque un zoom force du viewport.
2. **Cibles tactiles `< 44px` (`A11Y-02` — Moyenne)** :
   - `AdminShell.tsx:259` et `StudentShell.tsx:216` : boutons menu/fermeture `h-9 w-9` (`36px`).
   - `VideoPlayer.tsx:121` : bouton bascule lecteur `min-h-[36px]`.
   - `DeleteCourseDialog.tsx` / `DeletePaymentsDialog.tsx` : bouton fermer `w-9 h-9` (`36px`).
   - `HeroPreview.tsx` : controles transport `28px`.
   - `MerciStatus.tsx:771` (`32px`), `admin/formations/[id]/page.tsx:823,832` (`28px`), `a-propos/page.tsx:212,275`.
3. **Viewport & debordements (`A11Y-03` — Faible/Moyenne)** :
   - `AdminShell.tsx:272` et `StudentShell.tsx:233` utilisent `h-screen` sur desktop (preferer `h-dvh`).
   - `FinalCta.tsx:60` (`w-[780px]`) et `Affirmation.tsx:13` (`w-[620px]`) sont encapsules dans des conteneurs `overflow-hidden`, ce qui contient le debordement horizontal sur `320px`, mais reste a confirmer visuellement.
4. **Accessibilite structurelle** : `<h1>` unique present par page publique, `MotionProvider` applique `reducedMotion="user"` pour `prefers-reduced-motion`, attributs `aria-hidden` sur les icones decoratives, anneaux `focus-visible` presents sur la majorite des boutons/liens. Contraste de couleurs (WCAG AA) : `NON VÉRIFIÉ` automatiquement.

---

## F. SEO

1. **`robots.txt` absent (`SEO-01` — Elevee)** : Aucun `src/app/robots.ts` ni `public/robots.txt` (`node_modules/next/dist/docs/01-app/03-api-reference/01-file-conventions/01-metadata/robots.md`). Les crawlers peuvent indexer les routes techniques (`/connexion`, `/inscription`, `/merci`, `/profil`, `/admin`).
2. **`noindex` manquant sur routes privees/auth/merci (`SEO-02` — Elevee)** :
   - `/merci` (`src/app/(public)/merci/page.tsx:9-19`) exporte `metadata` **sans** `robots: { index: false, follow: false }`, et apparait indexable.
   - `(auth)/connexion`, `(auth)/inscription`, `(auth)/mot-de-passe-oublie`, et `(student)/*` (`/mes-formations`, `/mes-formations/[slug]`, `/profil`) sont des Client Components sans fichier `layout.tsx` serveur definissant `robots: { index: false, follow: false }` (seul `src/app/admin/layout.tsx` en a un ? A verifier : `admin/layout.tsx` est server ou client — `no-index` non present dans `(auth)` ni `(student)`).
3. **Marqueurs de brouillon juridique publics (`SEO-03` — Elevee)** :
   - `LEGAL_DRAFT = true` (`src/lib/legal/config.ts:5`) affiche `<LegalDraftNotice />` et `<TodoMark />` sur `/conditions`, `/confidentialite` et `/faq`, qui sont **indexes** dans `src/app/sitemap.ts:20-38` et `src/app/llms.txt/route.ts:22-25` !
4. **Canonical, OG Images et JSON-LD (`SEO-04` — Moyenne)** :
   - `alternates.canonical` absent sur les pages publiques (dont `/formations/[slug]`).
   - `openGraph.images` absent sur `layout.tsx` et `formations/[slug]/page.tsx:40-46` (pas d'image de partage sur WhatsApp/Facebook/X alors que la couverture existe).
   - JSON-LD present pour `Organization` (`layout.tsx:80-86`) et `WebSite` (`(public)/page.tsx`), mais **absent** pour `Course` (sur `/formations/[slug]`) et `FAQPage` (sur `/faq`).
5. **HTTP 404 vs soft 404 & SSR/CSR** : `/formations/[slug]/page.tsx:54-56` appelle bien `notFound()` (vrai 404). Les pages marketing et le catalogue `/formations` et `/formations/[slug]` sont rendus cote serveur (SSR/Cache), favorables au SEO.

---

## G. Traductions & coherence linguistique (`kr.json`, `fr.json`, `en.json`)

- **Parite des cles** : Verification automatisee — les trois fichiers contiennent exactement **638 cles** chacun, avec **0 cle manquante** entre `kr`, `fr` et `en`.
- **Langue verrouillee (`I18N-03`)** : `src/lib/i18n/index.ts:26` fixe `lang = "kr"` par defaut et aucun selecteur ne passe `"fr"` ou `"en"` (les fichiers `fr.json` et `en.json` sont integres au bundle sans jamais etre selectionnes cote utilisateur, tout en devant rester alignes sur les memes cles).
- **Textes en dur dans le JSX (`I18N-01` — Moyenne)** :
  - `src/app/(public)/formations/[slug]/page.tsx:191` : `"Pri"` en dur au lieu de `t(...)`.
  - `src/components/player/LessonList.tsx:66` : `"Modil {modIdx + 1}"` en dur au lieu d'une cle i18n.
- **Formatage de dates en `"fr-FR"` en dur (`I18N-02` — Moyenne)** :
  - `MerciStatus.tsx:92,103`, `mes-formations/page.tsx:812`, `admin/page.tsx:246,566,573`, `admin/paiements/page.tsx:198,206,355`, `src/lib/auth/profile.ts:39` appellent `toLocaleDateString("fr-FR")` / `toLocaleString("fr-FR")`.
- **Melange de langues dans les messages d'erreur API (`I18N-03` — Moyenne)** :
  - `create/route.ts` et `verify/route.ts` repondent en **creole haitien** (`"Otantifikasyon obligatwa..."`, `"Erè sèvè..."`) et utilisent des libelles en dur hors `t()`, tandis que `admin/acces/route.ts`, `admin/courses/**/route.ts`, `admin/lessons/[lessonId]/route.ts`, `admin/covers/route.ts` melangent **francais** (`"Formation introuvable."`, `"Corps JSON invalide."`) et **creole** (`"Konfigirasyon sèvè a enkonplè."`, `"Erè sèvè."`), et `webhook/route.ts` repond en **anglais**.
- **36 cles i18n inutilisees** detectees dans les 3 fichiers :
  `paiement.{continuer,enCours,echoue}`, `accueil.{description,detail,boutonPrincipal,boutonSecondaire}`, `hero.apercu.{duree,progressionZero}`, `fonctionnalites.{titreSection,sousTitreSection}`, `auth.deconnexion`, `profil.{sousTitre,chargement}`, `catalogue.{boutonAcheter,modalTitre,payerAvec,traitementEnCours,fermer,duree}`, `mesFormations.{aucuneLeconDemarre,chargement,leconCourante,aucuneLecon}`, `admin.tableau.titre`, `admin.formations.statut.{publie,brouillon}`, `admin.lecon.champVideoId`, `lecteur.{chargement,lesonTermine,dejaTerminee}`, `merci.{badge,montanLabel}`, `apropos.{ctaWhatsapp,carteBaseLabel,cartePresenceValeur}`.

---

## H. Plan de test de charge & Checklist de mise en production

> **Regle respectee** : Aucun test de charge n'a ete execute contre la production ni contre le vrai projet Firebase. Ce document fournit uniquement le plan reproductible.

### H.1 Plan de test de charge priorise (environnement de staging isole uniquement)

**Pre-requis obligatoires** : projet Firebase dedie + sandbox MonCashConnect (`sk_test_proj_...`) + deploiement Vercel Preview/Staging isole. **Jamais** sur la base de production ni avec `sk_proj_...` Live.

1. **Scenario 1 — Trafic catalogue & pages publiques (lecture SSR/Cache)**
   - *Cibles* : `GET /`, `GET /formations`, `GET /formations/[slug]`.
   - *Charge* : montee progressive `10 -> 100 VU` pendant `5 min` (outil suggere ponctuellement en Phase 2/CI : `npx autocannon` ou `k6` sur machine locale).
   - *Seuils d'acceptation* : `p95 < 400 ms`, erreurs 5xx = `0%`, lectures Firestore stables grace a `"use cache"` (quasi `0` lecture par requete apres hit cache).
2. **Scenario 2 — Rafale de retours paiement & double-clic checkout (avant & apres correctifs)**
   - *Cibles* : `POST /api/moncash/create` (10 clics simultanes meme `uid` + meme `courseId`), `POST /api/moncash/verify` (50 req/min).
   - *Charge* : `5-20 VU` authentifies (comptes de test), duree `2 min`.
   - *Seuils d'acceptation* : 1 seul document `payments` `awaiting_payment` reutiliser pendant 15 min ; `p95 < 1500 ms` ; refus `429` propre une fois le rate limit active ; aucune activation sans paiement `completed`.
3. **Scenario 3 — Concurrence Webhook + `/api/moncash/verify` (idempotence transactionnelle)**
   - *Cible* : envoi simultane de `POST /api/moncash/webhook` (signature V2 valide) et `POST /api/moncash/verify` pour la meme reference.
   - *Seuils d'acceptation* : 1 seul document `enrollments/{uid}_{courseId}` cree (`active`), zero erreur `ABORTED` non geree, statut final `paid`, `amount` strictement conforme au cours.
4. **Scenario 4 — Administration sous volume simule**
   - *Cibles* : `GET /api/admin/stats`, `GET /api/admin/payments`, `GET /api/admin/students` sur une base seedee avec `5 000` paiements et `1 000` eleves.
   - *Seuils d'acceptation* : verifier que `/api/admin/stats` (apres optimisation/aggregation queries) consomme `< 50` lectures au lieu de `6 000+` lectures, `p95 < 800 ms`.

### H.2 Checklist de pre-lancement

- [ ] Correctifs Critiques (`SEC-01`, `SEC-02`, `FUNC-01`) appliques et testes.
- [ ] Regles Firestore mises a jour (`archived != true`, limites champs `users`) et validees via `npm run test:rules` (avec JDK installe).
- [ ] `MCC_SECRET_KEY` Live (`sk_proj_...`) et `MCC_WEBHOOK_SECRET` Live configures uniquement dans Vercel Production ; mode Sandbox isole dans Preview.
- [ ] Domaines autorises configures dans MonCashConnect (production exact) et Firebase Auth (`Authorized domains`).
- [ ] Custom claim `{ admin: true }` pose uniquement sur les comptes admin et verifie avec `scripts/set-admin.ts`.
- [ ] `LEGAL_DRAFT` bascule a `false` uniquement apres relecture juridique des pages `/conditions`, `/confidentialite`, `/faq` (suppression de `<TodoMark />`).
- [ ] `robots.ts` actif, `noindex` sur `/merci`, `(auth)/*`, `(student)/*`, `/admin/*`, images OG presentes, `images.remotePatterns` verrouille.
- [ ] Alertes budget/quotas configurees sur Firebase (passage Blaze si depassement anticipe de `50k` lectures / `20k` ecritures/j) et Vercel WAF active.

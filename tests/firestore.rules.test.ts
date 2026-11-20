/**
 * tests/firestore.rules.test.ts
 *
 * Tests des règles de sécurité Firestore avec l'émulateur local.
 * Lancer avec : npm run test:rules
 *
 * Couverture :
 *  1. Visiteur non connecté
 *  2. Élève non inscrit
 *  3. Élève avec inscription active
 *  4. Élève avec inscription révoquée
 *  5. Mutations interdites côté client (role, admin, enrollments, progress)
 *  6. Paiements
 *  7. Écriture dans courses / lessons
 *  8. Admin (custom claim)
 *  9. Collection inconnue
 */

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// ─── Configuration ───────────────────────────────────────────────────────────
const PROJECT_ID = "bayondy-rules-test";
const FIRESTORE_PORT = 8080;

let testEnv: RulesTestEnvironment;

// ─── Setup / Teardown ─────────────────────────────────────────────────────────
beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      port: FIRESTORE_PORT,
      host: "127.0.0.1",
      rules: readFileSync(resolve(__dirname, "../firestore.rules"), "utf-8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Prépare les données Firestore en contournant les règles (admin SDK émulé) */
async function seedData(
  collectionPath: string,
  docId: string,
  data: Record<string, unknown>
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), collectionPath, docId), data);
  });
}

function unauthenticatedCtx() {
  return testEnv.unauthenticatedContext();
}

function userCtx(uid: string, extraClaims?: Record<string, unknown>) {
  return testEnv.authenticatedContext(uid, extraClaims);
}

function adminCtx(uid: string) {
  return testEnv.authenticatedContext(uid, { admin: true });
}

// ─── Données de seed ──────────────────────────────────────────────────────────
const PUBLISHED_COURSE_ID = "course-published-001";
const DRAFT_COURSE_ID = "course-draft-001";
const LESSON_FREE_ID = "lesson-free-001";
const LESSON_PAID_ID = "lesson-paid-001";
const LESSON_OTHER_COURSE_ID = "lesson-other-001";
const USER_A = "user-aaa";
const USER_B = "user-bbb";
const PAYMENT_ID = "payment-001";

async function seedAll() {
  // Cours published
  await seedData("courses", PUBLISHED_COURSE_ID, {
    slug: "test-published",
    title: "Test Published",
    status: "published",
    priceUSD: 0,
    priceHTG: 0,
  });
  // Cours draft
  await seedData("courses", DRAFT_COURSE_ID, {
    slug: "test-draft",
    title: "Test Draft",
    status: "draft",
    priceUSD: 0,
    priceHTG: 0,
  });
  // Leçon gratuite
  await seedData("lessons", LESSON_FREE_ID, {
    courseId: PUBLISHED_COURSE_ID,
    isFreePreview: true,
    title: "Leçon gratuite",
    order: 1,
  });
  // Leçon payante du cours published
  await seedData("lessons", LESSON_PAID_ID, {
    courseId: PUBLISHED_COURSE_ID,
    isFreePreview: false,
    title: "Leçon payante",
    order: 2,
  });
  // Leçon d'un autre cours (pour test cross-course)
  await seedData("lessons", LESSON_OTHER_COURSE_ID, {
    courseId: DRAFT_COURSE_ID,
    isFreePreview: false,
    title: "Leçon autre cours",
    order: 1,
  });
  // Paiement de USER_A
  await seedData("payments", PAYMENT_ID, {
    uid: USER_A,
    courseId: PUBLISHED_COURSE_ID,
    amount: 10,
    currency: "USD",
    method: "moncash",
    status: "paid",
  });
}

// ─── 1. Visiteur non connecté ─────────────────────────────────────────────────
describe("1. Visiteur non connecté", () => {
  beforeEach(seedAll);

  it("peut lire un cours published", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertSucceeds(getDoc(doc(db, "courses", PUBLISHED_COURSE_ID)));
  });

  it("ne peut pas lire un cours draft", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertFails(getDoc(doc(db, "courses", DRAFT_COURSE_ID)));
  });

  it("peut lire une leçon en aperçu gratuit", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertSucceeds(getDoc(doc(db, "lessons", LESSON_FREE_ID)));
  });

  it("ne peut pas lire une leçon payante", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertFails(getDoc(doc(db, "lessons", LESSON_PAID_ID)));
  });
});

// ─── 2. Élève non inscrit ─────────────────────────────────────────────────────
describe("2. Élève non inscrit", () => {
  beforeEach(seedAll);

  it("ne peut pas lire une leçon payante", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(getDoc(doc(db, "lessons", LESSON_PAID_ID)));
  });
});

// ─── 3. Élève avec inscription active ─────────────────────────────────────────
describe("3. Élève avec inscription active", () => {
  beforeEach(async () => {
    await seedAll();
    await seedData(`enrollments`, `${USER_A}_${PUBLISHED_COURSE_ID}`, {
      uid: USER_A,
      courseId: PUBLISHED_COURSE_ID,
      status: "active",
      source: "payment",
      paymentId: PAYMENT_ID,
      grantedAt: serverTimestamp(),
      progress: { completedLessonIds: [], lastLessonId: "" },
    });
  });

  it("peut lire une leçon de son cours inscrit", async () => {
    const db = userCtx(USER_A).firestore();
    await assertSucceeds(getDoc(doc(db, "lessons", LESSON_PAID_ID)));
  });

  it("ne peut pas lire une leçon d'un autre cours (non inscrit)", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(getDoc(doc(db, "lessons", LESSON_OTHER_COURSE_ID)));
  });
});

// ─── 4. Élève avec inscription révoquée ───────────────────────────────────────
describe("4. Élève avec inscription révoquée", () => {
  beforeEach(async () => {
    await seedAll();
    await seedData(`enrollments`, `${USER_A}_${PUBLISHED_COURSE_ID}`, {
      uid: USER_A,
      courseId: PUBLISHED_COURSE_ID,
      status: "revoked",
      source: "payment",
      paymentId: PAYMENT_ID,
      grantedAt: serverTimestamp(),
      progress: { completedLessonIds: [], lastLessonId: "" },
    });
  });

  it("ne peut pas lire une leçon payante (inscription révoquée)", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(getDoc(doc(db, "lessons", LESSON_PAID_ID)));
  });
});

// ─── 5. Mutations interdites côté client ─────────────────────────────────────
describe("5. Mutations interdites côté client", () => {
  beforeEach(async () => {
    await seedAll();
    await seedData("users", USER_A, {
      displayName: "Alice",
      email: "alice@test.com",
      photoURL: null,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    await seedData(`enrollments`, `${USER_A}_${PUBLISHED_COURSE_ID}`, {
      uid: USER_A,
      courseId: PUBLISHED_COURSE_ID,
      status: "active",
      source: "payment",
      paymentId: PAYMENT_ID,
      grantedAt: serverTimestamp(),
      progress: { completedLessonIds: [], lastLessonId: "" },
    });
  });

  it("ne peut pas s'écrire un champ role dans users", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      updateDoc(doc(db, "users", USER_A), { role: "admin" })
    );
  });

  it("ne peut pas modifier le status de son inscription", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      updateDoc(doc(db, "enrollments", `${USER_A}_${PUBLISHED_COURSE_ID}`), {
        status: "active", // même valeur — le champ n'est pas dans hasOnly(['progress'])
      })
    );
  });

  it("ne peut pas créer une inscription pour lui-même", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      setDoc(doc(db, "enrollments", `${USER_A}_new-course`), {
        uid: USER_A,
        courseId: "new-course",
        status: "active",
        source: "manual",
        paymentId: null,
        grantedAt: serverTimestamp(),
        progress: { completedLessonIds: [], lastLessonId: "" },
      })
    );
  });

  it("peut modifier le progress de son inscription active", async () => {
    const db = userCtx(USER_A).firestore();
    await assertSucceeds(
      updateDoc(doc(db, "enrollments", `${USER_A}_${PUBLISHED_COURSE_ID}`), {
        progress: {
          completedLessonIds: [LESSON_FREE_ID],
          lastLessonId: LESSON_FREE_ID,
        },
      })
    );
  });

  it("ne peut pas modifier le progress de l'inscription d'un autre", async () => {
    // USER_B tente de modifier l'inscription de USER_A
    const db = userCtx(USER_B).firestore();
    await assertFails(
      updateDoc(doc(db, "enrollments", `${USER_A}_${PUBLISHED_COURSE_ID}`), {
        progress: {
          completedLessonIds: [LESSON_PAID_ID],
          lastLessonId: LESSON_PAID_ID,
        },
      })
    );
  });

  it("ne peut pas ajouter un champ inconnu dans progress", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      updateDoc(doc(db, "enrollments", `${USER_A}_${PUBLISHED_COURSE_ID}`), {
        progress: {
          completedLessonIds: [],
          lastLessonId: "",
          maliciousField: true, // non autorisé
        },
      })
    );
  });
});

// ─── 6. Paiements ─────────────────────────────────────────────────────────────
describe("6. Paiements", () => {
  beforeEach(seedAll);

  it("élève peut lire son propre paiement", async () => {
    const db = userCtx(USER_A).firestore();
    await assertSucceeds(getDoc(doc(db, "payments", PAYMENT_ID)));
  });

  it("élève ne peut pas lire le paiement d'un autre", async () => {
    const db = userCtx(USER_B).firestore();
    await assertFails(getDoc(doc(db, "payments", PAYMENT_ID)));
  });

  it("élève ne peut pas écrire dans payments", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      setDoc(doc(db, "payments", "new-payment"), {
        uid: USER_A,
        courseId: PUBLISHED_COURSE_ID,
        amount: 10,
        currency: "USD",
        method: "moncash",
        status: "paid",
      })
    );
  });
});

// ─── 7. Écriture dans courses / lessons refusée aux élèves ───────────────────
describe("7. Écriture courses / lessons refusée aux élèves", () => {
  beforeEach(seedAll);

  it("élève ne peut pas écrire dans courses", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      setDoc(doc(db, "courses", "new-course"), {
        slug: "new",
        title: "Hack",
        status: "published",
      })
    );
  });

  it("élève ne peut pas écrire dans lessons", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      setDoc(doc(db, "lessons", "new-lesson"), {
        courseId: PUBLISHED_COURSE_ID,
        isFreePreview: true,
        title: "Hack",
      })
    );
  });
});

// ─── 8. Admin (custom claim) ──────────────────────────────────────────────────
describe("8. Admin (custom claim admin: true)", () => {
  const ADMIN_UID = "admin-001";

  beforeEach(seedAll);

  it("peut écrire dans courses", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertSucceeds(
      setDoc(doc(db, "courses", "admin-course"), {
        slug: "admin-course",
        title: "Admin Course",
        shortDescription: "Desc",
        description: "Description complète",
        priceUSD: 0,
        priceHTG: 0,
        coverUrl: "https://example.com/cover.jpg",
        level: "debutant",
        language: "ht",
        durationMinutes: 60,
        status: "draft",
        syllabus: [],
        lessonsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });

  it("peut écrire dans lessons", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertSucceeds(
      setDoc(doc(db, "lessons", "admin-lesson"), {
        courseId: PUBLISHED_COURSE_ID,
        moduleId: "mod-1",
        moduleTitle: "Module 1",
        title: "Leçon admin",
        order: 10,
        youtubeVideoId: "abc123",
        durationMinutes: 15,
        isFreePreview: false,
        resources: [],
      })
    );
  });

  it("peut lire un cours draft", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertSucceeds(getDoc(doc(db, "courses", DRAFT_COURSE_ID)));
  });

  it("peut lire n'importe quelle leçon", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertSucceeds(getDoc(doc(db, "lessons", LESSON_PAID_ID)));
  });

  it("ne peut pas écrire dans payments côté client", async () => {
    // Même admin : les paiements ne sont jamais écrits côté client
    const db = adminCtx(ADMIN_UID).firestore();
    await assertFails(
      setDoc(doc(db, "payments", "admin-payment"), {
        uid: ADMIN_UID,
        courseId: PUBLISHED_COURSE_ID,
        amount: 0,
        currency: "USD",
        method: "card",
        status: "paid",
      })
    );
  });

  it("ne peut pas écrire dans enrollments côté client", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertFails(
      setDoc(doc(db, "enrollments", `${ADMIN_UID}_${PUBLISHED_COURSE_ID}`), {
        uid: ADMIN_UID,
        courseId: PUBLISHED_COURSE_ID,
        status: "active",
        source: "manual",
        paymentId: null,
        grantedAt: serverTimestamp(),
        progress: { completedLessonIds: [], lastLessonId: "" },
      })
    );
  });
});

// ─── 9. Collection inconnue ───────────────────────────────────────────────────
describe("9. Collection inconnue", () => {
  it("lecture refusée pour tous", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertFails(getDoc(doc(db, "unknown_collection", "some-doc")));
  });

  it("écriture refusée même pour un admin", async () => {
    const db = adminCtx("admin-001").firestore();
    await assertFails(
      setDoc(doc(db, "unknown_collection", "some-doc"), { data: true })
    );
  });
});

// ─── 10. adminLogs — aucun accès client ───────────────────────────────────────
describe("10. adminLogs — aucune lecture ni écriture côté client", () => {
  const ADMIN_LOG_ID = "log-001";
  const ADMIN_UID = "admin-001";

  beforeEach(async () => {
    // Seed d'un log d'audit via bypass des règles (simule l'Admin SDK serveur)
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "adminLogs", ADMIN_LOG_ID), {
        adminUid: ADMIN_UID,
        action: "course.create",
        target: { type: "course", id: "course-001" },
        summary: "Titre: test",
        timestamp: serverTimestamp(),
      });
    });
  });

  it("visiteur non connecté ne peut pas lire adminLogs", async () => {
    const db = unauthenticatedCtx().firestore();
    await assertFails(getDoc(doc(db, "adminLogs", ADMIN_LOG_ID)));
  });

  it("élève authentifié ne peut pas lire adminLogs", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(getDoc(doc(db, "adminLogs", ADMIN_LOG_ID)));
  });

  it("admin authentifié ne peut pas lire adminLogs côté client", async () => {
    // La lecture reste refusée côté client même pour admin — uniquement Admin SDK
    const db = adminCtx(ADMIN_UID).firestore();
    await assertFails(getDoc(doc(db, "adminLogs", ADMIN_LOG_ID)));
  });

  it("admin authentifié ne peut pas écrire dans adminLogs côté client", async () => {
    const db = adminCtx(ADMIN_UID).firestore();
    await assertFails(
      setDoc(doc(db, "adminLogs", "new-log"), {
        adminUid: ADMIN_UID,
        action: "course.update",
        target: { type: "course", id: "course-001" },
        summary: "Test",
        timestamp: serverTimestamp(),
      })
    );
  });

  it("élève ne peut pas écrire dans adminLogs", async () => {
    const db = userCtx(USER_A).firestore();
    await assertFails(
      setDoc(doc(db, "adminLogs", "hack-log"), {
        adminUid: USER_A,
        action: "access.grant",
        target: { type: "enrollment", id: `${USER_A}_course-001` },
        summary: "Tentative de hack",
        timestamp: serverTimestamp(),
      })
    );
  });
});

/**
 * scripts/set-admin.ts
 *
 * Donne ou retire le custom claim `admin: true` à un utilisateur Firebase.
 * Usage :
 *   npm run set-admin -- add user@example.com
 *   npm run set-admin -- remove user@example.com
 *
 * Prérequis : FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL,
 * FIREBASE_ADMIN_PRIVATE_KEY dans .env.local (ne jamais commiter).
 *
 * Ce script ne tourne qu'en local. Aucun secret dans le code.
 */

import { initializeApp, deleteApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import * as path from "path";

// Chargement manuel de .env.local (pas de dotenv pour éviter une dépendance)
function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(
      `\n❌  Variable manquante : ${name}\n` +
        `    Ajoutez-la dans .env.local avant de relancer ce script.\n` +
        `    Format : ${name}=votre_valeur\n`
    );
    process.exit(1);
  }
  return value;
}

async function main(): Promise<void> {
  loadEnvLocal();

  const projectId = requireEnvVar("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = requireEnvVar("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKey = requireEnvVar("FIREBASE_ADMIN_PRIVATE_KEY").replace(
    /\\n/g,
    "\n"
  );

  const action = process.argv[2]; // "add" ou "remove"
  const email = process.argv[3];

  if (!["add", "remove"].includes(action) || !email) {
    console.error(
      "\n❌  Usage : npm run set-admin -- add|remove email@exemple.com\n"
    );
    process.exit(1);
  }

  // Initialisation firebase-admin (jamais importé depuis le code client)
  const app =
    getApps().length > 0
      ? getApps()[0]
      : initializeApp({
          credential: cert({ projectId, clientEmail, privateKey }),
          projectId,
        });

  const auth = getAuth(app);

  try {
    const user = await auth.getUserByEmail(email);
    const claims = action === "add" ? { admin: true } : { admin: false };
    await auth.setCustomUserClaims(user.uid, claims);

    const status = action === "add" ? "✅ Admin accordé" : "✅ Admin retiré";
    console.log(`\n${status} pour ${email} (uid: ${user.uid})\n`);
    console.log(
      "⚠️  L'utilisateur doit se déconnecter et se reconnecter pour que le claim prenne effet.\n"
    );
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    if (error.code === "auth/user-not-found") {
      console.error(`\n❌  Aucun compte Firebase trouvé pour : ${email}\n`);
    } else {
      console.error(`\n❌  Erreur : ${error.message ?? String(err)}\n`);
    }
    process.exit(1);
  } finally {
    await deleteApp(app!);
  }
}

main();

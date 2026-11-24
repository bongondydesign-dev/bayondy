// server-only — ne jamais importer côté client pour préserver les secrets
import "server-only";

export interface TranzakConfig {
  baseUrl: string;
  apiKey: string;
  webhookSecret: string;
  isSandbox: boolean;
}

/**
 * Récupère la configuration Tranzak depuis les variables d'environnement.
 * Règle 1 : Aucune clé n'est affichée, loguée ou écrite dans le code.
 * Règle 2 : Seules les clés de test (tk_test_...) sont autorisées en sandbox/dev.
 */
export function getTranzakConfig(): TranzakConfig {
  const baseUrl = process.env.TRANZAK_BASE_URL?.trim() || "https://dashboard.tranzak.co";
  const apiKey = process.env.TRANZAK_API_KEY?.trim() || "";
  const webhookSecret = process.env.TRANZAK_WEBHOOK_SECRET?.trim() || "";
  const env = (process.env.TRANZAK_ENV?.trim() || "sandbox").toLowerCase();
  const isSandbox = env !== "production";

  if (!apiKey) {
    throw new Error(
      "[Tranzak] La variable TRANZAK_API_KEY est manquante dans l'environnement."
    );
  }

  // Règle 2 du guide Tranzak : en mode non-production, refuser toute clé qui ne commence pas par tk_test_
  if (isSandbox && !apiKey.startsWith("tk_test_")) {
    throw new Error(
      "[Tranzak] En mode sandbox/test, TRANZAK_API_KEY doit commencer par 'tk_test_'."
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/+$/, ""), // Supprime tout slash final
    apiKey,
    webhookSecret,
    isSandbox,
  };
}

/**
 * Vérifie si Tranzak est configuré dans l'environnement courant sans lever d'exception.
 */
export function isTranzakConfigured(): boolean {
  try {
    const config = getTranzakConfig();
    return Boolean(config.apiKey);
  } catch {
    return false;
  }
}

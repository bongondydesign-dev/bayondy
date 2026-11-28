export function extractAuthErrorCode(err: unknown): string {
  if (!err || typeof err !== "object") {
    return "";
  }

  const maybeErr = err as { code?: unknown; message?: unknown };
  if (typeof maybeErr.code === "string" && maybeErr.code.trim()) {
    return maybeErr.code.trim();
  }

  if (typeof maybeErr.message === "string") {
    const match = maybeErr.message.match(/\((auth\/[a-z0-9-]+)\)/i);
    if (match?.[1]) {
      return match[1].toLowerCase();
    }
  }

  return "";
}

export function shouldIgnoreAuthError(errorCode: string): boolean {
  return (
    errorCode === "auth/popup-closed-by-user" ||
    errorCode === "auth/cancelled-popup-request"
  );
}

export function extractSafeAuthErrorDetail(err: unknown): string | null {
  const code = extractAuthErrorCode(err);
  if (!code) {
    return null;
  }

  if (
    process.env.NODE_ENV === "development" &&
    code === "auth/missing-config" &&
    err &&
    typeof err === "object" &&
    "missingVars" in err &&
    Array.isArray((err as { missingVars?: unknown }).missingVars)
  ) {
    const vars = (err as { missingVars: unknown[] }).missingVars.filter(
      (v): v is string => typeof v === "string" && v.startsWith("NEXT_PUBLIC_FIREBASE_")
    );
    if (vars.length > 0) {
      return `${code} (${vars.join(", ")})`;
    }
  }

  if (/^auth\/[a-z0-9-]+$/i.test(code)) {
    return code;
  }

  return null;
}

export function getAuthErrorMessageKey(errorCode: string): string {
  if (errorCode.startsWith("auth/requests-from-referer-")) {
    return "auth.erreurs.appNonAutorisee";
  }

  switch (errorCode) {
    case "auth/email-already-in-use":
      return "auth.erreurs.emailDejaUtilise";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "auth.erreurs.identifiantsInvalides";
    case "auth/weak-password":
      return "auth.erreurs.motDePasseFaible";
    case "auth/invalid-email":
      return "auth.erreurs.emailInvalide";
    case "auth/too-many-requests":
      return "auth.erreurs.tropDeTentatives";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "auth.erreurs.popupFermee";
    case "auth/popup-blocked":
      return "auth.erreurs.popupBloquee";
    case "auth/unauthorized-domain":
      return "auth.erreurs.domaineNonAutorise";
    case "auth/operation-not-allowed":
      return "auth.erreurs.methodeNonAutorisee";
    case "auth/account-exists-with-different-credential":
      return "auth.erreurs.compteAutreMethode";
    case "auth/missing-config":
      return "auth.erreurs.configManquante";
    case "auth/invalid-api-key":
      return "auth.erreurs.cleApiInvalide";
    case "auth/app-not-authorized":
      return "auth.erreurs.appNonAutorisee";
    case "auth/network-request-failed":
      return "auth.erreurs.erreurReseau";
    default:
      return "auth.erreurs.generique";
  }
}

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

export function getAuthErrorMessageKey(errorCode: string): string {
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
    case "auth/invalid-api-key":
    case "auth/app-not-authorized":
    case "auth/missing-config":
      return "auth.erreurs.configurationInvalide";
    case "auth/network-request-failed":
      return "auth.erreurs.erreurReseau";
    default:
      return "auth.erreurs.generique";
  }
}

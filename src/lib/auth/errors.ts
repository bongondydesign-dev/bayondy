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
      return "auth.erreurs.popupFermee";
    case "auth/network-request-failed":
      return "auth.erreurs.erreurReseau";
    default:
      return "auth.erreurs.generique";
  }
}

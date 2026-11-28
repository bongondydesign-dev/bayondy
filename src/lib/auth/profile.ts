export function getUserInitials(
  displayName?: string | null,
  email?: string | null
): string {
  const cleanedName = (displayName || "").trim();
  if (cleanedName) {
    const parts = cleanedName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return parts[0].charAt(0).toUpperCase();
  }

  const cleanedEmail = (email || "").trim();
  if (cleanedEmail) {
    return cleanedEmail.charAt(0).toUpperCase();
  }

  return "B";
}

export function getPrimaryAuthProviderLabel(providerIds: string[]): string {
  if (providerIds.includes("google.com")) {
    return "Google";
  }
  if (providerIds.includes("password")) {
    return "Email";
  }
  if (providerIds.length > 0 && providerIds[0]) {
    return providerIds[0];
  }
  return "Email";
}

export function formatProfileDate(dateInput?: string | null): string {
  if (!dateInput) return "—";
  const parsed = new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("fr-FR");
}

export function isDisplayNameDirty(
  draft: string | null,
  currentDisplayName?: string | null
): boolean {
  if (draft === null) return false;
  const trimmedDraft = draft.trim();
  if (!trimmedDraft) return false;
  const trimmedCurrent = (currentDisplayName || "").trim();
  return trimmedDraft !== trimmedCurrent;
}

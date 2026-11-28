import { formatLocaleDate } from "@/lib/courses/format";

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

import type { AppLang } from "@/lib/i18n/config";

export function formatProfileDate(
  dateInput?: string | null,
  lang: AppLang = "fr"
): string {
  return formatLocaleDate(dateInput, lang);
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

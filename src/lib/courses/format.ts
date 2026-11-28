/**
 * src/lib/courses/format.ts
 *
 * Utilitaires de formatage pour les cours (prix, durée, niveau, langue).
 * Aucun prix n'est inventé ou converti automatiquement.
 */

export interface FormattedPrice {
  hasPrice: boolean;
  formattedUSD: string | null;
  formattedHTG: string | null;
}

/**
 * Formate les prix d'un cours.
 * Si les deux prix sont absents/null/undefined/0, hasPrice vaut false.
 */
export function formatPrice(
  priceUSD: number | null | undefined,
  priceHTG: number | null | undefined,
  _lang: AppLang = "fr"
): FormattedPrice {
  void _lang;
  const hasUSD = typeof priceUSD === "number" && priceUSD > 0;
  const hasHTG = typeof priceHTG === "number" && priceHTG > 0;

  if (!hasUSD && !hasHTG) {
    return {
      hasPrice: false,
      formattedUSD: null,
      formattedHTG: null,
    };
  }

  const formattedHTG = hasHTG
    ? `${Math.round(priceHTG!)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} HTG`
    : null;

  return {
    hasPrice: true,
    formattedUSD: hasUSD ? `$${priceUSD} USD` : null,
    formattedHTG,
  };
}

/**
 * Formate la durée en minutes en texte lisible (ex: 2h 15m ou 45m).
 */
export function formatDuration(durationMinutes: number): string {
  if (!durationMinutes || durationMinutes <= 0) {
    return "";
  }
  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
}

import type { AppLang } from "@/lib/i18n/config";

export const PLATFORM_LOCALE = "fr-FR";

const KR_MONTHS_SHORT = [
  "Jan",
  "Fev",
  "Mas",
  "Avr",
  "Me",
  "Jen",
  "Jiy",
  "Out",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const KR_MONTHS_LONG = [
  "Janvye",
  "Fevriye",
  "Mas",
  "Avril",
  "Me",
  "Jen",
  "Jiyè",
  "Out",
  "Septanm",
  "Oktòb",
  "Novanm",
  "Desanm",
];

export function formatLocaleNumber(
  value: number,
  lang: AppLang = "fr"
): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value);
  if (lang === "kr") {
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  }
  return rounded.toLocaleString("fr-FR");
}

export function formatLocaleDate(
  dateInput: Date | string | null | undefined,
  optionsOrLang?: Intl.DateTimeFormatOptions | AppLang,
  maybeLang?: AppLang
): string {
  if (!dateInput) return "—";
  const parsed = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(parsed.getTime())) return "—";

  const lang: AppLang =
    typeof optionsOrLang === "string"
      ? optionsOrLang
      : maybeLang ?? "fr";
  const options =
    typeof optionsOrLang === "object" && optionsOrLang !== null
      ? optionsOrLang
      : undefined;

  if (lang === "kr") {
    const day = parsed.getDate();
    const monthIndex = parsed.getMonth();
    const year = parsed.getFullYear();

    if (!options) {
      const dd = String(day).padStart(2, "0");
      const mm = String(monthIndex + 1).padStart(2, "0");
      return `${dd}/${mm}/${year}`;
    }

    const monthLabel =
      options.month === "long"
        ? KR_MONTHS_LONG[monthIndex]
        : options.month === "short"
        ? KR_MONTHS_SHORT[monthIndex]
        : String(monthIndex + 1).padStart(2, "0");

    const parts: string[] = [];
    if (options.day) parts.push(String(day));
    if (options.month) parts.push(monthLabel);
    if (options.year) parts.push(String(year));
    return parts.length > 0 ? parts.join(" ") : `${day} ${monthLabel} ${year}`;
  }

  return options
    ? parsed.toLocaleDateString("fr-FR", options)
    : parsed.toLocaleDateString("fr-FR");
}


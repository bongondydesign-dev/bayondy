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
  priceHTG: number | null | undefined
): FormattedPrice {
  const hasUSD = typeof priceUSD === "number" && priceUSD > 0;
  const hasHTG = typeof priceHTG === "number" && priceHTG > 0;

  if (!hasUSD && !hasHTG) {
    return {
      hasPrice: false,
      formattedUSD: null,
      formattedHTG: null,
    };
  }

  return {
    hasPrice: true,
    formattedUSD: hasUSD ? `${priceUSD} $ USD` : null,
    formattedHTG: hasHTG ? `${priceHTG.toLocaleString("fr-FR")} HTG` : null,
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

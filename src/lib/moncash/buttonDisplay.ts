export const MONCASH_BUTTON_IMAGE_SRC = "/assets/aistudio/rs_w_1280_e5a11620.webp";

export const MONCASH_BUTTON_GRADIENT =
  "linear-gradient(180deg, #e6002d 0%, #e1002a 13%, #d40126 31%, #c00520 50%, #a20716 70%, #7a0b0a 86%, #5f0f03 100%)";

/**
 * Recadrage exact de la pilule rouge MonCash (sans bordures blanches)
 * dans l'image source 1280x720 (boite [50..1230] x [172..548]).
 */
export const MONCASH_IMAGE_CROP_STYLE = {
  position: "absolute",
  width: "108.475%",
  height: "191.489%",
  left: "-4.237%",
  top: "-45.745%",
} as const;

export const MONCASH_MARK_SIZES = {
  sm: { width: 94, height: 30, className: "w-[94px] h-[30px]" },
  md: { width: 132, height: 42, className: "w-[132px] h-[42px]" },
  lg: { width: 169, height: 54, className: "w-[169px] h-[54px]" },
} as const;

export type MonCashMarkSize = keyof typeof MONCASH_MARK_SIZES;

/**
 * Formate un montant HTG positif pour l'affichage sur le bouton MonCash.
 * Retourne null si le montant est invalide ou non positif.
 */
export function formatMonCashAmountHTG(
  amountHTG: number | null | undefined
): string | null {
  if (typeof amountHTG !== "number" || !Number.isFinite(amountHTG)) {
    return null;
  }
  const rounded = Math.round(amountHTG);
  if (rounded <= 0) {
    return null;
  }
  // Espace insecable/normal uniforme pour eviter les ecarts entre runtimes Intl
  const formattedDigits = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formattedDigits} HTG`;
}

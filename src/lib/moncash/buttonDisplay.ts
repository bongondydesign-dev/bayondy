export const MONCASH_BUTTON_IMAGE_SRC = "/assets/aistudio/rs_w_1280_e5a11620.webp";

export const MONCASH_BUTTON_GRADIENT =
  "linear-gradient(180deg, #e6002c 0%, #e3002a 10%, #db0129 23%, #cd0224 40%, #c00520 50%, #a50516 66%, #85090e 82%, #690d05 94%, #5c0e02 100%)";

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

/**
 * Fondu horizontal doux aux extrémités gauche/droite pour supprimer toute couture
 * entre la pilule recadrée et le dégradé du bouton pleine largeur.
 */
export const MONCASH_SEAMLESS_MASK_STYLE = {
  maskImage:
    "linear-gradient(90deg, transparent 0%, #000 13%, #000 94%, transparent 100%)",
  WebkitMaskImage:
    "linear-gradient(90deg, transparent 0%, #000 13%, #000 94%, transparent 100%)",
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

import React from "react";
import { t } from "@/lib/i18n";

interface TodoMarkProps {
  label?: string;
}

/**
 * Marqueur visuel pour les éléments [À DÉCIDER] afin qu'aucun point légal en suspens
 * ne soit oublié ou masqué avant le lancement officiel.
 */
export function TodoMark({ label }: TodoMarkProps) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 my-0.5 rounded-full text-xs font-mono font-medium bg-aurora/15 text-aurora border border-aurora/30 shadow-sm align-middle select-none">
      <span className="w-1.5 h-1.5 rounded-full bg-aurora animate-pulse" aria-hidden="true" />
      <span>{label || t("legal.aDecider")}</span>
    </span>
  );
}

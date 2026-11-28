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
    <span className="inline-flex items-center px-2.5 py-0.5 my-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-active)] text-brand-light border border-[var(--home-orange-vivid)]/40 align-middle select-none">
      <span>{label || t("legal.aDecider")}</span>
    </span>
  );
}

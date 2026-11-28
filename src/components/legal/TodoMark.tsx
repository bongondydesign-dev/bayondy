import React from "react";
import { t } from "@/lib/i18n";
import { AppLang, DEFAULT_APP_LANG } from "@/lib/i18n/config";

interface TodoMarkProps {
  label?: string;
  lang?: AppLang;
}

/**
 * Marqueur visuel pour les éléments [À DÉCIDER] afin qu'aucun point légal en suspens
 * ne soit oublié ou masqué avant le lancement officiel.
 */
export function TodoMark({ label, lang = DEFAULT_APP_LANG }: TodoMarkProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 my-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface-active)] text-brand-light border border-[var(--home-orange-vivid)]/40 align-middle select-none">
      <span>{label || t("legal.aDecider", lang)}</span>
    </span>
  );
}

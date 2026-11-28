import krMessages from "@/messages/kr.json";
import frMessages from "@/messages/fr.json";
import enMessages from "@/messages/en.json";

type Messages = Record<string, unknown>;

function getNestedValue(obj: Messages, path: string): string | undefined {
  if (typeof obj[path] === "string") {
    return obj[path] as string;
  }

  const segments = path.split(".");
  let current: unknown = obj;

  for (const segment of segments) {
    if (current && typeof current === "object" && segment in current) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return typeof current === "string" ? current : undefined;
}

import type { DictionaryLang } from "./config";

export function t(key: string, lang: DictionaryLang = "kr"): string {
  const dictionaryOrder: Messages[] =
    lang === "kr"
      ? [krMessages, frMessages]
      : lang === "fr"
      ? [frMessages, krMessages]
      : [enMessages, krMessages, frMessages];

  for (const dict of dictionaryOrder) {
    const value = getNestedValue(dict, key);
    if (value !== undefined) {
      return value;
    }
  }

  return key;
}

export default t;

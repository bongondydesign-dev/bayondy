// server-only — validation manuelle des entrées admin, sans bibliothèque externe.
import "server-only";

// Regex : slug valide (minuscules, chiffres, tirets, 2-80 chars)
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,78}[a-z0-9]$|^[a-z0-9]{1,2}$/;

// Regex : URL http(s)
const URL_RE = /^https?:\/\/.{1,2000}$/;

import { isValidCoverUrl } from "./cover";
import {
  parseLessonVideoInput,
  YOUTUBE_ID_RE,
  type VideoProvider,
} from "@/lib/video/lessonVideo";

export type CourseLevel = "debutant" | "intermediaire" | "avance";
export type CourseLanguage = "ht" | "fr" | "en";
export type CourseStatus = "draft" | "published";

const VALID_LEVELS: CourseLevel[] = ["debutant", "intermediaire", "avance"];
const VALID_LANGS: CourseLanguage[] = ["ht", "fr", "en"];
const VALID_STATUSES: CourseStatus[] = ["draft", "published"];

export interface ValidatedCourseFields {
  title?: string;
  shortDescription?: string;
  description?: string;
  level?: CourseLevel;
  language?: CourseLanguage;
  status?: CourseStatus;
  slug?: string;
  durationMinutes?: number;
  coverUrl?: string | null;
  priceUSD?: number | null;
  priceHTG?: number | null;
}

export interface ValidatedLessonFields {
  courseId?: string;
  moduleId?: string;
  moduleTitle?: string;
  title?: string;
  order?: number;
  youtubeVideoId?: string;
  videoProvider?: VideoProvider;
  videoId?: string;
  videoUrl?: string;
  needsShortResolve?: boolean;
  durationMinutes?: number;
  isFreePreview?: boolean;
  archived?: boolean;
  resources?: Array<{ label: string; url: string }>;
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (s.length === 0 || s.length > max) return null;
  return s;
}

function optionalDraftStr(v: unknown, max: number): { valid: boolean; value: string } {
  if (typeof v !== "string") return { valid: false, value: "" };
  const s = v.trim();
  if (s.length > max) return { valid: false, value: "" };
  return { valid: true, value: s };
}

/** Valide les champs d'une formation (liste blanche stricte). */
export function validateCourseInput(
  body: unknown,
  options?: { isCreate?: boolean }
): {
  data: ValidatedCourseFields;
  errors: string[];
} {
  const errors: string[] = [];
  const data: ValidatedCourseFields = {};
  const isCreate = options?.isCreate === true;

  if (typeof body !== "object" || body === null) {
    return { data, errors: ["Corps de requête invalide."] };
  }
  const b = body as Record<string, unknown>;

  if ("title" in b) {
    const v = str(b.title, 200);
    if (v === null) errors.push("title: chaîne requise, max 200 chars.");
    else data.title = v;
  }
  if ("shortDescription" in b) {
    if (isCreate) {
      const res = optionalDraftStr(b.shortDescription, 500);
      if (!res.valid) errors.push("shortDescription: max 500 chars.");
      else if (res.value) data.shortDescription = res.value;
    } else {
      const res = optionalDraftStr(b.shortDescription, 500);
      if (!res.valid) errors.push("shortDescription: max 500 chars.");
      else data.shortDescription = res.value;
    }
  }
  if ("description" in b) {
    if (isCreate) {
      const res = optionalDraftStr(b.description, 5000);
      if (!res.valid) errors.push("description: max 5000 chars.");
      else if (res.value) data.description = res.value;
    } else {
      const res = optionalDraftStr(b.description, 5000);
      if (!res.valid) errors.push("description: max 5000 chars.");
      else data.description = res.value;
    }
  }
  if ("level" in b) {
    if (!VALID_LEVELS.includes(b.level as CourseLevel))
      errors.push(`level: doit être l'un de ${VALID_LEVELS.join(", ")}.`);
    else data.level = b.level as CourseLevel;
  }
  if ("language" in b) {
    if (!VALID_LANGS.includes(b.language as CourseLanguage))
      errors.push(`language: doit être l'un de ${VALID_LANGS.join(", ")}.`);
    else data.language = b.language as CourseLanguage;
  }
  if ("status" in b) {
    if (!VALID_STATUSES.includes(b.status as CourseStatus))
      errors.push(`status: doit être "draft" ou "published".`);
    else data.status = b.status as CourseStatus;
  }
  if ("slug" in b) {
    if (isCreate && typeof b.slug === "string" && b.slug.trim() === "") {
      // Slug vide autorisé à la création : généré côté serveur depuis le titre
    } else {
      const v = str(b.slug, 80);
      if (v === null || !SLUG_RE.test(v))
        errors.push("slug: minuscules, chiffres, tirets, 2-80 chars.");
      else data.slug = v;
    }
  }
  if ("durationMinutes" in b) {
    if (!isPositiveInt(b.durationMinutes) || (b.durationMinutes as number) > 10000)
      errors.push("durationMinutes: entier >= 0 et <= 10000.");
    else data.durationMinutes = b.durationMinutes as number;
  }
  if ("coverUrl" in b) {
    if (b.coverUrl === null) {
      data.coverUrl = null;
    } else {
      const v = str(b.coverUrl, 2000);
      if (v === null || !isValidCoverUrl(v)) {
        errors.push("coverUrl: URL ou image de couverture valide requise.");
      } else {
        data.coverUrl = v;
      }
    }
  }
  if ("priceUSD" in b) {
    if (b.priceUSD === null) {
      data.priceUSD = null;
    } else if (typeof b.priceUSD !== "number" || b.priceUSD < 0 || b.priceUSD > 100000) {
      errors.push("priceUSD: nombre >= 0 et <= 100000, ou null.");
    } else {
      data.priceUSD = b.priceUSD;
    }
  }
  if ("priceHTG" in b) {
    if (b.priceHTG === null) {
      data.priceHTG = null;
    } else if (typeof b.priceHTG !== "number" || b.priceHTG < 0 || b.priceHTG > 10000000) {
      errors.push("priceHTG: nombre >= 0 et <= 10000000, ou null.");
    } else {
      data.priceHTG = b.priceHTG;
    }
  }

  return { data, errors };
}

/** Valide les champs d'une leçon (liste blanche stricte). */
export function validateLessonInput(body: unknown): {
  data: ValidatedLessonFields;
  errors: string[];
} {
  const errors: string[] = [];
  const data: ValidatedLessonFields = {};

  if (typeof body !== "object" || body === null) {
    return { data, errors: ["Corps de requête invalide."] };
  }
  const b = body as Record<string, unknown>;

  if ("courseId" in b) {
    const v = str(b.courseId, 128);
    if (v === null) errors.push("courseId: chaîne requise, max 128 chars.");
    else data.courseId = v;
  }
  if ("moduleId" in b && typeof b.moduleId === "string" && b.moduleId.trim() !== "") {
    const v = str(b.moduleId, 128);
    if (v === null) errors.push("moduleId: chaîne requise, max 128 chars.");
    else data.moduleId = v;
  }
  if ("moduleTitle" in b) {
    const v = str(b.moduleTitle, 200);
    if (v === null) errors.push("moduleTitle: chaîne requise, max 200 chars.");
    else data.moduleTitle = v;
  }
  if ("title" in b) {
    const v = str(b.title, 300);
    if (v === null) errors.push("title: chaîne requise, max 300 chars.");
    else data.title = v;
  }
  if ("order" in b) {
    if (!isPositiveInt(b.order) || (b.order as number) > 9999)
      errors.push("order: entier >= 0 et <= 9999.");
    else data.order = b.order as number;
  }

  const hasVideoField =
    "videoSource" in b || "videoUrl" in b || "youtubeVideoId" in b;
  if (hasVideoField) {
    const rawCandidate =
      typeof b.videoSource === "string" && b.videoSource.trim()
        ? b.videoSource
        : typeof b.videoUrl === "string" && b.videoUrl.trim()
        ? b.videoUrl
        : typeof b.youtubeVideoId === "string" && b.youtubeVideoId.trim()
        ? b.youtubeVideoId
        : "";

    const parsed = parseLessonVideoInput(rawCandidate);
    if (!parsed.ok) {
      errors.push(parsed.error);
    } else {
      data.videoProvider = parsed.provider;
      data.videoId = parsed.videoId;
      data.videoUrl = parsed.videoUrl;
      data.youtubeVideoId = parsed.youtubeVideoId;
      data.needsShortResolve = parsed.needsShortResolve;
    }
  }

  if ("durationMinutes" in b) {
    if (!isPositiveInt(b.durationMinutes) || (b.durationMinutes as number) > 10000)
      errors.push("durationMinutes: entier >= 0 et <= 10000.");
    else data.durationMinutes = b.durationMinutes as number;
  }
  if ("isFreePreview" in b) {
    if (typeof b.isFreePreview !== "boolean")
      errors.push("isFreePreview: booléen requis.");
    else data.isFreePreview = b.isFreePreview;
  }
  if ("archived" in b) {
    if (typeof b.archived !== "boolean") errors.push("archived: booléen requis.");
    else data.archived = b.archived;
  }
  if ("resources" in b) {
    if (!Array.isArray(b.resources)) {
      errors.push("resources: tableau requis.");
    } else if (b.resources.length > 20) {
      errors.push("resources: maximum 20 entrées.");
    } else {
      const resources: Array<{ label: string; url: string }> = [];
      for (const r of b.resources) {
        if (typeof r !== "object" || r === null) {
          errors.push("resources[]: objet { label, url } requis.");
          break;
        }
        const rr = r as Record<string, unknown>;
        const label = str(rr.label, 200);
        const url = str(rr.url, 2000);
        if (label === null) { errors.push("resources[].label: chaîne requise, max 200."); break; }
        if (url === null || !URL_RE.test(url)) { errors.push("resources[].url: URL http(s) valide requise."); break; }
        resources.push({ label, url });
      }
      if (errors.length === 0) data.resources = resources;
    }
  }

  return { data, errors };
}

/** Valide youtubeVideoId seul (utile en dehors du contexte leçon). */
export function isValidYoutubeId(id: unknown): id is string {
  return typeof id === "string" && YOUTUBE_ID_RE.test(id);
}

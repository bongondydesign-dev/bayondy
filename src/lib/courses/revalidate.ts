import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Invalide immédiatement le cache public du catalogue et des fiches formation
 * après toute création, publication, dépublication ou modification de cours/leçon.
 */
export function revalidateCoursesCache(
  slugs?: string | null | Array<string | null | undefined>
): void {
  revalidateTag("courses", { expire: 0 });
  revalidatePath("/formations");
  revalidatePath("/formations/[slug]", "page");

  const list = Array.isArray(slugs) ? slugs : slugs ? [slugs] : [];
  const seen = new Set<string>();

  for (const raw of list) {
    if (typeof raw !== "string") continue;
    const slug = raw.trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    revalidateTag(`course-${slug}`, { expire: 0 });
    revalidatePath(`/formations/${slug}`);
  }
}

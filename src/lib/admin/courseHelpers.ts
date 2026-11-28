export function slugifyCourseText(input: string, maxLength = 80): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned.slice(0, maxLength).replace(/-+$/g, "");
}

export function computeNextLessonOrder(
  lessons: ReadonlyArray<{ order: number }>
): number {
  if (lessons.length === 0) return 1;
  let maxOrder = 0;
  for (const lesson of lessons) {
    if (Number.isFinite(lesson.order) && lesson.order > maxOrder) {
      maxOrder = lesson.order;
    }
  }
  return Math.max(lessons.length + 1, maxOrder + 1);
}

export function computeOrderUpdatesForMove(
  lessons: ReadonlyArray<{ id: string; order: number }>,
  lessonId: string,
  direction: "up" | "down"
): Array<{ id: string; order: number }> {
  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx < 0) return [];
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= lessons.length) return [];

  const a = lessons[idx];
  const b = lessons[target];

  if (a.order !== b.order) {
    return [
      { id: a.id, order: b.order },
      { id: b.id, order: a.order },
    ];
  }

  // Normalize sequential 1-based orders when duplicate orders (e.g. 0 & 0) exist
  const reordered = [...lessons];
  reordered[idx] = b;
  reordered[target] = a;
  return reordered.map((item, position) => ({
    id: item.id,
    order: position + 1,
  }));
}

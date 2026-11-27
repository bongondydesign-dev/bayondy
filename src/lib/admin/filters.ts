export interface AdminCourseFilterable {
  id: string;
  slug: string;
  title: string;
  status: "draft" | "published";
}

export interface AdminStudentFilterable {
  uid: string;
  displayName: string;
  email: string;
  enrollments: Array<{ courseId: string; status: string }>;
}

export interface AdminPaymentFilterable {
  id: string;
  uid: string;
  courseId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  merchantReference: string;
}

export function filterAdminCourses<T extends AdminCourseFilterable>(
  courses: T[],
  search: string,
  statusFilter: "all" | "published" | "draft"
): T[] {
  const q = search.trim().toLowerCase();
  return courses.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (!q) return true;
    return c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
  });
}

export function filterAdminStudents<T extends AdminStudentFilterable>(
  students: T[],
  search: string,
  enrollmentFilter: "all" | "enrolled" | "unenrolled"
): T[] {
  const q = search.trim().toLowerCase();
  return students.filter((s) => {
    const hasActive = s.enrollments.some((e) => e.status === "active");
    if (enrollmentFilter === "enrolled" && !hasActive) return false;
    if (enrollmentFilter === "unenrolled" && hasActive) return false;
    if (!q) return true;
    return (
      s.displayName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q)
    );
  });
}

export function filterAdminPayments<T extends AdminPaymentFilterable>(
  payments: T[],
  search: string,
  statusFilter: "all" | "paid" | "pending" | "failed" | "refunded"
): T[] {
  const q = search.trim().toLowerCase();
  return payments.filter((p) => {
    if (statusFilter === "failed") {
      if (p.status !== "failed" && p.status !== "expired") return false;
    } else if (statusFilter === "pending") {
      if (p.status !== "pending" && p.status !== "awaiting_payment") return false;
    } else if (statusFilter !== "all" && p.status !== statusFilter) {
      return false;
    }
    if (!q) return true;
    return (
      p.courseId.toLowerCase().includes(q) ||
      p.merchantReference.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q)
    );
  });
}

export function computePaymentSummary(payments: AdminPaymentFilterable[]) {
  let paidCount = 0;
  let pendingCount = 0;
  let totalHTG = 0;
  let totalUSD = 0;

  for (const p of payments) {
    if (p.status === "paid") {
      paidCount++;
      if (p.currency === "HTG") totalHTG += Number(p.amount) || 0;
      if (p.currency === "USD") totalUSD += Number(p.amount) || 0;
    } else if (p.status === "pending" || p.status === "awaiting_payment") {
      pendingCount++;
    }
  }

  return {
    totalCount: payments.length,
    paidCount,
    pendingCount,
    totalHTG,
    totalUSD,
  };
}

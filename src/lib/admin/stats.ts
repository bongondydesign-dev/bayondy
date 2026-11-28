export interface RawAdminPaymentRecord {
  id: string;
  courseId: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  merchantReference: string;
  createdAtIso: string | null;
}

export interface MonthlyActivityPoint {
  monthKey: string;
  label: string;
  paidCount: number;
  otherCount: number;
  totalCount: number;
}

export interface RecentAdminPayment {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  merchantReference: string;
  createdAt: string | null;
}

export interface AdminPaymentOverview {
  paymentsByStatus: Record<string, number>;
  revenue: { HTG: number; USD: number };
  monthlyActivity: MonthlyActivityPoint[];
  recentPayments: RecentAdminPayment[];
}

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mas",
  "Avr",
  "Me",
  "Jen",
  "Jiy",
  "Out",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

function formatMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function buildLastSixMonthsBuckets(now: Date = new Date()): MonthlyActivityPoint[] {
  const buckets: MonthlyActivityPoint[] = [];
  const baseYear = now.getUTCFullYear();
  const baseMonth = now.getUTCMonth();

  for (let offset = 5; offset >= 0; offset--) {
    const d = new Date(Date.UTC(baseYear, baseMonth - offset, 1));
    buckets.push({
      monthKey: formatMonthKey(d),
      label: MONTH_LABELS[d.getUTCMonth()],
      paidCount: 0,
      otherCount: 0,
      totalCount: 0,
    });
  }

  return buckets;
}

export function buildAdminPaymentOverview(
  records: readonly RawAdminPaymentRecord[],
  now: Date = new Date()
): AdminPaymentOverview {
  const paymentsByStatus: Record<string, number> = {};
  let revenueHTG = 0;
  let revenueUSD = 0;

  const monthlyActivity = buildLastSixMonthsBuckets(now);
  const bucketMap = new Map<string, MonthlyActivityPoint>();
  for (const bucket of monthlyActivity) {
    bucketMap.set(bucket.monthKey, bucket);
  }

  for (const rec of records) {
    const status = rec.status || "unknown";
    paymentsByStatus[status] = (paymentsByStatus[status] ?? 0) + 1;

    if (status === "paid") {
      const amount = Number.isFinite(Number(rec.amount)) ? Number(rec.amount) : 0;
      if (rec.currency === "HTG") revenueHTG += amount;
      else if (rec.currency === "USD") revenueUSD += amount;
    }

    if (rec.createdAtIso) {
      const parsed = new Date(rec.createdAtIso);
      if (!Number.isNaN(parsed.getTime())) {
        const key = formatMonthKey(parsed);
        const bucket = bucketMap.get(key);
        if (bucket) {
          bucket.totalCount += 1;
          if (status === "paid") bucket.paidCount += 1;
          else bucket.otherCount += 1;
        }
      }
    }
  }

  const recentPayments: RecentAdminPayment[] = [...records]
    .sort((a, b) => {
      const ta = a.createdAtIso ? Date.parse(a.createdAtIso) : 0;
      const tb = b.createdAtIso ? Date.parse(b.createdAtIso) : 0;
      return (Number.isNaN(tb) ? 0 : tb) - (Number.isNaN(ta) ? 0 : ta);
    })
    .slice(0, 6)
    .map((rec) => ({
      id: rec.id,
      courseId: rec.courseId,
      courseTitle: rec.courseTitle?.trim() || rec.courseId,
      amount: Number(rec.amount) || 0,
      currency: rec.currency || "",
      method: rec.method || "",
      status: rec.status || "unknown",
      merchantReference: rec.merchantReference || "",
      createdAt: rec.createdAtIso,
    }));

  return {
    paymentsByStatus,
    revenue: { HTG: revenueHTG, USD: revenueUSD },
    monthlyActivity,
    recentPayments,
  };
}

export function filterRecentDashboardPayments<
  T extends Pick<RecentAdminPayment, "courseId" | "courseTitle" | "merchantReference" | "method" | "status">
>(payments: readonly T[], search: string): T[] {
  const q = search.trim().toLowerCase();
  if (!q) return [...payments];
  return payments.filter(
    (p) =>
      p.courseTitle.toLowerCase().includes(q) ||
      p.courseId.toLowerCase().includes(q) ||
      p.merchantReference.toLowerCase().includes(q) ||
      p.method.toLowerCase().includes(q) ||
      p.status.toLowerCase().includes(q)
  );
}

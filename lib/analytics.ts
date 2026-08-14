import { prisma } from "@/lib/prisma";
import { STAGE_ORDER, STAGE_SHORT_LABELS, SOURCE_TYPE_LABELS } from "@/lib/taxonomy";
import type { DealStatus, DealType, SourceType } from "@prisma/client";

export async function getDashboardData() {
  const deals = await prisma.deal.findMany({
    include: {
      source: true,
      primaryOwner: true,
      passReasonTags: { include: { tag: true } },
    },
    orderBy: { dateReceived: "asc" },
  });

  const activeLike: DealStatus[] = ["ACTIVE", "ON_HOLD"];

  const totalActive = deals.filter((d) => activeLike.includes(d.status));
  const totalExecuted = deals.filter((d) => d.status === "EXECUTED");
  const totalDead = deals.filter((d) => d.status === "DEAD");
  const decided = totalExecuted.length + totalDead.length;

  const sum = (arr: typeof deals, key: "enterpriseValue" | "revenue" | "ebitda") =>
    arr.reduce((acc, d) => acc + (d[key] ?? 0), 0);

  const summary = {
    activeCount: totalActive.length,
    activeEv: sum(totalActive, "enterpriseValue"),
    executedCount: totalExecuted.length,
    executedEv: sum(totalExecuted, "enterpriseValue"),
    deadCount: totalDead.length,
    deadEv: sum(totalDead, "enterpriseValue"),
    totalCount: deals.length,
    totalEv: sum(deals, "enterpriseValue"),
    winRate: decided > 0 ? totalExecuted.length / decided : null,
    avgEv:
      deals.filter((d) => d.enterpriseValue != null).length > 0
        ? sum(deals, "enterpriseValue") / deals.filter((d) => d.enterpriseValue != null).length
        : null,
  };

  // Stage funnel — in-flight deals only (active + on hold), classic pipeline view.
  const stageFunnel = STAGE_ORDER.map((stage) => {
    const inStage = deals.filter((d) => d.stage === stage && activeLike.includes(d.status));
    return {
      stage,
      label: STAGE_SHORT_LABELS[stage],
      count: inStage.length,
      ev: sum(inStage, "enterpriseValue"),
    };
  });

  // Status breakdown — all deals, all time.
  const statusOrder: DealStatus[] = ["ACTIVE", "ON_HOLD", "DEAD", "EXECUTED"];
  const statusBreakdown = statusOrder.map((status) => {
    const inStatus = deals.filter((d) => d.status === status);
    return { status, count: inStatus.length, ev: sum(inStatus, "enterpriseValue") };
  });

  // Monthly volume — trailing 12 months by dateReceived.
  const now = deals.length ? deals[deals.length - 1].dateReceived : new Date();
  const months: { key: string; label: string; count: number; ev: number }[] = [];
  const cursor = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  for (let i = 0; i < 12; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      key,
      label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      count: 0,
      ev: 0,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  for (const d of deals) {
    const key = `${d.dateReceived.getFullYear()}-${String(d.dateReceived.getMonth() + 1).padStart(2, "0")}`;
    const bucket = months.find((m) => m.key === key);
    if (bucket) {
      bucket.count += 1;
      bucket.ev += d.enterpriseValue ?? 0;
    }
  }

  // Source leaderboard — who sends us deals, and how good are they.
  const sourceMap = new Map<
    string,
    { name: string; type: SourceType; count: number; ev: number; executed: number; dead: number }
  >();
  for (const d of deals) {
    if (!d.source) continue;
    const key = d.source.id;
    const existing = sourceMap.get(key) ?? {
      name: d.source.name,
      type: d.source.type,
      count: 0,
      ev: 0,
      executed: 0,
      dead: 0,
    };
    existing.count += 1;
    existing.ev += d.enterpriseValue ?? 0;
    if (d.status === "EXECUTED") existing.executed += 1;
    if (d.status === "DEAD") existing.dead += 1;
    sourceMap.set(key, existing);
  }
  const sourceLeaderboard = [...sourceMap.values()].sort((a, b) => b.count - a.count);

  // Referral type breakdown (sponsor / IB / firm connection / proprietary).
  const referralTypeMap = new Map<string, number>();
  for (const d of deals) {
    const label = d.referralType ? SOURCE_TYPE_LABELS[d.referralType] : "Unknown";
    referralTypeMap.set(label, (referralTypeMap.get(label) ?? 0) + 1);
  }
  const referralTypeBreakdown = [...referralTypeMap.entries()].map(([label, count]) => ({
    label,
    count,
  }));

  // Industry breakdown.
  const industryMap = new Map<string, { count: number; ev: number }>();
  for (const d of deals) {
    const key = d.primaryIndustry ?? "Uncategorized";
    const existing = industryMap.get(key) ?? { count: 0, ev: 0 };
    existing.count += 1;
    existing.ev += d.enterpriseValue ?? 0;
    industryMap.set(key, existing);
  }
  const industryBreakdown = [...industryMap.entries()]
    .map(([industry, v]) => ({ industry, ...v }))
    .sort((a, b) => b.count - a.count);

  // Deal type breakdown.
  const typeMap = new Map<string, number>();
  for (const d of deals) {
    if (!d.type) continue;
    typeMap.set(d.type, (typeMap.get(d.type) ?? 0) + 1);
  }
  const dealTypeBreakdown = [...typeMap.entries()].map(([type, count]) => ({
    type: type as DealType,
    count,
  }));

  // Reasons for pass — tag frequency among dead deals.
  const tagMap = new Map<string, number>();
  for (const d of totalDead) {
    for (const t of d.passReasonTags) {
      tagMap.set(t.tag.label, (tagMap.get(t.tag.label) ?? 0) + 1);
    }
  }
  const passReasonBreakdown = [...tagMap.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  // Owner performance.
  const ownerMap = new Map<
    string,
    { name: string; count: number; ev: number; executed: number; dead: number }
  >();
  for (const d of deals) {
    if (!d.primaryOwner) continue;
    const key = d.primaryOwner.id;
    const existing = ownerMap.get(key) ?? {
      name: d.primaryOwner.name,
      count: 0,
      ev: 0,
      executed: 0,
      dead: 0,
    };
    existing.count += 1;
    existing.ev += d.enterpriseValue ?? 0;
    if (d.status === "EXECUTED") existing.executed += 1;
    if (d.status === "DEAD") existing.dead += 1;
    ownerMap.set(key, existing);
  }
  const ownerPerformance = [...ownerMap.values()].sort((a, b) => b.count - a.count);

  const recentDeals = [...deals].sort((a, b) => b.dateReceived.getTime() - a.dateReceived.getTime()).slice(0, 6);

  return {
    summary,
    stageFunnel,
    statusBreakdown,
    monthlyVolume: months,
    sourceLeaderboard,
    referralTypeBreakdown,
    industryBreakdown,
    dealTypeBreakdown,
    passReasonBreakdown,
    ownerPerformance,
    recentDeals,
  };
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>;

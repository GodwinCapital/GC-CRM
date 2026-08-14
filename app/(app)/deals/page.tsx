import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildDealWhere, type DealSearchParams } from "@/lib/deal-filters";
import { PageHeader, StageBadge, StatusBadge, TypeBadge, EmptyState, LinkButton } from "@/components/ui";
import { DealFilterBar } from "@/components/deal-filter-bar";
import { formatMoney, formatDate, dealDisplayName } from "@/lib/format";
import { Download } from "lucide-react";

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<DealSearchParams>;
}) {
  const params = await searchParams;
  const where = buildDealWhere(params);

  const [deals, owners, sources] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: { source: true, primaryOwner: true, secondaryOwner: true },
      orderBy: { dateReceived: "desc" },
    }),
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
  ]);

  const exportQuery = new URLSearchParams(
    Object.entries(params).filter(([, v]) => !!v) as [string, string][]
  ).toString();

  return (
    <div>
      <PageHeader
        title="Deals"
        description={`${deals.length} deal${deals.length === 1 ? "" : "s"} matching current filters`}
        actions={
          <>
            <LinkButton href={`/api/deals/export${exportQuery ? `?${exportQuery}` : ""}`} variant="secondary">
              <Download size={15} /> Export CSV
            </LinkButton>
            <LinkButton href="/deals/new">+ New Deal</LinkButton>
          </>
        }
      />

      <DealFilterBar owners={owners} sources={sources} />

      {deals.length === 0 ? (
        <EmptyState title="No deals match these filters" description="Try clearing filters or add a new deal." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Deal</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">EV</th>
                <th className="px-4 py-3 font-medium">Revenue</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Received</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((d) => (
                <tr key={d.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <Link href={`/deals/${d.id}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400">
                      {dealDisplayName(d)}
                    </Link>
                    {d.hq && <p className="text-xs text-slate-500">{d.hq}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <StageBadge stage={d.stage} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={d.type} />
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.source?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(d.enterpriseValue)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(d.revenue)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{d.primaryOwner?.initials ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(d.dateReceived)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

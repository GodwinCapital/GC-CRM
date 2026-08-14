import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, EmptyState, Card } from "@/components/ui";
import { SOURCE_TYPE_LABELS } from "@/lib/taxonomy";
import { formatMoney, formatPercent } from "@/lib/format";

export default async function SourcesPage() {
  const sources = await prisma.source.findMany({
    include: {
      deals: { select: { enterpriseValue: true, status: true } },
      _count: { select: { deals: true, contacts: true } },
    },
    orderBy: { name: "asc" },
  });

  const ranked = sources
    .map((s) => {
      const ev = s.deals.reduce((a, d) => a + (d.enterpriseValue ?? 0), 0);
      const executed = s.deals.filter((d) => d.status === "EXECUTED").length;
      const dead = s.deals.filter((d) => d.status === "DEAD").length;
      const decided = executed + dead;
      return { ...s, ev, executed, dead, winRate: decided > 0 ? executed / decided : null };
    })
    .sort((a, b) => b._count.deals - a._count.deals);

  return (
    <div>
      <PageHeader
        title="Sources"
        description="Sponsors, investment banks, and referral partners who send us deals."
        actions={<LinkButton href="/sources/new">+ New Source</LinkButton>}
      />

      {ranked.length === 0 ? (
        <EmptyState title="No sources yet" description="Add a source to start tracking referrals." />
      ) : (
        <Card className="!p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900/60">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Deals Sent</th>
                <th className="px-4 py-3 font-medium">Combined EV</th>
                <th className="px-4 py-3 font-medium">Executed</th>
                <th className="px-4 py-3 font-medium">Win Rate</th>
                <th className="px-4 py-3 font-medium">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((s) => (
                <tr key={s.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <Link href={`/sources/${s.id}`} className="font-medium text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400">
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{SOURCE_TYPE_LABELS[s.type]}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s._count.deals}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatMoney(s.ev)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s.executed}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatPercent(s.winRate)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{s._count.contacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

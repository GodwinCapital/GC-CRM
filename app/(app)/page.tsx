import Link from "next/link";
import { getDashboardData } from "@/lib/analytics";
import { Card, PageHeader, StatTile, StageBadge, StatusBadge } from "@/components/ui";
import {
  DealCountBarChart,
  StatusDonutChart,
  MonthlyVolumeChart,
  CategoryBarChart,
} from "@/components/charts";
import { formatMoney, formatPercent, formatDate, dealDisplayName } from "@/lib/format";
import { CHART_STATUS } from "@/lib/chart-colors";
import { SOURCE_TYPE_LABELS } from "@/lib/taxonomy";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { summary } = data;

  const statusColors: Record<string, string> = {
    ACTIVE: CHART_STATUS.good,
    ON_HOLD: CHART_STATUS.warning,
    DEAD: CHART_STATUS.critical,
    EXECUTED: "#3987e5",
  };

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Firm-wide pipeline, sourcing, and conversion analytics."
        actions={
          <Link
            href="/deals/new"
            className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400"
          >
            + New Deal
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile
          label="Active Pipeline"
          value={summary.activeCount}
          sub={`${formatMoney(summary.activeEv)} combined EV`}
        />
        <StatTile
          label="Executed Deals"
          value={summary.executedCount}
          sub={`${formatMoney(summary.executedEv)} combined EV`}
        />
        <StatTile
          label="Win Rate"
          value={formatPercent(summary.winRate)}
          sub="Executed vs. decided (executed + dead)"
        />
        <StatTile
          label="Avg. Enterprise Value"
          value={formatMoney(summary.avgEv)}
          sub={`${summary.totalCount} deals tracked all-time`}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Active Pipeline by Stage</h2>
          <p className="mb-2 text-xs text-slate-500">Deals currently Active or On Hold</p>
          <DealCountBarChart
            data={data.stageFunnel.map((s) => ({ label: s.label, count: s.count }))}
          />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Deal Status Mix</h2>
          <p className="mb-4 text-xs text-slate-500">All deals, all time</p>
          <StatusDonutChart
            data={data.statusBreakdown.map((s) => ({
              label: s.status.replace("_", " "),
              value: s.count,
              color: statusColors[s.status],
            }))}
          />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white">Deal Flow — Trailing 12 Months</h2>
          <p className="mb-2 text-xs text-slate-500">Enterprise value of deals received by month</p>
          <MonthlyVolumeChart data={data.monthlyVolume} />
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-white">Referral Type Mix</h2>
          <p className="mb-2 text-xs text-slate-500">How deals reach the firm</p>
          <CategoryBarChart
            data={data.referralTypeBreakdown.map((r) => ({ label: r.label, count: r.count }))}
          />
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Top Sources</h2>
            <Link href="/sources" className="text-xs font-medium text-emerald-400 hover:underline">
              View all →
            </Link>
          </div>
          <p className="mb-2 text-xs text-slate-500">Who sends us the most deals</p>
          <div className="space-y-3">
            {data.sourceLeaderboard.slice(0, 6).map((s) => (
              <div key={s.name} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium text-slate-200">{s.name}</p>
                  <p className="text-xs text-slate-500">{SOURCE_TYPE_LABELS[s.type]}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-200">
                    {s.count} deal{s.count === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-slate-500">{formatMoney(s.ev)} EV</p>
                </div>
              </div>
            ))}
            {data.sourceLeaderboard.length === 0 && (
              <p className="text-sm text-slate-500">No sourced deals yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-white">Reasons We&apos;ve Passed</h2>
          <p className="mb-2 text-xs text-slate-500">Tag frequency across dead deals</p>
          {data.passReasonBreakdown.length > 0 ? (
            <CategoryBarChart data={data.passReasonBreakdown} />
          ) : (
            <p className="text-sm text-slate-500">No passed deals tagged yet.</p>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-white">Industry Mix</h2>
          <p className="mb-2 text-xs text-slate-500">By primary industry</p>
          <CategoryBarChart
            data={data.industryBreakdown.map((i) => ({ label: i.industry, count: i.count }))}
          />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-white">Deal Team Performance</h2>
          <p className="mb-3 text-xs text-slate-500">By primary owner</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Owner</th>
                <th className="pb-2 font-medium">Deals</th>
                <th className="pb-2 font-medium">Executed</th>
                <th className="pb-2 font-medium">EV Sourced</th>
              </tr>
            </thead>
            <tbody>
              {data.ownerPerformance.map((o) => (
                <tr key={o.name} className="border-b border-slate-800/60">
                  <td className="py-2 text-slate-200">{o.name}</td>
                  <td className="py-2 text-slate-300">{o.count}</td>
                  <td className="py-2 text-slate-300">{o.executed}</td>
                  <td className="py-2 text-slate-300">{formatMoney(o.ev)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Recently Added Deals</h2>
          <Link href="/deals" className="text-xs font-medium text-emerald-400 hover:underline">
            View all deals →
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 font-medium">Deal</th>
              <th className="pb-2 font-medium">Stage</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium">EV</th>
              <th className="pb-2 font-medium">Received</th>
            </tr>
          </thead>
          <tbody>
            {data.recentDeals.map((d) => (
              <tr key={d.id} className="border-b border-slate-800/60">
                <td className="py-2">
                  <Link href={`/deals/${d.id}`} className="font-medium text-slate-200 hover:text-emerald-400">
                    {dealDisplayName(d)}
                  </Link>
                </td>
                <td className="py-2">
                  <StageBadge stage={d.stage} />
                </td>
                <td className="py-2">
                  <StatusBadge status={d.status} />
                </td>
                <td className="py-2 text-slate-300">{formatMoney(d.enterpriseValue)}</td>
                <td className="py-2 text-slate-400">{formatDate(d.dateReceived)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

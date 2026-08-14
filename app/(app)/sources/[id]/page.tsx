import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateSourceAction, deleteSourceAction } from "../actions";
import { SourceForm } from "@/components/source-form";
import { Card, PageHeader, Button, StageBadge, StatusBadge } from "@/components/ui";
import { dealDisplayName, formatMoney } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default async function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const source = await prisma.source.findUnique({
    where: { id },
    include: {
      deals: { orderBy: { dateReceived: "desc" } },
      contacts: { orderBy: { name: "asc" } },
    },
  });

  if (!source) notFound();

  const boundUpdate = updateSourceAction.bind(null, source.id);
  const boundDelete = deleteSourceAction.bind(null, source.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title={source.name}
        actions={
          <form action={boundDelete}>
            <Button type="submit" variant="danger">
              <Trash2 size={15} /> Delete
            </Button>
          </form>
        }
      />

      <Card>
        <SourceForm action={boundUpdate} initial={source} />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Deals Sent ({source.deals.length})</h2>
        {source.deals.length === 0 ? (
          <p className="text-sm text-slate-500">No deals from this source yet.</p>
        ) : (
          <div className="space-y-2">
            {source.deals.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">{dealDisplayName(d)}</span>
                <div className="flex items-center gap-2">
                  <StageBadge stage={d.stage} />
                  <StatusBadge status={d.status} />
                  <span className="text-sm text-slate-500 dark:text-slate-400">{formatMoney(d.enterpriseValue)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Contacts ({source.contacts.length})</h2>
        {source.contacts.length === 0 ? (
          <p className="text-sm text-slate-500">No contacts linked to this source yet.</p>
        ) : (
          <div className="space-y-2">
            {source.contacts.map((c) => (
              <Link
                key={c.id}
                href={`/contacts/${c.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900/40"
              >
                <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">{c.email ?? c.phone ?? ""}</span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { updateContactAction, deleteContactAction } from "../actions";
import { ContactForm } from "@/components/contact-form";
import { Card, PageHeader, Button, StageBadge, StatusBadge } from "@/components/ui";
import { dealDisplayName, formatMoney } from "@/lib/format";
import { Trash2 } from "lucide-react";

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [contact, sources] = await Promise.all([
    prisma.contact.findUnique({
      where: { id },
      include: { source: true, deals: { orderBy: { dateReceived: "desc" } } },
    }),
    prisma.source.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!contact) notFound();

  const boundUpdate = updateContactAction.bind(null, contact.id);
  const boundDelete = deleteContactAction.bind(null, contact.id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={contact.name}
        description={contact.source?.name}
        actions={
          <form action={boundDelete}>
            <Button type="submit" variant="danger">
              <Trash2 size={15} /> Delete
            </Button>
          </form>
        }
      />

      <Card className="mb-6">
        <ContactForm action={boundUpdate} initial={contact} sources={sources} />
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-semibold text-white">Deals ({contact.deals.length})</h2>
        {contact.deals.length === 0 ? (
          <p className="text-sm text-slate-500">No deals linked to this contact yet.</p>
        ) : (
          <div className="space-y-2">
            {contact.deals.map((d) => (
              <Link
                key={d.id}
                href={`/deals/${d.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-800 px-3 py-2 hover:bg-slate-900/40"
              >
                <span className="font-medium text-slate-200">{dealDisplayName(d)}</span>
                <div className="flex items-center gap-2">
                  <StageBadge stage={d.stage} />
                  <StatusBadge status={d.status} />
                  <span className="text-sm text-slate-400">{formatMoney(d.enterpriseValue)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { createDealAction } from "@/lib/deal-actions";
import { DealForm } from "@/components/deal-form";
import { Card, PageHeader } from "@/components/ui";

export default async function NewDealPage() {
  const [users, sources] = await Promise.all([
    prisma.user.findMany({ orderBy: { name: "asc" } }),
    prisma.source.findMany({ select: { name: true }, distinct: ["name"], orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="New Deal" description="Add a deal to the pipeline." />
      <Card>
        <DealForm
          action={createDealAction}
          users={users}
          sourceNames={sources.map((s) => s.name)}
          submitLabel="Create Deal"
        />
      </Card>
    </div>
  );
}

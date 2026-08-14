import { prisma } from "@/lib/prisma";
import { PageHeader, LinkButton, EmptyState } from "@/components/ui";
import { KanbanBoard } from "@/components/kanban-board";

export default async function PipelinePage() {
  const deals = await prisma.deal.findMany({
    where: { status: { in: ["ACTIVE", "ON_HOLD"] } },
    include: { primaryOwner: { select: { initials: true } } },
    orderBy: { dateReceived: "desc" },
  });

  return (
    <div>
      <PageHeader
        title="Pipeline"
        description="Drag deals between stages to update them. Showing Active and On Hold deals."
        actions={<LinkButton href="/deals/new">+ New Deal</LinkButton>}
      />
      {deals.length === 0 ? (
        <EmptyState title="No active deals" description="Add a deal to see it on the board." />
      ) : (
        <KanbanBoard deals={deals} />
      )}
    </div>
  );
}
